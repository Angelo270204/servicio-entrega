import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductoService } from '../../services/producto';
import { PaqueteService } from '../../services/paquete.service';
import { Observable } from 'rxjs';
import { Producto } from '../../models/producto.model';

// Interfaz para los productos del carrito, si es diferente a Producto
interface ProductoCarrito {
  id: string;
  nombre: string;
  cantidad: number;
  precio: number;
  imagenUrl: string; // Asegúrate de que esta propiedad exista si la necesitas
  dimension: 'small' | 'medium' | 'large'; // Añadir dimensión si los productos del carrito la tienen
}

@Component({
  selector: 'app-crear-paquete',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-paquete.html',
  styleUrls: ['./crear-paquete.scss'],
})
export class CrearPaqueteComponent implements OnInit { // Implementa OnInit
  private productoService = inject(ProductoService);
  private paqueteService = inject(PaqueteService);
  private router = inject(Router);

  productos$: Observable<Producto[]> = this.productoService.obtenerProductos();

  selectedPackageType: 'small' | 'medium' | 'large' | null = null;
  step: number = 1;
  selectedProducts: Producto[] = [];

  // Personalización
  selectedColor: string = '';
  selectedEvent: string = 'none';
  customEvent: string = '';
  includeMessage: boolean = false;
  message: string = ''; // Mensaje personalizado para la tarjeta de mensaje

  // Dirección de envío
  direccionEnvio: string = '';

  // Validaciones
  validationErrors: string[] = [];
  validationSuggestions: string[] = [];

  // Estados
  isCreating: boolean = false;
  showConfirmation: boolean = false;
  createdPackageId: string | null = null;

  // Mensaje de la aplicación (éxito/error/advertencia)
  appMessage: { text: string, type: 'success' | 'error' | 'warning' | '' } = { text: '', type: '' };

  ngOnInit(): void {
    // Cargar productos del carrito si existen en localStorage
    const productosParaPaqueteRaw = localStorage.getItem('productosParaPaquete');
    if (productosParaPaqueteRaw) {
      try {
        const productosCargados: ProductoCarrito[] = JSON.parse(productosParaPaqueteRaw);
        // Mapea los productos del carrito a la interfaz Producto si es necesario,
        // o asegúrate de que ProductoCarrito sea compatible con Producto
        this.selectedProducts = productosCargados.map(p => ({
          id: p.id,
          nombre: p.nombre,
          precio: p.precio,
          imagenUrl: p.imagenUrl,
          dimension: p.dimension // Asegúrate de que la dimensión esté presente
        }));

        // Opcional: Avanzar al paso de selección de productos si se cargaron productos
        if (this.selectedProducts.length > 0) {
          this.step = 2; // O al paso que consideres más adecuado
          this.showMessage('Productos del carrito cargados para crear el paquete.', 'success');
        }

        localStorage.removeItem('productosParaPaquete'); // Limpiar después de cargar
      } catch (e) {
        console.error('Error al cargar productos para paquete desde localStorage:', e);
        this.showMessage('Error al cargar productos del carrito. Inténtalo de nuevo.', 'error');
      }
    }
  }

  get canGoToProducts(): boolean {
    return !!this.selectedPackageType;
  }

  get canGoToCustomization(): boolean {
    if (!this.selectedPackageType || this.selectedProducts.length === 0) {
      return false;
    }

    const validation = this.paqueteService.validarProductosParaPaquete(
      this.selectedProducts,
      this.selectedPackageType
    );

    this.validationErrors = validation.errores;
    this.validationSuggestions = validation.sugerencias;

    return validation.valido;
  }

  get canCreatePackage(): boolean {
    return (
      this.selectedColor !== '' &&
      this.direccionEnvio.trim() !== '' &&
      this.selectedProducts.length > 0 &&
      !!this.selectedPackageType &&
      this.paqueteService.validarProductosParaPaquete(
        this.selectedProducts,
        this.selectedPackageType
      ).valido
    );
  }

  get totalPrice(): number {
    return this.selectedProducts.reduce((total, producto) => total + producto.precio, 0);
  }

  get packageLimits() {
    const limits = {
      small: { maxProductos: 3, dimensiones: ['small'] },
      medium: { maxProductos: 7, dimensiones: ['small', 'medium'] },
      large: { maxProductos: 10, dimensiones: ['small', 'medium', 'large'] }
    };
    return this.selectedPackageType ? limits[this.selectedPackageType] : null;
  }

  selectPackageType(type: 'small' | 'medium' | 'large') {
    this.selectedPackageType = type;
    // Limpiar productos seleccionados si cambia el tipo de paquete
    this.selectedProducts = [];
    this.validationErrors = [];
    this.validationSuggestions = [];
  }

  goToProductsStep() {
    if (this.canGoToProducts) {
      this.step = 2;
    }
  }

  goToCustomizationStep() {
    if (this.canGoToCustomization) {
      this.step = 3;
    }
  }

  goToMessageStep() {
    if (this.selectedColor) {
      this.step = 4;
    }
  }

  goToConfirmationStep() {
    this.step = 5;
  }

  toggleProductSelection(producto: Producto) {
    const idx = this.selectedProducts.findIndex(p => p.id === producto.id);
    if (idx > -1) {
      this.selectedProducts.splice(idx, 1);
    } else {
      // Verificar si se puede agregar el producto
      const tempProducts = [...this.selectedProducts, producto];
      if (this.selectedPackageType) {
        const validation = this.paqueteService.validarProductosParaPaquete(
          tempProducts,
          this.selectedPackageType
        );

        if (validation.valido) {
          this.selectedProducts.push(producto);
          this.validationErrors = [];
          this.validationSuggestions = [];
        } else {
          this.validationErrors = validation.errores;
          this.validationSuggestions = validation.sugerencias;
        }
      }
    }
  }

  isProductSelected(producto: Producto): boolean {
    return this.selectedProducts.some(p => p.id === producto.id);
  }

  isProductCompatible(producto: Producto): boolean {
    if (!this.selectedPackageType) return true;

    const compatibility = {
      small: ['small'],
      medium: ['small', 'medium'],
      large: ['small', 'medium', 'large']
    };

    return compatibility[this.selectedPackageType].includes(producto.dimension);
  }

  onMessageToggle() {
    if (!this.includeMessage) {
      this.message = '';
    }
  }

  async crearPaquete() {
    if (!this.canCreatePackage || !this.selectedPackageType) {
      return;
    }
    this.isCreating = true;
    try {
      const paqueteData = {
        tipo: this.selectedPackageType,
        productos: this.selectedProducts,
        personalizacion: {
          color: this.selectedColor,
          evento: this.selectedEvent,
          eventoPersonalizado: this.selectedEvent === 'other' ? this.customEvent : undefined,
          mensaje: this.includeMessage ? this.message : undefined
        }
      };

      console.log('Creando paquete...', paqueteData);
      const paquete = await this.paqueteService.crearPaquete(paqueteData).toPromise();
      console.log('Paquete creado:', paquete);

      if (paquete) {
        const envio = await this.paqueteService.enviarPaquete(paquete.id, this.direccionEnvio).toPromise();
        console.log('Envío realizado:', envio);

        this.createdPackageId = paquete.id;
        this.showConfirmation = true;
        this.step = 6;
        this.showMessage('Paquete creado y envío iniciado con éxito.', 'success'); // Mensaje de éxito
      }
    } catch (error) {
      console.error('Error al crear el paquete:', error);
      this.showMessage('Hubo un error al crear el paquete. Por favor, inténtalo de nuevo.', 'error'); // Mensaje de error
    } finally {
      this.isCreating = false;
    }
  }

  verHistorial() {
    this.router.navigate(['/historial']);
  }

  crearOtroPaquete() {
    // Resetear el formulario
    this.selectedPackageType = null;
    this.step = 1;
    this.selectedProducts = [];
    this.selectedColor = '';
    this.selectedEvent = 'none';
    this.customEvent = '';
    this.includeMessage = false;
    this.message = '';
    this.direccionEnvio = '';
    this.validationErrors = [];
    this.validationSuggestions = [];
    this.showConfirmation = false;
    this.createdPackageId = null;
    this.clearAppMessage(); // Limpiar el mensaje de la aplicación
  }

  goBack() {
    if (this.step > 1) {
      this.step--;
    }
  }

  /**
   * Muestra un mensaje en la interfaz de usuario.
   * @param text El texto del mensaje.
   * @param type El tipo de mensaje ('success', 'error', 'warning').
   */
  showMessage(text: string, type: 'success' | 'error' | 'warning') {
    this.appMessage = { text, type };
    setTimeout(() => {
      this.clearAppMessage();
    }, 3000); // El mensaje desaparece después de 3 segundos
  }

  /**
   * Limpia el mensaje mostrado en la interfaz.
   */
  clearAppMessage() {
    this.appMessage = { text: '', type: '' };
  }
}
