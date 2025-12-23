import React, { useState } from 'react';
import styled from 'styled-components';
import { FaTimes, FaDollarSign, FaCheck } from 'react-icons/fa';
import { useMutation, useQueryClient, useQuery } from 'react-query';
import { createPago, getSaldoTratamiento } from '../../services/pagoService';
import { getTratamientos } from '../../services/tratamientoService';
import { useNotification } from '../../hooks/useNotification';
import { Tratamiento } from '../../types';

const Modal = styled.div<{ $show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.$show ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e0e0e0;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 4px;
  border-radius: 4px;

  &:hover {
    background: #f0f0f0;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  background: white;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;

  ${props => props.$variant === 'secondary' ? `
    background: #6c757d;
    color: white;
    &:hover { background: #5a6268; }
  ` : `
    background: #007bff;
    color: white;
    &:hover { background: #0056b3; }
  `}
`;

const InfoCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
`;

const SaldoCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const SaldoHeader = styled.div`
  font-size: 0.85rem;
  opacity: 0.9;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SaldoValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 12px;
`;

const SaldoDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  font-size: 0.85rem;
  opacity: 0.9;
  padding-top: 12px;
  border-top: 1px solid rgba(255,255,255,0.2);
`;

const QuickButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const QuickButton = styled.button<{ $variant: 'total' | 'parcial' }>`
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;
  ${props => props.$variant === 'total' ? `
    background: #28a745;
    color: white;
    &:hover { background: #218838; }
  ` : `
    background: #ffc107;
    color: #000;
    &:hover { background: #e0a800; }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const InfoText = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 4px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const WarningText = styled.div`
  font-size: 0.85rem;
  color: #856404;
  background: #fff3cd;
  padding: 8px 12px;
  border-radius: 4px;
  margin-top: 8px;
  border-left: 3px solid #ffc107;
`;

interface GenerarPagoModalProps {
  show: boolean;
  onClose: () => void;
  pacienteId: string;
}

const GenerarPagoModal: React.FC<GenerarPagoModalProps> = ({ show, onClose, pacienteId }) => {
  const [formData, setFormData] = useState({
    tratamientoId: '',
    concepto: '',
    monto: 0,
    metodoPago: 'efectivo' as 'efectivo' | 'tarjeta' | 'transferencia' | 'cheque',
    estado: 'pagado' as 'pendiente' | 'pagado' | 'cancelado',
    observaciones: ''
  });
  const [asociarTratamiento, setAsociarTratamiento] = useState<boolean>(false);
  const [saldoTratamiento, setSaldoTratamiento] = useState<{
    costoTotal: number;
    totalPagado: number;
    saldoPendiente: number;
    estaCompletamentePagado: boolean;
  } | null>(null);
  const [isLoadingSaldo, setIsLoadingSaldo] = useState(false);
  const [saldosTratamientos, setSaldosTratamientos] = useState<Record<string, {
    costoTotal: number;
    totalPagado: number;
    saldoPendiente: number;
    estaCompletamentePagado: boolean;
  }>>({});

  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  // Obtener tratamientos del paciente
  const { data: tratamientos = [], refetch: refetchTratamientos } = useQuery(
    ['tratamientos', pacienteId],
    () => getTratamientos(pacienteId),
    { 
      enabled: !!pacienteId && show,
      refetchOnWindowFocus: false,
      refetchOnMount: true
    }
  );

  // Cargar saldos de todos los tratamientos cuando se cargan los tratamientos
  React.useEffect(() => {
    const cargarSaldos = async () => {
      if (tratamientos.length > 0) {
        const saldos: Record<string, any> = {};
        
        await Promise.all(
          tratamientos.map(async (tratamiento: Tratamiento) => {
            try {
              const saldo = await getSaldoTratamiento(tratamiento._id);
              saldos[tratamiento._id] = {
                costoTotal: saldo.costoTotal,
                totalPagado: saldo.totalPagado,
                saldoPendiente: saldo.saldoPendiente,
                estaCompletamentePagado: saldo.estaCompletamentePagado
              };
            } catch (error) {
              // Si falla, usar valores por defecto
              saldos[tratamiento._id] = {
                costoTotal: tratamiento.costo || 0,
                totalPagado: 0,
                saldoPendiente: tratamiento.costo || 0,
                estaCompletamentePagado: false
              };
            }
          })
        );
        
        setSaldosTratamientos(saldos);
      }
    };

    if (show && tratamientos.length > 0) {
      cargarSaldos();
    }
  }, [tratamientos, show]);


  // (Consultas removido: el pago de consulta se maneja con concepto + monto)

  // Crear pago
  const createPagoMutation = useMutation(createPago, {
    onSuccess: async () => {
      queryClient.invalidateQueries(['historialPagos', pacienteId]);
      queryClient.invalidateQueries(['pagos', pacienteId]);
      queryClient.invalidateQueries(['deudas', pacienteId]);
      
      // Recargar todos los saldos de tratamientos después de crear un pago
      if (tratamientos.length > 0) {
        const saldos: Record<string, any> = {};
        
        await Promise.all(
          tratamientos.map(async (tratamiento: Tratamiento) => {
            try {
              const saldo = await getSaldoTratamiento(tratamiento._id);
              saldos[tratamiento._id] = {
                costoTotal: saldo.costoTotal,
                totalPagado: saldo.totalPagado,
                saldoPendiente: saldo.saldoPendiente,
                estaCompletamentePagado: saldo.estaCompletamentePagado
              };
            } catch (error) {
              // Si falla, usar valores por defecto
              saldos[tratamiento._id] = {
                costoTotal: tratamiento.costo || 0,
                totalPagado: 0,
                saldoPendiente: tratamiento.costo || 0,
                estaCompletamentePagado: false
              };
            }
          })
        );
        
        setSaldosTratamientos(saldos);
      }
      
      showNotification('Pago creado exitosamente', 'success');
      resetForm();
      onClose();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message;
      showNotification(`Error al crear el pago: ${errorMessage}`, 'error');
    }
  });

  const resetForm = () => {
    setFormData({
      tratamientoId: '',
      concepto: '',
      monto: 0,
      metodoPago: 'efectivo',
      estado: 'pagado',
      observaciones: ''
    });
    setAsociarTratamiento(false);
    setSaldoTratamiento(null);
    setSaldosTratamientos({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.concepto.trim() || formData.monto <= 0) {
      showNotification('Por favor completa todos los campos requeridos', 'error');
      return;
    }

    // Validar monto si es tratamiento
    if (formData.tratamientoId && saldoTratamiento) {
      if (formData.monto > saldoTratamiento.saldoPendiente) {
        showNotification(
          `El monto excede el saldo pendiente. Saldo disponible: ${saldoTratamiento.saldoPendiente.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          'error'
        );
        return;
      }
    }

    // Calcular tipoPago
    let tipoPagoCalculado: 'consulta' | 'parcial' | 'total';
    if (formData.tratamientoId) {
      if (saldoTratamiento && formData.monto === saldoTratamiento.saldoPendiente) {
        tipoPagoCalculado = 'total';
      } else {
        tipoPagoCalculado = 'parcial';
      }
    } else {
      tipoPagoCalculado = 'consulta';
    }

    const pagoData = {
      pacienteId,
      tratamientoId: formData.tratamientoId || undefined,
      fecha: new Date().toISOString(),
      tipoPago: tipoPagoCalculado,
      concepto: formData.concepto,
      monto: formData.monto,
      estado: formData.estado,
      metodoPago: formData.metodoPago,
      observaciones: formData.observaciones || undefined
    };

    createPagoMutation.mutate(pagoData);
  };

  // Toggle para asociar un tratamiento al pago
  const handleToggleTratamiento = (checked: boolean) => {
    setAsociarTratamiento(checked);
    if (!checked) {
      setFormData(prev => ({
        ...prev,
        tratamientoId: '',
        monto: 0
      }));
      setSaldoTratamiento(null);
    }
  };

  const handleTratamientoChange = async (tratamientoId: string) => {
    const tratamiento = tratamientos.find((t: Tratamiento) => t._id === tratamientoId);
    
    if (tratamientoId && tratamiento) {
      // Si ya tenemos el saldo cargado, usarlo directamente
      if (saldosTratamientos[tratamientoId]) {
        const saldo = saldosTratamientos[tratamientoId];
        setSaldoTratamiento(saldo);
        
        // Si está completamente pagado, avisar
        if (saldo.estaCompletamentePagado) {
          showNotification('Este tratamiento ya está completamente pagado', 'info');
        }
      } else {
        // Si no está cargado, obtenerlo del API
        setIsLoadingSaldo(true);
        try {
          const saldo = await getSaldoTratamiento(tratamientoId);
          const saldoData = {
            costoTotal: saldo.costoTotal,
            totalPagado: saldo.totalPagado,
            saldoPendiente: saldo.saldoPendiente,
            estaCompletamentePagado: saldo.estaCompletamentePagado
          };
          setSaldoTratamiento(saldoData);
          
          // También actualizar el map de saldos
          setSaldosTratamientos(prev => ({
            ...prev,
            [tratamientoId]: saldoData
          }));
          
          // Si está completamente pagado, avisar
          if (saldo.estaCompletamentePagado) {
            showNotification('Este tratamiento ya está completamente pagado', 'info');
          }
        } catch (error: any) {
          console.error('Error obteniendo saldo:', error);
          showNotification('Error al obtener el saldo del tratamiento', 'error');
        } finally {
          setIsLoadingSaldo(false);
        }
      }
      
      setFormData(prev => ({
        ...prev,
        tratamientoId,
        concepto: tratamiento.nombre,
        monto: 0 // No establecer el monto automáticamente, que el usuario decida
      }));
    } else {
      setSaldoTratamiento(null);
      setFormData(prev => ({
        ...prev,
        tratamientoId: '',
        concepto: '',
        monto: 0
      }));
    }
  };

  const handlePagoTotal = () => {
    if (saldoTratamiento && saldoTratamiento.saldoPendiente > 0) {
      setFormData(prev => ({
        ...prev,
        tipoPago: 'total',
        monto: saldoTratamiento.saldoPendiente
      }));
    }
  };

  const handlePagoParcial = () => {
    setFormData(prev => ({
      ...prev,
      monto: 0
    }));
  };

  const selectedItem = formData.tratamientoId
    ? tratamientos.find((t: Tratamiento) => t._id === formData.tratamientoId)
    : null;

  return (
    <Modal $show={show}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>
            <FaDollarSign />
            Generar Nuevo Pago
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Concepto</Label>
            <Input
              type="text"
              value={formData.concepto}
              onChange={(e) => setFormData(prev => ({ ...prev, concepto: e.target.value }))}
              placeholder="Ej: Consulta, Ortodoncia, Limpieza..."
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>
              <input
                type="checkbox"
                checked={asociarTratamiento}
                onChange={(e) => handleToggleTratamiento(e.target.checked)}
                style={{ marginRight: 8 }}
              />
              Asociar a un tratamiento
            </Label>
          </FormGroup>

          {asociarTratamiento && (
            <>
              <FormGroup>
                <Label>Seleccionar Tratamiento</Label>
                <Select 
                  value={formData.tratamientoId} 
                  onChange={(e) => handleTratamientoChange(e.target.value)}
                  disabled={isLoadingSaldo}
                >
                  <option key="tratamiento-vacio" value="">Seleccionar tratamiento...</option>
                  {tratamientos && tratamientos.length > 0 ? (
                    tratamientos.map((tratamiento: Tratamiento) => {
                      const saldo = saldosTratamientos[tratamiento._id];
                      const costoTotal = tratamiento.costo || 0;
                    
                    if (saldo) {
                      if (saldo.estaCompletamentePagado) {
                        return (
                          <option key={tratamiento._id} value={tratamiento._id}>
                            {tratamiento.nombre} - {costoTotal.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2, maximumFractionDigits: 2 })} (Pagado ✓)
                          </option>
                        );
                      } else if (saldo.saldoPendiente > 0) {
                        return (
                          <option key={tratamiento._id} value={tratamiento._id}>
                            {tratamiento.nombre} - {costoTotal.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2, maximumFractionDigits: 2 })} (Pendiente: {saldo.saldoPendiente.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                          </option>
                        );
                      } else {
                        return (
                          <option key={tratamiento._id} value={tratamiento._id}>
                            {tratamiento.nombre} - {costoTotal.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2, maximumFractionDigits: 2 })} (Pagado ✓)
                          </option>
                        );
                      }
                    } else {
                      // Mientras carga, mostrar solo el costo
                      return (
                        <option key={tratamiento._id} value={tratamiento._id}>
                          {tratamiento.nombre} - {costoTotal.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2, maximumFractionDigits: 2 })} (Cargando...)
                        </option>
                      );
                    }
                    })
                  ) : (
                    <option value="" disabled>No hay tratamientos disponibles</option>
                  )}
                </Select>
                {isLoadingSaldo && <small style={{ color: '#666', fontSize: '12px' }}>Cargando saldo...</small>}
              </FormGroup>

              {saldoTratamiento && formData.tratamientoId && (
                <>
                  <SaldoCard>
                    <SaldoHeader>Saldo del Tratamiento</SaldoHeader>
                    <SaldoValue>
                      {saldoTratamiento.saldoPendiente.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </SaldoValue>
                    <SaldoDetails>
                      <div>
                        <strong>Costo Total:</strong><br />
                        {saldoTratamiento.costoTotal.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div>
                        <strong>Total Pagado:</strong><br />
                        {saldoTratamiento.totalPagado.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </SaldoDetails>
                  </SaldoCard>

                  {saldoTratamiento.estaCompletamentePagado ? (
                    <WarningText>
                      ⚠️ Este tratamiento ya está completamente pagado
                    </WarningText>
                  ) : (
                    <>
                      <QuickButtons>
                        <QuickButton 
                          type="button"
                          $variant="total"
                          onClick={handlePagoTotal}
                          disabled={saldoTratamiento.saldoPendiente <= 0}
                        >
                          💰 Pago Total
                        </QuickButton>
                        <QuickButton 
                          type="button"
                          $variant="parcial"
                          onClick={handlePagoParcial}
                          disabled={saldoTratamiento.saldoPendiente <= 0}
                        >
                          💵 Pago Parcial
                        </QuickButton>
                      </QuickButtons>

                      <WarningText>
                        💡 Saldo pendiente: {saldoTratamiento.saldoPendiente.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2, maximumFractionDigits: 2 })}. 
                        No puedes pagar más de esta cantidad.
                      </WarningText>
                    </>
                  )}
                </>
              )}
            </>
          )}

          {selectedItem && (
            <InfoCard>
              <InfoText key="concepto-info"><strong>Concepto:</strong> {formData.concepto}</InfoText>
            </InfoCard>
          )}

          

          <FormGroup>
            <Label>Monto</Label>
            <Input
              type="number"
              value={formData.monto || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, monto: Number(e.target.value) || 0 }))}
              placeholder="0"
              min="0"
              max={saldoTratamiento ? saldoTratamiento.saldoPendiente : undefined}
              step="0.01"
              required
            />
            {saldoTratamiento && formData.tratamientoId && (
              <small style={{ display: 'block', marginTop: '5px', color: '#666', fontSize: '12px' }}>
                Máximo permitido: {saldoTratamiento.saldoPendiente.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </small>
            )}
          </FormGroup>

          <FormGroup>
            <Label>Método de Pago</Label>
            <Select 
              value={formData.metodoPago} 
              onChange={(e) => setFormData(prev => ({ ...prev, metodoPago: e.target.value as any }))}
            >
              <option key="efectivo" value="efectivo">Efectivo</option>
              <option key="tarjeta" value="tarjeta">Tarjeta</option>
              <option key="transferencia" value="transferencia">Transferencia</option>
              <option key="cheque" value="cheque">Cheque</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Estado del Pago</Label>
            <Select 
              value={formData.estado} 
              onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value as any }))}
            >
              <option key="pagado" value="pagado">Pagado ✅</option>
              <option key="pendiente" value="pendiente">Pendiente ⏳</option>
              <option key="cancelado" value="cancelado">Cancelado ❌</option>
            </Select>
            <small style={{ display: 'block', marginTop: '5px', color: '#666', fontSize: '12px' }}>
              💡 Si el paciente ya pagó, selecciona "Pagado". Si no, deja como "Pendiente" y márcalo después.
            </small>
          </FormGroup>

          <FormGroup>
            <Label>Observaciones (Opcional)</Label>
            <TextArea
              value={formData.observaciones}
              onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
              placeholder="Observaciones adicionales..."
            />
          </FormGroup>

          <ButtonGroup>
            <Button type="button" $variant="secondary" onClick={onClose}>
              <FaTimes />
              Cancelar
            </Button>
            <Button type="submit" disabled={createPagoMutation.isLoading}>
              <FaCheck />
              {createPagoMutation.isLoading ? 'Creando...' : 'Crear Pago'}
            </Button>
          </ButtonGroup>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default GenerarPagoModal;
