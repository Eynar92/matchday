import type { ComponentProps } from "react";
import type LucideIcon from "@/components/atoms/LucideIcon";

export type IconName = ComponentProps<typeof LucideIcon>["name"];

export type Team = {
  src: string;
  name: string;
};

export type Match = {
  date: string;
  homeTeam: Team;
  awayTeam: Team;
};

export type Stat = {
  icon: IconName;
  value1: number;
  value2: number;
  iconClass?: string;
};

export type BarColor =
  | 'bg-green-500' | 'bg-emerald-500'
  | 'bg-blue-500' | 'bg-sky-500'
  | 'bg-red-500' | 'bg-rose-500'
  | 'bg-yellow-500' | 'bg-amber-500'
  | 'bg-purple-500' | 'bg-violet-500'
  | 'bg-orange-500' | 'bg-cyan-500'
  | 'bg-pink-500' | 'bg-teal-500'

export type PerformanceBarData = {
  label: string;
  homeValue: string;
  awayValue: string;
  homePercent: number;
  homeColor?: BarColor;
  awayColor?: BarColor;
};
