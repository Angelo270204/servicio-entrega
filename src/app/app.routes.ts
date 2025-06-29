import { Routes } from "@angular/router";
import { Home } from "./components/home/home";
import { CrearPaqueteComponent } from "./components/crear-paquete/crear-paquete";
import { HistorialEnviosComponent } from "./components/historial-envios/historial-envios";

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
];