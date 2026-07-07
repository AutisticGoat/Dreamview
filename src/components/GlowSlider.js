'use client'
import { useId } from 'react'

export default function GlowSlider({
  min = 1,
  max = 5,
  value,
  onChange,
  color,        // si se pasa, usa ese color (para emociones)
  name,
  style = {},
}) {
  const uid = useId().replace(/:/g, '-')
  const porcentaje = ((value - min) / (max - min)) * 100

  // Color base según tipo
  const opacidad       = color ? Math.round(40 + (porcentaje / 100) * 215).toString(16).padStart(2, '0') : 'ff'
  const colorIzquierda = color ? `${color}${opacidad}` : '#6655cc'
  const colorDerecha   = color ? `${color}${opacidad}` : '#3a7fc1'
  const glowColor      = color ?? '#6655cc'
  const glowIntensidad = Math.round((porcentaje / 100) * 20)

  return (
    <div style={{ position: 'relative', width: '100%', ...style }}>
      <input
        type="range"
        id={`slider-${uid}`}
        name={name}
        min={min}
        max={max}
        value={value}
        onChange={onChange}
        style={{
          appearance:      'none',
          WebkitAppearance:'none',
          width:           '100%',
          height:          '4px',
          borderRadius:    '2px',
          outline:         'none',
          cursor:          'pointer',
          background:      `linear-gradient(to right, ${colorIzquierda} 0%, ${colorDerecha} ${porcentaje}%, #1e1e3a ${porcentaje}%, #1e1e3a 100%)`,
          boxShadow:       `0 0 ${glowIntensidad}px ${glowColor}${Math.round((porcentaje / 100) * 255).toString(16).padStart(2, '0')}`,
          transition:      'box-shadow 0.2s ease',
          border:          'none',
        }}
      />
      <style>{`
        #slider-${uid}::-webkit-slider-thumb {
            -webkit-appearance: none;
            width:        14px;
            height:       14px;
            border-radius:50%;
            background:   ${colorIzquierda};
            box-shadow:   0 0 8px ${glowColor}88;
            cursor:       pointer;
            transition:   box-shadow 0.2s ease;
            border:       2px solid #07071a;
        }
        #slider-${uid}::-webkit-slider-thumb:hover {
            box-shadow: 0 0 14px ${glowColor}aa;
        }
        #slider-${uid}::-moz-range-thumb {
            width:        14px;
            height:       14px;
            border-radius:50%;
            background:   ${colorIzquierda};
            box-shadow:   0 0 8px ${glowColor}88;
            cursor:       pointer;
            border:       2px solid #07071a;
        }
        `}</style>
    </div>
  )
}