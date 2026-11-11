import { useEffect, useRef } from 'react';
import { soundEngine } from '../audio/soundEngine';

interface AudioVisualizerProps {
  isPlaying: boolean;
  activeCount: number;
  playingTitle?: string;
}

export function AudioVisualizer({ isPlaying, activeCount, playingTitle }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      animId = requestAnimationFrame(render);
      const width = canvas.width;
      const height = canvas.height;

      // Dark fade trail
      ctx.fillStyle = 'rgba(11, 5, 22, 0.35)';
      ctx.fillRect(0, 0, width, height);

      const analyser = soundEngine.analyser;
      if (!analyser || !isPlaying) {
        // Idle gentle scanning grid line
        const time = Date.now() * 0.002;
        const midY = height / 2;
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.25)';
        ctx.lineWidth = 1;
        ctx.moveTo(0, midY);
        for (let x = 0; x < width; x += 8) {
          const y = midY + Math.sin(x * 0.03 + time) * 3;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      // Draw cyber spectrum bars
      const barCount = 48;
      const step = Math.floor(bufferLength / barCount);
      const barWidth = width / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        const val = dataArray[i * step] || 0;
        const percent = val / 255;
        const barHeight = Math.max(2, percent * (height - 12));
        const x = i * (barWidth + 2);
        const y = height - barHeight;

        // Gradient from lime to violet
        const grad = ctx.createLinearGradient(0, height, 0, y);
        grad.addColorStop(0, '#a855f7');
        grad.addColorStop(0.65, '#ccff00');
        grad.addColorStop(1, '#ffffff');

        ctx.fillStyle = grad;
        ctx.fillRect(x, y, barWidth, barHeight);

        // Peak cap
        if (percent > 0.4) {
          ctx.fillStyle = '#ccff00';
          ctx.fillRect(x, y - 2, barWidth, 1.5);
        }
      }

      // Draw active oscilloscope waveform over spectrum
      const timeData = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(timeData);

      ctx.beginPath();
      ctx.strokeStyle = '#ccff00';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(204, 255, 0, 0.8)';
      ctx.shadowBlur = 8;

      const sliceWidth = width / bufferLength;
      let waveX = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = timeData[i] / 128.0;
        const waveY = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(waveX, waveY);
        } else {
          ctx.lineTo(waveX, waveY);
        }
        waveX += sliceWidth;
      }

      ctx.stroke();
      ctx.shadowBlur = 0; // reset
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying]);

  return (
    <div className="relative w-full h-16 md:h-20 bg-[#120824]/90 rounded-xl overflow-hidden border border-purple-900/60 shadow-[0_0_20px_rgba(147,51,234,0.15)] flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={800}
        height={80}
        className="w-full h-full object-cover block"
      />
      {/* HUD overlay badges */}
      <div className="absolute top-2 left-3 flex items-center gap-2 pointer-events-none text-[10px] font-cyber tracking-wider">
        <span className="text-lime-400 font-semibold flex items-center gap-1.5">
          <span className={`inline-block w-2 h-2 rounded-full ${isPlaying ? 'bg-lime-400 animate-ping' : 'bg-slate-600'}`} />
          {isPlaying ? 'АКТИВНЫЙ СИГНАЛ' : 'МОНИТОРИНГ ЧАСТОТ'}
        </span>
        <span className="text-purple-300 font-mono font-bold">
          {playingTitle ? `[${playingTitle.toUpperCase()}]` : '[ГОТОВ К ПУСКУ]'}
        </span>
      </div>

      <div className="absolute top-2 right-3 pointer-events-none text-[10px] font-mono text-purple-300/70">
        WEB-AUDIO 24-BIT // REALTIME
      </div>
    </div>
  );
}
