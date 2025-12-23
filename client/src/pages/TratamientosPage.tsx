import React from 'react';
import styled from 'styled-components';
import { FaStethoscope, FaPlus, FaEye, FaTooth, FaDollarSign } from 'react-icons/fa';
import { useQuery } from 'react-query';
import { getPacientes } from '../services/pacienteService';

const PageContainer = styled.div`
  padding: 30px;
  background-color: #f8f9fa;
  min-height: 100vh;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const PageTitle = styled.h1`
  color: #2c3e50;
  font-size: 28px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 15px;
`;

const PageSubtitle = styled.p`
  color: #7f8c8d;
  font-size: 16px;
  margin: 10px 0 0 0;
`;

const NuevoButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background-color: #8e44ad;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #7d3c98;
  }
`;

const ContentCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

const PacientesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const PacienteCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border-left: 4px solid #8e44ad;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  }
`;

const PacienteName = styled.h3`
  color: #2c3e50;
  margin: 0 0 10px 0;
  font-size: 18px;
`;

const PacienteInfo = styled.div`
  color: #7f8c8d;
  font-size: 14px;
  margin-bottom: 15px;
`;

const PacienteActions = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  background-color: ${props => props.$color};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.3s ease;
  
  &:hover {
    opacity: 0.8;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 50px;
  color: #666;
`;

const TratamientosPage: React.FC = () => {
  const { data: pacientesData, isLoading } = useQuery(
    ['pacientes'],
    () => getPacientes(1, 50, ''),
    {
      refetchOnWindowFocus: false,
    }
  );

  const pacientes = pacientesData?.data || [];

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingMessage>Cargando pacientes...</LoadingMessage>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <div>
          <PageTitle>
            <FaStethoscope />
            Gestión de Tratamientos
          </PageTitle>
          <PageSubtitle>
            Administra tratamientos, odontogramas y pagos de todos los pacientes
          </PageSubtitle>
        </div>
        <NuevoButton>
          <FaPlus />
          Nuevo Tratamiento
        </NuevoButton>
      </PageHeader>
      
      <ContentCard>
        <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>
          Selecciona un paciente para gestionar sus tratamientos, odontograma y pagos:
        </h2>
        
        {pacientes.length === 0 ? (
          <p style={{ color: '#7f8c8d', textAlign: 'center', padding: '40px' }}>
            No hay pacientes registrados
          </p>
        ) : (
          <PacientesGrid>
            {pacientes.map((paciente) => (
              <PacienteCard key={paciente._id}>
                <PacienteName>{paciente.nombre}</PacienteName>
                <PacienteInfo>
                  <div><strong>CI:</strong> {paciente.ci}</div>
                  <div><strong>Edad:</strong> {paciente.edad || 'No especificada'}</div>
                  <div><strong>Alergias:</strong> {paciente.alergias || 'Ninguna'}</div>
                </PacienteInfo>
                <PacienteActions>
                  <ActionButton 
                    $color="#8e44ad"
                    onClick={() => window.location.href = `/pacientes/${paciente._id}#tratamientos`}
                  >
                    <FaEye />
                    Ver Tratamientos
                  </ActionButton>
                  <ActionButton 
                    $color="#e74c3c"
                    onClick={() => window.location.href = `/pacientes/${paciente._id}/odontograma`}
                  >
                    <FaTooth />
                    Odontograma
                  </ActionButton>
                  <ActionButton 
                    $color="#27ae60"
                    onClick={() => window.location.href = `/pacientes/${paciente._id}/pagos`}
                  >
                    <FaDollarSign />
                    Pagos
                  </ActionButton>
                </PacienteActions>
              </PacienteCard>
            ))}
          </PacientesGrid>
        )}
      </ContentCard>
    </PageContainer>
  );
};

export default TratamientosPage;
