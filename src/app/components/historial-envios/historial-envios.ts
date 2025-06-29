import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PaqueteService } from '../../services/paquete.service';
import { HistorialEnvio } from '../../models/paquete.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-historial-envios',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './historial-envios.html',
  styleUrls: ['./historial-envios.scss']
})
export class HistorialEnviosComponent implements OnInit {
  private paqueteService = inject(PaqueteService);
  
  historialEnvios$: Observable<HistorialEnvio[]> = this.paqueteService.obtenerHistorialEnvios();
  selectedEnvio: HistorialEnvio | null = null;

  ngOnInit() {
    // Componente inicializado
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
}