"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface SkillData {
  category: string;
  value: number;
  fullMark: number;
}

interface SkillRadarProps {
  data: SkillData[];
}

export default function SkillRadar({ data }: SkillRadarProps) {
  if (data.length === 0) return null;

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="var(--color-border)" strokeWidth={2} />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fill: "var(--color-text-muted)", fontSize: 11, fontWeight: 700 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="完了率"
            dataKey="value"
            stroke="#58CC02"
            fill="#58CC02"
            fillOpacity={0.3}
            strokeWidth={3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
