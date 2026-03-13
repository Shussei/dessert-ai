import { Radar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from "chart.js"

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

export default function FlavorGraph({roles}){

  if(!roles) return null

  const labels = Object.keys(roles)

  const data = {
    labels,
    datasets:[
      {
        label:"Component Density",
        data:Object.values(roles),
        backgroundColor:"rgba(236, 72, 153, 0.2)",
        borderColor:"#ec4899",
        borderWidth:2,
        pointBackgroundColor:"#a855f7",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#a855f7"
      }
    ]
  }

  const options = {
    scales: {
      r: {
        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        pointLabels: { color: '#cbd5e1', font: { size: 12, family: "'Inter', sans-serif" } },
        ticks: { display: false, maxTicksLimit: 5 }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(236, 72, 153, 0.3)',
        borderWidth: 1,
        padding: 10,
        displayColors: false
      }
    }
  }

  return(
    <div className="w-full max-w-md mx-auto mt-6 flex justify-center items-center">
      <div className="w-full aspect-square relative">
        <Radar data={data} options={options} />
      </div>
    </div>
  )
}