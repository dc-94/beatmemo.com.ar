export interface Show {
  id: string;
  titulo: string;
  tipo: string;
  fecha: string;
  hora: string;
  url_imagen: string;
  es_gratuito: boolean;
  precio: number | null;
  ciclo_id: string | null;
}

export interface Ciclo {
  id: string;
  nombre: string;
  tipo: string;
}