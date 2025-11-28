import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Game } from "@/types/game";
import { useNavigate } from "react-router-dom";

interface GameCardProps {
  id: number;
  title: string;
  image: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  tags: string[];
  description?: string;
}

const GameCard = ({ id, title, image, price, originalPrice, discount, rating, tags, description }: GameCardProps) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const game: Game = {
      id,
      title,
      image,
      price,
      originalPrice,
      discount,
      rating,
      tags,
      description,
    };
    addToCart(game);
  };

  const handleCardClick = () => {
    navigate(`/game/${id}`);
  };

  return (
    <div 
      className="glass-card rounded-lg overflow-hidden hover-lift hover-glow group cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden aspect-square">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {discount && (
          <div className="absolute top-3 right-3 bg-accent text-accent-foreground px-3 py-1 rounded-lg font-bold">
            -{discount}%
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Button className="w-full gradient-primary" size="sm" onClick={handleAddToCart}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Adicionar ao Carrinho
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 truncate">{title}</h3>
        
        {description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
            {description.length > 100 ? `${description.substring(0, 100)}...` : description}
          </p>
        )}
        
        <div className="flex items-center gap-2 mb-3">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-medium">{rating}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {discount > 0 && (
              <span className="text-sm text-muted-foreground line-through">
                R$ {originalPrice.toFixed(2)}
              </span>
            )}
            <span className="text-lg font-bold text-primary">R$ {price.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
