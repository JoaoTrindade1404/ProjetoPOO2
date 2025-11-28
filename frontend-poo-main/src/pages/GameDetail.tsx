import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ShoppingCart, Star, Trash2, AlertTriangle, Edit, Save, X, ImageIcon, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useGames } from "@/contexts/GamesContext";
import { Game } from "@/types/game";
import { jogoAPI, Jogo } from "@/services/springboot-api";
import { useToast } from "@/hooks/use-toast";
import { handleApiError } from "@/utils/errorHandler";
import { GAME_CATEGORIES } from "@/constants/categories";
import { validateCompleteImageUrl, isValidUrl } from "@/utils/imageValidation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const GameDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { games, deleteGame, refreshGames } = useGames();
  const { toast } = useToast();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [editForm, setEditForm] = useState({
    title: '',
    price: '',
    rating: '',
    category: '',
    image: '',
    description: ''
  });

  const [imagePreviewError, setImagePreviewError] = useState(false);
  const [imagePreviewLoading, setImagePreviewLoading] = useState(false);
  const [imageValidation, setImageValidation] = useState<{
    isValidating: boolean;
    isValid: boolean | null;
    error: string | null;
  }>({
    isValidating: false,
    isValid: null,
    error: null
  });

  useEffect(() => {
    const loadGame = async () => {
      if (!id) {
        navigate('/');
        return;
      }

      const gameId = parseInt(id);
      
      const localGame = games.find(g => g.id === gameId);
      if (localGame) {
        setGame(localGame);
        setEditForm({
          title: localGame.title,
          price: localGame.price.toString(),
          rating: localGame.rating.toString(),
          category: localGame.tags[0] || '',
          image: localGame.image,
          description: localGame.description || ''
        });
        setLoading(false);
        return;
      }

      try {
        const jogoData = await jogoAPI.getById(gameId);
        
        const gameData: Game = {
          id: jogoData.id!,
          title: jogoData.nome,
          image: jogoData.imagemUrl || '/placeholder.svg',
          price: jogoData.preco,
          originalPrice: jogoData.preco,
          discount: 0,
          rating: jogoData.avaliacao || 8.5,
          tags: jogoData.gender ? jogoData.gender.split(',').map(t => t.trim()) : ['Jogo'],
          releaseDate: jogoData.dataLancamento,
        };
        
        setGame(gameData);
        setEditForm({
          title: gameData.title,
          price: gameData.price.toString(),
          rating: gameData.rating.toString(),
          category: gameData.tags[0] || '',
          image: gameData.image,
          description: jogoData.descricao || ''
        });
      } catch (error) {
        console.error('Erro ao carregar jogo:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os detalhes do jogo.",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadGame();
  }, [id, games, navigate, toast]);

  const handleAddToCart = () => {
    if (game) {
      addToCart(game);
      toast({
        title: "Sucesso!",
        description: `${game.title} foi adicionado ao carrinho.`,
      });
    }
  };

  
  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await jogoAPI.delete(parseInt(id));
      toast({
        title: "Sucesso",
        description: "Jogo removido com sucesso",
      });
      window.location.reload();
    } catch (error) {
      handleApiError(error, "Erro ao remover jogo");
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      if (game) {
        setEditForm({
          title: game.title,
          price: game.price.toString(),
          rating: game.rating.toString(),
          category: game.tags[0] || '',
          image: game.image,
          description: game.description || ''
        });
      }
    }
    setIsEditing(!isEditing);
  };

  const getUrlValidationIcon = () => {
    if (!editForm.image) return null;
    
    if (imageValidation.isValidating) {
      return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    }
    
    if (imageValidation.isValid === true) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
    
    if (imageValidation.isValid === false) {
      return <XCircle className="h-4 w-4 text-destructive" />;
    }
    
    return null;
  };

  const handleImageUrlChange = async (url: string) => {
    setEditForm(prev => ({ ...prev, image: url }));
    setImagePreviewError(false);
    
    if (!url) {
      setImageValidation({ isValidating: false, isValid: null, error: null });
      return;
    }

    setImageValidation({ isValidating: true, isValid: null, error: null });
    setImagePreviewLoading(true);

    try {
      const validation = await validateCompleteImageUrl(url);
      setImageValidation({
        isValidating: false,
        isValid: validation.isValid,
        error: validation.error || null
      });

      if (!validation.isValid) {
        setImagePreviewError(true);
        setImagePreviewLoading(false);
      }
    } catch (error) {
      setImageValidation({
        isValidating: false,
        isValid: false,
        error: "Erro ao validar imagem"
      });
      setImagePreviewError(true);
      setImagePreviewLoading(false);
    }
  };

  const handleImageLoad = () => {
    setImagePreviewLoading(false);
    setImagePreviewError(false);
  };

  const handleImageError = () => {
    setImagePreviewLoading(false);
    setImagePreviewError(true);
  };

  const handleSaveChanges = async () => {
    if (!game) return;

    setSaving(true);
    try {
      if (!editForm.title || !editForm.price || !editForm.category) {
        toast({
          title: "Erro",
          description: "Preencha todos os campos obrigatórios (título, preço e categoria)",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      if (editForm.image) {
        if (imageValidation.isValidating) {
          toast({
            title: "Aguarde",
            description: "Ainda validando a imagem. Tente novamente em alguns segundos.",
            variant: "destructive",
          });
          setSaving(false);
          return;
        }

        if (imageValidation.isValid === false) {
          toast({
            title: "Erro",
            description: imageValidation.error || "A URL da imagem não é válida ou não pode ser carregada",
            variant: "destructive",
          });
          setSaving(false);
          return;
        }
      }

      const price = parseFloat(editForm.price);
      const rating = editForm.rating ? parseFloat(editForm.rating) : 0;
      const description = editForm.description?.trim() || `Jogo da categoria ${editForm.category}`;

      const updatedJogo: Partial<Jogo> = {
        nome: editForm.title.trim(),
        preco: price,
        avaliacao: rating,
        gender: editForm.category,
        descricao: description
      };

      if (editForm.image && imageValidation.isValid) {
        updatedJogo.imagemUrl = editForm.image;
      }

      console.log('🔧 GameDetail.handleSaveChanges - Form data before processing:', {
        title: editForm.title,
        price: editForm.price,
        rating: editForm.rating,
        category: editForm.category,
        description: editForm.description,
        image: editForm.image
      });

      console.log('🔧 GameDetail.handleSaveChanges - Processed values:', {
        price,
        rating,
        description
      });

      console.log('🔧 GameDetail.handleSaveChanges - Payload being sent:', updatedJogo);

      const response = await jogoAPI.update(game.id, updatedJogo);
      console.log('🔧 GameDetail.handleSaveChanges - Backend response:', response);

      if (response.avaliacao !== rating || response.descricao !== description) {
        console.log('🔄 GameDetail.handleSaveChanges - Backend response incomplete, fetching updated game...');
        
        try {
          const updatedFromBackend = await jogoAPI.getById(game.id);
          console.log('🔧 GameDetail.handleSaveChanges - Fetched from backend:', updatedFromBackend);
          
          const finalResponse = updatedFromBackend;
          
          const updatedGame: Game = {
            ...game,
            title: finalResponse.nome,
            price: finalResponse.preco,
            originalPrice: finalResponse.preco,
            rating: finalResponse.avaliacao || 0,
            tags: finalResponse.gender ? finalResponse.gender.split(',').map(t => t.trim()) : [editForm.category],
            image: finalResponse.imagemUrl || game.image,
            description: finalResponse.descricao || description
          };
          
          setGame(updatedGame);
          setIsEditing(false);
          
          await refreshGames();
          
          toast({
            title: "Sucesso!",
            description: "Jogo atualizado com sucesso.",
          });
          
          return; // Sai da função aqui
        } catch (fetchError) {
          console.error('❌ GameDetail.handleSaveChanges - Error fetching updated game:', fetchError);
        }
      }

      const updatedGame: Game = {
        ...game,
        title: response.nome,
        price: response.preco,
        originalPrice: response.preco,
        rating: response.avaliacao || rating, // Usa o valor enviado se o backend não retornou
        tags: response.gender ? response.gender.split(',').map(t => t.trim()) : [editForm.category],
        image: response.imagemUrl || game.image,
        description: response.descricao || description // Usa o valor enviado se o backend não retornou
      };
      
      setGame(updatedGame);
      setIsEditing(false);
      
      await refreshGames();
      
      toast({
        title: "Sucesso!",
        description: "Jogo atualizado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar jogo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o jogo.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando detalhes do jogo...</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Jogo não encontrado</h1>
          <p className="text-muted-foreground mb-6">O jogo que você está procurando não existe ou foi removido.</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar à página inicial
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header com botão voltar */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4 hover:bg-primary/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Imagem do jogo */}
          <div className="space-y-4">
            <Card className="glass-card overflow-hidden">
              <div className="aspect-square relative">
                {isEditing ? (
                  <div className="p-4 space-y-4">
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        URL da Imagem do Jogo
                      </Label>
                      
                      <div className="relative">
                        <Input
                          value={editForm.image}
                          onChange={(e) => handleImageUrlChange(e.target.value)}
                          placeholder="https://exemplo.com/imagem.jpg"
                          className="bg-secondary/50 pr-10"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {getUrlValidationIcon()}
                        </div>
                      </div>

                      {/* Mensagem de erro de validação */}
                      {imageValidation.error && (
                        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
                          ⚠️ {imageValidation.error}
                        </div>
                      )}

                      {/* Preview da Imagem */}
                      {editForm.image && imageValidation.isValid && (
                        <div className="border border-border rounded-lg p-4 bg-secondary/20">
                          <Label className="text-xs text-muted-foreground mb-2 block">Preview:</Label>
                          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-secondary/50">
                            {imagePreviewLoading && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                              </div>
                            )}
                            {imagePreviewError ? (
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-destructive">
                                <XCircle className="h-12 w-12 mb-2" />
                                <p className="text-sm">Não foi possível carregar a imagem</p>
                                <p className="text-xs text-muted-foreground">Verifique se a URL está correta</p>
                              </div>
                            ) : (
                              <img
                                src={editForm.image}
                                alt="Preview"
                                className="w-full h-full object-cover"
                                onLoad={handleImageLoad}
                                onError={handleImageError}
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <img 
                      src={game.image} 
                      alt={game.title}
                      className="w-full h-full object-cover"
                    />
                    {game.discount > 0 && (
                      <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-lg font-bold">
                        -{game.discount}%
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>
          </div>

          {/* Detalhes do jogo */}
          <div className="space-y-6">
            <div>
              {isEditing ? (
                <Card className="glass-card p-6">
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="title">Título do Jogo *</Label>
                      <Input
                        id="title"
                        value={editForm.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Nome do jogo"
                        className="bg-secondary/50"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="price">Preço (R$) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={editForm.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        placeholder="99.90"
                        className="bg-secondary/50"
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Categoria *</Label>
                        <Select value={editForm.category} onValueChange={(value) => handleInputChange('category', value)}>
                          <SelectTrigger className="bg-secondary/50">
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {GAME_CATEGORIES.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="rating">Avaliação (0-10)</Label>
                        <Input
                          id="rating"
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={editForm.rating}
                          onChange={(e) => handleInputChange('rating', e.target.value)}
                          placeholder="9.5"
                          className="bg-secondary/50"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Descrição do Jogo</Label>
                      <Textarea
                        id="description"
                        value={editForm.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Digite uma descrição detalhada do jogo..."
                        className="bg-secondary/50 min-h-[100px] resize-y"
                        maxLength={1000}
                      />
                      <div className="text-xs text-muted-foreground mt-1 text-right">
                        {editForm.description.length}/1000 caracteres
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                <>
                  <h1 className="text-4xl font-bold mb-4 gradient-text">{game.title}</h1>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="h-5 w-5 fill-current" />
                      <span className="text-lg font-medium">{game.rating}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {game.discount > 0 && (
                        <span className="text-lg text-muted-foreground line-through">
                          R$ {game.originalPrice.toFixed(2)}
                        </span>
                      )}
                      <span className="text-3xl font-bold text-primary">
                        R$ {game.price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {game.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </div>

            <Separator />

            {/* Ações */}
            <div className="space-y-4">
              {!isEditing && (
                <Button 
                  className="w-full gradient-primary text-lg py-6" 
                  size="lg"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Adicionar ao Carrinho
                </Button>
              )}

              <div className="grid grid-cols-1 gap-4">
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      onClick={handleSaveChanges}
                      disabled={saving}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Salvando...' : 'Salvar'}
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={handleEditToggle}
                      disabled={saving}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline"
                      onClick={handleEditToggle}
                      className="border-blue-500 text-blue-500 hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o jogo "{game.title}"? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Informações adicionais - apenas no modo visualização */}
        {!isEditing && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Sobre o Jogo</CardTitle>
            </CardHeader>
            <CardContent>
              {game.description && (
                <div className="mb-6">
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">DESCRIÇÃO</h4>
                  <p className="text-sm text-foreground leading-relaxed">
                    {game.description}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">GÊNEROS</h4>
                  <div className="flex flex-wrap gap-1">
                    {game.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">AVALIAÇÃO</h4>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-medium">{game.rating}/10</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">PREÇO</h4>
                  <div className="flex items-center gap-2">
                    {game.discount > 0 && (
                      <span className="text-sm text-muted-foreground line-through">
                        R$ {game.originalPrice.toFixed(2)}
                      </span>
                    )}
                    <span className="text-lg font-bold text-primary">
                      R$ {game.price.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">LANÇAMENTO</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {game.releaseDate ? (() => {
                        const [year, month, day] = game.releaseDate.split('-');
                        return `${day}/${month}/${year}`;
                      })() : 'Data desconhecida'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GameDetail;
