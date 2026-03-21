# Fenrir

> Multi-project Hub for **Three Wolves** — manage game asset creation and product analytics in one place.

## Overview

Fenrir is an internal tool that brings together two capabilities under a unified project-based workspace:

- **Asset Creation** — Generate images (OpenAI gpt-image-1 / DALL-E) and sounds (OpenAI TTS) for games. Organize assets in packages with configurable style presets, preview in-browser, and download.
- **Product Analytics** — Connect Mixpanel and RevenueCat integrations per project to visualize active users, top events, revenue, and retention cohort heatmaps.

Each project lives under its own slug (`/:projectSlug/…`), so multiple games can coexist in the same workspace.

## Tech Stack

- **React 19** + **TanStack Router** (file-based routing) + **Vite**
- **Supabase** — Auth, PostgreSQL, Storage, Edge Functions, Vault
- **@tanstack/react-query** — Server state management
- **Tailwind CSS v4** + **Radix UI** (shadcn/ui) + **Recharts**
- **React Compiler** enabled project-wide

## Getting Started

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# Start dev server
pnpm dev
```

## Project Structure

```
src/
├── routes/                        # File-based routing
│   ├── __root.tsx                 # Layout: sidebar + header
│   ├── index.tsx                  # Hub overview (all projects)
│   └── $projectSlug/
│       ├── dashboard.tsx          # KPIs, charts, data table
│       ├── analytics.tsx          # Mixpanel + RevenueCat dashboards
│       ├── library.tsx            # Achievement packages
│       ├── settings.tsx           # Integrations (API keys via Vault)
│       └── generate/
│           ├── image.tsx          # Image generation (OpenAI)
│           └── sound.tsx          # Sound generation (OpenAI TTS)
├── services/
│   ├── supabase/                  # DB, storage, edge-function callers
│   └── analytics/                 # Mixpanel + RevenueCat proxies
├── hooks/                         # useGeneration, useSoundGeneration, useAuth…
├── lib/library/                   # Style configs, sound presets, prompt builders
├── components/                    # UI, layout, dashboard, analytics, generation
└── types/                         # TypeScript interfaces
supabase/
├── functions/                     # Edge Functions (generate-image, generate-sound, analytics-*, save-integration)
└── migrations/                    # SQL migrations
```

## Edge Functions

| Function               | Purpose                                       |
| ---------------------- | --------------------------------------------- |
| `generate-image`       | Proxies OpenAI image generation via Vault key |
| `generate-sound`       | Proxies OpenAI TTS API via Vault key          |
| `analytics-mixpanel`   | Proxies Mixpanel data export API              |
| `analytics-revenuecat` | Proxies RevenueCat overview API               |
| `save-integration`     | Stores integration secrets in Supabase Vault  |

## Building for Production

```bash
pnpm build
```

Now that you have two routes you can use a `Link` component to navigate between them.

### Adding Links

To use SPA (Single Page Application) navigation you will need to import the `Link` component from `@tanstack/react-router`.

```tsx
import { Link } from "@tanstack/react-router";
```

Then anywhere in your JSX you can use it like so:

```tsx
<Link to="/about">About</Link>
```

This will create a link that will navigate to the `/about` route.

More information on the `Link` component can be found in the [Link documentation](https://tanstack.com/router/v1/docs/framework/react/api/router/linkComponent).

### Using A Layout

In the File Based Routing setup the layout is located in `src/routes/__root.tsx`. Anything you add to the root route will appear in all the routes. The route content will appear in the JSX where you render `{children}` in the `shellComponent`.

Here is an example layout that includes a header:

```tsx
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "My App" },
    ],
  }),
  shellComponent: ({ children }) => (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <header>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
          </nav>
        </header>
        {children}
        <Scripts />
      </body>
    </html>
  ),
});
```

More information on layouts can be found in the [Layouts documentation](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#layouts).

## Server Functions

TanStack Start provides server functions that allow you to write server-side code that seamlessly integrates with your client components.

```tsx
import { createServerFn } from "@tanstack/react-start";

const getServerTime = createServerFn({
  method: "GET",
}).handler(async () => {
  return new Date().toISOString();
});

// Use in a component
function MyComponent() {
  const [time, setTime] = useState("");

  useEffect(() => {
    getServerTime().then(setTime);
  }, []);

  return <div>Server time: {time}</div>;
}
```

## API Routes

You can create API routes by using the `server` property in your route definitions:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";

export const Route = createFileRoute("/api/hello")({
  server: {
    handlers: {
      GET: () => json({ message: "Hello, World!" }),
    },
  },
});
```

## Data Fetching

There are multiple ways to fetch data in your application. You can use TanStack Query to fetch data from a server. But you can also use the `loader` functionality built into TanStack Router to load the data for a route before it's rendered.

For example:

```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/people")({
  loader: async () => {
    const response = await fetch("https://swapi.dev/api/people");
    return response.json();
  },
  component: PeopleComponent,
});

function PeopleComponent() {
  const data = Route.useLoaderData();
  return (
    <ul>
      {data.results.map((person) => (
        <li key={person.name}>{person.name}</li>
      ))}
    </ul>
  );
}
```

Loaders simplify your data fetching logic dramatically. Check out more information in the [Loader documentation](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#loader-parameters).

# Demo files

Files prefixed with `demo` can be safely deleted. They are there to provide a starting point for you to play around with the features you've installed.

# Learn More

You can learn more about all of the offerings from TanStack in the [TanStack documentation](https://tanstack.com).

For TanStack Start specific documentation, visit [TanStack Start](https://tanstack.com/start).
