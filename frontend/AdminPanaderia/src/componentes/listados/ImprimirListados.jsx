export const imprimirPDF = (doc) => {
  // Generar el Blob del PDF
  const pdfBlob = doc.output("blob");

  // Crear una URL para el Blob y abrirla en una nueva ventana
  const pdfUrl = URL.createObjectURL(pdfBlob);
  const printWindow = window.open(pdfUrl);

  // Esperar a que cargue y lanzar la impresión
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};
