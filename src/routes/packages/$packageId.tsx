import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/packages/$packageId")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
});
