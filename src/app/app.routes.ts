// app.routes.ts
import { Routes } from "@angular/router";
import { Home } from "./components/home/home";
import { CrearPaqueteComponent } from "./components/crear-paquete/crear-paquete";
import { HistorialEnviosComponent } from "./components/historial-envios/historial-envios";
import { CarritoComponent } from "./components/carrito/carrito"; // Importa el CarritoComponent, ¡corregido para tu nombre de archivo!

export const routes: Routes = [
  {
    path: "",
    component: Home,
  },
  {
    path: "crear-paquete",
    component: CrearPaqueteComponent,
  },
  {
    path: "historial",
    component: HistorialEnviosComponent,
  },
  {
    path: "carrito", // Nueva ruta para el carrito
    component: CarritoComponent,
  },
];
