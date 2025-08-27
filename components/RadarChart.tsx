
import React from 'react';

interface RadarChartProps {
  stats: { label: string; value: number }[]; // value should be 0-100
}

const RadarChart: React.FC<RadarChartProps> = ({ stats }) => {
  if (!stats || stats.length < 3) {
    return <div className="flex items-center justify-center h-full text-sm text-gray-500">Not enough data for profile.</div>;
  }
  
  const size = 250;
  const center = size / 2;
  const numSides = stats.length;
  const angleSlice = (Math.PI * 2) / numSides;

  const getPoint = (value: number, index: number) => {
    const angle = angleSlice * index - Math.PI / 2;
    const radius = (value / 100) * (center * 0.8);
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  // Polygon points for the data shape
  const dataPoints = stats.map((stat, i) => {
      const point = getPoint(stat.value, i);
      return `${point.x},${point.y}`;
  }).join(' ');

  // Web lines and labels
  const webLines = [];
  const labels = [];
  for (let i = 0; i < numSides; i++) {
    const p100 = getPoint(100, i);
    webLines.push(
      <line
        key={`web-${i}`}
        x1={center}
        y1={center}
        x2={p100.x}
        y2={p100.y}
        stroke="rgba(128, 128, 128, 0.2)"
        strokeWidth="1"
      />
    );
    
    const p115 = getPoint(120, i); // Position labels outside the main chart
    labels.push(
      <text
        key={`label-${i}`}
        x={p115.x}
        y={p115.y}
        fontSize="11"
        fontWeight="bold"
        fill="currentColor"
        textAnchor="middle"
        alignmentBaseline="middle"
      >
        {stats[i].label}
      </text>
    );
  }
  
  // Concentric polygons for the background grid
  const gridPolygons = [80, 60, 40, 20].map(val => (
     <polygon
        key={`grid-${val}`}
        points={stats.map((_, i) => {
            const point = getPoint(val, i);
            return `${point.x},${point.y}`;
        }).join(' ')}
        fill="none"
        stroke="rgba(128, 128, 128, 0.2)"
        strokeWidth="1"
     />
  ));


  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%">
      <g>
        {gridPolygons}
        {webLines}
        <polygon
          points={dataPoints}
          fill="rgba(114, 9, 183, 0.5)"
          stroke="#7209B7"
          strokeWidth="2"
        />
        {stats.map((stat, i) => {
            const point = getPoint(stat.value, i);
            return (
                <circle key={`point-${i}`} cx={point.x} cy={point.y} r="3" fill="#F72585" />
            )
        })}
        {labels}
      </g>
    </svg>
  );
};

export default RadarChart;
