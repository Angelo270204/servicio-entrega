import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // <-- IMPORTA ESTO
import { ProductoService } from '../../services/producto'; // Ajusta el path si es necesario
import { Producto } from '../../models/producto.model';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule], // <-- AGREGA CommonModule AQUÍ
  templateUrl: "./navbar.html",
  styleUrls: ["./navbar.scss"],
})
export class Navbar {
  selectedCategory$ = new BehaviorSubject<string>('all');
  searchTerm$ = new BehaviorSubject<string>('');

  productos$: Observable<Producto[]>;

  productosFiltrados$: Observable<Producto[]>;

  constructor(private productoService: ProductoService) {
    this.productos$ = this.productoService.obtenerProductos();

    this.productosFiltrados$ = combineLatest([
      this.productos$,
      this.selectedCategory$,
      this.searchTerm$.pipe(startWith(''))
    ]).pipe(
      map(([productos, categoria, termino]) => {
        const term = termino.trim().toLowerCase();
        return productos.filter(producto => {
          const coincideCategoria = categoria === 'all' || producto.categoria?.toLowerCase() === categoria;
          const coincideNombre = producto.nombre.toLowerCase().includes(term);
          return coincideCategoria && coincideNombre;
        });
      })
    );
  }

  onCategoryChange(value: string) {
    this.selectedCategory$.next(value);
  }

  onSearchTermChange(value: string) {
    this.searchTerm$.next(value);
  }
}
