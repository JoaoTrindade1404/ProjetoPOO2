export interface Game {
  id: number;
  title: string;
  image: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  tags: string[];
  description?: string;
  releaseDate?: string;
}
