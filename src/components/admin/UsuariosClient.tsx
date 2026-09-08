"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { invitarAdmin, cambiarRol, revocarAcceso, borrarInvitado, denegarInvitado } from "@/actions/roles";
import { Clock, Trash2, ShieldCheck, Ban, UserPlus, User } from "lucide-react";
import Button from "@/components/ui/Button";

interface Admin { user_id: string; email: string; role: "SUPERADMIN" | "CM" | "VISITOR"; }
interface Invitado { email: string; rol: "SUPERADMIN" | "CM"; estado: "pendiente" | "denegado"; created_at: string; }

interface ConfirmState {
  titulo: string;
  mensaje: string;
  palabra: string;      
  peligro?: boolean;
  onOk: () => void;
}

export default function UsuariosClient({
  admins, invitados, miUserId,
}: { admins: Admin[]; invitados: Invitado[]; miUserId: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState<"CM" | "SUPERADMIN">("CM");
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  const correr = async (fn: () => Promise<{ success: boolean; error?: string }>, msgOk: string) => {
    setSaving(true);
    try {
      const res = await fn();
      if (res.success) { toast.success(msgOk); router.refresh(); }
      else toast.error(res.error || "No se pudo completar.");
    } catch (e) {
      console.error(e);
      toast.error("Error de conexión.");
    } finally {
      setSaving(false);
    }
  };

  const handleInvitar = () => {
    if (!email) return;
    const mail = email;
    const enviar = () => {
      const fd = new FormData(); fd.set("email", mail); fd.set("rol", rol);
      correr(() => invitarAdmin(fd), "Invitación enviada");
      setEmail("");
      setConfirm(null);
    };
    // Invitar como SUPERADMIN escala privilegios → confirmación.
    if (rol === "SUPERADMIN") {
      setConfirm({
        titulo: "Invitar como superadmin",
        mensaje: `${mail} tendrá control total, incluida la gestión de usuarios.`,
        palabra: mail,
        peligro: true,
        onOk: enviar,
      });
    } else enviar();
  };

  const doCambiar = (userId: string, nuevoRol: string) => {
    const fd = new FormData(); fd.set("userId", userId); fd.set("rol", nuevoRol);
    correr(() => cambiarRol(fd), "Rol actualizado");
  };

  const handleCambiar = (a: Admin, nuevoRol: string) => {
    if (nuevoRol === "SUPERADMIN") {
      setConfirm({
        titulo: "Dar acceso total",
        mensaje: `${a.email} pasará a superadmin: control total, incluida la gestión de usuarios.`,
        palabra: a.email,
        peligro: true,
        onOk: () => { doCambiar(a.user_id, nuevoRol); setConfirm(null); },
      });
    } else {
      doCambiar(a.user_id, nuevoRol);
    }
  };

  const handleRevocar = (a: Admin) => {
    setConfirm({
      titulo: "Revocar acceso",
      mensaje: `${a.email} bajará a VISITOR y saldrá de la allowlist.`,
      palabra: a.email,
      peligro: true,
      onOk: () => {
        const fd = new FormData(); fd.set("userId", a.user_id); fd.set("email", a.email);
        correr(() => revocarAcceso(fd), "Acceso revocado");
        setConfirm(null);
      },
    });
  };

  const handleBorrar = (mail: string) => {
    const fd = new FormData(); fd.set("email", mail);
    correr(() => borrarInvitado(fd), "Invitación borrada");
  };

  const handleDenegar = (mail: string) => {
    const fd = new FormData(); fd.set("email", mail);
    correr(() => denegarInvitado(fd), "Email bloqueado");
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <header>
        <h1 className="text-xl md:text-2xl font-bold text-white">Usuarios y roles</h1>
        <p className="text-sm text-neutral-400">Gestioná quién accede al panel.</p>
      </header>

      {/* INVITAR */}
      <section className="bg-neutral-900 border border-white/10 rounded-lg p-4 space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
          <UserPlus size={15} /> Invitar
        </h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="email@gmail.com"
            className="flex-1 bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded text-sm outline-none focus:border-brand-red"
          />
          <select
            value={rol} onChange={(e) => setRol(e.target.value as "CM" | "SUPERADMIN")}
            className="bg-neutral-950 border border-neutral-800 text-white p-2.5 rounded text-sm"
          >
            <option value="CM">CM</option>
            <option value="SUPERADMIN">Superadmin</option>
          </select>
          <Button onClick={handleInvitar} disabled={saving || !email}>Invitar</Button>
        </div>
        <p className="text-xs text-neutral-500">
          Si el email ya se logueó, se le asigna el rol directo. Si no, queda pendiente hasta su primer ingreso.
        </p>
      </section>

      {/* CON ACCESO */}
      <section className="space-y-2">
        <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-400">Con acceso ({admins.length})</h2>
        {admins.map((a) => (
          <div key={a.user_id} className="flex items-center gap-3 bg-neutral-900 border border-white/10 rounded-lg p-3">
            <span className={`w-8 h-8 rounded-full grid place-items-center flex-none ${a.role === "SUPERADMIN" ? "bg-amber-500/15 text-amber-400" : "bg-white/5 text-neutral-400"}`}>
              {a.role === "SUPERADMIN" ? <ShieldCheck size={16} /> : <User size={16} />}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">
                {a.email}{a.user_id === miUserId && <span className="text-neutral-500"> (vos)</span>}
              </p>
            </div>
            <select
              value={a.role}
              onChange={(e) => handleCambiar(a, e.target.value)}
              disabled={saving || a.user_id === miUserId}
              className="bg-neutral-950 border border-neutral-800 text-white p-1.5 rounded text-xs disabled:opacity-40"
            >
              <option value="SUPERADMIN">Superadmin</option>
              <option value="CM">CM</option>
            </select>
            <button
              onClick={() => handleRevocar(a)}
              disabled={saving || a.user_id === miUserId}
              className="text-neutral-500 hover:text-red-400 disabled:opacity-30 p-1"
              aria-label="Revocar acceso"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </section>

      {/* PENDIENTES */}
      {invitados.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
            <Clock size={14} /> Pendientes ({invitados.length})
          </h2>
          {invitados.map((i) => {
            const denegado = i.estado === "denegado";
            return (
              <div key={i.email} className={`flex items-center gap-3 rounded-lg p-3 border ${denegado ? "bg-red-950/20 border-red-900/40" : "bg-neutral-900/50 border-dashed border-white/10"}`}>
                <span className={`w-8 h-8 rounded-full grid place-items-center flex-none ${denegado ? "bg-red-500/15 text-red-400" : "bg-white/5 text-neutral-500"}`}>
                  {denegado ? <Ban size={15} /> : <Clock size={15} />}
                </span>
                <p className="flex-1 text-sm text-neutral-400 truncate">{i.email}</p>
                <span className="text-[10px] uppercase tracking-widest text-neutral-500 flex-none">
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

      {confirm && (
        <ConfirmText
          titulo={confirm.titulo}
          mensaje={confirm.mensaje}
          palabra={confirm.palabra}
          peligro={confirm.peligro}
          onConfirm={confirm.onOk}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

// Confirmación por tipeo: reemplaza la re-autenticación OAuth.
// Frena el clic accidental sin sacar al usuario de la página.
function ConfirmText({
  titulo, mensaje, palabra, peligro = false, onConfirm, onCancel,
}: {
  titulo: string; mensaje: string; palabra: string; peligro?: boolean;
  onConfirm: () => void; onCancel: () => void;
}) {
  const [txt, setTxt] = useState("");
  const ok = txt.trim().toLowerCase() === palabra.trim().toLowerCase();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div role="alertdialog" aria-modal="true" className="relative w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white">{titulo}</h3>
        <p className="text-sm text-neutral-400 mt-2 leading-relaxed">{mensaje}</p>
        <p className="text-sm text-neutral-400 mt-3">
          Escribí <span className="text-white font-mono break-all">{palabra}</span> para confirmar.
        </p>
        <input
          value={txt}
          onChange={(e) => setTxt(e.target.value)}
          autoFocus
          onKeyDown={(e) => { if (e.key === "Enter" && ok) onConfirm(); }}
          className="w-full mt-3 bg-neutral-900 border border-neutral-800 text-white p-2.5 rounded text-sm outline-none focus:border-red-500"
        />
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-neutral-300 hover:text-white transition-colors">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={!ok}
            className={`px-4 py-2 text-sm font-bold rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${peligro ? "bg-red-600 hover:bg-red-500 text-white" : "bg-white text-black hover:bg-neutral-200"}`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}