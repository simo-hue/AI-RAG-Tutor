'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/utils/cn';

interface AudioWaveformProps {
  isRecording: boolean;
  volume?: number;
  frequencies?: number[];
  className?: string;
  barCount?: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
}

export const AudioWaveform = ({
  isRecording,
  volume = 0,
  frequencies = [],
  className,
  barCount = 32,
  height = 80,
  color = '#3b82f6',
  backgroundColor = '#e2e8f0',
}: AudioWaveformProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const { width, height: canvasHeight } = canvas;

      // Clear canvas
      ctx.clearRect(0, 0, width, canvasHeight);

      // Calculate bar dimensions
      const barWidth = width / barCount;
      const maxBarHeight = canvasHeight - 4;

      for (let i = 0; i < barCount; i++) {
        let barHeight: number;

        if (isRecording && frequencies.length > 0) {
          // Use actual frequency data
          const frequencyIndex = Math.floor((i / barCount) * frequencies.length);
          const frequency = frequencies[frequencyIndex] || 0;
          barHeight = (frequency / 255) * maxBarHeight;
        } else if (isRecording) {
          // Use volume-based simulation
          const randomFactor = 0.3 + Math.random() * 0.7;
          barHeight = volume * maxBarHeight * randomFactor;
        } else {
          // Static low bars when not recording
          barHeight = 2 + Math.random() * 4;
        }

        // Minimum height
        barHeight = Math.max(barHeight, 2);

        const x = i * barWidth + barWidth * 0.1;
        const y = (canvasHeight - barHeight) / 2;
        const width = barWidth * 0.8;

        // Draw background bar
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(x, 2, width, maxBarHeight);

        // Draw active bar
        ctx.fillStyle = isRecording ? color : '#94a3b8';
        ctx.fillRect(x, y, width, barHeight);
      }

      if (isRecording) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording, volume, frequencies, barCount, height, color, backgroundColor]);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={height}
      className={cn(
        'w-full rounded-lg transition-all duration-300',
        isRecording && 'shadow-lg',
        className
      )}
    />
  );
};