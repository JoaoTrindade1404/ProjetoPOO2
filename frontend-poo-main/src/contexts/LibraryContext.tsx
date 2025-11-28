import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Game } from "@/types/game";
import { libraryAPI, Jogo } from "@/services/springboot-api";
import { useAuth } from "./AuthContext";

interface LibraryContextType {
  libraryGames: Game[];
  loading: boolean;
  refreshLibrary: () => Promise<void>;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

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

export const LibraryProvider = ({ children }: { children: ReactNode }) => {
  const [libraryGames, setLibraryGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  /**
   * Busca os jogos da biblioteca do usuário
   */
  const fetchLibrary = async () => {
    if (!user?.id) {
      setLibraryGames([]);
      return;
    }

    try {
      setLoading(true);
      const jogos = await libraryAPI.getGames(user.id);
      const games = jogos.map((jogo, index) => convertJogoToGame(jogo, index));
      setLibraryGames(games);
    } catch (error) {
      console.error('Erro ao buscar biblioteca:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carrega a biblioteca quando o usuário faz login
   */
  useEffect(() => {
    if (user) {
      fetchLibrary();
    } else {
      setLibraryGames([]);
    }
  }, [user]);

  return (
    <LibraryContext.Provider
      value={{ 
        libraryGames, 
        loading,
        refreshLibrary: fetchLibrary
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error("useLibrary must be used within a LibraryProvider");
  }
  return context;
};

