import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import es from "date-fns/locale/es";
registerLocale("es", es);

const ListadoRepartos = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [repartos, setRepartos] = useState([]);
  const [gruposRepartos, setGruposRepartos] = useState({});

  useEffect(() => {
    if (selectedDate) {
      obtenerRepartosPorFecha(selectedDate);
    }
  }, [selectedDate]);

  const obtenerRepartosPorFecha = async (date) => {
    const formattedDate = date.toISOString().split("T")[0];
    try {
      const response = await axios.get(
        `http://localhost:3000/api/repartos/fecha/${formattedDate}`
      );
      console.log("Repartos obtenidos:", response.data);
      const grupos = agruparPorLugarPreparacion(response.data);
      setRepartos(response.data);
      setGruposRepartos(grupos);
    } catch (error) {
      console.error("Error al obtener repartos por fecha:", error);
    }
  };

  const agruparPorLugarPreparacion = (repartos) => {
    const grupos = {};
    repartos.forEach((reparto) => {
      reparto.clientesArticulos.forEach((clienteArticulo) => {
        clienteArticulo.articulos.forEach((articulo) => {
          const lugarPreparacion = articulo.articuloId.lugarPreparacion;
          if (!grupos[lugarPreparacion]) {
            grupos[lugarPreparacion] = [];
          }
          grupos[lugarPreparacion].push({
            cliente: `${clienteArticulo.clienteId.nombre} ${clienteArticulo.clienteId.apellido}`,
            articulo: articulo.articuloId.nombre,
            cantidad: articulo.cantidad,
            localidad:
              clienteArticulo.clienteId.localidad?.nombre || "Desconocida",
            vuelta: clienteArticulo.clienteId.vuelta,
          });
        });
      });
    });
    return grupos;
  };

  const generatePDF = (lugarPreparacion, datos, selectedDate) => {
    if (!selectedDate) {
      console.error("No se ha seleccionado ninguna fecha.");
      return;
    }

    const doc = new jsPDF();

    // Asegurarse de que selectedDate no es undefined
    const formattedDate = selectedDate
      ? selectedDate.toLocaleDateString("es-ES")
      : "Fecha no disponible";

    doc.text(`Fecha: ${formattedDate}`, 14, 22);
    doc.text(`Reporte de Repartos - ${lugarPreparacion}`, 14, 14);

    if (!datos.length) {
      console.error(
        `No hay datos para generar el PDF para ${lugarPreparacion}.`
      );
      return;
    }

    // Ordenar por vuelta y luego por localidad
    datos.sort(
      (a, b) => a.vuelta - b.vuelta || a.localidad.localeCompare(b.localidad)
    );

    const tableBody = [];
    let currentVuelta = null;
    let currentLocalidad = null;

    datos.forEach(({ cliente, articulo, cantidad, localidad, vuelta }) => {
      if (vuelta !== currentVuelta) {
        currentVuelta = vuelta;
        currentLocalidad = null;
        tableBody.push([
          {
            content: `Vuelta ${vuelta}`,
            colSpan: 3,
            styles: { halign: "center", fillColor: [220, 220, 220] },
          },
        ]);
      }
      if (localidad !== currentLocalidad) {
        currentLocalidad = localidad;
        tableBody.push([
          {
            content: localidad,
            colSpan: 3,
            styles: { halign: "center", fillColor: [240, 240, 240] },
          },
        ]);
      }
      tableBody.push([cliente, articulo, cantidad]);
    });

    doc.autoTable({
      head: [["Cliente", "Artículo", "Cantidad"]],
      body: tableBody,
      startY: 30,
    });

    doc.save(
      `reporte_repartos_${lugarPreparacion}_${
        selectedDate.toISOString().split("T")[0]
      }.pdf`
    );
  };

  return (
    <div className="container mx-auto p-6 bg-white rounded-md shadow-md">
      <Link
        to="/Listados"
        className="mt-4 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Volver
      </Link>
      <h1 className="text-3xl font-bold mb-6 text-center">
        Repartos por Fecha
      </h1>
      <div className="flex justify-center mb-6">
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          locale="es"
          dateFormat="dd/MM/yyyy"
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>
      <div className="mt-6">
        {Object.keys(gruposRepartos).map((lugarPreparacion) => (
          <div key={lugarPreparacion} className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{lugarPreparacion}</h2>
            <table className="min-w-full bg-white border rounded-md">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">Cliente</th>
                  <th className="px-4 py-2 border">Artículo</th>
                  <th className="px-4 py-2 border">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {gruposRepartos[lugarPreparacion]
                  .sort(
                    (a, b) =>
                      a.vuelta - b.vuelta ||
                      a.localidad.localeCompare(b.localidad)
                  )
                  .map(
                    (
                      { cliente, articulo, cantidad, vuelta, localidad },
                      index
                    ) => (
                      <React.Fragment key={index}>
                        {(index === 0 ||
                          gruposRepartos[lugarPreparacion][index - 1].vuelta !==
                            vuelta) && (
                          <tr>
                            <td
                              colSpan="3"
                              className="text-center bg-gray-200 font-bold"
                            >
                              Vuelta {vuelta}
                            </td>
                          </tr>
                        )}
                        {(index === 0 ||
                          gruposRepartos[lugarPreparacion][index - 1]
                            .localidad !== localidad) && (
                          <tr>
                            <td colSpan="3" className="text-center bg-gray-100">
                              {localidad}
                            </td>
                          </tr>
                        )}
                        <tr>
                          <td className="px-4 py-2 border">{cliente}</td>
                          <td className="px-4 py-2 border">{articulo}</td>
                          <td className="px-4 py-2 border">{cantidad}</td>
                        </tr>
                      </React.Fragment>
                    )
                  )}
              </tbody>
            </table>
            <button
              onClick={() =>
                generatePDF(
                  lugarPreparacion,
                  gruposRepartos[lugarPreparacion],
                  selectedDate
                )
              }
              className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Imprimir Reporte de {lugarPreparacion}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListadoRepartos;
