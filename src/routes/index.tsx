import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  CreditCard,
  Users,
  Activity,
  ArrowRight,
  ImageIcon,
  Sparkles,
  Music,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Progress } from "#/components/ui/progress";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

const recentGenerations = [
  {
    name: "Advanced Calculus",
    type: "Challenge",
    status: "Ready",
    date: "2026-03-18",
  },
  {
    name: "Memory Simon 01",
    type: "Challenge",
    status: "Ready",
    date: "2026-03-17",
  },
  {
    name: "Night Owl Badge",
    type: "Icon",
    status: "Synced",
    date: "2026-03-17",
  },
  {
    name: "Logic Sequence",
    type: "Challenge",
    status: "Draft",
    date: "2026-03-16",
  },
  {
    name: "Early Riser 2026",
    type: "Scene",
    status: "Synced",
    date: "2026-03-15",
  },
] as const;

function statusVariant(status: string) {
  switch (status) {
    case "Synced":
      return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100";
    case "Ready":
      return "bg-blue-100 text-blue-700 hover:bg-blue-100";
    default:
      return "bg-muted text-muted-foreground hover:bg-muted";
  }
}

function Dashboard() {
  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,284</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Challenges
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12</div>
            <p className="text-xs text-muted-foreground">+4 since yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Generation Credits
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">450</div>
            <p className="text-xs text-muted-foreground">Plan: Studio Pro</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">
              +201 since last hour
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        {/* Recent Generations */}
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Recent Generations</CardTitle>
              <CardDescription>
                Latest AI assets created for WakeMind.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link to="/library">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentGenerations.map((row, i) => (
                  <TableRow key={i} className="cursor-pointer">
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>{row.type}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={statusVariant(row.status)}
                      >
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {row.date}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Create */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Create</CardTitle>
            <CardDescription>Start a new generation session.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Link
                to="/generate/image"
                className="flex items-center gap-4 rounded-lg border p-3 hover:bg-muted transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles size={20} />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    New Illustration
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Challenge art for app modules.
                  </p>
                </div>
                <ArrowRight size={16} className="text-muted-foreground" />
              </Link>

              <Link
                to="/generate/sound"
                className="flex items-center gap-4 rounded-lg border p-3 hover:bg-muted transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10 text-purple-600">
                  <Music size={20} />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    New Audio Tone
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Generate AI-based alarm tones.
                  </p>
                </div>
                <ArrowRight size={16} className="text-muted-foreground" />
              </Link>
            </div>

            <div className="rounded-lg bg-muted/50 p-4 border border-dashed">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Sync Progress
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Assets to Sync</span>
                  <span className="font-bold text-foreground">14</span>
                </div>
                <Progress value={65} className="h-1.5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
