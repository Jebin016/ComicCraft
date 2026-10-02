import React, { useState } from 'react';
import { Sparkles, User, MapPin, Smile, Palette, Wand2, Lightbulb } from 'lucide-react';
import { FormInputs } from '../types';

interface ComicFormProps {
  onSubmit: (inputs: FormInputs) => void;
  isLoading: boolean;
}

export const ComicForm: React.FC<ComicFormProps> = ({ onSubmit, isLoading }) => {
  const [prompt, setPrompt] = useState('A brave fox exploring an enchanted forest.');
  const [characterName, setCharacterName] = useState('Free');
  const [setting, setSetting] = useState('Forest');
  const [tone, setTone] = useState('Dramatic');
  const [artStyle, setArtStyle] = useState('Anime');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onSubmit({
      prompt,
      character_name: characterName,
      setting,
      tone,
      art_style: artStyle,
    });
  };

  const applyPreset = (
    presetPrompt: string,
    presetChar: string,
    presetSetting: string,
    presetTone: string,
    presetStyle: string
  ) => {
    setPrompt(presetPrompt);
    setCharacterName(presetChar);
    setSetting(presetSetting);
    setTone(presetTone);
    setArtStyle(presetStyle);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Scenic Header / Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-10 mb-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(245,158,11,0.15),transparent_60%)] opacity-80 pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>2-Panel AI Comic Story Creator</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-['Bangers'] tracking-wide mb-3">
            Create Your <span className="text-amber-400">2-Panel Comic</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Enter your story prompt and preferences below. Gemini models will construct a 2-panel comic layout, write character dialogues, and generate vivid comic artwork with exportable PDF.
          </p>
        </div>
      </div>

      {/* Preset Inspirations */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span>Quick Story Presets (Click to Load)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => applyPreset('A brave fox exploring an enchanted forest.', 'Free', 'Forest', 'Dramatic', 'Anime')}
            className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 rounded-xl text-left transition-all group cursor-pointer"
          >
            <div className="text-amber-400 font-bold text-xs mb-1 group-hover:text-amber-300">Scenario 1: Enchanted Fox</div>
            <p className="text-slate-300 text-xs line-clamp-2">A brave fox named Free venturing into a glowing magical forest.</p>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('A funny cartoon about a superhero cat saving the city from a giant vacuum robot.', 'Whiskers', 'City', 'Funny', 'Comic Book')}
            className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 rounded-xl text-left transition-all group cursor-pointer"
          >
            <div className="text-amber-400 font-bold text-xs mb-1 group-hover:text-amber-300">Scenario 2: Humor Comic</div>
            <p className="text-slate-300 text-xs line-clamp-2">A funny cartoon featuring Whiskers the cat vs runaway vacuum cleaner.</p>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('A young wizard accidentally summoning a miniature dragon during potions class.', 'Arthur', 'School', 'Light-hearted', 'Watercolor')}
            className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 rounded-xl text-left transition-all group cursor-pointer"
          >
            <div className="text-amber-400 font-bold text-xs mb-1 group-hover:text-amber-300">Magic Academy</div>
            <p className="text-slate-300 text-xs line-clamp-2">Potion chaos at wizard school with mini dragon antics.</p>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('A cybernetic space detective uncovering an ancient alien relic on a distant stormy moon.', 'Astra', 'Space', 'Mysterious', 'Pixel Art')}
            className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 rounded-xl text-left transition-all group cursor-pointer"
          >
            <div className="text-amber-400 font-bold text-xs mb-1 group-hover:text-amber-300">Sci-Fi Odyssey</div>
            <p className="text-slate-300 text-xs line-clamp-2">Detective Astra solving cosmic mysteries on alien worlds.</p>
          </button>
        </div>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Story Prompt */}
        <div>
          <label htmlFor="prompt" className="flex items-center gap-2 text-sm font-bold text-slate-200 mb-2">
            <Wand2 className="w-4 h-4 text-amber-400" />
            <span>Story Prompt *</span>
          </label>
          <textarea
            id="prompt"
            rows={3}
            required
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your comic story idea in detail..."
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-slate-100 placeholder-slate-500 text-sm transition-all resize-none"
          />
        </div>

        {/* Character Name & Setting Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Character Name */}
          <div>
            <label htmlFor="characterName" className="flex items-center gap-2 text-sm font-bold text-slate-200 mb-2">
              <User className="w-4 h-4 text-amber-400" />
              <span>Main Character Name</span>
            </label>
            <input
              id="characterName"
              type="text"
              required
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              placeholder="e.g., Free, Whiskers, Captain Nova"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-slate-100 placeholder-slate-500 text-sm transition-all"
            />
          </div>

          {/* Setting */}
          <div>
            <label htmlFor="setting" className="flex items-center gap-2 text-sm font-bold text-slate-200 mb-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Setting / Location</span>
            </label>
            <select
              id="setting"
              value={setting}
              onChange={(e) => setSetting(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-slate-100 text-sm transition-all cursor-pointer"
            >
              <option value="Forest">Enchanted Forest</option>
              <option value="School">Magic School / Academy</option>
              <option value="Space">Deep Space / Alien Moon</option>
              <option value="City">Metropolis City</option>
              <option value="Haunted Mansion">Haunted Mansion</option>
              <option value="Underwater Realm">Underwater Kingdom</option>
              <option value="Cyberpunk City">Cyberpunk Neon Alley</option>
              <option value="Ancient Castle">Ancient Medieval Castle</option>
            </select>
          </div>
        </div>

        {/* Story Tone & Art Style Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Story Tone */}
          <div>
            <label htmlFor="tone" className="flex items-center gap-2 text-sm font-bold text-slate-200 mb-2">
              <Smile className="w-4 h-4 text-amber-400" />
              <span>Story Tone</span>
            </label>
            <select
              id="tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-slate-100 text-sm transition-all cursor-pointer"
            >
              <option value="Dramatic">Dramatic & Heroic</option>
              <option value="Funny">Funny & Light-hearted</option>
              <option value="Poetic">Poetic & Mystical</option>
              <option value="Action-packed">Action-packed & High Octane</option>
              <option value="Mysterious">Mysterious & Suspenseful</option>
              <option value="Dark Fantasy">Dark Fantasy</option>
            </select>
          </div>

          {/* Art Style */}
          <div>
            <label htmlFor="artStyle" className="flex items-center gap-2 text-sm font-bold text-slate-200 mb-2">
              <Palette className="w-4 h-4 text-amber-400" />
              <span>Art Style</span>
            </label>
            <select
              id="artStyle"
              value={artStyle}
              onChange={(e) => setArtStyle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-slate-100 text-sm transition-all cursor-pointer"
            >
              <option value="Anime">Anime / Manga Style</option>
              <option value="Comic Book">Classic Comic Book</option>
              <option value="Pixel Art">Retro Pixel Art</option>
              <option value="Realistic">Realistic Graphic Novel</option>
              <option value="Watercolor">Soft Watercolor</option>
              <option value="Cyberpunk">Cyberpunk Neon</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 rounded-xl font-extrabold text-slate-950 text-base bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 active:scale-[0.99] transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-3 uppercase tracking-wider cursor-pointer disabled:opacity-60"
          >
            <Sparkles className="w-5 h-5 fill-slate-950" />
            <span>{isLoading ? 'Generating 2-Panel Comic...' : 'Generate 2-Panel Comic'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
