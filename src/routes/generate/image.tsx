import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/generate/image")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
});
