import { useRef, useEffect } from 'react'

export default function SignatureCanvas({ onSignatureChange, className = '' }) {
  const canvasRef = useRef(null)
  const isDrawingRef = useRef(false)
  const lastPosRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Initialize canvas size
    const initCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      
      // Fill with transparent background
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    // Wait for canvas to be visible and sized
    setTimeout(initCanvas, 100)

    // Re-init on window resize
    window.addEventListener('resize', initCanvas)
    
    return () => window.removeEventListener('resize', initCanvas)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')

    const getCoordinates = (e) => {
      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX || e.touches?.[0]?.clientX || 0) - rect.left
      const y = (e.clientY || e.touches?.[0]?.clientY || 0) - rect.top
      return { x, y }
    }

    const startDrawing = (e) => {
      e.preventDefault()
      isDrawingRef.current = true
      const coords = getCoordinates(e)
      lastPosRef.current = coords
    }

    const draw = (e) => {
      if (!isDrawingRef.current) return
      e.preventDefault()

      const coords = getCoordinates(e)
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      ctx.beginPath()
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y)
      ctx.lineTo(coords.x, coords.y)
      ctx.stroke()

      lastPosRef.current = coords
      
      if (onSignatureChange) {
        onSignatureChange(canvas)
      }
    }

    const stopDrawing = () => {
      isDrawingRef.current = false
    }

    // Mouse events
    canvas.addEventListener('mousedown', startDrawing)
    canvas.addEventListener('mousemove', draw)
    canvas.addEventListener('mouseup', stopDrawing)
    canvas.addEventListener('mouseout', stopDrawing)

    // Touch events
    canvas.addEventListener('touchstart', startDrawing)
    canvas.addEventListener('touchmove', draw)
    canvas.addEventListener('touchend', stopDrawing)

    return () => {
      canvas.removeEventListener('mousedown', startDrawing)
      canvas.removeEventListener('mousemove', draw)
      canvas.removeEventListener('mouseup', stopDrawing)
      canvas.removeEventListener('mouseout', stopDrawing)
      canvas.removeEventListener('touchstart', startDrawing)
      canvas.removeEventListener('touchmove', draw)
      canvas.removeEventListener('touchend', stopDrawing)
    }
  }, [onSignatureChange])

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    if (onSignatureChange) {
      onSignatureChange(canvas)
    }
  }

  return (
    <div className="signature-canvas-container">
      <canvas
        ref={canvasRef}
        className={`border-2 border-gray-600 rounded-lg bg-gray-900 cursor-crosshair touch-none ${className}`}
        style={{ width: '100%', height: '200px' }}
      />
      <button
        type="button"
        onClick={clearCanvas}
        className="mt-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
      >
        Clear Signature
      </button>
    </div>
  )
}
