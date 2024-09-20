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
        `http://localhost:3000/api/repartos/fecha/${formattedDate}`
      );
      setRepartos(response.data);
    } catch (error) {
      console.error("Error al obtener repartos por fecha:", error);
    }
  };

  const generatePDF = async () => {
    const doc = new jsPDF();
    let yPosition = 16;
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginRight = 14;

    doc.text("Reporte de Repartos - Clientes por Lista", 14, yPosition);
    yPosition += 10;

    const formattedDate = selectedDate.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    doc.text(`Fecha: ${formattedDate}`, 14, yPosition);
    yPosition += 10;

    for (const reparto of repartos) {
      for (const clienteArticulo of reparto.clientesArticulos) {
        if (clienteArticulo.clienteId.tipoCliente !== "lista") {
          continue; // Solo incluir clientes de tipo "lista"
        }

        const clienteNombre = `${clienteArticulo.clienteId.nombre} ${clienteArticulo.clienteId.apellido}`;
        doc.text(clienteNombre, 14, yPosition);
        yPosition += 10;

        clienteArticulo.articulos.forEach((articulo) => {
          const nombreArticulo = articulo.articuloId.nombre;
          const unidad = articulo.articuloId.unidad;
          const cantidad = articulo.cantidad;
          const precioUnitario = (articulo.importe / articulo.cantidad).toFixed(
            2
          );
          const importe = articulo.importe.toFixed(2);

          doc.text(
            `${cantidad} ${unidad} ${nombreArticulo}   $${precioUnitario}, Importe: $${importe}`,
            14,
            yPosition
          );
          yPosition += 10;
        });

        const totalCliente = clienteArticulo.totalCliente.toFixed(2);
        const deudaAnterior = clienteArticulo.deudaAnterior.toFixed(2);

        // Agregar texto alineado a la izquierda
        doc.text(`Deuda: $${deudaAnterior}`, 14, yPosition);

        // Agregar texto alineado a la derecha
        doc.text(
          `Importe Total: $${totalCliente}`,
          pageWidth -
            marginRight -
            doc.getTextWidth(`Importe Total: $${totalCliente}`),
          yPosition
        );

        yPosition += 5;
        doc.line(14, yPosition, pageWidth - marginRight, yPosition);
        yPosition += 5;
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 16;
          doc.text("Reporte de Repartos - Clientes por Lista", 14, yPosition);
          yPosition += 10;
        }
      }
    }

    doc.save(
      `reporte_repartos_lista_${selectedDate.toISOString().split("T")[0]}.pdf`
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
      <h1 className="text-3xl font-bold mt-6 text-left">
        Facturación de clientes por Lista
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
          {repartos.map((reparto) =>
            reparto.clientesArticulos
              .filter(
                (clienteArticulo) =>
                  clienteArticulo.clienteId.tipoCliente === "lista"
              )
              .map((clienteArticulo) => (
                <div key={clienteArticulo._id} className="border p-4 mb-4">
                  <p>{`${clienteArticulo.clienteId.nombre} ${clienteArticulo.clienteId.apellido}`}</p>
                  {clienteArticulo.articulos.map((articulo) => (
                    <p key={articulo._id}>
                      {`${articulo.cantidad} ${articulo.articuloId.unidad} ${
                        articulo.articuloId.nombre
                      } -   $${(articulo.importe / articulo.cantidad).toFixed(
                        2
                      )}, Importe: $${articulo.importe.toFixed(2)}`}
                    </p>
                  ))}
                  <p>
                    Deuda: ${clienteArticulo.deudaAnterior.toFixed(2)} Total: $
                    {clienteArticulo.totalCliente.toFixed(2)}
                  </p>
                </div>
              ))
          )}
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
          Imprimir factura
        </button>
      </div>
    </div>
  );
};

export default ListadoRepartidor;
