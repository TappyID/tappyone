'use client'

interface ConnectionLineProps {
  from: { x: number; y: number }
  to: { x: number; y: number }
  isDark: boolean
  isActive?: boolean
}

export default function ConnectionLine({ from, to, isDark, isActive = false }: ConnectionLineProps) {
  // Calculate control points for a smooth curve
  const dx = to.x - from.x
  
  // Control points for bezier curve
  const offset = Math.max(Math.abs(dx) * 0.35, 50)
  const controlPoint1X = from.x + offset
  const controlPoint1Y = from.y
  
  const controlPoint2X = to.x - offset
  const controlPoint2Y = to.y

  const pathData = `M ${from.x} ${from.y} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${to.x} ${to.y}`

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{
        width: '100%',
        height: '100%',
        zIndex: 1
      }}
    >
      <defs>
        <marker
          id={`arrowhead-${isDark ? 'dark' : 'light'}${isActive ? '-active' : ''}`}
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
        >
          <polygon
            points="0 0, 8 3, 0 6"
            fill={
              isActive 
                ? '#3B82F6' 
                : isDark 
                  ? '#6B7280' 
                  : '#9CA3AF'
            }
          />
        </marker>
      </defs>
      
      <path
        d={pathData}
        stroke={
          isActive 
            ? '#3B82F6' 
            : isDark 
              ? '#6B7280' 
              : '#9CA3AF'
        }
        strokeWidth={isActive ? 2.4 : 1.6}
        fill="none"
        markerEnd={`url(#arrowhead-${isDark ? 'dark' : 'light'}${isActive ? '-active' : ''})`}
        className={isActive ? 'animate-pulse' : ''}
        strokeLinecap="round"
      />
    </svg>
  )
}
