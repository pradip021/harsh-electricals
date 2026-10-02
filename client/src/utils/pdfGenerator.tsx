import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { layoutQuotationDocument, PAGE_HEIGHT, PAGE_WIDTH, QuotationDocumentData } from './quotationDocument';
import { getPrintableSignature } from './signature';

const waitForImages = (element: HTMLElement) =>
  Promise.all(Array.from(element.getElementsByTagName('img')).map((img) => (
    img.complete ? Promise.resolve() : new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
    })
  )));

/**
 * Generate an A4 PDF from quotation data, one PDF page per page of the shared document layout
 * (the same pages the live preview shows).
 */
export const generateQuotationPDF = async (quotation: QuotationDocumentData) => {
  const host = document.createElement('div');
  host.style.position = 'absolute';
  host.style.left = '-10000px';
  host.style.top = '0';
  document.body.appendChild(host);

  try {
    const pages = layoutQuotationDocument(quotation, await getPrintableSignature(quotation));
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    for (const [index, pageHtml] of pages.entries()) {
      host.innerHTML = pageHtml;
      const page = host.firstElementChild as HTMLElement;
      await waitForImages(page);

      const canvas = await html2canvas(page, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
      });

      if (index > 0) pdf.addPage('a4', 'portrait');
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297);
    }

    pdf.save(`Quotation_${quotation.clientName}_${quotation.date}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  } finally {
    host.remove();
  }
};
