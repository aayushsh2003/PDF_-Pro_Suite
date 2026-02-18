import { PDFDocument, PDFPage, rgb } from 'pdf-lib';

export async function mergePDFs(files: File[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save();
}

export async function splitPDF(file: File): Promise<Uint8Array[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const pageCount = pdf.getPageCount();
  const pdfs: Uint8Array[] = [];

  for (let i = 0; i < pageCount; i++) {
    const newPdf = await PDFDocument.create();
    const [copiedPage] = await newPdf.copyPages(pdf, [i]);
    newPdf.addPage(copiedPage);
    const pdfBytes = await newPdf.save();
    pdfs.push(pdfBytes);
  }

  return pdfs;
}

export async function rotatePDF(file: File, rotation: number): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const pages = pdf.getPages();

  pages.forEach((page) => {
    const currentRotation = page.getRotation().angle;
    page.setRotation({ type: 'degrees', angle: (currentRotation + rotation) % 360 });
  });

  return await pdf.save();
}

export async function extractPages(file: File, pageNumbers: number[]): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const newPdf = await PDFDocument.create();

  const pageIndices = pageNumbers.map(n => n - 1).filter(i => i >= 0 && i < pdf.getPageCount());
  const copiedPages = await newPdf.copyPages(pdf, pageIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  return await newPdf.save();
}

export async function reorderPages(file: File, newOrder: number[]): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const newPdf = await PDFDocument.create();

  const validOrder = newOrder.filter(i => i >= 0 && i < pdf.getPageCount());
  const copiedPages = await newPdf.copyPages(pdf, validOrder);
  copiedPages.forEach((page) => newPdf.addPage(page));

  return await newPdf.save();
}

export async function compressPDF(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);

  return await pdf.save();
}

export async function deletePDFPages(file: File, pageNumbers: number[]): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const pageCount = pdf.getPageCount();

  const pageIndexesToDelete = pageNumbers
    .map(n => n - 1)
    .filter(i => i >= 0 && i < pageCount)
    .sort((a, b) => b - a);

  pageIndexesToDelete.forEach(index => {
    pdf.removePage(index);
  });

  return await pdf.save();
}

export async function duplicatePDFPages(file: File, pageNumbers: number[], times: number): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const newPdf = await PDFDocument.create();

  const pageCount = pdf.getPageCount();
  const pagesToDuplicate = new Set(pageNumbers.map(n => n - 1).filter(i => i >= 0 && i < pageCount));

  for (let i = 0; i < pageCount; i++) {
    const [page] = await newPdf.copyPages(pdf, [i]);
    newPdf.addPage(page);

    if (pagesToDuplicate.has(i)) {
      for (let j = 0; j < times; j++) {
        const [dupPage] = await newPdf.copyPages(pdf, [i]);
        newPdf.addPage(dupPage);
      }
    }
  }

  return await newPdf.save();
}

export async function addWatermark(file: File, text: string, opacity: number): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const pages = pdf.getPages();

  pages.forEach((page) => {
    const { width, height } = page.getSize();
    page.drawText(text, {
      x: width / 2 - text.length * 3,
      y: height / 2,
      size: 40,
      color: rgb(0.5, 0.5, 0.5),
      opacity: opacity / 100,
      rotate: -45,
    });
  });

  return await pdf.save();
}

export async function removeDuplicatePages(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const pages = pdf.getPages();
  const newPdf = await PDFDocument.create();

  const seenHashes = new Set<string>();

  for (let i = 0; i < pages.length; i++) {
    const pageHash = `${pages[i].getWidth()}-${pages[i].getHeight()}`;
    if (!seenHashes.has(pageHash)) {
      seenHashes.add(pageHash);
      const [copiedPage] = await newPdf.copyPages(pdf, [i]);
      newPdf.addPage(copiedPage);
    }
  }

  return await newPdf.save();
}

export async function reversePageOrder(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const newPdf = await PDFDocument.create();

  const indices = pdf.getPageIndices().reverse();
  const copiedPages = await newPdf.copyPages(pdf, indices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  return await newPdf.save();
}

export async function addPageNumbers(file: File, position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right', startNumber: number = 1): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const pages = pdf.getPages();

  pages.forEach((page, index) => {
    const { width, height } = page.getSize();
    const pageNumber = (startNumber + index).toString();

    let x = 0;
    let y = 0;

    switch (position) {
      case 'top-left':
        x = 30;
        y = height - 30;
        break;
      case 'top-center':
        x = width / 2 - pageNumber.length * 3;
        y = height - 30;
        break;
      case 'top-right':
        x = width - 50;
        y = height - 30;
        break;
      case 'bottom-left':
        x = 30;
        y = 30;
        break;
      case 'bottom-center':
        x = width / 2 - pageNumber.length * 3;
        y = 30;
        break;
      case 'bottom-right':
        x = width - 50;
        y = 30;
        break;
    }

    page.drawText(pageNumber, {
      x,
      y,
      size: 12,
      color: rgb(0.3, 0.3, 0.3),
    });
  });

  return await pdf.save();
}

export async function convertToGrayscale(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);

  return await pdf.save();
}

export async function editMetadata(file: File, metadata: { title?: string; author?: string; subject?: string; keywords?: string[] }): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);

  if (metadata.title !== undefined) {
    pdf.setTitle(metadata.title);
  }
  if (metadata.author !== undefined) {
    pdf.setAuthor(metadata.author);
  }
  if (metadata.subject !== undefined) {
    pdf.setSubject(metadata.subject);
  }
  if (metadata.keywords !== undefined) {
    pdf.setKeywords(metadata.keywords);
  }

  return await pdf.save();
}

export async function insertBlankPages(file: File, positions: number[], pageSize?: { width: number; height: number }): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);

  const firstPage = pdf.getPages()[0];
  const defaultSize = pageSize || { width: firstPage.getWidth(), height: firstPage.getHeight() };

  const sortedPositions = [...positions].sort((a, b) => b - a);

  for (const position of sortedPositions) {
    pdf.insertPage(position, [defaultSize.width, defaultSize.height]);
  }

  return await pdf.save();
}

export async function getPDFPageCount(file: File): Promise<number> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  return pdf.getPageCount();
}

export async function getPDFMetadata(file: File): Promise<{ title: string; author: string; subject: string; creator: string; producer: string; creationDate: Date | undefined; modificationDate: Date | undefined }> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);

  return {
    title: pdf.getTitle() || '',
    author: pdf.getAuthor() || '',
    subject: pdf.getSubject() || '',
    creator: pdf.getCreator() || '',
    producer: pdf.getProducer() || '',
    creationDate: pdf.getCreationDate(),
    modificationDate: pdf.getModificationDate(),
  };
}

export function downloadPDF(pdfBytes: Uint8Array, filename: string) {
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
