import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { MixpanelRetentionCohort } from "@/services/analytics/mixpanel";

interface RetentionHeatmapProps {
  data: MixpanelRetentionCohort[];
  loading?: boolean;
}

function getCellColor(pct: number): string {
  if (pct >= 80) return "bg-emerald-600 text-white";
  if (pct >= 60) return "bg-emerald-500 text-white";
  if (pct >= 40) return "bg-emerald-400 text-white";
  if (pct >= 20) return "bg-emerald-300 text-emerald-900";
  if (pct > 0) return "bg-emerald-100 text-emerald-800";
  return "bg-muted text-muted-foreground";
}

export function RetentionHeatmap({ data, loading }: RetentionHeatmapProps) {
  const maxWeeks = data.length > 0 ? Math.max(...data.map((c) => c.retention.length)) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Retention</CardTitle>
        <CardDescription>User retention by weekly cohort</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : data.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            No retention data available
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="px-2 py-1.5 text-left font-medium text-muted-foreground">
                    Cohort
                  </th>
                  <th className="px-2 py-1.5 text-center font-medium text-muted-foreground">
                    Users
                  </th>
                  {Array.from({ length: maxWeeks }, (_, i) => (
                    <th
                      key={i}
                      className="px-2 py-1.5 text-center font-medium text-muted-foreground"
                    >
                      W{i}
                    </th>
                  ))}
                </tr>
              </thead>
              <TooltipProvider delayDuration={150}>
                <tbody>
                  {data.map((cohort) => (
                    <tr key={cohort.date}>
                      <td className="px-2 py-1 font-medium whitespace-nowrap">
                        {cohort.date}
                      </td>
                      <td className="px-2 py-1 text-center text-muted-foreground">
                        {cohort.size.toLocaleString()}
                      </td>
                      {cohort.retention.map((pct, weekIdx) => (
                        <td key={weekIdx} className="px-0.5 py-0.5">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  "flex h-7 min-w-9 items-center justify-center rounded text-[10px] font-medium tabular-nums",
                                  getCellColor(pct),
                                )}
                              >
                                {pct.toFixed(0)}%
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p className="text-xs">
                                <span className="font-medium">{cohort.date}</span> · Week{" "}
                                {weekIdx}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {pct.toFixed(1)}% retained (
                                {Math.round((cohort.size * pct) / 100).toLocaleString()}{" "}
                                users)
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </td>
                      ))}
                      {/* Fill empty cells for shorter cohorts */}
                      {Array.from(
                        { length: maxWeeks - cohort.retention.length },
                        (_, i) => (
                          <td key={`empty-${i}`} className="px-0.5 py-0.5">
                            <div className="h-7 min-w-9" />
                          </td>
                        ),
                      )}
                    </tr>
                  ))}
                </tbody>
              </TooltipProvider>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
