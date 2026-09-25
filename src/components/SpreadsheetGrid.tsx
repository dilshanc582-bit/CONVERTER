import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Copy, 
  AlertTriangle, 
  CheckCircle, 
  Filter, 
  ArrowUpDown, 
  Eye, 
  EyeOff,
  Calculator,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { PackingItem, PackingListDocument } from '../types/packingList';

interface SpreadsheetGridProps {
  document: PackingListDocument;
  onUpdateItems: (items: PackingItem[]) => void;
  visibleColumns: Record<string, boolean>;
  onToggleColumn: (key: string) => void;
}

export const SpreadsheetGrid: React.FC<SpreadsheetGridProps> = ({
  document,
  onUpdateItems,
  visibleColumns,
  onToggleColumn,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof PackingItem | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [editingCell, setEditingCell] = useState<{ id: string; field: keyof PackingItem } | null>(null);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  // Column definitions
  const columnsList: { key: keyof PackingItem; label: string; width: string; align: 'left' | 'right' | 'center' }[] = [
    { key: 'cartonNo', label: 'Carton #', width: 'w-28 min-w-[110px]', align: 'left' },
    { key: 'cartonCount', label: 'Box Qty', width: 'w-20 min-w-[80px]', align: 'right' },
    { key: 'itemCode', label: 'SKU / Part #', width: 'w-36 min-w-[130px]', align: 'left' },
    { key: 'description', label: 'Description of Goods', width: 'w-72 min-w-[260px]', align: 'left' },
    { key: 'quantity', label: 'Quantity', width: 'w-24 min-w-[90px]', align: 'right' },
    { key: 'unit', label: 'UOM', width: 'w-20 min-w-[70px]', align: 'center' },
    { key: 'packageType', label: 'Pkg Type', width: 'w-24 min-w-[90px]', align: 'left' },
    { key: 'netWeight', label: `N.W. (${document.items[0]?.weightUnit || 'KG'})`, width: 'w-28 min-w-[100px]', align: 'right' },
    { key: 'grossWeight', label: `G.W. (${document.items[0]?.weightUnit || 'KG'})`, width: 'w-28 min-w-[100px]', align: 'right' },
    { key: 'cbm', label: 'CBM (m³)', width: 'w-24 min-w-[90px]', align: 'right' },
    { key: 'dimensions', label: 'Dimensions (cm)', width: 'w-32 min-w-[120px]', align: 'left' },
    { key: 'hsCode', label: 'HS Tariff Code', width: 'w-32 min-w-[120px]', align: 'left' },
    { key: 'unitPrice', label: 'Unit Price', width: 'w-24 min-w-[90px]', align: 'right' },
    { key: 'totalAmount', label: 'Total Value', width: 'w-28 min-w-[100px]', align: 'right' },
    { key: 'lotNumber', label: 'Lot / Batch', width: 'w-28 min-w-[100px]', align: 'left' },
    { key: 'remarks', label: 'Remarks / Notes', width: 'w-48 min-w-[180px]', align: 'left' },
  ];

  // Cell change handler
  const handleCellChange = (id: string, field: keyof PackingItem, rawValue: string) => {
    const updated = document.items.map((item) => {
      if (item.id !== id) return item;

      let val: string | number | undefined = rawValue;
      if (['quantity', 'cartonCount', 'netWeight', 'grossWeight', 'cbm', 'unitPrice', 'totalAmount', 'innerQty'].includes(field)) {
        const num = parseFloat(rawValue);
        val = isNaN(num) ? 0 : num;
      }

      const newItem = { ...item, [field]: val };
      
      // Auto recalculate total amount if unit price changes and total is empty or proportional
      if (field === 'unitPrice' && newItem.quantity) {
        newItem.totalAmount = Number((Number(newItem.unitPrice || 0) * newItem.quantity).toFixed(2));
      }

      return newItem;
    });

    onUpdateItems(updated);
  };

  // Add new row
  const handleAddRow = () => {
    const nextIdx = document.items.length + 1;
    const newItem: PackingItem = {
      id: `item-${Date.now()}`,
      cartonNo: `CTN #${nextIdx}`,
      cartonCount: 1,
      itemCode: `SKU-${nextIdx.toString().padStart(3, '0')}`,
      description: 'New Item Description',
      quantity: 100,
      unit: 'PCS',
      packageType: 'Carton',
      netWeight: 10.0,
      grossWeight: 11.5,
      weightUnit: 'KG',
      cbm: 0.12,
      dimensions: '40 x 30 x 20 cm',
      hsCode: '',
    };
    onUpdateItems([...document.items, newItem]);
  };

  // Duplicate row
  const handleDuplicateRow = (index: number) => {
    const target = document.items[index];
    const duplicated: PackingItem = {
      ...target,
      id: `item-${Date.now()}`,
      cartonNo: `${target.cartonNo} (Copy)`,
    };
    const next = [...document.items];
    next.splice(index + 1, 0, duplicated);
    onUpdateItems(next);
  };

  // Delete row
  const handleDeleteRow = (index: number) => {
    if (document.items.length <= 1) return;
    const next = document.items.filter((_, idx) => idx !== index);
    onUpdateItems(next);
  };

  // Sorting
  const handleSort = (field: keyof PackingItem) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filtered & sorted items
  const processedItems = useMemo(() => {
    let result = [...document.items];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        item =>
          item.itemCode.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.cartonNo.toLowerCase().includes(q) ||
          (item.hsCode && item.hsCode.toLowerCase().includes(q)) ||
          (item.lotNumber && item.lotNumber.toLowerCase().includes(q))
      );
    }

    if (sortField) {
      result.sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        return sortDirection === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return result;
  }, [document.items, searchTerm, sortField, sortDirection]);

  // Totals calculations
  const totals = useMemo(() => {
    let cartons = 0;
    let qty = 0;
    let nw = 0;
    let gw = 0;
    let cbm = 0;
    let value = 0;

    document.items.forEach(item => {
      cartons += Number(item.cartonCount || 0);
      qty += Number(item.quantity || 0);
      nw += Number(item.netWeight || 0);
      gw += Number(item.grossWeight || 0);
      cbm += Number(item.cbm || 0);
      value += Number(item.totalAmount || (item.unitPrice ? item.unitPrice * item.quantity : 0));
    });

    return {
      cartons,
      qty,
      nw: Number(nw.toFixed(2)),
      gw: Number(gw.toFixed(2)),
      cbm: Number(cbm.toFixed(3)),
      value: Number(value.toFixed(2)),
    };
  }, [document.items]);

  // Reconciliation checks with stated totals
  const statedGW = document.statedTotals.totalGrossWeight;
  const gwDiff = statedGW !== undefined ? Math.abs(statedGW - totals.gw) : 0;
  const isGwReconciled = statedGW === undefined || gwDiff < 0.1;

  const statedCartons = document.statedTotals.totalCartons;
  const cartonDiff = statedCartons !== undefined ? Math.abs(statedCartons - totals.cartons) : 0;
  const isCartonReconciled = statedCartons === undefined || cartonDiff === 0;

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl h-full">
      
      {/* Top Controls Bar */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search SKU, Description, Carton, HS Code..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
            >
              ×
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          
          {/* Column Toggle Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowColumnDropdown(!showColumnDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
            >
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <span>Columns</span>
            </button>

            {showColumnDropdown && (
              <div 
                className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in"
                onMouseLeave={() => setShowColumnDropdown(false)}
              >
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Toggle Columns
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {columnsList.map((col) => (
                    <label
                      key={col.key}
                      className="flex items-center justify-between px-2 py-1 hover:bg-slate-800 rounded cursor-pointer text-xs text-slate-200"
                    >
                      <span>{col.label}</span>
                      <input
                        type="checkbox"
                        checked={visibleColumns[col.key] !== false}
                        onChange={() => onToggleColumn(col.key)}
                        className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Add Row Button */}
          <button
            onClick={handleAddRow}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg font-medium transition active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Row</span>
          </button>
        </div>

      </div>

      {/* Spreadsheet Table Container */}
      <div className="flex-1 overflow-auto bg-slate-950 relative">
        <table className="w-full text-left text-xs border-collapse">
          
          {/* Table Header */}
          <thead className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-300 select-none shadow-sm">
            <tr>
              <th className="p-2.5 w-12 text-center text-slate-500 font-mono border-r border-slate-800">
                #
              </th>
              
              {columnsList.map((col) => {
                if (visibleColumns[col.key] === false) return null;
                return (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className={`p-2.5 ${col.width} font-semibold hover:text-white hover:bg-slate-800/60 cursor-pointer transition border-r border-slate-800 ${
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    }`}
                  >
                    <div className={`flex items-center gap-1.5 ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'}`}>
                      <span>{col.label}</span>
                      {sortField === col.key && (
                        <ArrowUpDown className="h-3 w-3 text-emerald-400" />
                      )}
                    </div>
                  </th>
                );
              })}

              <th className="p-2.5 w-20 text-center font-semibold text-slate-400">
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-800/80 text-slate-200 font-sans">
            {processedItems.map((item, index) => {
              const hasWeightAnomaly = item.netWeight > item.grossWeight;
              const hasMissingHs = !item.hsCode;

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-900/80 transition-colors group ${
                    hasWeightAnomaly ? 'bg-amber-950/20' : ''
                  }`}
                >
                  {/* Row Index */}
                  <td className="p-2 text-center text-slate-500 font-mono text-[11px] border-r border-slate-800/60">
                    {index + 1}
                  </td>

                  {/* Carton # */}
                  {visibleColumns.cartonNo !== false && (
                    <td className="p-1.5 border-r border-slate-800/60">
                      <input
                        type="text"
                        value={item.cartonNo}
                        onChange={(e) => handleCellChange(item.id, 'cartonNo', e.target.value)}
                        className="w-full bg-transparent px-1.5 py-1 rounded text-slate-200 font-mono text-xs hover:bg-slate-800/60 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                  )}

                  {/* Box Qty */}
                  {visibleColumns.cartonCount !== false && (
                    <td className="p-1.5 border-r border-slate-800/60 text-right">
                      <input
                        type="number"
                        min="1"
                        value={item.cartonCount}
                        onChange={(e) => handleCellChange(item.id, 'cartonCount', e.target.value)}
                        className="w-full bg-transparent px-1.5 py-1 rounded text-right text-slate-200 font-mono text-xs hover:bg-slate-800/60 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                  )}

                  {/* SKU / Part # */}
                  {visibleColumns.itemCode !== false && (
                    <td className="p-1.5 border-r border-slate-800/60">
                      <input
                        type="text"
                        value={item.itemCode}
                        onChange={(e) => handleCellChange(item.id, 'itemCode', e.target.value)}
                        className="w-full bg-transparent px-1.5 py-1 rounded text-cyan-400 font-mono font-medium text-xs hover:bg-slate-800/60 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                  )}

                  {/* Description of Goods */}
                  {visibleColumns.description !== false && (
                    <td className="p-1.5 border-r border-slate-800/60">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleCellChange(item.id, 'description', e.target.value)}
                        className="w-full bg-transparent px-1.5 py-1 rounded text-slate-200 text-xs hover:bg-slate-800/60 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                  )}

                  {/* Quantity */}
                  {visibleColumns.quantity !== false && (
                    <td className="p-1.5 border-r border-slate-800/60 text-right">
                      <input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(e) => handleCellChange(item.id, 'quantity', e.target.value)}
                        className="w-full bg-transparent px-1.5 py-1 rounded text-right text-emerald-400 font-mono font-bold text-xs hover:bg-slate-800/60 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                  )}

                  {/* Unit */}
                  {visibleColumns.unit !== false && (
                    <td className="p-1.5 border-r border-slate-800/60 text-center">
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => handleCellChange(item.id, 'unit', e.target.value)}
                        className="w-full bg-transparent px-1.5 py-1 rounded text-center text-slate-300 font-mono text-xs hover:bg-slate-800/60 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                  )}

                  {/* Package Type */}
                  {visibleColumns.packageType !== false && (
                    <td className="p-1.5 border-r border-slate-800/60">
                      <input
                        type="text"
                        value={item.packageType}
                        onChange={(e) => handleCellChange(item.id, 'packageType', e.target.value)}
                        className="w-full bg-transparent px-1.5 py-1 rounded text-slate-300 text-xs hover:bg-slate-800/60 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                  )}

                  {/* Net Weight */}
                  {visibleColumns.netWeight !== false && (
                    <td className="p-1.5 border-r border-slate-800/60 text-right">
                      <input
                        type="number"
                        step="0.1"
                        value={item.netWeight}
                        onChange={(e) => handleCellChange(item.id, 'netWeight', e.target.value)}
                        className="w-full bg-transparent px-1.5 py-1 rounded text-right text-slate-200 font-mono text-xs hover:bg-slate-800/60 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                  )}

                  {/* Gross Weight */}
                  {visibleColumns.grossWeight !== false && (
                    <td className={`p-1.5 border-r border-slate-800/60 text-right ${hasWeightAnomaly ? 'bg-amber-500/10' : ''}`}>
                      <div className="flex items-center justify-end gap-1">
                        {hasWeightAnomaly && (
                          <span title="Gross weight is less than net weight!">
                            <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0" />
                          </span>
                        )}
                        <input
                          type="number"
                          step="0.1"
                          value={item.grossWeight}
                          onChange={(e) => handleCellChange(item.id, 'grossWeight', e.target.value)}
                          className="w-full bg-transparent px-1.5 py-1 rounded text-right text-slate-200 font-mono text-xs hover:bg-slate-800/60 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </td>
                  )}

                  {/* CBM */}
                  {visibleColumns.cbm !== false && (
                    <td className="p-1.5 border-r border-slate-800/60 text-right">
                      <input
                        type="number"
                        step="0.001"
                        value={item.cbm}
                        onChange={(e) => handleCellChange(item.id, 'cbm', e.target.value)}
                        className="w-full bg-transparent px-1.5 py-1 rounded text-right text-slate-200 font-mono text-xs hover:bg-slate-800/60 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                  )}

                  {/* Dimensions */}
                  {visibleColumns.dimensions !== false && (
                    <td className="p-1.5 border-r border-slate-800/60">
                      <input
                        type="text"
                        value={item.dimensions || ''}
                        onChange={(e) => handleCellChange(item.id, 'dimensions', e.target.value)}
                        placeholder="L x W x H cm"
                        className="w-full bg-transparent px-1.5 py-1 rounded text-slate-400 font-mono text-xs hover:bg-slate-800/60 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                  )}

                  {/* HS Tariff Code */}
                  {visibleColumns.hsCode !== false && (
                    <td className="p-1.5 border-r border-slate-800/60">
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={item.hsCode || ''}
                          onChange={(e) => handleCellChange(item.id, 'hsCode', e.target.value)}
                          placeholder="e.g. 8518.30"
                          className="w-full bg-transparent px-1.5 py-1 rounded text-emerald-400 font-mono text-xs hover:bg-slate-800/60 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        {hasMissingHs && (
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" title="Missing HS Code" />
                        )}
                      </div>
                    </td>
                  )}

                  {/* Unit Price */}
                  {visibleColumns.unitPrice !== false && (
                    <td className="p-1.5 border-r border-slate-800/60 text-right">
                      <input
                        type="number"
                        step="0.01"
                        value={item.unitPrice || ''}
                        onChange={(e) => handleCellChange(item.id, 'unitPrice', e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-transparent px-1.5 py-1 rounded text-right text-slate-300 font-mono text-xs hover:bg-slate-800/60 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                  )}

                  {/* Total Amount */}
                  {visibleColumns.totalAmount !== false && (
                    <td className="p-1.5 border-r border-slate-800/60 text-right">
                      <input
                        type="number"
                        step="0.01"
                        value={item.totalAmount || (item.unitPrice ? (item.unitPrice * item.quantity).toFixed(2) : '')}
                        onChange={(e) => handleCellChange(item.id, 'totalAmount', e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-transparent px-1.5 py-1 rounded text-right text-slate-200 font-mono font-semibold text-xs hover:bg-slate-800/60 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                  )}

                  {/* Lot / Batch */}
                  {visibleColumns.lotNumber !== false && (
                    <td className="p-1.5 border-r border-slate-800/60">
                      <input
                        type="text"
                        value={item.lotNumber || ''}
                        onChange={(e) => handleCellChange(item.id, 'lotNumber', e.target.value)}
                        className="w-full bg-transparent px-1.5 py-1 rounded text-slate-400 font-mono text-xs hover:bg-slate-800/60 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                  )}

                  {/* Remarks */}
                  {visibleColumns.remarks !== false && (
                    <td className="p-1.5 border-r border-slate-800/60">
                      <input
                        type="text"
                        value={item.remarks || ''}
                        onChange={(e) => handleCellChange(item.id, 'remarks', e.target.value)}
                        placeholder="Notes"
                        className="w-full bg-transparent px-1.5 py-1 rounded text-slate-400 text-xs hover:bg-slate-800/60 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                  )}

                  {/* Row Actions */}
                  <td className="p-1.5 text-center">
                    <div className="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition">
                      <button
                        onClick={() => handleDuplicateRow(index)}
                        className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition"
                        title="Duplicate row"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteRow(index)}
                        className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                        title="Delete row"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Sticky Bottom Totals & Reconciliation Bar */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left: Summary Metrics */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Total Boxes:</span>
            <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {totals.cartons} CTNS
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Total Units:</span>
            <span className="font-mono font-bold text-emerald-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {totals.qty.toLocaleString()} PCS
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Net Weight:</span>
            <span className="font-mono font-bold text-slate-200">
              {totals.nw.toLocaleString()} kg
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Gross Weight:</span>
            <span className="font-mono font-bold text-slate-200">
              {totals.gw.toLocaleString()} kg
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Volume:</span>
            <span className="font-mono font-bold text-cyan-400">
              {totals.cbm.toFixed(3)} m³
            </span>
          </div>

          {totals.value > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Total Value:</span>
              <span className="font-mono font-bold text-emerald-400">
                {document.metadata.currency || '$'} {totals.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>

        {/* Right: Validation & Reconciliation Status Badge */}
        <div className="flex items-center gap-2">
          {isGwReconciled && isCartonReconciled ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[11px] font-semibold">
              <CheckCircle className="h-3.5 w-3.5" />
              <span>Stated Totals Reconciled</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-[11px] font-semibold">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>
                {cartonDiff > 0 ? `Carton mismatch (Stated ${statedCartons} vs Sum ${totals.cartons})` : `Weight mismatch (${gwDiff.toFixed(1)} kg)`}
              </span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
