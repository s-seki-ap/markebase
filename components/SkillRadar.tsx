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
          <PolarGrid stroke="var(--color-border)" />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
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
            stroke="var(--color-blue)"
            fill="var(--color-blue)"
            fillOpacity={0.25}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
