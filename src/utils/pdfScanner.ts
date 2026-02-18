import { PDFDocument } from 'pdf-lib';

export async function createPDFFromImages(imageDataUrls: string[], filename: string): Promise<void> {
  const pdfDoc = await PDFDocument.create();

  for (const dataUrl of imageDataUrls) {
    const imageBytes = await fetch(dataUrl).then(res => res.arrayBuffer());

    let image;
    if (dataUrl.includes('image/png')) {
      image = await pdfDoc.embedPng(imageBytes);
    } else {
      image = await pdfDoc.embedJpg(imageBytes);
    }

    const { width, height } = image.scale(1);

    const page = pdfDoc.addPage([width, height]);

    page.drawImage(image, {
      x: 0,
      y: 0,
      width,
      height,
    });
  }

  const pdfBytes = await pdfDoc.save();

  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
