import CuentaCorriente from "../models/CuentaCorriente.js";
import Repartos from "../models/Repartos.js";
import mongoose from "mongoose";
import Cliente from "../models/Clientes.js";
// Obtener el estado de cuenta corriente de un cliente específico
const obtenerEstadoCuentaCorriente = async (req, res) => {
  try {
    const { clienteId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(clienteId)) {
      return res.status(400).json({ message: "ID de cliente no válido." });
    }

    const objectIdCliente = new mongoose.Types.ObjectId(clienteId);

    // Obtener el último registro de la colección CuentaCorriente para el cliente
    const estadoCuenta = await CuentaCorriente.findOne({
      clienteId: objectIdCliente,
    })
      .sort({ fecha: -1 }) // Ordenar por fecha descendente para obtener el último registro
      .select("totalPagado totalDeuda totalDevoluciones"); // Seleccionar solo los campos necesarios

    if (!estadoCuenta) {
      return res.status(404).json({
        message: "No se encontró el estado de cuenta para el cliente.",
      });
    }

    res.status(200).json(estadoCuenta);
  } catch (error) {
    console.error("Error al obtener el estado de cuenta:", error);
    res
      .status(500)
      .json({ message: "Error al obtener el estado de cuenta.", error });
  }
};

const obtenerMovimientosCliente = async (req, res) => {
  const { clienteId } = req.params;

  try {
    // Log para verificar el clienteId
    console.log("Cliente ID:", clienteId);

    const movimientos = await CuentaCorriente.aggregate([
      { $match: { clienteId: new mongoose.Types.ObjectId(clienteId) } },
      {
        $lookup: {
          from: "articulos",
          localField: "detalles.articuloId",
          foreignField: "_id",
          as: "articulos",
        },
      },
      {
        $unwind: {
          path: "$detalles",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          "detalles.articuloNombre": {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$articulos",
                  as: "articulo",
                  cond: { $eq: ["$$articulo._id", "$detalles.articuloId"] },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$fecha" },
            month: { $month: "$fecha" },
          },
          movimientos: {
            $push: {
              fecha: "$fecha",
              montoTotalReparto: "$montoTotalReparto",
              totalPagado: "$totalPagado",
              totalDeuda: "$totalDeuda",
              totalDevoluciones: "$totalDevoluciones",
              detalles: {
                articuloNombre: "$detalles.articuloNombre.nombre",
                cantidad: "$detalles.cantidad",
                cantidadDevuelta: "$detalles.cantidadDevuelta",
                importe: "$detalles.importe",
                unidad: "$detalles.unidad",
              },
            },
          },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } }, // Ordenar por año y mes descendente
    ]);

    // Log para ver qué se ha obtenido de la base de datos
    console.log("Movimientos obtenidos:", JSON.stringify(movimientos, null, 2));

    res.status(200).json(movimientos);
  } catch (error) {
    console.error("Error al obtener los movimientos del cliente:", error);
    res.status(500).json({
      message: "Error al obtener los movimientos del cliente.",
      error,
    });
  }
};

const obtenerEstadoCuentaDetallado = async (req, res) => {
  const { clienteId } = req.params;
  const { fechaInicio, fechaFin } = req.query;

  try {
    const estadoCuenta = await Repartos.aggregate([
      {
        $match: {
          "clientesArticulos.clienteId": new mongoose.Types.ObjectId(clienteId),
          fecha: { $gte: new Date(fechaInicio), $lte: new Date(fechaFin) },
        },
      },
      { $unwind: "$clientesArticulos" },
      {
        $group: {
          _id: "$clientesArticulos.clienteId",
          totalPagado: { $sum: "$clientesArticulos.montoPagado" },
          totalDeuda: { $sum: "$clientesArticulos.deuda" },
          totalDevoluciones: {
            $sum: "$clientesArticulos.devoluciones.importeDevuelto",
          },
        },
      },
    ]);

    if (!estadoCuenta || estadoCuenta.length === 0) {
      return res.status(404).json({
        message: "No se encontró el estado de cuenta para el cliente.",
      });
    }

    res.status(200).json(estadoCuenta[0]);
  } catch (error) {
    console.error("Error al obtener el estado de cuenta detallado:", error);
    res.status(500).json({
      message: "Error al obtener el estado de cuenta detallado.",
      error,
    });
  }
};

const obtenerEstadoCuentaCorrientePorFechas = async (req, res) => {
  const { clienteId } = req.params;
  const { fechaInicio, fechaFin } = req.query;

  try {
    // Validar fechas
    if (!fechaInicio || !fechaFin) {
      return res
        .status(400)
        .json({ message: "Las fechas de inicio y fin son requeridas." });
    }

    // Obtener movimientos dentro del rango de fechas
    const movimientos = await Repartos.aggregate([
      {
        $match: {
          "clientesArticulos.clienteId": new mongoose.Types.ObjectId(clienteId),
          fecha: { $gte: new Date(fechaInicio), $lte: new Date(fechaFin) },
        },
      },
      { $unwind: "$clientesArticulos" },
      {
        $group: {
          _id: {
            year: { $year: "$fecha" },
            month: { $month: "$fecha" },
          },
          movimientos: {
            $push: {
              fecha: "$fecha",
              montoTotalReparto: "$montoTotalReparto",
              totalPagado: "$clientesArticulos.montoPagado",
              totalDeuda: "$clientesArticulos.deuda",
              detalles: "$clientesArticulos.devoluciones",
            },
          },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    res.json(movimientos);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los movimientos por fechas.",
      error,
    });
  }
};

const registrarEnCuentaCorriente = async (req, res) => {
  const { repartoId } = req.body;

  try {
    const reparto = await Repartos.findById(repartoId);
    if (!reparto) {
      return res.status(404).json({ message: "Reparto no encontrado" });
    }

    await Promise.all(
      reparto.clientesArticulos.map(async (clienteArticulo) => {
        const cliente = await Cliente.findById(clienteArticulo.clienteId);
        if (!cliente) {
          throw new Error(
            `Cliente con ID ${clienteArticulo.clienteId} no encontrado`
          );
        }

        // Datos para verificar
        console.log("Datos del reparto:", reparto);
        console.log("Datos del clienteArticulo:", clienteArticulo);
        console.log("Datos del cliente:", cliente);

        const totalDevoluciones = clienteArticulo.devoluciones.reduce(
          (total, devolucion) =>
            total + devolucion.cantidadDevuelta * devolucion.precioUnitario,
          0
        );

        const movimientos = {
          clienteId: clienteArticulo.clienteId,
          repartoId: repartoId,
          fecha: reparto.fecha,
          totalPagado: clienteArticulo.montoPagado,
          totalDeuda: clienteArticulo.deuda,
          totalDevoluciones: totalDevoluciones,
          montoTotalReparto: reparto.totalReparto,
          detalles: clienteArticulo.articulos.map((articulo) => ({
            articuloId: articulo.articuloId,
            cantidad: articulo.cantidad,
            cantidadDevuelta: articulo.cantidadDevuelta,
            importe: articulo.importe,
            unidad: articulo.unidad,
          })),
        };

        // Verifica antes de guardar
        console.log("Movimientos a guardar:", movimientos);

        // Guardar o actualizar los movimientos en cuentaCorriente
        const resultado = await CuentaCorriente.findOneAndUpdate(
          { clienteId: clienteArticulo.clienteId, repartoId: repartoId },
          movimientos,
          { upsert: true, new: true }
        );

        if (!resultado) {
          console.log("No se encontró el estado de cuenta para el cliente.");
        } else {
          console.log("Resultado de la actualización:", resultado);
        }
      })
    );

    res.json({ message: "Movimientos registrados exitosamente" });
  } catch (error) {
    console.error("Error al registrar en cuenta corriente:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Crear o actualizar el estado de cuenta de un cliente
const actualizarCuentaCorriente = async (req, res) => {
  try {
    const { clienteId } = req.params;
    const { totalPagado, totalDeuda, totalDevoluciones, detalles } = req.body;

    const cuentaCorriente = await CuentaCorriente.findOneAndUpdate(
      { clienteId },
      {
        $set: {
          totalPagado,
          totalDeuda,
          totalDevoluciones,
          detalles,
        },
      },
      { new: true, upsert: true }
    );

    res.status(200).json(cuentaCorriente);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al actualizar el estado de cuenta.", error });
  }
};

export {
  actualizarCuentaCorriente,
  obtenerEstadoCuentaDetallado,
  obtenerMovimientosCliente,
  obtenerEstadoCuentaCorrientePorFechas,
  registrarEnCuentaCorriente,
  obtenerEstadoCuentaCorriente,
};
