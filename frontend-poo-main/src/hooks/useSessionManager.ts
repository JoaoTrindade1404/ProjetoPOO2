import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

/**
 * Hook para gerenciar sessão automaticamente
 * - Verifica periodicamente se a sessão ainda é válida
 * - Exibe avisos quando a sessão está próxima do vencimento
 * - Faz logout automático quando a sessão expira
 */
export const useSessionManager = () => {
  const { user, signOut, validateSession } = useAuth();

  const checkSession = useCallback(async () => {
    if (!user) return;

    const isValid = await validateSession();
    
    if (!isValid) {
      console.log('⏰ useSessionManager - Session expired, logging out');
      toast({
        title: "Sessão Expirada",
        description: "Sua sessão expirou. Faça login novamente.",
        variant: "destructive",
      });
      await signOut();
    }
  }, [user, validateSession, signOut]);

  useEffect(() => {
    if (!user) return;

    const interval = setInterval(checkSession, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [user, checkSession]);

  useEffect(() => {
    if (!user) return;

    const handleFocus = () => {
      console.log('👁️ useSessionManager - Tab focused, checking session');
      checkSession();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, checkSession]);

  useEffect(() => {
    if (user) {
      checkSession();
    }
  }, [user, checkSession]);
};

/**
 * Hook para detectar inatividade do usuário
 */
export const useIdleDetection = (idleTimeMinutes: number = 30) => {
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (!user) return;

    let idleTimer: NodeJS.Timeout;
    const idleTime = idleTimeMinutes * 60 * 1000; // Converte para millisegundos

    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        console.log('😴 useIdleDetection - User idle for too long, logging out');
        toast({
          title: "Sessão Inativa",
          description: `Você foi desconectado por inatividade de ${idleTimeMinutes} minutos.`,
          variant: "destructive",
        });
        signOut();
      }, idleTime);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    resetIdleTimer();

    events.forEach(event => {
      document.addEventListener(event, resetIdleTimer, true);
    });

    return () => {
      clearTimeout(idleTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetIdleTimer, true);
      });
    };
  }, [user, idleTimeMinutes, signOut]);
};
