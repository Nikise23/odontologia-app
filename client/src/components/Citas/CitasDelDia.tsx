import React, { useState } from 'react';
import styled from 'styled-components';
import { FaCalendarAlt, FaTimes, FaStethoscope, FaPlus } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { getCitasDelDia, marcarCitaComoAtendida, marcarCitaComoAusente } from '../../services/citaService';
import { useNotification } from '../../hooks/useNotification';
import NuevaCitaModal from './NuevaCitaModal';

const CitasContainer = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

const DateSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const DateInput = styled.input`
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 14px;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
  
  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const NuevaCitaButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const Content = styled.div`
  padding: 25px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatItem = styled.div<{ $color?: string }>`
  text-align: center;
  padding: 15px;
  background: ${props => props.$color || '#f8f9fa'};
  border-radius: 8px;
  border: 1px solid #e9ecef;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #6c757d;
  text-transform: uppercase;
  font-weight: 600;
`;

const CitasList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const CitaItem = styled.div<{ $estado: string }>`
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  background: white;
  border-left: 4px solid ${props => {
    switch (props.$estado) {
      case 'programada': return '#ffc107';
      case 'confirmada': return '#17a2b8';
      case 'en_progreso': return '#fd7e14';
      case 'completada': return '#28a745';
      case 'ausente': return '#dc3545';
      case 'cancelada': return '#6c757d';
      default: return '#e9ecef';
    }
  }};
`;

const CitaHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const CitaInfo = styled.div`
  .hora {
    font-size: 18px;
    font-weight: 700;
    color: #2c3e50;
  }
  
  .tipo {
    font-size: 14px;
    color: #6c757d;
    text-transform: uppercase;
    font-weight: 600;
  }
`;

const CitaEstado = styled.div<{ $estado: string }>`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background-color: ${props => {
    switch (props.$estado) {
      case 'programada': return '#fff3cd';
      case 'confirmada': return '#d1ecf1';
      case 'en_progreso': return '#ffeaa7';
      case 'completada': return '#d4edda';
      case 'ausente': return '#f8d7da';
      case 'cancelada': return '#e2e3e5';
      default: return '#e2e3e5';
    }
  }};
  color: ${props => {
    switch (props.$estado) {
      case 'programada': return '#856404';
      case 'confirmada': return '#0c5460';
      case 'en_progreso': return '#856404';
      case 'completada': return '#155724';
      case 'ausente': return '#721c24';
      case 'cancelada': return '#383d41';
      default: return '#383d41';
    }
  }};
`;

const PacienteInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
`;

const PacienteAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #007bff, #0056b3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
`;

const PacienteDetails = styled.div`
  .nombre {
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 2px;
  }
  
  .ci {
    font-size: 14px;
    color: #6c757d;
  }
`;

const Motivo = styled.div`
  margin-bottom: 15px;
  
  .label {
    font-size: 12px;
    color: #6c757d;
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 5px;
  }
  
  .texto {
    color: #2c3e50;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const ActionButton = styled.button<{ $variant: 'success' | 'danger' | 'primary' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  
  ${props => {
    switch (props.$variant) {
      case 'success':
        return `
          background: #28a745;
          color: white;
          &:hover { background: #218838; }
        `;
      case 'danger':
        return `
          background: #dc3545;
          color: white;
          &:hover { background: #c82333; }
        `;
      case 'primary':
        return `
          background: #007bff;
          color: white;
          &:hover { background: #0056b3; }
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

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #6c757d;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #dc3545;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #6c757d;
  
  .icon {
    font-size: 48px;
    margin-bottom: 15px;
    opacity: 0.5;
  }
`;

interface CitasDelDiaProps {
  fecha?: string;
}

const CitasDelDia: React.FC<CitasDelDiaProps> = ({ fecha }) => {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(fecha || new Date().toISOString().split('T')[0]);
  const [mostrarModalNuevaCita, setMostrarModalNuevaCita] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  const { data: citasData, isLoading, error } = useQuery(
    ['citasDelDia', fechaSeleccionada],
    () => getCitasDelDia(fechaSeleccionada),
    {
      enabled: !!fechaSeleccionada,
    }
  );

  const marcarAtendidaMutation = useMutation(marcarCitaComoAtendida, {
    onSuccess: () => {
      queryClient.invalidateQueries(['citasDelDia', fechaSeleccionada]);
      showNotification('Cita marcada como atendida', 'success');
    },
    onError: () => {
      showNotification('Error al marcar la cita como atendida', 'error');
    }
  });

  const marcarAusenteMutation = useMutation(marcarCitaComoAusente, {
    onSuccess: () => {
      queryClient.invalidateQueries(['citasDelDia', fechaSeleccionada]);
      showNotification('Cita marcada como ausente', 'success');
    },
    onError: () => {
      showNotification('Error al marcar la cita como ausente', 'error');
    }
  });

  const handleAtender = (citaId: string, pacienteId: string) => {
    // Marcar como atendida y navegar al odontograma
    marcarAtendidaMutation.mutate(citaId);
    navigate(`/paciente/${pacienteId}/tratamiento`);
  };

  const handleAusente = (citaId: string) => {
    marcarAusenteMutation.mutate(citaId);
  };

  const handleNuevaCita = () => {
    setMostrarModalNuevaCita(true);
  };

  if (isLoading) {
    return (
      <CitasContainer>
        <LoadingMessage>Cargando citas del día...</LoadingMessage>
      </CitasContainer>
    );
  }

  if (error) {
    return (
      <CitasContainer>
        <ErrorMessage>Error al cargar las citas</ErrorMessage>
      </CitasContainer>
    );
  }

  const citas = citasData?.data || [];
  
  // Calcular estadísticas
  const estadisticas = {
    total: citas.length,
    programadas: citas.filter(c => c.estado === 'programada').length,
    confirmadas: citas.filter(c => c.estado === 'confirmada').length,
    completadas: citas.filter(c => c.estado === 'completada').length,
    ausentes: citas.filter(c => c.estado === 'ausente').length,
  };

  return (
    <CitasContainer>
      <Header>
        <HeaderLeft>
          <FaCalendarAlt />
          <HeaderTitle>Citas del Día</HeaderTitle>
        </HeaderLeft>
        <DateSelector>
          <DateInput
            type="date"
            value={fechaSeleccionada}
            onChange={(e) => setFechaSeleccionada(e.target.value)}
          />
          <NuevaCitaButton onClick={handleNuevaCita}>
            <FaPlus />
            Nueva Cita
          </NuevaCitaButton>
        </DateSelector>
      </Header>

      <Content>
        <StatsGrid>
          <StatItem>
            <StatValue>{estadisticas.total}</StatValue>
            <StatLabel>Total</StatLabel>
          </StatItem>
          <StatItem $color="#fff3cd">
            <StatValue>{estadisticas.programadas}</StatValue>
            <StatLabel>Programadas</StatLabel>
          </StatItem>
          <StatItem $color="#d1ecf1">
            <StatValue>{estadisticas.confirmadas}</StatValue>
            <StatLabel>Confirmadas</StatLabel>
          </StatItem>
          <StatItem $color="#d4edda">
            <StatValue>{estadisticas.completadas}</StatValue>
            <StatLabel>Completadas</StatLabel>
          </StatItem>
          <StatItem $color="#f8d7da">
            <StatValue>{estadisticas.ausentes}</StatValue>
            <StatLabel>Ausentes</StatLabel>
          </StatItem>
        </StatsGrid>

        {citas.length > 0 ? (
          <CitasList>
            {citas.map((cita: any) => (
              <CitaItem key={cita._id} $estado={cita.estado}>
                <CitaHeader>
                  <CitaInfo>
                    <div className="hora">{cita.hora}</div>
                    <div className="tipo">{cita.tipoCita}</div>
                  </CitaInfo>
                  <CitaEstado $estado={cita.estado}>
                    {cita.estado.replace('_', ' ')}
                  </CitaEstado>
                </CitaHeader>

                <PacienteInfo>
                  <PacienteAvatar>
                    {cita.pacienteId?.nombre?.charAt(0) || '?'}
                  </PacienteAvatar>
                  <PacienteDetails>
                    <div className="nombre">{cita.pacienteId?.nombre || 'Paciente no encontrado'}</div>
                    <div className="ci">CI: {cita.pacienteId?.ci || 'N/A'}</div>
                  </PacienteDetails>
                </PacienteInfo>

                {cita.motivo && (
                  <Motivo>
                    <div className="label">Motivo</div>
                    <div className="texto">{cita.motivo}</div>
                  </Motivo>
                )}

                <Actions>
                  {cita.estado === 'programada' || cita.estado === 'confirmada' ? (
                    <>
                      <ActionButton
                        $variant="success"
                        onClick={() => handleAtender(cita._id, cita.pacienteId._id || cita.pacienteId)}
                        disabled={marcarAtendidaMutation.isLoading}
                      >
                        <FaStethoscope />
                        Atender
                      </ActionButton>
                      <ActionButton
                        $variant="danger"
                        onClick={() => handleAusente(cita._id)}
                        disabled={marcarAusenteMutation.isLoading}
                      >
                        <FaTimes />
                        Ausente
                      </ActionButton>
                    </>
                  ) : cita.estado === 'completada' ? (
                    <ActionButton
                      $variant="primary"
                      onClick={() => navigate(`/paciente/${cita.pacienteId._id || cita.pacienteId}/tratamiento`)}
                    >
                      <FaStethoscope />
                      Ver Consulta
                    </ActionButton>
                  ) : null}
                </Actions>
              </CitaItem>
            ))}
          </CitasList>
        ) : (
          <EmptyMessage>
            <div className="icon">
              <FaCalendarAlt />
            </div>
            <div>No hay citas programadas para este día</div>
          </EmptyMessage>
        )}
      </Content>

      {mostrarModalNuevaCita && (
        <NuevaCitaModal onClose={() => setMostrarModalNuevaCita(false)} />
      )}
    </CitasContainer>
  );
};

export default CitasDelDia;
