/**
 * Formatea un número como moneda en pesos argentinos
 * @param amount - El monto a formatear
 * @param options - Opciones de formato
 * @returns String formateado como moneda argentina (ej: $1.234,56)
 */
export const formatCurrency = (
  amount: number | string | undefined | null,
  options: {
    showDecimals?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string => {
  if (amount === null || amount === undefined || amount === '') {
    return '$0';
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return '$0';
  }

  const {
    showDecimals = true,
    minimumFractionDigits = showDecimals ? 2 : 0,
    maximumFractionDigits = showDecimals ? 2 : 0,
  } = options;

  // Formato argentino: punto para miles, coma para decimales
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(numAmount);
};

/**
 * Parsea un valor de input a número preservando decimales
 * @param value - El valor del input
 * @returns Número o null si está vacío
 */
export const parseCurrencyInput = (value: string): number | null => {
  if (!value || value.trim() === '') {
    return null;
  }
  
  // Remover cualquier carácter que no sea número, punto o coma
  const cleaned = value.replace(/[^\d.,]/g, '');
  
  // Reemplazar coma por punto para parseFloat
  const normalized = cleaned.replace(',', '.');
  
  const parsed = parseFloat(normalized);
  
  return isNaN(parsed) ? null : parsed;
};


