// RepartoTabla.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useRepartos from "../../hook/useRepartos";
import "react-datepicker/dist/react-datepicker.css";

const RepartoTabla = () => {
  const [pedidosPorFecha, setPedidosPorFecha] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);
  const [shouldUpdate, setShouldUpdate] = useState(true); // Estado para manejar la actualización
  const { repartos, obtenerRepartos, eliminarReparto } = useRepartos();
  const navigate = useNavigate();

  useEffect(() => {
    if (shouldUpdate) {
      obtenerRepartos();
      setShouldUpdate(false);
    }
  }, [shouldUpdate, obtenerRepartos]);

  useEffect(() => {
    const cargarPedidosPorFecha = () => {
      // Ordenar los repartos en orden descendente por fecha
      const repartosOrdenados = [...repartos].sort((a, b) => {
        return new Date(b.fecha) - new Date(a.fecha);
      });

      // Agrupar repartos por fecha
      const pedidosAgrupados = repartosOrdenados.reduce((acc, reparto) => {
        const fecha = new Date(reparto.fecha);
        if (!isNaN(fecha)) {
          const fechaFormateada = fecha.toLocaleDateString();
          if (!acc[fechaFormateada]) {
            acc[fechaFormateada] = [];
          }
          acc[fechaFormateada].push(reparto);
        } else {
          console.error("Fecha inválida:", reparto.fecha);
        }
        return acc;
      }, {});

      Object.keys(pedidosAgrupados).forEach((fecha) => {
        pedidosAgrupados[fecha].sort((a, b) => b.numeroPedido - a.numeroPedido);
      });

      setPedidosPorFecha(pedidosAgrupados);
    };

    cargarPedidosPorFecha();
  }, [repartos]);

  const handleVerDetalles = (pedido) => {
    navigate(`/reparto-detalles`, {
      state: {
        repartoId: pedido._id,
        pedidos: pedido.clientesArticulos,
        numeroPedido: pedido.numeroPedido,
      },
    });
  };

  const handleEditarReparto = (repartoId) => {
    navigate(`/crear-reparto/${repartoId}`);
  };

  const handleEliminarReparto = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este reparto?")) {
      await eliminarReparto(id);
      setShouldUpdate(true); // Actualizar la vista después de eliminar un reparto
    }
  };

  const currentPedidos = (fecha) => {
    const pedidos = pedidosPorFecha[fecha] || [];
    const indexOfLastPedido = currentPage * itemsPerPage;
    const indexOfFirstPedido = indexOfLastPedido - itemsPerPage;
    return pedidos.slice(indexOfFirstPedido, indexOfFirstPedido + itemsPerPage);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    // <>
    //   <div className="flex flex-col text-center min-h-screen bg-[url('./assets/Panadera.jpg')] bg-center bg-no-repeat bg-cover bg-opacity-40">
    //     <div className="flex justify-between my-4 mx-4">
    //       <Link
    //         to="/"
    //         className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    //       >
    //         Volver
    //       </Link>
    //       <Link to="/crear-reparto">
    //         <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
    //           +
    //         </button>
    //       </Link>
    //     </div>
    //     {/*         <h1 className="text-3xl font-bold mb-6">Pedidos</h1> */}
    //     <h1 className="text-center text-white font-bold mb-4 text-2xl [text-shadow:_0px_0px_10px_#000000]">
    //       REPARTOS
    //     </h1>

    //     <table className="w-full border-collapse">
    //       <thead>
    //         <tr className="bg-gray-200">
    //           <th className="px-2 py-2 text-center border">Nro de Reparto</th>
    //           <th className="px-2 py-2 text-center border">Fecha</th>
    //           <th className="px-2 py-2 text-center border">Repartidor</th>
    //           <th className="px-2 py-2 text-center border">Acciones</th>
    //         </tr>
    //       </thead>
    //       <tbody>
    //         {Object.keys(pedidosPorFecha).map((fecha) =>
    //           currentPedidos(fecha).map((pedido) => (
    //             <tr key={pedido._id} className="bg-white even:bg-gray-100">
    //               <td className="border px-4 py-2">
    //                 {pedido.numeroPedido || "N/A"}
    //               </td>
    //               <td className="border px-4 py-2">
    //                 {new Date(pedido.fecha).toLocaleDateString() ||
    //                   "Fecha Inválida"}
    //               </td>
    //               <td className="border px-4 py-2">{pedido.alias}</td>
    //               <td className="border px-4 py-2">
    //                 <button
    //                   onClick={() => handleVerDetalles(pedido)}
    //                   className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
    //                 >
    //                   Ver Detalles
    //                 </button>
    //                 <button
    //                   onClick={() => handleEliminarReparto(pedido._id)}
    //                   className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2"
    //                 >
    //                   Eliminar
    //                 </button>
    //               </td>
    //             </tr>
    //           ))
    //         )}
    //       </tbody>
    //     </table>
    //     <div className="flex justify-center mt-4">
    //       <nav>
    //         <ul className="inline-flex -space-x-px">
    //           {[
    //             ...Array(
    //               Math.ceil(
    //                 Object.keys(pedidosPorFecha).reduce(
    //                   (acc, fecha) => acc + pedidosPorFecha[fecha].length,
    //                   0
    //                 ) / itemsPerPage
    //               )
    //             ).keys(),
    //           ].map((number) => (
    //             <li key={number + 1}>
    //               <button
    //                 onClick={() => paginate(number + 1)}
    //                 className={`py-2 px-3 leading-tight ${
    //                   currentPage === number + 1
    //                     ? "bg-blue-500 text-white"
    //                     : "bg-white text-blue-500 border border-gray-300 hover:bg-gray-100"
    //                 }`}
    //               >
    //                 {number + 1}
    //               </button>
    //             </li>
    //           ))}
    //         </ul>
    //       </nav>
    //     </div>
    //   </div>
    // </>

    <>
      <div className="flex flex-col text-center min-h-screen bg-[url('./assets/Panadera.jpg')] bg-center bg-no-repeat bg-cover bg-opacity-40">
        <div className="flex justify-between my-4 mx-4">
          <Link
            to="/"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Volver
          </Link>
          <Link to="/crear-reparto">
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              +
            </button>
          </Link>
        </div>
        <h1 className="text-center text-white font-bold mb-4 text-2xl [text-shadow:_0px_0px_10px_#000000]">
          REPARTOS{" "}
        </h1>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-2 py-2 text-center border">Nro de Reparto</th>
              <th className="px-2 py-2 text-center border">Fecha</th>
              <th className="px-2 py-2 text-center border">Repartidor</th>
              <th className="px-2 py-2 text-center border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(pedidosPorFecha).map((fecha) =>
              currentPedidos(fecha).map((pedido) => (
                <tr key={pedido._id} className="bg-white even:bg-gray-100">
                  <td className="border border-gray-400 px-4 py-2">
                    {pedido.numeroPedido || "N/A"}
                  </td>
                  <td className="border border-gray-400 px-4 py-2">
                    {new Date(pedido.fecha).toLocaleDateString() ||
                      "Fecha Inválida"}
                  </td>
                  <td className="border border-gray-400 px-4 py-2">
                    {pedido.alias}
                  </td>
                  <td className="border border-gray-400 px-4 py-2">
                    <button
                      onClick={() => handleVerDetalles(pedido)}
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Ver Detalles
                    </button>

                    <button
                      onClick={() => handleEditarReparto(pedido._id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => handleEliminarReparto(pedido._id)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="flex justify-center mt-4">
          <nav>
            <ul className="inline-flex -space-x-px">
              {[
                ...Array(
                  Math.ceil(
                    Object.keys(pedidosPorFecha).reduce(
                      (acc, fecha) => acc + pedidosPorFecha[fecha].length,
                      0
                    ) / itemsPerPage
                  )
                ).keys(),
              ].map((number) => (
                <li key={number + 1}>
                  <button
                    onClick={() => paginate(number + 1)}
                    className={`py-2 px-3 leading-tight ${
                      currentPage === number + 1
                        ? "bg-blue-500 text-white"
                        : "bg-white text-blue-500 border border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {number + 1}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default RepartoTabla;
