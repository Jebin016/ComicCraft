import React from 'react';
import { CheckCircle2, Download, Wand2, FileText, ExternalLink } from 'lucide-react';
import { ComicData } from '../types';

interface ExportSuccessProps {
  comic: ComicData;
  onNewComic: () => void;
}

export const ExportSuccess: React.FC<ExportSuccessProps> = ({ comic, onNewComic }) => {
  const filename = comic.pdf_path?.split('/').pop() || '';
  const downloadUrl = `/download-pdf/${filename}`;
  const viewUrl = `/static/exports/${filename}`;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Success Icon */}
        <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-['Bangers'] tracking-wider mb-3">
          Comic <span className="text-emerald-400">Exported Successfully!</span>
        </h1>

        {/* Message */}
        <p className="text-slate-300 text-sm sm:text-base max-w-lg mx-auto leading-relaxed mb-8">
          Your AI-powered comic has been successfully created and compiled! Dive back in and bring another story to life.
        </p>

        {/* PDF Metadata Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 mb-8 text-left flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-amber-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-white text-sm truncate max-w-xs">{comic.character_name}'s Adventure PDF</div>
              <div className="text-xs text-slate-400">5 Panel Comic · PDF Format</div>
            </div>
          </div>
          <a
            href={downloadUrl}
            download={`${comic.character_name}_comic.pdf`}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Download</span>
          </a>
        </div>

        {/* PDF Preview Frame / Direct Link */}
        {comic.pdf_path && (
          <div className="mb-8">
            <a
              href={viewUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <span>View PDF in Browser</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* CTA Button */}
        <div>
          <button
            onClick={onNewComic}
            className="px-8 py-4 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 rounded-xl font-extrabold text-slate-950 text-sm uppercase tracking-wider inline-flex items-center gap-2.5 shadow-xl shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Wand2 className="w-4 h-4 fill-slate-950" />
            <span>Go Create Another Comic</span>
          </button>
        </div>
      </div>
    </div>
  );
};
