import { Quotation, QuotationItem, TableColumn } from '../types';
import { computeAutoValues, formatCellValue, normalizeColumns, resolveCustomCellValue } from './tableColumns';

/**
 * Single source of the quotation document layout. The live preview displays these pages and the
 * PDF generator rasterises the very same pages, so both always agree on content and page breaks.
 */
export type QuotationDocumentData = Pick<
    Quotation,
    'clientName' | 'date' | 'ref' | 'clientAddress' | 'subject' | 'message' | 'columns' | 'items' | 'notes' | 'signature' | 'signatureMode' | 'gstEnabled' | 'gstRate'
>;

// A4 at 96 CSS px per inch, with 15mm / 20mm margins.
export const PAGE_WIDTH = 794;
export const PAGE_HEIGHT = 1123;
const PAGE_PADDING_Y = 57;
const PAGE_PADDING_X = 76;
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_PADDING_X * 2;
/** Rows are measured inside one table but rendered in per-page tables; this absorbs sub-pixel border differences. */
const SAFETY_MARGIN = 8;
const CONTENT_HEIGHT = PAGE_HEIGHT - PAGE_PADDING_Y * 2 - SAFETY_MARGIN;
const TABLE_GAP = 15;
const MIN_DESCRIPTION_WIDTH = 150;

/** Inherited properties are pinned so the page renders identically inside the app UI and offscreen. */
const ROOT_STYLE = 'font-family: Arial, sans-serif; color: #000; font-size: 16px; line-height: 1.5; font-weight: 400; letter-spacing: normal; text-transform: none; text-align: left; white-space: normal;';
const PAGE_STYLE = `position: relative; width: ${PAGE_WIDTH}px; height: ${PAGE_HEIGHT}px; padding: ${PAGE_PADDING_Y}px ${PAGE_PADDING_X}px; box-sizing: border-box; background: #fff; overflow: hidden; ${ROOT_STYLE}`;
const TABLE_STYLE = 'width: 100%; table-layout: fixed; border-collapse: collapse; background-color: white; border: 1px solid #000;';
const CELL = 'border: 1px solid #000; font-size: 11px; vertical-align: middle;';

const escapeHtml = (value: unknown) =>
    String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const formatMoney = (value: number) => value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
};

const formatQty = (item: QuotationItem) => {
    if (!item.qty || item.qty === '0' || item.qty === 0) return 'L.S.';
    return item.unit && item.unit !== 'Nos' && item.unit !== 'Text' ? `${item.qty} ${item.unit}` : String(item.qty);
};

const SYSTEM_WIDTHS: Record<string, number> = { qty: 80, rate: 90, amount: 100 };
const AUTO_INCREMENT_WIDTH = 50;
const CUSTOM_WIDTH = 85;

/** Fixed column widths keep every page's table aligned; the description column takes the remaining space. */
const computeColumnWidths = (columns: TableColumn[]): number[] => {
    const fixed = columns.map((column) => {
        if (column.systemKey === 'description') return 0;
        if (column.systemKey) return SYSTEM_WIDTHS[column.systemKey];
        return column.valueMode === 'AUTO_INCREMENT' ? AUTO_INCREMENT_WIDTH : CUSTOM_WIDTH;
    });
    const fixedTotal = fixed.reduce((sum, width) => sum + width, 0);
    const hasDescription = columns.some((column) => column.systemKey === 'description');
    const available = CONTENT_WIDTH - (hasDescription ? MIN_DESCRIPTION_WIDTH : 0);
    const factor = fixedTotal > available ? available / fixedTotal : 1;
    const scaled = fixed.map((width) => Math.floor(width * factor));
    const remainder = CONTENT_WIDTH - scaled.reduce((sum, width) => sum + width, 0);
    return columns.map((column, index) => (column.systemKey === 'description' ? remainder : scaled[index]));
};

const renderIntro = (data: QuotationDocumentData) => `
  <div style="width: 100%; margin-bottom: 5px; position: relative; min-height: 140px;">
    <div style="display: flex; justify-content: center; align-items: flex-start; margin-bottom: 2px;">
      <div style="flex: 1;"></div>
      <div style="flex: 2; text-align: center;">
        <p style="color: #b91c1c; font-size: 14px; margin: 0; font-weight: bold; font-family: Arial, sans-serif;">Shri Ganeshay Namha</p>
      </div>
      <div style="flex: 1; text-align: right;">
        <p style="margin: 0; font-size: 15px; color: #003366; font-weight: bold; white-space: nowrap;">9820746778</p>
        <p style="margin: 1px 0 0 0; font-size: 15px; color: #003366; font-weight: bold; white-space: nowrap;">7021129292</p>
      </div>
    </div>
    <div style="display: flex; align-items: center; justify-content: center; margin-top: -15px;">
      <div style="position: absolute; left: 0; top: 10px;">
        <svg width="70" height="70" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
          <path d="M350 100L180 280H260L162 412L332 232H252L350 100Z" fill="#b91c1c"/>
        </svg>
      </div>
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
  <div style="border-top: 2px solid #b91c1c; margin-bottom: 5px;"></div>
  <div style="text-align: center; margin-bottom: 15px;">
    <p style="margin: 0; font-size: 11px; color: #003366; font-weight: 500;">
      Shop No. 25, Jay Ambey Nagar, Near Hotal Narayan Bhavan Bhayander (E) 401101.
    </p>
  </div>
  <div style="display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 12px;">
    <div><p style="margin: 0;">Ref: ${escapeHtml(data.ref)}</p></div>
    <div style="text-align: right;"><p style="margin: 0;">Date: ${formatDate(data.date)}</p></div>
  </div>
  <div style="margin-bottom: 15px; font-size: 12px; line-height: 1.4;">
    <p style="margin: 0; font-weight: bold;">To,</p>
    <p style="margin: 0; font-weight: bold;">${escapeHtml(data.clientName)}</p>
    <div style="margin: 0; white-space: pre-wrap;">${escapeHtml(data.clientAddress)}</div>
  </div>
  <div style="margin-bottom: 15px; text-align: center;">
    <p style="margin: 0; font-weight: bold; text-decoration: underline; font-size: 13px;">
      ${data.subject ? `Sub : ${escapeHtml(data.subject)}` : ''}
    </p>
  </div>
  <div style="margin-bottom: 15px; font-size: 12px; line-height: 1.4;">
    <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(data.message || 'Dear Sir,')}</p>
  </div>`;

const renderTableHead = (columns: TableColumn[], widths: number[]) => `
  <colgroup>${widths.map((width) => `<col style="width: ${width}px;">`).join('')}</colgroup>
  <thead>
    <tr style="background-color: #f8fafc; border-bottom: 2px solid #000; height: 45px;">
      ${columns.map((column) => {
          const isDescription = column.systemKey === 'description';
          return `<th style="padding: 0 ${isDescription ? '12px' : '5px'}; text-align: ${isDescription ? 'left' : 'center'}; ${CELL} font-weight: 900; text-transform: uppercase; overflow-wrap: anywhere;">${escapeHtml(column.name)}</th>`;
      }).join('')}
    </tr>
  </thead>`;

const renderSectionRow = (item: QuotationItem, columnCount: number) => `
  <tr style="background-color: #f1f5f9; height: 30px;">
    <td colspan="${columnCount}" style="padding: 0 10px; ${CELL} font-size: 12px; font-weight: 900; text-align: center; text-transform: uppercase; letter-spacing: 4px;">
      — ${escapeHtml(item.pointName)} —
    </td>
  </tr>`;

const renderItemRow = (item: QuotationItem, columns: TableColumn[], autoValues: Record<string, number>) => `
  <tr>${columns.map((column) => {
      switch (column.systemKey) {
          case 'description':
              return `<td style="padding: 6px 12px; ${CELL} color: #1e293b; font-weight: 500; overflow-wrap: anywhere;">
                <div style="margin: 0;">${escapeHtml(item.pointName)}</div>
                ${item.description ? `<div style="font-size: 9px; color: #64748b; margin-top: 3px; font-weight: 400; line-height: 1.3;">${escapeHtml(item.description).replace(/\n/g, '<br>')}</div>` : ''}
              </td>`;
          case 'qty':
              return `<td style="padding: 6px 5px; text-align: center; ${CELL} font-weight: 600; overflow-wrap: anywhere;">${escapeHtml(formatQty(item))}</td>`;
          case 'rate': {
              const rate = Number(item.rate) || 0;
              return `<td style="padding: 6px 5px; text-align: center; ${CELL} font-weight: 600;">${rate === 0 ? 'L.S.' : rate.toFixed(2)}</td>`;
          }
          case 'amount':
              return `<td style="padding: 6px 5px; text-align: center; ${CELL} color: #b91c1c; font-weight: 800; white-space: nowrap;">${(Number(item.amount) || 0).toFixed(2)}</td>`;
          default:
              return `<td style="padding: 6px 5px; text-align: center; ${CELL} overflow-wrap: anywhere;">${escapeHtml(formatCellValue(resolveCustomCellValue(column, item, autoValues)))}</td>`;
      }
  }).join('')}</tr>`;

const renderTotals = (data: QuotationDocumentData, labelSpan: number) => {
    const subtotal = data.items.reduce((sum, item) => sum + (item.isSection ? 0 : Number(item.amount) || 0), 0);
    const gstAmount = data.gstEnabled ? (subtotal * data.gstRate) / 100 : 0;
    const label = 'padding: 4px 10px; text-align: right; font-size: 10px; border: 1px solid #000;';
    const total = 'padding: 6px 10px; text-align: right; font-weight: bold; border: 1px solid #000; background-color: #f9fafb;';
    return `
      ${data.gstEnabled ? `
        <tr>
          <td colspan="${labelSpan}" style="${label}">Subtotal</td>
          <td style="${label} font-weight: bold;">₹${formatMoney(subtotal)}</td>
        </tr>
        <tr>
          <td colspan="${labelSpan}" style="${label}">GST (${escapeHtml(data.gstRate)}%)</td>
          <td style="${label} font-weight: bold;">₹${formatMoney(gstAmount)}</td>
        </tr>` : ''}
      <tr>
        <td colspan="${labelSpan}" style="${total} font-size: 11px;">${data.gstEnabled ? 'Grand Total' : 'Total'}</td>
        <td style="${total} font-size: 12px; white-space: nowrap;">₹${formatMoney(subtotal + gstAmount)}</td>
      </tr>`;
};

const NOTE_LINE_STYLE = 'white-space: pre-wrap; margin-left: 10px; font-weight: 500; font-size: 11px; line-height: 1.3;';

/** Blank space above the physical signing line, roughly 17 mm on the printed page. */
const SIGNING_SPACE_HEIGHT = 64;
const SIGNING_LINE_WIDTH = 170;

/** `signatureSrc` must be an image already known to load; null prints the physical signing area. */
const renderSignature = (signatureSrc: string | null) => signatureSrc
    ? `<div style="margin: 5px 0; height: 60px; display: flex; justify-content: flex-end; align-items: center;"><img src="${escapeHtml(signatureSrc)}" alt="Signature" style="max-height: 60px; max-width: 150px; object-fit: contain;" /></div>
      <div style="margin-top: 5px;"><p style="margin: 0;">(Proprietor)</p></div>`
    : `<div style="display: inline-block; width: ${SIGNING_LINE_WIDTH}px; text-align: center;">
        <div style="height: ${SIGNING_SPACE_HEIGHT}px;"></div>
        <div style="border-top: 1px solid #000;"></div>
        <p style="margin: 4px 0 0 0;">(Proprietor)</p>
      </div>`;

const renderClosing = (signatureSrc: string | null) => `
  <div style="display: flex; justify-content: space-between; padding-top: 20px; font-size: 12px;">
    <div style="flex: 1;"><p style="margin: 0;">Thanking you,</p></div>
    <div style="flex: 1; text-align: right;">
      <p style="margin: 0;">Yours truly,</p>
      <p style="margin: 3px 0 0 0; font-weight: bold;">For Harsh Electricals Work</p>
      ${renderSignature(signatureSrc)}
    </div>
  </div>`;

/** A unit is the smallest piece that is never split across pages. */
type LayoutUnit =
    | { kind: 'flow'; html: string; keepWithNext?: boolean }
    | { kind: 'rows'; html: string; keepWithNext?: boolean; closesTable?: boolean };

const buildUnits = (data: QuotationDocumentData, columns: TableColumn[], signatureSrc: string | null): LayoutUnit[] => {
    const autoValues = computeAutoValues(data.items, columns);
    const units: LayoutUnit[] = [{ kind: 'flow', html: renderIntro(data) }];

    data.items.forEach((item, index) => {
        units.push(item.isSection
            ? { kind: 'rows', html: renderSectionRow(item, columns.length), keepWithNext: true }
            : { kind: 'rows', html: renderItemRow(item, columns, autoValues[index]) });
    });
    const lastRow = units[units.length - 1];
    if (lastRow.kind === 'rows') lastRow.keepWithNext = true;
    units.push({ kind: 'rows', html: renderTotals(data, Math.max(columns.length - 1, 1)), closesTable: true });

    const notes = (data.notes || '').replace(/\s+$/, '');
    if (notes.replace(/•|\d+\.|\s/g, '')) {
        units.push({
            kind: 'flow',
            keepWithNext: true,
            html: '<p style="margin: 0; padding-bottom: 3px; font-size: 11px; line-height: 1.3; font-weight: bold; text-decoration: underline;">Note:</p>',
        });
        const lines = notes.split('\n');
        lines.forEach((line, index) => {
            const spacing = index === lines.length - 1 ? ' padding-bottom: 20px;' : '';
            units.push({ kind: 'flow', html: `<div style="${NOTE_LINE_STYLE}${spacing}">${escapeHtml(line) || '&nbsp;'}</div>` });
        });
    }

    units.push({ kind: 'flow', html: renderClosing(signatureSrc) });
    return units;
};

const tableHtml = (head: string, rows: string[], closesTable: boolean) =>
    `<table style="${TABLE_STYLE}${closesTable ? ` margin-bottom: ${TABLE_GAP}px;` : ''}">${head}${rows.map((row) => `<tbody>${row}</tbody>`).join('')}</table>`;

/** Renders every unit once, offscreen at page width, in the same structure used on the pages. */
const measureUnits = (units: LayoutUnit[], head: string) => {
    const host = document.createElement('div');
    host.style.cssText = `position: absolute; left: -10000px; top: 0; visibility: hidden; width: ${CONTENT_WIDTH}px; ${ROOT_STYLE}`;
    const firstRow = units.findIndex((unit) => unit.kind === 'rows');
    host.innerHTML = units.map((unit, index) => {
        if (unit.kind === 'flow') return `<div data-unit="${index}" style="display: flow-root;">${unit.html}</div>`;
        if (index !== firstRow) return '';
        const rows = units.map((u, i) => (u.kind === 'rows' ? `<tbody data-unit="${i}">${u.html}</tbody>` : '')).join('');
        return `<table style="${TABLE_STYLE}">${head}${rows}</table>`;
    }).join('');

    document.body.appendChild(host);
    try {
        const heights = new Array<number>(units.length).fill(0);
        host.querySelectorAll<HTMLElement>('[data-unit]').forEach((element) => {
            heights[Number(element.dataset.unit)] = element.getBoundingClientRect().height;
        });
        const headHeight = host.querySelector('thead')?.getBoundingClientRect().height ?? 0;
        return { heights, headHeight };
    } finally {
        host.remove();
    }
};

type PagePart = { kind: 'flow'; html: string } | { kind: 'table'; rows: string[]; closesTable: boolean };

/**
 * Lays the quotation out on A4 pages and returns one self-contained HTML string per page.
 * Rows are never split, the table header repeats on every page the table continues on,
 * group headings stay with the next row and the totals stay with the last item.
 * `signatureSrc` comes from `getPrintableSignature` (or `usePrintableSignature` in React).
 */
export const layoutQuotationDocument = (data: QuotationDocumentData, signatureSrc: string | null): string[] => {
    const columns = normalizeColumns(data.columns);
    const head = renderTableHead(columns, computeColumnWidths(columns));
    const units = buildUnits(data, columns, signatureSrc);
    const { heights, headHeight } = measureUnits(units, head);

    const pages: PagePart[][] = [];
    let page: PagePart[] = [];
    let used = 0;
    let openTable: Extract<PagePart, { kind: 'table' }> | null = null;
    const startPage = () => {
        page = [];
        pages.push(page);
        used = 0;
        openTable = null;
    };
    startPage();

    units.forEach((unit, index) => {
        const height = heights[index];
        const keepHeight = unit.keepWithNext ? heights[index + 1] ?? 0 : 0;

        if (unit.kind === 'flow') {
            openTable = null;
            if (page.length > 0 && used + height + keepHeight > CONTENT_HEIGHT) startPage();
            page.push({ kind: 'flow', html: unit.html });
            used += height;
            return;
        }

        const gap = unit.closesTable ? TABLE_GAP : 0;
        if (page.length > 0 && used + (openTable ? 0 : headHeight) + height + keepHeight + gap > CONTENT_HEIGHT) startPage();
        if (!openTable) {
            openTable = { kind: 'table', rows: [], closesTable: false };
            page.push(openTable);
            used += headHeight;
        }
        openTable.rows.push(unit.html);
        used += height + gap;
        if (unit.closesTable) {
            openTable.closesTable = true;
            openTable = null;
        }
    });

    return pages.map((parts, index) => {
        const body = parts.map((part) => (part.kind === 'flow' ? part.html : tableHtml(head, part.rows, part.closesTable))).join('');
        const footer = pages.length > 1
            ? `<div style="position: absolute; left: ${PAGE_PADDING_X}px; right: ${PAGE_PADDING_X}px; bottom: 22px; text-align: center; font-size: 10px; color: #64748b;">Page ${index + 1} of ${pages.length}</div>`
            : '';
        return `<div style="${PAGE_STYLE}">${body}${footer}</div>`;
    });
};
