import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para *ngIf, *ngFor, pipes
import { FormsModule } from '@angular/forms'; // Necesario para [(ngModel)]
import { Router } from '@angular/router'; // Importa Router para la navegación

interface ProductoCarrito {
  id: string;
  nombre: string;
  cantidad: number;
  precio: number;
  seleccionado?: boolean;
}

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carrito.html',
  styleUrls: ['./carrito.scss']
})
export class CarritoComponent {
  carrito: ProductoCarrito[] = [];
  message: { text: string, type: 'success' | 'error' | 'warning' | '' } = { text: '', type: '' };

  // Inyecta Router en el constructor
  constructor(private router: Router) {
    const guardados = localStorage.getItem('carrito');
    this.carrito = guardados ? JSON.parse(guardados) : [];
  }

  // Nuevo getter para verificar si hay algún producto seleccionado
  get anyProductSelected(): boolean {
    return this.carrito.some(p => p.seleccionado);
  }

  eliminarDelCarrito(producto: ProductoCarrito) {
    this.carrito = this.carrito.filter(p => p.id !== producto.id);
    this.guardarCarrito();
    this.showMessage('Producto eliminado del carrito.', 'success');
  }

  comprarSeleccionados() {
    const seleccionados = this.carrito.filter(p => p.seleccionado);
    if (seleccionados.length > 0) {
      this.showMessage(`Compraste ${seleccionados.length} producto(s).`, 'success');
      // Aquí podrías añadir lógica para limpiar los productos seleccionados del carrito
      this.carrito = this.carrito.filter(p => !p.seleccionado);
      this.guardarCarrito();
    } else {
      this.showMessage('Selecciona al menos un producto para comprar.', 'warning');
    }
  }

  crearPaqueteSeleccionados() {
    const seleccionados = this.carrito.filter(p => p.seleccionado);
    if (seleccionados.length > 0) {
      // Guarda los productos seleccionados en localStorage para que CrearPaqueteComponent los pueda leer
      localStorage.setItem('productosParaPaquete', JSON.stringify(seleccionados));
      this.showMessage(`Preparando paquete con ${seleccionados.length} producto(s).`, 'success');

      // Navega a la ruta de crear paquete
      this.router.navigate(['/crear-paquete']);

      // Opcional: Limpiar los productos seleccionados del carrito después de iniciar la creación del paquete
      this.carrito = this.carrito.filter(p => !p.seleccionado);
      this.guardarCarrito();

    } else {
      this.showMessage('Selecciona al menos un producto para crear un paquete.', 'warning');
    }
  }

  guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(this.carrito));
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
