import React from 'react'
import { Palette, AlertCircle, RotateCcw, Check } from 'lucide-react'
import ColorPicker from './ColorPicker'

const ATS_SAFE_PRESETS = [
  '#FFFFFF', '#1e40af', '#374151', '#0f766e', '#1f2937',
  '#dc2626', '#7c3aed', '#059669', '#ea580c', '#0891b2'
]

const HeaderStyling = ({ currentColor, currentTemplate, onColorChange, onTemplateChange, hasContent }) => {
  const [showColorPicker, setShowColorPicker] = React.useState(false)
  const [recentColors, setRecentColors] = React.useState([])

  React.useEffect(() => {
    const saved = localStorage.getItem('recentColors')
    if (saved) setRecentColors(JSON.parse(saved))
  }, [])

  const handleColorChange = (color) => {
    onColorChange(color)
    
    // Save to recent colors
    const updated = [color, ...recentColors.filter(c => c !== color)].slice(0, 5)
    setRecentColors(updated)
    localStorage.setItem('recentColors', JSON.stringify(updated))
  }

  const handleReset = () => {
    handleColorChange('#3b82f6')
  }

  const TEMPLATE_FORMATS = [
    { 
      id: 'modern', 
      name: 'Modern Minimal', 
      description: 'Subtle header bar, clean spacing',
      bestFor: 'Tech, AI, Data, Startups',
      atsScore: 95
    },
    { 
      id: 'classic', 
      name: 'Classic Professional', 
      description: 'Single-column, bold headers',
      bestFor: 'Freshers, Conservative roles',
      atsScore: 100
    },
    { 
      id: 'executive', 
      name: 'Executive Hybrid', 
      description: 'Two-column top, emphasized header',
      bestFor: 'Experienced professionals',
      atsScore: 90
    }
  ]

  if (!hasContent) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <Palette className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">Add resume content to unlock styling options</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Template Format Selector */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Resume Format
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {TEMPLATE_FORMATS.map((template) => (
            <button
              key={template.id}
              onClick={() => onTemplateChange(template.id)}
              className={`text-left p-4 rounded-lg border-2 transition ${
                currentTemplate === template.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">{template.name}</h4>
                  <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded">
                  ATS {template.atsScore}%
                </span>
              </div>
              <p className="text-xs text-gray-500">Best for: {template.bestFor}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Header Color Customization */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Header Background Color</h3>
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {showColorPicker ? 'Hide' : 'Show'} Color Wheel
          </button>
        </div>

        {showColorPicker ? (
          <ColorPicker
            currentColor={currentColor}
            onColorChange={handleColorChange}
            onReset={handleReset}
          />
        ) : (
          <div className="space-y-3">
            {/* Quick Presets */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quick Presets</label>
              <div className="flex flex-wrap gap-2">
                {ATS_SAFE_PRESETS.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={`w-10 h-10 rounded border-2 transition ${
                      currentColor === color ? 'border-green-500 scale-110' : 'border-gray-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Recent Colors */}
            {recentColors.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recent Colors</label>
                <div className="flex flex-wrap gap-2">
                  {recentColors.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleColorChange(color)}
                      className="w-10 h-10 rounded border-2 border-gray-300 hover:scale-105 transition"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setShowColorPicker(true)}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-gray-400 hover:text-gray-800"
            >
              Open Color Wheel for Precise Selection
            </button>
          </div>
        )}
      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
        <p className="font-semibold mb-1">✓ Smart Accessibility</p>
        <p>Text color adjusts automatically for maximum readability. All exports remain ATS-safe.</p>
      </div>
    </div>
  )
}

export default HeaderStyling
