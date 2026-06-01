import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSeason(date = new Date()): "spring" | "summer" | "autumn" | "winter" {
  const m = date.getMonth(); // 0-11
  if (m >= 2 && m <= 4) return "spring";
  if (m >= 5 && m <= 7) return "summer";
  if (m >= 8 && m <= 10) return "autumn";
  return "winter";
}

export const SEASON_INFO = {
  spring: { label: "Весна", emoji: "🌱", color: "#A8D8A0" },
  summer: { label: "Лето", emoji: "☀️", color: "#FFD966" },
  autumn: { label: "Осень", emoji: "🍂", color: "#E69138" },
  winter: { label: "Зима", emoji: "❄️", color: "#9FC5E8" },
} as const;
