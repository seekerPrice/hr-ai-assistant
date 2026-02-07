import { PDFDocument, rgb, degrees } from 'pdf-lib';

const WATERMARK_TEXT = 'for LAWZ.AI only';

/**
 * Add watermark to an image file using Canvas API
 */
export function addWatermarkToImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Configure watermark style
      ctx.save();
      ctx.globalAlpha = 0.3;
      const fontSize = Math.max(img.width / 15, 24);
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillStyle = 'rgba(128, 128, 128, 0.8)';
      ctx.textAlign = 'center';

      // Rotate and draw diagonal watermark (repeated pattern)
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 4);

      // Draw multiple lines for full coverage
      const lineSpacing = fontSize * 2.5;
      for (let i = -5; i <= 5; i++) {
        ctx.fillText(WATERMARK_TEXT, 0, i * lineSpacing);
      }

      ctx.restore();

      // Convert to base64
      resolve(canvas.toDataURL(file.type));

      // Clean up object URL
      URL.revokeObjectURL(img.src);
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Add watermark to a PDF file using pdf-lib
 */
export async function addWatermarkToPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();

  pages.forEach((page) => {
    const { width, height } = page.getSize();

    // Draw multiple watermark lines for coverage
    const fontSize = 48;
    const lineSpacing = 150;

    for (let i = -3; i <= 3; i++) {
      page.drawText(WATERMARK_TEXT, {
        x: width / 2,
        y: height / 2 + i * lineSpacing,
        size: fontSize,
        color: rgb(0.5, 0.5, 0.5),
        opacity: 0.3,
        rotate: degrees(-45),
      });
    }
  });

  const pdfBytes = await pdfDoc.save();

  // Convert Uint8Array to base64
  let binary = '';
  const bytes = new Uint8Array(pdfBytes);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);

  return `data:application/pdf;base64,${base64}`;
}

/**
 * Main function to watermark any supported document type
 */
export async function watermarkDocument(file: File): Promise<string> {
  if (file.type === 'application/pdf') {
    return addWatermarkToPDF(file);
  } else if (['image/jpeg', 'image/png'].includes(file.type)) {
    return addWatermarkToImage(file);
  }
  throw new Error(`Unsupported file type: ${file.type}`);
}
