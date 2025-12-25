
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';

interface ProteinChartProps {
  current: number;
  target: number;
}

const ProteinChart: React.FC<ProteinChartProps> = ({ current, target }) => {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const data = [
    { name: 'Consumed', value: current },
    { name: 'Remaining', value: Math.max(target - current, 0) },
  ];

  const COLORS = ['#ffffff', 'rgba(255, 255, 255, 0.2)'];

  return (
    <div className="h-28 w-28">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={35}
            outerRadius={45}
            paddingAngle={2}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
            <Label
              value={`${percentage.toFixed(0)}%`}
              position="center"
              className="text-lg font-bold fill-white"
            />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProteinChart;
