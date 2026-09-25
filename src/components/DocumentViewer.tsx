import React, { useState } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Maximize2, 
  Minimize2, 
  FileText, 
  ShieldCheck, 
  Ship, 
  Container, 
  PackageCheck
} from 'lucide-react';
import { PackingListDocument } from '../types/packingList';

interface DocumentViewerProps {
  doc: PackingListDocument;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ doc }) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 20, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 20, 60));
  const handleReset = () => { setZoom(100); setRotation(0); };
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const isPdf = doc.rawPreviewUrl && doc.fileType === 'application/pdf';
  const isImage = doc.rawPreviewUrl && (doc.fileType.startsWith('image/') || doc.rawPreviewUrl.startsWith('data:image'));

  return (
    <div className={`flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden h-full ${isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : ''}`}>
      
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-2 truncate">
          <FileText className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="font-semibold text-slate-200 truncate">{doc.fileName}</span>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
            {doc.fileSize || 'PDF Document'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleZoomOut}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="font-mono text-[11px] w-9 text-center text-slate-400">{zoom}%</span>
          <button
            onClick={handleZoomIn}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleRotate}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
            title="Rotate"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleReset}
            className="px-1.5 py-0.5 text-[10px] hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
          >
            Reset
          </button>
          <div className="h-3.5 w-px bg-slate-700 mx-0.5" />
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Document Content Area */}
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950/70">
        
        {/* Case 1: Uploaded Raw PDF */}
        {isPdf ? (
          <div 
            className="w-full h-full transition-transform duration-150 origin-top flex justify-center"
            style={{ transform: `scale(${zoom / 100}) rotate(${rotation}deg)` }}
          >
            <iframe
              src={doc.rawPreviewUrl}
              className="w-full h-full min-h-[600px] rounded-lg shadow-xl border border-slate-800 bg-white"
              title="Packing List PDF"
            />
          </div>
        ) : isImage ? (
          /* Case 2: Uploaded Scanned Image */
          <div
            className="transition-transform duration-150 origin-center flex justify-center items-center"
            style={{ transform: `scale(${zoom / 100}) rotate(${rotation}deg)` }}
          >
            <img
              src={doc.rawPreviewUrl}
              alt="Uploaded Packing List"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-slate-700 bg-white"
            />
          </div>
        ) : (
          /* Case 3: High-Fidelity Logistics Document Sheet Rendering */
          <div 
            className="transition-transform duration-150 origin-top my-auto"
            style={{ transform: `scale(${zoom / 100}) rotate(${rotation}deg)` }}
          >
            <div className="w-[620px] bg-white text-slate-900 rounded-lg shadow-2xl p-7 text-xs font-sans border border-slate-200">
              
              {/* Document Header */}
              <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 tracking-wider uppercase">
                    Commercial Packing List
                  </h2>
                  <p className="text-[10px] text-slate-600 font-semibold tracking-wide">
                    {doc.metadata.shipperName || 'EXPORTER / SHIPPER CO., LTD.'}
                  </p>
                  <p className="text-[9px] text-slate-500 max-w-xs leading-tight mt-0.5">
                    {doc.metadata.shipperAddress || 'Industrial District, Terminal Logistics Hub'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900 font-mono">
                    PL NO: {doc.metadata.packingListNo || 'PL-2025-001'}
                  </div>
                  <div className="text-[10px] text-slate-600 font-mono">
                    INV NO: {doc.metadata.invoiceNo || 'INV-2025-001'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    DATE: {doc.metadata.invoiceDate || '2025-08-14'}
                  </div>
                  <div className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-300 mt-1">
                    <ShieldCheck className="h-3 w-3" /> VERIFIED ORIGINAL
                  </div>
                </div>
              </div>

              {/* Parties & Routing Table */}
              <div className="grid grid-cols-2 gap-3 my-3 text-[10px] border border-slate-300 p-2.5 bg-slate-50/70 rounded">
                <div>
                  <span className="font-bold text-slate-700 block uppercase text-[9px]">Consignee / Importer:</span>
                  <span className="font-semibold text-slate-900 block leading-tight">{doc.metadata.consigneeName || 'CONSIGNEE NAME'}</span>
                  <span className="text-slate-600 block text-[9px] leading-tight">{doc.metadata.consigneeAddress || 'Port Address'}</span>
                  
                  {doc.metadata.notifyParty && (
                    <div className="mt-1 pt-1 border-t border-slate-200">
                      <span className="font-bold text-slate-700 block uppercase text-[8px]">Notify Party:</span>
                      <span className="text-slate-600 text-[9px]">{doc.metadata.notifyParty}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Purchase Order:</span>
                    <span className="font-mono font-bold text-slate-800">{doc.metadata.poNumber || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vessel / Voyage:</span>
                    <span className="font-medium text-slate-800">{doc.metadata.vesselVoyage || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Port of Loading:</span>
                    <span className="font-medium text-slate-800">{doc.metadata.portOfLoading || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Port of Discharge:</span>
                    <span className="font-medium text-slate-800">{doc.metadata.portOfDischarge || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Incoterms:</span>
                    <span className="font-bold text-slate-900">{doc.metadata.incoterms || 'FOB'}</span>
                  </div>
                </div>
              </div>

              {/* Container & Seal row */}
              {(doc.metadata.containerNo || doc.metadata.sealNo) && (
                <div className="flex items-center gap-4 text-[9px] font-mono bg-blue-50/60 border border-blue-200 text-blue-900 px-2 py-1 rounded mb-3">
                  <div className="flex items-center gap-1">
                    <Container className="h-3 w-3 text-blue-600" />
                    <span>CONTAINER: <strong>{doc.metadata.containerNo || 'N/A'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <PackageCheck className="h-3 w-3 text-blue-600" />
                    <span>SEAL: <strong>{doc.metadata.sealNo || 'N/A'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Ship className="h-3 w-3 text-blue-600" />
                    <span>CARRIER: <strong>{doc.metadata.carrier || 'Ocean Carrier'}</strong></span>
                  </div>
                </div>
              )}

              {/* Items Table */}
              <table className="w-full text-left text-[9px] border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-800 text-white font-semibold">
                    <th className="p-1 border border-slate-700">Carton #</th>
                    <th className="p-1 border border-slate-700">SKU / Code</th>
                    <th className="p-1 border border-slate-700">Description of Goods</th>
                    <th className="p-1 border border-slate-700 text-right">Qty</th>
                    <th className="p-1 border border-slate-700 text-right">N.W. (kg)</th>
                    <th className="p-1 border border-slate-700 text-right">G.W. (kg)</th>
                    <th className="p-1 border border-slate-700 text-right">CBM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {doc.items.slice(0, 10).map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50">
                      <td className="p-1 border border-slate-200 font-mono font-medium">{item.cartonNo}</td>
                      <td className="p-1 border border-slate-200 font-mono text-slate-700">{item.itemCode}</td>
                      <td className="p-1 border border-slate-200 max-w-[170px] truncate">{item.description}</td>
                      <td className="p-1 border border-slate-200 text-right font-mono font-bold">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="p-1 border border-slate-200 text-right font-mono">{item.netWeight.toFixed(1)}</td>
                      <td className="p-1 border border-slate-200 text-right font-mono">{item.grossWeight.toFixed(1)}</td>
                      <td className="p-1 border border-slate-200 text-right font-mono">{item.cbm.toFixed(3)}</td>
                    </tr>
                  ))}
                  {doc.items.length > 10 && (
                    <tr className="bg-slate-50 italic text-slate-500">
                      <td colSpan={7} className="p-1 text-center border border-slate-200">
                        ... and {doc.items.length - 10} more line items ...
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-800">
                    <td className="p-1 border border-slate-300" colSpan={3}>
                      TOTALS ({doc.statedTotals.totalCartons || doc.items.reduce((s, i) => s + i.cartonCount, 0)} Cartons)
                    </td>
                    <td className="p-1 border border-slate-300 text-right font-mono">
                      {doc.statedTotals.totalQuantity || doc.items.reduce((s, i) => s + i.quantity, 0)}
                    </td>
                    <td className="p-1 border border-slate-300 text-right font-mono">
                      {(doc.statedTotals.totalNetWeight || doc.items.reduce((s, i) => s + i.netWeight, 0)).toFixed(1)}
                    </td>
                    <td className="p-1 border border-slate-300 text-right font-mono">
                      {(doc.statedTotals.totalGrossWeight || doc.items.reduce((s, i) => s + i.grossWeight, 0)).toFixed(1)}
                    </td>
                    <td className="p-1 border border-slate-300 text-right font-mono">
                      {(doc.statedTotals.totalCbm || doc.items.reduce((s, i) => s + i.cbm, 0)).toFixed(3)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Notes & Authorized Signature */}
              <div className="mt-4 pt-2 border-t border-slate-200 flex justify-between items-end text-[9px] text-slate-500">
                <div className="max-w-xs space-y-0.5">
                  <p className="font-semibold text-slate-700">Remarks / Handling:</p>
                  <p className="italic text-[8px] leading-tight">{doc.notes || 'Goods packaged in export standard cartons. Fragile cargo.'}</p>
                </div>
                <div className="text-center">
                  <div className="border-b border-slate-400 w-32 mb-1" />
                  <span className="font-semibold text-slate-700 uppercase text-[8px]">Authorized Signatory & Stamp</span>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
};
