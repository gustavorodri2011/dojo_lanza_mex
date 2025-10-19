import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const BeltChart = ({ data }) => {
  const beltColors = {
    'Blanco': '#f3f4f6',
    'Amarillo': '#fbbf24',
    'Naranja': '#f97316',
    'Verde': '#10b981',
    'Azul': '#3b82f6',
    'Marrón': '#92400e',
    'Negro': '#1f2937'
  };

  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        data: Object.values(data),
        backgroundColor: Object.keys(data).map(belt => beltColors[belt] || '#6b7280'),
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Distribución por Cinturón',
      },
    },
  };

  return <Doughnut data={chartData} options={options} />;
};

export default BeltChart;