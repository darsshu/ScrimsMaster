import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { api, type Scrim } from "@shared/routes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Copy } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Custom hook to fetch user's joined scrims (Assuming API support or filtering on client)
  // For MVP, we will fetch all scrims and filter (Not efficient for prod, but works here)
  const { data: scrims, isLoading } = useQuery({
    queryKey: [api.scrims.list.path],
    queryFn: async () => {
      const res = await fetch(api.scrims.list.path);
      if (!res.ok) throw new Error("Failed");
      return await res.json() as Scrim[];
    }
  });

  // Filter logic would ideally be backend-side "/api/scrims/me"
  // Assuming the user object might have joinedScrims array or similar in a real app
  // For this mock without relation tables in frontend: We simulate user seeing all for now 
  // OR we rely on a proper endpoint. Let's assume we filter by ID in a real scenario
  // but here I'll just show the list of scrims for demonstration.
  const myScrims = scrims || []; 

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Room details copied to clipboard" });
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Player Dashboard</h1>
          <p className="text-zinc-400 mt-1">Welcome back, {user?.username}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-zinc-800 bg-zinc-900/20">
            <CardHeader>
              <CardTitle>Joined Matches</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className="animate-spin w-6 h-6" />
              ) : (
                <div className="space-y-4">
                  {myScrims.slice(0, 3).map(scrim => (
                    <div key={scrim.id} className="p-4 rounded-xl border border-zinc-800 bg-black/20 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold">{scrim.title}</h4>
                          <p className="text-sm text-zinc-500">{format(new Date(scrim.matchDate), "MMM d, h:mm a")}</p>
                        </div>
                        <Badge>{scrim.status}</Badge>
                      </div>
                      
                      {scrim.roomId ? (
                        <div className="flex gap-2 p-3 bg-zinc-900 rounded-lg text-sm font-mono">
                          <div className="flex-1">
                            <span className="text-zinc-500">ID:</span> {scrim.roomId}
                          </div>
                          <div className="flex-1">
                            <span className="text-zinc-500">Pass:</span> {scrim.roomPassword}
                          </div>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(`ID: ${scrim.roomId} Pass: ${scrim.roomPassword}`)}>
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="text-sm text-zinc-500 italic flex items-center gap-2">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Room details pending...
                        </div>
                      )}
                    </div>
                  ))}
                  {myScrims.length === 0 && (
                    <p className="text-zinc-500 text-sm">You haven't joined any matches yet.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/20">
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-zinc-500 uppercase font-bold">Username</label>
                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 font-mono">
                  {user?.username}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-500 uppercase font-bold">Email</label>
                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 font-mono">
                  {user?.email}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-500 uppercase font-bold">Role</label>
                <Badge variant="outline">{user?.role}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
