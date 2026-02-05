import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X } from "lucide-react";
import { useCreateScrim } from "@/hooks/use-scrims";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertScrimSchema, Scrim, Withdrawal, type InsertScrim } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@shared/schema";
import { useLocation } from "wouter";

export default function AdminPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (user && user.role !== UserRole.ADMIN) {
    setLocation("/");
    return null;
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-red-500">Admin Control</h1>
          <p className="text-zinc-400 mt-1">Manage platform operations</p>
        </div>

        <Tabs defaultValue="scrims">
          <TabsList className="bg-zinc-900">
            <TabsTrigger value="scrims">Manage Scrims</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          </TabsList>

          <TabsContent value="scrims" className="space-y-6">
            <CreateScrimCard />
            <ScrimsList />
          </TabsContent>

          <TabsContent value="withdrawals">
            <WithdrawalsList />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function CreateScrimCard() {
  const { mutate, isPending } = useCreateScrim();
  const form = useForm<InsertScrim>({
    resolver: zodResolver(insertScrimSchema),
    defaultValues: {
      title: "",
      map: "Erangel",
      type: "SQUAD",
      entryFee: 0,
      prizePool: 0,
      totalSlots: 20,
      matchDate: new Date().toISOString(),
    }
  });

  const onSubmit = (data: InsertScrim) => {
    mutate(data, {
      onSuccess: () => form.reset()
    });
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/20">
      <CardHeader>
        <CardTitle>Create New Scrim</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl><Input placeholder="Daily T3 Scrims #1" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="matchDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date & Time (ISO)</FormLabel>
                    <FormControl><Input type="datetime-local" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="map"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Map</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select Map" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {["Erangel", "Miramar", "Sanhok", "Livik"].map(m => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {["SOLO", "DUO", "SQUAD"].map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="entryFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entry Fee</FormLabel>
                    <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="prizePool"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prize Pool</FormLabel>
                    <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalSlots"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Slots</FormLabel>
                    <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Scrim"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function ScrimsList() {
  const { data: scrims, isLoading } = useQuery({
    queryKey: [api.scrims.list.path],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(api.scrims.list.path, { headers });
      return await res.json() as Scrim[];
    }
  });

  // Mock update logic for Room ID/Pass
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateScrim = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`/api/scrims/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.scrims.list.path] });
      toast({ title: "Updated" });
    }
  });

  if (isLoading) return <Loader2 className="animate-spin" />;

  return (
    <div className="space-y-4">
      {scrims?.map(scrim => (
        <Card key={scrim.id} className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between border-zinc-800 bg-zinc-900/10">
          <div>
            <h4 className="font-bold">{scrim.title}</h4>
            <div className="flex gap-2 text-sm text-zinc-500">
              <span>{scrim.map}</span>
              <span>•</span>
              <span>{scrim.type}</span>
              <span>•</span>
              <span>{scrim.filledSlots}/{scrim.totalSlots}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const id = prompt("Room ID:");
                const pass = prompt("Room Password:");
                if (id && pass) updateScrim.mutate({ id: scrim.id, roomId: id, roomPassword: pass });
              }}
            >
              Set Room ID
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                if (confirm("End match?")) updateScrim.mutate({ id: scrim.id, status: "COMPLETED" });
              }}
            >
              End Match
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function WithdrawalsList() {
  const { data: withdrawals, isLoading } = useQuery({
    queryKey: [api.admin.withdrawals.path],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(api.admin.withdrawals.path, { headers });
      return await res.json() as (Withdrawal & { user: { username: string, email: string } })[];
    }
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const processMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: "APPROVED" | "REJECTED" }) => {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(api.admin.processWithdrawal.path.replace(":id", id), {
        method: "POST",
        headers,
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.withdrawals.path] });
      toast({ title: "Processed" });
    }
  });

  if (isLoading) return <Loader2 className="animate-spin" />;

  return (
    <div className="space-y-4">
      {withdrawals && withdrawals?.map(w => (
        <div key={w.id} className="flex items-center justify-between p-4 rounded-lg border border-zinc-800 bg-zinc-900/20">
          <div>
            <div className="font-bold flex items-center gap-2">
              <span>{w.amount} Coins</span>
              <span className="text-zinc-500 font-normal">by {w.user.username}</span>
            </div>
            <div className="text-sm text-zinc-400">UPI: {w.upiId}</div>
          </div>
          <div className="flex items-center gap-2">
            {w.status === "PENDING" ? (
              <>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => processMutation.mutate({ id: w.id, status: "APPROVED" })}
                  disabled={processMutation.isPending}
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => processMutation.mutate({ id: w.id, status: "REJECTED" })}
                  disabled={processMutation.isPending}
                >
                  <X className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Badge variant={w.status === "APPROVED" ? "default" : "destructive"}>
                {w.status}
              </Badge>
            )}
          </div>
        </div>
      ))}
      {withdrawals?.length === 0 && <p className="text-center text-zinc-500">No pending withdrawals.</p>}
    </div>
  );
}
