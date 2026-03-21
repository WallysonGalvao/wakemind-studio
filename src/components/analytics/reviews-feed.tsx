import { Star } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { StoreReview } from "@/services/analytics/appstore";

interface ReviewsFeedProps {
  iosReviews: StoreReview[];
  androidReviews: StoreReview[];
  loading?: boolean;
}

export function ReviewsFeed({ iosReviews, androidReviews, loading }: ReviewsFeedProps) {
  const { t } = useTranslation();
  const allReviews = React.useMemo(
    () =>
      [
        ...iosReviews.map((r) => ({ ...r, store: "iOS" as const })),
        ...androidReviews.map((r) => ({ ...r, store: "Android" as const })),
      ].sort(
        (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime(),
      ),
    [iosReviews, androidReviews],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("components.reviewsFeed.title")}</CardTitle>
        <CardDescription>{t("components.reviewsFeed.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : allReviews.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            {t("components.reviewsFeed.empty")}
          </div>
        ) : (
          <div className="flex max-h-125 flex-col gap-3 overflow-y-auto">
            {allReviews.map((review) => (
              <div key={`${review.store}-${review.id}`} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                        review.store === "iOS"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      }`}
                    >
                      {review.store}
                    </span>
                    <span className="text-sm font-medium">{review.reviewer}</span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-3 ${
                            i < review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {review.createdDate
                      ? new Date(review.createdDate).toLocaleDateString()
                      : ""}
                  </span>
                </div>
                {review.title && (
                  <p className="mt-1 text-sm font-medium">{review.title}</p>
                )}
                {review.body && (
                  <p className="mt-0.5 line-clamp-3 text-sm text-muted-foreground">
                    {review.body}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
