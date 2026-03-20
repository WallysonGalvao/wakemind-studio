import { useTranslation } from "react-i18next";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

interface ActiveUsersChartProps {
  data: Array<{ date: string; dau: number; wau: number; mau: number }>;
  loading?: boolean;
}

const chartConfig = {
  dau: { label: "DAU", color: "var(--chart-1)" },
  wau: { label: "WAU", color: "var(--chart-2)" },
  mau: { label: "MAU", color: "var(--chart-3)" },
} satisfies ChartConfig;

export function ActiveUsersChart({ data, loading }: ActiveUsersChartProps) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("components.activeUsersChart.title")}</CardTitle>
        <CardDescription>{t("components.activeUsersChart.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-62.5 w-full" />
        ) : data.length === 0 ? (
          <div className="flex h-62.5 items-center justify-center text-sm text-muted-foreground">
            {t("components.activeUsersChart.empty")}
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-62.5 w-full">
            <AreaChart data={data} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                dataKey="mau"
                type="monotone"
                fill="var(--color-mau)"
                fillOpacity={0.1}
                stroke="var(--color-mau)"
                strokeWidth={2}
              />
              <Area
                dataKey="wau"
                type="monotone"
                fill="var(--color-wau)"
                fillOpacity={0.15}
                stroke="var(--color-wau)"
                strokeWidth={2}
              />
              <Area
                dataKey="dau"
                type="monotone"
                fill="var(--color-dau)"
                fillOpacity={0.2}
                stroke="var(--color-dau)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
