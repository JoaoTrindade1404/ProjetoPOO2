import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import GameCard from "@/components/GameCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useGames } from "@/contexts/GamesContext";
import { FILTER_CATEGORIES } from "@/constants/categories";

const Index = () => {
  const { selectedCategory, setSelectedCategory, filteredGames, loading } = useGames();
  
  const displayGames = filteredGames;

  const categories = FILTER_CATEGORIES;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-12">
        <HeroSection />
        

        {/* Categorias */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">
            Explorar por <span className="text-gradient">Categoria</span>
          </h2>
          
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={category === selectedCategory ? "default" : "outline"}
                className={
                  category === selectedCategory
                    ? "gradient-primary cursor-pointer px-6 py-2 text-base"
                    : "cursor-pointer hover:border-primary hover:text-primary transition-colors px-6 py-2 text-base"
                }
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </section>

        {/* Jogos em Destaque */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">
            Em <span className="text-gradient">Destaque</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Carregando jogos...</p>
              </div>
            ) : displayGames.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">
                  {selectedCategory === "Todos" 
                    ? "Nenhum jogo encontrado. Adicione jogos em /add-game" 
                    : "Nenhum jogo encontrado nesta categoria."}
                </p>
              </div>
            ) : (
              displayGames.map((game) => (
                <GameCard key={game.id} {...game} />
              ))
            )}
          </div>
        </section>

        {/* Footer Info */}
        <section className="glass-card rounded-xl p-8 text-center space-y-4">
          <h3 className="text-2xl font-bold text-gradient">
            Junte-se a milhões de jogadores
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Descubra novos mundos, conecte-se com amigos e explore uma biblioteca 
            com milhares de jogos incríveis. Sua próxima aventura começa aqui.
          </p>
        </section>
      </main>
    </div>
  );
};

export default Index;
