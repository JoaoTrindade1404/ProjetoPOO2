/**
 * Serviço de integração com a API Spring Boot
 * Base URL: http://localhost:8081
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';


export interface User {
  id?: number;
  nome: string;
  email: string;
  senha?: string;
  saldo?: number;
}

export interface Jogo {
  id?: number;
  nome: string;
  gender?: string; // Gênero/Categoria do jogo (retornado pelo backend)
  preco: number;
  descricao: string;
  dataLancamento?: string;
  avaliacao?: number;
  categoria?: string; // Usado apenas no frontend
  imagem?: string; // Usado apenas no frontend
  imageURL?: string; // Compatibilidade
  imagemUrl?: string; // Nome real usado pelo backend
}

export interface Avaliacao {
  id?: number;
  nota: number;
  comentario: string;
  usuarioId?: number;
  jogoId?: number;
}

export interface Compra {
  id?: number;
  usuarioId: number;
  jogos: Jogo[];
  valor: number;
  dataCompra?: string;
  reembolsado?: boolean;
}


/**
 * Função auxiliar para fazer requisições HTTP
 */
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: defaultHeaders,
    });

    if (response.status === 204) {
      return undefined as T;
    }

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage = `Erro HTTP ${response.status}`;
      
      try {
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorData.details || errorMessage;
        } else {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
      } catch (parseError) {
        console.error('Erro ao parsear resposta de erro:', parseError);
      }
      
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return (await response.text()) as T;
  } catch (error) {
    console.error(`Erro ao fazer requisição para ${url}:`, error);
    throw error;
  }
}


export const userAPI = {
  /**
   * Lista todos os usuários
   */
  getAll: () => fetchAPI<User[]>('/user', { method: 'GET' }),

  /**
   * Busca um usuário por ID
   */
  getById: (id: number) => fetchAPI<User>(`/user/${id}`, { method: 'GET' }),

  /**
   * Cria um novo usuário (cadastro)
   */
  create: (user: Omit<User, 'id'>) =>
    fetchAPI<User>('/user', {
      method: 'POST',
      body: JSON.stringify(user),
    }),

  /**
   * Atualiza um usuário existente
   */
  update: (id: number, user: Partial<User>) =>
    fetchAPI<User>(`/user/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    }),

  /**
   * Realiza login do usuário
   */
  login: (email: string, senha: string) =>
    fetchAPI<User>('/user/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    }),

  /**
   * Altera a senha do usuário
   */
  changePassword: (id: number, currentPassword: string, newPassword: string) =>
    fetchAPI<void>(`/user/${id}/password`, {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};


export const jogoAPI = {
  /**
   * Lista todos os jogos disponíveis
   */
  getAll: () => fetchAPI<Jogo[]>('/jogo', { method: 'GET' }),

  /**
   * Busca um jogo por ID
   */
  getById: (id: number) => fetchAPI<Jogo>(`/jogo/${id}`, { method: 'GET' }),

  /**
   * Adiciona um novo jogo
   */
  create: (jogo: Omit<Jogo, 'id'>) =>
    fetchAPI<Jogo>('/jogo', {
      method: 'POST',
      body: JSON.stringify(jogo),
    }),

  /**
   * Atualiza um jogo existente
   */
  update: (id: number, jogo: Partial<Jogo>) =>
    fetchAPI<Jogo>(`/jogo/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jogo),
    }),

  /**
   * Remove um jogo por ID
   */
  delete: (id: number) =>
    fetchAPI<void>(`/jogo/${id}`, { method: 'DELETE' }),
};


export const cartAPI = {
  /**
   * Lista todos os jogos no carrinho do usuário
   */
  getGames: (usuarioId: number) =>
    fetchAPI<Jogo[]>(`/cart/usuario/${usuarioId}/jogos`, { method: 'GET' }),

  /**
   * Adiciona um jogo ao carrinho
   */
  addGame: (usuarioId: number, jogoId: number) =>
    fetchAPI<void>(`/cart/usuario/${usuarioId}/jogos`, {
      method: 'POST',
      body: JSON.stringify({ jogoId }),
    }),

  /**
   * Remove um jogo do carrinho
   */
  removeGame: (usuarioId: number, jogoId: number) =>
    fetchAPI<void>(`/cart/usuario/${usuarioId}/jogos/${jogoId}`, {
      method: 'DELETE',
    }),
};


export const walletAPI = {
  getBalance: (userId: number) => {
    console.log('📡 walletAPI.getBalance - GET /wallet/' + userId);
    return fetchAPI<number>(`/wallet/${userId}`, { method: 'GET' });
  },

  addBalance: (userId: number, valor: number) => {
    console.log('📡 walletAPI.addBalance - POST /wallet/' + userId, { valor });
    return fetchAPI<number>(`/wallet/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ valor }),
    });
  },
};


export const libraryAPI = {
  /**
   * Lista todos os jogos na biblioteca do usuário
   */
  getGames: (usuarioId: number) =>
    fetchAPI<Jogo[]>(`/library/usuario/${usuarioId}/jogos`, { method: 'GET' }),
};


export const avaliacaoAPI = {
  /**
   * Cria uma avaliação para um jogo
   */
  create: (usuarioId: number, jogoId: number, avaliacao: { nota: number; comentario: string }) =>
    fetchAPI<Avaliacao>(`/avaliacao/avaliacoes/usuario/${usuarioId}/jogo/${jogoId}`, {
      method: 'POST',
      body: JSON.stringify(avaliacao),
    }),
};


export const comprasAPI = {
  checkout: async (usuarioId: number) => {
    console.log('📡 comprasAPI.checkout - POST /compras/' + usuarioId);
    console.log('📡 comprasAPI.checkout - Request details:', {
      url: `/compras/${usuarioId}`,
      method: 'POST',
      usuarioId: usuarioId
    });
    
    try {
      const result = await fetchAPI<Compra>(`/compras/${usuarioId}`, { method: 'POST' });
      console.log('✅ comprasAPI.checkout - Success:', result);
      return result;
    } catch (error) {
      console.error('❌ comprasAPI.checkout - Error:', error);
      throw error;
    }
  },

  /**
   * Lista todas as compras de um usuário
   */
  getByUser: (usuarioId: number) =>
    fetchAPI<Compra[]>(`/compras/usuario/${usuarioId}`, { method: 'GET' }),

  /**
   * Busca uma compra por ID
   */
  getById: (compraId: number) =>
    fetchAPI<Compra>(`/compras/${compraId}`, { method: 'GET' }),

  /**
   * Efetua o reembolso de uma compra
   */
  refund: (compraId: number) =>
    fetchAPI<void>(`/compras/${compraId}/reembolso`, { method: 'POST' }),
};


export default {
  userAPI,
  jogoAPI,
  cartAPI,
  walletAPI,
  libraryAPI,
  avaliacaoAPI,
  comprasAPI,
};

