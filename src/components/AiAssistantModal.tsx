import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Search, 
  Scale, 
  FileText, 
  MessageSquare, 
  Loader2, 
  Check, 
  Copy, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { PackingListDocument, PackingItem } from '../types/packingList';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: PackingListDocument;
  onApplyHsCodes: (updatedItems: PackingItem[]) => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  document,
  onApplyHsCodes,
}) => {
  const [activeTab, setActiveTab] = useState<'hs' | 'volumetric' | 'declaration' | 'chat'>('hs');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Results state
  const [hsSuggestions, setHsSuggestions] = useState<{ itemCode: string; suggestedHsCode: string; reason: string; confidence: string }[] | null>(null);
  const [appliedHs, setAppliedHs] = useState(false);

  const [volumetricData, setVolumetricData] = useState<{
    actualGrossWeight: number;
    airFreightVolumeWeight6000: number;
    airChargeableWeight: number;
    oceanVolumeRatio: number;
    recommendations: string;
  } | null>(null);

  const [declarationText, setDeclarationText] = useState<string | null>(null);
  const [copiedDeclaration, setCopiedDeclaration] = useState(false);

  const [chatQuery, setChatQuery] = useState('');
  const [chatAnswer, setChatAnswer] = useState<{ answer: string; actionableTips?: string[] } | null>(null);

  if (!isOpen) return null;

  // Run HS code suggestion
  const handleSuggestHsCodes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ask-packing-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'suggest_hs_codes',
          document,
        }),
      });
      const data = await res.json();
      if (data.success && data.result?.suggestions) {
        setHsSuggestions(data.result.suggestions);
      } else {
        throw new Error(data.details || 'Failed to generate HS code suggestions');
      }
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Apply suggested HS codes to items
  const handleApplyAllHsCodes = () => {
    if (!hsSuggestions) return;
    const map = new Map<string, string>();
    hsSuggestions.forEach(s => {
      if (s.itemCode && s.suggestedHsCode) {
        map.set(s.itemCode, s.suggestedHsCode);
      }
    });

    const updated = document.items.map(item => {
      if (map.has(item.itemCode) && (!item.hsCode || item.hsCode.trim() === '')) {
        return { ...item, hsCode: map.get(item.itemCode) };
      }
      return item;
    });

    onApplyHsCodes(updated);
    setAppliedHs(true);
    setTimeout(() => setAppliedHs(false), 2500);
  };

  // Run Volumetric Weight Calculation
  const handleCalculateVolumetric = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ask-packing-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'calculate_volumetric_weight',
          document,
        }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setVolumetricData(data.result);
      } else {
        throw new Error(data.details || 'Failed to calculate volumetric weight');
      }
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Run Customs Declaration Letter generator
  const handleGenerateDeclaration = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ask-packing-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_customs_declaration',
          document,
        }),
      });
      const data = await res.json();
      if (data.success && data.result?.declarationText) {
        setDeclarationText(data.result.declarationText);
      } else {
        throw new Error(data.details || 'Failed to draft declaration');
      }
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Run Free-form query
  const handleAskQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ask-packing-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          query: chatQuery,
          document,
        }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setChatAnswer(data.result);
      } else {
        throw new Error(data.details || 'Failed to answer inquiry');
      }
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 border border-purple-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AI Logistics & Customs Assistant</h3>
              <p className="text-xs text-slate-400">Grounded analysis powered by Gemini 3.8 Flash</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-6 pt-3 border-b border-slate-800 flex items-center gap-2 bg-slate-950/40 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('hs')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'hs'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            <span>Harmonized Tariff (HS) Codes</span>
          </button>

          <button
            onClick={() => setActiveTab('volumetric')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'volumetric'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale className="h-3.5 w-3.5" />
            <span>Volumetric Weight Calculator</span>
          </button>

          <button
            onClick={() => setActiveTab('declaration')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'declaration'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Customs Declaration Letter</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'chat'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Shipment Q&A</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: HS Codes */}
          {activeTab === 'hs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-200 text-sm">Harmonized System (HS) Code Enrichment</h4>
                  <p className="text-slate-400 text-xs mt-0.5">
                    AI analyzes descriptions, materials, and intended usage to recommend official customs tariff codes
                  </p>
                </div>

                <button
                  onClick={handleSuggestHsCodes}
                  disabled={loading}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg flex items-center gap-2 shadow-lg shadow-purple-500/20 transition active:scale-95"
                >
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  <span>Identify HS Codes</span>
                </button>
              </div>

              {hsSuggestions && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-semibold">{hsSuggestions.length} items reviewed</span>
                    <button
                      onClick={handleApplyAllHsCodes}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-1.5 transition active:scale-95"
                    >
                      {appliedHs ? <Check className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
                      <span>{appliedHs ? 'Applied to Spreadsheet!' : 'Apply to Blank Cells'}</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {hsSuggestions.map((s, idx) => (
                      <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              {s.suggestedHsCode}
                            </span>
                            <span className="font-mono text-slate-300 font-bold">{s.itemCode}</span>
                            <span className="text-[10px] text-purple-400 uppercase font-semibold">
                              {s.confidence} confidence
                            </span>
                          </div>
                          <p className="text-slate-400 mt-1 text-[11px]">{s.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Volumetric Weight */}
          {activeTab === 'volumetric' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-200 text-sm">Volumetric & Chargeable Weight Analyzer</h4>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Compare Actual Gross Weight vs IATA Air (1:6000) and Ocean Freight (W/M) metrics
                  </p>
                </div>

                <button
                  onClick={handleCalculateVolumetric}
                  disabled={loading}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg flex items-center gap-2 shadow-lg transition active:scale-95"
                >
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Scale className="h-3.5 w-3.5" />}
                  <span>Calculate Volumetric</span>
                </button>
              </div>

              {volumetricData && (
                <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block">Actual Gross Weight</span>
                      <span className="text-xl font-mono font-bold text-white mt-1 block">
                        {volumetricData.actualGrossWeight} kg
                      </span>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block">Air Freight Volumetric (1:6000)</span>
                      <span className="text-xl font-mono font-bold text-purple-400 mt-1 block">
                        {volumetricData.airFreightVolumeWeight6000.toFixed(1)} kg
                      </span>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block">Air Chargeable Weight</span>
                      <span className="text-xl font-mono font-bold text-emerald-400 mt-1 block">
                        {volumetricData.airChargeableWeight.toFixed(1)} kg
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-900/80 rounded-lg border border-slate-800">
                    <span className="font-bold text-slate-300 block mb-1">Freight Recommendation:</span>
                    <p className="text-slate-300 text-xs leading-relaxed">{volumetricData.recommendations}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Declaration */}
          {activeTab === 'declaration' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-200 text-sm">International Customs Packing Declaration</h4>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Draft a formal letterhead declaration with ISPM 15 wood compliance and accurate totals
                  </p>
                </div>

                <button
                  onClick={handleGenerateDeclaration}
                  disabled={loading}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg flex items-center gap-2 shadow-lg transition active:scale-95"
                >
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
                  <span>Generate Declaration</span>
                </button>
              </div>

              {declarationText && (
                <div className="space-y-2">
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(declarationText);
                        setCopiedDeclaration(true);
                        setTimeout(() => setCopiedDeclaration(false), 2000);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition"
                    >
                      {copiedDeclaration ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedDeclaration ? 'Copied!' : 'Copy Letter'}</span>
                    </button>
                  </div>

                  <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-200 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                    {declarationText}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Chat */}
          {activeTab === 'chat' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-200 text-sm">Ask Questions about this Shipment</h4>
                <p className="text-slate-400 text-xs mt-0.5">
                  Inquire about carton weights, fragile items, container stowage, or customs compliance
                </p>
              </div>

              <form onSubmit={handleAskQuery} className="flex gap-2">
                <input
                  type="text"
                  value={chatQuery}
                  onChange={(e) => setChatQuery(e.target.value)}
                  placeholder="e.g. Which cartons have the heaviest items? What is the total volume in CFT?"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  disabled={loading || !chatQuery.trim()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 text-white font-bold rounded-lg flex items-center gap-1.5 transition"
                >
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <span>Ask</span>}
                </button>
              </form>

              {chatAnswer && (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                  <p className="text-slate-200 leading-relaxed">{chatAnswer.answer}</p>
                  {chatAnswer.actionableTips && chatAnswer.actionableTips.length > 0 && (
                    <div className="pt-2 border-t border-slate-800 space-y-1">
                      <span className="font-bold text-purple-400 block text-[11px]">Logistics Tips:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-400 text-[11px]">
                        {chatAnswer.actionableTips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
