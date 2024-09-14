import Repartos from "../models/Repartos.js";
import Articulos from "../models/Articulos.js";
import Cliente from "../models/Clientes.js";
import CuentaCorriente from "../models/CuentaCorriente.js";
const verRepartosFecha = async (req, res) => {
  const { fecha } = req.params;
  try {
    const startOfDay = new Date(fecha + "T00:00:00.000Z");
    const endOfDay = new Date(fecha + "T23:59:59.999Z");

    const repartos = await Repartos.find({
      fecha: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    })

      .populate("clientesArticulos.clienteId")
      .populate("clientesArticulos.articulos.articuloId")
      .populate({
        path: "clientesArticulos.clienteId",
        populate: {
          path: "localidad",
          model: "Localidad",
        },
      });

    // Obtener el precio unitario según la localidad del cliente
    for (const reparto of repartos) {
      for (const clienteArticulo of reparto.clientesArticulos) {
        for (const articulo of clienteArticulo.articulos) {
          const articuloInfo = await Articulos.findById(
            articulo.articuloId
          ).lean();
          const precioInfo = articuloInfo.precios.find((p) =>
            p.localidad.equals(clienteArticulo.clienteId.localidad._id)
          );
          articulo.precioUnitario = precioInfo ? precioInfo.precio : null;

          // Agregamos logs para depuración
          console.log(`
            Cliente: ${clienteArticulo.clienteId.nombre} ${clienteArticulo.clienteId.apellido}`);
          console.log(`Artículo: ${articulo.articuloId.nombre}`);
          console.log(`Precio Unitario: ${articulo.precioUnitario}`);
        }
      }
    }

    res.json(repartos);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los repartos por fecha",
      error: error.message,
    });
  }
};

const obtenerDeudaPendiente = async (clienteId) => {
  try {
    // Busca el último reparto donde el cliente tiene deuda pendiente
    const penultimoRepartoConDeuda = await Repartos.find({
      "clientesArticulos.clienteId": clienteId,
      "clientesArticulos.pagadoCompleto": false, // Filtra los repartos no pagados completamente
    })
      .sort({ fecha: -1 }) // Ordena por fecha descendente para obtener los más recientes
      .limit(2); // Traer los dos más recientes para obtener el anterior al último reparto

    // Si se encontró más de un reparto, queremos el segundo (penúltimo)
    if (penultimoRepartoConDeuda.length > 1) {
      const clienteArticulo =
        penultimoRepartoConDeuda[1].clientesArticulos.find(
          (ca) => ca.clienteId.toString() === clienteId.toString()
        );

      // Retorna la deuda del penúltimo reparto no pagado completamente
      return clienteArticulo ? clienteArticulo.deuda : 0;
    }

    // Si solo hay un reparto con deuda, usa ese
    if (penultimoRepartoConDeuda.length === 1) {
      const clienteArticulo =
        penultimoRepartoConDeuda[0].clientesArticulos.find(
          (ca) => ca.clienteId.toString() === clienteId.toString()
        );

      return clienteArticulo ? clienteArticulo.deuda : 0;
    }

    // Si no se encontró ningún reparto con deuda, retorna 0
    return 0;
  } catch (error) {
    console.error("Error al obtener la deuda pendiente:", error);
    return 0;
  }
};

// Ejemplo de controlador para obtener los detalles de un reparto

const obtenerRepartoDetalles = async (req, res) => {
  try {
    const reparto = await Repartos.findById(req.params.repartoId).populate(
      "clientesArticulos.clienteId"
    );
    if (!reparto) {
      return res.status(404).json({ message: "Reparto no encontrado" });
    }

    // Calcular deuda pendiente
    const repartosPrevios = await Repartos.find({
      fecha: { $lt: reparto.fecha },
    }).sort({ fecha: -1 });
    const deudaPendientePorCliente = {};

    for (const clienteArticulo of reparto.clientesArticulos) {
      const clienteId = clienteArticulo.clienteId._id.toString();
      deudaPendientePorCliente[clienteId] = 0;

      for (const repartoPrevio of repartosPrevios) {
        const clientePrevio = repartoPrevio.clientesArticulos.find(
          (ca) => ca.clienteId.toString() === clienteId
        );
        if (clientePrevio) {
          deudaPendientePorCliente[clienteId] += clientePrevio.deuda || 0;
        }
      }
    }

    const clientesArticulosConDeudaPendiente = reparto.clientesArticulos.map(
      (clienteArticulo) => {
        const deudaPendiente =
          deudaPendientePorCliente[clienteArticulo.clienteId._id.toString()] ||
          0;
        return {
          ...clienteArticulo.toObject(),
          deudaPendiente,
        };
      }
    );

    res.json({
      ...reparto.toObject(),
      clientesArticulos: clientesArticulosConDeudaPendiente,
    });
  } catch (error) {
    console.error("Error al obtener los detalles del reparto:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

const verRepartos = async (req, res) => {
  try {
    const reparto = await Repartos.find()
      .populate({
        path: "clientesArticulos.clienteId",
        select: "nombre apellido",
      })
      .populate({
        path: "clientesArticulos.articulos.articuloId",
        select: "nombre cantidad",
      });

    res.json(reparto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Hubo un error al obtener los repartos." });
  }
};

const obtenerSiguienteNumeroPedido = async () => {
  const ultimoReparto = await Repartos.findOne().sort({ numeroPedido: -1 });
  return ultimoReparto ? ultimoReparto.numeroPedido + 1 : 1;
};

const crearReparto = async (req, res) => {
  const { clientesArticulos, fecha, repartidor, alias } = req.body;

  try {
    if (!clientesArticulos || !fecha) {
      return res.status(400).json({ message: "Faltan datos necesarios" });
    }

    const todosLosArticulos = await Articulos.find().populate(
      "precios.localidad"
    );

    let totalReparto = 0;
    const cantidadTotalPorProducto = new Map();

    const clientesArticulosConImportes = await Promise.all(
      clientesArticulos.map(async (clienteArticulo) => {
        let totalCliente = 0;

        const cliente = await Cliente.findById(clienteArticulo.cliente);
        if (!cliente) {
          throw new Error(
            `Cliente con ID ${clienteArticulo.cliente} no encontrado`
          );
        }

        const localidadCliente = cliente.localidad;

        // Obtener deuda pendiente del cliente
        const deudaAnterior = cliente.deudaAcumulada || 0;

        const articulosConImportes = await Promise.all(
          clienteArticulo.articulos.map(async (articulo) => {
            const articuloInfo = todosLosArticulos.find((a) =>
              a._id.equals(articulo.articulo)
            );
            if (!articuloInfo) {
              throw new Error(
                `Artículo con ID ${articulo.articulo} no encontrado`
              );
            }

            const precioInfo = articuloInfo.precios.find((p) =>
              p.localidad.equals(localidadCliente)
            );
            if (!precioInfo) {
              throw new Error(
                `No se encontró un precio para la localidad con ID ${localidadCliente}`
              );
            }

            const precioUnitario = precioInfo.precio;
            const cantidad = parseInt(articulo.cantidad, 10);

            if (isNaN(cantidad)) {
              throw new Error(
                `Cantidad del artículo con ID ${articulo.articulo} es inválida`
              );
            }

            const importeSinDescuento = cantidad * precioUnitario;
            const descuento = cliente.descuento || 0;
            const importeConDescuento =
              importeSinDescuento - (importeSinDescuento * descuento) / 100;
            totalCliente += importeConDescuento;

            const nombreProducto = articuloInfo.nombre;
            const cantidadActual =
              cantidadTotalPorProducto.get(nombreProducto) || 0;
            cantidadTotalPorProducto.set(
              nombreProducto,
              cantidadActual + cantidad
            );

            return {
              articuloId: articulo.articulo,
              nombre: nombreProducto,
              cantidad: cantidad,
              importe: importeConDescuento,
              precioUnitario: precioUnitario,
              cantidadDevuelta: articulo.cantidadDevuelta || 0,
            };
          })
        );

        // Calcular la deuda del reparto actual
        const montoPagado = clienteArticulo.montoPagado || 0;
        const deudaActual = totalCliente - montoPagado;
        const deudaPendiente = deudaAnterior + deudaActual;

        totalCliente += deudaAnterior;
        totalReparto += totalCliente;

        return {
          clienteId: clienteArticulo.cliente,
          localidad: localidadCliente,
          articulos: articulosConImportes,
          totalCliente: totalCliente,
          deudaAnterior: deudaAnterior,
          deuda: deudaPendiente, // Guardar la deuda pendiente
          cantidadDevuelta: clienteArticulo.cantidadDevuelta || 0,
          devoluciones: clienteArticulo.devoluciones || [],
          pagadoCompleto: clienteArticulo.pagadoCompleto || false,
          montoPagado: montoPagado,
        };
      })
    );

    const nuevoNumeroPedido = await obtenerSiguienteNumeroPedido();

    const repartoAlmacenado = new Repartos({
      clientesArticulos: clientesArticulosConImportes,
      totalReparto: parseFloat(totalReparto.toFixed(2)),
      cantidadTotalPorProducto: Object.fromEntries(cantidadTotalPorProducto),
      cantidadDevueltaTotal: clientesArticulosConImportes.reduce(
        (acc, cliente) => acc + cliente.cantidadDevuelta,
        0
      ),
      fecha: new Date(fecha),
      repartidor: repartidor,
      alias,
      numeroPedido: nuevoNumeroPedido,
    });

    await repartoAlmacenado.save();

    // Actualizar deuda acumulada de los clientes
    await Promise.all(
      clientesArticulos.map(async (clienteArticulo) => {
        const cliente = await Cliente.findById(clienteArticulo.cliente);
        const nuevoTotalDeuda = clienteArticulo.deuda || 0; // Actualizar con la deuda pendiente
        await Cliente.findByIdAndUpdate(clienteArticulo.cliente, {
          deudaAcumulada: nuevoTotalDeuda,
        });
      })
    );
    res.json(repartoAlmacenado);
  } catch (error) {
    console.error("Error al crear el reparto:", error);
    res.status(500).json({
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

const actualizarReparto = async (req, res) => {
  try {
    const repartoId = req.params.repartoId;
    const { clientesArticulos, fecha, repartidor, alias } = req.body;

    // Verificación básica de datos
    if (!clientesArticulos || !fecha) {
      return res.status(400).json({ message: "Faltan datos necesarios" });
    }

    // Buscar el reparto existente
    const repartoExistente = await Repartos.findById(repartoId);
    if (!repartoExistente) {
      return res.status(404).json({ mensaje: "Reparto no encontrado" });
    }

    // Obtener todos los artículos y sus precios
    const todosLosArticulos = await Articulos.find().populate(
      "precios.localidad"
    );

    let totalReparto = 0;
    const cantidadTotalPorProducto = new Map();

    // Calcular los importes y cantidades
    const clientesArticulosConImportes = await Promise.all(
      clientesArticulos.map(async (clienteArticulo) => {
        const clienteId = clienteArticulo.cliente;
        if (!clienteId) {
          console.error("ID de cliente es undefined");
          throw new Error("ID de cliente es undefined");
        }

        const cliente = await Cliente.findById(clienteId);
        if (!cliente) {
          throw new Error(`Cliente con ID ${clienteId} no encontrado`);
        }

        let totalCliente = 0;
        const localidadCliente = cliente.localidad;
        const deudaAnterior = cliente.deudaAcumulada || 0;

        const articulosConImportes = await Promise.all(
          clienteArticulo.articulos.map(async (articulo) => {
            const articuloId = articulo.articulo;
            if (!articuloId) {
              console.error("ID de artículo es undefined");
              throw new Error("ID de artículo es undefined");
            }

            const articuloInfo = todosLosArticulos.find((a) =>
              a._id.equals(articuloId)
            );
            if (!articuloInfo) {
              throw new Error(`Artículo con ID ${articuloId} no encontrado`);
            }

            const precioInfo = articuloInfo.precios.find((p) =>
              p.localidad.equals(localidadCliente)
            );
            if (!precioInfo) {
              throw new Error(
                `No se encontró un precio para la localidad con ID ${localidadCliente}`
              );
            }

            const precioUnitario = precioInfo.precio;
            const cantidad = parseInt(articulo.cantidad, 10);
            if (isNaN(cantidad) || cantidad <= 0) {
              console.error(
                "Cantidad de artículo inválida:",
                articulo.cantidad
              );
              throw new Error("Cantidad de artículo inválida");
            }

            const importeSinDescuento = cantidad * precioUnitario;
            const descuento = cliente.descuento || 0;
            const importeConDescuento =
              importeSinDescuento - (importeSinDescuento * descuento) / 100;

            totalCliente += importeConDescuento;

            const nombreProducto = articuloInfo.nombre;
            const cantidadActual =
              cantidadTotalPorProducto.get(nombreProducto) || 0;
            cantidadTotalPorProducto.set(
              nombreProducto,
              cantidadActual + cantidad
            );

            return {
              articuloId: articuloId,
              nombre: nombreProducto,
              cantidad,
              importe: importeConDescuento,
              precioUnitario,
              cantidadDevuelta: articulo.cantidadDevuelta || 0,
            };
          })
        );

        const montoPagado = clienteArticulo.montoPagado || 0;
        const deudaActual = totalCliente - montoPagado;
        const deudaPendiente = deudaAnterior + deudaActual;

        totalCliente += deudaAnterior;
        totalReparto += totalCliente;

        return {
          clienteId: clienteId,
          localidad: localidadCliente,
          articulos: articulosConImportes,
          totalCliente,
          deudaAnterior,
          deuda: deudaPendiente,
          cantidadDevuelta: clienteArticulo.cantidadDevuelta || 0,
          devoluciones: clienteArticulo.devoluciones || [],
          pagadoCompleto: clienteArticulo.pagadoCompleto || false,
          montoPagado,
        };
      })
    );

    // Actualizar el reparto con los datos calculados
    const repartosActualizados = await Repartos.findByIdAndUpdate(
      repartoId,
      {
        $set: {
          clientesArticulos: clientesArticulosConImportes,
          totalReparto: parseFloat(totalReparto.toFixed(2)),
          cantidadTotalPorProducto: Object.fromEntries(
            cantidadTotalPorProducto
          ),
          cantidadDevueltaTotal: clientesArticulosConImportes.reduce(
            (acc, cliente) => acc + cliente.cantidadDevuelta,
            0
          ),
          fecha: new Date(fecha),
          repartidor,
          alias,
        },
      },
      { new: true, runValidators: true }
    );

    if (!repartosActualizados) {
      return res.status(404).json({ mensaje: "No se encontró el reparto" });
    }

    // Actualizar la deuda acumulada de los clientes
    await Promise.all(
      clientesArticulos.map(async (clienteArticulo) => {
        const nuevoTotalDeuda = clienteArticulo.deuda || 0;
        await Cliente.findByIdAndUpdate(clienteArticulo.cliente, {
          deudaAcumulada: nuevoTotalDeuda,
        });
      })
    );

    res.status(200).json(repartosActualizados);
  } catch (error) {
    console.error("Error al actualizar el reparto:", error);
    res.status(500).json({
      mensaje: "Error al actualizar el reparto",
      error: error.message,
    });
  }
};

const actualizarPagoCompleto = async (req, res) => {
  const { repartoId, clienteId } = req.params;
  const { pagadoCompleto, montoPagado, deuda } = req.body;

  console.log(
    `RepartoId: ${repartoId}, ClienteId: ${clienteId}, PagadoCompleto: ${pagadoCompleto}, MontoPagado: ${montoPagado}, Deuda: ${deuda}`
  );

  try {
    if (!repartoId || !clienteId) {
      return res.status(400).json({ message: "Faltan parámetros necesarios" });
    }

    const reparto = await Repartos.findById(repartoId);
    if (!reparto) {
      return res.status(404).json({ message: "Reparto no encontrado" });
    }

    const clienteArticulo = reparto.clientesArticulos.find(
      (ca) => ca.clienteId.toString() === clienteId
    );
    if (!clienteArticulo) {
      return res
        .status(404)
        .json({ message: "Cliente no encontrado en el reparto" });
    }

    clienteArticulo.pagadoCompleto = pagadoCompleto;
    clienteArticulo.montoPagado = montoPagado;
    clienteArticulo.deuda = deuda; // Guardar la deuda enviada desde el frontend

    await reparto.save();

    // Actualizar deuda acumulada del cliente
    const cliente = await Cliente.findById(clienteId);
    if (cliente) {
      cliente.deudaAcumulada = deuda;
      await cliente.save();
    }

    // Llamar a la función para actualizar repartos futuros
    await actualizarDeudaEnRepartosFuturos(clienteId, deuda, reparto.fecha);

    res.json({ message: "Estado de pago actualizado correctamente", reparto });
  } catch (error) {
    console.error("Error al actualizar el estado de pago:", error);
    res.status(500).json({
      message: "Error al actualizar el estado de pago",
      error: error.message,
    });
  }
};

const actualizarMontoPagado = async (req, res) => {
  const { repartoId, clienteId } = req.params;
  const { montoPagado, deuda } = req.body;
  console.log(`monto pagado: ${montoPagado}, deuda: ${deuda}`);

  try {
    const reparto = await Repartos.findById(repartoId);
    if (!reparto) {
      return res.status(404).json({ message: "Reparto no encontrado" });
    }

    const clienteArticulo = reparto.clientesArticulos.find(
      (ca) => ca.clienteId.toString() === clienteId
    );
    if (!clienteArticulo) {
      return res
        .status(404)
        .json({ message: "Cliente no encontrado en este reparto" });
    }

    clienteArticulo.montoPagado = montoPagado;
    clienteArticulo.deuda = deuda; // Guardar la deuda enviada desde el frontend

    await reparto.save();

    // Actualizar deuda acumulada del cliente
    const cliente = await Cliente.findById(clienteId);
    if (cliente) {
      cliente.deudaAcumulada = deuda;
      await cliente.save();
    }

    // Llamar a la función para actualizar repartos futuros
    await actualizarDeudaEnRepartosFuturos(clienteId, deuda, reparto.fecha);

    res.json({ message: "Monto pagado y deuda actualizados", reparto });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar el monto pagado",
      error: error.message,
    });
  }
};

const actualizarDeudaEnRepartosFuturos = async (
  clienteId,
  deuda,
  fechaRepartoActual
) => {
  try {
    // Paso 1: Buscar repartos futuros del cliente, ordenados por fecha
    const repartosFuturos = await Repartos.find({
      "clientesArticulos.clienteId": clienteId,
      fecha: { $gt: fechaRepartoActual },
    }).sort({ fecha: 1 });

    // Paso 2: Si existe un reparto futuro, asignar la deuda al más cercano
    if (repartosFuturos.length > 0) {
      const repartoMasCercano = repartosFuturos[0]; // El primer reparto más cercano en el tiempo
      repartoMasCercano.clientesArticulos.forEach((cliente) => {
        if (cliente.clienteId.equals(clienteId)) {
          cliente.deudaAnterior += deuda;
        }
      });

      // Guardar el reparto actualizado
      await repartoMasCercano.save();
    }
  } catch (error) {
    console.error("Error al actualizar la deuda en repartos futuros", error);
  }
};

const actualizarCantidadDevuelta = async (req, res) => {
  const { repartoId, clienteId, articuloId } = req.params;
  const { cantidadDevuelta, deuda, fechaDevolucion } = req.body;
  console.log(
    `cantidad devuelta: ${cantidadDevuelta}, deuda: ${deuda}, fechaDevolucion: ${fechaDevolucion}`
  );

  try {
    const reparto = await Repartos.findById(repartoId);
    if (!reparto) {
      return res.status(404).json({ message: "Reparto no encontrado" });
    }

    const clienteArticulo = reparto.clientesArticulos.find(
      (ca) => ca.clienteId && ca.clienteId.toString() === clienteId
    );

    if (!clienteArticulo) {
      return res
        .status(404)
        .json({ message: "Cliente no encontrado en este reparto" });
    }

    const articulo = clienteArticulo.articulos.find(
      (art) => art.articuloId.toString() === articuloId
    );

    if (!articulo) {
      return res
        .status(404)
        .json({ message: "Artículo no encontrado en el reparto del cliente" });
    }

    const precioUnitario = articulo.importe / articulo.cantidad;
    articulo.cantidadDevuelta = cantidadDevuelta;
    articulo.importe = (articulo.cantidad - cantidadDevuelta) * precioUnitario;

    // Recalcular totalCliente y deuda después de actualizar la cantidad devuelta
    clienteArticulo.totalCliente = clienteArticulo.articulos.reduce(
      (acc, art) => acc + art.importe,
      0
    );
    clienteArticulo.deuda = Math.max(
      clienteArticulo.totalCliente - clienteArticulo.montoPagado,
      0
    );
    clienteArticulo.fechaDevolucion = fechaDevolucion; // Asegúrate de manejar la fecha de devolución si es necesario

    // Recalcular totalReparto después de actualizar los valores del cliente
    reparto.totalReparto = reparto.clientesArticulos.reduce(
      (acc, cliente) => acc + cliente.totalCliente,
      0
    );

    await reparto.save();

    // Actualizar deuda acumulada del cliente
    const cliente = await Cliente.findById(clienteId);
    if (cliente) {
      cliente.deudaAcumulada = clienteArticulo.deuda;
      await cliente.save();
    }

    res.json({
      message: "Cantidad devuelta, total cliente y deuda actualizadas",
      reparto,
    });
  } catch (error) {
    console.error("Error al actualizar la cantidad devuelta:", error);
    res.status(500).json({
      message: "Error al actualizar la cantidad devuelta",
      error: error.message,
    });
  }
};

// Función para actualizar la deuda del cliente
const actualizarDeudaCliente = async (clienteId, deuda) => {
  try {
    const cliente = await Cliente.findById(clienteId);
    if (cliente) {
      cliente.deuda = deuda;
      await cliente.save();
      console.log(`Deuda actualizada para clienteId=${clienteId}`);
    } else {
      console.error(`Cliente no encontrado para clienteId=${clienteId}`);
    }
  } catch (error) {
    console.error(`Error al actualizar la deuda del cliente: ${error}`);
    throw error;
  }
};

const registrarDevolucion = async (req, res) => {
  const { repartoId, clienteId, articuloId } = req.params;
  const { cantidadDevuelta, deuda, fechaDevolucion } = req.body;
  try {
    // Actualizar la devolución en la base de datos
    await Repartos.findByIdAndUpdate(repartoId, {
      $push: {
        [`clientes.${clienteId}.devoluciones`]: {
          articuloId,
          cantidadDevuelta,
          fechaDevolucion,
        },
      },
    });

    // Actualizar la deuda del cliente
    await actualizarDeudaCliente(clienteId, deuda);

    res.status(200).json({ mensaje: "Devolución registrada exitosamente" });
  } catch (error) {
    console.error(`Error al registrar la devolución: ${error}`);
    res.status(500).json({ error: "Error al registrar la devolución" });
  }
};

const eliminarReparto = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Intentando eliminar el reparto con ID: ${id}`);

    const repartoEliminado = await Repartos.findByIdAndDelete(id);

    if (!repartoEliminado) {
      console.log(`Reparto con ID ${id} no encontrado`);
      return res.status(404).json({ error: "Reparto no encontrado" });
    }

    console.log(`Reparto con ID ${id} eliminado correctamente`);
    res.json({ message: "Reparto eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar el reparto:", error);
    res.status(500).json({ error: "Hubo un error al eliminar el reparto" });
  }
};

export {
  verRepartosFecha,
  verRepartos,
  obtenerDeudaPendiente,
  crearReparto,
  actualizarReparto,
  actualizarPagoCompleto,
  actualizarMontoPagado,
  actualizarCantidadDevuelta,
  eliminarReparto,
  obtenerRepartoDetalles,
  registrarDevolucion,
  actualizarDeudaCliente,
};
