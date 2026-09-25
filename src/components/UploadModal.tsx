import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  AlertCircle, 
  Sparkles, 
  Settings2, 
  CheckCircle2, 
  Loader2, 
  FileCheck,
  Package
} from 'lucide-react';
import { ConversionOptions, PackingListDocument } from '../types/packingList';
import { SAMPLE_PACKING_LISTS } from '../data/samplePackingLists';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConverted: (doc: PackingListDocument, rawPreviewUrl?: string) => void;
  onSelectSample: (id: string) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onConverted,
  onSelectSample,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [stepMessage, setStepMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Conversion options
  const [splitCartons, setSplitCartons] = useState(false);
  const [autoHsCode, setAutoHsCode] = useState(true);
  const [customInstructions, setCustomInstructions] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
    if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF document or scanned image (PDF, PNG, JPG).');
      return;
    }
    if (file.size > 30 * 1024 * 1024) {
      setError('File size exceeds 30MB limit. Please upload a smaller PDF or compress it.');
      return;
    }
    setSelectedFile(file);
  };

  const processFile = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    setStepMessage('Reading and encoding document...');

    try {
      // Create local preview URL
      const previewUrl = URL.createObjectURL(selectedFile);

      // Read as Base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(selectedFile);
      });

      setStepMessage('Gemini Multimodal AI analyzing packing tables & header...');

      const options: ConversionOptions = {
        splitCartonRanges: splitCartons,
        autoInferHsCodes: autoHsCode,
        customInstructions: customInstructions.trim() || undefined,
      };

      const response = await fetch('/api/convert-packing-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileData: base64Data,
          mimeType: selectedFile.type || 'application/pdf',
          fileName: selectedFile.name,
          options,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.details || errJson.error || `Server returned ${response.status}`);
      }

      setStepMessage('Reconciling weights, carton totals and building Excel structure...');
      const data = await response.json();

      if (data.success && data.document) {
        data.document.rawPreviewUrl = previewUrl;
        onConverted(data.document, previewUrl);
        onClose();
      } else {
        throw new Error('Could not parse response structure from AI model');
      }
    } catch (err: unknown) {
      console.error(err);
      setError((err as Error).message || 'Failed to convert document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Upload Packing List PDF</h3>
              <p className="text-xs text-slate-400">AI converts manifests, carton tables, and shipping specs into Excel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
              dragActive 
                ? 'border-emerald-400 bg-emerald-500/10 scale-[0.99]' 
                : selectedFile 
                  ? 'border-emerald-500/50 bg-slate-950/60' 
                  : 'border-slate-700 hover:border-slate-600 bg-slate-950/40 hover:bg-slate-950/70'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/png,image/jpeg,image/webp"
              onChange={handleFileInput}
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <FileCheck className="h-7 w-7" />
                </div>
                <div className="text-sm font-semibold text-slate-200">{selectedFile.name}</div>
                <div className="text-xs text-slate-400 font-mono">
                  {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'PDF Document'}
                </div>
                <span className="text-[11px] text-emerald-400 hover:underline mt-1">
                  Click or drag another file to replace
                </span>
              </div>
            ) : (
              <>
                <div className="h-12 w-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:scale-110 transition">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Drag and drop your Packing List PDF here
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports commercial packing lists, carton lists, bill of lading manifests, and scanned invoices
                  </p>
                </div>
                <button
                  type="button"
                  className="px-4 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition"
                >
                  Browse Files
                </button>
              </>
            )}
          </div>

          {/* Quick Sample Presets */}
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                Don't have a PDF ready? Try these international shipping examples:
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SAMPLE_PACKING_LISTS.map((sample, idx) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => {
                    onSelectSample(sample.id);
                    onClose();
                  }}
                  className="p-2.5 bg-slate-900 hover:bg-slate-800/90 border border-slate-700/60 hover:border-emerald-500/40 rounded-lg text-left transition group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-emerald-400">
                      Sample #{idx + 1}
                    </span>
                    <Package className="h-3 w-3 text-slate-500 group-hover:text-emerald-400" />
                  </div>
                  <div className="text-xs font-medium text-slate-200 mt-1 truncate">
                    {sample.metadata.shipperName?.split(' ')[0]} Packing List
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {sample.statedTotals.totalCartons} Cartons • {sample.items.length} SKUs
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Conversion Options */}
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full px-4 py-2.5 bg-slate-950/40 hover:bg-slate-950/70 flex items-center justify-between text-xs font-medium text-slate-300 transition"
            >
              <div className="flex items-center gap-2">
                <Settings2 className="h-3.5 w-3.5 text-slate-400" />
                <span>Conversion Preferences & Customs Settings</span>
              </div>
              <span className="text-[11px] text-slate-500">
                {showAdvanced ? 'Hide' : 'Customize'}
              </span>
            </button>

            {showAdvanced && (
              <div className="p-4 bg-slate-950/30 border-t border-slate-800 space-y-3.5 text-xs">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoHsCode}
                    onChange={(e) => setAutoHsCode(e.target.checked)}
                    className="mt-0.5 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-semibold text-slate-200">Auto-enrich missing HS Tariff Codes</span>
                    <p className="text-slate-400 text-[11px]">
                      AI will automatically determine standard 6-to-10 digit international HS codes for customs declarations
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={splitCartons}
                    onChange={(e) => setSplitCartons(e.target.checked)}
                    className="mt-0.5 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-semibold text-slate-200">Expand Carton Ranges into Individual Rows</span>
                    <p className="text-slate-400 text-[11px]">
                      If checked, rows like "CTN 1-10" will be expanded into 10 separate rows for barcode scanning or WMS receiving
                    </p>
                  </div>
                </label>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Special Instructions for AI Parser (Optional)
                  </label>
                  <input
                    type="text"
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="e.g. Columns are in Spanish, ignore footer freight charges, use KG for weights"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold">Conversion Error:</span> {error}
              </div>
            </div>
          )}

          {/* Loading / Progress state */}
          {loading && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3.5">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-emerald-300">AI Conversion in Progress</div>
                <div className="text-[11px] text-slate-300 mt-0.5">{stepMessage}</div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Encrypted multimodal processing via Gemini 3.8 Flash</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={processFile}
              disabled={!selectedFile || loading}
              className={`px-5 py-2 text-xs font-bold rounded-lg shadow-lg flex items-center gap-2 transition ${
                selectedFile && !loading
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Converting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Convert to Excel</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
