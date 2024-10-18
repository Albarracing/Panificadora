import express from "express";

import {
  eliminarArticuloCliente,
  actualizarCliente,
} from "../controllers/ArticulosCliente.js";

const router = express.Router();

router.delete("/articulo/:id", eliminarArticuloCliente);
router.put("articulo/:_id", actualizarCliente);
export default router;
