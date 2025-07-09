import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { PaqueteService } from '../../services/paquete.service';
import { HistorialEnvio } from '../../models/paquete.model';
import { Observable, BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-historial-envios',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule], 
  templateUrl: './historial-envios.html',
  styleUrls: ['./historial-envios.scss']
})
export class HistorialEnviosComponent implements OnInit {
  private paqueteService = inject(PaqueteService);

  selectedEnvio: HistorialEnvio | null = null;
  sortBy: 'todos'|'fecha' | 'productos' | 'precio' | 'dimension' = 'fecha';
  sortDirection: 'asc' | 'desc' = 'desc';
  private enviosSubject = new BehaviorSubject<HistorialEnvio[]>([]);
  historialEnvios$ = this.enviosSubject.asObservable();

  ngOnInit() {
    this.paqueteService.obtenerHistorialEnvios().subscribe(envios => {
      this.ordenarEnvios(envios);
    });
  }

  verDetalles(envio: HistorialEnvio) {
    this.selectedEnvio = envio;
  }

  cerrarDetalles() {
    this.selectedEnvio = null;
  }

  getEstadoClass(estado: string): string {
    const classes = {
      'enviado': 'estado-enviado',
      'en_transito': 'estado-transito',
      'entregado': 'estado-entregado'
    };
    return classes[estado as keyof typeof classes] || 'estado-default';
  }

  getEstadoText(estado: string): string {
    const texts = {
      'enviado': 'Enviado',
      'en_transito': 'En Tránsito',
      'entregado': 'Entregado'
    };
    return texts[estado as keyof typeof texts] || estado;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTotalProductos(envio: HistorialEnvio): number {
    return envio.paquete.productos.length;
  }

  getPrecioTotal(envio: HistorialEnvio): number {
    return envio.paquete.precioTotal;
  }

  ordenarEnvios(envios: HistorialEnvio[]) {
    let sorted = [...envios];
    if (this.sortBy === 'todos') {
      // No ordenar, solo mostrar todos como están
      this.enviosSubject.next(sorted);
      return;
    }
    switch (this.sortBy) {
      case 'fecha':
        sorted.sort((a, b) => this.sortDirection === 'asc'
          ? new Date(a.fechaEnvio).getTime() - new Date(b.fechaEnvio).getTime()
          : new Date(b.fechaEnvio).getTime() - new Date(a.fechaEnvio).getTime());
        break;
      case 'productos':
        sorted.sort((a, b) => this.sortDirection === 'asc'
          ? a.paquete.productos.length - b.paquete.productos.length
          : b.paquete.productos.length - a.paquete.productos.length);
        break;
      case 'precio':
        sorted.sort((a, b) => this.sortDirection === 'asc'
          ? a.paquete.precioTotal - b.paquete.precioTotal
          : b.paquete.precioTotal - a.paquete.precioTotal);
        break;
      case 'dimension':
        const order = { small: 1, medium: 2, large: 3 };
        sorted.sort((a, b) => this.sortDirection === 'asc'
          ? order[a.paquete.tipo] - order[b.paquete.tipo]
          : order[b.paquete.tipo] - order[a.paquete.tipo]);
        break;
    }
    this.enviosSubject.next(sorted);
  }

  toggleSortDirection() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.historialEnvios$.subscribe(envios => this.ordenarEnvios(envios));
  }

  eliminarEnvio(envio: HistorialEnvio, event: Event) {
    event.stopPropagation();
    if (confirm('¿Estás seguro de eliminar este envío?')) {
      this.paqueteService.eliminarEnvio(envio.numeroSeguimiento).subscribe(() => {
        // El servicio actualiza el observable, así que solo necesitas volver a ordenar
        this.paqueteService.obtenerHistorialEnvios().subscribe(envios => this.ordenarEnvios(envios));
      });
    }
  }
}