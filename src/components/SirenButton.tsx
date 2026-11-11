import { 
  Volume2, 
  Square, 
  Radio, 
  ShieldAlert, 
  Flame, 
  Zap, 
  Activity, 
  Repeat, 
  Play,
  Crosshair,
  OctagonAlert,
  Radar
} from 'lucide-react';
import { SirenDefinition } from '../audio/soundEngine';

interface SirenButtonProps {
  siren: SirenDefinition;
  isPlaying: boolean;
  isLooping: boolean;
  onTogglePlay: (id: string) => void;
  onToggleLoop: (id: string) => void;
}

export function SirenButton({
  siren,
  isPlaying,
  isLooping,
  onTogglePlay,
  onToggleLoop,
}: SirenButtonProps) {
  const getIcon = () => {
    switch (siren.id) {
      case 'blade_runner_drone':
        return <Activity className="w-8 h-8 md:w-10 md:h-10" />;
      case 'air_raid':
        return <OctagonAlert className="w-8 h-8 md:w-10 md:h-10" />;
      case 'red_alert':
        return <ShieldAlert className="w-8 h-8 md:w-10 md:h-10" />;
      case 'cyber_police':
        return <Radio className="w-8 h-8 md:w-10 md:h-10" />;
      case 'replicant_glitch':
        return <Zap className="w-8 h-8 md:w-10 md:h-10" />;
      case 'deep_foghorn':
        return <Volume2 className="w-8 h-8 md:w-10 md:h-10" />;
      case 'quarantine_hilo':
        return <ShieldAlert className="w-8 h-8 md:w-10 md:h-10" />;
      case 'fire_alarm':
        return <Flame className="w-8 h-8 md:w-10 md:h-10" />;
      case 'phaser_sweep':
        return <Crosshair className="w-8 h-8 md:w-10 md:h-10" />;
      case 'sonar_ping':
        return <Radar className="w-8 h-8 md:w-10 md:h-10" />;
      default:
        return <Activity className="w-8 h-8 md:w-10 md:h-10" />;
    }
  };

  const colorMap = {
    lime: {
      border: isPlaying ? 'border-[#ccff00] shadow-[0_0_30px_rgba(204,255,0,0.55)]' : 'border-lime-500/40 hover:border-[#ccff00]',
      text: 'text-[#ccff00]',
      badge: 'bg-[#ccff00]/20 text-[#ccff00] border-[#ccff00]/60',
      activeBg: 'bg-[#ccff00]/15',
      accentBar: 'bg-[#ccff00]',
      hoverGlow: 'hover:shadow-[0_0_25px_rgba(204,255,0,0.25)]',
    },
    violet: {
      border: isPlaying ? 'border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.6)]' : 'border-purple-500/40 hover:border-purple-400',
      text: 'text-purple-400',
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/60',
      activeBg: 'bg-purple-900/35',
      accentBar: 'bg-purple-500',
      hoverGlow: 'hover:shadow-[0_0_25px_rgba(168,85,247,0.3)]',
    },
    cyan: {
      border: isPlaying ? 'border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.55)]' : 'border-cyan-500/40 hover:border-cyan-400',
      text: 'text-cyan-400',
      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60',
      activeBg: 'bg-cyan-950/40',
      accentBar: 'bg-cyan-400',
      hoverGlow: 'hover:shadow-[0_0_25px_rgba(34,211,238,0.25)]',
    },
    amber: {
      border: isPlaying ? 'border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.55)]' : 'border-amber-500/40 hover:border-amber-400',
      text: 'text-amber-400',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/60',
      activeBg: 'bg-amber-950/40',
      accentBar: 'bg-amber-400',
      hoverGlow: 'hover:shadow-[0_0_25px_rgba(251,191,36,0.25)]',
    },
    red: {
      border: isPlaying ? 'border-rose-500 shadow-[0_0_35px_rgba(244,63,94,0.65)]' : 'border-rose-500/40 hover:border-rose-400',
      text: 'text-rose-400',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/60',
      activeBg: 'bg-rose-950/40',
      accentBar: 'bg-rose-500',
      hoverGlow: 'hover:shadow-[0_0_25px_rgba(244,63,94,0.3)]',
    },
  };

  const scheme = colorMap[siren.accentColor] || colorMap.lime;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onTogglePlay(siren.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (e.target === e.currentTarget) {
            e.preventDefault();
            onTogglePlay(siren.id);
          }
        }
      }}
      className={`group relative text-left w-full min-h-[160px] sm:min-h-[190px] md:min-h-[210px] rounded-2xl border-2 bg-[#140a28]/90 backdrop-blur-md p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer select-none active:scale-[0.98] ${
        scheme.border
      } ${isPlaying ? scheme.activeBg : 'hover:bg-[#1b0e36] ' + scheme.hoverGlow}`}
    >
      {/* Top neon edge indicator */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 transition-all ${
          isPlaying ? `${scheme.accentBar} animate-pulse` : 'bg-transparent group-hover:bg-slate-700/60'
        }`}
      />

      {/* Cyber Corner Marks */}
      <div className="absolute top-2 right-2 flex items-center gap-2 pointer-events-none">
        <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-md bg-black/60 border border-slate-700/80 text-slate-300 group-hover:border-slate-500">
          [{siren.hotkey}]
        </span>
      </div>

      {/* Top Section: Large Icon & Play State */}
      <div className="flex items-center justify-between w-full">
        <div className={`p-3 rounded-xl border ${scheme.badge} transition-transform group-hover:scale-105`}>
          {getIcon()}
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-2">
          {isPlaying && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/60 text-rose-400 text-xs font-cyber font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              ЭФИР
            </span>
          )}
        </div>
      </div>

      {/* Center / Bottom Section: Big Punchy Title */}
      <div className="my-2">
        <h3 className="font-russo text-xl sm:text-2xl lg:text-3xl text-white tracking-wide uppercase leading-tight group-hover:text-slate-100">
          {siren.name}
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 font-cyber mt-1 truncate">
          {siren.subtitle}
        </p>
      </div>

      {/* Footer Controls: Big Action Trigger & Loop toggle */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-purple-950/70 w-full mt-auto">
        <span
          className={`font-russo text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 ${
            isPlaying ? 'text-rose-400 font-bold' : scheme.text
          }`}
        >
          {isPlaying ? (
            <>
              <Square className="w-4 h-4 fill-current" />
              <span>Остановить</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Нажать для пуска</span>
            </>
          )}
        </span>

        {/* Loop toggle button */}
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onToggleLoop(siren.id);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation();
              onToggleLoop(siren.id);
            }
          }}
          title={isLooping ? 'Повтор: ВКЛ' : 'Повтор: ВЫКЛ'}
          className={`px-2.5 py-1 rounded-lg text-xs font-cyber flex items-center gap-1.5 transition-colors border cursor-pointer ${
            isLooping
              ? 'bg-purple-900/60 border-purple-400 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
              : 'bg-black/40 border-slate-800 text-slate-500 hover:text-slate-300'
          }`}
        >
          <Repeat className="w-3.5 h-3.5" />
          <span className="text-[11px] font-mono">{isLooping ? 'LOOP' : '1x'}</span>
        </div>
      </div>
    </div>
  );
}
