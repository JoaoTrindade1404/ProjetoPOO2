import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import { walletAPI, userAPI } from "@/services/springboot-api";
import { useAuth } from "./AuthContext";
import { toast } from "@/hooks/use-toast";

interface WalletContextType {
  balance: number;
  addBalance: (amount: number) => Promise<void>;
  refreshBalance: () => Promise<void>;
  loading: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user, updateUserBalance } = useAuth();

  const refreshBalance = useCallback(async () => {
    console.log('🔍 WalletContext.refreshBalance - userId:', user?.id);
    
    if (!user?.id) {
      console.log('❌ WalletContext.refreshBalance - No user, setting balance to 0');
      setBalance(0);
      return;
    }

    try {
      console.log('📡 WalletContext.refreshBalance - GET /wallet/' + user.id);
      const walletBalance = await walletAPI.getBalance(user.id);
      console.log('✅ WalletContext.refreshBalance - Wallet balance:', walletBalance);
      
      const newBalance = walletBalance || 0;
      setBalance(newBalance);
      
      // Only update user balance if it has changed to prevent infinite loops
      if (user.saldo !== newBalance) {
        console.log('💰 WalletContext.refreshBalance - Updating user balance from', user.saldo, 'to', newBalance);
        updateUserBalance(newBalance);
      } else {
        console.log('💰 WalletContext.refreshBalance - Balance unchanged, skipping user update');
      }
      
    } catch (error) {
      console.error('❌ WalletContext.refreshBalance - Error fetching wallet:', error);
      setBalance(0);
    }
  }, [user?.id, user?.saldo, updateUserBalance]);

  useEffect(() => {
    if (user?.id) {
      refreshBalance();
    } else {
      setBalance(0);
      console.log('💰 WalletContext.useEffect - No user, balance set to 0');
    }
  }, [user?.id, refreshBalance]);

  const addBalance = useCallback(async (amount: number) => {
    console.log('💵 WalletContext.addBalance - Adding:', amount, 'to user:', user?.id);
    
    if (!user?.id) {
      console.log('❌ WalletContext.addBalance - No user logged in');
      toast({
        title: "Faça login",
        description: "Você precisa estar logado para adicionar saldo.",
        variant: "destructive",
      });
      return;
    }

    if (amount <= 0) {
      console.log('❌ WalletContext.addBalance - Invalid amount:', amount);
      toast({
        title: "Valor inválido",
        description: "O valor deve ser maior que zero.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      console.log('📡 WalletContext.addBalance - POST /wallet/' + user.id);
      
      const newBalance = await walletAPI.addBalance(user.id, amount);
      console.log('✅ WalletContext.addBalance - New balance from API:', newBalance);
      
      setBalance(newBalance);
      updateUserBalance(newBalance);
      
      toast({
        title: "Saldo adicionado!",
        description: `R$ ${amount.toFixed(2)} foram adicionados à sua carteira. Novo saldo: R$ ${newBalance.toFixed(2)}`,
      });
      
    } catch (error: any) {
      console.error('❌ WalletContext.addBalance - Error:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível adicionar saldo à carteira.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, updateUserBalance]);

  const value = useMemo(() => ({ 
    balance, 
    addBalance,
    refreshBalance,
    loading
  }), [balance, addBalance, refreshBalance, loading]);

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

