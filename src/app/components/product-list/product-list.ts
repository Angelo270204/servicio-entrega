import { Component, inject } from "@angular/core";
import { Producto } from "../../models/producto.model";
import { ProductoService } from "../../services/producto";
import { Observable } from "rxjs";
import { ProductCardComponent } from "../product-card/product-card";
import { CommonModule } from "@angular/common";
// Importa MatSnackBar y MatSnackBarModule (necesitarías instalar Angular Material)
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: "app-product-list",
  standalone: true,
  imports: [ProductCardComponent, CommonModule, MatSnackBarModule], // Agrega MatSnackBarModule aquí
  templateUrl: "./product-list.html",
  styleUrls: ["./product-list.scss"],
})
export class ProductList {
  productos$: Observable<Producto[]> =
    inject(ProductoService).obtenerProductos();

  // Elimina la propiedad 'message' si usas MatSnackBar
  // message: { text: string, type: 'success' | 'error' | 'warning' | '' } = { text: '', type: '' };

  // Inyecta MatSnackBar
  private _snackBar = inject(MatSnackBar);

  agregarProductoAlCarrito(producto: {id: string, nombre: string, precio: number, imagenUrl: string}) {
    let carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    let currentQuantity = 0;
    const idx = carrito.findIndex((p: any) => p.id === producto.id);
    if (idx > -1) {
      carrito[idx].cantidad += 1;
      currentQuantity = carrito[idx].cantidad;
    } else {
      carrito.push({ ...producto, cantidad: 1 });
      currentQuantity = 1;
    }
    localStorage.setItem('carrito', JSON.stringify(carrito));

    // Usa MatSnackBar para mostrar la notificación
    this._snackBar.open(
      `Se agregó ${producto.nombre}. Cantidad actual en carrito: ${currentQuantity}`,
      'Cerrar', // Texto del botón de acción (opcional)
      {
        duration: 3000, // Duración en milisegundos
        horizontalPosition: 'end', // 'start' | 'center' | 'end' | 'left' | 'right'
        verticalPosition: 'top', // 'top' | 'bottom'
        panelClass: ['success-snackbar'] // Opcional: para estilos personalizados
      }
    );
  }

  // Estos métodos ya no serían necesarios si usas MatSnackBar para las notificaciones
  // showMessage(text: string, type: 'success' | 'error' | 'warning') {
  //   this.message = { text, type };
  //   setTimeout(() => {
  //     this.clearMessage();
  //   }, 3000);
  // }

  // clearMessage() {
  //   this.message = { text: '', type: '' };
  // }
}
