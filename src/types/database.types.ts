export interface Show {
  id: string;
  banda: string;
  ciclo: string;
  fecha_hora: string;
  precio: number;
  url_imagen: string;
  categoria?: string;   
  descripcion?: string; 
  integrantes?: string;      
  valor_espectaculo?: number;
}