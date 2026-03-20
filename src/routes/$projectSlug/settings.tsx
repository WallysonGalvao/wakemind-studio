import { createFileRoute } from "@tanstack/react-router";
import { UserCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useProject } from "@/hooks/use-project";

export const Route = createFileRoute("/$projectSlug/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const project = useProject();

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage preferences for <span className="font-medium">{project.name}</span>.
        </p>
      </div>

      <div className="flex max-w-xl flex-col gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCircle className="size-4" />
              Account
            </CardTitle>
            <CardDescription>
              Signed in as{" "}
              <span className="font-medium text-foreground">{user?.email}</span>. Image
              generation is powered by OpenAI via the Fenrir backend.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Integration settings for Mixpanel and RevenueCat coming soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
