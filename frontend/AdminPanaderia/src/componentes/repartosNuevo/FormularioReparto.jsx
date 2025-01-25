import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import DatePicker, { registerLocale } from "react-datepicker";
import es from "date-fns/locale/es";
import Modal from "react-modal";
import API_PREFIX from "../../config/api";

const ListaClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [localidades, setLocalidades] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [repartidores, setRepartidores] = useState([]);
  const [alias, setAlias] = useState("");
  const [selectedRepartidor, setSelectedRepartidor] = useState("");
  const [selectedLocalidad, setSelectedLocalidad] = useState("");
  const [clientesSeleccionados, setClientesSeleccionados] = useState([]);
  const [cantidadesEditadas, setCantidadesEditadas] = useState({});
  const { repartoId } = useParams();
  const [articulos, setArticulos] = useState([]);
  const [totalPedido, setTotalPedido] = useState(0);
  const [totalPorCliente, setTotalPorCliente] = useState({});
  const [selectedDay, setSelectedDay] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClienteId, setSelectedClienteId] = useState(null);
  const [articuloAdicional, setArticuloAdicional] = useState("");
  const [cantidadAdicional, setCantidadAdicional] = useState(0);
  const [articulosAdicionales, setArticulosAdicionales] = useState({});
  const [repartoData, setRepartoData] = useState(null);
  const [fechaReparto, setFechaReparto] = useState("");

  const navigate = useNavigate();
  registerLocale("es", es);
  useEffect(() => {
    if (repartoId) {
      obtenerReparto();
    }
  }, [repartoId]);

  const obtenerReparto = async () => {
    try {
      const response = await axios.get(
        `${API_PREFIX}/api/repartos/${repartoId}`
      );
      setRepartoData(response.data);
      console.log("Datos del reparto:", response.data);
    } catch (error) {
      console.error("Error al obtener los datos del reparto:", error);
    }
  };

  useEffect(() => {
    obtenerArticulos();
    obtenerClientesConArticulos();
    obtenerRepartidores();
    obtenerLocalidades();
  }, []);

  useEffect(() => {
    if (selectedLocalidad) {
      const clientesFiltrados = clientes.filter(
        (cliente) => cliente.localidad._id === selectedLocalidad
      );
      setFilteredClientes(clientesFiltrados);
    } else {
      setFilteredClientes(clientes); // Mostrar todos los clientes si no se ha seleccionado una localidad
    }
  }, [selectedLocalidad, clientes]);

  useEffect(() => {
    async function fetchData() {
      try {
        const respuesta = await obtenerClientesConArticulos();
        if (respuesta && respuesta.data) {
          console.log("Datos recibidos del backend:", respuesta.data);
          setClientes(respuesta.data);
          // Seleccionar automáticamente todos los clientes
          const todosLosClientesIds = respuesta.data.map(cliente => cliente._id);
          setClientesSeleccionados(todosLosClientesIds);
        } else {
          console.error("Respuesta inválida del backend:", respuesta);
        }
      } catch (error) {
        console.error("Error al obtener datos del backend", error);
      }
    }
    fetchData();
  }, []);

  const obtenerArticulos = async () => {
    try {
      const response = await axios.get(`${API_PREFIX}/api/articulos`);
      setArticulos(response.data); // Almacena todos los artículos en el estado
    } catch (error) {
      console.error("Error al obtener artículos:", error);
    }
  };

  const obtenerRepartidores = async () => {
    try {
      const response = await axios.get(
        `${API_PREFIX}/api/repartidores`
      );
      setRepartidores(response.data);
    } catch (error) {
      console.error("Error al obtener repartidores:", error);
    }
  };

  const obtenerLocalidades = async () => {
    try {
      const response = await axios.get(
        `${API_PREFIX}/api/localidades/`
      );
      console.log("Localidades obtenidas:", response.data); // Depuración
      setLocalidades(response.data);
    } catch (error) {
      console.error("Error al obtener localidades:", error);
    }
  };

  const obtenerClientesConArticulos = async () => {
    try {
      const response = await axios.get(
        `${API_PREFIX}/api/clientes/clientes-con-articulos`
      );
      console.log("Respuesta de obtenerClientesConArticulos:", response);
      if (!response || !response.data) {
        console.error("Datos de clientes inválidos:", response);
        return;
      }
      return response; // Asegúrate de devolver la respuesta completa
    } catch (error) {
      console.error("Error al obtener clientes con artículos:", error);
    }
  };

  const handleDateChange = async (date) => {
    if (repartoId) {
      console.log(
        "Editando un reparto existente. No se cargarán cantidades basadas en la fecha."
      );
      return; // Salir de la función si estamos editando
    }

    setSelectedDate(date);
    const daysOfWeek = [
      "domingo",
      "lunes",
      "martes",
      "miercoles",
      "jueves",
      "viernes",
      "sabado",
    ];
    const day = daysOfWeek[date.getDay()];
    setSelectedDay(day);

    console.log(`Día seleccionado: ${day}`);

    try {
      const response = await axios.get(
        `${API_PREFIX}/api/clientes/cantidades/${day}`
      );
      const cantidades = response.data;

      console.log("Cantidades obtenidas:", cantidades);

      // Procesar cantidades
      const cantidadesEditadas = {};
      cantidades.forEach((item) => {
        if (!cantidadesEditadas[item.clienteId]) {
          cantidadesEditadas[item.clienteId] = {};
        }
        cantidadesEditadas[item.clienteId][item.nombre] = item.cantidad;
      });

      // Actualizar el estado con las cantidades obtenidas
      setCantidadesEditadas(cantidadesEditadas);
      console.log("Cantidades editadas actualizadas:", cantidadesEditadas);
    } catch (error) {
      console.error("Error al obtener las cantidades:", error);
    }
  };

  // Al cargar los datos del reparto al editar:
  useEffect(() => {
    if (repartoData) {
      // Cargar la fecha del reparto en el formato adecuado para DatePicker
      const fechaReparto = new Date(repartoData.fecha);
      setSelectedDate(fechaReparto); // Actualiza el estado de selectedDate para el DatePicker

      const cantidadesEditadas = {};
      const clientesSeleccionados = [];

      if (Array.isArray(repartoData.clientesArticulos)) {
        repartoData.clientesArticulos.forEach((clienteArticulo) => {
          const clienteId = clienteArticulo.clienteId?._id;

          if (clienteId) {
            // Agregar clienteId a la lista de seleccionados
            clientesSeleccionados.push(clienteId);

            // Inicializar el objeto de cantidades editadas para el cliente si no existe
            if (!cantidadesEditadas[clienteId]) {
              cantidadesEditadas[clienteId] = {};
            }

            if (Array.isArray(clienteArticulo.articulos)) {
              clienteArticulo.articulos.forEach((articulo) => {
                const articuloId =
                  articulo.articuloId?._id || articulo.articuloId; // Manejar ID como string o objeto
                const articuloNombre =
                  articulo.articuloId?.nombre || "Artículo sin nombre"; // Asignar nombre genérico si no existe

                const cantidad = articulo.cantidad || 0; // Asegúrate de que la cantidad sea un número

                if (articuloId) {
                  // Actualizar el objeto de cantidades editadas
                  cantidadesEditadas[clienteId][articuloId] = cantidad;
                } else {
                  console.error(
                    `Artículo inválido para el cliente: ${clienteId}`,
                    articulo
                  );
                }
              });
            } else {
              console.error(
                `Artículos no disponibles para el cliente: ${clienteId}`
              );
            }
          } else {
            console.error(
              `Cliente inválido en clientesArticulos`,
              clienteArticulo
            );
          }
        });

        // Actualizar el estado con las cantidades editadas y los clientes seleccionados
        setCantidadesEditadas(cantidadesEditadas);
        setClientesSeleccionados(clientesSeleccionados);
        console.log("Cantidades editadas cargadas:", cantidadesEditadas);
        console.log("Clientes seleccionados cargados:", clientesSeleccionados);
      } else {
        console.error("ClientesArticulos no es un array o está vacío.");
      }
    }
  }, [repartoData]);

  const handleCantidadChange = (clienteId, articuloId, value) => {
     const cantidadNumerica = parseFloat(value);

    if (isNaN(cantidadNumerica)) {
      console.error(
        `Cantidad inválida para el artículo ${articuloId} del cliente ${clienteId}:`,
        value
      );
      return;
    }

    // Convertimos a strings por si acaso
    const clienteIdStr = String(clienteId);
    const articuloIdStr = String(articuloId);

    // Debugging adicional
    console.log("Cliente ID (string):", clienteIdStr);
    console.log("Artículo ID (string):", articuloIdStr);
    console.log("Cantidad numérica:", cantidadNumerica);

    // Asegurarnos de que estamos actualizando correctamente el estado
    setCantidadesEditadas((prevState) => {
      console.log("Estado previo de cantidadesEditadas:", prevState); // Verifica el estado previo

      return {
        ...prevState,
        [clienteIdStr]: {
          ...prevState[clienteIdStr],
          [articuloIdStr]: cantidadNumerica,
        },
      };
    });
  };

  const handleLocalidadChange = (e) => {
    const localidadId = e.target.value;
    setSelectedLocalidad(localidadId);
    console.log("Localidad seleccionada:", localidadId);

    if (localidadId) {
      const clientesFiltrados = clientes.filter((cliente) => {
        return cliente.localidad && cliente.localidad._id === localidadId;
      });
      console.log("Clientes filtrados:", clientesFiltrados);
      setFilteredClientes(clientesFiltrados);
    } else {
      setFilteredClientes(clientes);
    }
  };

  const handleCheckboxChange = (clienteId) => {
    setClientesSeleccionados((prevSeleccionados) =>
      prevSeleccionados.includes(clienteId)
        ? prevSeleccionados.filter((id) => id !== clienteId)
        : [...prevSeleccionados, clienteId]
    );
  };

  const handleRepartidorChange = (e) => {
    const repartidorId = e.target.value;
    setSelectedRepartidor(repartidorId);
    const repartidorSeleccionado = repartidores.find(
      (rep) => rep._id === repartidorId
    );
    setAlias(repartidorSeleccionado.alias);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verificación de campos
    if (clientesSeleccionados.length === 0) {
      alert(
        "Por favor seleccione al menos un cliente antes de crear el reparto."
      );
      return;
    }
    if (!selectedRepartidor) {
      alert("Por favor seleccione un repartidor antes de crear el reparto.");
      return;
    }

    // Mapeo de clientes seleccionados y sus artículos
    const clientesArticulos = clientesSeleccionados
      .map((clienteId) => {
        if (!clienteId) {
          console.error("Cliente ID es undefined");
          return null;
        }

        const cliente = clientes.find((c) => c._id === clienteId);
        if (!cliente) {
          console.error(`Cliente con ID ${clienteId} no encontrado`);
          return null;
        }

        // Mapeo de artículos
        const articulos = (cliente.articulos || [])
          .map((articulo) => {
            const cantidadEditada =
              cantidadesEditadas[String(clienteId)]?.[
                String(articulo.articuloId._id)
              ] || 0;

            const cantidadPorDefecto = articulo.cantidad[selectedDay] || 0;
            const cantidadTotal =
              cantidadEditada > 0 ? cantidadEditada : cantidadPorDefecto;

            if (cantidadTotal <= 0) return null;

            return {
              articulo: String(articulo.articuloId._id), // Asegúrate de que el ID del artículo sea un string válido
              cantidad: cantidadTotal,
            };
          })
          .filter((art) => art !== null);

        if (articulos.length === 0) return null;

        return {
          cliente: String(clienteId), // Asegúrate de que `clienteId` sea un string válido
          localidad: String(cliente.localidad._id),
          articulos: articulos,
          montoPagado: 0,
          pagadoCompleto: false,
        };
      })
      .filter((ca) => ca !== null && ca.articulos.length > 0);
    // Filtrar clientes sin artículos

    // Verificación final
    if (clientesArticulos.length === 0) {
      alert("No se encontraron artículos para los clientes seleccionados.");
      return;
    }

    // Creación del objeto de datos a enviar
    const data = {
      clientesArticulos: clientesArticulos,
      fecha: selectedDate.toISOString(), // Fecha en formato ISO
      repartidor: String(selectedRepartidor), // ID del repartidor
      alias: alias, // Alias opcional o predeterminado
    };

    try {
      if (repartoId) {
        // Si existe un repartoId, se actualiza el reparto
        console.log("Datos enviados para actualizar:", data);
        console.log("repartoId:", repartoId);
        await axios.put(
          `${API_PREFIX}/api/repartos/${repartoId}`,
          data
        );
        alert("Reparto editado exitosamente");
        navigate("/RepartosNuevo");
      } else {
        // Si no existe un repartoId, se crea un nuevo reparto
        console.log("Datos enviados para crear:", data);
        await axios.post(`${API_PREFIX}/api/repartos`, data);
        alert("Reparto creado exitosamente");
        navigate("/RepartosNuevo");
      }
    } catch (error) {
      // Manejo de errores
      console.error(
        "Error al guardar el reparto:",
        error.response ? error.response.data : error.message
      );
      alert(
        `Error al guardar el reparto: ${
          error.response ? error.response.data.message : error.message
        }`
      );
    }
  };

  const openModal = (clienteId) => {
    setSelectedClienteId(clienteId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedClienteId(null);
    setArticuloAdicional("");
    setCantidadAdicional(0);
  };

  const obtenerArticulosFaltantes = (clienteArticulos) => {
    // Extrae los IDs de los artículos que tiene el cliente
    const articuloIdsCliente = clienteArticulos.map((a) => a.articuloId._id);

    // Filtra los artículos que no están en la lista del cliente
    return articulos.filter((art) => !articuloIdsCliente.includes(art._id));
  };

  const handleArticuloAdicionalChange = (articuloId, cantidad) => {
     const cantidadNumerica = parseFloat(cantidad);

  // Verificamos si el valor es NaN (no numérico)
  if (isNaN(cantidadNumerica)) {
    console.error(`Cantidad inválida para el artículo ${articuloId}:`, cantidad);
    return;
  }
    setArticulosAdicionales((prev) => ({
      ...prev,
      [articuloId]: cantidad,
    }));
  };

  const handleAddArticuloAdicional = () => {
    if (selectedClienteId && Object.keys(articulosAdicionales).length > 0) {
      const clienteIndex = filteredClientes.findIndex(
        (cliente) => cliente._id === selectedClienteId
      );

      if (clienteIndex !== -1) {
        const updatedClientes = [...filteredClientes];
        const cliente = updatedClientes[clienteIndex];

        Object.keys(articulosAdicionales).forEach((articuloAdicional) => {
          const cantidadAdicional = articulosAdicionales[articuloAdicional];

          if (cantidadAdicional > 0) {
            // Verifica si el artículo ya existe en la lista del cliente
            const articuloExists = cliente.articulos.some(
              (a) => a.articuloId?._id === articuloAdicional
            );

            if (!articuloExists) {
              cliente.articulos.push({
                articuloId: { _id: articuloAdicional },
                nombre: articulos.find((art) => art._id === articuloAdicional)
                  ?.nombre,
                cantidad: { [selectedDate]: cantidadAdicional },
              });

              setCantidadesEditadas((prevCantidades) => ({
                ...prevCantidades,
                [String(selectedClienteId)]: {
                  ...prevCantidades[String(selectedClienteId)],
                  [articuloAdicional]: cantidadAdicional,
                },
              }));
            }
          }
        });

        setFilteredClientes(updatedClientes);
        closeModal();
      }
    } else {
      alert("Por favor seleccione una cantidad válida para los artículos.");
    }
  };

  useEffect(() => {
    console.log(
      "Estado de cantidadesEditadas en useEffect:",
      cantidadesEditadas
    );
  }, [cantidadesEditadas]);

  return (
    <div
      className="container mx-auto p-6 bg-white rounded-md shadow-md"
      id="reparto-details"
    >
      <h1 className="text-3xl font-bold mb-6 text-center">Crear pedido </h1>
      <div className="flex justify-between mb-6">
        <Link to="/RepartosNuevo">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Volver
          </button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-gray-700 font-bold mb-2">
            Seleccionar fecha:
          </label>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            locale="es"
            dateFormat="dd/MM/yyyy"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-bold mb-2">
            Filtrar por localidad:
          </label>
          <select
            value={selectedLocalidad}
            onChange={handleLocalidadChange}
            className="w-full px-3 py-2 border rounded-md"
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
          <label className="block text-gray-700 font-bold mb-2">
            Seleccionar repartidor:
          </label>
          <select
            value={selectedRepartidor}
            onChange={handleRepartidorChange}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Seleccionar repartidor</option>
            {repartidores.map((repartidor) => (
              <option key={repartidor._id} value={repartidor._id}>
                {repartidor.nombre} - {repartidor.alias}
              </option>
            ))}
          </select>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {filteredClientes.length === 0 ? (
            <div className="text-red-500">No hay clientes disponibles.</div>
          ) : (
            filteredClientes.map((cliente) => (
              <div
                key={cliente._id}
                className="border p-4 rounded-md shadow-md"
              >
                <div className="flex items-center mb-0">
                  <input
                    type="checkbox"
                    id={`cliente-${cliente._id}`}
                    className="mr-2 transform scale-150"
                    checked={clientesSeleccionados.includes(cliente._id)}
                    onChange={() => handleCheckboxChange(cliente._id)}
                  />
                  <label
                    htmlFor={`cliente-${cliente._id}`}
                    className="text-xl font-semibold"
                  >
                    {cliente.nombre} {cliente.apellido}
                  </label>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      openModal(cliente._id);
                    }}
                    className="ml-2 p-1 w-8 bg-green-500 text-white rounded"
                  >
                    +
                  </button>
                </div>

                <div className="flex flex-wrap gap-4">
                  {Array.isArray(cliente.articulos) &&
                  cliente.articulos.length > 0 ? (
                    cliente.articulos.map((articulo) => {
                      const articuloNombre =
                        articulo.articuloId?.nombre || articulo.nombre;

                      if (!articulo || !articuloNombre) {
                        console.error(
                          `Artículo inválido para el cliente: ${cliente._id}`,
                          articulo
                        );
                        return null;
                      }

                      // Obtener la cantidad guardada para el día seleccionado
                      const cantidadGuardada =
                        cliente.articulos.find(
                          (art) =>
                            art.articuloId._id === articulo.articuloId._id
                        )?.cantidad[selectedDay] || 0;

                      // Obtener la cantidad editada si existe
                      const cantidadEditada =
                        cantidadesEditadas[cliente._id]?.[
                          articulo.articuloId._id
                        ] || 0;

                      // Cantidad final que se muestra en el input
                      const cantidadMostrar =
                        cantidadEditada || cantidadGuardada || 0;

                      return (
                        <div
                          key={articulo.articuloId._id}
                          className="flex items-center space-x-2"
                        >
                          <span>{articuloNombre}:</span>
                          <input
                            type="number"
                            step="0.01"
                            className="w-20 px-2 py-1 border rounded-md"
                            value={cantidadMostrar}
                            onChange={(e) =>
                              handleCantidadChange(
                                cliente._id,
                                articulo.articuloId._id,
                                e.target.value
                              )
                            }
                          />
                        </div>
                      );
                    })
                  ) : (
                    <p>No hay artículos disponibles para este cliente.</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded"
          >
            Guardar reparto
          </button>
        </div>
      </form>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Seleccionar artículo adicional"
        className="fixed inset-0 flex items-center justify-center z-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-40"
      >
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <h2 className="text-2xl font-semibold mb-4">
            Seleccionar artículo adicional
          </h2>
          <div className="space-y-4">
            {articulos
              .filter((art) => {
                const cliente = filteredClientes.find(
                  (c) => c._id === selectedClienteId
                );
                return (
                  cliente &&
                  !cliente.articulos.some((a) => a.articuloId?._id === art._id)
                );
              })
              .map((art) => (
                <div
                  key={art._id}
                  className="flex items-center justify-between space-x-2"
                >
                  <span className="text-lg">{art.nombre}</span>
                  <input
                    type="number"
                    step="0.01"
                    value={articulosAdicionales[art._id] || ""}
                    onChange={(e) =>
                      handleArticuloAdicionalChange(
                        art._id,
                         parseFloat(e.target.value)
                      )
                    }
                    placeholder="Cantidad"
                    className="w-24 px-2 py-1 border rounded-md text-center"
                  />
                </div>
              ))}
          </div>
           <div className="mt-6 flex justify-end space-x-2">
            <button
              onClick={handleAddArticuloAdicional}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Agregar artículo
            </button>
            <button
              onClick={closeModal}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ListaClientes;
