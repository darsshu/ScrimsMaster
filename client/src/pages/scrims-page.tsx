import { Layout } from "@/components/layout";
import { useScrims } from "@/hooks/use-scrims";
import { ScrimCard } from "@/components/scrim-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Loader2 } from "lucide-react";
import { useState } from "react";

export default function ScrimsPage() {
  const { data: scrims, isLoading } = useScrims();
  const [search, setSearch] = useState("");
  const [mapFilter, setMapFilter] = useState("ALL");

  const filteredScrims = scrims?.filter(scrim => {
    const matchesSearch = scrim.title.toLowerCase().includes(search.toLowerCase());
    const matchesMap = mapFilter === "ALL" || scrim.map === mapFilter;
    return matchesSearch && matchesMap;
  });

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Live Scrims</h1>
            <p className="text-zinc-400 mt-1">Join upcoming matches and prove your skills</p>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input 
                placeholder="Search tournaments..." 
                className="pl-9 bg-zinc-900 border-zinc-800"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={mapFilter} onValueChange={setMapFilter}>
              <SelectTrigger className="w-[140px] bg-zinc-900 border-zinc-800">
                <Filter className="w-4 h-4 mr-2 text-zinc-500" />
                <SelectValue placeholder="Map" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Maps</SelectItem>
                <SelectItem value="Erangel">Erangel</SelectItem>
                <SelectItem value="Miramar">Miramar</SelectItem>
                <SelectItem value="Sanhok">Sanhok</SelectItem>
                <SelectItem value="Livik">Livik</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredScrims?.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/30 rounded-2xl border border-zinc-800 border-dashed">
            <h3 className="text-xl font-bold text-zinc-400">No scrims found</h3>
            <p className="text-zinc-500">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScrims?.map((scrim) => (
              <ScrimCard key={scrim.id} scrim={scrim} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
