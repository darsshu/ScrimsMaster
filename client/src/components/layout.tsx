import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  Gamepad2, 
  Wallet, 
  User, 
  LogOut, 
  LayoutDashboard, 
  Menu,
  Trophy,
  ShieldAlert
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { UserRole } from "@shared/schema";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const isAdmin = user?.role === UserRole.ADMIN;

  const NavLink = ({ href, icon: Icon, children }: { href: string; icon: any; children: React.ReactNode }) => {
    const isActive = location === href;
    return (
      <Link href={href}>
        <div 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
            isActive 
              ? "bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20" 
              : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
          }`}
          onClick={() => setIsOpen(false)}
        >
          <Icon className="w-5 h-5" />
          <span>{children}</span>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-zinc-800 bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-8 h-8 text-primary animate-pulse" />
          <span className="font-display font-bold text-xl tracking-wider">SCRIMS<span className="text-primary">MASTER</span></span>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-card border-r-zinc-800 w-3/4 max-w-sm p-0">
            <div className="p-6 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-8">
                <Gamepad2 className="w-8 h-8 text-primary" />
                <span className="font-display font-bold text-xl">SCRIMS<span className="text-primary">MASTER</span></span>
              </div>
              
              <nav className="flex-1 space-y-2">
                <NavLink href="/" icon={LayoutDashboard}>Home</NavLink>
                <NavLink href="/scrims" icon={Trophy}>Scrims</NavLink>
                {user && <NavLink href="/dashboard" icon={User}>Dashboard</NavLink>}
                {user && <NavLink href="/wallet" icon={Wallet}>Wallet</NavLink>}
                {isAdmin && <NavLink href="/admin" icon={ShieldAlert}>Admin</NavLink>}
              </nav>

              <div className="mt-auto pt-6 border-t border-zinc-800">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 px-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-primary font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{user.username}</p>
                        <p className="text-xs text-zinc-500">{user.email}</p>
                      </div>
                    </div>
                    <Button 
                      variant="destructive" 
                      className="w-full justify-start gap-3" 
                      onClick={() => logout.mutate()}
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Link href="/auth">
                    <Button className="w-full bg-primary hover:bg-primary/90">Login / Register</Button>
                  </Link>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-zinc-800 bg-card/50 backdrop-blur-sm sticky top-0 h-screen p-6">
        <div className="flex items-center gap-2 mb-10">
          <Gamepad2 className="w-8 h-8 text-primary" />
          <span className="font-display font-bold text-xl tracking-wider">SCRIMS<span className="text-primary">MSTR</span></span>
        </div>

        <nav className="flex-1 space-y-2">
          <NavLink href="/" icon={LayoutDashboard}>Home</NavLink>
          <NavLink href="/scrims" icon={Trophy}>Scrims</NavLink>
          {user && <NavLink href="/dashboard" icon={User}>Dashboard</NavLink>}
          {user && <NavLink href="/wallet" icon={Wallet}>Wallet</NavLink>}
          {isAdmin && <NavLink href="/admin" icon={ShieldAlert}>Admin</NavLink>}
        </nav>

        <div className="mt-auto">
          {user ? (
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold shadow-inner">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-sm truncate">{user.username}</p>
                  <p className="text-xs text-primary font-medium">{user.coins} Coins</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-950/30" 
                onClick={() => logout.mutate()}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          ) : (
            <Link href="/auth">
              <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/25">
                Login / Register
              </Button>
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-background to-background">
        <div className="container mx-auto p-4 md:p-8 max-w-7xl animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
