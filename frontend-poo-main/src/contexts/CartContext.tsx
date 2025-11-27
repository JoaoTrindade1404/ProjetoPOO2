import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import { Game } from "@/types/game";
import { toast } from "@/hooks/use-toast";
import { cartAPI, Jogo } from "@/services/springboot-api";
import { useAuth } from "./AuthContext";

interface CartContextType {
  cartItems: Game[];
  addToCart: (game: Game) => Promise<void>;
  removeFromCart: (gameId: number) => Promise<void>;
  clearCart: () => void;
  getTotalItems: () => number;
  loading: boolean;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

import game1 from "@/assets/game1.jpg";
import game2 from "@/assets/game2.jpg";
import game3 from "@/assets/game3.jpg";
import game4 from "@/assets/game4.jpg";
import game5 from "@/assets/game5.jpg";
import game6 from "@/assets/game6.jpg";

const defaultImages = [game1, game2, game3, game4, game5, game6];

const convertJogoToGame = (jogo: Jogo, index: number): Game => {
  const categoriaString = jogo.gender || jogo.categoria || 'Jogo';
  const tags = categoriaString.split(',').map(t => t.trim());
  const imageIndex = jogo.id ? (jogo.id % defaultImages.length) : (index % defaultImages.length);
  const imagemUrl = jogo.imagemUrl || jogo.imagem || jogo.imageURL;
  const isValidImageUrl = imagemUrl && (
    imagemUrl.startsWith('http://') || 
    imagemUrl.startsWith('https://') ||
    imagemUrl.startsWith('/')
  );
  
  return {
    id: jogo.id!,
    title: jogo.nome,
    image: isValidImageUrl ? imagemUrl : defaultImages[imageIndex],
    price: jogo.preco,
    originalPrice: jogo.preco,
    discount: 0,
    rating: jogo.avaliacao || 8.5,
    tags,
  };
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchCart = useCallback(async () => {
    console.log('🛒 CartContext.fetchCart - User:', user?.id);
    if (!user?.id) {
      console.log('❌ CartContext.fetchCart - No user, clearing cart');
      setCartItems([]);
      return;
    }

    try {
      setLoading(true);
      console.log('📡 CartContext.fetchCart - GET /cart/usuario/' + user.id + '/jogos');
      const jogos = await cartAPI.getGames(user.id);
      console.log('✅ CartContext.fetchCart - Cart items from API:', jogos);
      const games = jogos.map((jogo, index) => convertJogoToGame(jogo, index));
      setCartItems(games);
      console.log('🛒 CartContext.fetchCart - Cart loaded with', games.length, 'items');
    } catch (error) {
      console.error('❌ CartContext.fetchCart - Error:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    console.log('🛒 CartContext.useEffect - User changed:', user?.id);
    if (user?.id) {
      fetchCart();
    } else {
      setCartItems([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, fetchCart]);

  const addToCart = useCallback(async (game: Game) => {
    console.log('➕ CartContext.addToCart - Adding game:', game.id, game.title);
    if (!user?.id) {
      console.log('❌ CartContext.addToCart - No user logged in');
      toast({
        title: "Faça login",
        description: "Você precisa estar logado para adicionar jogos ao carrinho.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if game is already in cart (optimistic check)
      // Note: We use the current state 'cartItems' which might be stale in this callback if not added to deps
      // But we can't add cartItems to deps easily without causing re-creation of addToCart on every cart change.
      // Ideally we should check against the latest state inside the setter or trust the backend.
      // For now, let's rely on the backend or check current state via functional update pattern if possible, 
      // but here we need to know *before* calling API.
      // Let's just proceed to API.
      
      setLoading(true);
      console.log('📡 CartContext.addToCart - POST /cart/usuario/' + user.id + '/jogos');
      await cartAPI.addGame(user.id, game.id);
      console.log('✅ CartContext.addToCart - Game added to backend cart');
      
      setCartItems((prev) => {
        const exists = prev.find((item) => item.id === game.id);
        if (exists) return prev;
        return [...prev, game];
      });
      
      toast({
        title: "Jogo adicionado!",
        description: `${game.title} foi adicionado ao carrinho.`,
      });
    } catch (error) {
      console.error('❌ CartContext.addToCart - Error:', error);
      const errorMessage = error instanceof Error ? error.message : "Não foi possível adicionar o jogo ao carrinho.";
      // If error is "Game already in cart" (depending on backend), we could show a different message.
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const removeFromCart = useCallback(async (gameId: number) => {
    console.log('➖ CartContext.removeFromCart - Removing game:', gameId);
    if (!user?.id) return;

    try {
      setLoading(true);
      console.log('📡 CartContext.removeFromCart - DELETE /cart/usuario/' + user.id + '/jogos/' + gameId);
      await cartAPI.removeGame(user.id, gameId);
      console.log('✅ CartContext.removeFromCart - Game removed from backend cart');
      
      setCartItems((prev) => {
        const game = prev.find((item) => item.id === gameId);
        if (game) {
             toast({
              title: "Jogo removido",
              description: `${game.title} foi removido do carrinho.`,
            });
        }
        return prev.filter((item) => item.id !== gameId);
      });
      
    } catch (error) {
      console.error('❌ CartContext.removeFromCart - Error:', error);
      const errorMessage = error instanceof Error ? error.message : "Não foi possível remover o jogo do carrinho.";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const clearCart = useCallback(() => {
    console.log('🗑️ CartContext.clearCart - Clearing local cart');
    setCartItems([]);
  }, []);

  const getTotalItems = useCallback(() => cartItems.length, [cartItems]);

  const value = useMemo(() => ({ 
    cartItems, 
    addToCart, 
    removeFromCart, 
    clearCart, 
    getTotalItems,
    loading,
    refreshCart: fetchCart
  }), [cartItems, addToCart, removeFromCart, clearCart, getTotalItems, loading, fetchCart]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
