import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StyleConfigEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  rows?: number;
}

export function StyleConfigEditor({
  value,
  onChange,
  error,
  placeholder = "Select a package above to load its style config…",
  rows = 10,
}: StyleConfigEditorProps) {
  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    onChange(e.target.value);
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Style Config</CardTitle>
        <CardDescription className="text-xs">
          Pre-filled from the package. Edit freely to override.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <textarea
          rows={rows}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
          value={value}
          placeholder={placeholder}
          onChange={handleChange}
          spellCheck={false}
        />
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
