"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/utils";
import { whatsappLink, WA_MESSAGES } from "@/lib/config";
import {
  Play, Pause, SkipBack, SkipForward, ChevronDown, ListMusic, Music, Ticket,
} from "lucide-react";

interface Track {
  id: string;
  titulo: string;
  descripcion: string;
  imagen_url: string;
  audio_url: string;
  orden: number;
}
interface Visita { label: string; detalle: string; href: string; }

function fmt(s: number): string {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function AudioguiaPlayer({
  tracks, visitas, whatsappLink: waNum,
}: {
  tracks: Track[];
  visitas: Visita[];
  whatsappLink: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [cur, setCur] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [fullOpen, setFullOpen] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const [durations, setDurations] = useState<Record<string, number>>({});
  const [deepPrimed, setDeepPrimed] = useState(false); // QR: Play cebado hasta el 1er toque
  const wantPlay = useRef(false);                        // el efecto [cur] decide si reproduce

  const track = tracks[cur];

  // Precarga las duraciones de todos los tracks (metadata) para mostrarlas en la cola.
  useEffect(() => {
    tracks.forEach((t) => {
      if (!t.audio_url || durations[t.id]) return;
      const a = new Audio();
      a.preload = "metadata";
      a.src = t.audio_url;
      a.addEventListener("loadedmetadata", () => {
        setDurations((d) => ({ ...d, [t.id]: a.duration }));
      }, { once: true });
    });
  }, [tracks, durations]);

  // ── FIX MÓVIL: barra de URL de Safari/Chrome tapando el reproductor ──
  // El viewport VISIBLE (visualViewport) es más chico que el de layout cuando
  // la barra del browser está visible. Publicamos dos CSS vars en :root:
  //   --ag-bottom: cuántos px del layout quedan tapados abajo por la barra.
  //   --ag-vh:     alto real visible en px.
  // El sheet se posiciona con esas vars → sus controles NUNCA quedan bajo la barra.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const root = document.documentElement;
    const apply = () => {
      const bottomInset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      root.style.setProperty("--ag-bottom", `${bottomInset}px`);
      root.style.setProperty("--ag-vh", `${Math.round(vv.height)}px`);
    };
    apply();
    vv.addEventListener("resize", apply);
    vv.addEventListener("scroll", apply);
    window.addEventListener("orientationchange", apply);
    return () => {
      vv.removeEventListener("resize", apply);
      vv.removeEventListener("scroll", apply);
      window.removeEventListener("orientationchange", apply);
      root.style.removeProperty("--ag-bottom");
      root.style.removeProperty("--ag-vh");
    };
  }, []);

  // Bloquea el scroll del fondo cuando el player o la cola están abiertos.
  useEffect(() => {
    const abierto = fullOpen || queueOpen;
    document.body.style.overflow = abierto ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [fullOpen, queueOpen]);

  // Cambiar de track: marca la intención de reproducir; el efecto [cur] carga y suena.
  const select = useCallback((i: number, autoplay = true) => {
    wantPlay.current = autoplay;
    setCur(i);
    setFullOpen(true);
    setQueueOpen(false);
    setTime(0);
  }, []);

  // Fuente única de carga del <audio>: cuando cambia el track, setea src y
  // reproduce SOLO si se pidió (wantPlay). Evita dobles load() que cortan el audio.
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !track) return;
    a.src = track.audio_url;
    a.load();
    if (wantPlay.current) {
      wantPlay.current = false;
      setCargando(true);
      a.play()
        .then(() => { setPlaying(true); setCargando(false); })
        .catch(() => { setPlaying(false); setCargando(false); });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur]);

  // ── DEEP-LINK POR QR (?t=<id>) ──
  // Se lee en el CLIENTE para no romper el ISR de la página. Usa el id (uuid),
  // estable ante reordenamientos. Intenta autoplay best-effort: si el browser
  // lo bloquea (iOS siempre), queda el Play grande cebado (1 toque).
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("t");
    if (!id) return;
    const i = tracks.findIndex((t) => t.id === id);
    if (i < 0) return;                 // QR viejo/inválido → arranca normal, sin auto-abrir
    setDeepPrimed(true);
    if (i === cur) {
      // Track 0: setCur no cambia → el efecto [cur] no se dispara, arrancamos acá.
      setFullOpen(true);
      const a = audioRef.current;
      if (a) {
        a.src = tracks[i].audio_url;
        a.load();
        a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      }
    } else {
      select(i);                       // dispara el efecto [cur] → carga + autoplay
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apaga el "cebado" del Play apenas empieza a sonar.
  useEffect(() => { if (playing) setDeepPrimed(false); }, [playing]);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) { a.play().then(() => setPlaying(true)).catch(() => setPlaying(false)); }
    else { a.pause(); setPlaying(false); }
  };

  const next = () => { if (cur < tracks.length - 1) select(cur + 1); };
  const prev = () => { if (cur > 0) select(cur - 1); };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    if (!a || !dur) return;
    const rect = e.currentTarget.getBoundingClientRect();
    a.currentTime = ((e.clientX - rect.left) / rect.width) * dur;
  };

  return (
    <div className="min-h-screen bg-brand-black-100 text-brand-white-100 relative overflow-x-hidden">
      {/* audio real, oculto */}
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
        onEnded={next}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* ══ TIMELINE ══ */}
      <div className="max-w-xl mx-auto px-4 pb-40">
        <header className="pt-8 pb-4 flex items-start justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand-gold">Museo Beatmemo</span>
            <h1 className="font-serif font-bold text-2xl mt-1 leading-tight">La historia, año por año</h1>
            <p className="text-xs text-brand-white-300 mt-1">{tracks.length} momentos · a tu ritmo</p>
          </div>
          {/* Visitas — datos de museo_visitas */}
          <div className="shrink-0 flex flex-col gap-1.5 items-end">
            {visitas.map((v) => (
              <a key={v.label} href={v.href} target={v.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-brand-gold/10 border border-brand-gold/40 rounded-full pl-2 pr-3 py-1.5">
                <Ticket size={14} className="text-brand-gold shrink-0" />
                <span className="text-right leading-tight">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-gold">{v.label}</span>
                  {v.detalle && <span className="block text-[9px] text-brand-white-300">{v.detalle}</span>}
                </span>
              </a>
            ))}
          </div>
        </header>

        <div className="relative pl-1">
          <div className="absolute left-[1.15rem] top-2 bottom-2 w-0.5 bg-gradient-to-b from-transparent via-brand-gold to-transparent opacity-60" />
          {tracks.map((t, i) => {
            const active = i === cur;
            return (
              <button key={t.id} onClick={() => select(i)} className="relative w-full text-left pl-11 pb-4 group block">
                <span className={`absolute left-2 top-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition z-10
                  ${active ? "bg-brand-red-100 border-brand-red-100 shadow-[0_0_0_4px_rgba(196,30,52,.2)]" : "bg-brand-black-200 border-brand-gold group-hover:bg-brand-gold"}`}>
                  {active
                    ? (playing ? <Pause size={9} className="fill-white text-white" /> : <Play size={9} className="fill-white text-white" />)
                    : <Play size={9} className="fill-brand-gold text-brand-gold group-hover:fill-brand-black-100" />}
                </span>
                <div className={`rounded-lg overflow-hidden border transition ${active ? "border-brand-red-100" : "border-brand-black-300 group-hover:border-brand-gold/40"} bg-brand-black-200`}>
                  <div className="relative h-24 bg-brand-black-300">
                    {t.imagen_url && (
                      <Image src={getOptimizedImageUrl(t.imagen_url, 500, 200)} alt={t.titulo} fill className="object-cover" sizes="100vw" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-black-200 via-transparent to-transparent" />
                    <span className="absolute bottom-2 left-3 font-sans font-bold text-lg tracking-tight" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                      {t.titulo.split(" - ")[0]}
                    </span>
                  </div>
                  <div className="px-3 py-2.5 flex items-center justify-between gap-2">
                    <h3 className="font-serif font-bold text-sm leading-tight">{t.titulo.split(" - ").slice(1).join(" - ") || t.titulo}</h3>
                    <span className={`text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${active ? "text-brand-red-100" : "text-brand-gold"}`}>
                      {active && playing ? "♪ Sonando" : "▶"}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <a href={process.env.NEXT_PUBLIC_SITE_URL || "https://beatmemo.com.ar"}
          className="mt-8 flex items-center justify-center gap-2 text-brand-gold font-sans font-bold uppercase tracking-[0.2em] text-xs border-b-2 border-brand-gold/40 pb-2 mx-auto w-fit hover:border-brand-gold transition-colors">
          Descubrí Beatmemo →
        </a>
      </div>

      {/* ══ MINI PLAYER ══ */}
      {!fullOpen && (
        <button onClick={() => setFullOpen(true)}
          className="fixed left-3 right-3 max-w-xl mx-auto bg-brand-black-300/95 backdrop-blur border border-brand-black-300 rounded-2xl p-2.5 flex items-center gap-3 shadow-2xl z-20"
          style={{ bottom: "calc(var(--ag-bottom, 0px) + 0.75rem)" }}>
          <div className="w-11 h-11 rounded-lg bg-brand-black-200 bg-cover bg-center flex-none flex items-center justify-center" style={track.imagen_url ? { backgroundImage: `url(${getOptimizedImageUrl(track.imagen_url, 100, 100)})` } : undefined}>
            {!track.imagen_url && <Music size={16} className="text-neutral-600" />}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <span className="block text-[10px] uppercase tracking-widest text-brand-gold">{playing ? "Reproduciendo" : "En pausa"}</span>
            <span className="block font-serif font-bold text-sm truncate">{track.titulo}</span>
          </div>
          <span onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="w-10 h-10 rounded-full bg-brand-red-100 flex items-center justify-center flex-none">
            {playing ? <Pause size={18} className="fill-white text-white" /> : <Play size={18} className="fill-white text-white" />}
          </span>
        </button>
      )}

      {/* ══ SCRIM ══ */}
      {fullOpen && <div className="fixed inset-0 bg-black/55 z-30" onClick={() => setFullOpen(false)} />}

      {/* ══ FULL PLAYER ══ (ancho limitado en desktop, alto anclado al viewport visible) */}
{/* ══ FULL PLAYER ══ (header sobre la foto, ancho limitado en desktop, alto 90% del viewport visible) */}
<div className={`fixed left-0 right-0 max-w-xl mx-auto z-40 bg-brand-black-200 border-t border-brand-black-300 rounded-t-3xl flex flex-col overflow-hidden transition-transform duration-[420ms] ${fullOpen ? "translate-y-0" : "translate-y-full"}`}
  style={{
    bottom: "var(--ag-bottom, 0px)",
    height: "min(90dvh, calc(var(--ag-vh, 100dvh) * 0.90))",
    transitionTimingFunction: "cubic-bezier(.22,1,.36,1)",
  }}>
  {track.imagen_url && (
    <div className="absolute inset-0 bg-cover bg-center opacity-[.13] blur-3xl" style={{ backgroundImage: `url(${getOptimizedImageUrl(track.imagen_url, 400, 400)})` }} />
  )}
  <div className="relative z-10 flex flex-col h-full">
    {/* Imagen 16:10 con el HEADER superpuesto arriba */}
    <div className="relative w-full aspect-[16/10] bg-brand-black-300 flex-none">
      {track.imagen_url ? (
        <Image src={getOptimizedImageUrl(track.imagen_url, 640, 400)} alt={track.titulo} fill className="object-cover" sizes="(min-width: 640px) 576px, 100vw" />
      ) : (
        <div className="w-full h-full flex items-center justify-center"><Music size={48} className="text-neutral-600" /></div>
      )}
      {/* gradiente superior (legibilidad header) + inferior (año) */}
      <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-black-200 via-transparent to-transparent pointer-events-none" />
      {/* HEADER sobre la foto */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 pt-4">
        <span className="text-[11px] uppercase tracking-[0.2em] text-brand-gold font-bold" style={{ textShadow: "0 1px 8px rgba(0,0,0,.9)" }}>
          Audioguía · {cur + 1}/{tracks.length}
        </span>
        <button onClick={() => setFullOpen(false)} className="w-11 h-11 rounded-full bg-black/45 backdrop-blur border border-white/15 flex items-center justify-center text-white" aria-label="Minimizar">
          <ChevronDown size={22} />
        </button>
      </div>
      {/* Año */}
      <span className="absolute bottom-3 left-4 font-bold text-4xl text-white" style={{ fontFamily: "var(--font-barlow-condensed)", textShadow: "0 2px 16px rgba(0,0,0,.9)" }}>
        {track.titulo.split(" - ")[0]}
      </span>
    </div>

    {/* Título */}
    <div className="px-5 pt-3 pb-1 flex-none">
      <span className="text-[11px] uppercase tracking-[0.2em] text-brand-gold font-bold">El recorrido</span>
      <h2 className="font-serif font-bold text-lg leading-tight mt-1">{track.titulo.split(" - ").slice(1).join(" - ") || track.titulo}</h2>
    </div>

    {/* descripción con scroll dorado */}
    <div className="flex-1 min-h-0 overflow-y-auto px-5 py-2 mx-1" style={{ scrollbarWidth: "thin", scrollbarColor: "#C5A059 transparent" }}>
      {track.descripcion.split("\n").filter(Boolean).map((line, i) => (
        <p key={i} className={`font-serif text-[1rem] leading-relaxed mb-3 ${i === 0 ? "text-brand-white-100" : "text-brand-white-100/80"}`}>{line}</p>
      ))}
    </div>

    {/* controles */}
    <div className="px-5 pt-2 flex-none bg-gradient-to-t from-brand-black-200 to-transparent" style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}>
      <div className="h-1 bg-brand-black-300 rounded-full overflow-hidden cursor-pointer mb-1" onClick={seek}>
        <div className="h-full bg-brand-red-100" style={{ width: `${dur ? (time / dur) * 100 : 0}%` }} />
      </div>
      <div className="flex justify-between text-[11px] text-brand-white-300 mb-3">
        <span>{fmt(time)}</span><span>{fmt(dur)}</span>
      </div>
      <div className="flex items-center justify-between">
        <button onClick={() => setQueueOpen(true)} className="w-11 flex justify-center text-brand-white-300" aria-label="Lista"><ListMusic size={22} /></button>
        <div className="flex items-center gap-8">
          <button onClick={prev} disabled={cur === 0} className="disabled:opacity-30"><SkipBack size={26} className="fill-white text-white" /></button>
          <button onClick={togglePlay}
            className={`w-16 h-16 rounded-full bg-brand-red-100 flex items-center justify-center shadow-lg transition ${deepPrimed && !playing ? "ring-4 ring-brand-red-100/40 motion-safe:animate-pulse" : ""}`}
            aria-label={playing ? "Pausar" : "Reproducir"}>
            {cargando ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : playing ? <Pause size={26} className="fill-white text-white" /> : <Play size={26} className="fill-white text-white ml-1" />}
          </button>
          <button onClick={next} disabled={cur === tracks.length - 1} className="disabled:opacity-30"><SkipForward size={26} className="fill-white text-white" /></button>
        </div>
        <span className="w-11" />
      </div>
    </div>
  </div>
</div>

      {/* ══ COLA ══ */}
      {queueOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setQueueOpen(false)} />}
      <div className={`fixed left-0 right-0 max-w-xl mx-auto z-50 bg-brand-black-200 border-t border-brand-black-300 rounded-t-3xl flex flex-col overflow-hidden transition-transform duration-[380ms] ${queueOpen ? "translate-y-0" : "translate-y-full"}`}
        style={{
          bottom: "var(--ag-bottom, 0px)",
          height: "min(88dvh, calc(var(--ag-vh, 100dvh) * 0.88))",
          transitionTimingFunction: "cubic-bezier(.22,1,.36,1)",
        }}>
        <div className="w-9 h-1 bg-brand-black-300 rounded-full mx-auto mt-3 mb-1 flex-none" />
        <div className="flex items-center justify-between px-5 py-2 flex-none">
          <h3 className="font-serif font-bold text-lg">A continuación</h3>
          <button onClick={() => setQueueOpen(false)} className="text-brand-gold text-xs font-bold uppercase tracking-widest">Cerrar</button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-3"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#C5A059 transparent", paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}>
          {tracks.map((t, i) => (
            <button key={t.id} onClick={() => select(i)} className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition ${i === cur ? "bg-brand-red-100/12" : "hover:bg-white/5"}`}>
              <span className={`w-6 text-center font-bold text-lg ${i === cur ? "text-brand-red-100" : "text-brand-gold"}`} style={{ fontFamily: "var(--font-barlow-condensed)" }}>{String(i + 1).padStart(2, "0")}</span>
              <div className="w-11 h-11 rounded-md bg-brand-black-300 bg-cover bg-center flex-none" style={t.imagen_url ? { backgroundImage: `url(${getOptimizedImageUrl(t.imagen_url, 100, 100)})` } : undefined} />
              <div className="flex-1 min-w-0">
                <span className="block text-[10px] uppercase tracking-widest text-brand-gold font-bold">{t.titulo.split(" - ")[0]}</span>
                <span className="block font-serif font-bold text-sm truncate">{t.titulo.split(" - ").slice(1).join(" - ") || t.titulo}</span>
              </div>
              <span className="text-xs text-brand-white-300">{durations[t.id] ? fmt(durations[t.id]) : "—"}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}