import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Upload, Image as ImageIcon, Link2, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { GAME_CATEGORIES } from "@/constants/categories";
import { jogoAPI } from "@/services/springboot-api";
import { handleApiError } from "@/utils/errorHandler";

const EditGame = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  const categories = GAME_CATEGORIES;
  
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    rating: "",
    category: "",
    image: "",
  });

  const [imagePreviewError, setImagePreviewError] = useState(false);
  const [imagePreviewLoading, setImagePreviewLoading] = useState(false);

  useEffect(() => {
    const fetchGame = async () => {
      if (!id) return;
      
      try {
        const game = await jogoAPI.getById(parseInt(id));
        setFormData({
          title: game.nome,
          price: game.preco.toString(),
          rating: game.avaliacao?.toString() || "",
          category: game.gender || "",
          image: game.imagemUrl || "",
        });
      } catch (error) {
        handleApiError(error, "Erro ao carregar jogo");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [id, navigate]);

  const handleImageUrlChange = (url: string) => {
    setFormData({...formData, image: url});
    setImagePreviewError(false);
    
    if (url) {
      setImagePreviewLoading(true);
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

  const isValidUrl = (url: string) => {
    if (!url) return null;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.price || !formData.category) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios (título, preço e categoria)",
        variant: "destructive",
      });
      return;
    }

    if (formData.image && !isValidUrl(formData.image)) {
      toast({
        title: "Erro",
        description: "A URL da imagem não é válida",
        variant: "destructive",
      });
      return;
    }

    const price = parseFloat(formData.price);

    try {
      await jogoAPI.update(parseInt(id!), {
        nome: formData.title,
        preco: price,
        avaliacao: formData.rating ? parseFloat(formData.rating) : 0,
        gender: formData.category,
        imagemUrl: formData.image,
      });
      
      toast({
        title: "Sucesso!",
        description: "Jogo atualizado com sucesso",
      });
      
      navigate("/");
    } catch (error) {
      handleApiError(error, "Erro ao atualizar jogo");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Button 
            variant="ghost" 
            className="mb-4 pl-0 hover:pl-2 transition-all"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>

          <h1 className="text-3xl font-bold mb-8">
            Editar <span className="text-gradient">Jogo</span>
          </h1>
          
          <Card className="glass-card p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label>Título do Jogo *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Nome do jogo"
                  className="bg-secondary/50"
                  required
                />
              </div>

              <div>
                <Label>Preço (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="99.90"
                  className="bg-secondary/50"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Categoria *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger className="bg-secondary/50">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Avaliação (0-10)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={formData.rating}
                    onChange={(e) => setFormData({...formData, rating: e.target.value})}
                    placeholder="9.5"
                    className="bg-secondary/50"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  URL da Imagem do Jogo
                </Label>
                
                <div className="relative">
                  <Input
                    value={formData.image}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    placeholder="https://exemplo.com/imagem.jpg"
                    className="bg-secondary/50 pr-10"
                  />
                  {formData.image && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isValidUrl(formData.image) === true ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : isValidUrl(formData.image) === false ? (
                        <XCircle className="h-4 w-4 text-destructive" />
                      ) : null}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1">
                    <Link2 className="h-3 w-3" />
                    Cole a URL completa da imagem (JPG, PNG, WebP, etc.)
                  </p>
                  <details className="cursor-pointer">
                    <summary className="hover:text-foreground transition-colors">
                      Ver exemplos de URLs que funcionam
                    </summary>
                    <div className="mt-2 pl-4 space-y-1 text-[10px] font-mono bg-secondary/30 p-2 rounded">
                      <div>• https://exemplo.com/jogo.jpg</div>
                      <div>• https://images.unsplash.com/photo-...</div>
                      <div>• https://imgur.com/abc123.png</div>
                    </div>
                  </details>
                  {!formData.image && (
                    <p className="text-yellow-500/80">
                      ⚠️ Deixe em branco para usar uma imagem padrão
                    </p>
                  )}
                </div>

                {/* Preview da Imagem */}
                {formData.image && isValidUrl(formData.image) && (
                  <div className="border border-border rounded-lg p-4 bg-secondary/20">
                    <Label className="text-xs text-muted-foreground mb-2 block">Preview:</Label>
                    <div className="relative w-full aspect-video max-w-md mx-auto rounded-lg overflow-hidden bg-secondary/50">
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
                          src={formData.image}
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

              <div className="flex gap-4">
                <Button type="submit" className="flex-1 gradient-primary">
                  <Upload className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/")}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default EditGame;
