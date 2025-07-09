// app.routes.ts
import { Routes } from "@angular/router";
import { Home } from "./components/home/home";
import { CrearPaqueteComponent } from "./components/crear-paquete/crear-paquete";
import { HistorialEnviosComponent } from "./components/historial-envios/historial-envios";
import { Navbar } from "./components/navbar/navbar";
import { CarritoComponent } from "./components/carrito/carrito";

export const routes: Routes = [
  {
    path: "",
    component: Home,
  },
  {
    path: "navbar",
    component: Navbar
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
