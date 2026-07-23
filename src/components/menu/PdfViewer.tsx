// src/components/menu/PdfViewer.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, RotateCw, MessageCircle } from "lucide-react";
import { whatsappLink, WA_MESSAGES } from "@/lib/config";

interface Props {
  /** URL pública del PDF en Supabase Storage */
  url: string;
  /** Versión de la carta: cache-buster REAL (solo cambia si el PDF cambió) */
  version: number;
}

// Si en 20s no cargó, algo anda mal. Un cliente sentado en la mesa no espera
// más que eso mirando un spinner mudo: se rinde y llama al mozo.
const TIMEOUT_MS = 20000;

export default function PdfViewer({ url, version }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<any>(null);
  const renderTaskRef = useRef<any>(null);
  const queueRef = useRef<Promise<void>>(Promise.resolve());

  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0); // 0-100
  const [retryKey, setRetryKey] = useState(0); // cambia → re-dispara la carga

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
      return; // el documento se destruyó mientras tanto
    }

    const availableWidth = scroller.clientWidth;
    if (availableWidth === 0) return;

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
      // Móvil: el contenedor scrollea internamente → reset de su scroll.
      // Desktop: no hay scroll interno (h-auto) → subimos la ventana entera.
      if (scroller.scrollHeight > scroller.clientHeight + 1) {
        scroller.scrollTop = 0;
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      if (num < pdfDoc.numPages) pdfDoc.getPage(num + 1);
    } catch (err: any) {
      if (err?.name !== "RenderingCancelledException") {
        console.error("[PdfViewer] render:", err);
      }
    } finally {
      if (renderTaskRef.current === task) renderTaskRef.current = null;
    }
  }, []);

  /** Encola un render. La cola serializa: sin esto, dos renders pisan el canvas. */
  const renderPage = useCallback(
    (num: number) => {
      if (renderTaskRef.current) {
        try { renderTaskRef.current.cancel(); } catch { /* noop */ }
      }
      queueRef.current = queueRef.current.catch(() => {}).then(() => doRender(num));
      return queueRef.current;
    },
    [doRender]
  );

  /** Carga del documento. NO renderiza acá: el render tiene una sola puerta. */
  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;
    let loadingTask: any = null;

    (async () => {
      setLoading(true);
      setError(null);
      setProgress(0);
      setPageNum(1);

      try {
        // Polyfill: Promise.withResolvers es ES2024 (Chrome 119+, Safari 17.4+).
        // pdf.js lo usa internamente y revienta en navegadores anteriores.
        if (typeof (Promise as any).withResolvers !== "function") {
          (Promise as any).withResolvers = function () {
            let resolve: any, reject: any;
            const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
            return { promise, resolve, reject };
          };
        }

        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        loadingTask = pdfjs.getDocument({ url: src });

        // Progreso real de descarga. Un "45%" le dice al cliente que algo pasa;
        // un spinner mudo lo deja sin saber si esperar o rendirse.
        loadingTask.onProgress = ({ loaded, total }: { loaded: number; total: number }) => {
          if (total > 0 && !cancelled) {
            setProgress(Math.min(100, Math.round((loaded / total) * 100)));
          }
        };

        // Red del bar + PDF de 6MB = puede colgarse. Nos rendimos con dignidad.
        timeoutId = setTimeout(() => {
          if (cancelled) return;
          try { loadingTask?.destroy(); } catch { /* noop */ }
          setError("La carta está tardando demasiado.");
          setLoading(false);
        }, TIMEOUT_MS);

        const doc = await loadingTask.promise;
        clearTimeout(timeoutId);
        if (cancelled) return;

        pdfDocRef.current = doc;
        setNumPages(doc.numPages);
        setLoading(false);
      } catch (err) {
        clearTimeout(timeoutId!);
        if (cancelled) return;
        console.error("[PdfViewer] load:", err);
        setError("No pudimos cargar la carta.");
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId!);
      try { loadingTask?.destroy(); } catch { /* noop */ }
      if (renderTaskRef.current) {
        try { renderTaskRef.current.cancel(); } catch { /* noop */ }
      }
      const doc = pdfDocRef.current;
      pdfDocRef.current = null;
      if (doc) {
        // Esperar a que la cola drene antes de destruir: evita
        // "Worker was destroyed" si hay un render a mitad de camino.
        queueRef.current.catch(() => {}).then(() => {
          try { doc.destroy(); } catch { /* noop */ }
        });
      }
    };
  }, [src, retryKey]);

  /** ÚNICA puerta de render: al terminar de cargar y al cambiar de página. */
  useEffect(() => {
    if (loading || error) return;
    renderPage(pageNum);
  }, [pageNum, loading, error, renderPage]);

  /** Re-render si cambia el ancho (rotación de pantalla, resize). */
  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    let timeout: ReturnType<typeof setTimeout>;
    const observer = new ResizeObserver(() => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (pdfDocRef.current) renderPage(pageNum);
      }, 200);
    });
    observer.observe(scroller);
    return () => { observer.disconnect(); clearTimeout(timeout); };
  }, [pageNum, renderPage]);

  const prev = () => setPageNum((n) => Math.max(1, n - 1));
  const next = () => setPageNum((n) => Math.min(numPages, n + 1));
  const retry = () => setRetryKey((k) => k + 1);

  return (
    <div className="flex flex-col">
      <div
        ref={scrollRef}
        className="relative w-full h-[70vh] overflow-y-auto overflow-x-hidden md:h-auto md:min-h-[50vh] md:overflow-visible bg-neutral-100 rounded-sm"
      >
        {/* CARGANDO — con progreso real, no un spinner mudo */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8">
            <div className="w-40 h-[3px] bg-[#D1CCC0] overflow-hidden rounded-full">
              <div
                className="h-full bg-[#A68966] transition-[width] duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] uppercase tracking-widest text-[#5C5852] tabular-nums">
              {progress > 0 ? `Cargando ${progress}%` : "Cargando la carta"}
            </span>
          </div>
        )}

        {/* ERROR — honesto y con salida real. Nunca un spinner eterno. */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-8 text-center">
            <div className="space-y-2">
              <p className="font-serif text-lg text-[#2C2924]">{error}</p>
              <p className="text-[#5C5852] text-xs max-w-xs">
                Puede ser la conexión. Probá de nuevo o pedinos la carta por WhatsApp.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={retry}
                className="flex items-center justify-center gap-2 bg-[#2C2924] text-[#FAF7F2] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-[#4A453D] transition-colors"
              >
                <RotateCw size={13} /> Reintentar
              </button>
              <a href={whatsappLink(WA_MESSAGES.cartaNoCarga)}      
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 border border-[#A68966] text-[#A68966] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-[#A68966] hover:text-white transition-colors"
              >
                <MessageCircle size={13} /> Pedirla por WhatsApp
              </a>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="block mx-auto" />
      </div>

      {/* CONTROLES — fuera del área scrolleable, siempre accesibles */}
      {numPages > 1 && !error && !loading && (
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