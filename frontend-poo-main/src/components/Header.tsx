import { Search, ShoppingCart, User, Menu, ShoppingBag, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useGames } from "@/contexts/GamesContext";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { getTotalItems } = useCart();
  const { searchQuery, setSearchQuery } = useGames();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    signOut();
    navigate("/");
  };
  
  return (
    <header className="sticky top-0 z-50 glass-card border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link to="/">
              <h1 className="text-2xl font-bold text-gradient cursor-pointer">NexusGames</h1>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-foreground hover:text-primary transition-colors">Loja</Link>
              <Link to="/library" className="text-foreground hover:text-primary transition-colors">Biblioteca</Link>
              <Link to="/add-game" className="text-foreground hover:text-primary transition-colors">Cadastrar Jogo</Link>
            </nav>
          </div>

          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar jogos..." 
                className="pl-10 bg-secondary/50 border-border/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs gradient-primary"
                  >
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
            </Link>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                    🟢 Sessão ativa - {user?.nome || 'Usuário'}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/account")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/history")}>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    <span>Histórico de Compras</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => navigate('/auth')}>
                <User className="h-5 w-5" />
              </Button>
            )}
            
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
