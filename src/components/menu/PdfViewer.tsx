// src/components/menu/PdfViewer.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface Props {
  /** URL pública del PDF en Supabase Storage */
  url: string;
  /** Versión de la carta: cache-buster REAL (solo cambia si el PDF cambió) */
  version: number;
}

export default function PdfViewer({ url, version }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<any>(null);
  const renderTaskRef = useRef<any>(null);

  // COLA DE RENDER: serializa los dibujos sobre el canvas.
  // Sin esto, dos llamadas concurrentes (StrictMode en dev monta los effects
  // dos veces; paginar rápido; un resize a mitad de carga) chocan con
  // "Cannot use the same canvas during multiple render() operations".
  // cancel() de pdf.js es ASÍNCRONO: pedir la cancelación no garantiza que
  // el task murió. La cola espera a que termine de verdad.
  const queueRef = useRef<Promise<void>>(Promise.resolve());

  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cache-busting por versión, NO por timestamp.
  // El sistema viejo usaba Date.now() y forzaba re-descarga en CADA visita,
  // castigando los datos móviles. Con ?v=version, el navegador cachea la carta
  // hasta que diseño sube un PDF nuevo (el trigger incrementa version).
  const src = `${url}${url.includes("?") ? "&" : "?"}v=${version}`;

  /** Dibujo real de una página. Nunca se llama directo: siempre vía la cola. */
  const doRender = useCallback(async (num: number) => {
    const pdfDoc = pdfDocRef.current;
    const canvas = canvasRef.current;
    const scroller = scrollRef.current;
    if (!pdfDoc || !canvas || !scroller) return;

    let page;
    try {
      page = await pdfDoc.getPage(num);
    } catch {
      return; // el documento se destruyó mientras tanto (cambio de carta)
    }

    // Escala: el PDF ocupa el ancho disponible del contenedor.
    const availableWidth = scroller.clientWidth;
    if (availableWidth === 0) return; // aún no montado, el ResizeObserver reintenta

    const unscaled = page.getViewport({ scale: 1 });
    const scale = availableWidth / unscaled.width;
    const viewport = page.getViewport({ scale });

    // devicePixelRatio: sin esto el canvas se ve borroso en móviles retina.
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(viewport.width * dpr);
    canvas.height = Math.floor(viewport.height * dpr);
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const task = page.render({
      canvasContext: ctx,
      viewport,
      transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
    });
    renderTaskRef.current = task;

    try {
      await task.promise;
      scroller.scrollTop = 0; // al cambiar de página, volver arriba
      // Precargar la siguiente en silencio (la mete en caché de pdf.js).
      if (num < pdfDoc.numPages) pdfDoc.getPage(num + 1);
    } catch (err: any) {
      // RenderingCancelledException es esperable al paginar rápido: no es error.
      if (err?.name !== "RenderingCancelledException") {
        console.error("[PdfViewer] render:", err);
      }
    } finally {
      if (renderTaskRef.current === task) renderTaskRef.current = null;
    }
  }, []);

  /** Encola un render. Cancela el actual para que la cola avance rápido. */
  const renderPage = useCallback(
    (num: number) => {
      if (renderTaskRef.current) {
        try { renderTaskRef.current.cancel(); } catch { /* noop */ }
      }
      queueRef.current = queueRef.current
        .catch(() => {})
        .then(() => doRender(num));
      return queueRef.current;
    },
    [doRender]
  );

  /**
   * Carga del documento. OJO: NO renderiza acá.
   * Antes lo hacía, y el effect de pageNum disparaba un SEGUNDO render de la
   * misma página en paralelo → el error del canvas compartido.
   * El render tiene una única puerta de entrada: el effect de abajo.
   */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      setPageNum(1);

      try {
        // Polyfill: Promise.withResolvers es ES2024 (Chrome 119+, Safari 17.4+).
        // pdf.js lo usa internamente y revienta en navegadores anteriores —
        // justo los de nuestra audiencia mayor con teléfonos de hace 3 años.
        if (typeof (Promise as any).withResolvers !== "function") {
          (Promise as any).withResolvers = function () {
            let resolve: any, reject: any;
            const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
            return { promise, resolve, reject };
          };
        }

        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const doc = await pdfjs.getDocument({
          url: src,
          // Descarga por rangos: la primera página aparece antes en 3G/4G lento.
          disableAutoFetch: true,
          disableStream: false,
        }).promise;

        if (cancelled) { return; }

        pdfDocRef.current = doc;
        setNumPages(doc.numPages);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error("[PdfViewer] load:", err);
        setError("No pudimos cargar la carta.");
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (renderTaskRef.current) {
        try { renderTaskRef.current.cancel(); } catch { /* noop */ }
      }
      const doc = pdfDocRef.current;
      pdfDocRef.current = null;
      // Esperar a que la cola drene antes de destruir: si destruís el doc con
      // un render a mitad de camino, pdf.js tira "Worker was destroyed".
      if (doc) {
        queueRef.current.catch(() => {}).then(() => {
          try { doc.destroy(); } catch { /* noop */ }
        });
      }
    };
  }, [src]);

  /** ÚNICA puerta de render: al terminar de cargar y al cambiar de página. */
  useEffect(() => {
    if (loading || error) return;
    renderPage(pageNum);
  }, [pageNum, loading, error, renderPage]);

  /** Re-render si cambia el ancho (rotación de pantalla, resize de ventana). */
  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    let timeout: ReturnType<typeof setTimeout>;
    const observer = new ResizeObserver(() => {
      clearTimeout(timeout);
      // Debounce: evita re-renderizar en cada píxel durante un resize.
      timeout = setTimeout(() => {
        if (pdfDocRef.current) renderPage(pageNum);
      }, 200);
    });

    observer.observe(scroller);
    return () => { observer.disconnect(); clearTimeout(timeout); };
  }, [pageNum, renderPage]);

  const prev = () => setPageNum((n) => Math.max(1, n - 1));
  const next = () => setPageNum((n) => Math.min(numPages, n + 1));

  return (
    <div className="flex flex-col">
      {/* CONTENEDOR DE ALTO FIJO: solo este sector scrollea.
          Los chips y los controles quedan siempre visibles. */}
      <div
        ref={scrollRef}
        className="relative w-full h-[70vh] md:h-[75vh] overflow-y-auto overflow-x-hidden bg-neutral-100 rounded-sm"
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="animate-spin text-neutral-400" size={28} />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
            <p className="text-neutral-600 text-sm">{error}</p>
          </div>
        )}

        <canvas ref={canvasRef} className="block mx-auto" />
      </div>

      {/* CONTROLES DE PÁGINA — fuera del área scrolleable, siempre accesibles */}
      {numPages > 1 && !error && (
        <div className="flex items-center justify-center gap-6 py-4">
          <button
            onClick={prev}
            disabled={pageNum <= 1}
            aria-label="Página anterior"
            className="p-2 rounded-full border border-[#D1CCC0] text-[#5C5852] hover:bg-[#F2EDE5] disabled:opacity-30 disabled:hover:bg-transparent transition"
          >
            <ChevronLeft size={22} />
          </button>

          <span className="text-xs uppercase tracking-widest text-[#5C5852] tabular-nums">
            {pageNum} / {numPages}
          </span>

          <button
            onClick={next}
            disabled={pageNum >= numPages}
            aria-label="Página siguiente"
            className="p-2 rounded-full border border-[#D1CCC0] text-[#5C5852] hover:bg-[#F2EDE5] disabled:opacity-30 disabled:hover:bg-transparent transition"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      )}
    </div>
  );
}