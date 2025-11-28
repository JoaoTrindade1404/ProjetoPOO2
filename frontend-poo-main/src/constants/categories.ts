/**
 * Categorias de jogos disponíveis na aplicação
 * Este arquivo centraliza todas as categorias para evitar duplicação
 */
export const GAME_CATEGORIES = [
  "Ação",
  "Aventura", 
  "RPG",
  "Estratégia",
  "Terror",
  "Corrida",
  "Esportes",
  "Puzzle",
  "Simulação",
  "Indie",
  "Multiplayer",
  "Casual"
] as const;

/**
 * Categorias para filtragem na loja (inclui "Todos")
 */
export const FILTER_CATEGORIES = [
  "Todos",
  ...GAME_CATEGORIES
] as const;

export type GameCategory = typeof GAME_CATEGORIES[number];
export type FilterCategory = typeof FILTER_CATEGORIES[number];
