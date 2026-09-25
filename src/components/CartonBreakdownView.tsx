import React from 'react';
import { 
  Package, 
  Layers, 
  Scale, 
  Box, 
  Plane, 
  Ship, 
  CheckCircle2, 
  AlertCircle,
  Download
} from 'lucide-react';
import { PackingListDocument } from '../types/packingList';
import { exportToExcel } from '../utils/excelExport';

interface CartonBreakdownViewProps {
  document: PackingListDocument;
}

export const CartonBreakdownView: React.FC<CartonBreakdownViewProps> = ({ document }) => {
  const totalCartons = document.items.reduce((s, i) => s + (Number(i.cartonCount) || 1), 0);
  const totalGrossWeight = document.items.reduce((s, i) => s + (Number(i.grossWeight) || 0), 0);
  const totalCbm = document.items.reduce((s, i) => s + (Number(i.cbm) || 0), 0);
  const avgWeightPerCarton = totalCartons > 0 ? (totalGrossWeight / totalCartons).toFixed(1) : 0;
  
  // Calculate Volumetric Air Freight Weight (1 CBM = 167 kg approx, or L*W*H/6000)
  const airVolumetricWeight = totalCbm * 166.67;
  const isVolumeHeavy = airVolumetricWeight > totalGrossWeight;

  return (
    <div className="space-y-6">
      
      {/* Top Packaging Metrics KPI bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Total Outer Packages</span>
            <div className="text-2xl font-extrabold text-white mt-1">{totalCartons}</div>
            <span className="text-[11px] text-emerald-400">Master Cartons / Crates</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Package className="h-6 w-6" />
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Avg Weight Per Box</span>
            <div className="text-2xl font-extrabold text-white mt-1">{avgWeightPerCarton} kg</div>
            <span className="text-[11px] text-slate-400">Gross Weight / Carton</span>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <Scale className="h-6 w-6" />
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Total Shipment Volume</span>
            <div className="text-2xl font-extrabold text-white mt-1">{totalCbm.toFixed(3)} m³</div>
            <span className="text-[11px] text-cyan-400">{(totalCbm * 35.3147).toFixed(1)} Cubic Feet (CFT)</span>
          </div>
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
            <Box className="h-6 w-6" />
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Air Freight Chargeable Wt</span>
            <div className="text-2xl font-extrabold text-white mt-1">
              {Math.max(totalGrossWeight, airVolumetricWeight).toFixed(1)} kg
            </div>
            <span className={`text-[11px] font-medium ${isVolumeHeavy ? 'text-amber-400' : 'text-emerald-400'}`}>
              {isVolumeHeavy ? 'Volumetric / Bulky Cargo' : 'Deadweight Cargo'}
            </span>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
            <Plane className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* Carton Cards Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-400" />
              <span>Carton & Package Manifest Breakdown</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Detailed packaging ratios, carton counts, and dimensional measurements
            </p>
          </div>

          <button
            onClick={() => exportToExcel(document, { multiSheet: true })}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
          >
            <Download className="h-3.5 w-3.5 text-emerald-400" />
            <span>Export Carton Sheet</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {document.items.map((item, idx) => {
            const unitsPerBox = item.cartonCount > 0 ? Math.round(item.quantity / item.cartonCount) : item.quantity;
            const tareWeight = item.grossWeight > item.netWeight ? (item.grossWeight - item.netWeight).toFixed(1) : 0;

            return (
              <div
                key={item.id || idx}
                className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between transition group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      {item.cartonNo}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      {item.cartonCount} {item.cartonCount > 1 ? 'Boxes' : 'Box'}
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="font-mono text-xs font-bold text-slate-200 truncate">
                      {item.itemCode || 'SKU N/A'}
                    </div>
                    <div className="text-xs text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                      {item.description}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                    <div>
                      <span className="text-slate-500 block">Packaging Ratio:</span>
                      <span className="text-slate-200 font-semibold">{unitsPerBox} {item.unit} / box</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Total Quantity:</span>
                      <span className="text-emerald-400 font-bold font-mono">{item.quantity} {item.unit}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Gross / Net Wt:</span>
                      <span className="text-slate-200 font-mono">{item.grossWeight} / {item.netWeight} kg</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Carton Tare Wt:</span>
                      <span className="text-slate-400 font-mono">{tareWeight} kg</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="truncate">
                    <span>Dim: </span>
                    <span className="font-mono text-slate-300">{item.dimensions || 'N/A'}</span>
                  </div>
                  <div className="font-mono text-cyan-400 shrink-0 font-medium">
                    {item.cbm ? `${item.cbm.toFixed(3)} m³` : '-'}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
