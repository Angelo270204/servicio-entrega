export interface Producto {
  id: string; 
  nombre: string;
  imagenUrl: string;
  precio: number;
  categoria?: string;
  dimension: 'small' | 'medium' | 'large';
}
