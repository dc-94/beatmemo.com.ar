// src/lib/error-helpers.ts
// Traduce errores técnicos de Postgres/Supabase a lenguaje entendible.
// Determinístico: mismos códigos = misma explicación, siempre. Sin IA:
// los códigos SQLSTATE son un estándar fijo, no necesitan interpretación.

interface ErrorExplicado {
  titulo: string;
  causa: string;
  accion: string;
  severidad: "alta" | "media" | "baja";
}

// Códigos SQLSTATE de Postgres y patrones de mensaje conocidos.
const PATRONES: Array<{ match: RegExp; info: ErrorExplicado }> = [
    {
    match: /Could not find the table|schema cache|PGRST205/i,
    info: {
      titulo: "Se consultó una tabla que no existe",
      causa: "El código pidió una tabla con un nombre incorrecto, o la tabla fue renombrada/eliminada sin actualizar el código.",
      accion: "Revisar el nombre de la tabla en el código. El mensaje técnico suele sugerir el nombre correcto.",
      severidad: "alta",
    },
  },
  {
    match: /duplicate key value|23505/i,
    info: {
      titulo: "Se intentó cargar algo que ya existe",
      causa: "Un identificador que debe ser único (como el tipo de una carta) ya estaba en uso.",
      accion: "Usá un nombre o identificador distinto. Si el original fue borrado, puede seguir ocupando el lugar.",
      severidad: "baja",
    },
  },
  {
    match: /row-level security|42501/i,
    info: {
      titulo: "Permiso denegado por la base de datos",
      causa: "Se intentó escribir en una tabla sin los permisos configurados para ese usuario.",
      accion: "Revisar las políticas de seguridad (RLS) de esa tabla. Puede requerir intervención técnica.",
      severidad: "alta",
    },
  },
  {
    match: /violates foreign key|23503/i,
    info: {
      titulo: "Se referenció algo que no existe",
      causa: "Se intentó vincular un registro con otro que fue borrado o nunca existió (por ejemplo, un evento a un ciclo inexistente).",
      accion: "Verificar que el elemento vinculado exista antes de guardar.",
      severidad: "media",
    },
  },
  {
    match: /null value in column|23502/i,
    info: {
      titulo: "Falta un dato obligatorio",
      causa: "Se intentó guardar un registro sin completar un campo requerido.",
      accion: "Revisar el formulario: algún campo obligatorio llegó vacío.",
      severidad: "media",
    },
  },
  {
    match: /JWT|invalid token|not authenticated|401/i,
    info: {
      titulo: "Sesión vencida o inválida",
      causa: "La sesión del usuario expiró mientras usaba el panel.",
      accion: "Cerrar sesión y volver a entrar. Si se repite seguido, puede haber un problema de configuración.",
      severidad: "media",
    },
  },
  {
    match: /timeout|ETIMEDOUT|57014/i,
    info: {
      titulo: "La base de datos tardó demasiado",
      causa: "Una consulta superó el tiempo límite. Puede ser un pico de carga o una consulta pesada.",
      accion: "Si es aislado, ignorar. Si se repite, revisar índices o el estado de Supabase.",
      severidad: "alta",
    },
  },
  {
    match: /storage|bucket/i,
    info: {
      titulo: "Problema al guardar o leer un archivo",
      causa: "Falló una operación con el almacenamiento (PDF de cartas, imágenes).",
      accion: "Verificar que el archivo no exceda el tamaño máximo y que el formato sea válido.",
      severidad: "media",
    },
  },
  {
    match: /rate.?limit|demasiadas/i,
    info: {
      titulo: "Demasiadas operaciones seguidas",
      causa: "Un usuario superó el límite de acciones por minuto. Es una protección funcionando, no una falla.",
      accion: "Ninguna. Si pasa muy seguido con uso normal, el límite puede estar bajo.",
      severidad: "baja",
    },
  },
];

const DESCONOCIDO: ErrorExplicado = {
  titulo: "Error no clasificado",
  causa: "Este tipo de error no está catalogado. El mensaje técnico está abajo.",
  accion: "Si se repite, pasar el mensaje técnico a soporte técnico.",
  severidad: "media",
};

export function explicarError(mensaje: string): ErrorExplicado {
  for (const p of PATRONES) {
    if (p.match.test(mensaje)) return p.info;
  }
  return DESCONOCIDO;
}

// Extrae el origen del mensaje: "[PromoSection] ..." → "PromoSection"
export function origenError(mensaje: string): string {
  const m = mensaje.match(/^\[([^\]]+)\]/);
  return m ? m[1] : "Sistema";
}