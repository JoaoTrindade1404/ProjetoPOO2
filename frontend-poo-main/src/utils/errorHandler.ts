import { toast } from "@/hooks/use-toast";

/**
 * Trata erros de API e exibe uma notificação amigável para o usuário.
 * 
 * @param error O erro capturado (pode ser Error, string ou objeto)
 * @param defaultMessage Mensagem padrão caso o erro não tenha detalhes
 * @param title Título da notificação (opcional)
 */
export const handleApiError = (
  error: any, 
  defaultMessage: string = "Ocorreu um erro inesperado.",
  title: string = "Erro"
) => {
  console.error(`❌ Error handled:`, error);

  let message = defaultMessage;

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    message = String(error.message);
  }

  if (message.toLowerCase().includes('failed to fetch')) {
    message = "Não foi possível conectar ao servidor. Verifique sua conexão ou se o backend está rodando.";
  }

  toast({
    title: title,
    description: message,
    variant: "destructive",
  });
};
