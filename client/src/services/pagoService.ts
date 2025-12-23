import axios from './axiosConfig';
import { Pago, EstadisticasPagos, DeudasResumen } from '../types';

export const getPagos = async (pacienteId: string): Promise<Pago[]> => {
  const response = await axios.get(`/pagos/paciente/${pacienteId}`);
  return response.data.data;
};

export const getHistorialPagos = async (pacienteId: string): Promise<{
  pagos: Pago[];
  estadisticas: EstadisticasPagos;
}> => {
  const response = await axios.get(`/pagos/historial/${pacienteId}`);
  return response.data.data;
};

export const getDeudas = async (pacienteId: string): Promise<DeudasResumen> => {
  const response = await axios.get(`/pagos/paciente/${pacienteId}/deudas`);
  return response.data.data;
};

export const checkCobroConsulta = async (pacienteId: string, consultaId: string): Promise<{
  debeCobrarConsulta: boolean;
  tieneDeudaTratamientos: boolean;
}> => {
  const response = await axios.post('/pagos/consultar-cobro', { pacienteId, consultaId });
  return response.data.data;
};

export const createPago = async (pagoData: Omit<Pago, '_id' | 'createdAt' | 'updatedAt'>): Promise<Pago> => {
  const response = await axios.post('/pagos', pagoData);
  return response.data.data;
};

export const updatePago = async (id: string, pagoData: Partial<Pago>): Promise<Pago> => {
  const response = await axios.put(`/pagos/${id}`, pagoData);
  return response.data.data;
};

export const marcarPagoComoPagado = async (id: string): Promise<Pago> => {
  const response = await axios.put(`/pagos/${id}/marcar-pagado`);
  return response.data.data;
};

export const deletePago = async (id: string, razon?: string): Promise<void> => {
  await axios.delete(`/pagos/${id}`, { data: { razon } });
};

export const getAllPagos = async (filtros?: {
  pacienteId?: string;
  startDate?: string;
  endDate?: string;
  estado?: string;
  metodoPago?: string;
}): Promise<{ pagos: Pago[]; totales: any }> => {
  const params = new URLSearchParams();
  if (filtros?.pacienteId) params.append('pacienteId', filtros.pacienteId);
  if (filtros?.startDate) params.append('startDate', filtros.startDate);
  if (filtros?.endDate) params.append('endDate', filtros.endDate);
  if (filtros?.estado) params.append('estado', filtros.estado);
  if (filtros?.metodoPago) params.append('metodoPago', filtros.metodoPago);
  
  const response = await axios.get(`/pagos?${params.toString()}`);
  return response.data.data;
};

export const getReporteFinanciero = async (fechaDesde?: string, fechaHasta?: string): Promise<{
  pagos: Pago[];
  estadisticas: {
    total: number;
    porEstado: { pagado: number; pendiente: number; cancelado: number };
    porMetodo: { efectivo: number; tarjeta: number; transferencia: number; cheque: number };
    cantidadTotal: number;
    cantidadPagados: number;
    cantidadPendientes: number;
  };
  periodo: { desde: string; hasta: string };
}> => {
  const params = new URLSearchParams();
  if (fechaDesde) params.append('fechaDesde', fechaDesde);
  if (fechaHasta) params.append('fechaHasta', fechaHasta);
  
  const response = await axios.get(`/pagos/reporte/financiero?${params.toString()}`);
  return response.data.data;
};

export const getHistorialPago = async (pagoId: string): Promise<any[]> => {
  const response = await axios.get(`/pagos/${pagoId}/historial`);
  return response.data.data;
};

export const getSaldoTratamiento = async (tratamientoId: string): Promise<{
  tratamientoId: string;
  nombre: string;
  costoTotal: number;
  totalPagado: number;
  saldoPendiente: number;
  estaCompletamentePagado: boolean;
  cantidadPagos: number;
}> => {
  const response = await axios.get(`/pagos/tratamiento/${tratamientoId}/saldo`);
  return response.data.data;
};