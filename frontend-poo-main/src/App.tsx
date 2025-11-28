import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { GamesProvider } from "./contexts/GamesContext";
import { AuthProvider } from "./contexts/AuthContext";
import { LibraryProvider } from "./contexts/LibraryContext";
import { WalletProvider } from "./contexts/WalletContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import Cart from "./pages/Cart";
import Library from "./pages/Library";
import AddGame from "./pages/AddGame";
import EditGame from "./pages/EditGame";
import PurchaseHistory from "./pages/PurchaseHistory";
import GameDetail from "./pages/GameDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <GamesProvider>
          <CartProvider>
            <LibraryProvider>
              <WalletProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/auth" element={
                      <PublicRoute>
                        <Auth />
                      </PublicRoute>
                    } />
                    
                    <Route path="/" element={
                      <ProtectedRoute>
                        <Index />
                      </ProtectedRoute>
                    } />
                    <Route path="/account" element={
                      <ProtectedRoute>
                        <Account />
                      </ProtectedRoute>
                    } />
                    <Route path="/cart" element={
                      <ProtectedRoute>
                        <Cart />
                      </ProtectedRoute>
                    } />
                    <Route path="/library" element={
                      <ProtectedRoute>
                        <Library />
                      </ProtectedRoute>
                    } />
                    <Route path="/add-game" element={
                      <ProtectedRoute>
                        <AddGame />
                      </ProtectedRoute>
                    } />
                    <Route path="/edit-game/:id" element={
                      <ProtectedRoute>
                        <EditGame />
                      </ProtectedRoute>
                    } />
                    <Route path="/history" element={
                      <ProtectedRoute>
                        <PurchaseHistory />
                      </ProtectedRoute>
                    } />
                    <Route path="/game/:id" element={
                      <ProtectedRoute>
                        <GameDetail />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </WalletProvider>
            </LibraryProvider>
          </CartProvider>
        </GamesProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
