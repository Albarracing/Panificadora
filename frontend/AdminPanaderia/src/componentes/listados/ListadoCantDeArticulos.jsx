import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import es from "date-fns/locale/es";
import { imprimirPDF } from "./ImprimirListados";
registerLocale("es", es);
import API_PREFIX from "../../config/api";

const ListadoRepartidor = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [repartos, setRepartos] = useState([]);

  useEffect(() => {
    if (selectedDate) {
      obtenerRepartosPorFecha(selectedDate);
    }
  }, [selectedDate]);

  const obtenerRepartosPorFecha = async (date) => {
    const formattedDate = date.toISOString().split("T")[0];
    try {
      const response = await axios.get(
        `${API_PREFIX}/api/repartos/fecha/${formattedDate}`
      );
      setRepartos(response.data);
    } catch (error) {
      console.error("Error al obtener repartos por fecha:", error);
    }
  };

  const agruparArticulosPorLugar = () => {
    const groupedArticulos = {};

    repartos.forEach((reparto) => {
      reparto.clientesArticulos.forEach((clienteArticulo) => {
        clienteArticulo.articulos.forEach((articulo) => {
          const lugar = articulo.articuloId.lugarPreparacion;
          if (!groupedArticulos[lugar]) {
            groupedArticulos[lugar] = {};
          }
          if (!groupedArticulos[lugar][articulo.articuloId.nombre]) {
            groupedArticulos[lugar][articulo.articuloId.nombre] = 0;
          }
          groupedArticulos[lugar][articulo.articuloId.nombre] +=
            articulo.cantidad;
        });
      });
    });

    return groupedArticulos;
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const groupedArticulos = agruparArticulosPorLugar();

    Object.keys(groupedArticulos).forEach((lugar, index) => {
      if (index > 0) {
        doc.addPage(); // Add a new page for each lugar
      }
      let yPosition = 16; // Initial vertical position for the content

      doc.text(`Lugar de Preparación: ${lugar}`, 14, yPosition);
      yPosition += 10; // Move down

      Object.keys(groupedArticulos[lugar]).forEach((articuloNombre) => {
        doc.text(
          `${articuloNombre}: ${groupedArticulos[lugar][articuloNombre]}`,
          14,
          yPosition
        );
        yPosition += 10; // Move down

        if (yPosition > 270) {
          doc.addPage();
          yPosition = 16; // Reset position for new page
          doc.text(`Lugar de Preparación: ${lugar}`, 14, yPosition);
          yPosition += 10; // Move position down for the content
        }
      });
    });
    imprimirPDF(doc);
    // doc.save(
    //   `reporte_produccion_articulos_${
    //     selectedDate.toISOString().split("T")[0]
    //   }.pdf`
    // );
  };

  const groupedArticulos = agruparArticulosPorLugar();

  return (
    <div className="container mx-auto p-6 bg-white rounded-md shadow-md">
      <Link
        to="/Listados"
        className="mt-4 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Volver
      </Link>
      <h1 className="text-3xl font-bold mt-6 text-left">
        Cantidad de articulos
      </h1>
      <h1 className="text-center text-red-600 mb-2">Seleccione una fecha</h1>
      <div className="flex justify-center mb-6">
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          locale="es"
          dateFormat="dd/MM/yyyy"
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>
      {repartos.length > 0 ? (
        <div>
          {Object.keys(groupedArticulos).map((lugar) => (
            <div key={lugar} className="mb-6">
              <h2 className="text-2xl font-bold mb-4">
                Lugar de Preparación: {lugar}
              </h2>
              <ul className="list-disc pl-6">
                {Object.keys(groupedArticulos[lugar]).map((articuloNombre) => (
                  <li key={articuloNombre} className="mb-2">
                    {articuloNombre}: {groupedArticulos[lugar][articuloNombre]}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-red-500">
          No hay repartos para la fecha seleccionada.
        </div>
      )}
      <div className="flex justify-end mt-6">
        <button
          onClick={generatePDF}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Generar PDF
        </button>
      </div>
    </div>
  );
};

export default ListadoRepartidor;
