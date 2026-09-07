"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { invitarAdmin, cambiarRol, revocarAcceso, borrarInvitado, denegarInvitado } from "@/actions/roles";
import { Clock, Trash2,ShieldCheck, Ban, UserPlus, User } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Button from "@/components/ui/Button";

interface Admin { user_id: string; email: string; role: "SUPERADMIN" | "CM" | "VISITOR"; }
interface Invitado { email: string; rol: "SUPERADMIN" | "CM"; estado: "pendiente" | "denegado"; created_at: string; }

export default function UsuariosClient({
  admins, invitados, miUserId,
}: { admins: Admin[]; invitados: Invitado[]; miUserId: string }) {
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState<"CM" | "SUPERADMIN">("CM");
  const [saving, setSaving] = useState(false);

  // Confirmación B2: tipear el email del afectado.
  const [confirm, setConfirm] = useState<{ open: boolean; texto: string; onOk: () => void } | null>(null);
  const pedirSudo = async () => {
    const supabase = createClient();
    const callback = process.env.NEXT_PUBLIC_ADMIN_CALLBACK_URL!;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${callback}?next=${encodeURIComponent("/reauth")}`,  // ← /reauth
        queryParams: { prompt: "consent" },
      },
    });
  };

  const correr = async (
    fn: () => Promise<{ success: boolean; error?: string }>,
    msgOk: string,
    pendiente?: { tipo: string; payload: Record<string, string> },
  ) => {
    setSaving(true);
    try {
      const res = await fn();
      if (res.success) toast.success(msgOk);
      else if (res.error === "REAUTH_REQUERIDA") {
        if (pendiente) sessionStorage.setItem("accion_pendiente", JSON.stringify(pendiente));
        toast.info("Confirmá tu identidad con Google…");
        await pedirSudo();
      } else toast.error(res.error || "No se pudo completar.");
    } catch (e) {
      console.error(e);
      toast.error("Error de conexión.");
    } finally {
      setSaving(false);
    }
  };

  const handleInvitar = () => {
    const fd = new FormData(); fd.set("email", email); fd.set("rol", rol);
    correr(() => invitarAdmin(fd), "Invitación enviada").then(() => setEmail(""));
  };

  const handleCambiar = (a: Admin, nuevoRol: string) => {
    const payload = { userId: a.user_id, rol: nuevoRol };
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => fd.set(k, v));
    correr(() => cambiarRol(fd), "Rol actualizado", { tipo: "cambiarRol", payload });
  };

  const handleRevocar = (a: Admin) => {
    setConfirm({
      open: true,
      texto: a.email,
      onOk: () => {
        const payload = { userId: a.user_id, email: a.email };
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => fd.set(k, v));
        correr(() => revocarAcceso(fd), "Acceso revocado", { tipo: "revocar", payload });
        setConfirm(null);
      },
    });
  };
    const handleBorrar = (email: string) => {
    const fd = new FormData(); fd.set("email", email);
    correr(() => borrarInvitado(fd), "Invitación borrada");
  };
  const handleDenegar = (email: string) => {
    const fd = new FormData(); fd.set("email", email);
    correr(() => denegarInvitado(fd), "Email bloqueado");
  };

    useEffect(() => {
    const pend = sessionStorage.getItem("accion_pendiente");
    if (!pend) return;
    sessionStorage.removeItem("accion_pendiente");
    const { tipo, payload } = JSON.parse(pend);
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => fd.set(k, v as string));
    if (tipo === "cambiarRol") correr(() => cambiarRol(fd), "Rol actualizado");
    if (tipo === "revocar") correr(() => revocarAcceso(fd), "Acceso revocado");
  }, []);

  return (
    <div className="space-y-8 max-w-3xl">
      <header>
        <h1 className="text-xl md:text-2xl font-bold text-white">Usuarios y roles</h1>
        <p className="text-sm text-neutral-400">Gestioná quién accede al panel.</p>
      </header>

      {/* INVITAR */}
      <section className="bg-neutral-900 border border-white/10 rounded-lg p-4 space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2"><UserPlus size={15} /> Invitar</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@gmail.com"
            className="flex-1 bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded text-sm outline-none focus:border-brand-red" />
          <select value={rol} onChange={(e) => setRol(e.target.value as "CM" | "SUPERADMIN")}
            className="bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded text-sm">
            <option value="CM">CM</option>
            <option value="SUPERADMIN">Superadmin</option>
          </select>
          <Button onClick={handleInvitar} disabled={saving || !email}>Invitar</Button>
        </div>
        <p className="text-xs text-neutral-500">Si el email ya se logueó, se le asigna el rol directo. Si no, queda pendiente hasta su primer ingreso.</p>
      </section>

      {/* ADMINS ACTUALES */}
      <section className="space-y-2">
        <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-400">Con acceso ({admins.length})</h2>
        {admins.map((a) => (
          <div key={a.user_id} className="flex items-center gap-3 bg-neutral-900 border border-white/10 rounded-lg p-3">
            <span className={`w-8 h-8 rounded-full grid place-items-center ${a.role === "SUPERADMIN" ? "bg-amber-500/15 text-amber-400" : "bg-white/5 text-neutral-400"}`}>
              {a.role === "SUPERADMIN" ? <ShieldCheck size={16} /> : <User size={16} />}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{a.email}{a.user_id === miUserId && <span className="text-neutral-500"> (vos)</span>}</p>
            </div>
            <select value={a.role} onChange={(e) => handleCambiar(a, e.target.value)} disabled={saving || a.user_id === miUserId}
              className="bg-neutral-950 border border-neutral-800 text-white p-1.5 rounded text-xs disabled:opacity-40">
              <option value="SUPERADMIN">Superadmin</option>
              <option value="CM">CM</option>
            </select>
            <button onClick={() => handleRevocar(a)} disabled={saving || a.user_id === miUserId}
              className="text-neutral-500 hover:text-red-400 disabled:opacity-30 p-1" aria-label="Revocar">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </section>

      {/* PENDIENTES */}
      {invitados.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2"><Clock size={14} /> Pendientes ({invitados.length})</h2>
          {invitados.map((i) => {
            const denegado = i.estado === "denegado";
            return (
              <div key={i.email} className={`flex items-center gap-3 rounded-lg p-3 border ${denegado ? "bg-red-950/20 border-red-900/40" : "bg-neutral-900/50 border-dashed border-white/10"}`}>
                <span className={`w-8 h-8 rounded-full grid place-items-center ${denegado ? "bg-red-500/15 text-red-400" : "bg-white/5 text-neutral-500"}`}>
                  {denegado ? <Ban size={15} /> : <Clock size={15} />}
                </span>
                <p className="flex-1 text-sm text-neutral-400 truncate">{i.email}</p>
                <span className="text-[10px] uppercase tracking-widest text-neutral-500">
                  {denegado ? "Bloqueado" : `${i.rol} · pendiente`}
                </span>
                {!denegado && (
                  <button onClick={() => handleDenegar(i.email)} disabled={saving}
                    className="text-neutral-500 hover:text-red-400 disabled:opacity-30 p-1" aria-label="Denegar" title="Bloquear este email">
                    <Ban size={15} />
                  </button>
                )}
                <button onClick={() => handleBorrar(i.email)} disabled={saving}
                  className="text-neutral-500 hover:text-white disabled:opacity-30 p-1" aria-label="Borrar" title="Sacar de la lista">
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })}
        </section>
      )}

      {/* CONFIRM B2 */}
      {confirm && (
        <ConfirmDialogEmail
          open={confirm.open}
          email={confirm.texto}
          onConfirm={confirm.onOk}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

// B2: exige tipear el email exacto antes de revocar. Fricción baja, intención clara.
function ConfirmDialogEmail({ open, email, onConfirm, onCancel }: { open: boolean; email: string; onConfirm: () => void; onCancel: () => void }) {
  const [txt, setTxt] = useState("");
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white">Revocar acceso</h3>
        <p className="text-sm text-neutral-400 mt-2">Escribí <span className="text-white font-mono">{email}</span> para confirmar. Baja a VISITOR y sale de la allowlist.</p>
        <input value={txt} onChange={(e) => setTxt(e.target.value)} autoFocus
          className="w-full mt-4 bg-neutral-900 border border-neutral-800 text-white p-2.5 rounded text-sm outline-none focus:border-red-500" />
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onCancel} className="text-sm text-neutral-400 hover:text-white">Cancelar</button>
          <button onClick={onConfirm} disabled={txt !== email}
            className="px-4 py-2 text-sm font-bold rounded bg-red-600 text-white disabled:opacity-40 disabled:cursor-not-allowed">
            Revocar
          </button>
        </div>
      </div>
    </div>
  );
}