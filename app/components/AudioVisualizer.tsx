"use client"

import { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  audioData: number[]
}

const BAR_COUNT = 7;
const VERTICAL_OFFSET = 8; // px from the bottom

export function AudioVisualizer({ audioData }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size for minimal waveform
    canvas.width = 100
    canvas.height = 32

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Centered sampling: sample from the center outwards
    const barCount = BAR_COUNT
    const barWidth = 10
    const gap = 6
    const center = Math.floor(audioData.length / 2)
    const half = Math.floor(barCount / 2)
    const maxBarHeight = 18; // max bar height for visual balance
    const minBarHeight = 6;
    for (let i = 0; i < barCount; i++) {
      // Symmetric sampling: center bar is center, then outwards
      let dataIdx
      if (barCount % 2 === 1) {
        dataIdx = center + (i - half) * 2 // spread out for more even sampling
      } else {
        dataIdx = center + (i - half + 0.5) * 2
      }
      dataIdx = Math.max(0, Math.min(audioData.length - 1, dataIdx))
      const amplitude = audioData[dataIdx]
      const barHeight = amplitude * (maxBarHeight - minBarHeight) + minBarHeight
      const x = i * (barWidth + gap)
      const y = canvas.height - barHeight - VERTICAL_OFFSET;
      // Light green gradient
      const grad = ctx.createLinearGradient(x, y, x, y + barHeight)
      grad.addColorStop(0, '#4ade80')
      grad.addColorStop(1, '#bbf7d0')
      ctx.fillStyle = grad
      // Draw bar with rounded top, anchored to bottom with offset
      ctx.beginPath()
      ctx.moveTo(x, y + barHeight)
      ctx.lineTo(x, y + barWidth / 2)
      ctx.arc(x + barWidth / 2, y + barWidth / 2, barWidth / 2, Math.PI, 0, false)
      ctx.lineTo(x + barWidth, y + barHeight)
      ctx.closePath()
      ctx.fill()
    }
  }, [audioData])

  return <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} aria-hidden="true" />
} 