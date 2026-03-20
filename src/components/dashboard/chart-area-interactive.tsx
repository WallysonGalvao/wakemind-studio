import * as React from "react";
import { useTranslation } from "react-i18next";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardAction,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useIsMobile } from "@/hooks/use-mobile";
import type { DailyActivity } from "@/types/asset";

function formatDateShort(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function useChartConfig() {
  const { t } = useTranslation();
  return {
    images: {
      label: t("pages.dashboard.chart.images"),
      color: "var(--primary)",
    },
    sounds: {
      label: t("pages.dashboard.chart.sounds"),
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;
}

interface ChartAreaInteractiveProps {
  data: DailyActivity[];
}

export function ChartAreaInteractive({ data }: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const chartConfig = useChartConfig();
  const [timeRange, setTimeRange] = React.useState("90d");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const filteredData =
    timeRange === "7d" ? data.slice(-7) : timeRange === "30d" ? data.slice(-30) : data;

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>{t("pages.dashboard.chart.title")}</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            {t("pages.dashboard.chart.descriptionDesktop")}
          </span>
          <span className="@[540px]/card:hidden">
            {t("pages.dashboard.chart.descriptionMobile")}
          </span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">
              {t("pages.dashboard.chart.last3Months")}
            </ToggleGroupItem>
            <ToggleGroupItem value="30d">
              {t("pages.dashboard.chart.last30Days")}
            </ToggleGroupItem>
            <ToggleGroupItem value="7d">
              {t("pages.dashboard.chart.last7Days")}
            </ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex h-8 w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              aria-label="Select a value"
            >
              <SelectValue placeholder={t("pages.dashboard.chart.last3Months")} />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                {t("pages.dashboard.chart.last3Months")}
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                {t("pages.dashboard.chart.last30Days")}
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                {t("pages.dashboard.chart.last7Days")}
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillImages" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-images)" stopOpacity={1.0} />
                <stop offset="95%" stopColor="var(--color-images)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillSounds" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-sounds)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-sounds)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={formatDateShort}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent labelFormatter={formatDateShort} indicator="dot" />
              }
            />
            <Area
              dataKey="sounds"
              type="natural"
              fill="url(#fillSounds)"
              stroke="var(--color-sounds)"
              stackId="a"
            />
            <Area
              dataKey="images"
              type="natural"
              fill="url(#fillImages)"
              stroke="var(--color-images)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
