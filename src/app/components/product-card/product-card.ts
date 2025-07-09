import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-product-card',
  standalone: true, // <-- agrega esta línea
  templateUrl: './product-card.html',
  styleUrls: ['./product-card.scss']
})
export class ProductCardComponent {
  @Input() id!: string;
  @Input() nombre!: string;
  @Input() precio!: number;
  @Input() imagenUrl!: string;

@Output() agregarAlCarrito = new EventEmitter<{id: string, nombre: string, precio: number, imagenUrl: string}>();

onAgregar() {
  this.agregarAlCarrito.emit({
    id: this.id,
    nombre: this.nombre,
    precio: this.precio,
    imagenUrl: this.imagenUrl
  });
}
}
