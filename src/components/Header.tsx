import React from 'react';
import { Sparkles, BookOpen, Library, Wand2 } from 'lucide-react';

interface HeaderProps {
  activeTab: 'create' | 'preview' | 'gallery';
  setActiveTab: (tab: 'create' | 'preview' | 'gallery') => void;
  hasComic: boolean;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, hasComic }) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('create')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400/20" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl lg:text-2xl font-extrabold tracking-tight text-white font-['Bangers'] tracking-wider drop-shadow-sm">
                Comic<span className="text-amber-400">Craft</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md">
                Gemini Models
              </span>
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'create'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span>Create Comic</span>
          </button>

          {hasComic && (
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'preview'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Comic Preview</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'gallery'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Library className="w-4 h-4" />
            <span>Gallery</span>
          </button>
        </nav>

        {/* Zone 3: Action */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={() => setActiveTab('create')}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 rounded-lg shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 uppercase tracking-wide cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Comic</span>
          </button>
        </div>
      </div>
    </header>
  );
};
