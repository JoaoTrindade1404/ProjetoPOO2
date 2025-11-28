/**
 * Utilitários para validação de URLs de imagem
 */

/**
 * Verifica se uma string é uma URL válida
 */
export const isValidUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Verifica se uma URL aponta para uma imagem válida que pode ser carregada
 * @param url URL da imagem para testar
 * @returns Promise que resolve com true se a imagem pode ser carregada
 */
export const validateImageUrl = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!isValidUrl(url)) {
      resolve(false);
      return;
    }

    const img = new Image();
    
    const timeout = setTimeout(() => {
      resolve(false);
    }, 10000);

    img.onload = () => {
      clearTimeout(timeout);
      resolve(true);
    };

    img.onerror = () => {
      clearTimeout(timeout);
      resolve(false);
    };

    const testUrl = url.includes('?') 
      ? `${url}&_test=${Date.now()}` 
      : `${url}?_test=${Date.now()}`;
    
    img.src = testUrl;
  });
};

/**
 * Valida se uma URL é de imagem baseada na extensão
 */
export const hasImageExtension = (url: string): boolean => {
  if (!url) return false;
  
  const imageExtensions = [
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.ico',
    '.tiff', '.tif', '.avif', '.heic', '.heif'
  ];
  
  const urlLower = url.toLowerCase();
  return imageExtensions.some(ext => urlLower.includes(ext));
};

/**
 * Validação completa de URL de imagem
 * Combina validação de URL, extensão e carregamento real
 */
export const validateCompleteImageUrl = async (url: string): Promise<{
  isValid: boolean;
  hasValidFormat: boolean;
  hasImageExtension: boolean;
  canLoad: boolean;
  error?: string;
}> => {
  const result = {
    isValid: false,
    hasValidFormat: false,
    hasImageExtension: false,
    canLoad: false,
    error: undefined as string | undefined
  };

  result.hasValidFormat = isValidUrl(url);
  if (!result.hasValidFormat) {
    result.error = "URL inválida";
    return result;
  }

  result.hasImageExtension = hasImageExtension(url);
  
  try {
    result.canLoad = await validateImageUrl(url);
    if (!result.canLoad) {
      result.error = "Não foi possível carregar a imagem desta URL";
      return result;
    }
  } catch (error) {
    result.error = "Erro ao validar a imagem";
    return result;
  }

  result.isValid = result.hasValidFormat && result.canLoad;
  return result;
};

/**
 * Hook personalizado para validação de imagem com debounce
 */
export const useImageValidation = () => {
  const [validationState, setValidationState] = useState<{
    isValidating: boolean;
    isValid: boolean | null;
    error: string | null;
  }>({
    isValidating: false,
    isValid: null,
    error: null
  });

  const validateImage = useCallback(
    debounce(async (url: string) => {
      if (!url) {
        setValidationState({ isValidating: false, isValid: null, error: null });
        return;
      }

      setValidationState({ isValidating: true, isValid: null, error: null });

      const validation = await validateCompleteImageUrl(url);
      
      setValidationState({
        isValidating: false,
        isValid: validation.isValid,
        error: validation.error || null
      });
    }, 1000),
    []
  );

  return { validationState, validateImage };
};

function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

import { useState, useCallback } from 'react';
