import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Play, Download, Search, Filter, Clock, Star, RefreshCw } from "lucide-react";
import { useLibrary } from "@/contexts/LibraryContext";
import { useState } from "react";

const Library = () => {
  const { libraryGames, loading, refreshLibrary } = useLibrary();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGames = libraryGames.filter(game =>
    game.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPlayTime = filteredGames.length * 30; // Mock: 30 horas por jogo
  const installedGames = filteredGames.length; // Mock: todos instalados
  const playedToday = Math.min(2, filteredGames.length); // Mock: até 2 jogos
  const totalAchievements = filteredGames.length * 50; // Mock: 50 conquistas por jogo

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Sua <span className="text-gradient">Biblioteca</span>
              </h1>
              <p className="text-muted-foreground">
                {filteredGames.length} jogos • {totalPlayTime} horas jogadas
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar na biblioteca..." 
                  className="pl-10 w-64 bg-secondary/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={refreshLibrary}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glass-card p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
                  <Play className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{totalPlayTime}h</div>
                  <div className="text-sm text-muted-foreground">Tempo Total</div>
                </div>
              </div>
            </Card>
            
            <Card className="glass-card p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
                  <Download className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {installedGames}
                  </div>
                  <div className="text-sm text-muted-foreground">Instalados</div>
                </div>
              </div>
            </Card>
            
            <Card className="glass-card p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{playedToday}</div>
                  <div className="text-sm text-muted-foreground">Jogados Hoje</div>
                </div>
              </div>
            </Card>
            
            <Card className="glass-card p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
                  <Star className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{totalAchievements}</div>
                  <div className="text-sm text-muted-foreground">Conquistas</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Games Grid */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">Todos os Jogos</h2>
              <Badge variant="outline">Ordenar por: Recentes</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full text-center py-12">
                  <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Carregando biblioteca...</p>
                </div>
              ) : filteredGames.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-2xl font-bold mb-2">Nenhum jogo encontrado</p>
                  <p className="text-muted-foreground">
                    {searchQuery ? "Tente buscar por outro termo" : "Compre jogos na loja para adicioná-los à sua biblioteca"}
                  </p>
                </div>
              ) : (
                filteredGames.map((game) => (
                  <Card key={game.id} className="glass-card overflow-hidden hover-lift hover-glow group">
                    <div className="relative aspect-video">
                      <div className="relative w-full h-full transition-transform duration-100 group-hover:scale-110">
                        <img 
                          src={game.image} 
                          alt={game.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0" />
                      </div>
                      
                      <Button 
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 gradient-primary opacity-0 group-hover:opacity-100 transition-opacity"
                        size="lg"
                      >
                        <Play className="mr-2 h-5 w-5" />
                        Jogar
                      </Button>
                    </div>
                    
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{game.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {game.tags.join(' • ')}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{game.rating}</span>
                        </div>
                        <Badge variant="outline">R$ {game.price.toFixed(2)}</Badge>
                      </div>
                      
                      <Badge className="w-full justify-center gradient-primary">
                        Instalado
                      </Badge>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Library;
