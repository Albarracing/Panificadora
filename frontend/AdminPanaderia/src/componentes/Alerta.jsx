const Alerta = ({ alerta }) => {
  return (
    <div
      className={`${
        alerta.error
          ? "from-red-400 to-red-600"
          : "from-indigo-400 to-indigo-600"
      } bg-gradient-to-br text-center p-3 rounded-xl uppercase text-white font-bold text-sm mb-10`}
    >
      {alerta.msg}
    </div>
  );
};

export default Alerta;

// <>
//   <div className="flex flex-col space-y-4 m-3">
//     {filteredClientes.map((clienteArticulo) => (
//       <div
//         key={clienteArticulo._id}
//         className="border p-4 rounded-lg shadow-md bg-white"
//       >
//         {/* Sección superior: Info del cliente y totales */}
//         <div className="grid grid-cols-2 gap-4 mb-4">
//           {/* Columna izquierda: Información del cliente */}
//           <div>
//             <h2 className="text-xl font-semibold mb-2">
//               {clienteArticulo.clienteId.nombre}{" "}
//               {clienteArticulo.clienteId.apellido}
//             </h2>
//           </div>

//           {/* Columna derecha: Totales */}
//           <div className="flex justify-end space-x-6">
//             <div className="text-lg">
//               <span className="font-medium">Importe total:</span>{" "}
//               <span className="text-blue-600">
//                 ${(clienteArticulo.totalCliente || 0).toFixed(2)}
//               </span>
//             </div>
//             <div className="text-lg">
//               <span className="font-medium">Deuda:</span>{" "}
//               <span className="text-red-600">
//                 ${clienteArticulo.deuda.toFixed(2)}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Sección media: Lista de artículos */}
//         <div className="mb-4">
//           <div className="grid grid-cols-3 gap-4">
//             {clienteArticulo.articulos.map((articulo, index) => (
//               <div
//                 key={articulo.articuloId?._id || index}
//                 className="bg-gray-50 p-3 rounded-lg"
//               >
//                 <div className="flex justify-between mb-2">
//                   <span className="font-medium">
//                     {articulo.nombre || "Nombre no disponible"}
//                   </span>
//                   <span>${(articulo.importe || 0).toFixed(2)}</span>
//                 </div>
//                 <div className="text-sm text-gray-600 mb-2">
//                   Cantidad: {articulo.cantidad}
//                 </div>
//                 <div className="flex flex-col">
//                   <label className="text-sm font-medium mb-1">Devuelve:</label>
//                   <input
//                     type="number"
//                     step="0.01"
//                     min="0"
//                     max={articulo.cantidad}
//                     value={
//                       tempCantidadDevuelta[
//                         `${clienteArticulo.clienteId._id}_${articulo.articuloId._id}`
//                       ] ||
//                       articulo.cantidadDevuelta ||
//                       ""
//                     }
//                     onChange={(e) => {
//                       const valor = Math.max(
//                         0,
//                         Math.min(
//                           parseFloat(e.target.value) || 0,
//                           articulo.cantidad
//                         )
//                       );
//                       handleCantidadDevueltaChange(
//                         clienteArticulo.clienteId._id,
//                         articulo.articuloId._id,
//                         valor
//                       );
//                     }}
//                     onBlur={() =>
//                       handleCantidadDevueltaBlur(
//                         clienteArticulo.clienteId._id,
//                         articulo.articuloId._id
//                       )
//                     }
//                     className={`w-full rounded-md border ${
//                       errores[
//                         `${clienteArticulo.clienteId._id}_${articulo.articuloId._id}`
//                       ]
//                         ? "border-red-500"
//                         : "border-gray-300"
//                     } p-1`}
//                   />
//                   {errores[
//                     `${clienteArticulo.clienteId._id}_${articulo.articuloId._id}`
//                   ] && (
//                     <span className="text-red-500 text-xs mt-1">
//                       {errores[
//                         `${clienteArticulo.clienteId._id}_${articulo.articuloId._id}`
//                       ].join(", ")}
//                     </span>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Sección inferior: Controles de pago */}
//         <div className="bg-blue-50 p-4 rounded-lg">
//           <div className="flex justify-between items-center">
//             <div className="flex space-x-6 text-sm">
//               <div>
//                 <span className="font-medium">Pagado:</span>{" "}
//                 <span className="text-green-600">
//                   $
//                   {clienteArticulo.montoPagado
//                     ? clienteArticulo.montoPagado.toFixed(2)
//                     : "0.00"}
//                 </span>
//               </div>
//               <div>
//                 <span className="font-medium">Restante:</span>{" "}
//                 <span className="text-red-600">
//                   $
//                   {(
//                     clienteArticulo.totalCliente -
//                     (clienteArticulo.montoPagado || 0)
//                   ).toFixed(2)}
//                 </span>
//               </div>
//             </div>

//             <div className="flex items-center space-x-6">
//               <label className="inline-flex items-center">
//                 <input
//                   type="checkbox"
//                   className="form-checkbox h-5 w-5 text-blue-600"
//                   checked={clienteArticulo.pagadoCompleto}
//                   onChange={(e) =>
//                     handlePagoCompletoChangeLocal(
//                       clienteArticulo.clienteId._id,
//                       e.target.checked
//                     )
//                   }
//                 />
//                 <span className="ml-2 font-medium">Pagado completo</span>
//               </label>

//               {!clienteArticulo.pagadoCompleto && (
//                 <div className="flex items-center space-x-2">
//                   <span className="font-medium">Monto pagado:</span>
//                   <input
//                     type="number"
//                     value={clienteArticulo.montoPagado || ""}
//                     onChange={(e) =>
//                       handleMontoPagadoChange(
//                         clienteArticulo.clienteId._id,
//                         parseFloat(e.target.value)
//                       )
//                     }
//                     className={`w-32 rounded-md border ${
//                       errores[`monto_${clienteArticulo.clienteId._id}`]
//                         ? "border-red-500"
//                         : "border-gray-300"
//                     } p-1`}
//                   />
//                   {errores[`monto_${clienteArticulo.clienteId._id}`] && (
//                     <span className="text-red-500 text-xs">
//                       {errores[`monto_${clienteArticulo.clienteId._id}`]}
//                     </span>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     ))}
//   </div>

//   {/* Sección de totales y botones */}
//   <div className="bg-white rounded-lg shadow-md p-4 m-3">
//     <div className="text-xl font-semibold mb-4">
//       Importe total del reparto: ${calcularImporteTotalReparto().toFixed(2)}
//     </div>
//     <div className="flex items-center space-x-6">
//       <button
//         onClick={handleGuardarCambios}
//         disabled={Object.keys(errores).length > 0}
//         className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded-lg disabled:opacity-50"
//       >
//         Guardar cambios
//       </button>
//       <button
//         onClick={generarPDF}
//         className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg"
//       >
//         Generar PDF
//       </button>
//       {Object.keys(errores).length > 0 && (
//         <span className="text-red-500">
//           Hay errores que deben corregirse antes de guardar
//         </span>
//       )}
//     </div>
//   </div>
// </>;
