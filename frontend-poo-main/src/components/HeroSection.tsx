import { Button } from "@/components/ui/button";
import { Play, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { useGames } from "@/contexts/GamesContext";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import heroImage from "@/assets/hero-game.jpg";

const HeroSection = () => {
  const { games } = useGames();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  const latestGames = games
    .slice()
    .sort((a, b) => b.id - a.id)
    .slice(0, 8);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const currentGame = latestGames.length > 0 ? latestGames[currentSlide] : null;
  const currentImage = currentGame?.image || heroImage;

  useEffect(() => {
    if (!isAutoPlaying || latestGames.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % latestGames.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, latestGames.length]);

  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const goToPrevious = () => {
    const newIndex = currentSlide === 0 ? latestGames.length - 1 : currentSlide - 1;
    goToSlide(newIndex);
  };

  const goToNext = () => {
    const newIndex = (currentSlide + 1) % latestGames.length;
    goToSlide(newIndex);
  };

  const handleAddToCart = () => {
    if (currentGame) {
      addToCart(currentGame);
    }
  };

  const handleViewGame = () => {
    if (currentGame) {
      navigate(`/game/${currentGame.id}`);
    }
  };

  return (
    <section 
      className="relative h-[600px] overflow-hidden rounded-xl group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Imagem de fundo com transição */}
      <div className="absolute inset-0">
        <div className="relative w-full h-full">
          <img 
            key={currentSlide}
            src={currentImage} 
            alt={currentGame?.title || "Hero Game"}
            className="w-full h-full object-cover transition-all duration-1000 ease-in-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
        </div>
      </div>

      {/* Controles de navegação */}
      {latestGames.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/20 backdrop-blur-sm border border-white/20 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-background/40"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/20 backdrop-blur-sm border border-white/20 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-background/40"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
        </>
      )}
      
      {/* Conteúdo principal */}
      <div className="relative h-full container mx-auto px-4 flex items-center">
        <div className="max-w-2xl space-y-6 animate-fade-in-up">
          <div className="inline-block">
            <span className="text-sm uppercase tracking-wider text-primary font-semibold bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
              {currentGame ? '🎮 Jogo em Destaque' : '🔥 Lançamento da Semana'}
            </span>
          </div>
          
          <h2 className="text-6xl font-bold leading-tight">
            {currentGame ? (
              <>
                {currentGame.title.split(' ').slice(0, -1).join(' ')}{' '}
                <span className="text-gradient">
                  {currentGame.title.split(' ').slice(-1)[0]}
                </span>
              </>
            ) : (
              <>
                Cyberpunk <span className="text-gradient">2088</span>
              </>
            )}
          </h2>
          
          <p className="text-xl text-muted-foreground">
            {currentGame?.description || 
             "Explore uma megalópole futurista onde tecnologia e humanidade se fundem. Seu destino está em suas mãos neste RPG de mundo aberto revolucionário."}
          </p>
          
          <div className="flex items-center gap-4">
            <Button 
              size="lg" 
              className="gradient-primary text-lg px-8 animate-glow-pulse"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Comprar Agora - R$ {currentGame?.price.toFixed(2) || '149,90'}
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-primary/20 bg-background/50 backdrop-blur-sm"
              onClick={handleViewGame}
            >
              <Play className="mr-2 h-5 w-5" />
              Ver Detalhes
            </Button>
          </div>
          
          <div className="flex items-center gap-6 pt-4">
            <div>
              <div className="text-sm text-muted-foreground">Avaliação</div>
              <div className="text-2xl font-bold text-primary">
                {currentGame?.rating.toFixed(1) || '9.5'}/10
              </div>
            </div>
            <div className="h-12 w-px bg-border" />
            <div>
              <div className="text-sm text-muted-foreground">Categoria</div>
              <div className="text-2xl font-bold text-secondary-glow">
                {currentGame?.tags[0] || 'RPG'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Indicadores de slide */}
      {latestGames.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {latestGames.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-primary scale-125' 
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      )}

      {/* Contador de slides */}
      {latestGames.length > 1 && (
        <div className="absolute top-6 right-6 bg-background/20 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1 text-sm text-white">
          {currentSlide + 1} / {latestGames.length}
        </div>
      )}
    </section>
  );
};

export default HeroSection;
