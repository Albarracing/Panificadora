import Cliente from "../models/Clientes.js";
import ArticuloCliente from "../models/ArticulosCliente.js";

const registrar = async (req, res) => {
  try {
    const { articuloData, ...clienteData } = req.body;

    const cliente = new Cliente(clienteData);
    await cliente.save();

    if (articuloData && articuloData.length > 0) {
      const articulos = articuloData.map((articulo) => ({
        ...articulo,
        clienteId: cliente._id,
      }));
      await ArticuloCliente.insertMany(articulos);
    }

    res.status(201).json(cliente);
  } catch (error) {
    res.status(500).json({ error: "Error al registrar el cliente" });
  }
};

const actualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { articuloData, ...clienteData } = req.body;

    // Actualizar los datos del cliente
    const cliente = await Cliente.findByIdAndUpdate(id, clienteData, {
      new: true,
    });

    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    if (articuloData) {
      // Eliminar todos los artículos existentes para el cliente
      await ArticuloCliente.deleteMany({ clienteId: id });

      // Filtrar los artículos cuyo cantidad en todos los días sea mayor que 0
      const articulosFiltrados = articuloData.filter((articulo) => {
        const { lunes, martes, miercoles, jueves, viernes, sabado, domingo } =
          articulo.cantidad;

        // Retornar solo artículos que tengan al menos un día con cantidad mayor que 0
        return (
          lunes > 0 ||
          martes > 0 ||
          miercoles > 0 ||
          jueves > 0 ||
          viernes > 0 ||
          sabado > 0 ||
          domingo > 0
        );
      });

      // Insertar los artículos filtrados si hay alguno
      if (articulosFiltrados.length > 0) {
        const articulos = articulosFiltrados.map((articulo) => ({
          ...articulo,
          clienteId: id,
        }));
        await ArticuloCliente.insertMany(articulos);
      }
    }

    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el cliente" });
  }
};

// const actualizarCliente = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { articuloData, ...clienteData } = req.body;

//     const cliente = await Cliente.findByIdAndUpdate(id, clienteData, {
//       new: true,
//     });

//     if (!cliente) {
//       return res.status(404).json({ error: "Cliente no encontrado" });
//     }

//     if (articuloData) {
//       // Delete existing articles for the client
//       await ArticuloCliente.deleteMany({ clienteId: id });

//       // Insert updated articles
//       const articulos = articuloData.map((articulo) => ({
//         ...articulo,
//         clienteId: id,
//       }));
//       await ArticuloCliente.insertMany(articulos);
//     }

//     res.json(cliente);
//   } catch (error) {
//     res.status(500).json({ error: "Error al actualizar el cliente" });
//   }
// };

// Ejemplo de controlador en el backend
const eliminarArticuloCliente = async (req, res) => {
  const { id } = req.params; // Asegúrate de que el id viene del parámetro

  // Limpiar el ID de caracteres innecesarios
  const cleanedId = id.trim(); // Eliminar espacios en blanco y caracteres de nueva línea

  try {
    const resultado = await ArticuloCliente.findOneAndDelete({
      _id: cleanedId,
    });

    if (!resultado) {
      return res.status(404).json({ msg: "Artículo no encontrado" });
    }

    return res.status(200).json({ msg: "Artículo eliminado correctamente" });
  } catch (error) {
    console.error(error); // Para ayudar en el diagnóstico de errores
    return res.status(500).json({ msg: "Error al eliminar el artículo" });
  }
};

export { actualizarCliente, registrar, eliminarArticuloCliente };
