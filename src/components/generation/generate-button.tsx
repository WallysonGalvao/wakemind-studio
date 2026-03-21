import { Loader2, Wand2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

interface GenerateButtonProps {
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}

export function GenerateButton({ loading, disabled, onClick }: GenerateButtonProps) {
  const { t } = useTranslation();
  return (
    <Button size="lg" onClick={onClick} disabled={loading || disabled} className="w-full">
      {loading ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          {t("pages.generateImage.generating")}
        </>
      ) : (
        <>
          <Wand2 className="mr-2 size-4" />
          {t("pages.generateImage.generateBtn")}
        </>
      )}
    </Button>
  );
}
