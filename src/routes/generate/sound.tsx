import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/generate/sound")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
});
