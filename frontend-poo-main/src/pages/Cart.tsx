import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, ShoppingBag, ShoppingCart, Wallet, AlertCircle } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useLibrary } from "@/contexts/LibraryContext";
import { useWallet } from "@/contexts/WalletContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { comprasAPI } from "@/services/springboot-api";
import { handleApiError } from "@/utils/errorHandler";

const Cart = () => {
  const { cartItems, removeFromCart, clearCart, loading: cartLoading } = useCart();
  const { refreshLibrary } = useLibrary();
  const { balance, refreshBalance } = useWallet();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      refreshBalance();
    }
  }, [user?.id, refreshBalance]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const totalDiscount = cartItems.reduce((sum, item) => sum + (item.originalPrice - item.price), 0);
  const total = subtotal;
  const userBalance = user?.saldo ?? balance;
  const hasInsufficientBalance = total > userBalance;

  const handleCheckout = async () => {
    console.log('🛒 Cart.handleCheckout - Starting checkout process');
    console.log('🛒 Cart.handleCheckout - User:', user?.id, 'Items:', cartItems.length, 'Total:', total);
    
    if (!user?.id) {
      console.log('❌ Cart.handleCheckout - No user logged in');
      toast({
        title: "Faça login",
        description: "Você precisa estar logado para finalizar a compra.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (cartItems.length === 0) {
      console.log('❌ Cart.handleCheckout - Empty cart');
      toast({
        title: "Carrinho vazio",
        description: "Adicione jogos ao carrinho antes de finalizar a compra.",
        variant: "destructive",
      });
      return;
    }

    if (hasInsufficientBalance) {
      console.log('❌ Cart.handleCheckout - Insufficient balance. Need:', total, 'Have:', userBalance);
      toast({
        title: "Saldo insuficiente",
        description: `Você precisa de R$ ${total.toFixed(2)}, mas tem apenas R$ ${userBalance.toFixed(2)}. Adicione saldo na sua conta.`,
        variant: "destructive",
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/account")}
          >
            Adicionar Saldo
          </Button>
        ) as any,
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      console.log('🔄 Cart.handleCheckout - Refreshing balance before checkout...');
      await refreshBalance();
      
      console.log('📡 Cart.handleCheckout - Processing checkout for user:', user.id);
      const compra = await comprasAPI.checkout(user.id);
      console.log('✅ Cart.handleCheckout - Checkout successful:', compra);
      
      toast({
        title: "Pagamento aprovado!",
        description: `Compra de ${cartItems.length} ${cartItems.length === 1 ? 'jogo' : 'jogos'} realizada com sucesso. Total: R$ ${total.toFixed(2)}`,
      });
      
      clearCart();
      console.log('🔄 Cart.handleCheckout - Refreshing library and balance');
      
      await Promise.all([
        refreshLibrary(),
        refreshBalance()
      ]);
      
      setTimeout(() => {
        console.log('🔄 Cart.handleCheckout - Redirecting to library');
        navigate("/library");
      }, 1000);
    } catch (error) {
      console.error('❌ Cart.handleCheckout - Error:', error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      
      console.log('❌ Cart.handleCheckout - Error details:', {
        message: errorMessage,
        userId: user.id,
        cartItemsCount: cartItems.length,
        cartItemIds: cartItems.map(item => item.id),
        total: total,
        balance: userBalance
      });
      
      if (errorMessage.toLowerCase().includes('saldo') || errorMessage.toLowerCase().includes('insuficiente')) {
        console.log('❌ Cart.handleCheckout - Balance error detected');
        handleApiError(error, "Saldo insuficiente", "Saldo insuficiente");
      } else {
        handleApiError(error, "Erro ao processar compra", "Erro ao processar compra");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">
              Seu <span className="text-gradient">Carrinho</span>
            </h1>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'}
            </Badge>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.length === 0 ? (
                <Card className="glass-card p-12 text-center">
                  <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-2xl font-bold mb-2">Seu carrinho está vazio</h3>
                  <p className="text-muted-foreground mb-6">
                    Explore nossa loja e adicione jogos incríveis!
                  </p>
                  <Button 
                    className="gradient-primary"
                    onClick={() => navigate("/")}
                  >
                    Explorar Jogos
                  </Button>
                </Card>
              ) : (
                <>
                  {cartItems.map((item) => (
                <Card key={item.id} className="glass-card p-4 hover-glow transition-all">
                  <div className="flex gap-4">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-semibold">{item.title}</h3>
                          {item.discount > 0 && (
                            <Badge className="bg-accent">-{item.discount}%</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Download digital • Ativação imediata
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {item.discount > 0 && (
                            <span className="text-muted-foreground line-through">
                              R$ {item.originalPrice.toFixed(2)}
                            </span>
                          )}
                          <span className="text-2xl font-bold text-primary">
                            R$ {item.price.toFixed(2)}
                          </span>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
                </>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="glass-card p-6 sticky top-24 space-y-6">
                <h2 className="text-2xl font-bold">Resumo do Pedido</h2>
                
                {/* Saldo da Carteira */}
                <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">Seu Saldo</span>
                    </div>
                    <span className="text-xl font-bold text-primary">
                      R$ {userBalance.toFixed(2)}
                    </span>
                  </div>
                  {hasInsufficientBalance && cartItems.length > 0 && (
                    <div className="flex items-start gap-2 mt-2 text-xs text-destructive">
                      <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>
                        Saldo insuficiente. Você precisa de mais R$ {(total - userBalance).toFixed(2)}.
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">R$ {(subtotal + totalDiscount).toFixed(2)}</span>
                  </div>
                  
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-green-500">
                      <span>Descontos</span>
                      <span className="font-medium">-R$ {totalDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="h-px bg-border my-4" />
                  
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-primary">R$ {total.toFixed(2)}</span>
                  </div>
                  
                  {totalDiscount > 0 && (
                    <div className="text-sm text-muted-foreground text-center pt-2">
                      Você está economizando R$ {totalDiscount.toFixed(2)}!
                    </div>
                  )}
                </div>
                
                {hasInsufficientBalance && cartItems.length > 0 ? (
                  <Button 
                    className="w-full gradient-primary text-lg py-6" 
                    size="lg"
                    onClick={() => navigate("/account")}
                  >
                    <Wallet className="mr-2 h-5 w-5" />
                    Adicionar Saldo
                  </Button>
                ) : (
                  <Button 
                    className="w-full gradient-primary text-lg py-6 animate-glow-pulse" 
                    size="lg"
                    onClick={handleCheckout}
                    disabled={isProcessing || cartItems.length === 0}
                  >
                    {isProcessing ? "Processando..." : "Finalizar Compra"}
                  </Button>
                )}
                
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    ✓ Ativação instantânea
                  </div>
                  <div className="flex items-center gap-2">
                    ✓ Download imediato
                  </div>
                  <div className="flex items-center gap-2">
                    ✓ Garantia de reembolso em 14 dias
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Cart;
