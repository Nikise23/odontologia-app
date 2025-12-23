import React, { useState } from 'react';
import styled from 'styled-components';
import { FaTooth, FaStethoscope, FaDollarSign, FaPlus, FaSave } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getHistorialTratamientos, deleteTratamiento } from '../../services/tratamientoService';
import { getResumenConsultas, getConsultas, createConsulta } from '../../services/consultaService';
import { getHistorialPagos, deletePago, updatePago, marcarPagoComoPagado } from '../../services/pagoService';
import GenerarPagoModal from '../Pagos/GenerarPagoModal';
import EditarPagoModal from '../Pagos/EditarPagoModal';
import NuevoTratamientoModal from '../Tratamientos/NuevoTratamientoModal';
import { Tratamiento, Consulta, Pago } from '../../types';
import { useNotification } from '../../hooks/useNotification';
import { FaEdit, FaTrash, FaCheck } from 'react-icons/fa';

const HistorialContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 2px solid #e0e0e0;
  margin-bottom: 20px;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 12px 24px;
  border: none;
  background: ${props => props.$active ? '#007bff' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#666'};
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.$active ? '#0056b3' : '#f8f9fa'};
  }
`;

const TabContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
`;

const ListContainer = styled.div`
  max-height: 500px;
  overflow-y: auto;
`;

const ItemCard = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  background: white;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    transform: translateY(-2px);
  }
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 8px;
`;

const ItemTitle = styled.h3`
  margin: 0;
  color: #333;
  font-size: 1.1rem;
`;

const ItemStatus = styled.span<{ $status: string }>`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  background: ${props => {
    switch(props.$status) {
      case 'completado': return '#d4edda';
      case 'en_proceso': return '#fff3cd';
      case 'programado': return '#cce5ff';
      case 'cancelado': return '#f8d7da';
      case 'pagado': return '#d4edda';
      case 'pendiente': return '#fff3cd';
      default: return '#e9ecef';
    }
  }};
  color: ${props => {
    switch(props.$status) {
      case 'completado': return '#155724';
      case 'en_proceso': return '#856404';
      case 'programado': return '#004085';
      case 'cancelado': return '#721c24';
      case 'pagado': return '#155724';
      case 'pendiente': return '#856404';
      default: return '#495057';
    }
  }};
`;

const ItemDetails = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 8px;
`;

const ItemCost = styled.div`
  font-weight: bold;
  color: #28a745;
  font-size: 1.1rem;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: #666;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 1.1rem;
`;

const Button = styled.button`
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
  background: #007bff;
  color: white;

  &:hover {
    background: #0056b3;
  }
`;

const FormContainer = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #e9ecef;
`;

const FormTitle = styled.h3`
  margin: 0 0 16px 0;
  color: #333;
  font-size: 1.2rem;
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

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  box-sizing: border-box;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

interface HistorialCompletoProps {
  pacienteId: string;
}

const HistorialCompleto: React.FC<HistorialCompletoProps> = ({ pacienteId }) => {
  const [activeTab, setActiveTab] = useState<'tratamientos' | 'consultas' | 'pagos'>('tratamientos');
  const [consultaExpandidaId, setConsultaExpandidaId] = useState<string | null>(null);
  const [showGenerarPago, setShowGenerarPago] = useState(false);
  const [showEditarPago, setShowEditarPago] = useState(false);
  const [pagoSeleccionado, setPagoSeleccionado] = useState<Pago | null>(null);
  const [showNuevoTratamiento, setShowNuevoTratamiento] = useState(false);
  const [tratamientoAEditar, setTratamientoAEditar] = useState<Tratamiento | null>(null);
  const [showNuevaConsulta, setShowNuevaConsulta] = useState(false);
  const [consultaForm, setConsultaForm] = useState({
    motivoConsulta: '',
    diagnostico: '',
    observacionesGenerales: '',
    cambiosOdontograma: ''
  });

  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  // Obtener datos de tratamientos
  const { data: tratamientosData, isLoading: isLoadingTratamientos } = useQuery(
    ['historialTratamientos', pacienteId],
    () => getHistorialTratamientos(pacienteId),
    { enabled: !!pacienteId }
  );

  // Obtener datos de consultas
  const { data: consultasData, isLoading: isLoadingConsultas } = useQuery(
    ['resumenConsultas', pacienteId],
    () => getResumenConsultas(pacienteId),
    { enabled: !!pacienteId }
  );

  // Consultas completas para ver la historia (incluye diagnostico, anamnesis, etc.)
  const { data: consultasFull } = useQuery(
    ['consultasFull', pacienteId],
    () => getConsultas(pacienteId),
    { enabled: !!pacienteId }
  );

  // Obtener datos de pagos
  const { data: pagosData, isLoading: isLoadingPagos } = useQuery(
    ['historialPagos', pacienteId],
    () => getHistorialPagos(pacienteId),
    { enabled: !!pacienteId }
  );

  // Mutación para marcar pago como pagado
  const marcarPagadoMutation = useMutation(marcarPagoComoPagado, {
    onSuccess: () => {
      showNotification('Pago marcado como pagado', 'success');
      queryClient.invalidateQueries(['historialPagos', pacienteId]);
    },
    onError: (error: any) => {
      showNotification(error.response?.data?.message || 'Error al marcar pago', 'error');
    }
  });

  // Mutación para crear consulta
  const createConsultaMutation = useMutation(createConsulta, {
    onSuccess: () => {
      showNotification('Consulta creada exitosamente', 'success');
      queryClient.invalidateQueries(['resumenConsultas', pacienteId]);
      setConsultaForm({
        motivoConsulta: '',
        diagnostico: '',
        observacionesGenerales: '',
        cambiosOdontograma: ''
      });
      setShowNuevaConsulta(false);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error al crear la consulta';
      showNotification(errorMessage, 'error');
    },
  });

  const handleCreateConsulta = () => {
    if (!consultaForm.motivoConsulta.trim()) {
      showNotification('El motivo de la consulta es obligatorio', 'error');
      return;
    }

    createConsultaMutation.mutate({
      pacienteId,
      motivoConsulta: consultaForm.motivoConsulta,
      diagnostico: consultaForm.diagnostico,
      observacionesGenerales: consultaForm.observacionesGenerales,
      cambiosOdontograma: consultaForm.cambiosOdontograma,
      tratamientosRealizados: [],
      costoConsulta: 0
    });
  };

  // Función para guardar pago editado
  const handleGuardarPago = async (pagoData: Partial<Pago>) => {
    if (!pagoSeleccionado) return;
    
    try {
      await updatePago(pagoSeleccionado._id, pagoData);
      showNotification('Pago actualizado exitosamente', 'success');
      queryClient.invalidateQueries(['historialPagos', pacienteId]);
      setShowEditarPago(false);
      setPagoSeleccionado(null);
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Error al actualizar el pago', 'error');
    }
  };

  // Mutación para eliminar tratamiento
  const deleteTratamientoMutation = useMutation(deleteTratamiento, {
    onSuccess: () => {
      showNotification('Tratamiento eliminado exitosamente', 'success');
      queryClient.invalidateQueries(['historialTratamientos', pacienteId]);
      queryClient.invalidateQueries(['tratamientos', pacienteId]);
    },
    onError: (error: any) => {
      showNotification(error.response?.data?.message || 'Error al eliminar el tratamiento', 'error');
    }
  });

  const handleEditarTratamiento = (tratamiento: Tratamiento) => {
    setTratamientoAEditar(tratamiento);
    setShowNuevoTratamiento(true);
  };

  const handleEliminarTratamiento = (tratamientoId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este tratamiento? Esta acción no se puede deshacer.')) {
      deleteTratamientoMutation.mutate(tratamientoId);
    }
  };

  const handleCloseTratamientoModal = () => {
    setShowNuevoTratamiento(false);
    setTratamientoAEditar(null);
  };

  const renderTratamientos = () => {
    if (isLoadingTratamientos) return <LoadingSpinner>Cargando tratamientos...</LoadingSpinner>;
    
    const tratamientos = tratamientosData?.tratamientos || [];
    const estadisticas = tratamientosData?.estadisticas;

    return (
      <>
        {estadisticas && (
          <StatsGrid key="stats-grid">
            <StatCard key="totalTratamientos">
              <StatValue>{estadisticas.totalTratamientos}</StatValue>
              <StatLabel>Total Tratamientos</StatLabel>
            </StatCard>
            <StatCard key="completados">
              <StatValue>{estadisticas.completados}</StatValue>
              <StatLabel>Completados</StatLabel>
            </StatCard>
            <StatCard key="costoTotal">
              <StatValue>{estadisticas.costoTotal.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</StatValue>
              <StatLabel>Costo Total</StatLabel>
            </StatCard>
            <StatCard key="costoCompletados">
              <StatValue>${estadisticas.costoCompletados.toLocaleString()}</StatValue>
              <StatLabel>Costo Completados</StatLabel>
            </StatCard>
          </StatsGrid>
        )}

        <Button 
          key="button-nuevo-tratamiento"
          onClick={() => setShowNuevoTratamiento(true)}
          style={{ marginBottom: '20px' }}
        >
          <FaPlus />
          Nuevo Tratamiento
        </Button>

        <ListContainer key="list-tratamientos">
          {tratamientos.length === 0 ? (
            <EmptyState>No hay tratamientos registrados</EmptyState>
          ) : (
            tratamientos.map((tratamiento: Tratamiento) => (
              <ItemCard key={tratamiento._id}>
                <ItemHeader>
                  <ItemTitle>{tratamiento.nombre}</ItemTitle>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <ItemStatus $status={tratamiento.estado}>{tratamiento.estado}</ItemStatus>
                    <Button
                      onClick={() => handleEditarTratamiento(tratamiento)}
                      style={{ 
                        padding: '6px 12px', 
                        fontSize: '12px',
                        backgroundColor: '#f39c12',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Editar tratamiento"
                    >
                      <FaEdit />
                      Editar
                    </Button>
                    <Button
                      onClick={() => tratamiento._id && handleEliminarTratamiento(tratamiento._id)}
                      disabled={deleteTratamientoMutation.isLoading}
                      style={{ 
                        padding: '6px 12px', 
                        fontSize: '12px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: deleteTratamientoMutation.isLoading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        opacity: deleteTratamientoMutation.isLoading ? 0.6 : 1
                      }}
                      title="Eliminar tratamiento"
                    >
                      <FaTrash />
                      Eliminar
                    </Button>
                  </div>
                </ItemHeader>
                <ItemDetails>
                  <div key="tipo-tratamiento"><strong>Tipo de Tratamiento:</strong> {tratamiento.tipoTratamiento}</div>
                  <div key="pieza-dental"><strong>Pieza Dental:</strong> {tratamiento.piezaDental}</div>
                  {tratamiento.fechaProgramada && (
                    <div key="fecha-programada"><strong>Fecha Programada:</strong> {new Date(tratamiento.fechaProgramada).toLocaleDateString()}</div>
                  )}
                  {tratamiento.fechaInicio && (
                    <div key="fecha-inicio"><strong>Fecha de Inicio:</strong> {new Date(tratamiento.fechaInicio).toLocaleDateString()}</div>
                  )}
                  {tratamiento.fechaCompletado && (
                    <div key="fecha-completado"><strong>Fecha Completado:</strong> {new Date(tratamiento.fechaCompletado).toLocaleDateString()}</div>
                  )}
                  {tratamiento.descripcion && (
                    <div key="descripcion-tratamiento"><strong>Descripción:</strong> {tratamiento.descripcion}</div>
                  )}
                </ItemDetails>
                <ItemCost>{tratamiento.costo.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</ItemCost>
              </ItemCard>
            ))
          )}
        </ListContainer>
      </>
    );
  };

  const renderConsultas = () => {
    if (isLoadingConsultas) return <LoadingSpinner>Cargando consultas...</LoadingSpinner>;
    
    const consultas = consultasData?.data?.historial || [];
    const estadisticas = consultasData?.data;

    return (
      <>
        {estadisticas && (
          <StatsGrid key="stats-grid-consultas">
            <StatCard key="totalConsultas">
              <StatValue>{estadisticas.totalConsultas}</StatValue>
              <StatLabel>Total Consultas</StatLabel>
            </StatCard>
            <StatCard key="ultimaConsulta">
              <StatValue>{consultas.length > 0 ? `#${consultas[0].numeroConsulta}` : 'N/A'}</StatValue>
              <StatLabel>Última Consulta</StatLabel>
            </StatCard>
          </StatsGrid>
        )}

        <Button 
          key="button-nueva-consulta"
          onClick={() => setShowNuevaConsulta(!showNuevaConsulta)}
          style={{ marginBottom: '20px' }}
        >
          <FaPlus />
          {showNuevaConsulta ? 'Cancelar Nueva Consulta' : 'Nueva Consulta'}
        </Button>

        {showNuevaConsulta && (
          <FormContainer key="form-consulta">
            <FormTitle>Nueva Consulta - Historia Clínica</FormTitle>
            <FormGroup>
              <Label htmlFor="motivoConsulta">Motivo de la Consulta *</Label>
              <Input
                id="motivoConsulta"
                type="text"
                value={consultaForm.motivoConsulta}
                onChange={(e) => setConsultaForm(prev => ({ ...prev, motivoConsulta: e.target.value }))}
                placeholder="Ej: Dolor en muela, revisión, limpieza..."
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="diagnostico">Diagnóstico</Label>
              <TextArea
                id="diagnostico"
                value={consultaForm.diagnostico}
                onChange={(e) => setConsultaForm(prev => ({ ...prev, diagnostico: e.target.value }))}
                placeholder="Diagnóstico realizado..."
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="cambiosOdontograma">Cambios en el Odontograma</Label>
              <TextArea
                id="cambiosOdontograma"
                value={consultaForm.cambiosOdontograma}
                onChange={(e) => setConsultaForm(prev => ({ ...prev, cambiosOdontograma: e.target.value }))}
                placeholder="Describe los cambios realizados en el odontograma..."
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="observacionesGenerales">Observaciones Generales</Label>
              <TextArea
                id="observacionesGenerales"
                value={consultaForm.observacionesGenerales}
                onChange={(e) => setConsultaForm(prev => ({ ...prev, observacionesGenerales: e.target.value }))}
                placeholder="Observaciones adicionales..."
              />
            </FormGroup>
            <ButtonGroup>
              <Button 
                key="boton-guardar"
                onClick={handleCreateConsulta}
                disabled={createConsultaMutation.isLoading}
                style={{ background: '#28a745' }}
              >
                <FaSave />
                {createConsultaMutation.isLoading ? 'Guardando...' : 'Guardar Consulta'}
              </Button>
              <Button 
                key="boton-cancelar"
                onClick={() => setShowNuevaConsulta(false)}
                style={{ background: '#6c757d' }}
              >
                Cancelar
              </Button>
            </ButtonGroup>
          </FormContainer>
        )}

        <ListContainer key="list-consultas">
          {consultas.length === 0 ? (
            <EmptyState>No hay registros en la historia clínica</EmptyState>
          ) : (
            consultas.map((consulta: Consulta) => (
              <ItemCard key={consulta._id}>
                <ItemHeader>
                  <ItemTitle>Consulta #{consulta.numeroConsulta}</ItemTitle>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <ItemStatus $status={consulta.estado}>{consulta.estado}</ItemStatus>
                    <Button
                      onClick={() => setConsultaExpandidaId(prev => prev === consulta._id ? null : consulta._id)}
                      style={{ background: '#17a2b8' }}
                    >
                      {consultaExpandidaId === consulta._id ? 'Ocultar' : 'Ver historia'}
                    </Button>
                  </div>
                </ItemHeader>
                <ItemDetails>
                  <div key="fecha-consulta"><strong>Fecha:</strong> {new Date(consulta.fecha).toLocaleDateString()}</div>
                  {consulta.motivoConsulta && (
                    <div key="motivo-consulta"><strong>Motivo:</strong> {consulta.motivoConsulta}</div>
                  )}
                  {consultaExpandidaId === consulta._id && (
                    <div style={{ 
                      marginTop: 16, 
                      padding: 16, 
                      background: '#f8f9fa', 
                      borderLeft: '4px solid #17a2b8',
                      borderRadius: '4px'
                    }}>
                      {(() => {
                        // Buscar la consulta completa en consultasFull o usar la del resumen
                        // getConsultas retorna ApiResponse<Consulta[]>, así que los datos están en .data
                        const fullList = (consultasFull as any)?.data || [];
                        // Buscar por _id si está disponible, o por numeroConsulta si no
                        const det = fullList.find((c: any) => 
                          (consulta._id && c._id === consulta._id) || 
                          c.numeroConsulta === consulta.numeroConsulta
                        ) || consulta;
                        
                        const tieneInformacion = det.diagnostico || det.observacionesGenerales || det.cambiosOdontograma || 
                                                (Array.isArray(det.tratamientosRealizados) && det.tratamientosRealizados.length > 0) ||
                                                (det.anamnesis && Object.values(det.anamnesis).some((v: any) => v && v.trim()));
                        
                        if (!tieneInformacion) {
                          return (
                            <div style={{ color: '#6c757d', fontStyle: 'italic' }}>
                              No hay información adicional registrada para esta consulta.
                            </div>
                          );
                        }
                        
                        return (
                          <>
                            {det.diagnostico && (
                              <div key="diagnostico" style={{ marginBottom: 12 }}>
                                <strong>Diagnóstico:</strong> {det.diagnostico}
                              </div>
                            )}
                            {det.observacionesGenerales && (
                              <div key="observaciones" style={{ marginBottom: 12 }}>
                                <strong>Observaciones Generales:</strong> {det.observacionesGenerales}
                              </div>
                            )}
                            {det.cambiosOdontograma && (
                              <div key="cambios-odontograma" style={{ marginBottom: 12 }}>
                                <strong>Cambios en Odontograma:</strong> {det.cambiosOdontograma}
                              </div>
                            )}
                            {Array.isArray(det.tratamientosRealizados) && det.tratamientosRealizados.length > 0 && (
                              <div key="tratamientos-realizados" style={{ marginBottom: 12 }}>
                                <strong>Tratamientos Realizados:</strong>
                                <ul style={{ marginTop: 8, marginLeft: 20 }}>
                                  {det.tratamientosRealizados.map((t: any, idx: number) => (
                                    <li key={idx} style={{ marginBottom: 4 }}>
                                      <strong>{t.tratamiento}</strong>
                                      {t.piezaDental && ` - Pieza ${t.piezaDental}`}
                                      {t.costo && ` - ${typeof t.costo === 'number' ? t.costo.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2, maximumFractionDigits: 2 }) : t.costo}`}
                                      {t.observaciones && ` (${t.observaciones})`}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {det.anamnesis && (Object.values(det.anamnesis || {}).some((v: any) => v && String(v).trim())) && (
                              <div key="anamnesis" style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #dee2e6' }}>
                                <strong style={{ fontSize: '1.1rem', color: '#495057' }}>Anamnesis:</strong>
                                <div style={{ marginTop: 8, marginLeft: 8 }}>
                                  {det.anamnesis.sintomas && (
                                    <div style={{ marginBottom: 8 }}>
                                      <strong>Síntomas:</strong> {det.anamnesis.sintomas}
                                    </div>
                                  )}
                                  {det.anamnesis.alergias && (
                                    <div style={{ marginBottom: 8 }}>
                                      <strong>Alergias:</strong> {det.anamnesis.alergias}
                                    </div>
                                  )}
                                  {det.anamnesis.medicamentos && (
                                    <div style={{ marginBottom: 8 }}>
                                      <strong>Medicamentos:</strong> {det.anamnesis.medicamentos}
                                    </div>
                                  )}
                                  {det.anamnesis.antecedentesClinicos && (
                                    <div style={{ marginBottom: 8 }}>
                                      <strong>Antecedentes Clínicos:</strong> {det.anamnesis.antecedentesClinicos}
                                    </div>
                                  )}
                                  {det.anamnesis.examenFisico && (
                                    <div style={{ marginBottom: 8 }}>
                                      <strong>Examen Físico:</strong> {det.anamnesis.examenFisico}
                                    </div>
                                  )}
                                  {det.anamnesis.planTratamiento && (
                                    <div style={{ marginBottom: 8 }}>
                                      <strong>Plan de Tratamiento:</strong> {det.anamnesis.planTratamiento}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}
                </ItemDetails>
              </ItemCard>
            ))
          )}
        </ListContainer>
      </>
    );
  };

  const renderPagos = () => {
    if (isLoadingPagos) return <LoadingSpinner>Cargando pagos...</LoadingSpinner>;
    
    const pagos = pagosData?.pagos || [];
    const estadisticas = pagosData?.estadisticas;

    const handleEliminarPago = async (pago: Pago) => {
      if (!window.confirm(`¿Eliminar el pago "${pago.concepto}" por $${pago.monto.toLocaleString()}?`)) return;
      try {
        await deletePago(pago._id);
        showNotification('Pago eliminado correctamente', 'success');
        queryClient.invalidateQueries(['historialPagos', pacienteId]);
      } catch (e) {
        showNotification('Error al eliminar el pago', 'error');
      }
    };

    // Verificar si se puede eliminar (ahora siempre se puede eliminar)
    const puedeEliminar = (pago: Pago): boolean => {
      return true; // Se pueden eliminar pagos sin restricción de tiempo
    };

    const handleEditarPago = (pago: Pago) => {
      setPagoSeleccionado(pago);
      setShowEditarPago(true);
    };

    return (
      <>
        {estadisticas && (
          <StatsGrid key="stats-grid-pagos">
            <StatCard key="totalPagado">
              <StatValue>${estadisticas.totalPagado.toLocaleString()}</StatValue>
              <StatLabel>Total Pagado</StatLabel>
            </StatCard>
            <StatCard key="totalPendiente">
              <StatValue>${estadisticas.totalPendiente.toLocaleString()}</StatValue>
              <StatLabel>Pendiente</StatLabel>
            </StatCard>
            <StatCard key="pagosConsultas">
              <StatValue>{estadisticas.totalConsultas}</StatValue>
              <StatLabel>Pagos Consultas</StatLabel>
            </StatCard>
            <StatCard key="pagosTratamientos">
              <StatValue>{estadisticas.totalTratamientos}</StatValue>
              <StatLabel>Pagos Tratamientos</StatLabel>
            </StatCard>
          </StatsGrid>
        )}

        <Button 
          key="button-generar-pago"
          onClick={() => setShowGenerarPago(true)}
          style={{ marginBottom: '20px' }}
        >
          <FaPlus />
          Generar Pago
        </Button>

        <ListContainer key="list-pagos">
          {pagos.length === 0 ? (
            <EmptyState>No hay pagos registrados</EmptyState>
          ) : (
            pagos.map((pago: Pago) => (
              <ItemCard key={pago._id}>
                <ItemHeader>
                  <ItemTitle>{pago.concepto}</ItemTitle>
                  <ItemStatus $status={pago.estado}>{pago.estado}</ItemStatus>
                </ItemHeader>
                <ItemDetails>
                  <div key="fecha-pago"><strong>Fecha:</strong> {new Date(pago.fecha).toLocaleDateString()}</div>
                  <div key="tipo-pago"><strong>Tipo:</strong> {pago.tipoPago}</div>
                  <div key="metodo-pago"><strong>Método:</strong> {pago.metodoPago}</div>
                  {(pago as any).saldoTratamiento && (
                    <div key="saldo-tratamiento" style={{ 
                      background: '#fff3cd', 
                      padding: '8px', 
                      borderRadius: '4px', 
                      marginTop: '8px',
                      borderLeft: '3px solid #ffc107'
                    }}>
                      <strong>Información del Tratamiento:</strong><br />
                      Costo Total: {(pago as any).saldoTratamiento.costoTotal.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br />
                      Total Pagado: {(pago as any).saldoTratamiento.totalPagado.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br />
                      <strong style={{ color: (pago as any).saldoTratamiento.saldoPendiente > 0 ? '#856404' : '#28a745' }}>
                        Saldo Restante: {(pago as any).saldoTratamiento.saldoPendiente.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </strong>
                      {(pago as any).saldoTratamiento.estaCompletamentePagado && (
                        <span style={{ marginLeft: '8px', color: '#28a745' }}>✓ Completamente pagado</span>
                      )}
                    </div>
                  )}
                  {pago.observaciones && (
                    <div key="observaciones-pago"><strong>Observaciones:</strong> {pago.observaciones}</div>
                  )}
                </ItemDetails>
                <ItemCost>${pago.monto.toLocaleString()}</ItemCost>
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  {pago.estado === 'pendiente' && (
                    <Button 
                      onClick={() => marcarPagadoMutation.mutate(pago._id)}
                      disabled={marcarPagadoMutation.isLoading}
                      style={{ 
                        background: '#28a745', 
                        fontSize: '0.85rem', 
                        padding: '6px 12px',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Marcar como pagado"
                    >
                      <FaCheck /> Pagar
                    </Button>
                  )}
                  <Button 
                    onClick={() => handleEditarPago(pago)} 
                    style={{ 
                      background: '#17a2b8', 
                      fontSize: '0.85rem', 
                      padding: '6px 12px',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <FaEdit /> Editar
                  </Button>
                  <Button 
                    onClick={() => handleEliminarPago(pago)}
                    style={{ 
                      background: '#dc3545',
                      fontSize: '0.85rem',
                      padding: '6px 12px',
                      opacity: 1,
                      cursor: 'pointer',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Eliminar pago"
                  >
                    <FaTrash /> Eliminar
                  </Button>
                </div>
              </ItemCard>
            ))
          )}
        </ListContainer>
      </>
    );
  };

  return (
    <HistorialContainer>
      <TabsContainer>
        <Tab 
          $active={activeTab === 'tratamientos'} 
          onClick={() => setActiveTab('tratamientos')}
        >
          <FaTooth />
          Tratamientos
        </Tab>
        <Tab 
          $active={activeTab === 'consultas'} 
          onClick={() => setActiveTab('consultas')}
        >
          <FaStethoscope />
          Historia clínica
        </Tab>
        <Tab 
          $active={activeTab === 'pagos'} 
          onClick={() => setActiveTab('pagos')}
        >
          <FaDollarSign />
          Pagos
        </Tab>
      </TabsContainer>

      <TabContent>
        {activeTab === 'tratamientos' && renderTratamientos()}
        {activeTab === 'consultas' && renderConsultas()}
        {activeTab === 'pagos' && renderPagos()}
      </TabContent>

      <GenerarPagoModal
        show={showGenerarPago}
        onClose={() => setShowGenerarPago(false)}
        pacienteId={pacienteId}
      />

      <EditarPagoModal
        show={showEditarPago}
        onClose={() => {
          setShowEditarPago(false);
          setPagoSeleccionado(null);
        }}
        pago={pagoSeleccionado}
        onSave={handleGuardarPago}
      />

      <NuevoTratamientoModal
        show={showNuevoTratamiento}
        onClose={handleCloseTratamientoModal}
        pacienteId={pacienteId}
        tratamiento={tratamientoAEditar}
      />
    </HistorialContainer>
  );
};

export default HistorialCompleto;
