import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  BarElement, ArcElement,
  Tooltip, Legend,
} from 'chart.js';
import { ATTENDANCE_CHART_DATA, CGPA_CHART_DATA } from '../data';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const TOOLTIP_STYLE = {
  backgroundColor: '#1e1e32',
  titleColor: '#e2e0fc',
  bodyColor: '#bbcbb9',
  borderColor: 'rgba(60,74,61,0.4)',
  borderWidth: 1,
  padding: 10,
  cornerRadius: 10,
};

export default function Analytics() {
  const attendanceData = {
    labels: ATTENDANCE_CHART_DATA.labels,
    datasets: [{
      label: 'Attendance %',
      data: ATTENDANCE_CHART_DATA.data,
      backgroundColor: [
        'rgba(79,240,127,0.85)',
        'rgba(37,211,102,0.85)',
        'rgba(79,240,127,0.7)',
        'rgba(173,198,255,0.85)',
        'rgba(249,208,63,0.85)',
      ],
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const attendanceOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        ...TOOLTIP_STYLE,
        callbacks: { label: ctx => ` ${ctx.raw}% attendance` },
      },
    },
    scales: {
      y: {
        min: 60,
        max: 100,
        ticks: { callback: v => v + '%', font: { size: 11 }, color: '#8890b5' },
        grid: { color: 'rgba(60,74,61,0.15)' },
        border: { display: false },
      },
      x: {
        ticks: { font: { size: 12, weight: '700' }, color: '#bbcbb9' },
        grid: { display: false },
        border: { display: false },
      },
    },
  };

  const cgpaData = {
    labels: CGPA_CHART_DATA.labels,
    datasets: [{
      data: CGPA_CHART_DATA.data,
      backgroundColor: CGPA_CHART_DATA.colors,
      borderColor: '#1e1e32',
      borderWidth: 3,
      hoverOffset: 10,
    }],
  };

  const cgpaOptions = {
    responsive: true,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 11 },
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 8,
          color: '#bbcbb9',
        },
      },
      tooltip: {
        ...TOOLTIP_STYLE,
        callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw} students` },
      },
    },
  };

  // Top 3 stats for the attendance panel
  const topDept = ATTENDANCE_CHART_DATA.labels[
    ATTENDANCE_CHART_DATA.data.indexOf(Math.max(...ATTENDANCE_CHART_DATA.data))
  ];
  const avgAtt = Math.round(
    ATTENDANCE_CHART_DATA.data.reduce((a, b) => a + b, 0) / ATTENDANCE_CHART_DATA.data.length
  );

  return (
    <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Attendance Chart */}
      <div className="chart-panel">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Attendance by Department</h3>
            <p className="text-xs mt-0.5 text-gray-400 dark:text-[#8890b5]">Current semester overview</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="badge badge-info">Live</span>
            <span className="text-[10px] text-gray-400 dark:text-[#8890b5]">Best: {topDept}</span>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 rounded-xl p-3 bg-gray-50 dark:bg-white/[0.04] text-center">
            <p className="text-lg font-black text-[#4ff07f]">{avgAtt}%</p>
            <p className="text-[10px] text-gray-400 dark:text-[#8890b5] font-semibold uppercase tracking-wide">Avg</p>
          </div>
          <div className="flex-1 rounded-xl p-3 bg-gray-50 dark:bg-white/[0.04] text-center">
            <p className="text-lg font-black text-[#adc6ff]">{ATTENDANCE_CHART_DATA.labels.length}</p>
            <p className="text-[10px] text-gray-400 dark:text-[#8890b5] font-semibold uppercase tracking-wide">Depts</p>
          </div>
          <div className="flex-1 rounded-xl p-3 bg-gray-50 dark:bg-white/[0.04] text-center">
            <p className="text-lg font-black text-[#f9d03f]">75%</p>
            <p className="text-[10px] text-gray-400 dark:text-[#8890b5] font-semibold uppercase tracking-wide">Min</p>
          </div>
        </div>

        <Bar data={attendanceData} options={attendanceOptions} height={170} />
      </div>

      {/* CGPA Doughnut */}
      <div className="chart-panel">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">CGPA Distribution</h3>
            <p className="text-xs mt-0.5 text-gray-400 dark:text-[#8890b5]">Student performance spread</p>
          </div>
          <span className="badge badge-success">2024–25</span>
        </div>

        {/* CGPA legend pills */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {CGPA_CHART_DATA.labels.map((label, i) => (
            <div
              key={label}
              className="flex items-center gap-2 px-3 py-2 rounded-xl
                bg-gray-50 dark:bg-white/[0.04]"
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: CGPA_CHART_DATA.colors[i] }}
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-700 dark:text-[#e2e0fc] truncate">
                  {CGPA_CHART_DATA.data[i]} students
                </p>
                <p className="text-[10px] text-gray-400 dark:text-[#8890b5] truncate">{label.split(' ')[0]}</p>
              </div>
            </div>
          ))}
        </div>

        <Doughnut data={cgpaData} options={cgpaOptions} height={170} />
      </div>
    </div>
  );
}
