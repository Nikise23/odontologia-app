import React, { useState } from 'react';
import styled from 'styled-components';
import { FaPlus, FaCheck, FaDollarSign, FaCalendarAlt, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getPacientes } from '../../services/pacienteService';
import { getHistorialPagos, getDeudas, createPago, updatePago, marcarPagoComoPagado, deletePago } from '../../services/pagoService';
import { useNotification } from '../../hooks/useNotification';
import { Deuda } from '../../types';

const PagosContainer = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 24px;
  font-weight: 600;
`;

const Content = styled.div`
  padding: 20px;
`;

const SearchSection = styled.div`
  margin-bottom: 30px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #28a745;
  }
`;

const PacienteCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e9ecef;
    border-color: #28a745;
  }
`;

const PacienteInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PacienteNombre = styled.h3`
  margin: 0;
  color: #333;
  font-size: 18px;
`;

const PacienteCI = styled.span`
  color: #6c757d;
  font-size: 14px;
`;

const SeccionTitle = styled.h2`
  margin: 20px 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
`;

const EstadisticasGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
`;

const EstadisticaCard = styled.div`
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
`;

const EstadisticaValor = styled.div`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
`;

const EstadisticaLabel = styled.div`
  font-size: 14px;
  opacity: 0.9;
`;

const DeudasList = styled.div`
  margin-bottom: 30px;
`;

const DeudaItem = styled.div`
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DeudaInfo = styled.div`
  flex: 1;
`;

const DeudaDescripcion = styled.h4`
  margin: 0 0 8px 0;
  color: #856404;
  font-size: 16px;
`;

const DeudaDetalles = styled.div`
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #856404;
`;

const DeudaMonto = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #856404;
`;

const PagosList = styled.div`
  margin-top: 20px;
`;

const PagoItem = styled.div`
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PagoInfo = styled.div`
  flex: 1;
`;

const PagoConcepto = styled.h4`
  margin: 0 0 8px 0;
  color: #333;
  font-size: 16px;
`;

const PagoDetalles = styled.div`
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #6c757d;
`;

const PagoMonto = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #28a745;
`;

const PagoEstado = styled.span<{ $estado: string }>`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => {
    switch (props.$estado) {
      case 'pagado': return '#d4edda';
      case 'pendiente': return '#fff3cd';
      case 'cancelado': return '#f8d7da';
      default: return '#e9ecef';
    }
  }};
  color: ${props => {
    switch (props.$estado) {
      case 'pagado': return '#155724';
      case 'pendiente': return '#856404';
      case 'cancelado': return '#721c24';
      default: return '#6c757d';
    }
  }};
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'success' | 'danger' | 'warning' }>`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 8px;

  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: #007bff;
          color: white;
          &:hover { background: #0056b3; }
        `;
      case 'success':
        return `
          background: #28a745;
          color: white;
          &:hover { background: #1e7e34; }
        `;
      case 'danger':
        return `
          background: #dc3545;
          color: white;
          &:hover { background: #c82333; }
        `;
      case 'warning':
        return `
          background: #ffc107;
          color: #000;
          &:hover { background: #e0a800; }
        `;
      default:
        return `
          background: #6c757d;
          color: white;
          &:hover { background: #545b62; }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const Modal = styled.div<{ $show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.$show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #28a745;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #28a745;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

const Button = styled.button<{ $variant?: 'primary' }>`
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;

  ${props => props.$variant === 'primary' ? `
    background: #28a745;
    color: white;
    &:hover { background: #1e7e34; }
  ` : `
    background: #6c757d;
    color: white;
    &:hover { background: #545b62; }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Alert = styled.div<{ $type: 'info' | 'warning' }>`
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  background: ${props => props.$type === 'warning' ? '#fff3cd' : '#d1ecf1'};
  border: 1px solid ${props => props.$type === 'warning' ? '#ffc107' : '#bee5eb'};
  color: ${props => props.$type === 'warning' ? '#856404' : '#0c5460'};
`;

const PagosPage: React.FC = () => {
  const [pacienteSearch, setPacienteSearch] = useState('');
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPago, setEditingPago] = useState<any>(null);
  const [formData, setFormData] = useState({
    tipoPago: 'consulta' as 'consulta' | 'tratamiento' | 'parcial' | 'total',
    concepto: '',
    monto: 0,
    metodoPago: 'efectivo' as 'efectivo' | 'tarjeta' | 'transferencia' | 'cheque',
    observaciones: ''
  });

  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  // Buscar pacientes
  const { data: pacientesData } = useQuery(
    ['pacientes', pacienteSearch],
    () => getPacientes(1, 10, pacienteSearch),
    { enabled: pacienteSearch.length > 2 }
  );

  // Obtener historial de pagos del paciente seleccionado
  const { data: historialData, isLoading: isLoadingHistorial } = useQuery(
    ['historialPagos', pacienteSeleccionado?._id],
    () => getHistorialPagos(pacienteSeleccionado._id),
    { enabled: !!pacienteSeleccionado }
  );

  // Obtener deudas pendientes
  const { data: deudasData, isLoading: isLoadingDeudas } = useQuery(
    ['deudas', pacienteSeleccionado?._id],
    () => getDeudas(pacienteSeleccionado._id),
    { enabled: !!pacienteSeleccionado }
  );

  // Crear pago
  const createPagoMutation = useMutation(createPago, {
    onSuccess: () => {
      queryClient.invalidateQueries(['historialPagos', pacienteSeleccionado._id]);
      queryClient.invalidateQueries(['deudas', pacienteSeleccionado._id]);
      setShowModal(false);
      setEditingPago(null);
      setFormData({
        tipoPago: 'consulta',
        concepto: '',
        monto: 0,
        metodoPago: 'efectivo',
        observaciones: ''
      });
      showNotification('Pago creado exitosamente', 'success');
    },
    onError: (error: any) => {
      showNotification(error.message || 'Error al crear pago', 'error');
    }
  });

  // Actualizar pago
  const updatePagoMutation = useMutation(({ id, data }: { id: string; data: any }) => updatePago(id, data), {
    onSuccess: () => {
      queryClient.invalidateQueries(['historialPagos', pacienteSeleccionado._id]);
      queryClient.invalidateQueries(['deudas', pacienteSeleccionado._id]);
      setShowModal(false);
      setEditingPago(null);
      showNotification('Pago actualizado exitosamente', 'success');
    },
    onError: (error: any) => {
      showNotification(error.message || 'Error al actualizar pago', 'error');
    }
  });

  // Eliminar pago
  const deletePagoMutation = useMutation(deletePago, {
    onSuccess: () => {
      queryClient.invalidateQueries(['historialPagos', pacienteSeleccionado._id]);
      queryClient.invalidateQueries(['deudas', pacienteSeleccionado._id]);
      showNotification('Pago eliminado exitosamente', 'success');
    },
    onError: (error: any) => {
      showNotification(error.message || 'Error al eliminar pago', 'error');
    }
  });

  // Marcar como pagado
  const marcarPagadoMutation = useMutation(marcarPagoComoPagado, {
    onSuccess: () => {
      queryClient.invalidateQueries(['historialPagos', pacienteSeleccionado._id]);
      queryClient.invalidateQueries(['deudas', pacienteSeleccionado._id]);
      showNotification('Pago marcado como pagado', 'success');
    },
    onError: (error: any) => {
      showNotification(error.message || 'Error al marcar pago', 'error');
    }
  });

  const handlePacienteSelect = (paciente: any) => {
    setPacienteSeleccionado(paciente);
    setPacienteSearch('');
  };

  const handleNuevoPago = () => {
    setEditingPago(null);
    setFormData({
      tipoPago: 'consulta',
      concepto: '',
      monto: 0,
      metodoPago: 'efectivo',
      observaciones: ''
    });
    setShowModal(true);
  };

  const handleEditarPago = (pago: any) => {
    setEditingPago(pago);
    setFormData({
      tipoPago: pago.tipoPago,
      concepto: pago.concepto,
      monto: pago.monto,
      metodoPago: pago.metodoPago,
      observaciones: pago.observaciones || ''
    });
    setShowModal(true);
  };

  const handleEliminarPago = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este pago?')) {
      deletePagoMutation.mutate(id);
    }
  };

  const handleSubmit = () => {
    if (!pacienteSeleccionado || !formData.concepto || formData.monto <= 0) {
      showNotification('Por favor completa todos los campos requeridos', 'error');
      return;
    }

    if (editingPago) {
      updatePagoMutation.mutate({
        id: editingPago._id,
        data: {
          tipoPago: formData.tipoPago,
          concepto: formData.concepto,
          monto: formData.monto,
          metodoPago: formData.metodoPago,
          observaciones: formData.observaciones
        }
      });
    } else {
      createPagoMutation.mutate({
        pacienteId: pacienteSeleccionado._id,
        fecha: new Date().toISOString(),
        tipoPago: formData.tipoPago,
        concepto: formData.concepto,
        monto: formData.monto,
        estado: 'pendiente',
        metodoPago: formData.metodoPago,
        observaciones: formData.observaciones
      });
    }
  };

  const handleMarcarPagado = (pagoId: string) => {
    marcarPagadoMutation.mutate(pagoId);
  };

  return (
    <PagosContainer>
      <Header>
        <HeaderTitle>
          <FaDollarSign style={{ marginRight: '12px' }} />
          Gestión de Pagos
        </HeaderTitle>
      </Header>

      <Content>
        <SearchSection>
          <SearchInput
            type="text"
            placeholder="Buscar paciente por nombre o CI..."
            value={pacienteSearch}
            onChange={(e) => setPacienteSearch(e.target.value)}
          />
          
          {pacientesData?.data && pacientesData.data.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              {pacientesData.data.map((paciente: any) => (
                <PacienteCard key={paciente._id} onClick={() => handlePacienteSelect(paciente)}>
                  <PacienteInfo>
                    <div>
                      <PacienteNombre>{paciente.nombre}</PacienteNombre>
                      <PacienteCI>CI: {paciente.ci}</PacienteCI>
                    </div>
                  </PacienteInfo>
                </PacienteCard>
              ))}
            </div>
          )}
        </SearchSection>

        {pacienteSeleccionado && (
          <>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Paciente: {pacienteSeleccionado.nombre}</h3>
              <ActionButton $variant="primary" onClick={handleNuevoPago}>
                <FaPlus />
                Nuevo Pago
              </ActionButton>
            </div>

            {/* Deudas Pendientes */}
            {isLoadingDeudas ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                Cargando deudas...
              </div>
            ) : deudasData && deudasData.deudas.length > 0 ? (
              <>
                <SeccionTitle>💰 Deudas Pendientes</SeccionTitle>
                <Alert $type="warning">
                  Total pendiente: ${deudasData.totalPendiente.toFixed(2)} ({deudasData.totalDeudas} {deudasData.totalDeudas === 1 ? 'deuda' : 'deudas'})
                </Alert>
                <DeudasList>
                  {deudasData.deudas.map((deuda: Deuda) => (
                    <DeudaItem key={`${deuda.tipo}-${deuda.consultaId || deuda.tratamientoId}`}>
                      <DeudaInfo>
                        <DeudaDescripcion>
                          {deuda.tipo === 'consulta' ? `Consulta #${deuda.numeroConsulta}` : deuda.nombre}
                        </DeudaDescripcion>
                        <DeudaDetalles>
                          <span><FaCalendarAlt /> {new Date(deuda.fecha).toLocaleDateString()}</span>
                          <span>Total: ${deuda.montoTotal.toFixed(2)}</span>
                          <span>Pagado: ${deuda.montoPagado.toFixed(2)}</span>
                        </DeudaDetalles>
                      </DeudaInfo>
                      <DeudaMonto>Pendiente: ${deuda.saldoPendiente.toFixed(2)}</DeudaMonto>
                    </DeudaItem>
                  ))}
                </DeudasList>
              </>
            ) : deudasData && deudasData.deudas.length === 0 ? (
              <Alert $type="info">
                No hay deudas pendientes para este paciente
              </Alert>
            ) : null}

            {/* Historial de Pagos */}
            {isLoadingHistorial ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                Cargando historial de pagos...
              </div>
            ) : historialData ? (
              <>
                <SeccionTitle>📋 Historial de Pagos</SeccionTitle>
                <EstadisticasGrid>
                  <EstadisticaCard>
                    <EstadisticaValor>${historialData.estadisticas.totalPagado.toFixed(2)}</EstadisticaValor>
                    <EstadisticaLabel>Total Pagado</EstadisticaLabel>
                  </EstadisticaCard>
                  <EstadisticaCard>
                    <EstadisticaValor>${historialData.estadisticas.totalPendiente.toFixed(2)}</EstadisticaValor>
                    <EstadisticaLabel>Total Pendiente</EstadisticaLabel>
                  </EstadisticaCard>
                  <EstadisticaCard>
                    <EstadisticaValor>{historialData.estadisticas.totalConsultas}</EstadisticaValor>
                    <EstadisticaLabel>Consultas</EstadisticaLabel>
                  </EstadisticaCard>
                  <EstadisticaCard>
                    <EstadisticaValor>{historialData.estadisticas.totalTratamientos}</EstadisticaValor>
                    <EstadisticaLabel>Tratamientos</EstadisticaLabel>
                  </EstadisticaCard>
                </EstadisticasGrid>

                <PagosList>
                  {historialData.pagos.map((pago: any) => (
                    <PagoItem key={pago._id}>
                      <PagoInfo>
                        <PagoConcepto>{pago.concepto}</PagoConcepto>
                        <PagoDetalles>
                          <span><FaCalendarAlt /> {new Date(pago.fecha).toLocaleDateString()}</span>
                          <span>Tipo: {pago.tipoPago}</span>
                          <span>Método: {pago.metodoPago}</span>
                          {(pago as any).saldoTratamiento && (
                            <span style={{ 
                              color: (pago as any).saldoTratamiento.saldoPendiente > 0 ? '#856404' : '#28a745',
                              fontWeight: 'bold'
                            }}>
                              Saldo: ${(pago as any).saldoTratamiento.saldoPendiente.toLocaleString()}
                            </span>
                          )}
                        </PagoDetalles>
                      </PagoInfo>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <PagoMonto>${pago.monto}</PagoMonto>
                        <PagoEstado $estado={pago.estado}>{pago.estado}</PagoEstado>
                        <ButtonGroup>
                          {pago.estado === 'pendiente' && (
                            <ActionButton 
                              $variant="success" 
                              onClick={() => handleMarcarPagado(pago._id)}
                              disabled={marcarPagadoMutation.isLoading}
                            >
                              <FaCheck />
                              Pagar
                            </ActionButton>
                          )}
                          <ActionButton 
                            $variant="primary" 
                            onClick={() => handleEditarPago(pago)}
                          >
                            <FaEdit />
                            Editar
                          </ActionButton>
                          <ActionButton 
                            $variant="danger" 
                            onClick={() => handleEliminarPago(pago._id)}
                            disabled={deletePagoMutation.isLoading}
                          >
                            <FaTrash />
                            Eliminar
                          </ActionButton>
                        </ButtonGroup>
                      </div>
                    </PagoItem>
                  ))}
                </PagosList>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                No hay historial de pagos para este paciente
              </div>
            )}
          </>
        )}
      </Content>

      {/* Modal para nuevo/editar pago */}
      <Modal $show={showModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{editingPago ? 'Editar Pago' : 'Nuevo Pago'}</ModalTitle>
            <CloseButton onClick={() => { setShowModal(false); setEditingPago(null); }}>×</CloseButton>
          </ModalHeader>

          <FormGroup>
            <Label>Tipo de Pago *</Label>
            <Select
              value={formData.tipoPago}
              onChange={(e) => setFormData(prev => ({ ...prev, tipoPago: e.target.value as any }))}
            >
              <option value="consulta">Consulta</option>
              <option value="tratamiento">Tratamiento</option>
              <option value="parcial">Pago Parcial</option>
              <option value="total">Pago Total</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Concepto *</Label>
            <Input
              type="text"
              value={formData.concepto}
              onChange={(e) => setFormData(prev => ({ ...prev, concepto: e.target.value }))}
              placeholder="Ej: Consulta de control, Tratamiento de conducto..."
            />
          </FormGroup>

          <FormGroup>
            <Label>Monto *</Label>
            <Input
              type="number"
              value={formData.monto}
              onChange={(e) => setFormData(prev => ({ ...prev, monto: Number(e.target.value) }))}
              placeholder="0"
              min="0"
              step="0.01"
            />
          </FormGroup>

          <FormGroup>
            <Label>Método de Pago</Label>
            <Select
              value={formData.metodoPago}
              onChange={(e) => setFormData(prev => ({ ...prev, metodoPago: e.target.value as any }))}
            >
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
              <option value="cheque">Cheque</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Observaciones</Label>
            <Input
              type="text"
              value={formData.observaciones}
              onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
              placeholder="Observaciones adicionales..."
            />
          </FormGroup>

          <ModalActions>
            <Button onClick={() => { setShowModal(false); setEditingPago(null); }}>
              Cancelar
            </Button>
            <Button $variant="primary" onClick={handleSubmit} disabled={createPagoMutation.isLoading || updatePagoMutation.isLoading}>
              {createPagoMutation.isLoading || updatePagoMutation.isLoading ? 'Guardando...' : editingPago ? 'Actualizar' : 'Crear Pago'}
            </Button>
          </ModalActions>
        </ModalContent>
      </Modal>
    </PagosContainer>
  );
};

export default PagosPage;
