import { type Scrim } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Trophy, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { useJoinScrim } from "@/hooks/use-scrims";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

interface ScrimCardProps {
  scrim: Scrim;
}

const MAP_IMAGES: Record<string, string> = {
  Erangel: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
  Miramar: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&q=80",
  Sanhok: "https://images.unsplash.com/photo-1596726884639-65913217b703?w=800&q=80",
  Livik: "https://images.unsplash.com/photo-1518176258769-f227c798150e?w=800&q=80",
};

export function ScrimCard({ scrim }: ScrimCardProps) {
  const join = useJoinScrim();
  const { user } = useAuth();

  const isFull = scrim.filledSlots >= scrim.totalSlots;
  const isCompleted = scrim.status === "COMPLETED";
  const canJoin = user && !isFull && !isCompleted && user.coins >= scrim.entryFee;

  const handleJoin = () => {
    if (!user) return;
    if (confirm(`Join this scrim for ${scrim.entryFee} coins?`)) {
      join.mutate(scrim.id);
    }
  };

  return (
    <Card className="gaming-card group border-zinc-800 bg-zinc-900/40 overflow-hidden flex flex-col h-full">
      <div className="h-32 w-full relative overflow-hidden">
        {/* Descriptive alt text for accessibility */}
        {/* Map environment background */}
        <img
          src={MAP_IMAGES[scrim.map] || MAP_IMAGES["Erangel"]}
          alt={`${scrim.map} map`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute top-3 left-3">
          <Badge variant="outline" className="bg-background/50 backdrop-blur border-primary/50 text-primary font-bold">
            {scrim.type}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge
            variant={scrim.status === 'OPEN' ? 'default' : 'secondary'}
            className={`${scrim.status === 'OPEN' ? 'bg-green-500 hover:bg-green-600' : ''}`}
          >
            {scrim.status}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-2 pt-4">
        <div className="flex justify-between items-start">
          <h3 className="font-display font-bold text-lg leading-tight truncate pr-2">{scrim.title}</h3>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 flex-1">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-zinc-400">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{scrim.map}</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{format(new Date(scrim.matchDate), "MMM d, h:mm a")}</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-500 font-bold">{scrim.prizePool} Coins</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <Users className="w-4 h-4 text-primary" />
            <span>{scrim.filledSlots}/{scrim.totalSlots} Slots</span>
          </div>
        </div>

        <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-500"
            style={{ width: `${(scrim.filledSlots / scrim.totalSlots) * 100}%` }}
          />
        </div>
      </CardContent>

      <CardFooter className="pt-2">
        {user ? (
          <Button
            className="w-full font-bold"
            variant={canJoin ? "default" : "secondary"}
            disabled={!canJoin || join.isPending}
            onClick={handleJoin}
          >
            {join.isPending ? (
              "Joining..."
            ) : isFull ? (
              "Full"
            ) : isCompleted ? (
              "Ended"
            ) : user.coins < scrim.entryFee ? (
              `Need ${scrim.entryFee - user.coins} more coins`
            ) : (
              `Join • ${scrim.entryFee} Coins`
            )}
          </Button>
        ) : (
          <Link href="/auth" className="w-full">
            <Button variant="secondary" className="w-full">Login to Join</Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
