// src/lib/utils.ts

/**
 * Transforma una URL de Cloudinary original en una versión optimizada.
 * Centralizamos esto aquí para cambiar los tamaños en un solo lugar.
 */
export const getOptimizedImageUrl = (url: string, width = 600, height = 400) => {
  if (!url || typeof url !== 'string') return "";
  
  // Si la URL ya contiene transformaciones, evitamos re-transformarla
  if (url.includes('/upload/c_fill')) return url;

  // Insertamos las transformaciones de forma segura
  const transformation = `c_fill,w_${width},h_${height},g_face,q_auto,f_auto`;
  return url.replace('/upload/', `/upload/${transformation}/`);
};