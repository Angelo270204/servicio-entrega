import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Paquete, HistorialEnvio } from '../models/paquete.model';
import { Producto } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class PaqueteService {
  private paquetesSubject = new BehaviorSubject<Paquete[]>([]);
  private historialSubject = new BehaviorSubject<HistorialEnvio[]>([]);

  constructor() {
    this.cargarDatosLocales();
  }

  private cargarDatosLocales() {
    const paquetesGuardados = localStorage.getItem('paquetes');
    const historialGuardado = localStorage.getItem('historialEnvios');

    if (paquetesGuardados) {
      const paquetes = JSON.parse(paquetesGuardados).map((p: any) => ({
        ...p,
        fechaCreacion: new Date(p.fechaCreacion),
        fechaEstimadaEntrega: p.fechaEstimadaEntrega ? new Date(p.fechaEstimadaEntrega) : undefined
      }));
      this.paquetesSubject.next(paquetes);
    }

    if (historialGuardado) {
      const historial = JSON.parse(historialGuardado).map((h: any) => ({
        ...h,
        fechaEnvio: new Date(h.fechaEnvio),
        paquete: {
          ...h.paquete,
          fechaCreacion: new Date(h.paquete.fechaCreacion),
          fechaEstimadaEntrega: h.paquete.fechaEstimadaEntrega ? new Date(h.paquete.fechaEstimadaEntrega) : undefined
        },
        actualizaciones: h.actualizaciones.map((a: any) => ({
          ...a,
          fecha: new Date(a.fecha)
        }))
      }));
      this.historialSubject.next(historial);
    }
  }

  private guardarEnLocalStorage() {
    localStorage.setItem('paquetes', JSON.stringify(this.paquetesSubject.value));
    localStorage.setItem('historialEnvios', JSON.stringify(this.historialSubject.value));
  }

  validarProductosParaPaquete(productos: Producto[], tipoPaquete: 'small' | 'medium' | 'large'): {
    valido: boolean;
    errores: string[];
    sugerencias: string[];
  } {
    const errores: string[] = [];
    const sugerencias: string[] = [];

    const limites = {
      small: { maxProductos: 3, dimensionesPermitidas: ['small'] },
      medium: { maxProductos: 7, dimensionesPermitidas: ['small', 'medium'] },
      large: { maxProductos: 10, dimensionesPermitidas: ['small', 'medium', 'large'] }
    };

    const limite = limites[tipoPaquete];

    // Validar cantidad de productos
    if (productos.length > limite.maxProductos) {
      errores.push(`El paquete ${tipoPaquete} solo puede contener máximo ${limite.maxProductos} productos. Tienes ${productos.length} seleccionados.`);
    }

    // Validar dimensiones de productos
    const productosIncompatibles = productos.filter(p => !limite.dimensionesPermitidas.includes(p.dimension));
    if (productosIncompatibles.length > 0) {
      errores.push(`Los siguientes productos no son compatibles con el paquete ${tipoPaquete}: ${productosIncompatibles.map(p => p.nombre).join(', ')}`);
      
      // Sugerir tipo de paquete adecuado
      const dimensionMaxima = Math.max(...productos.map(p => {
        switch(p.dimension) {
          case 'small': return 1;
          case 'medium': return 2;
          case 'large': return 3;
          default: return 1;
        }
      }));

      const paqueteSugerido = dimensionMaxima === 3 ? 'large' : dimensionMaxima === 2 ? 'medium' : 'small';
      if (paqueteSugerido !== tipoPaquete) {
        sugerencias.push(`Te recomendamos usar un paquete ${paqueteSugerido} para estos productos.`);
      }
    }

    return {
      valido: errores.length === 0,
      errores,
      sugerencias
    };
  }

  crearPaquete(paquete: Omit<Paquete, 'id' | 'fechaCreacion' | 'estado' | 'precioTotal'>): Observable<Paquete> {
    const nuevoPaquete: Paquete = {
      ...paquete,
      id: this.generarId(),
      fechaCreacion: new Date(),
      estado: 'creado',
      precioTotal: paquete.productos.reduce((total, producto) => total + producto.precio, 0),
      fechaEstimadaEntrega: this.calcularFechaEstimadaEntrega()
    };
    const paquetes = [...this.paquetesSubject.value, nuevoPaquete];
    this.paquetesSubject.next(paquetes);
    this.guardarEnLocalStorage();
    return of(nuevoPaquete).pipe(delay(1000)); // Simula retardo de red
  }

  enviarPaquete(paqueteId: string, direccionEnvio: string): Observable<HistorialEnvio> {
    const paquetes = this.paquetesSubject.value;
    const paquete = paquetes.find(p => p.id === paqueteId);

    if (!paquete) {
      throw new Error('Paquete no encontrado');
    }

    // Actualizar estado del paquete
    paquete.estado = 'enviado';
    paquete.direccionEnvio = direccionEnvio;
    this.paquetesSubject.next(paquetes);

    // Crear registro en historial
    const nuevoEnvio: HistorialEnvio = {
      id: this.generarId(),
      paquete: { ...paquete },
      fechaEnvio: new Date(),
      numeroSeguimiento: this.generarNumeroSeguimiento(),
      estado: 'enviado',
      actualizaciones: [
        {
          fecha: new Date(),
          estado: 'enviado',
          descripcion: 'Paquete enviado desde el centro de distribución',
          ubicacion: 'Centro de Distribución Lima'
        }
      ]
    };

    const historialActual = this.historialSubject.value;
    historialActual.push(nuevoEnvio);
    this.historialSubject.next(historialActual);
    this.guardarEnLocalStorage();

    // Simular actualizaciones de seguimiento
    this.simularActualizacionesSeguimiento(nuevoEnvio.id);

    // Simula una respuesta de envío exitosa
    return of(nuevoEnvio).pipe(delay(1000));
  }

  private simularActualizacionesSeguimiento(envioId: string) {
    const actualizaciones = [
      { tiempo: 2000, estado: 'en_transito', descripcion: 'Paquete en tránsito', ubicacion: 'Terminal de Carga Lima' },
      { tiempo: 5000, estado: 'en_transito', descripcion: 'Paquete llegó a la ciudad de destino', ubicacion: 'Centro de Distribución Local' },
      { tiempo: 8000, estado: 'entregado', descripción: 'Paquete entregado exitosamente', ubicacion: 'Dirección de destino' }
    ];

    actualizaciones.forEach(actualizacion => {
      setTimeout(() => {
        this.agregarActualizacionSeguimiento(envioId, actualizacion);
      }, actualizacion.tiempo);
    });
  }

  private agregarActualizacionSeguimiento(envioId: string, actualizacion: any) {
    const historial = this.historialSubject.value;
    const envio = historial.find(h => h.id === envioId);

    if (envio) {
      envio.actualizaciones.push({
        fecha: new Date(),
        estado: actualizacion.estado,
        descripcion: actualizacion.descripcion,
        ubicacion: actualizacion.ubicacion
      });
      envio.estado = actualizacion.estado as any;

      // Actualizar también el paquete
      const paquetes = this.paquetesSubject.value;
      const paquete = paquetes.find(p => p.id === envio.paquete.id);
      if (paquete) {
        paquete.estado = actualizacion.estado;
        this.paquetesSubject.next(paquetes);
      }

      this.historialSubject.next(historial);
      this.guardarEnLocalStorage();
    }
  }

  obtenerPaquetes(): Observable<Paquete[]> {
    return this.paquetesSubject.asObservable();
  }

  obtenerHistorialEnvios(): Observable<HistorialEnvio[]> {
    return this.historialSubject.asObservable();
  }

  obtenerPaquetePorId(id: string): Observable<Paquete | undefined> {
    return new BehaviorSubject(this.paquetesSubject.value.find(p => p.id === id)).asObservable();
  }

  private generarId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private generarNumeroSeguimiento(): string {
    return 'PE' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
  }

  private calcularFechaEstimadaEntrega(): Date {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + Math.floor(Math.random() * 5) + 3);
    return fecha;
  }
}