import { useTranslation } from "react-i18next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MixpanelTopEvent } from "@/services/analytics/mixpanel";

interface TopEventsTableProps {
  events: MixpanelTopEvent[];
  loading?: boolean;
}

export function TopEventsTable({ events, loading }: TopEventsTableProps) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("components.topEvents.title")}</CardTitle>
        <CardDescription>{t("components.topEvents.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t("components.topEvents.empty")}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("components.topEvents.event")}</TableHead>
                <TableHead className="text-right">
                  {t("components.topEvents.count")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.event}>
                  <TableCell className="font-medium">{event.event}</TableCell>
                  <TableCell className="text-right">
                    {event.count.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
