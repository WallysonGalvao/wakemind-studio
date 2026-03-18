import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/generate/sound')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/generate/sound"!</div>
}
