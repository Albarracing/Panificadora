import express from "express";
import dotenv from "dotenv";
import conectarDB from "./config/db.js";
import bodyParser from "body-parser";
import ArticulosclientesRoutes from "./routes/ArticulosClientesRoutes.js";
import repartidorRoutes from "./routes/RepartidorRoutes.js";
import clientesRoutes from "./routes/ClientesRoutes.js";
import articulosRoutes from "./routes/ArticulosRoutes.js";
import repartosRoutes from "./routes/RepartosRoutes.js";
import LocalidadRoutes from "./routes/LocalidadRoutes.js";
import cuentaCorrienteRoutes from "./routes/CuentaCorrienteRoutes.js";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";

dotenv.config();
conectarDB();

mongoose.set("strictPopulate", false);
const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));
//app.use(parseArticuloData);

app.use("/api/repartidores", repartidorRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/articulos", articulosRoutes);
app.use("/api/repartos", repartosRoutes);
app.use("/api/localidades", LocalidadRoutes);
app.use("/api/cuenta-corriente", cuentaCorrienteRoutes);
app.use("/api/articulos-clientes", ArticulosclientesRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor funcionando en el puerto ${PORT}`);
});
