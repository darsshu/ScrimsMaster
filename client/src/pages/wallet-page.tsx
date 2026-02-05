import { Layout } from "@/components/layout";
import { useWallet, useTransactions, useDeposit, useWithdraw } from "@/hooks/use-wallet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertWithdrawalSchema } from "@shared/schema";
import { format } from "date-fns";
import { useState } from "react";

export default function WalletPage() {
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: transactions, isLoading: txLoading } = useTransactions();

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold">My Wallet</h1>
          <p className="text-zinc-400 mt-1">Manage your funds and transactions</p>
        </div>

        {/* Balance Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 bg-gradient-to-br from-zinc-900 to-black border-zinc-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
            <CardHeader>
              <CardTitle className="text-zinc-400 font-medium text-sm uppercase tracking-wider">Available Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-black font-display text-white">
                  {walletLoading ? "..." : wallet?.coins.toLocaleString()}
                </span>
                <span className="text-primary font-bold">Coins</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <DepositDialog />
                <WithdrawDialog maxAmount={wallet?.coins || 0} />
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="md:col-span-2 border-zinc-800 bg-zinc-900/20">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              {txLoading ? (
                <div className="text-zinc-500 text-sm">Loading...</div>
              ) : transactions?.length === 0 ? (
                <div className="text-zinc-500 text-sm py-8 text-center">No transactions yet</div>
              ) : (
                <div className="space-y-4">
                  {transactions?.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.type === 'ADD' || tx.type === 'WIN' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {tx.type === 'ADD' || tx.type === 'WIN' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{tx.type} COINS</p>
                          <p className="text-xs text-zinc-500">{format(new Date(tx.date), "MMM d, h:mm a")}</p>
                        </div>
                      </div>
                      <div className={`font-mono font-bold ${
                        tx.type === 'ADD' || tx.type === 'WIN' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {tx.type === 'ADD' || tx.type === 'WIN' ? '+' : '-'}{tx.amount}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

function DepositDialog() {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useDeposit();
  const [amount, setAmount] = useState(100);

  const handleDeposit = () => {
    // Mock Razorpay flow
    mutate({ amount, paymentId: `pay_${Date.now()}` }, {
      onSuccess: () => setOpen(false)
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-green-600 hover:bg-green-700">Add Money</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Coins to Wallet</DialogTitle>
          <DialogDescription>1 Coin = 1 Rupee. Payment is secured by Razorpay (Test Mode).</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-3 gap-2">
            {[100, 200, 500].map((val) => (
              <Button 
                key={val} 
                variant={amount === val ? "default" : "outline"}
                onClick={() => setAmount(val)}
                className="font-mono"
              >
                ₹{val}
              </Button>
            ))}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Custom Amount</label>
            <Input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(Number(e.target.value))}
              className="font-mono text-lg"
            />
          </div>
          <Button onClick={handleDeposit} className="w-full font-bold" disabled={isPending}>
            {isPending ? "Processing..." : `Pay ₹${amount}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function WithdrawDialog({ maxAmount }: { maxAmount: number }) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useWithdraw();

  const form = useForm({
    resolver: zodResolver(insertWithdrawalSchema),
    defaultValues: { amount: 100, upiId: "" }
  });

  const onSubmit = (data: any) => {
    mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800">Withdraw</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw Winnings</DialogTitle>
          <DialogDescription>Minimum withdrawal is 50 Coins. Amount will be sent to your UPI ID.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (Max: {maxAmount})</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={e => field.onChange(Number(e.target.value))}
                      max={maxAmount}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="upiId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>UPI ID</FormLabel>
                  <FormControl>
                    <Input placeholder="username@upi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full font-bold" disabled={isPending}>
              {isPending ? "Submitting..." : "Withdraw Funds"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
