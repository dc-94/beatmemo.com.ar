"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowUp, ArrowDown, Plus, Pencil, Music, Save } from "lucide-react";
import { reorderAudioguia } from "@/actions/audioguia";
import AudioguiaDrawer from "./AudioguiaDrawer";
import Button from "@/components/ui/Button";

export default function AudioguiaClient({ tracks: initial }: { tracks: any[] }) {
  const router = useRouter();
  const [tracks, setTracks] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= tracks.length) return;
    const next = [...tracks];
    [next[i], next[j]] = [next[j], next[i]];
    setTracks(next);
    setDirty(true);
  };

  const guardarOrden = async () => {
    setSaving(true);
    const payload = tracks.map((t, i) => ({ id: t.id, orden: i + 1 }));
    const res = await reorderAudioguia(payload);
    if (res.success) { toast.success("Orden guardado"); setDirty(false); router.refresh(); }
    else toast.error(res.error || "No se pudo guardar el orden");
    setSaving(false);
  };

  const openNew = () => { setEditing(null); setDrawerOpen(true); };
  const openEdit = (t: any) => { setEditing(t); setDrawerOpen(true); };
  
  useEffect(() => {
    if (!dirty) setTracks(initial);
  }, [initial, dirty]);
  
  return (
    <div className="space-y-5 max-w-3xl">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Audioguía del museo</h1>
          <p className="text-sm text-neutral-400">{tracks.length} pistas · reordená con las flechas</p>
        </div>
        <div className="flex gap-2">
          {dirty && <Button variant="secondary" onClick={guardarOrden} disabled={saving}><Save size={16} /> Guardar orden</Button>}
          <Button onClick={openNew}><Plus size={18} /> Nueva pista</Button>
        </div>
      </header>

      <div className="space-y-2">
        {tracks.map((t, i) => (
          <div key={t.id} className="flex items-center gap-3 bg-neutral-900 border border-white/10 rounded-lg p-2.5">
            <div className="flex flex-col">
              <button onClick={() => move(i, -1)} disabled={i === 0} className="text-neutral-500 hover:text-white disabled:opacity-20 p-0.5"><ArrowUp size={15} /></button>
              <button onClick={() => move(i, 1)} disabled={i === tracks.length - 1} className="text-neutral-500 hover:text-white disabled:opacity-20 p-0.5"><ArrowDown size={15} /></button>
            </div>
            <span className="w-6 text-center text-gold font-mono text-sm text-brand-gold">{i + 1}</span>
            <div className="w-12 h-12 rounded bg-neutral-800 bg-cover bg-center flex-none flex items-center justify-center"
              style={t.imagen_url ? { backgroundImage: `url(${t.imagen_url})` } : undefined}>
              {!t.imagen_url && <Music size={16} className="text-neutral-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{t.titulo}</p>
              <p className="text-xs text-neutral-500 flex items-center gap-2">
                {t.audio_url ? <span className="text-green-500">♪ audio ok</span> : <span className="text-amber-500">sin audio</span>}
                {!t.activo && <span className="text-neutral-600">· oculta</span>}
              </p>
            </div>
            <button onClick={() => openEdit(t)} className="text-neutral-400 hover:text-white p-2"><Pencil size={16} /></button>
          </div>
        ))}
      </div>

      <AudioguiaDrawer
        key={editing?.id ?? "new"}
        isOpen={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditing(null); }}
        trackToEdit={editing}
        nextOrden={tracks.length + 1}
      />
    </div>
  );
}