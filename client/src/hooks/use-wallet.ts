import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertWithdrawal } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useWallet() {
  return useQuery({
    queryKey: ["/api/wallet"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(api.wallet.balance.path, { headers });
      if (!res.ok) throw new Error("Failed to fetch balance");
      return await res.json();
    },
  });
}

export function useTransactions() {
  return useQuery({
    queryKey: ["/api/wallet/transactions"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(api.wallet.transactions.path, { headers });
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return await res.json();
    },
  });
}

export function useDeposit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ amount, paymentId }: { amount: number; paymentId: string }) => {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(api.wallet.deposit.path, {
        method: "POST",
        headers,
        body: JSON.stringify({ amount, paymentId }),
      });
      if (!res.ok) throw new Error("Deposit failed");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });
      toast({ title: "Deposit Successful", description: "Coins added to your wallet" });
    },
  });
}

export function useWithdraw() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertWithdrawal) => {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(api.wallet.withdraw.path, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Withdrawal request failed");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });
      toast({ title: "Request Sent", description: "Withdrawal request submitted for approval" });
    },
  });
}
