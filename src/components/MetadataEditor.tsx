import React, { useState } from 'react';
import { 
  Building2, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  Ship, 
  FileText, 
  Container, 
  Coins, 
  Calendar,
  Check
} from 'lucide-react';
import { HeaderMetadata } from '../types/packingList';

interface MetadataEditorProps {
  metadata: HeaderMetadata;
  onChange: (updated: HeaderMetadata) => void;
}

export const MetadataEditor: React.FC<MetadataEditorProps> = ({ metadata, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleUpdate = (field: keyof HeaderMetadata, value: string) => {
    onChange({
      ...metadata,
      [field]: value,
    });
  };

  const copyToClipboard = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 1500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition-all">
      {/* Header bar / Quick summary */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-3 cursor-pointer hover:bg-slate-800/50 flex items-center justify-between select-none"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20 shrink-0">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-white truncate">
                {metadata.shipperName || 'Shipper'} → {metadata.consigneeName || 'Consignee'}
              </span>
              {metadata.packingListNo && (
                <span className="text-[11px] font-mono bg-slate-800 text-emerald-400 px-2 py-0.5 rounded border border-slate-700">
                  PL: {metadata.packingListNo}
                </span>
              )}
              {metadata.poNumber && (
                <span className="text-[11px] font-mono bg-slate-800 text-cyan-400 px-2 py-0.5 rounded border border-slate-700">
                  PO: {metadata.poNumber}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {metadata.portOfLoading || 'Origin'} to {metadata.portOfDischarge || 'Destination'} • {metadata.vesselVoyage || 'Carrier/Vessel'} • {metadata.incoterms || 'Incoterms N/A'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            {isOpen ? 'Close details' : 'Edit shipment metadata'}
          </span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </div>
      </div>

      {/* Expanded Edit Form */}
      {isOpen && (
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          {/* Column 1: Shipper & Consignee */}
          <div className="space-y-3">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Building2 className="h-3.5 w-3.5 text-blue-400" /> Parties & Commercial Entities
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Shipper / Exporter</label>
              <input
                type="text"
                value={metadata.shipperName || ''}
                onChange={(e) => handleUpdate('shipperName', e.target.value)}
                placeholder="Shipper company name"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Shipper Address</label>
              <textarea
                rows={2}
                value={metadata.shipperAddress || ''}
                onChange={(e) => handleUpdate('shipperAddress', e.target.value)}
                placeholder="Origin address & city"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Consignee / Importer</label>
              <input
                type="text"
                value={metadata.consigneeName || ''}
                onChange={(e) => handleUpdate('consigneeName', e.target.value)}
                placeholder="Consignee company name"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Consignee Address</label>
              <textarea
                rows={2}
                value={metadata.consigneeAddress || ''}
                onChange={(e) => handleUpdate('consigneeAddress', e.target.value)}
                placeholder="Destination address"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Column 2: Documents & References */}
          <div className="space-y-3">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <FileText className="h-3.5 w-3.5 text-emerald-400" /> Reference Numbers
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Packing List #</label>
                <input
                  type="text"
                  value={metadata.packingListNo || ''}
                  onChange={(e) => handleUpdate('packingListNo', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Invoice #</label>
                <input
                  type="text"
                  value={metadata.invoiceNo || ''}
                  onChange={(e) => handleUpdate('invoiceNo', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Invoice Date</label>
                <input
                  type="text"
                  value={metadata.invoiceDate || ''}
                  onChange={(e) => handleUpdate('invoiceDate', e.target.value)}
                  placeholder="YYYY-MM-DD"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Purchase Order (PO)</label>
                <input
                  type="text"
                  value={metadata.poNumber || ''}
                  onChange={(e) => handleUpdate('poNumber', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Incoterms</label>
                <input
                  type="text"
                  value={metadata.incoterms || ''}
                  onChange={(e) => handleUpdate('incoterms', e.target.value)}
                  placeholder="FOB, CIF, EXW, DDP"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Currency</label>
                <input
                  type="text"
                  value={metadata.currency || 'USD'}
                  onChange={(e) => handleUpdate('currency', e.target.value)}
                  placeholder="USD, EUR, GBP"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Notify Party</label>
              <input
                type="text"
                value={metadata.notifyParty || ''}
                onChange={(e) => handleUpdate('notifyParty', e.target.value)}
                placeholder="Broker / Freight Agent"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Column 3: Logistics & Transport */}
          <div className="space-y-3">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Ship className="h-3.5 w-3.5 text-cyan-400" /> Routing & Equipment
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Vessel / Flight No.</label>
              <input
                type="text"
                value={metadata.vesselVoyage || ''}
                onChange={(e) => handleUpdate('vesselVoyage', e.target.value)}
                placeholder="e.g. EVER GIVEN 042E"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Port of Loading (POL)</label>
                <input
                  type="text"
                  value={metadata.portOfLoading || ''}
                  onChange={(e) => handleUpdate('portOfLoading', e.target.value)}
                  placeholder="e.g. Yantian, China"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Port of Discharge (POD)</label>
                <input
                  type="text"
                  value={metadata.portOfDischarge || ''}
                  onChange={(e) => handleUpdate('portOfDischarge', e.target.value)}
                  placeholder="e.g. Los Angeles, USA"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Container Number</label>
                <input
                  type="text"
                  value={metadata.containerNo || ''}
                  onChange={(e) => handleUpdate('containerNo', e.target.value)}
                  placeholder="EMCU-9182374"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Seal Number</label>
                <input
                  type="text"
                  value={metadata.sealNo || ''}
                  onChange={(e) => handleUpdate('sealNo', e.target.value)}
                  placeholder="ML-092831"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Country of Origin</label>
                <input
                  type="text"
                  value={metadata.countryOfOrigin || ''}
                  onChange={(e) => handleUpdate('countryOfOrigin', e.target.value)}
                  placeholder="e.g. China"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Carrier Name</label>
                <input
                  type="text"
                  value={metadata.carrier || ''}
                  onChange={(e) => handleUpdate('carrier', e.target.value)}
                  placeholder="e.g. Evergreen Marine"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};
