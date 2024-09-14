import express from "express";
import {
  obtenerEstadoCuentaCorriente,
  obtenerEstadoCuentaCorrientePorFechas,
  registrarEnCuentaCorriente,
  actualizarCuentaCorriente,
  obtenerEstadoCuentaDetallado,
  obtenerMovimientosCliente,
} from "../controllers/CuentaCorrienteControllers.js";

const router = express.Router();

// Ruta para obtener el estado de cuenta corriente de un cliente específico
router.get("/:clienteId", obtenerEstadoCuentaCorriente);
router.get("/movimientos/:clienteId", obtenerMovimientosCliente);
router.get("datalles/:clienteId", obtenerEstadoCuentaDetallado);
router.get("/:clienteId/por-fechas", obtenerEstadoCuentaCorrientePorFechas);
router.post("/:repartoId", registrarEnCuentaCorriente);
router.put("/:clienteId", actualizarCuentaCorriente);

export default router;
