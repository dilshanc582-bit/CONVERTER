import React, { useState } from 'react';
import { Header } from './components/Header';
import { UploadModal } from './components/UploadModal';
import { DocumentViewer } from './components/DocumentViewer';
import { SpreadsheetGrid } from './components/SpreadsheetGrid';
import { MetadataEditor } from './components/MetadataEditor';
import { CartonBreakdownView } from './components/CartonBreakdownView';
import { CustomsManifestView } from './components/CustomsManifestView';
import { AiAssistantModal } from './components/AiAssistantModal';
import { SAMPLE_PACKING_LISTS } from './data/samplePackingLists';
import { PackingListDocument, PackingItem, HeaderMetadata } from './types/packingList';
import { 
  FileSpreadsheet, 
  Upload, 
  FileCheck2, 
  Sparkles, 
  Info, 
  AlertTriangle, 
  Download,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { exportToExcel } from './utils/excelExport';

export default function App() {
  const [currentDoc, setCurrentDoc] = useState<PackingListDocument>(SAMPLE_PACKING_LISTS[0]);
  const [viewMode, setViewMode] = useState<'split' | 'grid' | 'cartons' | 'customs'>('split');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    cartonNo: true,
    cartonCount: true,
    itemCode: true,
    description: true,
    quantity: true,
    unit: true,
    packageType: true,
    netWeight: true,
    grossWeight: true,
    cbm: true,
    dimensions: true,
    hsCode: true,
    unitPrice: true,
    totalAmount: true,
    lotNumber: false,
    remarks: false,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleColumn = (key: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [key]: prev[key] === false ? true : false,
    }));
  };

  const handleSelectSample = (id: string) => {
    const found = SAMPLE_PACKING_LISTS.find(s => s.id === id);
    if (found) {
      setCurrentDoc(JSON.parse(JSON.stringify(found)));
      showToast(`Loaded "${found.fileName}"`);
    }
  };

  const handleConverted = (doc: PackingListDocument, rawPreviewUrl?: string) => {
    doc.rawPreviewUrl = rawPreviewUrl;
    setCurrentDoc(doc);
    setViewMode('split');
    showToast(`Converted ${doc.items.length} line items successfully!`);
  };

  const handleUpdateItems = (newItems: PackingItem[]) => {
    setCurrentDoc(prev => ({
      ...prev,
      items: newItems,
    }));
  };

  const handleUpdateMetadata = (newMetadata: HeaderMetadata) => {
    setCurrentDoc(prev => ({
      ...prev,
      metadata: newMetadata,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-500 text-slate-950 px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <Sparkles className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        currentDoc={currentDoc}
        onOpenUpload={() => setIsUploadOpen(true)}
        onSelectSample={handleSelectSample}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        onToggleColumnManager={() => {
          // Toggle all optional columns
          setVisibleColumns(prev => ({
            ...prev,
            lotNumber: !prev.lotNumber,
            remarks: !prev.remarks,
          }));
          showToast('Toggled extended columns (Lot #, Remarks)');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-4 flex flex-col">
        
        {/* Document Metadata Bar & Validation Alerts */}
        <div className="space-y-2">
          <MetadataEditor
            metadata={currentDoc.metadata}
            onChange={handleUpdateMetadata}
          />

          {/* Validation Warnings if any */}
          {currentDoc.validationIssues && currentDoc.validationIssues.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs">
              {currentDoc.validationIssues.map((issue, idx) => (
                <div
                  key={idx}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border shrink-0 ${
                    issue.type === 'error'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      : issue.type === 'warning'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                  }`}
                >
                  {issue.type === 'error' ? (
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                  ) : issue.type === 'warning' ? (
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                  ) : (
                    <Info className="h-3.5 w-3.5 text-blue-400" />
                  )}
                  <span>{issue.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View Mode Switching */}
        {viewMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-[680px]">
            {/* Left Col: Document / Source PDF Preview (5 cols) */}
            <div className="lg:col-span-5 h-[680px]">
              <DocumentViewer doc={currentDoc} />
            </div>

            {/* Right Col: Interactive Excel Spreadsheet Grid (7 cols) */}
            <div className="lg:col-span-7 h-[680px] flex flex-col">
              <SpreadsheetGrid
                document={currentDoc}
                onUpdateItems={handleUpdateItems}
                visibleColumns={visibleColumns}
                onToggleColumn={handleToggleColumn}
              />
            </div>
          </div>
        )}

        {viewMode === 'grid' && (
          <div className="flex-1 min-h-[680px] flex flex-col">
            <SpreadsheetGrid
              document={currentDoc}
              onUpdateItems={handleUpdateItems}
              visibleColumns={visibleColumns}
              onToggleColumn={handleToggleColumn}
            />
          </div>
        )}

        {viewMode === 'cartons' && (
          <div className="flex-1">
            <CartonBreakdownView document={currentDoc} />
          </div>
        )}

        {viewMode === 'customs' && (
          <div className="flex-1">
            <CustomsManifestView
              document={currentDoc}
              onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
            />
          </div>
        )}

      </main>

      {/* Footer Info */}
      <footer className="border-t border-slate-900 bg-slate-950 py-3 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">PackToExcel AI</span>
            <span>•</span>
            <span>Automated Logistics & Customs Document Parser</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Powered by Gemini 3.8 Flash</span>
            <span>•</span>
            <button
              onClick={() => exportToExcel(currentDoc, { multiSheet: true })}
              className="text-emerald-400 hover:underline font-medium"
            >
              Export Current Sheet (.xlsx)
            </button>
          </div>
        </div>
      </footer>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onConverted={handleConverted}
        onSelectSample={handleSelectSample}
      />

      {/* AI Assistant Modal */}
      <AiAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        document={currentDoc}
        onApplyHsCodes={handleUpdateItems}
      />

    </div>
  );
}
