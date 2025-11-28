import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { comprasAPI, Compra } from "@/services/springboot-api";
import { handleApiError } from "@/utils/errorHandler";
import { Calendar, Package, ShoppingBag, ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
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

const PurchaseHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!user?.id) return;

      try {
        const data = await comprasAPI.getByUser(user.id);
        const sortedData = data.sort((a, b) => {
            const dateA = a.dataCompra ? new Date(a.dataCompra).getTime() : 0;
            const dateB = b.dataCompra ? new Date(b.dataCompra).getTime() : 0;
            return dateB - dateA;
        });
        setPurchases(sortedData);
      } catch (error) {
        handleApiError(error, "Erro ao carregar histórico de compras");
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [user]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Data desconhecida";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            className="mb-4 pl-0 hover:pl-2 transition-all"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Loja
          </Button>

          <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-primary" />
            Histórico de <span className="text-gradient">Compras</span>
          </h1>
          
          {purchases.length === 0 ? (
            <Card className="glass-card p-12 text-center space-y-4">
              <div className="bg-secondary/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold">Nenhuma compra encontrada</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Você ainda não realizou nenhuma compra. Explore nossa loja e encontre jogos incríveis!
              </p>
              <Button onClick={() => navigate("/")} className="mt-4 gradient-primary">
                Explorar Loja
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {purchases.map((purchase) => (
                <Card key={purchase.id} className="glass-card overflow-hidden hover:border-primary/50 transition-colors">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-border/50 pb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {formatDate(purchase.dataCompra)}
                        </div>
                        <p className="text-xs font-mono text-muted-foreground/70">
                          ID do Pedido: #{purchase.id?.toString().padStart(6, '0')}
                        </p>
                      </div>
                      <div className="text-right space-y-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Valor Total</p>
                          <p className="text-2xl font-bold text-primary">
                            R$ {(purchase.valor ?? 0).toFixed(2)}
                          </p>
                        </div>
                        
                        {purchase.reembolsado ? (
                          <div className="flex items-center justify-end text-muted-foreground bg-secondary/20 px-3 py-1.5 rounded-md border border-border/50">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            <span className="text-sm font-medium">Reembolsado</span>
                          </div>
                        ) : (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-destructive border-destructive/50 hover:bg-destructive/10"
                              >
                                <RefreshCw className="h-3 w-3 mr-2" />
                                Reembolsar
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                  <AlertCircle className="h-5 w-5 text-destructive" />
                                  Confirmar Reembolso
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja solicitar o reembolso desta compra?
                                  <br />
                                  <span className="font-medium text-foreground mt-2 block">
                                    Valor a ser devolvido: R$ {(purchase.valor ?? 0).toFixed(2)}
                                  </span>
                                  <span className="text-xs mt-1 block">
                                    Os jogos serão removidos da sua biblioteca e o valor será creditado na sua carteira.
                                  </span>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={async () => {
                                    if (!purchase.id) return;
                                    try {
                                      await comprasAPI.refund(purchase.id);
                                      setPurchases(prev => prev.map(p => 
                                        p.id === purchase.id ? { ...p, reembolsado: true } : p
                                      ));
                                      // Opcional: Atualizar saldo do usuário se houver contexto para isso
                                      window.location.reload(); // Recarrega para atualizar saldo e biblioteca
                                    } catch (error) {
                                      handleApiError(error, "Erro ao solicitar reembolso");
                                    }
                                  }}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Confirmar Reembolso
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Itens do Pedido ({purchase.jogos?.length || 0})
                      </h3>
                      <div className="grid gap-3">
                        {purchase.jogos?.map((game) => (
                          <div 
                            key={game.id} 
                            className="flex items-center gap-4 bg-secondary/20 p-3 rounded-lg hover:bg-secondary/40 transition-colors"
                          >
                            <div className="h-12 w-12 rounded overflow-hidden bg-secondary flex-shrink-0">
                                {game.imagemUrl ? (
                                    <img src={game.imagemUrl} alt={game.nome} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">N/A</div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{game.nome}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-[10px] h-5">
                                  {game.gender || "Jogo"}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right font-medium">
                              R$ {(game.preco ?? 0).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PurchaseHistory;
