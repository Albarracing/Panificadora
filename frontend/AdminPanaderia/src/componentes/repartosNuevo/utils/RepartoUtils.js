import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generarPDF = (clientesArticulos) => {
  const doc = new jsPDF();

  // Título del documento
  doc.setFontSize(18);
  doc.text("Detalles del Reparto", 14, 20);

  // Obtener la fecha actual
  const fechaActual = new Date().toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  doc.setFontSize(12);
  doc.text(`Fecha: ${fechaActual}`, 14, 30);

  // Datos para la tabla
  const rows = [];
  let totalReparto = 0;

  clientesArticulos.forEach((clienteArticulo) => {
    const nombreCliente = `${clienteArticulo.clienteId.nombre} ${clienteArticulo.clienteId.apellido}`;
    const pago = clienteArticulo.pagadoCompleto
      ? `Pagado completo: $${clienteArticulo.totalCliente.toFixed(2)}`
      : `Monto pagado: $${clienteArticulo.montoPagado.toFixed(2)}`;

    clienteArticulo.articulos.forEach((articulo, index) => {
      if (index === 0) {
        rows.push([
          nombreCliente,
          articulo.articuloId.nombre,
          articulo.cantidad,
          `$${articulo.importe.toFixed(2)}`,
          `${articulo.cantidadDevuelta || 0}`,
          pago,
          clienteArticulo.deuda.toFixed(2),
          clienteArticulo.totalCliente.toFixed(2),
        ]);
        totalReparto += clienteArticulo.totalCliente;
      } else {
        rows.push([
          "",
          articulo.articuloId.nombre,
          articulo.cantidad,
          `$${articulo.importe.toFixed(2)}`,
          `${articulo.cantidadDevuelta || 0}`,
          "",
          "",
          "",
        ]);
      }
    });
  });

  const columns = [
    { header: "Cliente", dataKey: "cliente" },
    { header: "Artículo", dataKey: "articulo" },
    { header: "Cantidad", dataKey: "cantidad" },
    { header: "Importe", dataKey: "importe" },
    { header: "Devolución", dataKey: "devolucion" },
    { header: "Pago", dataKey: "pago" },
    { header: "Deuda", dataKey: "deuda" },
    { header: "Total", dataKey: "total" },
  ];

  autoTable(doc, {
    head: [columns.map((col) => col.header)],
    body: rows,
    startY: 40,
    theme: "grid",
  });

  doc.setFontSize(14);
  doc.text(
    `Importe total del reparto: $${totalReparto.toFixed(2)}`,
    14,
    doc.autoTable.previous.finalY + 10
  );

  const pdfBlob = doc.output("blob");
  const blobUrl = URL.createObjectURL(pdfBlob);

  const printWindow = window.open(blobUrl, "_blank");
  printWindow.onload = () => printWindow.print();
};

// Función para validar cantidades devueltas
export const validarCantidadDevuelta = (cantidadDevuelta, cantidadOriginal) => {
  const cantidad = parseFloat(cantidadDevuelta);
  if (isNaN(cantidad) || cantidad < 0) {
    return 0;
  }
  return Math.min(cantidad, cantidadOriginal);
};


// Función para calcular el nuevo importe
export const calcularNuevoImporte = (cantidad, cantidadDevuelta, importeOriginal) => {
  const cantidadEfectiva = Math.max(0, cantidad - (cantidadDevuelta || 0));
  const precioUnitario = importeOriginal / cantidad;
  return Number((cantidadEfectiva * precioUnitario).toFixed(2));
};

// Función para validar la operación
export const validarOperacion = (articulo, cantidadDevuelta) => {
  const errores = [];
  
  if (!articulo) {
    errores.push('Artículo no encontrado');
    return { valido: false, errores };
  }

  if (cantidadDevuelta > articulo.cantidad) {
    errores.push(`La cantidad devuelta (${cantidadDevuelta}) no puede ser mayor que la cantidad original (${articulo.cantidad})`);
  }

  if (cantidadDevuelta < 0) {
    errores.push('La cantidad devuelta no puede ser negativa');
  }

  return {
    valido: errores.length === 0,
    errores
  };
};