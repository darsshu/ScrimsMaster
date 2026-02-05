import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Trophy, Target, Shield, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="space-y-16 pb-12">
        {/* Hero Section */}
        <section className="relative min-h-[500px] flex flex-col justify-center items-start rounded-3xl overflow-hidden p-8 md:p-16 border border-zinc-800 shadow-2xl">
          {/* Abstract gaming background */}
          <div className="absolute inset-0 bg-black">
             {/* Descriptive alt: Abstract digital gaming landscape with neon lights */}
             <img 
               src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&q=80" 
               alt="Gaming Background" 
               className="w-full h-full object-cover opacity-20"
             />
             <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
          </div>

          <div className="relative z-10 max-w-2xl space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-6xl font-display font-black leading-tight">
                DOMINATE THE <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">BATTLEGROUND</span>
              </h1>
            </motion.div>
            
            <motion.p 
              className="text-lg md:text-xl text-zinc-400 max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Join daily BGMI scrims, compete with top squads, and win real rewards. The ultimate platform for competitive mobile gamers.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link href={user ? "/scrims" : "/auth"}>
                <Button size="lg" className="text-lg font-bold px-8 h-14 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
                  {user ? "Browse Scrims" : "Start Competing"}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              {!user && (
                <Link href="/auth">
                  <Button size="lg" variant="outline" className="text-lg font-bold px-8 h-14 border-zinc-700 hover:bg-zinc-800">
                    Login Account
                  </Button>
                </Link>
              )}
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard 
            icon={Trophy} 
            title="Daily Tournaments" 
            desc="Compete in Solo, Duo, and Squad matches hosted daily with automated slot management."
          />
          <FeatureCard 
            icon={Target} 
            title="Instant Rewards" 
            desc="Winnings credited directly to your wallet immediately after match results are declared."
          />
          <FeatureCard 
            icon={Shield} 
            title="Secure Payments" 
            desc="Fast deposits and withdrawals with complete transparency and transaction history."
          />
        </section>

        {/* Stats Section */}
        <section className="bg-zinc-900/50 rounded-2xl p-8 md:p-12 border border-zinc-800 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <Stat number="10K+" label="Active Players" />
            <Stat number="500+" label="Daily Matches" />
            <Stat number="₹1M+" label="Prize Pool Won" />
            <Stat number="24/7" label="Support" />
          </div>
        </section>
      </div>
    </Layout>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="p-6 rounded-2xl bg-card border border-zinc-800 hover:border-primary/30 transition-all hover:-translate-y-1">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold mb-2 font-display">{title}</h3>
      <p className="text-zinc-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function Stat({ number, label }: { number: string, label: string }) {
  return (
    <div>
      <div className="text-3xl md:text-4xl font-black text-white font-display mb-1">{number}</div>
      <div className="text-sm text-primary font-bold uppercase tracking-wider">{label}</div>
    </div>
  );
}
