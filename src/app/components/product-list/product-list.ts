import { Component, inject } from "@angular/core";
import { Producto } from "../../models/producto.model";
import { ProductoService } from "../../services/producto";
import { Observable } from "rxjs";
import { ProductCard } from "../product-card/product-card";
import { CommonModule } from "@angular/common";
@Component({
  selector: "app-product-list",
  imports: [ProductCard, CommonModule],
  templateUrl: "./product-list.html",
  styleUrls: ["./product-list.scss"],
})
export class ProductList {
  productos$: Observable<Producto[]> =
    inject(ProductoService).obtenerProductos();
}
