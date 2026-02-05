import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertScrim, type Scrim } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useScrims() {
  return useQuery({
    queryKey: [api.scrims.list.path],
    queryFn: async () => {
      const res = await fetch(api.scrims.list.path);
      if (!res.ok) throw new Error("Failed to fetch scrims");
      return api.scrims.list.responses[200].parse(await res.json());
    },
  });
}

export function useScrim(id: string) {
  return useQuery({
    queryKey: [api.scrims.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.scrims.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch scrim");
      return api.scrims.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateScrim() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertScrim) => {
      const res = await fetch(api.scrims.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create scrim");
      return api.scrims.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.scrims.list.path] });
      toast({ title: "Success", description: "Scrim created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useJoinScrim() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const url = buildUrl(api.scrims.join.path, { id });
      const res = await fetch(url, { method: "POST" });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to join scrim");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.scrims.list.path] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] }); // Update balance
      toast({ title: "Joined!", description: "Slot confirmed. Good luck!" });
    },
    onError: (error: Error) => {
      toast({ title: "Join Failed", description: error.message, variant: "destructive" });
    },
  });
}
