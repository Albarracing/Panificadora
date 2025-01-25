import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import es from "date-fns/locale/es";
import { imprimirPDF } from "./ImprimirListados";
registerLocale("es", es);
import API_PREFIX from "../../config/api";

const FacturacionIndividual = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [facturas, setFacturas] = useState([]);
  const [repartos, setRepartos] = useState([]); // Nueva variable de estado

  useEffect(() => {
    console.log("Fecha seleccionada:", selectedDate);
    if (selectedDate) {
      setTimeout(() => {
        obtenerFacturasPorFecha(selectedDate);
      }, 100); // Pequeño retraso
    }
  }, [selectedDate]);

  // Función para obtener los repartos del backend
  const obtenerFacturasPorFecha = async (fecha) => {
    const formattedDate = fecha.toISOString().split("T")[0];
    try {
      const response = await fetch(
        `S${API_PREFIX}/api/repartos/fecha/${formattedDate}`
      );
      const data = await response.json();

      console.log("Datos recibidos del backend:", data); // Para ver lo que llega del backend

      setRepartos(data); // Guardamos los datos de los repartos
      const facturasGeneradas = generarFacturas(data); // Generamos las facturas usando los repartos

      console.log("Facturas generadas:", facturasGeneradas); // Para ver las facturas generadas

      setFacturas(facturasGeneradas); // Guardamos las facturas generadas en el estado
    } catch (error) {
      console.error("Error al obtener las facturas:", error);
    }
  };

  // Función para generar las facturas basadas en los repartos
  const generarFacturas = (repartos) => {
    const facturas = [];

    repartos.forEach((reparto) => {
      console.log("Procesando reparto:", reparto); // Para ver cada reparto que se procesa

      reparto.clientesArticulos.forEach((clienteArticulo) => {
        console.log("Procesando clienteArticulo:", clienteArticulo); // Para ver cada clienteArticulo

        if (clienteArticulo.clienteId.tipoCliente === "individual") {
          const factura = {
            cliente: `${clienteArticulo.clienteId.nombre} ${clienteArticulo.clienteId.apellido}`,
            direccion: clienteArticulo.clienteId.direccion,
            articulos: clienteArticulo.articulos.map((articulo) => ({
              nombre: articulo.articuloId.nombre,
              precio: articulo.precio
                ? articulo.precio
                : (articulo.importe / articulo.cantidad).toFixed(2),
              cantidad: articulo.cantidad,
              importe: articulo.importe,
            })),
            total: clienteArticulo.articulos.reduce(
              (acc, articulo) => acc + articulo.importe,
              0
            ),
          };

          console.log("Factura creada:", factura); // Para ver cada factura creada

          facturas.push(factura);
        }
      });
    });

    return facturas;
  };

  const generatePDF = async (factura, fechaSeleccionada) => {
    const doc = new jsPDF();

    const formattedDate = new Date(fechaSeleccionada).toLocaleDateString();

    doc.setFontSize(12);
    doc.text("Panaderia Teodelina", 105, 20, { align: "center" });
    doc.text("9 de julio 130 Teodelina-Santa Fe", 105, 26, { align: "center" });
    doc.text(`Fecha de Emisión: ${formattedDate}`, 105, 36, {
      align: "center",
    });

    doc.setFontSize(10);
    doc.text(`Cliente: ${factura.cliente}`, 14, 50);
    doc.text(`Dirección: ${factura.direccion}`, 14, 56);

    const tableData = factura.articulos.map((articulo) => [
      articulo.nombre,
      articulo.cantidad,
      `$${Number(articulo.precio).toFixed(2)}`,
      `$${Number(articulo.importe).toFixed(2)}`,
    ]);

    doc.autoTable({
      startY: 70,
      head: [["Descripción", "Cantidad", "Precio unidad", "Importe"]],
      body: tableData,
      theme: "striped",
      styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] },
      headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] },
    });

    const subtotalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Total: $${factura.total.toFixed(2)}`, 190, subtotalY, {
      align: "right",
    });

    // Enviar a imprimir en lugar de guardar
    await imprimirPDF(doc);
  };

  const generateAllPDFs = async () => {
    for (const factura of facturas) {
      await generatePDF(factura, selectedDate);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white rounded-md shadow-md">
      <Link
        to="/Listados"
        className="mt-4 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Volver
      </Link>
      <h1 className="text-3xl font-bold mt-5 text-left">
        Facturación individual
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
      <div className="mt-6">
        {facturas.map((factura, index) => (
          <div key={index} className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{factura.cliente}</h2>
            <table className="min-w-full bg-white border rounded-md">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">Descripción</th>
                  <th className="px-4 py-2 border">Cantidad</th>
                  <th className="px-4 py-2 border">Precio unidad</th>
                  <th className="px-4 py-2 border">Importe</th>
                </tr>
              </thead>
              <tbody>
                {factura.articulos.map((articulo, i) => (
                  <tr key={i} className="text-center">
                    <td className="px-4 py-2 border">{articulo.nombre}</td>
                    <td className="px-4 py-2 border">{articulo.cantidad}</td>
                    <td className="px-4 py-2 border">${articulo.precio}</td>
                    <td className="px-4 py-2 border">
                      ${articulo.importe.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-right">
              <strong>Total:</strong> ${factura.total.toFixed(2)}
            </p>

            <button
              onClick={() => generatePDF(factura, selectedDate)}
              className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Imprimir Factura
            </button>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <button
          onClick={generateAllPDFs}
          className="mb-6 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Imprimir Todas las Facturas
        </button>
      </div>
    </div>
  );
};

export default FacturacionIndividual;
