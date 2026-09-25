import * as XLSX from 'xlsx';
import { PackingListDocument, PackingItem } from '../types/packingList';

export interface ExportOptions {
  includeMetadataHeader?: boolean;
  includeFormulas?: boolean;
  multiSheet?: boolean;
  selectedColumns?: string[];
  sheetName?: string;
}

export function exportToExcel(
  doc: PackingListDocument,
  options: ExportOptions = {}
): void {
  const {
    includeMetadataHeader = true,
    multiSheet = true,
  } = options;

  const wb = XLSX.utils.book_new();

  // 1. MAIN ITEMS SHEET
  const mainSheetData: (string | number | null | undefined)[][] = [];

  if (includeMetadataHeader) {
    mainSheetData.push(['COMMERCIAL PACKING LIST & SHIPMENT MANIFEST']);
    mainSheetData.push([`Generated via PackToExcel AI on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`]);
    mainSheetData.push([]); // blank

    // Shipment Metadata block
    mainSheetData.push(['SHIPMENT DETAILS', '', 'CARRIER & ROUTING', '']);
    mainSheetData.push([
      'Packing List No:', doc.metadata.packingListNo || '-',
      'Vessel / Flight:', doc.metadata.vesselVoyage || '-'
    ]);
    mainSheetData.push([
      'Invoice No & Date:', `${doc.metadata.invoiceNo || '-'} (${doc.metadata.invoiceDate || '-'})`,
      'Port of Loading:', doc.metadata.portOfLoading || '-'
    ]);
    mainSheetData.push([
      'Purchase Order (PO):', doc.metadata.poNumber || '-',
      'Port of Discharge:', doc.metadata.portOfDischarge || '-'
    ]);
    mainSheetData.push([
      'Incoterms:', doc.metadata.incoterms || '-',
      'Final Destination:', doc.metadata.finalDestination || '-'
    ]);
    mainSheetData.push([
      'Shipper / Exporter:', doc.metadata.shipperName || '-',
      'Container No:', doc.metadata.containerNo || '-'
    ]);
    mainSheetData.push([
      'Shipper Address:', doc.metadata.shipperAddress || '-',
      'Seal No:', doc.metadata.sealNo || '-'
    ]);
    mainSheetData.push([
      'Consignee / Buyer:', doc.metadata.consigneeName || '-',
      'Country of Origin:', doc.metadata.countryOfOrigin || '-'
    ]);
    mainSheetData.push([
      'Consignee Address:', doc.metadata.consigneeAddress || '-',
      'Currency:', doc.metadata.currency || 'USD'
    ]);
    mainSheetData.push([]); // blank
  }

  // Table Headers
  const tableHeaders = [
    'Carton / Pkg No.',
    'Carton Count',
    'Item / SKU Code',
    'Description of Goods',
    'Quantity',
    'Unit',
    'Package Type',
    `Net Weight (${doc.items[0]?.weightUnit || 'KG'})`,
    `Gross Weight (${doc.items[0]?.weightUnit || 'KG'})`,
    'CBM (m³)',
    'Dimensions (cm)',
    'HS Tariff Code',
    'Unit Price',
    'Total Value',
    'Lot / Batch #',
    'Remarks / Notes'
  ];
  mainSheetData.push(tableHeaders);

  // Rows
  let totalCartonCount = 0;
  let totalQty = 0;
  let totalNW = 0;
  let totalGW = 0;
  let totalCbm = 0;
  let totalVal = 0;

  doc.items.forEach((item) => {
    totalCartonCount += Number(item.cartonCount || 0);
    totalQty += Number(item.quantity || 0);
    totalNW += Number(item.netWeight || 0);
    totalGW += Number(item.grossWeight || 0);
    totalCbm += Number(item.cbm || 0);
    totalVal += Number(item.totalAmount || (item.unitPrice ? item.unitPrice * item.quantity : 0));

    mainSheetData.push([
      item.cartonNo || '',
      Number(item.cartonCount || 1),
      item.itemCode || '',
      item.description || '',
      Number(item.quantity || 0),
      item.unit || 'PCS',
      item.packageType || 'Carton',
      Number(item.netWeight || 0),
      Number(item.grossWeight || 0),
      Number(Number(item.cbm || 0).toFixed(3)),
      item.dimensions || '',
      item.hsCode || '',
      item.unitPrice ? Number(item.unitPrice) : '',
      item.totalAmount ? Number(item.totalAmount) : (item.unitPrice ? Number(item.unitPrice * item.quantity) : ''),
      item.lotNumber || '',
      item.remarks || ''
    ]);
  });

  // Totals Row
  mainSheetData.push([
    'TOTAL / SUMMARY',
    totalCartonCount,
    '',
    `${doc.items.length} Line Items`,
    totalQty,
    '',
    '',
    Number(totalNW.toFixed(2)),
    Number(totalGW.toFixed(2)),
    Number(totalCbm.toFixed(3)),
    '',
    '',
    '',
    totalVal > 0 ? Number(totalVal.toFixed(2)) : '',
    '',
    `Stated GW: ${doc.statedTotals.totalGrossWeight || totalGW} | Stated NW: ${doc.statedTotals.totalNetWeight || totalNW}`
  ]);

  const wsMain = XLSX.utils.aoa_to_sheet(mainSheetData);

  // Set column widths for polished presentation
  wsMain['!cols'] = [
    { wch: 18 }, // Carton No
    { wch: 14 }, // Carton Count
    { wch: 18 }, // SKU
    { wch: 45 }, // Description
    { wch: 12 }, // Quantity
    { wch: 10 }, // Unit
    { wch: 15 }, // Package Type
    { wch: 16 }, // Net Weight
    { wch: 16 }, // Gross Weight
    { wch: 12 }, // CBM
    { wch: 18 }, // Dimensions
    { wch: 16 }, // HS Code
    { wch: 12 }, // Unit Price
    { wch: 14 }, // Total Value
    { wch: 18 }, // Lot Number
    { wch: 35 }, // Remarks
  ];

  XLSX.utils.book_append_sheet(wb, wsMain, 'Packing List Items');

  // 2. OPTIONAL MULTI-SHEET ENHANCEMENTS
  if (multiSheet) {
    // Sheet 2: Carton / Package Breakdown
    const cartonSheetData: (string | number | null | undefined)[][] = [];
    cartonSheetData.push(['PACKAGE & CARTON MANIFEST BREAKDOWN']);
    cartonSheetData.push([`Packing List: ${doc.metadata.packingListNo || '-'} | PO: ${doc.metadata.poNumber || '-'}`]);
    cartonSheetData.push([]);
    cartonSheetData.push(['Carton #', 'Carton Qty', 'SKU', 'Items Per Box', 'Total Units', 'Gross Wt (kg)', 'Net Wt (kg)', 'CBM', 'Dimensions']);

    doc.items.forEach((item) => {
      const unitsPerBox = item.cartonCount > 0 ? Math.round(item.quantity / item.cartonCount) : item.quantity;
      cartonSheetData.push([
        item.cartonNo,
        item.cartonCount,
        item.itemCode,
        unitsPerBox,
        item.quantity,
        item.grossWeight,
        item.netWeight,
        item.cbm,
        item.dimensions || '-'
      ]);
    });

    const wsCartons = XLSX.utils.aoa_to_sheet(cartonSheetData);
    wsCartons['!cols'] = [
      { wch: 18 }, { wch: 12 }, { wch: 18 }, { wch: 15 }, { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 12 }, { wch: 20 }
    ];
    XLSX.utils.book_append_sheet(wb, wsCartons, 'Carton Breakdown');

    // Sheet 3: Customs & HS Code Summary
    const hsGroups = new Map<string, { desc: string; count: number; totalQty: number; totalNW: number; totalGW: number; totalVal: number }>();
    
    doc.items.forEach((item) => {
      const code = item.hsCode || 'Unclassified';
      const existing = hsGroups.get(code) || {
        desc: item.description,
        count: 0,
        totalQty: 0,
        totalNW: 0,
        totalGW: 0,
        totalVal: 0,
      };
      existing.count += 1;
      existing.totalQty += item.quantity;
      existing.totalNW += item.netWeight;
      existing.totalGW += item.grossWeight;
      existing.totalVal += item.totalAmount || (item.unitPrice ? item.unitPrice * item.quantity : 0);
      hsGroups.set(code, existing);
    });

    const hsSheetData: (string | number | null | undefined)[][] = [];
    hsSheetData.push(['CUSTOMS DECLARATION & HS TARIFF SUMMARY']);
    hsSheetData.push([`Country of Origin: ${doc.metadata.countryOfOrigin || '-'} | Destination: ${doc.metadata.finalDestination || '-'}`]);
    hsSheetData.push([]);
    hsSheetData.push(['HS Tariff Code', 'Representative Description', 'Line Items', 'Total Quantity', 'Total Net Wt (kg)', 'Total Gross Wt (kg)', 'Total Customs Value']);

    hsGroups.forEach((val, code) => {
      hsSheetData.push([
        code,
        val.desc,
        val.count,
        val.totalQty,
        Number(val.totalNW.toFixed(2)),
        Number(val.totalGW.toFixed(2)),
        val.totalVal > 0 ? Number(val.totalVal.toFixed(2)) : '-'
      ]);
    });

    const wsHs = XLSX.utils.aoa_to_sheet(hsSheetData);
    wsHs['!cols'] = [
      { wch: 20 }, { wch: 45 }, { wch: 14 }, { wch: 16 }, { wch: 18 }, { wch: 18 }, { wch: 20 }
    ];
    XLSX.utils.book_append_sheet(wb, wsHs, 'Customs HS Summary');

    // Sheet 4: Shipment Header & Parties
    const infoSheetData: (string | number | null | undefined)[][] = [
      ['LOGISTICS SHIPMENT DOSSIER'],
      [],
      ['Attribute', 'Value'],
      ['Packing List Number', doc.metadata.packingListNo || ''],
      ['Commercial Invoice Number', doc.metadata.invoiceNo || ''],
      ['Invoice Date', doc.metadata.invoiceDate || ''],
      ['Purchase Order (PO)', doc.metadata.poNumber || ''],
      ['Letter of Credit (LC)', doc.metadata.lcNumber || ''],
      ['Incoterms', doc.metadata.incoterms || ''],
      ['Currency', doc.metadata.currency || 'USD'],
      ['Shipper / Exporter', doc.metadata.shipperName || ''],
      ['Shipper Address', doc.metadata.shipperAddress || ''],
      ['Consignee / Buyer', doc.metadata.consigneeName || ''],
      ['Consignee Address', doc.metadata.consigneeAddress || ''],
      ['Notify Party', doc.metadata.notifyParty || ''],
      ['Carrier', doc.metadata.carrier || ''],
      ['Vessel / Voyage / Flight', doc.metadata.vesselVoyage || ''],
      ['Port of Loading', doc.metadata.portOfLoading || ''],
      ['Port of Discharge', doc.metadata.portOfDischarge || ''],
      ['Final Destination', doc.metadata.finalDestination || ''],
      ['Container Number', doc.metadata.containerNo || ''],
      ['Seal Number', doc.metadata.sealNo || ''],
      ['Total Packages (Stated)', doc.statedTotals.totalCartons || ''],
      ['Total Gross Weight (Stated)', `${doc.statedTotals.totalGrossWeight || ''} ${doc.statedTotals.weightUnit || 'KG'}`],
      ['Total Net Weight (Stated)', `${doc.statedTotals.totalNetWeight || ''} ${doc.statedTotals.weightUnit || 'KG'}`],
      ['Total Volume CBM (Stated)', `${doc.statedTotals.totalCbm || ''} m³`],
      ['Special Shipping Notes', doc.notes || '']
    ];
    const wsInfo = XLSX.utils.aoa_to_sheet(infoSheetData);
    wsInfo['!cols'] = [{ wch: 28 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(wb, wsInfo, 'Shipment Dossier');
  }

  // Trigger download
  const baseName = doc.fileName ? doc.fileName.replace(/\.[^/.]+$/, '') : 'Packing-List';
  const outFileName = `${baseName}_converted.xlsx`;
  XLSX.writeFile(wb, outFileName);
}

export function exportToCsv(doc: PackingListDocument): void {
  const headers = [
    'Carton_No',
    'Carton_Count',
    'SKU',
    'Description',
    'Quantity',
    'Unit',
    'Package_Type',
    'Net_Weight_KG',
    'Gross_Weight_KG',
    'CBM',
    'Dimensions',
    'HS_Code',
    'Unit_Price',
    'Total_Amount',
    'Currency',
    'Lot_Number',
    'Remarks'
  ];

  const rows = doc.items.map((item) => [
    `"${(item.cartonNo || '').replace(/"/g, '""')}"`,
    item.cartonCount || 1,
    `"${(item.itemCode || '').replace(/"/g, '""')}"`,
    `"${(item.description || '').replace(/"/g, '""')}"`,
    item.quantity || 0,
    `"${(item.unit || '').replace(/"/g, '""')}"`,
    `"${(item.packageType || '').replace(/"/g, '""')}"`,
    item.netWeight || 0,
    item.grossWeight || 0,
    item.cbm || 0,
    `"${(item.dimensions || '').replace(/"/g, '""')}"`,
    `"${(item.hsCode || '').replace(/"/g, '""')}"`,
    item.unitPrice || '',
    item.totalAmount || '',
    `"${(item.currency || doc.metadata.currency || 'USD').replace(/"/g, '""')}"`,
    `"${(item.lotNumber || '').replace(/"/g, '""')}"`,
    `"${(item.remarks || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const baseName = doc.fileName ? doc.fileName.replace(/\.[^/.]+$/, '') : 'Packing-List';
  a.download = `${baseName}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function copySpreadsheetToClipboard(doc: PackingListDocument): Promise<void> {
  const headers = [
    'Carton No',
    'Cartons',
    'SKU / Code',
    'Description of Goods',
    'Quantity',
    'Unit',
    'Net Wt (kg)',
    'Gross Wt (kg)',
    'CBM',
    'Dimensions',
    'HS Code',
    'Unit Price',
    'Total Amount',
    'Lot / Batch'
  ];

  const rows = doc.items.map((i) => [
    i.cartonNo,
    i.cartonCount,
    i.itemCode,
    i.description,
    i.quantity,
    i.unit,
    i.netWeight,
    i.grossWeight,
    i.cbm,
    i.dimensions || '',
    i.hsCode || '',
    i.unitPrice || '',
    i.totalAmount || '',
    i.lotNumber || ''
  ]);

  const tsv = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
  return navigator.clipboard.writeText(tsv);
}

export function exportToJson(doc: PackingListDocument): void {
  const jsonStr = JSON.stringify(doc, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const baseName = doc.fileName ? doc.fileName.replace(/\.[^/.]+$/, '') : 'Packing-List';
  a.download = `${baseName}_data.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
