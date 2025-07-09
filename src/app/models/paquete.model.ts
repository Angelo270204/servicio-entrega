import { Producto } from './producto.model';

export interface Paquete {
  id: string;
  tipo: 'small' | 'medium' | 'large';
  productos: Producto[];
  personalizacion: {
    color: string;
    evento: string;
    eventoPersonalizado?: string;
    mensaje?: string;
  };
  fechaCreacion: Date;
  estado: 'creado' | 'enviado' | 'en_transito' | 'entregado';
  precioTotal: number;
  direccionEnvio?: string;
  fechaEstimadaEntrega?: Date;
}

export interface HistorialEnvio {
  id: string;
  paquete: Paquete;
  fechaEnvio: Date;
  numeroSeguimiento: string;
  estado: 'enviado' | 'en_transito' | 'entregado';
  direccionEnvio: string; 
  actualizaciones: {
    fecha: Date;
    estado: string;
    descripcion: string;
    ubicacion?: string;
  }[];
}