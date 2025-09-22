import { useState } from 'react'

interface TaskProgressSliderProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

export function TaskProgressSlider({ value, onChange, disabled = false }: TaskProgressSliderProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value)
    onChange(newValue)
  }

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-green-500'
    if (progress >= 75) return 'bg-blue-500'
    if (progress >= 50) return 'bg-yellow-500'
    if (progress >= 25) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={value}
          onChange={handleChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          disabled={disabled}
          className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          style={{
            background: `linear-gradient(to right, ${getProgressColor(value)} 0%, ${getProgressColor(value)} ${value}%, #e5e7eb ${value}%, #e5e7eb 100%)`
          }}
        />
        <div 
          className={`absolute top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md transition-all ${
            getProgressColor(value)
          } ${isDragging ? 'scale-110' : ''}`}
          style={{ left: `calc(${value}% - 8px)` }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>0%</span>
        <span className={`font-medium ${value === 100 ? 'text-green-600' : 'text-gray-700'}`}>
          {value}%
        </span>
        <span>100%</span>
      </div>
    </div>
  )
}