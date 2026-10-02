import React from 'react';
import { Sparkles, Loader2, BookOpen, Image, FileText, CheckCircle2 } from 'lucide-react';

interface GenerationModalProps {
  isOpen: boolean;
  step: number; // 1: Outline, 2: Story, 3: Images, 4: Layout, 5: PDF
  progressText: string;
}

export const GenerationModal: React.FC<GenerationModalProps> = ({ isOpen, step, progressText }) => {
  if (!isOpen) return null;

  const stepsList = [
    { num: 1, label: 'Gemini Flash: Outlining 2-Panel Structure', icon: FileText },
    { num: 2, label: 'Gemini Pro: Crafting Narration & Dialogues', icon: BookOpen },
    { num: 3, label: 'Stable Diffusion: Painting Comic Illustrations', icon: Image },
    { num: 4, label: 'Layout Builder: Assembling Panels', icon: Sparkles },
    { num: 5, label: 'Exporters: Compiling PDF Comic Book', icon: CheckCircle2 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto mb-4 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          </div>
          <h3 className="text-2xl font-bold text-white font-['Bangers'] tracking-wide">
            Crafting Your <span className="text-amber-400">Comic Book</span>
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">{progressText || 'AI pipeline is running...'}</p>
        </div>

        {/* Step list */}
        <div className="space-y-3 mb-6">
          {stepsList.map((st) => {
            const IconComponent = st.icon;
            const isDone = step > st.num;
            const isCurrent = step === st.num;

            return (
              <div
                key={st.num}
                className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  isDone
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : isCurrent
                    ? 'bg-slate-800 border-amber-500 text-white shadow-sm'
                    : 'bg-slate-950/50 border-slate-800 text-slate-500'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                ) : (
                  <IconComponent className="w-4 h-4 text-slate-600 shrink-0" />
                )}
                <span className="truncate">{st.label}</span>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full transition-all duration-500"
            style={{ width: `${Math.min(100, (step / 5) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
