import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ComicForm } from './components/ComicForm';
import { ComicPreview } from './components/ComicPreview';
import { ExportSuccess } from './components/ExportSuccess';
import { ComicGallery } from './components/ComicGallery';
import { GenerationModal } from './components/GenerationModal';
import { FormInputs, ComicData } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'create' | 'preview' | 'gallery' | 'export_success'>('create');
  const [currentComic, setCurrentComic] = useState<ComicData | null>(null);
  const [comicsList, setComicsList] = useState<ComicData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generationStep, setGenerationStep] = useState(1);
  const [progressText, setProgressText] = useState('');

  // Fetch session comics on load
  useEffect(() => {
    fetch('/api/comics')
      .then((res) => res.json())
      .then((data) => {
        if (data.comics && Array.isArray(data.comics)) {
          setComicsList(data.comics);
          if (data.comics.length > 0 && !currentComic) {
            setCurrentComic(data.comics[0]);
          }
        }
      })
      .catch((err) => console.log('Could not fetch initial comics list:', err));
  }, []);

  const handleGenerateComic = async (inputs: FormInputs) => {
    setIsLoading(true);
    setGenerationStep(1);
    setProgressText('Calling Gemini Flash for 2-panel storyline outline...');

    const timer1 = setTimeout(() => {
      setGenerationStep(2);
      setProgressText('Gemini Pro writing narration and character dialogues...');
    }, 2000);

    const timer2 = setTimeout(() => {
      setGenerationStep(3);
      setProgressText('Generating comic panel illustrations...');
    }, 4500);

    const timer3 = setTimeout(() => {
      setGenerationStep(4);
      setProgressText('Layout Builder structuring panel sequences...');
    }, 7000);

    const timer4 = setTimeout(() => {
      setGenerationStep(5);
      setProgressText('Exporters compiling downloadable PDF comic book...');
    }, 8500);

    try {
      const res = await fetch('/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);

      const data = await res.json();

      if (data.status === 'success' && data.comic) {
        setCurrentComic(data.comic);
        setComicsList((prev) => [data.comic, ...prev]);
        setActiveTab('preview');
      } else {
        alert(data.error || 'Comic generation failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Failed to generate comic:', err);
      alert('Error connecting to ComicCraft backend server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!currentComic?.pdf_path) return;

    const filename = currentComic.pdf_path.split('/').pop() || 'comic.pdf';
    const downloadUrl = `/download-pdf/${filename}`;

    try {
      const res = await fetch(downloadUrl);
      if (res.ok) {
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `${currentComic.character_name}_2panel_comic.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      } else {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${currentComic.character_name}_2panel_comic.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.warn('Blob PDF download fallback:', err);
      window.open(downloadUrl, '_blank');
    }

    setActiveTab('export_success');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      <Header
        activeTab={activeTab === 'export_success' ? 'preview' : activeTab}
        setActiveTab={setActiveTab}
        hasComic={!!currentComic}
      />

      <main className="flex-1 pb-16">
        {activeTab === 'create' && (
          <ComicForm onSubmit={handleGenerateComic} isLoading={isLoading} />
        )}

        {activeTab === 'preview' && currentComic && (
          <ComicPreview
            comic={currentComic}
            onDownloadPdf={handleDownloadPdf}
            onNewComic={() => setActiveTab('create')}
            onRegenerate={() => {
              handleGenerateComic({
                prompt: currentComic.prompt,
                character_name: currentComic.character_name,
                setting: currentComic.setting,
                tone: currentComic.tone,
                art_style: currentComic.art_style,
              });
            }}
          />
        )}

        {activeTab === 'export_success' && currentComic && (
          <ExportSuccess comic={currentComic} onNewComic={() => setActiveTab('create')} />
        )}

        {activeTab === 'gallery' && (
          <ComicGallery
            comics={comicsList}
            onSelectComic={(comic) => {
              setCurrentComic(comic);
              setActiveTab('preview');
            }}
            onNewComic={() => setActiveTab('create')}
          />
        )}
      </main>

      {/* Progress Loading Modal */}
      <GenerationModal isOpen={isLoading} step={generationStep} progressText={progressText} />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-['Bangers'] tracking-wide text-sm text-slate-400">
            Comic<span className="text-amber-400">Craft</span> · 2-Panel AI Comic Story Creator
          </div>
          <div className="text-slate-500">
            Powered by Google Gemini Models & Stable Diffusion
          </div>
        </div>
      </footer>
    </div>
  );
}
