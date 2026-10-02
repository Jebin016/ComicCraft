import React from 'react';
import { Download, BookOpen, Wand2, Calendar, Sparkles } from 'lucide-react';
import { ComicData } from '../types';

interface ComicGalleryProps {
  comics: ComicData[];
  onSelectComic: (comic: ComicData) => void;
  onNewComic: () => void;
}

export const ComicGallery: React.FC<ComicGalleryProps> = ({ comics, onSelectComic, onNewComic }) => {
  if (comics.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 shadow-xl">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-white font-['Bangers'] tracking-wide mb-2">No Comics Yet</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
            You haven't generated any comic books in this session yet. Create your first 5-panel AI comic strip now!
          </p>
          <button
            onClick={onNewComic}
            className="px-6 py-3 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl inline-flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Wand2 className="w-4 h-4 fill-slate-950" />
            <span>Create First Comic</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-['Bangers'] tracking-wide">
            Your Comic <span className="text-amber-400">Library</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">Browse and re-download your generated AI comic strips.</p>
        </div>
        <button
          onClick={onNewComic}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl inline-flex items-center gap-2 shadow-md shadow-amber-500/20 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
          <span>New Comic</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {comics.map((comic) => (
          <div
            key={comic.id}
            className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl overflow-hidden shadow-xl transition-all group flex flex-col"
          >
            {/* Thumbnail */}
            <div className="aspect-[4/3] bg-slate-950 relative overflow-hidden border-b border-slate-800">
              {comic.layout[0]?.image_path ? (
                <img
                  src={comic.layout[0].image_path}
                  alt={comic.character_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600">No Image</div>
              )}
              <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-amber-400 border border-slate-700">
                {comic.art_style}
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white font-['Bangers'] tracking-wide line-clamp-1">
                  {comic.layout[0]?.title || comic.character_name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">"{comic.prompt}"</p>
                <div className="flex items-center gap-2 mt-3 text-[11px] text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>{new Date(comic.createdAt).toLocaleDateString()}</span>
                  <span>·</span>
                  <span>Hero: {comic.character_name}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center gap-2 border-t border-slate-800/80">
                <button
                  onClick={() => onSelectComic(comic)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>View Panels</span>
                </button>
                <a
                  href={comic.pdf_path}
                  download
                  className="py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold rounded-lg border border-amber-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
