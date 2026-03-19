import { Loader2, Wand2 } from "lucide-react";

import { Button } from "#/components/ui/button";

interface GenerateButtonProps {
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}

export function GenerateButton({ loading, disabled, onClick }: GenerateButtonProps) {
  return (
    <Button size="lg" onClick={onClick} disabled={loading || disabled} className="w-full">
      {loading ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          Generating…
        </>
      ) : (
        <>
          <Wand2 className="mr-2 size-4" />
          Generate Image
        </>
      )}
    </Button>
  );
}
