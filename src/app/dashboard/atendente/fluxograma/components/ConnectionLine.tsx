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
  const dy = to.y - from.y
  
  // Control points for bezier curve
  const controlPoint1X = from.x + Math.min(Math.abs(dx) * 0.5, 100)
  const controlPoint1Y = from.y
  
  const controlPoint2X = to.x - Math.min(Math.abs(dx) * 0.5, 100)
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
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
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
        strokeWidth={isActive ? 3 : 2}
        fill="none"
        markerEnd={`url(#arrowhead-${isDark ? 'dark' : 'light'}${isActive ? '-active' : ''})`}
        className={isActive ? 'animate-pulse' : ''}
      />
    </svg>
  )
}
