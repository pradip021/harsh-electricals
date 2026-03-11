import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Quotation } from '../types';

/**
 * Generate PDF from quotation data
 * @param {Quotation} quotation - Quotation data
 */
export const generateQuotationPDF = async (quotation: Quotation) => {
  try {
    // Create a temporary container for PDF content
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '210mm'; // A4 width
    container.style.padding = '15mm 20mm';
    container.style.backgroundColor = 'white';
    container.style.fontFamily = 'Arial, sans-serif';

    // Build the HTML content with logo and letterhead
    container.innerHTML = `
      <div style="width: 100%; color: #000; box-sizing: border-box; padding: 0;">
        <!-- Header Section -->
        <div style="width: 100%; margin-bottom: 5px; position: relative; min-height: 140px;">
          <!-- Top Tagline Area -->
          <div style="display: flex; justify-content: center; align-items: flex-start; margin-bottom: 2px;">
            <div style="flex: 1;"></div>
            <div style="flex: 2; text-align: center;">
              <p style="color: #b91c1c; font-size: 14px; margin: 0; font-weight: bold; font-family: Arial, sans-serif;">Shri Ganeshay Namha</p>
            </div>
            <!-- Contact Section (Top Right) -->
            <div style="flex: 1; text-align: right;">
                <p style="margin: 0; font-size: 15px; color: #003366; font-weight: bold; white-space: nowrap;">9820746778</p>
                <p style="margin: 1px 0 0 0; font-size: 15px; color: #003366; font-weight: bold; white-space: nowrap;">7021129292</p>
            </div>
          </div>

          <div style="display: flex; align-items: center; justify-content: center; margin-top: -15px;">
            <!-- Logo Section (Absolute Left) -->
            <div style="position: absolute; left: 0; top: 10px;">
              <svg width="70" height="70" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                <path d="M350 100L180 280H260L162 412L332 232H252L350 100Z" fill="#b91c1c"/>
              </svg>
            </div>

            <!-- Company Info Section -->
            <div style="text-align: center; padding: 0 40px;">
              <h1 style="color: #b91c1c; font-size: 28px; margin: 0; font-weight: 900; font-family: 'Arial Black', Gadget, sans-serif; text-transform: capitalize; white-space: nowrap; letter-spacing: 0.5px;">
                Harsh Electricals Works
              </h1>
              <div style="color: #003366; margin-top: 2px;">
                <p style="margin: 1px 0; font-size: 15px; font-weight: bold;">Govt Licence Electrical Works</p>
                <p style="margin: 1px 0; font-size: 12px; font-weight: bold;">All Type Of Electric & Civil Works.</p>
                <p style="margin: 3px 0; font-size: 10px; line-height: 1.3; color: #444;">
                  House Wiring, Show Room, Hotel, Factory Wiring, Meter Board Wiring,<br>
                  Society Maintenance, all Electrical Equipment Reparing
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Single Solid Red Line -->
        <div style="border-top: 2px solid #b91c1c; margin-bottom: 5px;"></div>

        <!-- Address Section -->
        <div style="text-align: center; margin-bottom: 15px;">
          <p style="margin: 0; font-size: 11px; color: #003366; font-weight: 500;">
            Shop No. 25, Jay Ambey Nagar, Near Hotal Narayan Bhavan Bhayander (E) 401101.
          </p>
        </div>

        <!-- Quotation Info Section -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 12px;">
          <div>
            <p style="margin: 0;">Ref: ${quotation.ref || ''}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0;">Date: ${new Date(quotation.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}</p>
          </div>
        </div>

        <!-- Client Address Section -->
        <div style="margin-bottom: 15px; font-size: 12px; line-height: 1.4;">
          <p style="margin: 0; font-weight: bold;">To,</p>
          <p style="margin: 0; font-weight: bold;">${quotation.clientName}</p>
          <div style="margin: 0; white-space: pre-wrap;">${quotation.clientAddress || ''}</div>
        </div>

        <!-- Subject Section -->
        <div style="margin-bottom: 15px; text-align: center;">
          <p style="margin: 0; font-weight: bold; text-decoration: underline; font-size: 13px;">
            ${quotation.subject ? `Sub : ${quotation.subject}` : ''}
          </p>
        </div>

        <!-- Message Section -->
        <div style="margin-bottom: 15px; font-size: 12px; line-height: 1.4;">
          <p style="margin: 0;">${quotation.message || 'Dear Sir,'}</p>
        </div>

        <!-- Items Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; background-color: white; border: 1px solid #000;">
          <thead>
            <tr style="background-color: #f8fafc; border-bottom: 2px solid #000; height: 45px;">
              <th style="padding: 0 5px; text-align: center; width: 50px; border: 1px solid #000; font-size: 11px; vertical-align: middle; font-weight: 900; text-transform: uppercase;">Sr. No.</th>
              <th style="padding: 0 12px; text-align: left; border: 1px solid #000; font-size: 11px; vertical-align: middle; font-weight: 900; text-transform: uppercase;">Point Description</th>
              <th style="padding: 0 5px; text-align: center; width: 70px; border: 1px solid #000; font-size: 11px; vertical-align: middle; font-weight: 900; text-transform: uppercase;">Qty.</th>
              <th style="padding: 0 5px; text-align: center; width: 90px; border: 1px solid #000; font-size: 11px; vertical-align: middle; font-weight: 900; text-transform: uppercase;">Rate</th>
              <th style="padding: 0 5px; text-align: center; width: 110px; border: 1px solid #000; font-size: 11px; vertical-align: middle; font-weight: 900; text-transform: uppercase;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${quotation.items.map((item, index) => {
      let displaySr: any = (item as any).srNo;
      if (!displaySr) {
        let count = 0;
        for (let i = 0; i <= index; i++) {
          if (!quotation.items[i].isSection) count++;
        }
        displaySr = quotation.items[index].isSection ? '#' : count;
      }

      if (item.isSection) {
        return `
                  <tr style="background-color: #f1f5f9; height: 30px;">
                    <td colspan="5" style="padding: 0 10px; border: 1px solid #000; font-size: 12px; font-weight: 900; text-align: center; text-transform: uppercase; letter-spacing: 4px; vertical-align: middle;">
                      — ${item.pointName} —
                    </td>
                  </tr>
                `;
      }
      return `
                <tr>
                  <td style="padding: 6px 5px; text-align: center; border: 1px solid #000; font-size: 11px; vertical-align: middle;">${displaySr}</td>
                  <td style="padding: 6px 12px; border: 1px solid #000; font-size: 11px; vertical-align: middle; color: #1e293b; font-weight: 500;">
                    <div style="margin: 0;">${item.pointName}</div>
                    ${item.description ? `<div style="font-size: 9px; color: #64748b; margin-top: 3px; font-weight: 400; line-height: 1.3;">${item.description.replace(/\n/g, '<br>')}</div>` : ''}
                  </td>
                  <td style="padding: 6px 5px; text-align: center; border: 1px solid #000; font-size: 11px; vertical-align: middle; font-weight: 600;">
                    ${(!item.qty || item.qty === '0' || item.qty === 0)
          ? 'L.S.'
          : (item.unit && item.unit !== 'Nos' && item.unit !== 'Text')
            ? `${item.qty} ${item.unit}`
            : item.qty
        }
                  </td>
                  <td style="padding: 6px 5px; text-align: center; border: 1px solid #000; font-size: 11px; vertical-align: middle; font-weight: 600;">${item.rate === 0 ? 'L.S.' : Number(item.rate).toFixed(2)}</td>
                  <td style="padding: 6px 5px; text-align: center; border: 1px solid #000; font-size: 11px; vertical-align: middle; color: #b91c1c; font-weight: 800; white-space: nowrap;">${(item.amount || 0).toFixed(2)}</td>
                </tr>
              `;
    }).join('')}
          </tbody>
          <tfoot>
            ${quotation.gstEnabled ? `
              <tr>
                <td colspan="4" style="padding: 4px 10px; text-align: right; font-size: 10px; border: 1px solid #000;">Subtotal</td>
                <td style="padding: 4px 10px; text-align: right; font-size: 10px; border: 1px solid #000; font-weight: bold;">
                  ₹${(Number(quotation.totalAmount) - (Number((quotation as any).gstAmount) || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
              <tr>
                <td colspan="4" style="padding: 4px 10px; text-align: right; font-size: 10px; border: 1px solid #000;">GST (${quotation.gstRate}%)</td>
                <td style="padding: 4px 10px; text-align: right; font-size: 10px; border: 1px solid #000; font-weight: bold;">
                  ₹${(Number((quotation as any).gstAmount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ` : ''}
            <tr>
              <td colspan="4" style="padding: 6px 10px; text-align: right; font-size: 11px; font-weight: bold; border: 1px solid #000; background-color: #f9fafb;">
                ${quotation.gstEnabled ? 'Grand Total' : 'Total'}
              </td>
              <td style="padding: 6px 10px; text-align: right; font-size: 12px; font-weight: bold; border: 1px solid #000; background-color: #f9fafb;">
                ₹${Number(quotation.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
          </tfoot>
        </table>

        <!-- Note Section -->
        ${quotation.notes ? `
        <div style="margin-bottom: 20px; font-size: 11px; line-height: 1.3;">
          <p style="margin: 0 0 3px 0; font-weight: bold; text-decoration: underline;">Note:</p>
          <div style="white-space: pre-wrap; margin-left: 10px; font-weight: 500;">${quotation.notes}</div>
        </div>
        ` : ''}

        <!-- Closing Section -->
        <div style="display: flex; justify-content: space-between; margin-top: 20px; font-size: 12px;">
          <div style="flex: 1;">
            <p style="margin: 0;">Thanking you,</p>
          </div>
          <div style="flex: 1; text-align: right;">
            <p style="margin: 0;">Yours truly,</p>
            <p style="margin: 3px 0 0 0; font-weight: bold;">For Harsh Electricals Work</p>
            <div style="margin: 5px 0; display: flex; justify-content: flex-end;">
              ${quotation.signature ? `<img src="${quotation.signature}" style="max-height: 60px; max-width: 150px; object-fit: contain;" />` : ''}
            </div>
            <div style="margin-top: 5px;">
              <p style="margin: 0;">(Proprietor)</p>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    // Wait for images to load
    const images = container.getElementsByTagName('img');
    const imagePromises = Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    });

    await Promise.all(imagePromises);

    // Convert to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: container.offsetWidth,
      windowHeight: container.offsetHeight,
    });

    // Remove temporary container
    document.body.removeChild(container);

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdfHeight = Math.max(297, imgHeight);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [imgWidth, pdfHeight],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    // Download PDF
    pdf.save(`Quotation_${quotation.clientName}_${quotation.date}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
