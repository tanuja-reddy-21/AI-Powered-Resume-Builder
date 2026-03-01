import React, { useState, useEffect, useRef } from 'react'
import { Copy, Check, RotateCcw, AlertCircle } from 'lucide-react'

const ColorWheel = ({ color, onChange }) => {
  const canvasRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [hsl, setHsl] = useState({ h: 0, s: 100, l: 50 })

  useEffect(() => {
    const { h, s, l } = hexToHSL(color)
    setHsl({ h, s, l })
  }, [color])

  useEffect(() => {
    drawColorWheel()
  }, [hsl])

  const drawColorWheel = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = canvas.width / 2 - 10

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw hue ring
    for (let angle = 0; angle < 360; angle++) {
      const startAngle = (angle - 90) * Math.PI / 180
      const endAngle = (angle - 89) * Math.PI / 180

      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.arc(centerX, centerY, radius - 30, endAngle, startAngle, true)
      ctx.closePath()
      ctx.fillStyle = `hsl(${angle}, 100%, 50%)`
      ctx.fill()
    }

    // Draw saturation/lightness square
    const squareSize = radius - 50
    const squareX = centerX - squareSize / 2
    const squareY = centerY - squareSize / 2

    for (let x = 0; x < squareSize; x++) {
      for (let y = 0; y < squareSize; y++) {
        const s = (x / squareSize) * 100
        const l = 100 - (y / squareSize) * 100
        ctx.fillStyle = `hsl(${hsl.h}, ${s}%, ${l}%)`
        ctx.fillRect(squareX + x, squareY + y, 1, 1)
      }
    }

    // Draw current selection indicator on ring
    const angle = (hsl.h - 90) * Math.PI / 180
    const indicatorRadius = radius - 15
    const indicatorX = centerX + Math.cos(angle) * indicatorRadius
    const indicatorY = centerY + Math.sin(angle) * indicatorRadius

    ctx.beginPath()
    ctx.arc(indicatorX, indicatorY, 8, 0, 2 * Math.PI)
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 3
    ctx.stroke()
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 1
    ctx.stroke()

    // Draw current selection indicator on square
    const selectorX = squareX + (hsl.s / 100) * squareSize
    const selectorY = squareY + (1 - hsl.l / 100) * squareSize

    ctx.beginPath()
    ctx.arc(selectorX, selectorY, 6, 0, 2 * Math.PI)
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 3
    ctx.stroke()
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 1
    ctx.stroke()
  }

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    const dx = x - centerX
    const dy = y - centerY
    const distance = Math.sqrt(dx * dx + dy * dy)
    const radius = canvas.width / 2 - 10

    // Check if click is on hue ring
    if (distance > radius - 30 && distance < radius) {
      let angle = Math.atan2(dy, dx) * 180 / Math.PI + 90
      if (angle < 0) angle += 360
      const newHsl = { ...hsl, h: angle }
      setHsl(newHsl)
      onChange(hslToHex(newHsl))
    }
    // Check if click is on saturation/lightness square
    else if (distance < radius - 50) {
      const squareSize = radius - 50
      const squareX = centerX - squareSize / 2
      const squareY = centerY - squareSize / 2
      
      const relX = Math.max(0, Math.min(x - squareX, squareSize))
      const relY = Math.max(0, Math.min(y - squareY, squareSize))
      
      const s = (relX / squareSize) * 100
      const l = 100 - (relY / squareSize) * 100
      
      const newHsl = { h: hsl.h, s, l }
      setHsl(newHsl)
      onChange(hslToHex(newHsl))
    }
  }

  const handleMouseDown = (e) => {
    setIsDragging(true)
    handleCanvasClick(e)
  }

  const handleMouseMove = (e) => {
    if (isDragging) {
      handleCanvasClick(e)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, hsl])

  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={280}
      onMouseDown={handleMouseDown}
      className="cursor-crosshair mx-auto"
    />
  )
}

const hexToHSL = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 }
}

const hslToHex = ({ h, s, l }) => {
  s /= 100
  l /= 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = l - c / 2

  let r, g, b
  if (h < 60) { r = c; g = x; b = 0 }
  else if (h < 120) { r = x; g = c; b = 0 }
  else if (h < 180) { r = 0; g = c; b = x }
  else if (h < 240) { r = 0; g = x; b = c }
  else if (h < 300) { r = x; g = 0; b = c }
  else { r = c; g = 0; b = x }

  const toHex = (n) => {
    const hex = Math.round((n + m) * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

const hexToRGB = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

const rgbToHex = ({ r, g, b }) => {
  const toHex = (n) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

const ColorPicker = ({ currentColor, onColorChange, onReset }) => {
  const [color, setColor] = useState(currentColor)
  const [rgb, setRgb] = useState(hexToRGB(currentColor))
  const [hsl, setHsl] = useState(hexToHSL(currentColor))
  const [copied, setCopied] = useState(false)
  const [textColor, setTextColor] = useState('#FFFFFF')
  const [contrastRatio, setContrastRatio] = useState(21)
  const [warning, setWarning] = useState('')

  useEffect(() => {
    setColor(currentColor)
    setRgb(hexToRGB(currentColor))
    setHsl(hexToHSL(currentColor))
  }, [currentColor])

  useEffect(() => {
    const calculated = calculateTextColor(color)
    setTextColor(calculated.textColor)
    setContrastRatio(calculated.ratio)
    
    if (calculated.ratio < 4.5) {
      setWarning('Low contrast detected. Text color adjusted automatically.')
    } else {
      setWarning('')
    }
    
    if (calculated.ratio >= 3.0) {
      onColorChange(color)
    }
  }, [color])

  const calculateTextColor = (bgColor) => {
    const hex = bgColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16) / 255
    const g = parseInt(hex.substr(2, 2), 16) / 255
    const b = parseInt(hex.substr(4, 2), 16) / 255

    const luminance = 0.2126 * (r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)) +
                      0.7152 * (g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)) +
                      0.0722 * (b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4))

    const textColor = luminance > 0.179 ? '#000000' : '#FFFFFF'
    const textLuminance = textColor === '#FFFFFF' ? 1 : 0
    const ratio = (Math.max(luminance, textLuminance) + 0.05) / (Math.min(luminance, textLuminance) + 0.05)

    return { textColor, ratio: ratio.toFixed(2) }
  }

  const handleHexChange = (value) => {
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      setColor(value)
      setRgb(hexToRGB(value))
      setHsl(hexToHSL(value))
    }
  }

  const handleRgbChange = (channel, value) => {
    const newRgb = { ...rgb, [channel]: parseInt(value) || 0 }
    setRgb(newRgb)
    const hex = rgbToHex(newRgb)
    setColor(hex)
    setHsl(hexToHSL(hex))
  }

  const handleHslChange = (channel, value) => {
    const newHsl = { ...hsl, [channel]: parseFloat(value) || 0 }
    setHsl(newHsl)
    const hex = hslToHex(newHsl)
    setColor(hex)
    setRgb(hexToRGB(hex))
  }

  const copyColor = () => {
    navigator.clipboard.writeText(color)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Color Wheel */}
      <div className="bg-gray-50 rounded-lg p-4 border">
        <ColorWheel color={color} onChange={(newColor) => {
          setColor(newColor)
          setRgb(hexToRGB(newColor))
          setHsl(hexToHSL(newColor))
        }} />
      </div>

      {/* Live Preview */}
      <div 
        className="p-4 rounded-lg border-2 transition-all"
        style={{ backgroundColor: color, color: textColor }}
      >
        <p className="font-semibold">Live Preview</p>
        <p className="text-sm opacity-90">Your Name • your.email@example.com</p>
      </div>

      {/* Contrast Info */}
      <div className="p-3 bg-gray-50 rounded-lg border">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-700">Contrast Ratio:</span>
          <span className={`font-semibold ${
            contrastRatio >= 7 ? 'text-green-600' :
            contrastRatio >= 4.5 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {contrastRatio}:1
          </span>
        </div>
        <p className="text-xs text-gray-600">
          {contrastRatio >= 7 ? '✓ AAA (Enhanced)' :
           contrastRatio >= 4.5 ? '✓ AA (Minimum)' : '✗ Below Standards'}
        </p>
      </div>

      {warning && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-700">{warning}</p>
        </div>
      )}

      {/* HEX Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">HEX</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={color}
            onChange={(e) => {
              const val = e.target.value
              if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                if (val.length === 7) handleHexChange(val)
                else setColor(val)
              }
            }}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
            maxLength={7}
          />
          <button
            onClick={copyColor}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={onReset}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* RGB Sliders */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">RGB</label>
        {['r', 'g', 'b'].map((channel) => (
          <div key={channel} className="flex items-center gap-3">
            <span className="text-xs font-medium text-gray-600 w-4 uppercase">{channel}</span>
            <input
              type="range"
              min="0"
              max="255"
              value={rgb[channel]}
              onChange={(e) => handleRgbChange(channel, e.target.value)}
              className="flex-1"
            />
            <input
              type="number"
              min="0"
              max="255"
              value={rgb[channel]}
              onChange={(e) => handleRgbChange(channel, e.target.value)}
              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
        ))}
      </div>

      {/* HSL Sliders */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">HSL</label>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-600 w-4">H</span>
          <input
            type="range"
            min="0"
            max="360"
            value={hsl.h}
            onChange={(e) => handleHslChange('h', e.target.value)}
            className="flex-1"
          />
          <input
            type="number"
            min="0"
            max="360"
            value={Math.round(hsl.h)}
            onChange={(e) => handleHslChange('h', e.target.value)}
            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-600 w-4">S</span>
          <input
            type="range"
            min="0"
            max="100"
            value={hsl.s}
            onChange={(e) => handleHslChange('s', e.target.value)}
            className="flex-1"
          />
          <input
            type="number"
            min="0"
            max="100"
            value={Math.round(hsl.s)}
            onChange={(e) => handleHslChange('s', e.target.value)}
            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-600 w-4">L</span>
          <input
            type="range"
            min="0"
            max="100"
            value={hsl.l}
            onChange={(e) => handleHslChange('l', e.target.value)}
            className="flex-1"
          />
          <input
            type="number"
            min="0"
            max="100"
            value={Math.round(hsl.l)}
            onChange={(e) => handleHslChange('l', e.target.value)}
            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
          />
        </div>
      </div>
    </div>
  )
}

export default ColorPicker
