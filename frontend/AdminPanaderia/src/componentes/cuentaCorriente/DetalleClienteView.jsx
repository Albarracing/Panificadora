import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const DetalleClienteView = () => {
  const { clienteId } = useParams();
  const [movimientos, setMovimientos] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [meses, setMeses] = useState([]);

  const mesesNombre = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  useEffect(() => {
    const fetchMovimientos = async () => {
      try {
        console.log("Solicitando datos para el cliente ID:", clienteId);
        const response = await axios.get(
          `http://localhost:3000/api/cuenta-corriente/movimientos/${clienteId}`,
          { headers: { "Cache-Control": "no-cache" } }
        );
        console.log("Cliente ID enviado:", clienteId);

        console.log("Datos recibidos de la API:", response.data);

        if (response.data.length > 0) {
          setMovimientos(response.data);

          const mesesDisponibles = Array.from(
            new Set(
              response.data.map((item) => `${item._id.year}-${item._id.month}`)
            )
          );
          console.log("Meses disponibles:", mesesDisponibles);

          setMeses(mesesDisponibles);
        } else {
          console.warn("No se encontraron movimientos para este cliente.");
          setMovimientos([]);
          setMeses([]);
        }
      } catch (error) {
        console.error("Error al obtener los movimientos:", error);
      }
    };

    fetchMovimientos();
  }, [clienteId]);

  const movimientosPaginaActual = movimientos.find(
    ({ _id }) => `${_id.year}-${_id.month}` === meses[paginaActual - 1]
  );

  console.log("Movimientos de la página actual:", movimientosPaginaActual);

  // Función para cambiar de página
  const handlePaginaCambio = (nuevaPagina) => {
    if (nuevaPagina > 0 && nuevaPagina <= meses.length) {
      setPaginaActual(nuevaPagina);
    }
  };

  // Obtener los movimientos de la página actual
  // const movimientosPaginaActual = movimientos.find(
  //   ({ _id }) => `${_id.year}-${_id.month}` === meses[paginaActual - 1]
  // );

  console.log("Movimientos de la página actual:", movimientosPaginaActual);

  return (
    <div className="container mx-auto p-4">
      <Link to="/CuentaCorriente">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Volver
        </button>
      </Link>
      <h1 className="text-3xl font-bold mb-6 text-center">
        Movimientos del Cliente
      </h1>

      {movimientosPaginaActual ? (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Movimientos de {mesesNombre[movimientosPaginaActual._id.month - 1]}{" "}
            {movimientosPaginaActual._id.year}
          </h2>
          <table className="min-w-full bg-white border border-gray-300 shadow-sm rounded-lg mb-6">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-5 border-b text-left text-sm font-semibold text-gray-600">
                  Fecha
                </th>
                <th className="py-3 px-5 border-b text-left text-sm font-semibold text-gray-600">
                  Monto Total Reparto
                </th>
                <th className="py-3 px-5 border-b text-left text-sm font-semibold text-gray-600">
                  Total Pagado
                </th>
                <th className="py-3 px-5 border-b text-left text-sm font-semibold text-gray-600">
                  Total Deuda
                </th>
                <th className="py-3 px-5 border-b text-left text-sm font-semibold text-gray-600">
                  Detalles Devoluciones
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(
                movimientosPaginaActual.movimientos.reduce(
                  (acc, movimiento) => {
                    const fecha = new Date(
                      movimiento.fecha
                    ).toLocaleDateString();
                    if (!acc[fecha]) acc[fecha] = [];
                    acc[fecha].push(movimiento);
                    return acc;
                  },
                  {}
                )
              ).map(([fecha, movimientos], index) => (
                <React.Fragment key={index}>
                  <tr className="bg-gray-200">
                    <td
                      className="py-3 px-5 font-bold text-gray-800 border-b"
                      colSpan="5"
                    >
                      {fecha}
                    </td>
                  </tr>
                  {movimientos.map((movimiento, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="py-3 px-5 border-b text-gray-800">
                        {/* Celda vacía para la fecha */}
                      </td>
                      <td className="py-3 px-5 border-b text-gray-800">
                        ${movimiento.montoTotalReparto.toLocaleString("es-ES")}
                      </td>
                      <td className="py-3 px-5 border-b text-gray-800">
                        ${movimiento.totalPagado.toLocaleString("es-ES")}
                      </td>
                      <td className="py-3 px-5 border-b text-gray-800">
                        ${movimiento.totalDeuda.toLocaleString("es-ES")}
                      </td>
                      <td className="py-3 px-5 border-b text-gray-800">
                        {movimiento.detalles ? (
                          <div>
                            Artículo: {movimiento.detalles.articuloNombre} -
                            Cantidad : {movimiento.detalles.cantidad}{" "}
                            {movimiento.detalles.unidad} - Cantidad Devuelta:{" "}
                            {movimiento.detalles.cantidadDevuelta} - Importe: $
                            {movimiento.detalles.importe.toLocaleString(
                              "es-ES"
                            )}
                          </div>
                        ) : (
                          "No hay devoluciones"
                        )}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No se encontraron movimientos para este cliente.</p>
      )}

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => handlePaginaCambio(paginaActual - 1)}
          disabled={paginaActual === 1}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded transition"
        >
          Anterior
        </button>
        <span className="text-gray-600">
          Página {paginaActual} de {meses.length}
        </span>
        <button
          onClick={() => handlePaginaCambio(paginaActual + 1)}
          disabled={paginaActual === meses.length}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded transition"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default DetalleClienteView;

// import React, { useEffect, useState } from "react";
// import { useParams, Link } from "react-router-dom";
// import axios from "axios";

// const DetalleClienteView = () => {
//   const { clienteId } = useParams();
//   const [movimientos, setMovimientosPorMes] = useState([]);
//   const [paginaActual, setPaginaActual] = useState(1);
//   const [meses, setMeses] = useState([]);

//   const mesesNombre = [
//     "Enero",
//     "Febrero",
//     "Marzo",
//     "Abril",
//     "Mayo",
//     "Junio",
//     "Julio",
//     "Agosto",
//     "Septiembre",
//     "Octubre",
//     "Noviembre",
//     "Diciembre",
//   ];
//   useEffect(() => {
//     const fetchMovimientos = async () => {
//       try {
//         console.log("Solicitando datos para el cliente ID:", clienteId);
//         const response = await axios.get(
//           `http://localhost:3000/api/cuenta-corriente/movimientos/${clienteId}`,
//           { headers: { "Cache-Control": "no-cache" } } // Asegúrate de que no cachea la solicitud
//         );
//         console.log("Datos recibidos de la API:", response.data);

//         // Comprobar si hay movimientos antes de actualizar el estado
//         if (response.data.length > 0) {
//           setMovimientos(response.data);

//           // Crear un array con los meses disponibles para la paginación
//           const mesesDisponibles = Array.from(
//             new Set(
//               response.data.map((item) => `${item._id.year}-${item._id.month}`)
//             )
//           );
//           console.log("Meses disponibles:", mesesDisponibles);

//           setMeses(mesesDisponibles);
//         } else {
//           console.warn("No se encontraron movimientos para este cliente.");
//           setMovimientos([]); // Esto asegura que el estado se actualice incluso si no hay movimientos
//           setMeses([]);
//         }
//       } catch (error) {
//         console.error("Error al obtener los movimientos:", error);
//       }
//     };

//     fetchMovimientos();
//   }, [clienteId]);

//   // Función para cambiar de página
//   const handlePaginaCambio = (nuevaPagina) => {
//     if (nuevaPagina > 0 && nuevaPagina <= meses.length) {
//       setPaginaActual(nuevaPagina);
//     }
//   };

//   // Obtener los movimientos de la página actual
//   const movimientosPaginaActual = movimientos.find(
//     ({ _id }) => `${_id.year}-${_id.month}` === meses[paginaActual - 1]
//   );

//   console.log("Movimientos de la página actual:", movimientosPaginaActual);

//   return (
//     <div className="container mx-auto p-4">
//       <Link to="/CuentaCorriente">
//         <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
//           Volver
//         </button>
//       </Link>
//       <h1 className="text-3xl font-bold mb-6 text-center">
//         Movimientos del Cliente
//       </h1>

//       {movimientosPaginaActual ? (
//         <div>
//           <h2 className="text-xl font-semibold mb-4 text-gray-700">
//             Movimientos de {mesesNombre[movimientosPaginaActual._id.month - 1]}{" "}
//             {movimientosPaginaActual._id.year}
//           </h2>
//           <table className="min-w-full bg-white border border-gray-300 shadow-sm rounded-lg mb-6">
//             <thead>
//               <tr className="bg-gray-100">
//                 <th className="py-3 px-5 border-b text-left text-sm font-semibold text-gray-600">
//                   Fecha
//                 </th>
//                 <th className="py-3 px-5 border-b text-left text-sm font-semibold text-gray-600">
//                   Monto Total Reparto
//                 </th>
//                 <th className="py-3 px-5 border-b text-left text-sm font-semibold text-gray-600">
//                   Total Pagado
//                 </th>
//                 <th className="py-3 px-5 border-b text-left text-sm font-semibold text-gray-600">
//                   Total Deuda
//                 </th>
//                 <th className="py-3 px-5 border-b text-left text-sm font-semibold text-gray-600">
//                   Detalles Devoluciones
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {Object.entries(
//                 movimientosPaginaActual.movimientos.reduce(
//                   (acc, movimiento) => {
//                     const fecha = new Date(
//                       movimiento.fecha
//                     ).toLocaleDateString();
//                     if (!acc[fecha]) acc[fecha] = [];
//                     acc[fecha].push(movimiento);
//                     return acc;
//                   },
//                   {}
//                 )
//               ).map(([fecha, movimientos], index) => (
//                 <React.Fragment key={index}>
//                   <tr className="bg-gray-200">
//                     <td
//                       className="py-3 px-5 font-bold text-gray-800 border-b"
//                       colSpan="5"
//                     >
//                       {fecha}
//                     </td>
//                   </tr>
//                   {movimientos.map((movimiento, idx) => (
//                     <tr
//                       key={idx}
//                       className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
//                     >
//                       <td className="py-3 px-5 border-b text-gray-800">
//                         {/* Celda vacía para la fecha */}
//                       </td>
//                       <td className="py-3 px-5 border-b text-gray-800">
//                         {movimiento.montoTotalReparto}
//                       </td>
//                       <td className="py-3 px-5 border-b text-gray-800">
//                         {movimiento.totalPagado}
//                       </td>
//                       <td className="py-3 px-5 border-b text-gray-800">
//                         {movimiento.totalDeuda}
//                       </td>
//                       <td className="py-3 px-5 border-b text-gray-800">
//                         {movimiento.detalles ? (
//                           <div>
//                             Artículo: {movimiento.detalles.articuloNombre} -
//                             Cantidad Devuelta:{" "}
//                             {movimiento.detalles.cantidadDevuelta} - Importe:{" "}
//                             {movimiento.detalles.importe}
//                           </div>
//                         ) : (
//                           "No hay devoluciones"
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </React.Fragment>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       ) : (
//         <p>No se encontraron movimientos para este cliente.</p>
//       )}

//       <div className="flex justify-between items-center mt-6">
//         <button
//           onClick={() => handlePaginaCambio(paginaActual - 1)}
//           disabled={paginaActual === 1}
//           className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded transition"
//         >
//           Anterior
//         </button>
//         <span className="text-gray-600">
//           Página {paginaActual} de {meses.length}
//         </span>
//         <button
//           onClick={() => handlePaginaCambio(paginaActual + 1)}
//           disabled={paginaActual === meses.length}
//           className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded transition"
//         >
//           Siguiente
//         </button>
//       </div>
//     </div>
//   );
// };

// export default DetalleClienteView;

//--aca ---------------------

// import React, { useEffect, useState } from "react";
// import { useParams, Link, useLocation } from "react-router-dom";
// import axios from "axios";

// const DetalleClienteView = () => {
//   const { clienteId } = useParams();
//   const [movimientos, setMovimientos] = useState([]);
//   const [paginaActual, setPaginaActual] = useState(1);
//   const [meses, setMeses] = useState([]);
// const location = useLocation();
//   const { cliente } = location.state;
//   const mesesNombre = [
//     "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
//     "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
//   ];

//    useEffect(() => {

//   const fetchDatos = async () => {
//   try {
//     const movimientosResponse = await axios.get(`http://localhost:3000/api/cuenta-corriente/movimientos/${clienteId}`);
//     console.log("Movimientos Response:", movimientosResponse.data);

//     if (Array.isArray(movimientosResponse.data)) {
//       setMovimientos(movimientosResponse.data);

//       // Obtener los meses disponibles basados en los movimientos
//       const mesesDisponibles = Array.from(new Set(movimientosResponse.data.map(item => `${item._id.year}-${item._id.month}`)));
//       setMeses(mesesDisponibles);
//     } else {
//       console.error("La respuesta de la API no es un array.");
//     }
//   } catch (error) {
//     console.error("Error al obtener los movimientos:", error);
//   }
// };

//   fetchDatos();
// }, [clienteId]);

//   // Función para cambiar de página
//   const handlePaginaCambio = (nuevaPagina) => {
//     if (nuevaPagina > 0 && nuevaPagina <= meses.length) {
//       setPaginaActual(nuevaPagina);
//     }
//   };

//   // Obtener los movimientos de la página actual
//   const movimientosPaginaActual = movimientos.find(({ _id }) => `${_id.year}-${_id.month}` === meses[paginaActual - 1]) || { movimientos: [] };

//   return (
//   <div className="container mx-auto p-4">
//     <Link to="/CuentaCorriente">
//       <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
//         Volver
//       </button>
//     </Link>

//     <h1>Detalle de Cliente: {cliente.nombre} {cliente.apellido}</h1>

//     {movimientosPaginaActual._id ? (
//       <div>
//         <h2 className="text-xl font-semibold mb-4 text-gray-700">{`Movimientos de ${mesesNombre[movimientosPaginaActual._id.month - 1] || 'Mes Desconocido'} ${movimientosPaginaActual._id.year}`}</h2>
//         <table className="min-w-full bg-white border border-gray-300 shadow-sm rounded-lg mb-6">
//           <thead>
//             <tr className="bg-gray-100">
//               <th className="py-3 px-5 border-b text-left text-sm font-semibold text-gray-600">Fecha</th>
//               <th className="py-3 px-5 border-b text-left text-sm font-semibold text-gray-600">Monto Total Reparto</th>
//               <th className="py-3 px-5 border-b text-left text-sm font-semibold text-gray-600">Total Pagado</th>
//               <th className="py-3 px-5 border-b text-left text-sm font-semibold text-gray-600">Total Deuda</th>
//               <th className="py-3 px-5 border-b text-left text-sm font-semibold text-gray-600">Detalles Devoluciones</th>
//             </tr>
//           </thead>
//           <tbody>
//             {Object.entries(
//               movimientosPaginaActual.movimientos.reduce((acc, movimiento) => {
//                 const fecha = new Date(movimiento.fecha).toLocaleDateString();
//                 if (!acc[fecha]) acc[fecha] = [];
//                 acc[fecha].push(movimiento);
//                 return acc;
//               }, {})
//             ).map(([fecha, movimientos], index) => (
//               <React.Fragment key={index}>
//                 <tr className="bg-gray-200">
//                   <td className="py-3 px-5 font-bold text-gray-800 border-b" colSpan="5">
//                     {fecha}
//                   </td>
//                 </tr>
//                 {movimientos.map((movimiento, idx) => (
//                   <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
//                     <td className="py-3 px-5 border-b text-gray-800">{/* Celda vacía para la fecha */}</td>
//                     <td className="py-3 px-5 border-b text-gray-800">{movimiento.montoTotalReparto}</td>
//                     <td className="py-3 px-5 border-b text-gray-800">{movimiento.totalPagado}</td>
//                     <td className="py-3 px-5 border-b text-gray-800">{movimiento.totalDeuda}</td>
//                     <td className="py-3 px-5 border-b text-gray-800">
//                       {movimiento.detalles ? (
//                         <div>
//                           Artículo: {movimiento.detalles.articuloNombre} - Cantidad Devuelta: {movimiento.detalles.cantidadDevuelta} - Importe: {movimiento.detalles.importe}
//                         </div>
//                       ) : (
//                         "No hay devoluciones"
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </React.Fragment>
//             )}
//           </tbody>
//         </table>
//       </div>
//     ) : (
//       <p>No hay movimientos para mostrar.</p>
//     )}

//     <div className="flex justify-between items-center mt-6">
//       <button
//         onClick={() => handlePaginaCambio(paginaActual - 1)}
//         disabled={paginaActual === 1}
//         className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded transition"
//       >
//         Anterior
//       </button>
//       <span className="text-gray-600">Página {paginaActual} de {meses.length}</span>
//       <button
//         onClick={() => handlePaginaCambio(paginaActual + 1)}
//         disabled={paginaActual === meses.length}
//         className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded transition"
//       >
//         Siguiente
//       </button>
//     </div>
//   </div>
// );

// }

// export default DetalleClienteView;

//----------aca----------
// import React, { useEffect, useState } from "react";
// import { useParams, Link } from "react-router-dom";
// import axios from "axios";

// const DetalleClienteView = () => {
//   const { clienteId } = useParams();
//   const [movimientos, setMovimientos] = useState([]);
//   const [movimientosFiltrados, setMovimientosFiltrados] = useState([]);
//   const [paginaActual, setPaginaActual] = useState(1);
//   const [meses, setMeses] = useState([]);
//   const [fechaInicio, setFechaInicio] = useState("");
//   const [fechaFin, setFechaFin] = useState("");
//   const [mostrarFiltrado, setMostrarFiltrado] = useState(false);

//   const mesesNombre = [
//     "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
//     "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
//   ];

//   useEffect(() => {
//     const fetchMovimientos = async () => {
//       try {
//         const response = await axios.get(`http://localhost:3000/api/cuenta-corriente/movimientos/${clienteId}`);
//         setMovimientos(response.data);

//         // Crear un array con los meses disponibles para la paginación
//         const mesesDisponibles = Array.from(new Set(response.data.map(item => `${item._id.year}-${item._id.month}`)));
//         setMeses(mesesDisponibles);
//       } catch (error) {
//         console.error("Error al obtener los movimientos:", error);
//       }
//     };

//     fetchMovimientos();
//   }, [clienteId]);

//   const handleFiltroFechas = async () => {
//     if (!fechaInicio || !fechaFin) {
//       alert("Por favor selecciona ambas fechas.");
//       return;
//     }

//     try {
//       const response = await axios.get(
//         `http://localhost:3000/api/cuenta-corriente/${clienteId}/por-fechas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
//       );
//       setMovimientosFiltrados(response.data);
//       setMostrarFiltrado(true);
//       setPaginaActual(1); // Reiniciar a la primera página
//     } catch (error) {
//       console.error("Error al filtrar los movimientos:", error);
//     }
//   };

//   const handlePaginaCambio = (nuevaPagina) => {
//     if (nuevaPagina > 0 && nuevaPagina <= (mostrarFiltrado ? meses.length : movimientos.length)) {
//       setPaginaActual(nuevaPagina);
//     }
//   };

//   const movimientosPaginaActual = (mostrarFiltrado ? movimientosFiltrados : movimientos).filter(({ _id }) => `${_id.year}-${_id.month}` === meses[paginaActual - 1]);

//   return (
//     <div className="container mx-auto p-4">
//       <Link to="/CuentaCorriente">
//         <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
//           Volver
//         </button>
//       </Link>
//       <h1 className="text-3xl font-bold mb-6 text-center">Movimientos del Cliente</h1>

//       {/* Formulario para filtrar por fechas */}
//       <div className="mb-4">
//         <label className="mr-2">Fecha Inicio:</label>
//         <input
//           type="date"
//           value={fechaInicio}
//           onChange={(e) => setFechaInicio(e.target.value)}
//           className="border p-2 mr-4"
//         />
//         <label className="mr-2">Fecha Fin:</label>
//         <input
//           type="date"
//           value={fechaFin}
//           onChange={(e) => setFechaFin(e.target.value)}
//           className="border p-2 mr-4"
//         />
//         <button
//           onClick={handleFiltroFechas}
//           className="px-4 py-2 bg-blue-500 text-white rounded"
//         >
//           Filtrar
//         </button>
//         <button
//           onClick={() => setMostrarFiltrado(false)}
//           className="ml-4 px-4 py-2 bg-gray-300 text-gray-800 rounded"
//         >
//           Ver Todos
//         </button>
//       </div>

//       <h2 className="text-xl font-semibold mb-4 text-gray-700">
//         {mostrarFiltrado ? `Movimientos del ${fechaInicio} al ${fechaFin}` : `Movimientos de ${mesesNombre[movimientos[0]?._id?.month - 1]} ${movimientos[0]?._id?.year}`}
//       </h2>

//       <table className="min-w-full bg-white border border-gray-300 shadow-sm rounded-lg mb-6">
//         <thead>
//           <tr className="bg-gray-100">
//             <th className="py-3 px-5 border-b text-left text-sm font-semibold text-gray-600">Fecha</th>
//             <th className="py-3 px-5 border-b text-left text-sm font-semibold text-gray-600">Monto Total Reparto</th>
//             <th className="py-3 px-5 border-b text-left text-sm font-semibold text-gray-600">Total Pagado</th>
//             <th className="py-3 px-5 border-b text-left text-sm font-semibold text-gray-600">Total Deuda</th>
//             <th className="py-3 px-5 border-b text-left text-sm font-semibold text-gray-600">Detalles Devoluciones</th>
//           </tr>
//         </thead>
//         <tbody>
//           {movimientosPaginaActual.length > 0 ? (
//             Object.entries(
//               movimientosPaginaActual.reduce((acc, movimiento) => {
//                 const fecha = new Date(movimiento.fecha).toLocaleDateString();
//                 if (!acc[fecha]) acc[fecha] = [];
//                 acc[fecha].push(movimiento);
//                 return acc;
//               }, {})
//             ).map(([fecha, movimientos], index) => (
//               <React.Fragment key={index}>
//                 <tr className="bg-gray-200">
//                   <td className="py-3 px-5 font-bold text-gray-800 border-b" colSpan="5">
//                     {fecha}
//                   </td>
//                 </tr>
//                 {movimientos.map((movimiento, idx) => (
//                   <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
//                     <td className="py-3 px-5 border-b text-gray-800">{/* Celda vacía para la fecha */}</td>
//                     <td className="py-3 px-5 border-b text-gray-800">{movimiento.montoTotalReparto}</td>
//                     <td className="py-3 px-5 border-b text-gray-800">{movimiento.totalPagado}</td>
//                     <td className="py-3 px-5 border-b text-gray-800">{movimiento.totalDeuda}</td>
//                     <td className="py-3 px-5 border-b text-gray-800">
//                       {movimiento.detalles && movimiento.detalles.length > 0 ? (
//                         movimiento.detalles.map((detalle, idx) => (
//                           <div key={idx}>
//                             Artículo: {detalle.articuloNombre} - Cantidad Devuelta: {detalle.cantidadDevuelta} - Importe: {detalle.importe}
//                           </div>
//                         ))
//                       ) : (
//                         "No hay devoluciones"
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </React.Fragment>
//             ))
//           ) : (
//             <tr>
//               <td colSpan="5" className="py-3 px-5 text-center text-gray-800">No hay movimientos para mostrar</td>
//             </tr>
//           )}
//         </tbody>
//       </table>

//       <div className="flex justify-between items-center mt-6">
//         <button
//           onClick={() => handlePaginaCambio(paginaActual - 1)}
//           disabled={paginaActual === 1}
//           className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded transition"
//         >
//           Anterior
//         </button>
//         <span className="text-gray-600">Página {paginaActual} de {mostrarFiltrado ? meses.length : movimientos.length}</span>
//         <button
//           onClick={() => handlePaginaCambio(paginaActual + 1)}
//           disabled={paginaActual === (mostrarFiltrado ? meses.length : movimientos.length)}
//           className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded transition"
//         >
//           Siguiente
//         </button>
//       </div>
//     </div>
//   );
// };

// export default DetalleClienteView;
