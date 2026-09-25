export interface HeaderMetadata {
  shipperName?: string;
  shipperAddress?: string;
  consigneeName?: string;
  consigneeAddress?: string;
  notifyParty?: string;
  packingListNo?: string;
  invoiceNo?: string;
  invoiceDate?: string;
  poNumber?: string;
  lcNumber?: string; // Letter of credit
  vesselVoyage?: string;
  portOfLoading?: string;
  portOfDischarge?: string;
  finalDestination?: string;
  containerNo?: string;
  sealNo?: string;
  incoterms?: string; // FOB, CIF, EXW, DDP, etc.
  carrier?: string;
  countryOfOrigin?: string;
  currency?: string;
}

export interface PackingItem {
  id: string;
  cartonNo: string; // e.g. "1-10", "CTN 01", "Pallet 1"
  cartonCount: number; // e.g. 10 cartons
  itemCode: string; // SKU / Part Number / Model
  description: string; // Product name / description
  quantity: number; // Item count
  unit: string; // PCS, SETS, CTNS, PAIRS, etc.
  innerQty?: number; // pcs per inner box
  packageType: string; // Carton, Wooden Case, Pallet, Bag, Bundle
  netWeight: number; // Net weight (total for line or per unit)
  grossWeight: number; // Gross weight (total for line)
  weightUnit: string; // KG, LBS
  cbm: number; // Cubic meters
  dimensions?: string; // e.g. "50x40x30 cm"
  hsCode?: string; // Harmonized Tariff Code (e.g. "8504.40.90")
  unitPrice?: number;
  totalAmount?: number;
  currency?: string;
  lotNumber?: string;
  remarks?: string;
}

export interface StatedTotals {
  totalCartons?: number;
  totalQuantity?: number;
  totalNetWeight?: number;
  totalGrossWeight?: number;
  totalCbm?: number;
  weightUnit?: string;
}

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  category: 'weight' | 'carton' | 'hscode' | 'totals' | 'formatting';
  message: string;
  suggestion?: string;
  itemRowIndex?: number;
}

export interface PackingListDocument {
  id: string;
  fileName: string;
  fileSize?: string;
  fileType: string;
  uploadDate: string;
  confidenceScore?: number;
  metadata: HeaderMetadata;
  items: PackingItem[];
  statedTotals: StatedTotals;
  validationIssues: ValidationIssue[];
  notes?: string;
  rawPreviewUrl?: string; // object URL or data URL
}

export interface ConversionOptions {
  splitCartonRanges?: boolean;
  autoInferHsCodes?: boolean;
  normalizeUnits?: boolean;
  customInstructions?: string;
}
