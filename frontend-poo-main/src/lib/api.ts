import { supabase } from '@/integrations/supabase/client';

/**
 * Sincroniza jogos da API Java/Spring Boot para o banco de dados
 * @param games - Array de jogos da API Java
 * @param apiUrl - URL da API Java (opcional, se quiser buscar diretamente)
 */
export const syncGamesFromJavaAPI = async (games?: any[], apiUrl?: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('sync-games', {
      body: { games, apiUrl }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error syncing games:', error);
    throw error;
  }
};

/**
 * Processa o checkout do carrinho
 */
export const processCheckout = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('User not authenticated');

    const { data, error } = await supabase.functions.invoke('process-checkout', {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error processing checkout:', error);
    throw error;
  }
};