import React, { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import useRepartos from "../../hook/useRepartos";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import { generarPDF, validarCantidadDevuelta, calcularNuevoImporte } from './utils/RepartoUtils';
import FormularioRepDet from "./FormularioRepDet";
//import {generarPDF} from "./utils/RepartoUtils";


const RepartoDetalles = ({}) => {
  const location = useLocation();
  const { pedidos, repartoId, numeroPedido, fecha } = location.state || {
    pedidos: [],
    repartoId: null,
    numeroPedido: null,
  };
  const {
    actualizarPagoCompletoEnBackend,
    guardarMontoPagadoEnBackend,
    registrarDevolucionEnBackend,
  } = useRepartos();
  const [clientesArticulos, setClientesArticulos] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tempCantidadDevuelta, setTempCantidadDevuelta] = useState({});
  const [reparto, setReparto] = useState(null);
  const [tipoCliente, setTipoCliente] = useState(""); // Filtro para tipo de cliente
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [selectedLocalidad, setSelectedLocalidad] = useState("");
  const [selectedTipoCliente, setSelectedTipoCliente] = useState("");
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [errores, setErrores] = useState({});


  // Agregar al inicio del componente
const findArticulo = React.useCallback((clienteId, articuloId) => {
  return clientesArticulos
    .find(c => c.clienteId._id === clienteId)
    ?.articulos
    .find(a => a.articuloId._id === articuloId);
}, [clientesArticulos]);

  // Este efecto se ejecuta cada vez que cambian los filtros de localidad o tipo de cliente
  useEffect(() => {
    filtrarClientes();
  }, [selectedLocalidad, selectedTipoCliente, clientesArticulos]);

  const filtrarClientes = () => {
    let clientesFiltrados = clientesArticulos;

    // Filtrar por localidad si se ha seleccionado una
    if (selectedLocalidad) {
      clientesFiltrados = clientesFiltrados.filter(
        (clienteArticulo) =>
          clienteArticulo.clienteId.localidad === selectedLocalidad
      );
    }

    // Filtrar por tipo de cliente si se ha seleccionado uno
    if (selectedTipoCliente) {
      clientesFiltrados = clientesFiltrados.filter(
        (clienteArticulo) =>
          clienteArticulo.clienteId.tipoCliente === selectedTipoCliente
      );
    }

    setFilteredClientes(clientesFiltrados);
  };

  // Manejadores de cambio de filtros
  const handleLocalidadChange = (e) => {
    setSelectedLocalidad(e.target.value);
  };

  const handleTipoClienteChange = (e) => {
    setSelectedTipoCliente(e.target.value);
  };
 

// Este useEffect se ejecuta cada vez que cambia el repartoId, nueva versión
  useEffect(() => {
    if (repartoId) {
      const obtenerReparto = async () => {
        try {
          setLoading(true);
          const response = await axios.get(
            `http://localhost:3000/api/repartos/${repartoId}`
          );
          const repartoData = response.data;
          
          if (!repartoData || !repartoData.clientesArticulos) {
            throw new Error('Datos de reparto inválidos');
          }
  
          setReparto(repartoData);
          
          const clientesConNombresDeArticulos = repartoData.clientesArticulos.map((cliente) => ({
            ...cliente,
            articulos: cliente.articulos.map((articulo) => ({
              ...articulo,
              importeOriginal: articulo.importe,
              nombre: articulo.articuloId?.nombre || "Nombre no disponible",
            })),
          }));
  
          setClientesArticulos(clientesConNombresDeArticulos);
          setFilteredClientes(clientesConNombresDeArticulos);
        } catch (error) {
          setError(error.message || "Error al obtener los detalles del reparto");
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      obtenerReparto();
    }
  }, [repartoId]);

  // Este useEffect filtra los clientes por localidad

  useEffect(() => {
    const obtenerLocalidades = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/localidades"
        );
        setLocalidades(response.data); // Almacena las localidades en el estado
      } catch (error) {
        console.error("Error al obtener las localidades:", error);
      }
    };

    obtenerLocalidades();
  }, []);

  useEffect(() => {
    console.log("Filtrando por localidad", selectedLocalidad);

    // Si hay una localidad seleccionada, filtra los clientes
    if (selectedLocalidad) {
      const clientesFiltrados = clientesArticulos.filter(
        (clienteArticulo) =>
          clienteArticulo.clienteId.localidad === selectedLocalidad
      );
      console.log("Clientes filtrados por localidad:", clientesFiltrados);
      setFilteredClientes(clientesFiltrados);
    } else {
      // Si no se selecciona localidad, muestra todos los clientes
      setFilteredClientes(clientesArticulos);
    }
  }, [selectedLocalidad, clientesArticulos]);


  useEffect(() => {
    console.log("location.state:", location.state);
    console.log("Pedidos recibidos:", pedidos); // Agregar esta línea
    if (pedidos.length > 0) {
      setClientesArticulos(pedidos.map(prepararClienteArticulo));
    }
  }, [pedidos]);

  useEffect(() => {
    const obtenerReparto = async () => {
      setLoading(true);
      try {
        const repartoData = await obtenerRepartoPorId(repartoId); // Asegúrate de que esta función se llame correctamente
        console.log("Datos del reparto:", repartoData); // Añade este log
        setReparto(repartoData);
      } catch (error) {
        setError("Error al cargar los detalles del reparto");
      } finally {
        setLoading(false);
      }
    };

    if (repartoId) {
      obtenerReparto();
    }
  }, [repartoId]);

  const prepararClienteArticulo = (clienteArticulo) => ({
    ...clienteArticulo,
    originalPagadoCompleto: clienteArticulo.pagadoCompleto,
    originalMontoPagado: clienteArticulo.montoPagado,
    cantidadDevuelta: 0,
    deudaAnterior: clienteArticulo.deudaAnterior || 0, // Asegurando que deudaAnterior esté definido
  });

  const handleCantidadDevueltaChange = React.useCallback((clienteId, articuloId, newValue) => {
    const articulo = findArticulo(clienteId, articuloId);
    
    if (!articulo) return; // Early return si no se encuentra el artículo
  
    // Debounce para evitar validaciones innecesarias
    const timeoutId = setTimeout(() => {
      const cantidadValidada = validarCantidadDevuelta(newValue, articulo.cantidad);
      if (cantidadValidada !== tempCantidadDevuelta[`${clienteId}_${articuloId}`]) {
        setTempCantidadDevuelta(prev => ({
          ...prev,
          [`${clienteId}_${articuloId}`]: cantidadValidada
        }));
      }
    }, 300);
  
    return () => clearTimeout(timeoutId);
  }, [findArticulo, tempCantidadDevuelta]);


  //---esta es la nueva funcion de blur, con modificaciones--
  const handleCantidadDevueltaBlur = useCallback((clienteId, articuloId) => {
    const cantidadDevuelta = tempCantidadDevuelta[`${clienteId}_${articuloId}`];
    if (cantidadDevuelta === undefined) return;
  
    setClientesArticulos(prevClientesArticulos => {
      return prevClientesArticulos.map(cliente => {
        if (cliente.clienteId._id !== clienteId) return cliente;
  
        // Actualizar artículos del cliente
        const nuevosArticulos = cliente.articulos.map(articulo => {
          if (articulo.articuloId._id !== articuloId) return articulo;
  
          // Calcular nuevo importe del artículo
          const nuevoImporte = calcularNuevoImporte(
            articulo.cantidad,
            cantidadDevuelta,
            articulo.importeOriginal || articulo.importe
          );
  
          return {
            ...articulo,
            cantidadDevuelta,
            importe: nuevoImporte
          };
        });
  
        // Calcular nuevo total del cliente
        const nuevoTotalCliente = nuevosArticulos.reduce(
          (total, art) => total + (art.importe || 0),
          0
        );
  
        // Actualizar deuda del cliente
        const nuevaDeuda = Math.max(
          nuevoTotalCliente - (cliente.montoPagado || 0),
          0
        );
  
        return {
          ...cliente,
          articulos: nuevosArticulos,
          totalCliente: nuevoTotalCliente,
          deuda: nuevaDeuda
        };
      });
    });
  }, [tempCantidadDevuelta, calcularNuevoImporte]);



// Función para calcular el importe total del reparto, nueva version
  const calcularImporteTotalReparto = React.useCallback(() => {
    return Number(
      clientesArticulos.reduce(
        (acc, clienteArticulo) => acc + (clienteArticulo.totalCliente || 0),
        0
      ).toFixed(2)
    );
  }, [clientesArticulos]);

// Función para calcular el importe total del reparto filtrado
const calcularImporteTotalFiltrado = React.useCallback(() => {
  return Number(
    filteredClientes.reduce(
      (acc, clienteArticulo) => acc + (clienteArticulo.totalCliente || 0),
      0
    ).toFixed(2)
  );
}, [filteredClientes]);


  // Manejador de cambio de pagadoCompleto, nueva version
  const handlePagoCompletoChangeLocal = React.useCallback((clienteId, pagadoCompleto) => {
    setClientesArticulos(prevClientesArticulos => {
      const clienteIndex = prevClientesArticulos.findIndex(
        c => c.clienteId._id === clienteId
      );
      
      if (clienteIndex === -1) return prevClientesArticulos;
  
      const newClientesArticulos = [...prevClientesArticulos];
      const cliente = {...newClientesArticulos[clienteIndex]};
      
      cliente.pagadoCompleto = pagadoCompleto;
      cliente.montoPagado = pagadoCompleto ? cliente.totalCliente : cliente.montoPagado;
      cliente.deuda = pagadoCompleto ? 0 : Math.max(cliente.totalCliente - cliente.montoPagado, 0);
  
      newClientesArticulos[clienteIndex] = cliente;
      return newClientesArticulos;
    });
  }, []);



  // Manejador de cambio de montoPagado, nueva version
  const handleMontoPagadoChange = React.useCallback((clienteId, montoPagado) => {
    setClientesArticulos(prevClientesArticulos => {
      const clienteIndex = prevClientesArticulos.findIndex(
        c => c.clienteId._id === clienteId
      );
      
      if (clienteIndex === -1) return prevClientesArticulos;
  
      const newClientesArticulos = [...prevClientesArticulos];
      const cliente = {...newClientesArticulos[clienteIndex]};
      
      const montoValidado = Math.max(0, parseFloat(montoPagado) || 0);
      cliente.montoPagado = montoValidado;
      cliente.deuda = Math.max(cliente.totalCliente - montoValidado, 0);
      cliente.pagadoCompleto = montoValidado >= cliente.totalCliente;
  
      newClientesArticulos[clienteIndex] = cliente;
      return newClientesArticulos;
    });
  }, []);

  const handleGuardarCambios = async () => {
    try {
      setLoading(true);
      await Promise.all(
        clientesArticulos.map(async (clienteArticulo) => {
          if (
            clienteArticulo.pagadoCompleto !==
            clienteArticulo.originalPagadoCompleto
          ) {
            await actualizarPagoCompletoEnBackend(
              repartoId,
              clienteArticulo.clienteId._id,
              clienteArticulo.pagadoCompleto,
              clienteArticulo.montoPagado,
              clienteArticulo.deuda
            );
          }

          if (
            clienteArticulo.montoPagado !== clienteArticulo.originalMontoPagado
          ) {
            await guardarMontoPagadoEnBackend(
              repartoId,
              clienteArticulo.clienteId._id,
              clienteArticulo.montoPagado,
              clienteArticulo.deuda
            );
          }

          await Promise.all(
            clienteArticulo.articulos.map(async (articulo) => {
              if (articulo.cantidadDevuelta > 0) {
                const fechaDevolucion = new Date().toISOString().split("T")[0];
                const deuda = Math.max(
                  clienteArticulo.totalCliente - clienteArticulo.montoPagado,
                  0
                );
                await registrarDevolucionEnBackend(
                  repartoId,
                  clienteArticulo.clienteId._id,
                  articulo.articuloId._id,
                  articulo.cantidadDevuelta,
                  deuda,
                  fechaDevolucion
                );
              }
            })
          );
        })
      );

      // Registrar en cuenta corriente después de guardar todos los cambios
      await registrarEnCuentaCorriente(repartoId);

      setClientesArticulos((prevClientesArticulos) =>
        prevClientesArticulos.map((clienteArticulo) => ({
          ...clienteArticulo,
          originalPagadoCompleto: clienteArticulo.pagadoCompleto,
          originalMontoPagado: clienteArticulo.montoPagado,
        }))
      );

      console.log("Cambios guardados exitosamente!");
    } catch (error) {
      setError("Error al guardar cambios");
      console.error("Error al guardar cambios:", error);
    } finally {
      setLoading(false);
    }
  };
  const registrarEnCuentaCorriente = async (repartoId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/cuenta-corriente/${repartoId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ repartoId }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al registrar en cuenta corriente");
      }

      const data = await response.json();
      console.log("Datos registrados en cuenta corriente:", data);
    } catch (error) {
      console.error("Error al registrar en cuenta corriente:", error);
    }
  };


  const handleError = React.useCallback((clienteId, articuloId, mensaje) => {
    setErrores(prev => ({
      ...prev,
      [`${clienteId}_${articuloId}`]: Array.isArray(mensaje) ? mensaje : [mensaje]
    }));
  }, []);
  
  const clearError = React.useCallback((clienteId, articuloId) => {
    setErrores(prev => {
      const newErrores = { ...prev };
      delete newErrores[`${clienteId}_${articuloId}`];
      return newErrores;
    });
  }, []);
  

  if (!clientesArticulos.length) {
    return <div>No hay pedidos disponibles.</div>;
  }

  return (
    <FormularioRepDet
      clientesArticulos={clientesArticulos}
      localidades={localidades}
      selectedLocalidad={selectedLocalidad}
      selectedTipoCliente={selectedTipoCliente}
      handleLocalidadChange={handleLocalidadChange}
      handleTipoClienteChange={handleTipoClienteChange}
      handlePagoCompletoChangeLocal={handlePagoCompletoChangeLocal}
      handleMontoPagadoChange={handleMontoPagadoChange}
      handleCantidadDevueltaChange={handleCantidadDevueltaChange}
      handleCantidadDevueltaBlur={handleCantidadDevueltaBlur}
      handleGuardarCambios={handleGuardarCambios}
      calcularImporteTotalReparto={calcularImporteTotalReparto}
      calcularImporteTotalFiltrado={calcularImporteTotalFiltrado}
      numeroPedido={numeroPedido}
      reparto={reparto}
      loading={loading}
      filteredClientes={filteredClientes}
      tempCantidadDevuelta={tempCantidadDevuelta}
      errores={errores} // Agregar esta prop para manejar errores
      generarPDF={generarPDF}
    />
  );

  // const generarPDF = () => {
  //   const doc = new jsPDF();

  //   // Título del documento
  //   doc.setFontSize(18);
  //   doc.text("Detalles del Reparto", 14, 20);

  //   // Obtener la fecha actual
  //   const fechaActual = new Date().toLocaleDateString("es-ES", {
  //     day: "numeric",
  //     month: "long",
  //     year: "numeric",
  //   });
  //   doc.setFontSize(12);
  //   doc.text(`Fecha: ${fechaActual}`, 14, 30);

  //   // Datos para la tabla
  //   const rows = [];
  //   let totalReparto = 0;

  //   clientesArticulos.forEach((clienteArticulo) => {
  //     const nombreCliente = `${clienteArticulo.clienteId.nombre} ${clienteArticulo.clienteId.apellido}`;
  //     const pago = clienteArticulo.pagadoCompleto
  //       ? `Pagado completo: $${clienteArticulo.totalCliente.toFixed(2)}`
  //       : `Monto pagado: $${clienteArticulo.montoPagado.toFixed(2)}`;

  //     clienteArticulo.articulos.forEach((articulo, index) => {
  //       if (index === 0) {
  //         rows.push([
  //           nombreCliente,
  //           articulo.articuloId.nombre,
  //           articulo.cantidad,
  //           `$${articulo.importe.toFixed(2)}`,
  //           `${articulo.cantidadDevuelta || 0}`,
  //           pago,
  //           clienteArticulo.deuda.toFixed(2),
  //           clienteArticulo.totalCliente.toFixed(2),
  //         ]);
  //         totalReparto += clienteArticulo.totalCliente;
  //       } else {
  //         rows.push([
  //           "",
  //           articulo.articuloId.nombre,
  //           articulo.cantidad,
  //           `$${articulo.importe.toFixed(2)}`,
  //           `${articulo.cantidadDevuelta || 0}`,
  //           "",
  //           "",
  //           "",
  //         ]);
  //       }
  //     });
  //   });

  //   const columns = [
  //     { header: "Cliente", dataKey: "cliente" },
  //     { header: "Artículo", dataKey: "articulo" },
  //     { header: "Cantidad", dataKey: "cantidad" },
  //     { header: "Importe", dataKey: "importe" },
  //     { header: "Devolución", dataKey: "devolucion" },
  //     { header: "Pago", dataKey: "pago" },
  //     { header: "Deuda", dataKey: "deuda" },
  //     { header: "Total", dataKey: "total" },
  //   ];

  //   autoTable(doc, {
  //     head: [columns.map((col) => col.header)],
  //     body: rows,
  //     startY: 40,
  //     theme: "grid",
  //   });

  //   doc.setFontSize(14);
  //   doc.text(
  //     `Importe total del reparto: $${totalReparto.toFixed(2)}`,
  //     14,
  //     doc.autoTable.previous.finalY + 10
  //   );

  //   // Convertir el PDF a un Blob y abrirlo en una nueva ventana
  //   const pdfBlob = doc.output("blob");
  //   const blobUrl = URL.createObjectURL(pdfBlob);

  //   const printWindow = window.open(blobUrl, "_blank");
  //   printWindow.onload = () => printWindow.print();
  // };

//   return (
//     <div className="container mx-auto " id="reparto-details">
//       <Link
//         to="/RepartosNuevo"
//         className=" m-3 my-4 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
//       >
//         Volver
//       </Link>
//       <div className="flex space-x-4 items-center mb-4 m-3">
//         {/* Filtro por localidad */}
//         <div className="flex flex-col">
//           <label className="text-gray-700 font-bold text-sm mb-1">
//             Localidad:
//           </label>
//           <select
//             value={selectedLocalidad}
//             onChange={handleLocalidadChange}
//             className="w-40 px-2 py-1 border rounded-md text-sm"
//           >
//             <option value="">Seleccionar</option>
//             {localidades.map((localidad) => (
//               <option key={localidad._id} value={localidad._id}>
//                 {localidad.nombre}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Filtro por tipo de cliente */}
//         <div className="flex flex-col">
//           <label className="text-gray-700 font-bold text-sm mb-1">
//             Tipo de cliente:
//           </label>
//           <select
//             value={selectedTipoCliente}
//             onChange={handleTipoClienteChange}
//             className="w-40 px-2 py-1 border rounded-md text-sm"
//           >
//             <option value="">Seleccionar</option>
//             <option value="lista">Lista</option>
//             <option value="individual">Individual</option>
//           </select>
//         </div>
//       </div>

//       <h1 className="text-2xl font-bold mb-4 mt-4 m-3">
//         Detalles del reparto N°: {numeroPedido}
//       </h1>

//       <h2 className="text-lg mb-4 m-3">
//         Fecha del reparto:{""}
//         {reparto
//           ? new Date(reparto.fecha).toLocaleDateString()
//           : "Fecha no disponible"}
//       </h2>
//       {loading ? (
//         <div>Cargando...</div>
//       ) : (
//         <>
//           <div className="space-y-4 m-3">
//             {/* {clientesArticulos.map((clienteArticulo) => ( */}
//             {filteredClientes.map((clienteArticulo) => (
//               <div
//                 key={clienteArticulo._id}
//                 className="border px-3 rounded-md shadow-md my-8"
//               >
//                 <div className="flex justify-between mb-2">
//                   <h2 className="text-xl font-semibold">
//                     {clienteArticulo.clienteId.nombre}{" "}
//                     {clienteArticulo.clienteId.apellido}
//                   </h2>
//                   <div className="flex items-center space-x-4">
//                     <label className="inline-flex items-center">
//                       <input
//                         type="checkbox"
//                         className="transform scale-150"
//                         checked={clienteArticulo.pagadoCompleto}
//                         onChange={(e) =>
//                           handlePagoCompletoChangeLocal(
//                             clienteArticulo.clienteId._id,
//                             e.target.checked
//                           )
//                         }
//                       />
//                       <span className="ml-2">Pagado completo</span>
//                     </label>
//                     {!clienteArticulo.pagadoCompleto && (
//                       <label className="flex items-center">
//                         Monto pagado:
//                         <input
//                           type="number"
//                           value={clienteArticulo.montoPagado || ""}
//                           onChange={(e) =>
//                             handleMontoPagadoChange(
//                               clienteArticulo.clienteId._id,
//                               parseFloat(e.target.value)
//                             )
//                           }
//                           className="w-24 ml-2 rounded-md focus:outline-none border border-gray-300 py-1 px-2"
//                         />
//                       </label>
//                     )}
//                   </div>
//                 </div>
//                 <div className="flex justify-between mt-1 mb-1">
//                   <div className="flex flex-wrap gap-4">
//                     {clienteArticulo.articulos.map((articulo, index) => (
//                       <div
//                         key={articulo.articuloId?._id || index}
//                         className="mb-1"
//                       >
//                         <div className="flex items-center">
//                           <span className="font-medium">
//                             {articulo.nombre || "Nombre no disponible"}:
//                           </span>
//                           <span className="ml-2">{articulo.cantidad}</span>
//                         </div>
//                         <div className="text-gray-700">
//                           ${(articulo.importe || 0).toFixed(2)}
//                         </div>
//                         <div className="flex items-center mt-1">
//                           <h2 className="mr-2">Devuelve:</h2>
//                           <input
//                             type="number"
//                             step="0.01"
//                             value={
//                               tempCantidadDevuelta[
//                                 `${clienteArticulo.clienteId._id}_${articulo.articuloId._id}`
//                               ] || articulo.cantidadDevuelta
//                             }
//                             onChange={(e) =>
//                               handleCantidadDevueltaChange(
//                                 clienteArticulo.clienteId._id,
//                                 articulo.articuloId._id,
//                                 e.target.value
//                               )
//                             }
//                             onBlur={() =>
//                               handleCantidadDevueltaBlur(
//                                 clienteArticulo.clienteId._id,
//                                 articulo.articuloId._id
//                               )
//                             }
//                             className="w-24 ml-2 rounded-md focus:outline-none border border-gray-300 py-1 px-2"
//                           />
//                         </div>
//                         <div className="text-gray-700">
//                           Importe actual: ${(articulo.importe || 0).toFixed(2)}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                   <div className="flex flex-col items-end space-y-2">
//                     <div className="flex space-x-4">
//                       <div className="text-sm text-gray-600 inline-flex items-center">
//                         Pagado: $
//                         {clienteArticulo.montoPagado
//                           ? clienteArticulo.montoPagado.toFixed(2)
//                           : "0.00"}
//                       </div>
//                       <div className="text-sm text-gray-600">
//                         Restante: $
//                         {(
//                           clienteArticulo.totalCliente -
//                           (clienteArticulo.montoPagado || 0)
//                         ).toFixed(2)}
//                       </div>
//                     </div>
//                     <div className="flex space-x-4 mt-1 ">
//                       <div className="text-right text-lg font-semibold">
//                         Importe total: $
//                         {(clienteArticulo.totalCliente || 0).toFixed(2)}
//                       </div>
//                       <div className="text-right text-lg font-semibold text-red-600">
//                         Deuda: ${clienteArticulo.deuda.toFixed(2)}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//           <div className="my-6 text-xl font-semibold m-3">
//             Importe total del reparto: $
//             {calcularImporteTotalReparto().toFixed(2)}
//           </div>
//           <div className="mt-4 flex space-x-10 m-3 flex-row">
//             <button
//               onClick={handleGuardarCambios}
//               className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
//             >
//               Guardar cambios
//             </button>
//             <button
//               onClick={generarPDF}
//               className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
//             >
//               Generar PDF
//             </button>
//           </div>
//           <div></div>
//         </>
//       )}
//     </div>
//   );
 };

export default RepartoDetalles;
