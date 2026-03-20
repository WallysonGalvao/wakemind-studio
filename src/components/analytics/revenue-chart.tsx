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

interface RevenueChartProps {
  data: Array<{ date: string; mrr: number; churn: number }>;
  loading?: boolean;
}

const chartConfig = {
  mrr: { label: "MRR ($)", color: "var(--chart-1)" },
  churn: { label: "Churn (%)", color: "var(--chart-4)" },
} satisfies ChartConfig;

export function RevenueChart({ data, loading }: RevenueChartProps) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("components.revenueChart.title")}</CardTitle>
        <CardDescription>{t("components.revenueChart.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-62.5 w-full" />
        ) : data.length === 0 ? (
          <div className="flex h-62.5 items-center justify-center text-sm text-muted-foreground">
            {t("components.revenueChart.empty")}
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-62.5 w-full">
            <AreaChart data={data} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis
                yAxisId="mrr"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(v: number) => `$${v}`}
              />
              <YAxis
                yAxisId="churn"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(v: number) => `${v}%`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                yAxisId="mrr"
                dataKey="mrr"
                type="monotone"
                fill="var(--color-mrr)"
                fillOpacity={0.2}
                stroke="var(--color-mrr)"
                strokeWidth={2}
              />
              <Area
                yAxisId="churn"
                dataKey="churn"
                type="monotone"
                fill="var(--color-churn)"
                fillOpacity={0.1}
                stroke="var(--color-churn)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
