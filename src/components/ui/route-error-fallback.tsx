import type { ErrorComponentProps } from "@tanstack/react-router";
import { useRouter } from "@tanstack/react-router";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function RouteErrorFallback({ error, reset }: ErrorComponentProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const message = error instanceof Error ? error.message : t("errorFallback.description");

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="size-6 text-destructive" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">{t("errorFallback.title")}</h2>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => reset()}>
              <RotateCcw className="size-4" />
              {t("errorFallback.retry")}
            </Button>
            <Button onClick={() => router.navigate({ to: "/" })}>
              <Home className="size-4" />
              {t("errorFallback.goHome")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
