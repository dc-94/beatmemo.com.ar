// src/lib/auth-roles.ts

/* Roles de usuario. */
export type UserRole = "SUPERADMIN" | "CM" | "VISITOR";

// Roles con permiso de escritura. VISITOR queda afuera (solo lectura).
export const ADMIN_ROLES = ["SUPERADMIN", "CM"] as const;

export function isAdminRole(role: string | null | undefined): boolean {
  return !!role && (ADMIN_ROLES as readonly string[]).includes(role);
}