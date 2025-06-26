import { Chart, LinearAxis, LinearLine } from "@shelacek/plotery";
import useMedia from "use-media";

interface Data {
  suhu?: [number, number][];
  kelembapan?: [number, number][];
}

interface LineColor {
  color1: "suhu" | "kelembapan";
  color2?: "suhu" | "kelembapan";
}

interface MeasurementCardProps {
  sensorData: Data;
  lineColor?: LineColor;
  className?: string;
  isKelembapan?: boolean;
}

export const MeasurementChart = (measurementData: Data) => {
  const data = {
    suhu: measurementData.suhu || [],
    kelembapan: measurementData.kelembapan || [],
  };
  console.log("Measurement Data:", data);
  return (
    <Chart data={data}>
      <LinearAxis type="x" min={0} max={10} major />
      <LinearAxis type="y" min={0} max={10} major />

      {data.suhu.length > 0 && <LinearLine series="suhu" area />}
      {data.kelembapan.length > 0 && <LinearLine series="kelembapan" area />}
    </Chart>
  );
};

const MeasurementCard = ({ isKelembapan, sensorData, lineColor, className = "bg-primary shadow-lg rounded-3xl flex flex-col p-4 w-full md:w-1/2" }: MeasurementCardProps) => {
  const isMd = useMedia({ minWidth: "768px" });
  const linesColor = {
    suhu: "oklch(79.5% 0.184 86.047)",
    kelembapan: "oklch(62.3% 0.214 259.815)",
  };

  return (
    <div
      className={`${className} border border-secondary-muted`}
      style={{
        "--plotery-s1-color": lineColor ? linesColor[lineColor.color1] : "oklch(100% 0 0/0)", // default color for suhu
        "--plotery-s2-color": lineColor && lineColor.color2 ? linesColor[lineColor.color2] : "oklch(100% 0 0/0)", // default color for kelembapan
      }}
    >
      <h1 className={`-mb-5 text-secondary font-bold text-2xl md:text-2xl md:ml-2`}>{isMd ? (isKelembapan ? "Kelembapan" : "Suhu") : "Kelembapan dan Suhu"}</h1>
      <MeasurementChart kelembapan={isMd ? (isKelembapan ? sensorData.kelembapan : []) : sensorData.kelembapan} suhu={isMd ? (isKelembapan ? [] : sensorData.suhu) : sensorData.suhu} />
    </div>
  );
};

export default MeasurementCard;
