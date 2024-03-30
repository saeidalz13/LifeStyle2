import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from "chart.js";
import { Balance } from "../../../assets/FinanceInterfaces";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

interface PieProps {
  options: ChartOptions<"pie">;
  data: ChartData<"pie">;
}

interface PieChartEachBudgetProps {
  balance: Balance;
}

const PieChart: React.FC<PieProps> = ({ data, options }) => {
  return <Pie data={data} options={options} />;
};

const PieChartEachBudget = (props: PieChartEachBudgetProps) => {
  const data = {
    labels: ["Capital", "Eatout", "Entertainment"],
    datasets: [
      {
        data: [
          +props.balance.capital,
          +props.balance.eatout,
          +props.balance.entertainment,
        ],
        backgroundColor: ["#4E625A", "#9B4A1B", "#5A3E36"],
        borderColor: ["#9CAFAA", "#9CAFAA", "#9CAFAA"],
        borderWidth: 1,
        font: 20,
      },
    ],
  };

  const options: PieProps["options"] = {
    responsive: true,

    plugins: {
      legend: {
        labels: {
          font: {
            size: 15,
            family:
              "'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif",
          },
        },
      },
      datalabels: {
        color: "#fff",
        font: {
          size: 14,
          family:
            "'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif",
        },
        formatter: (value: number) => `$${value}`,
      },
      title: {
        display: true,
        text: "Balance",
      },
    },
  };

  return <PieChart data={data} options={options} />;
};

export default PieChartEachBudget;
