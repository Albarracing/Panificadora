import React, { useEffect, useState } from "react";
import Alerta from "./Alerta";
import useClientes from "../hook/useClientes";
import axios from "axios";

const FormularioCliente = ({ onClose }) => {
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [direccion, setDireccion] = useState("");
  const [celular, setCelular] = useState("");
  const [localidadId, setLocalidadId] = useState("");
  const [localidadNombre, setLocalidadNombre] = useState("");
  const [descuento, setDescuento] = useState("");
  const [vuelta, setVuelta] = useState("");
  const [tipoCliente, setTipoCliente] = useState("lista");
  const [productos, setProductos] = useState([]);
  const [articulosDisponibles, setArticulosDisponibles] = useState([]);
  const [articulosSeleccionados, setArticulosSeleccionados] = useState([]);
  const [alerta, setAlerta] = useState({});
  const [id, setId] = useState(null);
  const { guardarCliente, actualizarCliente } = useClientes();
  const [localidades, setLocalidades] = useState([]);
  const { obtenerCliente, cliente, articulos, obtenerArticulosCliente } =
    useClientes();

  useEffect(() => {
    if (id) {
      obtenerCliente(id); // Obtener cliente y artículos cuando id cambia
    }
  }, [id]);

  useEffect(() => {
    if (cliente?._id) {
      setCodigo(cliente.codigo || "");
      setNombre(cliente.nombre);
      setApellido(cliente.apellido);
      setDireccion(cliente.direccion);
      setCelular(cliente.celular);
      if (cliente.localidad) {
        // Verifica que cliente.localidad exista
        setLocalidadId(cliente.localidad._id || "");
        setLocalidadNombre(cliente.localidad.nombre || "");
      } else {
        setLocalidadId(""); // Si no existe, lo reinicia
        setLocalidadNombre("");
      }
      setDescuento(cliente.descuento);
      setVuelta(cliente.vuelta);
      setTipoCliente(cliente.tipoCliente || "lista");
      setId(cliente._id);

      // Obtener los artículos del cliente
      obtenerArticulosCliente(cliente._id)
        .then((articulosCliente) => {
          // Obtener todos los artículos disponibles
          axios
            .get(`http://localhost:3000/api/articulos`)
            .then((response) => {
              const articulosDisponibles = response.data;

              // Combinar artículos del cliente con los disponibles
              const articulosCombinados = articulosDisponibles.map(
                (articuloDisponible) => {
                  // Buscar el artículo en los artículos del cliente
                  const articuloCliente = articulosCliente.find(
                    (articulo) => articulo.articuloId === articuloDisponible._id
                  );

                  return {
                    _id: articuloDisponible._id,
                    nombre: articuloDisponible.nombre,
                    cantidad: articuloCliente
                      ? articuloCliente.cantidad
                      : {
                          lunes: 0,
                          martes: 0,
                          miercoles: 0,
                          jueves: 0,
                          viernes: 0,
                          sabado: 0,
                          domingo: 0,
                        },
                    descuento: articuloCliente
                      ? articuloCliente.descuentoPorArt || 0
                      : 0,
                  };
                }
              );

              setProductos(articulosCombinados);
            })
            .catch((error) => {
              console.error(
                "Error al cargar los artículos disponibles:",
                error
              );
            });
        })
        .catch((error) => {
          console.error("Error al cargar los artículos del cliente:", error);
        });
    }
  }, [cliente]);

  useEffect(() => {
    const obtenerLocalidades = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/localidades"
        );
        setLocalidades(response.data); // Actualiza el estado con las localidades obtenidas del backend
      } catch (error) {
        console.log(error);
      }
    };
    obtenerLocalidades();
  }, []);

  const handleLocalidadChange = (e) => {
    const localidadId = e.target.value;
    const localidad = localidades.find((loc) => loc._id === localidadId);
    if (localidad) {
      setLocalidadId(localidadId);
      setLocalidadNombre(localidad.nombre); // Actualiza el nombre de la localidad seleccionada
    }
  };

  useEffect(() => {
    const obtenerProductos = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/api/articulos");
        setProductos((prevProductos) =>
          prevProductos.length === 0
            ? data.map((producto) => ({
                ...producto,
                articuloId: producto._id,
                cantidad: {
                  lunes: 0,
                  martes: 0,
                  miercoles: 0,
                  jueves: 0,
                  viernes: 0,
                  sabado: 0,
                  domingo: 0,
                },
              }))
            : prevProductos
        );
      } catch (error) {
        console.log(error);
      }
    };
    obtenerProductos();
  }, []);

  useEffect(() => {
    if (!id) {
      const obtenerCodigo = async () => {
        try {
          const { data } = await axios.get(
            "http://localhost:3000/api/clientes/"
          );
          setCodigo(data.codigo); // Obtener el código generado desde el backend
        } catch (error) {
          console.log(error);
        }
      };
      obtenerCodigo();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que todos los campos necesarios estén presentes y sean válidos
    console.log("Validando campos...");
    if (
      [
        direccion,
        celular,
        localidadId,
        localidadNombre,
        descuento,
        vuelta,
        tipoCliente,
      ].some((campo) => typeof campo === "string" && campo.trim() === "") ||
      !localidadId ||
      !localidadNombre
    ) {
      setAlerta({
        msg: "Todos los campos son obligatorios, excepto nombre y apellido.",
        error: true,
      });
      return;
    }

    // Construir clienteData
    const clienteData = {
      nombre,
      apellido,
      direccion,
      celular,
      localidadId,
      localidadNombre,
      descuento,
      vuelta,
      tipoCliente,
      articuloData: productos.map((producto) => {
        const cantidad = {
          lunes: producto.cantidad.lunes || 0,
          martes: producto.cantidad.martes || 0,
          miercoles: producto.cantidad.miercoles || 0,
          jueves: producto.cantidad.jueves || 0,
          viernes: producto.cantidad.viernes || 0,
          sabado: producto.cantidad.sabado || 0,
          domingo: producto.cantidad.domingo || 0,
        };
        console.log(`Artículo: ${producto.nombre}, Cantidad:`, cantidad);
        return {
          articuloId: producto._id,
          nombre: producto.nombre,
          cantidad: cantidad,
          descuento: producto.descuento,
        };
      }),
    };

    console.log("Datos a enviar:", clienteData);

    try {
      // Actualizar cliente
      const response = await actualizarCliente(clienteData, id);
      console.log("Respuesta del backend:", response);
      setAlerta({
        msg: `Cliente actualizado correctamente`,
        error: false,
      });

      // Resetear el formulario
      resetFormulario();
      onClose();
    } catch (error) {
      const mensajeError =
        error.response && error.response.data
          ? error.response.data
          : "Hubo un error al guardar el cliente. Por favor, inténtalo de nuevo.";

      console.error("Error al guardar el cliente:", mensajeError);
      setAlerta({
        msg: mensajeError,
        error: true,
      });
    }
  };

  const handleCantidadChange = (e, productoId, dia) => {
    const value = parseFloat(e.target.value); // parseFloat para manejar decimales

    // Actualizar la cantidad del producto seleccionado para el día específico
    setProductos((prevProductos) =>
      prevProductos.map((producto) =>
        producto._id === productoId
          ? {
              ...producto,
              cantidad: {
                ...producto.cantidad,
                [dia]: value || 0, // Usar el valor directamente, permitiendo decimales
              },
            }
          : producto
      )
    );
  };

  const resetFormulario = () => {
    setCodigo("");
    setNombre("");
    setApellido("");
    setDireccion("");
    setCelular("");
    setLocalidadId("");
    setLocalidadNombre("");
    setDescuento("");
    setVuelta("");
    setTipoCliente("lista");
    setProductos([]);
    setArticulosDisponibles([]);
    setArticulosSeleccionados([]);
    setId(null);
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   // Validar que todos los campos necesarios estén presentes y sean válidos
  //   if (
  //     [
  //       direccion,
  //       celular,
  //       localidadId,
  //       localidadNombre,
  //       descuento,
  //       vuelta,
  //       tipoCliente,
  //     ].some((campo) => typeof campo === "string" && campo.trim() === "") ||
  //     !localidadId ||
  //     !localidadNombre
  //   ) {
  //     setAlerta({
  //       msg: "Todos los campos son obligatorios, excepto nombre y apellido.",
  //       error: true,
  //     });
  //     return;
  //   }

  //   const clienteData = {
  //     nombre,
  //     apellido,
  //     direccion,
  //     celular,
  //     localidadId,
  //     localidadNombre,
  //     descuento,
  //     vuelta,
  //     tipoCliente,
  //     articuloData: [
  //       ...productos
  //         .map((producto) => ({
  //           articuloId: producto._id,
  //           nombre: producto.nombre,
  //           cantidad: producto.cantidad,
  //           descuento: producto.descuento,
  //         }))
  //         .filter((articulo) => {
  //           // Filtrar artículos con al menos una cantidad mayor a 0
  //           return Object.values(articulo.cantidad).some(
  //             (cantidad) => cantidad > 0
  //           );
  //         }),
  //       ...articulosSeleccionados.map((articuloId) => ({
  //         articuloId,
  //         nombre: articulosDisponibles.find((art) => art._id === articuloId)
  //           .nombre,
  //         cantidad: {
  //           lunes: 0,
  //           martes: 0,
  //           miercoles: 0,
  //           jueves: 0,
  //           viernes: 0,
  //           sabado: 0,
  //           domingo: 0,
  //         },
  //       })),
  //     ].filter((articulo) => {
  //       // Filtrar artículos con al menos una cantidad > 0
  //       return Object.values(articulo.cantidad).some(
  //         (cantidad) => cantidad > 0
  //       );
  //     }),
  //   };

  //   // Validar la estructura de clienteData
  //   if (!clienteData.articuloData.length) {
  //     setAlerta({
  //       msg: "Debe haber al menos un artículo con cantidad mayor a 0",
  //       error: true,
  //     });
  //     return;
  //   }

  //   console.log("Datos antes de enviar:", clienteData.articuloData);
  //   console.log("Datos a enviar:", clienteData);

  //   try {
  //     for (const producto of productos) {
  //       if (todosLosDiasEnCero(producto.cantidad)) {
  //         await eliminarArticuloSiCantidadCero(
  //           id,
  //           producto._id,
  //           producto.cantidad
  //         ); // Asegúrate de pasar la cantidad aquí
  //       }
  //     }

  //     // Decidir la función a llamar según si es creación o actualización
  //     const response = id
  //       ? await actualizarCliente(clienteData, id) // Actualizar
  //       : await guardarCliente(clienteData); // Crear

  //     setAlerta({
  //       msg: `Cliente ${id ? "actualizado" : "guardado"} correctamente`,
  //       error: false,
  //     });

  //     // Resetear el formulario
  //     setCodigo("");
  //     setNombre("");
  //     setApellido("");
  //     setDireccion("");
  //     setCelular("");
  //     setLocalidadId("");
  //     setLocalidadNombre("");
  //     setDescuento("");
  //     setVuelta("");
  //     setTipoCliente("lista");
  //     setProductos([]);
  //     setArticulosDisponibles([]);
  //     setArticulosSeleccionados([]);
  //     setId(null);
  //     onClose();
  //   } catch (error) {
  //     const mensajeError =
  //       error.response && error.response.data
  //         ? error.response.data
  //         : "Hubo un error al guardar el cliente. Por favor, inténtalo de nuevo.";

  //     console.error("Error al guardar el cliente:", mensajeError);
  //     setAlerta({
  //       msg: mensajeError,
  //       error: true,
  //     });
  //   }
  // };

  // const todosLosDiasEnCero = (cantidad) => {
  //   return Object.values(cantidad).every((valor) => valor === 0);
  // };

  // const eliminarArticuloSiCantidadCero = async (
  //   clienteId,
  //   articuloId,
  //   cantidad
  // ) => {
  //   try {
  //     // Verificar si la cantidad es cero antes de eliminar
  //     const esCantidadCero = Object.values(cantidad).every(
  //       (cant) => cant === 0
  //     );

  //     if (esCantidadCero) {
  //       await axios.delete(
  //         `http://localhost:3000/api/articulos-clientes/articulo/${articuloId}`
  //       );
  //       console.log(
  //         `Artículo con ID ${articuloId} eliminado para el cliente ${clienteId}`
  //       );
  //     } else {
  //       console.log(
  //         `No se puede eliminar el artículo con ID ${articuloId} porque tiene cantidades mayores que cero.`
  //       );
  //     }
  //   } catch (error) {
  //     console.log("Error al eliminar el artículo:", error);
  //   }
  // };

  // const handleCantidadChange = (e, productoId, dia) => {
  //   const value = parseFloat(e.target.value); // parseFloat directamente sobre el valor
  //   // Actualizar la cantidad del producto seleccionado para el día específico
  //   setProductos((prevProductos) =>
  //     prevProductos.map((producto) =>
  //       producto._id === productoId
  //         ? {
  //             ...producto,
  //             cantidad: {
  //               ...producto.cantidad,
  //               [dia]: value || 0, // Usar el valor directamente, permitiendo decimales
  //             },
  //           }
  //         : producto
  //     )
  //   );
  // };

  const handleDescuentoChange = (e, productoId) => {
    const { value } = e.target;
    setProductos((prevProductos) =>
      prevProductos.map((producto) =>
        producto._id === productoId
          ? { ...producto, descuento: value }
          : producto
      )
    );
  };

  const handleArticuloSeleccionChange = (articuloId) => {
    setArticulosSeleccionados((prevSeleccionados) =>
      prevSeleccionados.includes(articuloId)
        ? prevSeleccionados.filter((id) => id !== articuloId)
        : [...prevSeleccionados, articuloId]
    );
  };

  return (
    <>
      <form
        className="p-3 bg-white rounded-lg overflow-y-auto max-h-screen"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-semibold mb-6 col-span-full items-center">
          {id ? "Editar cliente" : "Crear cliente"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="uppercase text-gray-600 text-sm font-bold">
              Cod
            </label>
            <input
              type="text"
              className="border w-full h-10 bg-white rounded-lg p-2 mt-1"
              value={codigo}
              readOnly
            />
          </div>
          <div>
            <label className="uppercase text-gray-600 text-sm font-bold">
              Nombre
            </label>
            <input
              type="text"
              placeholder="Nombre del cliente"
              className="border w-full h-10 bg-white rounded-lg p-2 mt-1"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div>
            <label className="uppercase text-gray-600 text-sm font-bold">
              Apellido
            </label>
            <input
              type="text"
              placeholder="Apellido del cliente"
              className="border w-full h-10 bg-white rounded-lg p-2 mt-1"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label
              htmlFor={`localidad-${cliente?._id}`}
              className="uppercase text-gray-600 text-sm font-bold"
            >
              Localidad
            </label>
            <select
              id="localidad"
              value={localidadId}
              onChange={handleLocalidadChange}
              className="border w-full h-10 bg-white rounded-lg mt-2"
            >
              <option value="">Seleccionar localidad</option>
              {localidades.map((localidad) => (
                <option key={localidad._id} value={localidad._id}>
                  {localidad.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="uppercase text-gray-600 text-sm font-bold">
              Dirección
            </label>
            <input
              type="text"
              placeholder="Direccion"
              className="border w-full h-10 bg-white rounded-lg p-2 mt-1"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
            />
          </div>
          <div>
            <label className="uppercase text-gray-600 text-sm font-bold">
              Celular
            </label>
            <input
              type="number"
              placeholder="Celular"
              className="border w-full h-10 bg-white rounded-lg p-2 mt-1"
              value={celular}
              onChange={(e) => setCelular(e.target.value)}
            />
          </div>
          <div>
            <label className="uppercase text-gray-600 text-sm font-bold">
              Descuento
            </label>
            <input
              type="number"
              placeholder="Descuento"
              className="border w-full h-10 bg-white rounded-lg p-2 mt-1"
              value={descuento}
              onChange={(e) => setDescuento(e.target.value)}
            />
          </div>
          <div>
            <label className="uppercase text-gray-600 text-sm font-bold">
              Vuelta
            </label>
            <input
              type="number"
              placeholder="Nro de Vuelta"
              className="border w-full h-10 bg-white rounded-lg p-2 mt-1"
              value={vuelta}
              onChange={(e) => setVuelta(e.target.value)}
            />
          </div>
          <div>
            <label className="uppercase text-gray-600 text-sm font-bold">
              Tipo de cliente
            </label>
            <div className="flex mt-1">
              <button
                type="button"
                className={`w-1/2 h-10 rounded-l-lg p-2 transition-colors duration-300 ease-in-out ${
                  tipoCliente === "lista"
                    ? "bg-blue-500 text-white shadow-lg"
                    : "bg-white text-gray-800 border"
                }`}
                onClick={() => setTipoCliente("lista")}
              >
                Lista
              </button>
              <button
                type="button"
                className={`w-1/2 h-10 rounded-r-lg p-2 transition-colors duration-300 ease-in-out ${
                  tipoCliente === "individual"
                    ? "bg-blue-500 text-white shadow-lg"
                    : "bg-white text-gray-800 border"
                }`}
                onClick={() => setTipoCliente("individual")}
              >
                Individual
              </button>
            </div>
          </div>
        </div>
        <div className="mt-5">
          <h2 className="uppercase text-gray-600 text-sm font-bold">
            Seleccione los productos:
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>

                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descuento (%)
                  </th>
                  {[
                    "lunes",
                    "martes",
                    "miercoles",
                    "jueves",
                    "viernes",
                    "sabado",
                    "domingo",
                  ].map((dia) => (
                    <th
                      key={dia}
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {dia.charAt(0).toUpperCase() + dia.slice(1)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productos.map((producto) => (
                  <tr key={producto._id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      {producto.nombre}
                    </td>

                    <td className="px-4 py-2 whitespace-nowrap">
                      <input
                        className="border w-16 h-8 p-1 bg-white rounded-lg text-center"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={producto.descuento || 0} // Aquí añadimos el campo descuento
                        onChange={(e) => handleDescuentoChange(e, producto._id)} // Nueva función para manejar el descuento
                        placeholder="% Descuento"
                      />
                    </td>

                    {[
                      "lunes",
                      "martes",
                      "miercoles",
                      "jueves",
                      "viernes",
                      "sabado",
                      "domingo",
                    ].map((dia) => (
                      <td key={dia} className="px-4 py-2 whitespace-nowrap">
                        <input
                          className="border w-16 h-8 p-1 bg-white rounded-lg text-center"
                          type="number"
                          min="0"
                          step="0.01"
                          value={producto.cantidad[dia]}
                          onChange={(e) =>
                            handleCantidadChange(e, producto._id, dia)
                          }
                          placeholder="0"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end mt-5">
          <input
            type="submit"
            value={id ? "Guardar cambios" : "Crear cliente"}
            className="bg-green-500 w-40 py-3 rounded-lg text-white font-bold hover:cursor-pointer hover:bg-green-700"
          />
          <button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 ml-3 rounded-lg"
          >
            Cerrar
          </button>
        </div>
        {alerta.msg && <Alerta alerta={alerta} />}
      </form>
    </>
  );
};

export default FormularioCliente;
