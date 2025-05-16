"use client"

import { useEffect, useRef } from "react"

export function IdentityShapes() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Create shapes
    const shapes: Shape[] = []
    for (let i = 0; i < 15; i++) {
      shapes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 60 + 20,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.3 + 0.1,
        type: Math.floor(Math.random() * 3),
      })
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      shapes.forEach((shape) => {
        // Update position
        shape.x += shape.speedX
        shape.y += shape.speedY

        // Bounce off edges
        if (shape.x < 0 || shape.x > canvas.width) shape.speedX *= -1
        if (shape.y < 0 || shape.y > canvas.height) shape.speedY *= -1

        // Draw shape
        ctx.save()
        ctx.translate(shape.x, shape.y)

        // Create gradient
        const gradient = ctx.createLinearGradient(-shape.size / 2, -shape.size / 2, shape.size / 2, shape.size / 2)
        gradient.addColorStop(0, `rgba(79, 70, 229, ${shape.opacity})`) // Indigo
        gradient.addColorStop(1, `rgba(147, 51, 234, ${shape.opacity})`) // Purple

        ctx.fillStyle = gradient
        ctx.strokeStyle = `rgba(255, 255, 255, ${shape.opacity * 2})`
        ctx.lineWidth = 1

        // Draw different shapes
        if (shape.type === 0) {
          // Circle (identity)
          ctx.beginPath()
          ctx.arc(0, 0, shape.size / 2, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
        } else if (shape.type === 1) {
          // Hexagon (blockchain)
          ctx.beginPath()
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 * i) / 6
            const x = (shape.size / 2) * Math.cos(angle)
            const y = (shape.size / 2) * Math.sin(angle)
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
          ctx.closePath()
          ctx.fill()
          ctx.stroke()
        } else {
          // Rounded square (document)
          const radius = shape.size / 8
          const size = shape.size / 2
          ctx.beginPath()
          ctx.moveTo(-size + radius, -size)
          ctx.lineTo(size - radius, -size)
          ctx.arcTo(size, -size, size, -size + radius, radius)
          ctx.lineTo(size, size - radius)
          ctx.arcTo(size, size, size - radius, size, radius)
          ctx.lineTo(-size + radius, size)
          ctx.arcTo(-size, size, -size, size - radius, radius)
          ctx.lineTo(-size, -size + radius)
          ctx.arcTo(-size, -size, -size + radius, -size, radius)
          ctx.closePath()
          ctx.fill()
          ctx.stroke()
        }

        ctx.restore()
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ opacity: 0.7 }} />
}

interface Shape {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  type: number
}
