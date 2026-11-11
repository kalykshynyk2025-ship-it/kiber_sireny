import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Square, 
  Volume2, 
  VolumeX, 
  Image as ImageIcon,
  X
} from 'lucide-react';
import { SIREN_LIST, soundEngine, SirenDefinition } from './audio/soundEngine';
import { SirenButton } from './components/SirenButton';
import { AudioVisualizer } from './components/AudioVisualizer';

export default function App() {
  const [playingIds, setPlayingIds] = useState<string[]>([]);
  const [loopStates, setLoopStates] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    SIREN_LIST.forEach((s) => {
      init[s.id] = true;
    });
    return init;
  });
  const [masterVolume, setMasterVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showPosterModal, setShowPosterModal] = useState<boolean>(false);

  // Sync state helper
  const updatePlayingList = useCallback(() => {
    setPlayingIds(soundEngine.getPlayingIds());
  }, []);

  // Primary toggle play
  const handleTogglePlay = useCallback((id: string) => {
    const isLooping = loopStates[id] ?? true;
    soundEngine.playSound(id, isLooping);
    updatePlayingList();
  }, [loopStates, updatePlayingList]);

  // Toggle loop mode for a siren
  const handleToggleLoop = useCallback((id: string) => {
    setLoopStates((prev) => {
      const next = !prev[id];
      return { ...prev, [id]: next };
    });
  }, []);

  // CRITICAL THEATER FEATURE: Stop All Sounds immediately
  const handleStopAll = useCallback(() => {
    soundEngine.stopAll();
    updatePlayingList();
  }, [updatePlayingList]);

  // Volume slider
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setMasterVolume(val);
    soundEngine.setVolume(val);
    if (isMuted && val > 0) {
      setIsMuted(false);
    }
  };

  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  // Keyboard hotkeys for theater operator
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Space or Escape = STOP ALL SOUNDS
      if (e.code === 'Space' || e.key === 'Escape') {
        e.preventDefault();
        handleStopAll();
        return;
      }

      // Hotkey numbers
      const matched = SIREN_LIST.find((s) => s.hotkey.toLowerCase() === e.key.toLowerCase());
      if (matched) {
        e.preventDefault();
        handleTogglePlay(matched.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleStopAll, handleTogglePlay]);

  // Filtered sirens
  const filteredSirens = useMemo(() => {
    if (activeCategory === 'all') return SIREN_LIST;
    return SIREN_LIST.filter((s) => s.category === activeCategory);
  }, [activeCategory]);

  const activeCount = playingIds.length;
  const playingSiren = useMemo(() => {
    if (playingIds.length === 0) return null;
    return SIREN_LIST.find((s) => s.id === playingIds[0]);
  }, [playingIds]);

  return (
    <div className="min-h-screen bg-[#0b0516] bg-cyber-grid text-slate-100 flex flex-col font-body relative pb-32">
      {/* Top Bar */}
      <header className="border-b border-purple-900/60 bg-[#120726]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lime-400/15 border border-[#ccff00]/60 flex items-center justify-center text-[#ccff00] font-russo text-lg shadow-[0_0_15px_rgba(204,255,0,0.3)]">
              BR
            </div>
            <div>
              <h1 className="font-russo text-base sm:text-lg text-white tracking-wider uppercase">
                ЗВУКОВОЙ ПУЛЬТ СИРЕН
              </h1>
              <p className="text-[11px] text-purple-300 font-cyber">
                РЕЖИМ: ОДНА СИРЕНА В ЭФИРЕ
              </p>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowPosterModal(true)}
              className="px-3 py-2 rounded-xl bg-purple-950/70 border border-purple-700/60 hover:border-purple-400 text-xs font-cyber text-purple-200 flex items-center gap-2 transition-colors cursor-pointer"
              title="Посмотреть афишу"
            >
              <ImageIcon className="w-4 h-4 text-lime-400" />
              <span className="hidden sm:inline">Афиша</span>
            </button>

            {/* Top Emergency Stop Button */}
            <button
              type="button"
              onClick={handleStopAll}
              className={`px-4 sm:px-6 py-2 rounded-xl font-russo text-xs sm:text-sm tracking-wider uppercase flex items-center gap-2 transition-all cursor-pointer ${
                activeCount > 0
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_25px_rgba(244,63,94,0.75)] animate-pulse'
                  : 'bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-rose-300'
              }`}
            >
              <Square className="w-4 h-4 fill-current" />
              <span>СТОП ВСЁ</span>
              <kbd className="hidden md:inline text-[10px] bg-rose-900/90 text-rose-200 px-1.5 py-0.5 rounded border border-rose-500/40 font-mono">
                Space
              </kbd>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6 w-full flex-1 flex flex-col gap-6">
        {/* Real-time Spectrum Visualizer */}
        <AudioVisualizer 
          isPlaying={activeCount > 0} 
          activeCount={activeCount} 
          playingTitle={playingSiren?.name}
        />

        {/* Filter Categories */}
        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-2">
            {[
              { id: 'all', label: 'Все кнопки (12)' },
              { id: 'cinematic', label: 'Кинематографичные' },
              { id: 'siren', label: 'Сирены ГО и полиции' },
              { id: 'cyber', label: 'Кибер-сигналы' },
              { id: 'alarm', label: 'Тревоги' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-cyber font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === tab.id
                    ? 'bg-[#ccff00] text-black shadow-[0_0_15px_rgba(204,255,0,0.35)]'
                    : 'bg-[#150a2c] text-slate-300 hover:text-white hover:bg-purple-900/60 border border-purple-800/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs font-mono text-slate-400 shrink-0 hidden sm:block">
            {playingSiren ? (
              <span className="text-lime-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping" />
                В ЭФИРЕ: {playingSiren.name.toUpperCase()}
              </span>
            ) : (
              <span className="text-slate-500">ТИШИНА · ГОТОВ К ПУСКУ</span>
            )}
          </div>
        </div>

        {/* Big Buttons Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredSirens.map((siren: SirenDefinition) => {
            const isPlaying = playingIds.includes(siren.id);
            const isLooping = loopStates[siren.id] ?? true;

            return (
              <SirenButton
                key={siren.id}
                siren={siren}
                isPlaying={isPlaying}
                isLooping={isLooping}
                onTogglePlay={handleTogglePlay}
                onToggleLoop={handleToggleLoop}
              />
            );
          })}
        </section>
      </main>

      {/* Floating Bottom Emergency Stop Bar */}
      <aside aria-label="Панель экстренной остановки" className="fixed bottom-0 left-0 right-0 z-50 bg-[#0d051c]/95 border-t-2 border-purple-800/80 backdrop-blur-xl px-4 py-3 shadow-[0_-5px_30px_rgba(0,0,0,0.8)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Master Volume */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleMute}
              className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-200 hover:text-white transition-colors cursor-pointer"
              title={isMuted ? 'Включить звук' : 'Заглушить звук'}
            >
              {isMuted || masterVolume === 0 ? (
                <VolumeX className="w-5 h-5 text-rose-400" />
              ) : (
                <Volume2 className="w-5 h-5 text-lime-400" />
              )}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-cyber text-slate-400 hidden sm:inline">Громкость:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : masterVolume}
                onChange={handleVolumeChange}
                aria-label="Общая громкость"
                className="w-24 sm:w-36 accent-[#ccff00] cursor-pointer"
              />
              <span className="text-xs font-mono text-lime-400 w-9">
                {isMuted ? '0%' : `${Math.round(masterVolume * 100)}%`}
              </span>
            </div>
          </div>

          {/* Active sound name indicator */}
          {playingSiren && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-700/60 text-xs font-cyber">
              <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping" />
              <span className="text-slate-300">В ЭФИРЕ:</span>
              <span className="text-[#ccff00] font-bold font-russo uppercase">{playingSiren.name}</span>
            </div>
          )}

          {/* BIG ALL-STOP PANIC BUTTON */}
          <button
            type="button"
            onClick={handleStopAll}
            className={`px-6 sm:px-10 py-3 sm:py-3.5 rounded-2xl font-russo text-sm sm:text-base tracking-wider uppercase flex items-center gap-3 transition-all cursor-pointer ${
              activeCount > 0
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_30px_rgba(244,63,94,0.9)] animate-pulse scale-105'
                : 'bg-rose-950/90 hover:bg-rose-900 border border-rose-600/70 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
            }`}
          >
            <Square className="w-5 h-5 fill-current" />
            <span>БЫСТРАЯ ОСТАНОВКА ВСЕХ ЗВУКОВ</span>
            <kbd className="hidden md:inline text-xs bg-black/40 text-rose-200 px-2 py-0.5 rounded border border-rose-500/50 font-mono">
              Space / Esc
            </kbd>
          </button>
        </div>
      </aside>

      {/* Poster Modal */}
      {showPosterModal && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="poster-dialog-title"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowPosterModal(false)}
        >
          <div 
            className="relative max-w-lg w-full bg-[#130728] border-2 border-[#ccff00] rounded-2xl overflow-hidden p-4 shadow-[0_0_50px_rgba(204,255,0,0.3)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-purple-900 mb-3">
              <h3 id="poster-dialog-title" className="font-russo text-lg text-white">Афиша спектакля</h3>
              <button
                type="button"
                onClick={() => setShowPosterModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden max-h-[75vh] flex items-center justify-center bg-black">
              <img
                src="/assets/poster.png"
                alt="Афиша спектакля"
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
