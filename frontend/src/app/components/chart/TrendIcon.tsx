import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { Assessment } from "./types";

export function TrendIcon({ trend }: { trend: Assessment["trend"] }) {
  if (trend === "up") return <TrendingUp className="w-3.5 h-3.5 text-red-500" />;
  if (trend === "down") return <TrendingDown className="w-3.5 h-3.5 text-green-600" />;
  return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
}
