import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { ATTENDANCE_CHART_DATA, CGPA_CHART_DATA } from '../data';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const DARK_TOOLTIP = {
  backgroundColor: '#1e1e32',
  titleColor: '#e2e0fc',
  bodyColor: '#bbcbb9',
  borderColor: 'rgba(60,74,61,0.4)',
  borderWidth: 1,
};

export default function Analytics() {
  const attendanceData = {
    labels: ATTENDANCE_CHART_DATA.labels,
    datasets: [{
      label: 'Attendance %',
      data: ATTENDANCE_CHART_DATA.data,
      backgroundColor: ['#4ff07f', '#25d366', '#3de273', 'rgba(79,240,127,0.6)', 'rgba(79,240,127,0.4)'],
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  const attendanceOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { ...DARK_TOOLTIP, callbacks: { label: ctx => ` ${ctx.raw}% attendance` } },
    },
    scales: {
      y: { min: 60, max: 100, ticks: { callback: v => v + '%', font: { size: 11 }, color: '#8890b5' }, grid: { color: 'rgba(60,74,61,0.2)' }, border: { display: false } },
      x: { ticks: { font: { size: 12, weight: '700' }, color: '#bbcbb9' }, grid: { display: false }, border: { display: false } },
    },
  };

  const cgpaData = {
    labels: CGPA_CHART_DATA.labels,
    datasets: [{
      data: CGPA_CHART_DATA.data,
      backgroundColor: CGPA_CHART_DATA.colors,
      borderColor: '#1e1e32',
      borderWidth: 3,
      hoverOffset: 8,
    }],
  };

  const cgpaOptions = {
    responsive: true,
    cutout: '68%',
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 14, usePointStyle: true, color: '#bbcbb9' } },
      tooltip: { ...DARK_TOOLTIP, callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw} students` } },
    },
  };

  return (
    <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="chart-panel">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-white">Attendance by Department</h3>
            <p className="text-xs mt-0.5" style={{ color: '#8890b5' }}>Current semester overview</p>
          </div>
          <span className="badge badge-info">Live</span>
        </div>
        <Bar data={attendanceData} options={attendanceOptions} height={180} />
      </div>

      <div className="chart-panel">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-white">CGPA Distribution</h3>
            <p className="text-xs mt-0.5" style={{ color: '#8890b5' }}>Student performance spread</p>
          </div>
          <span className="badge badge-success">2024–25</span>
        </div>
        <Doughnut data={cgpaData} options={cgpaOptions} height={180} />
      </div>
    </div>
  );
}
