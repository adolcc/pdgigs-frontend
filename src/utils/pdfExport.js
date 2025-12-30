import { PDFDocument } from "pdf-lib";

export async function exportAnnotatedPdf(pages) {
  const pdfDoc = await PDFDocument.create();

  for (const p of pages) {
    
    const imgBytes = await p.imageBlob.arrayBuffer();
    let embeddedImage;
    try {
      embeddedImage = await pdfDoc.embedPng(imgBytes);
    } catch (err) {
      embeddedImage = await pdfDoc.embedJpg(imgBytes);
    }

    const { width, height } = embeddedImage.scale(1);
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width,
      height,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}