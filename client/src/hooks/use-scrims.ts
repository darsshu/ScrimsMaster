import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { InsertScrim } from "@shared/schema";

export function useScrims() {
  return useQuery({
    queryKey: [api.scrims.list.path],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(api.scrims.list.path, { headers });
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
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(url, { headers });
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
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(api.scrims.create.path, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create scrim");
      }
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
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(url, { method: "POST", headers });
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
