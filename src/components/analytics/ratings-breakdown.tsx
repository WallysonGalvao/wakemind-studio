import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

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

interface RatingsBreakdownProps {
  ios: Record<string, number> | null;
  android: Record<string, number> | null;
  loading?: boolean;
}

const chartConfig = {
  ios: { label: "iOS", color: "var(--chart-1)" },
  android: { label: "Android", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function RatingsBreakdown({ ios, android, loading }: RatingsBreakdownProps) {
  const data = ["5", "4", "3", "2", "1"].map((star) => ({
    star: `${star}★`,
    ios: ios?.[star] ?? 0,
    android: android?.[star] ?? 0,
  }));

  const hasData = data.some((d) => d.ios > 0) || data.some((d) => d.android > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ratings Breakdown</CardTitle>
        <CardDescription>Distribution by star rating (iOS vs Android)</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-62.5 w-full" />
        ) : !hasData ? (
          <div className="flex h-62.5 items-center justify-center text-sm text-muted-foreground">
            No ratings data available
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-62.5 w-full">
            <BarChart data={data} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="star" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="ios" fill="var(--color-ios)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="android" fill="var(--color-android)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
