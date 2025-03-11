import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#34D399', '#FBBF24', '#EF4444', '#3B82F6']; // Green, Yellow, Red, Blue

const KeyStatusChart = ({ data }) => {
  if (!data || data.length === 0) return <p className="text-gray-500">No data available</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          label
        />
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};


export default KeyStatusChart;
