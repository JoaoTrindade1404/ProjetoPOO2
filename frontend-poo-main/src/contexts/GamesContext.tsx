import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Game } from '@/types/game';
import { jogoAPI, Jogo } from '@/services/springboot-api';
import { validateCompleteImageUrl } from '@/utils/imageValidation';
import game1 from "@/assets/game1.jpg";
import game2 from "@/assets/game2.jpg";
import game3 from "@/assets/game3.jpg";
import game4 from "@/assets/game4.jpg";
import game5 from "@/assets/game5.jpg";
import game6 from "@/assets/game6.jpg";

interface GamesContextType {
  games: Game[];
  addGame: (game: Game) => void;
  deleteGame: (gameId: number) => Promise<void>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  filteredGames: Game[];
  loading: boolean;
  refreshGames: () => Promise<void>;
}

const GamesContext = createContext<GamesContextType | undefined>(undefined);

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
    description: jogo.descricao,
    releaseDate: jogo.dataLancamento,
  };
};

export const GamesProvider = ({ children }: { children: ReactNode }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [loading, setLoading] = useState(true);

  const fetchGames = async () => {
    console.log('🎮 GamesContext.fetchGames - Fetching games from API');
    try {
      setLoading(true);
      const jogos = await jogoAPI.getAll();
      const gamesData = jogos.map((jogo, index) => convertJogoToGame(jogo, index));
      setGames(gamesData);
      console.log('✅ GamesContext.fetchGames - Loaded', gamesData.length, 'games');
    } catch (error) {
      console.error('❌ GamesContext.fetchGames - Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🎮 GamesContext.useEffect - Component mounted, fetching games');
    fetchGames();
  }, []);

  const addGame = async (game: Game) => {
    console.log('➕ GamesContext.addGame - Adding game:', game.title);
    try {
      let validImageUrl: string | undefined = undefined;
      
      if (game.image) {
        try {
          const validation = await validateCompleteImageUrl(game.image);
          if (validation.isValid) {
            validImageUrl = game.image;
            console.log('✅ GamesContext.addGame - Image URL validated successfully');
          } else {
            console.log('❌ GamesContext.addGame - Image URL validation failed:', validation.error);
          }
        } catch (error) {
          console.log('❌ GamesContext.addGame - Image validation error:', error);
        }
      }

      const novoJogo: Omit<Jogo, 'id'> = {
        nome: game.title,
        gender: game.tags && game.tags.length > 0 ? game.tags.join(', ') : '',
        preco: game.price || 0,
        descricao: game.description || '',
        imagemUrl: validImageUrl || '',
        avaliacao: game.rating || 0,
      };
      
      console.log('📤 GamesContext.addGame - Sending to API:', novoJogo);
      const jogoCreated = await jogoAPI.create(novoJogo);
      console.log('📥 GamesContext.addGame - API response:', jogoCreated);
      
      const gameCreated = convertJogoToGame(jogoCreated, games.length);
      setGames(prev => [...prev, gameCreated]);
      console.log('✅ GamesContext.addGame - Game added successfully');
    } catch (error) {
      console.error('❌ GamesContext.addGame - Error:', error);
      throw error;
    }
  };

  const deleteGame = async (gameId: number) => {
    console.log('🗑️ GamesContext.deleteGame - Deleting game:', gameId);
    try {
      await jogoAPI.delete(gameId);
      setGames(prev => prev.filter(game => game.id !== gameId));
      console.log('✅ GamesContext.deleteGame - Game deleted successfully');
    } catch (error) {
      console.error('❌ GamesContext.deleteGame - Error:', error);
      throw error;
    }
  };

  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         game.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "Todos" || game.tags.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <GamesContext.Provider value={{ 
      games, 
      addGame, 
      deleteGame,
      searchQuery, 
      setSearchQuery,
      selectedCategory,
      setSelectedCategory,
      filteredGames,
      loading,
      refreshGames: fetchGames
    }}>
      {children}
    </GamesContext.Provider>
  );
};

export const useGames = () => {
  const context = useContext(GamesContext);
  if (!context) {
    throw new Error('useGames must be used within GamesProvider');
  }
  return context;
};
