import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$projectSlug/generate/sound")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/$projectSlug/generate/sound"!</div>;
}
