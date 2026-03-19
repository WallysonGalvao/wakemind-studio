import { createFileRoute } from "@tanstack/react-router";
import { KeyRound, Save } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/hooks/use-settings";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { settings, update } = useSettings();
  const [apiKeyDraft, setApiKeyDraft] = React.useState(settings.openaiApiKey);
  const [saved, setSaved] = React.useState(false);

  function handleSave() {
    update({ openaiApiKey: apiKeyDraft });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account and integration preferences.
        </p>
      </div>

      <div className="flex max-w-xl flex-col gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <KeyRound className="size-4" />
              OpenAI API Key
            </CardTitle>
            <CardDescription>
              Used for image and sound generation. Stored only in this browser
              (localStorage) — never sent to any server other than OpenAI.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="openai-api-key">API Key</Label>
                <Input
                  id="openai-api-key"
                  type="password"
                  placeholder="sk-..."
                  value={apiKeyDraft}
                  onChange={(e) => {
                    setApiKeyDraft(e.target.value);
                    setSaved(false);
                  }}
                  className="font-mono text-sm"
                />
              </div>
              <Button
                onClick={handleSave}
                variant={saved ? "secondary" : "default"}
                className="self-start"
              >
                <Save className="mr-2 size-4" />
                {saved ? "Saved!" : "Save Key"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
