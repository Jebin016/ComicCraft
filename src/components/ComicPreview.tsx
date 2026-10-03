import React, { useState } from 'react';
import { Download, Sparkles, Eye, ArrowLeft, RefreshCw, MessageSquare, Image as ImageIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { ComicData } from '../types';

interface ComicPreviewProps {
  comic: ComicData;
  onDownloadPdf: () => void;
  onNewComic: () => void;
  onRegenerate: () => void;
}

export const ComicPreview: React.FC<ComicPreviewProps> = ({ comic, onDownloadPdf, onNewComic, onRegenerate }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showPrompts, setShowPrompts] = useState<Record<number, boolean>>({});
  const [imgFailed, setImgFailed] = useState<Record<number, boolean>>({});

  const togglePrompt = (panelNum: number) => {
    setShowPrompts((prev) => ({ ...prev, [panelNum]: !prev[panelNum] }));
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <button
            onClick={onNewComic}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Create Another Comic</span>
          </button>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-['Bangers'] tracking-wide">
            Your 2-Panel Comic <span className="text-amber-400">Preview</span>
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-400">
            <span className="font-semibold text-amber-400">{comic.character_name}</span>
            <span>·</span>
            <span>{comic.setting}</span>
            <span>·</span>
            <span>{comic.tone} tone</span>
            <span>·</span>
            <span>{comic.art_style} style</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onRegenerate}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span>Regenerate</span>
          </button>

          <button
            onClick={onDownloadPdf}
            className="px-6 py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 rounded-xl text-xs sm:text-sm font-extrabold text-slate-950 flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all uppercase tracking-wider cursor-pointer"
          >
            <Download className="w-4 h-4 fill-slate-950" />
            <span>Download Your Comic as PDF</span>
          </button>
        </div>
      </div>

      {/* 2-Panel Sequential Layout */}
      <div className="space-y-8 mb-12">
        {comic.layout.slice(0, 2).map((panel) => (
          <div
            key={panel.panel}
            className="bg-slate-900 border-2 border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-2xl transition-all"
          >
            {/* Panel Title Bar */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-amber-400 font-['Bangers'] tracking-wider flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>{panel.title}</span>
              </h2>
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                Panel {panel.panel} of 2
              </span>
            </div>

            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Image Column */}
              <div className="md:col-span-6 relative group">
                <div className="aspect-[4/3] rounded-xl overflow-hidden border-2 border-slate-800 bg-slate-950 relative shadow-inner flex items-center justify-center">
                  {!imgFailed[panel.panel] ? (
                    <img
                      src={panel.image_path}
                      alt={panel.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={() => {
                        setImgFailed((prev) => ({ ...prev, [panel.panel]: true }));
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <h4 className="text-amber-400 font-bold font-['Bangers'] text-lg tracking-wider mb-1">
                        {panel.title}
                      </h4>
                      <p className="text-xs text-slate-400 max-w-xs line-clamp-2 italic">
                        "{panel.scene_description}"
                      </p>
                      <button
                        onClick={() => {
                          setImgFailed((prev) => ({ ...prev, [panel.panel]: false }));
                        }}
                        className="mt-3 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3 text-amber-400" />
                        <span>Reload Artwork</span>
                      </button>
                    </div>
                  )}

                  {!imgFailed[panel.panel] && (
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <button
                        onClick={() => setSelectedImage(panel.image_path)}
                        className="px-3 py-1.5 bg-slate-900/90 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>Expand Image</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Text & Dialogue Column */}
              <div className="md:col-span-6 space-y-4">
                {/* Scene Setting */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1">
                    Scene Setting
                  </div>
                  <p className="text-sm italic text-slate-300 font-['Comic_Neue'] leading-relaxed">
                    "{panel.scene_description}"
                  </p>
                </div>

                {/* Caption & Narration Box */}
                {(panel.caption || panel.narration) && (
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                    {panel.caption && (
                      <p className="text-xs text-amber-300/90 font-semibold font-['Comic_Neue']">
                        <span className="text-amber-400 font-bold uppercase tracking-wider mr-1.5">[CAPTION]:</span>
                        {panel.caption}
                      </p>
                    )}
                    {panel.narration && (
                      <p className="text-xs text-slate-300 font-['Comic_Neue'] leading-relaxed">
                        <span className="text-amber-400 font-bold uppercase tracking-wider mr-1.5">[NARRATION]:</span>
                        {panel.narration}
                      </p>
                    )}
                  </div>
                )}

                {/* Character Dialogue Speech Bubbles */}
                {panel.dialogue && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                      <span>Dialogue</span>
                    </div>
                    <div className="p-3 bg-amber-400 text-slate-950 rounded-2xl rounded-tl-none font-bold text-sm font-['Comic_Neue'] shadow-md border-2 border-slate-900">
                      {panel.dialogue}
                    </div>
                  </div>
                )}

                {/* Image Prompt Reference */}
                <div className="pt-2">
                  <button
                    onClick={() => togglePrompt(panel.panel)}
                    className="flex items-center justify-between w-full text-left text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors py-1 cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                      <span>Comic Image Prompt Reference</span>
                    </span>
                    {showPrompts[panel.panel] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  {showPrompts[panel.panel] && (
                    <div className="mt-2 p-3 bg-slate-950/80 border border-slate-800/80 rounded-lg text-xs font-mono text-slate-400 leading-relaxed">
                      {panel.image_prompt}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Download CTA Bar */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-500/30 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
        <h3 className="text-2xl font-extrabold text-white font-['Bangers'] tracking-wider">
          Save Your 2-Panel <span className="text-amber-400">Comic Book PDF</span>
        </h3>
        <p className="text-slate-300 text-sm max-w-xl mx-auto">
          Compile both panels, artwork, scene descriptions, captions, and dialogues into an official PDF document ready for offline reading and printing.
        </p>
        <button
          onClick={onDownloadPdf}
          className="px-8 py-4 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 rounded-xl text-base font-extrabold text-slate-950 inline-flex items-center gap-3 shadow-xl shadow-amber-500/20 transition-all uppercase tracking-wider cursor-pointer"
        >
          <Download className="w-5 h-5 fill-slate-950" />
          <span>Download Your Comic as PDF</span>
        </button>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden p-2">
            <img src={selectedImage} alt="Expanded Comic Panel" className="w-full h-full object-contain rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
};
