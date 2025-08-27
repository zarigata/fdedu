import React from 'react';

interface BarChartProps {
  data: { label: string; value: number }[];
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  const chartHeight = 300;
  const chartWidth = 500;
  const barPadding = 10;
  const maxValue = Math.max(...data.map(d => d.value), 100); // Ensure a minimum max value
  const barWidth = (chartWidth - barPadding * (data.length + 1)) / data.length;

  return (
    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%" height="100%" style={{fontFamily: 'Fredoka, sans-serif'}}>
      {data.map((item, index) => {
        const barHeight = (item.value / maxValue) * (chartHeight - 40);
        const x = barPadding + index * (barWidth + barPadding);
        const y = chartHeight - barHeight - 20;
        
        const colors = ['#F72585', '#7209B7', '#4CC9F0', '#ADFF00', '#FFD166'];
        const color = colors[index % colors.length];

        return (
          <g key={item.label}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={color}
              rx="4"
              ry="4"
            />
            <text
              x={x + barWidth / 2}
              y={y - 5}
              textAnchor="middle"
              fontSize="12"
              fontWeight="bold"
              fill="currentColor"
            >
              {item.value}
            </text>
            <text
              x={x + barWidth / 2}
              y={chartHeight - 5}
              textAnchor="middle"
              fontSize="11"
              fill="currentColor"
            >
              {item.label.split(' ')[0]} 
            </text>
          </g>
        );
      })}
       <line x1="0" y1={chartHeight - 20} x2={chartWidth} y2={chartHeight - 20} stroke="currentColor" strokeWidth="2" />
    </svg>
  );
};

export default BarChart;