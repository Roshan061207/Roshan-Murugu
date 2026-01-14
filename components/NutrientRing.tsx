
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
  protein: number;
  carbs: number;
  fat: number;
}

const NutrientRing: React.FC<Props> = ({ protein, carbs, fat }) => {
  const data = [
    { name: 'Protein', value: protein * 4, color: '#10B981' }, // 4 cal/g
    { name: 'Carbs', value: carbs * 4, color: '#F59E0B' },    // 4 cal/g
    { name: 'Fat', value: fat * 9, color: '#3B82F6' },       // 9 cal/g
  ];

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="h-48 w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`${Math.round(value)} kcal`, 'Contribution']}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-bold text-slate-700">{Math.round(total)}</span>
        <span className="text-xs text-slate-400 uppercase tracking-widest">Total Kcal</span>
      </div>
    </div>
  );
};

export default NutrientRing;
