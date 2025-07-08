import { Component, inject } from "@angular/core";
import { Producto } from "../../models/producto.model";
import { ProductoService } from "../../services/producto";
import { Observable } from "rxjs";
import { ProductCardComponent } from "../product-card/product-card";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-product-list",
  standalone: true,
  imports: [ProductCardComponent, CommonModule],
  templateUrl: "./product-list.html",
  styleUrls: ["./product-list.scss"],
})
export class ProductList {
  productos$: Observable<Producto[]> =
    inject(ProductoService).obtenerProductos();

  message: { text: string, type: 'success' | 'error' | 'warning' | '' } = { text: '', type: '' };

  agregarProductoAlCarrito(producto: {id: string, nombre: string, precio: number, imagenUrl: string}) {
    let carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    // Evitar duplicados: si ya existe, suma cantidad
    const idx = carrito.findIndex((p: any) => p.id === producto.id);
    if (idx > -1) {
      carrito[idx].cantidad += 1;
    } else {
      carrito.push({ ...producto, cantidad: 1 });
    }
    localStorage.setItem('carrito', JSON.stringify(carrito));
    this.showMessage('Producto agregado al carrito', 'success'); // Reemplazado alert()
  }

  /**
   * Muestra un mensaje en la interfaz de usuario.
   * @param text El texto del mensaje.
   * @param type El tipo de mensaje ('success', 'error', 'warning').
   */
  showMessage(text: string, type: 'success' | 'error' | 'warning') {
    this.message = { text, type };
    setTimeout(() => {
      this.clearMessage();
    }, 3000); // El mensaje desaparece después de 3 segundos
  }

  /**
   * Limpia el mensaje mostrado en la interfaz.
   */
  clearMessage() {
    this.message = { text: '', type: '' };
  }
}
