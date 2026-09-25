import React, { useState } from 'react';
import { 
  FileCheck2, 
  ShieldCheck, 
  AlertCircle, 
  Copy, 
  Check, 
  Download, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { PackingListDocument } from '../types/packingList';
import { exportToExcel } from '../utils/excelExport';

interface CustomsManifestViewProps {
  document: PackingListDocument;
  onOpenAiAssistant: () => void;
}

export const CustomsManifestView: React.FC<CustomsManifestViewProps> = ({
  document,
  onOpenAiAssistant,
}) => {
  const [copied, setCopied] = useState(false);

  // Group items by HS Code
  const hsCodeGroups = React.useMemo(() => {
    const groups = new Map<string, {
      code: string;
      description: string;
      itemsCount: number;
      totalQty: number;
      unit: string;
      totalNetWeight: number;
      totalGrossWeight: number;
      totalValue: number;
      items: typeof document.items;
    }>();

    document.items.forEach(item => {
      const code = item.hsCode?.trim() || 'Missing / Unclassified';
      const existing = groups.get(code) || {
        code,
        description: item.description,
        itemsCount: 0,
        totalQty: 0,
        unit: item.unit,
        totalNetWeight: 0,
        totalGrossWeight: 0,
        totalValue: 0,
        items: [],
      };

      existing.itemsCount += 1;
      existing.totalQty += item.quantity;
      existing.totalNetWeight += item.netWeight;
      existing.totalGrossWeight += item.grossWeight;
      existing.totalValue += item.totalAmount || (item.unitPrice ? item.unitPrice * item.quantity : 0);
      existing.items.push(item);

      groups.set(code, existing);
    });

    return Array.from(groups.values());
  }, [document.items]);

  const missingHsCount = hsCodeGroups.filter(g => g.code === 'Missing / Unclassified').length;

  const copyCustomsSummary = () => {
    const lines = [
      `CUSTOMS DECLARATION & HS TARIFF MANIFEST`,
      `Document: ${document.metadata.packingListNo || document.fileName}`,
      `Origin: ${document.metadata.countryOfOrigin || 'N/A'} | Destination: ${document.metadata.finalDestination || 'N/A'}`,
      `--------------------------------------------------------------------------------`,
      `HS Code\t\tDescription\t\tQty\tNet Wt (kg)\tValue`,
    ];

    hsCodeGroups.forEach(g => {
      lines.push(`${g.code}\t${g.description.slice(0, 30)}\t${g.totalQty} ${g.unit}\t${g.totalNetWeight.toFixed(1)}\t${g.totalValue.toFixed(2)}`);
    });

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Customs Tariff & HS Code Manifest</h3>
              <p className="text-xs text-slate-400">
                Aggregated by Harmonized Tariff Schedule (HTS) classification for customs declaration & duty assessment
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {missingHsCount > 0 && (
            <button
              onClick={onOpenAiAssistant}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-purple-300 bg-purple-950/80 hover:bg-purple-900 border border-purple-800 rounded-lg transition"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              <span>AI Auto-Detect Missing HS Codes</span>
            </button>
          )}

          <button
            onClick={copyCustomsSummary}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>Copy Manifest</span>
          </button>

          <button
            onClick={() => exportToExcel(document, { multiSheet: true })}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Customs Excel</span>
          </button>
        </div>
      </div>

      {/* Origin & Routing Card */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs">
        <div>
          <span className="text-slate-500 block">Country of Origin:</span>
          <span className="font-bold text-slate-200 mt-0.5 block">{document.metadata.countryOfOrigin || 'Declared on Document'}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Port of Entry / POD:</span>
          <span className="font-bold text-slate-200 mt-0.5 block">{document.metadata.portOfDischarge || 'Customs Port'}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Unique Tariff Headings:</span>
          <span className="font-bold text-emerald-400 mt-0.5 block">{hsCodeGroups.length} Categories</span>
        </div>
        <div>
          <span className="text-slate-500 block">Declared Commercial Currency:</span>
          <span className="font-bold text-cyan-400 mt-0.5 block">{document.metadata.currency || 'USD'}</span>
        </div>
      </div>

      {/* HS Code Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-950 border-b border-slate-800 text-slate-400">
            <tr>
              <th className="p-3 font-semibold">HS Tariff Code</th>
              <th className="p-3 font-semibold">Representative Description</th>
              <th className="p-3 font-semibold text-center">Lines</th>
              <th className="p-3 font-semibold text-right">Declared Quantity</th>
              <th className="p-3 font-semibold text-right">Net Wt (kg)</th>
              <th className="p-3 font-semibold text-right">Gross Wt (kg)</th>
              <th className="p-3 font-semibold text-right">Declared Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-slate-200">
            {hsCodeGroups.map((group, idx) => {
              const isMissing = group.code === 'Missing / Unclassified';
              return (
                <tr key={idx} className={`hover:bg-slate-800/40 transition ${isMissing ? 'bg-amber-950/10' : ''}`}>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                        isMissing
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {group.code}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 max-w-sm truncate text-slate-300">
                    {group.description}
                  </td>
                  <td className="p-3 text-center font-mono text-slate-400">
                    {group.itemsCount}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-200">
                    {group.totalQty.toLocaleString()} {group.unit}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-300">
                    {group.totalNetWeight.toFixed(2)}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-300">
                    {group.totalGrossWeight.toFixed(2)}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-400">
                    {group.totalValue > 0 ? `${document.metadata.currency || '$'} ${group.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};
