import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const CuentaCorrienteView = () => {
  const [clientes, setClientes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/clientes");
        const clientesData = response.data;

        const clientesConEstado = await Promise.all(
          clientesData.map(async (cliente) => {
            const estadoCuenta = await obtenerEstadoCuenta(cliente._id);
            return { ...cliente, estadoCuenta }; // Combina el cliente con su estado de cuenta
          })
        );

        setClientes(clientesConEstado);
      } catch (error) {
        console.error(
          "Error al obtener los clientes o el estado de cuenta:",
          error
        );
      }
    };

    fetchClientes();
  }, []);

  const obtenerEstadoCuenta = async (clienteId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/cuenta-corriente/${clienteId}`
      );

      if (!response.ok) {
        console.error("Error en la respuesta de la API:", response.statusText);
        return { totalPagado: 0, totalDeuda: 0, totalDevoluciones: 0 };
      }
      console.log("ID del cliente", clienteId);
      const estadoCuenta = await response.json();
      return estadoCuenta;
    } catch (error) {
      console.error("Error al obtener el estado de cuenta:", error);
      return { totalPagado: 0, totalDeuda: 0, totalDevoluciones: 0 };
    }
  };

  const determinarSaldo = (totalDeuda) => {
    let texto;
    let clase;

    if (totalDeuda > 0) {
      texto = `Deuda: $${totalDeuda.toLocaleString("es-ES")}`;
      clase = "text-red-500";
    } else if (totalDeuda < 0) {
      texto = `A favor: ${Math.abs(totalDeuda)}`;
      clase = "text-green-500";
    } else {
      texto = "Sin deuda";
      clase = "text-green-500";
    }

    return { texto, clase };
  };

  const verDetalle = (cliente) => {
    console.log("Cliente seleccionado:", cliente); // Verificar el objeto completo
    const clienteId = cliente._id;
    console.log("ID del cliente:", clienteId);
    navigate(`/detalle-cliente/${clienteId}`, { state: { clienteId } });
  };

  return (
    <div className="container mx-auto p-4">
      <Link
        to="/"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 ml-4"
      >
        Volver
      </Link>
      <h1 className="text-center text-white font-bold mb-4 text-2xl [text-shadow:_0px_0px_10px_#000000]">
        Cuenta corriente
      </h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 mx-auto text-center">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">Cliente</th>
              <th className="py-2 px-4 border-b">Localidad</th>
              <th className="py-2 px-4 border-b">Saldo</th>
              <th className="py-2 px-4 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => {
              const { texto, clase } = determinarSaldo(
                cliente.estadoCuenta?.totalDeuda || 0
              );
              console.log("Total Deuda:", cliente.estadoCuenta?.totalDeuda);

              return (
                <tr key={cliente._id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">
                    {cliente.nombre} {cliente.apellido}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {cliente.localidad?.nombre || "No disponible"}
                  </td>
                  <td className={`py-2 px-4 border-b ${clase}`}>{texto}</td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => verDetalle(cliente)}
                      className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600"
                    >
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CuentaCorrienteView;

// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const CuentaCorrienteView = () => {
//   const [clienteId, setClienteId] = useState("");
//   const [fechaInicio, setFechaInicio] = useState("");
//   const [fechaFin, setFechaFin] = useState("");
//   const [estadoCuenta, setEstadoCuenta] = useState(null);
//   const [clientes, setClientes] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");

//   useEffect(() => {
//     const fetchClientes = async () => {
//       const response = await fetch("http://localhost:3000/api/clientes");
//       const data = await response.json();
//       setClientes(data);
//     };
//     fetchClientes();
//   }, []);

//   const filteredClientes = clientes.filter((cliente) =>
//     `${cliente.nombre} ${cliente.apellido}`
//       .toLowerCase()
//       .includes(searchTerm.toLowerCase())
//   );

//   const obtenerEstadoCuenta = async () => {
//     try {
//       const response = await axios.get(
//         `http://localhost:3000/api/cuenta-corriente/${clienteId}/por-fechas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
//       );
//       setEstadoCuenta(response.data);
//     } catch (error) {
//       console.error("Error al obtener el estado de cuenta:", error);
//     }
//   };

//   const seleccionarCliente = (id) => {
//     setClienteId(id);
//     setEstadoCuenta(null); // Limpiar el estado de cuenta cuando se selecciona un nuevo cliente
//   };

//   return (
//     <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
//       <h1 className="text-2xl font-bold mb-4">Estado de Cuenta Corriente</h1>

//       <div className="mb-4">
//         <label
//           className="block text-gray-700 text-sm font-semibold mb-2"
//           htmlFor="fechaInicio"
//         >
//           Fecha Inicio
//         </label>
//         <input
//           type="date"
//           id="fechaInicio"
//           value={fechaInicio}
//           onChange={(e) => setFechaInicio(e.target.value)}
//           className="border border-gray-300 p-2 rounded w-full"
//         />
//       </div>

//       <div className="mb-4">
//         <label
//           className="block text-gray-700 text-sm font-semibold mb-2"
//           htmlFor="fechaFin"
//         >
//           Fecha Fin
//         </label>
//         <input
//           type="date"
//           id="fechaFin"
//           value={fechaFin}
//           onChange={(e) => setFechaFin(e.target.value)}
//           className="border border-gray-300 p-2 rounded w-full"
//         />
//       </div>

//       <button
//         onClick={obtenerEstadoCuenta}
//         className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
//       >
//         Consultar
//       </button>

//       <div className="mt-6">
//         <input
//           type="text"
//           placeholder="Buscar cliente"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="border border-gray-300 p-2 rounded w-full mb-4"
//         />
//         <ul className="list-disc pl-5">
//           {filteredClientes.map((cliente) => (
//             <li
//               key={cliente._id}
//               onClick={() => seleccionarCliente(cliente._id)}
//               className="cursor-pointer hover:bg-gray-100 p-2 rounded"
//             >
//               {cliente.nombre} {cliente.apellido}
//             </li>
//           ))}
//         </ul>
//       </div>

//       {estadoCuenta && (
//         <div className="mt-6 p-4 border border-gray-300 rounded bg-gray-50">
//           <h2 className="text-xl font-semibold mb-2">Resultados</h2>
//           <p>
//             <strong>Total Pagado:</strong> {estadoCuenta.totalPagado}
//           </p>
//           <p>
//             <strong>Total Deuda:</strong> {estadoCuenta.totalDeuda}
//           </p>
//           <p>
//             <strong>Total Devoluciones:</strong>{" "}
//             {estadoCuenta.totalDevoluciones}
//           </p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CuentaCorrienteView;
