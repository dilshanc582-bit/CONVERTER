import React from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  Sparkles, 
  Columns, 
  Layers, 
  FileCheck2, 
  Copy, 
  Check, 
  ChevronDown,
  FileText
} from 'lucide-react';
import { PackingListDocument } from '../types/packingList';
import { exportToExcel, exportToCsv, exportToJson, copySpreadsheetToClipboard } from '../utils/excelExport';

interface HeaderProps {
  currentDoc: PackingListDocument | null;
  onOpenUpload: () => void;
  onSelectSample: (id: string) => void;
  viewMode: 'grid' | 'split' | 'cartons' | 'customs';
  onChangeViewMode: (mode: 'grid' | 'split' | 'cartons' | 'customs') => void;
  onOpenAiAssistant: () => void;
  onToggleColumnManager: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDoc,
  onOpenUpload,
  onSelectSample,
  viewMode,
  onChangeViewMode,
  onOpenAiAssistant,
  onToggleColumnManager,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [showExportMenu, setShowExportMenu] = React.useState(false);
  const [showSampleMenu, setShowSampleMenu] = React.useState(false);

  const handleCopyClipboard = async () => {
    if (!currentDoc) return;
    try {
      await copySpreadsheetToClipboard(currentDoc);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & App Name */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  PackToExcel
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  AI OCR
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Packing List PDF to Excel (.xlsx) Converter
              </p>
            </div>
          </div>

          {/* Navigation View Tabs */}
          {currentDoc && (
            <div className="hidden md:flex items-center bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-xs font-medium">
              <button
                onClick={() => onChangeViewMode('split')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'split'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Columns className="h-3.5 w-3.5" />
                <span>Side-by-Side</span>
              </button>

              <button
                onClick={() => onChangeViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>Spreadsheet</span>
              </button>

              <button
                onClick={() => onChangeViewMode('cartons')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'cartons'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Carton Breakdown</span>
              </button>

              <button
                onClick={() => onChangeViewMode('customs')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'customs'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <FileCheck2 className="h-3.5 w-3.5" />
                <span>Customs & HS</span>
              </button>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            
            {/* Sample Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSampleMenu(!showSampleMenu)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700/80 rounded-lg border border-slate-700 transition"
              >
                <FileText className="h-3.5 w-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Try Samples</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {showSampleMenu && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95"
                  onMouseLeave={() => setShowSampleMenu(false)}
                >
                  <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Preset Packing Lists
                  </div>
                  <button
                    onClick={() => {
                      onSelectSample('sample-electronics-01');
                      setShowSampleMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-slate-800 text-slate-200 flex flex-col gap-0.5"
                  >
                    <span className="font-semibold text-emerald-400">1. Audio Electronics (China → USA)</span>
                    <span className="text-[11px] text-slate-400">120 Cartons, 5 SKUs, CBM & Weights</span>
                  </button>
                  <button
                    onClick={() => {
                      onSelectSample('sample-apparel-02');
                      setShowSampleMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-slate-800 text-slate-200 flex flex-col gap-0.5"
                  >
                    <span className="font-semibold text-emerald-400">2. Apparel & Garments (BD → NL)</span>
                    <span className="text-[11px] text-slate-400">85 Cartons, Pre-pack ratio, HS codes</span>
                  </button>
                  <button
                    onClick={() => {
                      onSelectSample('sample-machinery-03');
                      setShowSampleMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-slate-800 text-slate-200 flex flex-col gap-0.5"
                  >
                    <span className="font-semibold text-emerald-400">3. Heavy Industrial (DE → SG)</span>
                    <span className="text-[11px] text-slate-400">14 Wooden Cases, Precision Pumps</span>
                  </button>
                </div>
              )}
            </div>

            {/* Upload Button */}
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm shadow-emerald-500/20 transition active:scale-95"
            >
              <Upload className="h-3.5 w-3.5 text-slate-950" />
              <span>Upload PDF</span>
            </button>

            {/* AI Assistant Button */}
            {currentDoc && (
              <button
                onClick={onOpenAiAssistant}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-purple-300 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/60 rounded-lg transition"
                title="AI Customs & Logistics Assistant"
              >
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                <span className="hidden lg:inline">AI Tools</span>
              </button>
            )}

            {/* Column Manager */}
            {currentDoc && (
              <button
                onClick={onToggleColumnManager}
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg border border-slate-800 transition"
                title="Toggle Columns"
              >
                <Columns className="h-4 w-4" />
              </button>
            )}

            {/* Export Dropdown */}
            {currentDoc && (
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm shadow-blue-500/20 transition active:scale-95"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export</span>
                  <ChevronDown className="h-3 w-3 opacity-70" />
                </button>

                {showExportMenu && (
                  <div 
                    className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95"
                    onMouseLeave={() => setShowExportMenu(false)}
                  >
                    <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Excel (.xlsx) Formats
                    </div>
                    
                    <button
                      onClick={() => {
                        exportToExcel(currentDoc, { multiSheet: true, includeMetadataHeader: true });
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-emerald-400">Complete Workbook (.xlsx)</span>
                        <span className="text-[11px] text-slate-400">Items, Cartons, Customs & Manifest</span>
                      </div>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono">
                        Multi-Tab
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        exportToExcel(currentDoc, { multiSheet: false, includeMetadataHeader: true });
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-slate-800 text-slate-200 flex flex-col"
                    >
                      <span className="font-semibold text-blue-400">Standard Packing List (.xlsx)</span>
                      <span className="text-[11px] text-slate-400">Single tab with metadata & items</span>
                    </button>

                    <div className="my-1 border-t border-slate-800" />

                    <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Other Formats
                    </div>

                    <button
                      onClick={() => {
                        exportToCsv(currentDoc);
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                    >
                      <span>Comma-Separated (.csv)</span>
                      <span className="text-[10px] text-slate-500 font-mono">ERP Import</span>
                    </button>

                    <button
                      onClick={() => {
                        exportToJson(currentDoc);
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                    >
                      <span>Structured Data (.json)</span>
                      <span className="text-[10px] text-slate-500 font-mono">API / EDI</span>
                    </button>

                    <button
                      onClick={() => {
                        handleCopyClipboard();
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                    >
                      <span>Copy for Google Sheets</span>
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-slate-500" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
