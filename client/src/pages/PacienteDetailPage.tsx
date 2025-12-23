import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useQuery } from 'react-query';
import { getPaciente } from '../services/pacienteService';

const PacienteDetailContainer = styled.div`
  padding: 20px;
  background-color: #ffffff;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const PacienteTitle = styled.h1`
  color: #2c3e50;
  font-size: 24px;
  margin: 0;
`;

const NavigationTabs = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  background-color: ${props => props.$active ? '#3498db' : '#ecf0f1'};
  color: ${props => props.$active ? 'white' : '#2c3e50'};
  
  &:hover {
    background-color: ${props => props.$active ? '#2980b9' : '#d5dbdb'};
  }
`;

const ContentArea = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  min-height: 400px;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 50px;
  color: #666;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 50px;
  color: #e74c3c;
`;

const PacienteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('odontograma');

  // Detectar hash en la URL para cambiar la pestaña activa
  useEffect(() => {
    const hash = window.location.hash.substring(1); // Remover el #
    if (hash && ['odontograma', 'pagos', 'tratamientos'].includes(hash)) {
      setActiveTab(hash);
    }
  }, []);

  const { data: pacienteData, isLoading, error } = useQuery(
    ['paciente', id],
    () => getPaciente(id!),
    {
      enabled: !!id,
    }
  );

  if (isLoading) {
    return (
      <PacienteDetailContainer>
        <LoadingMessage>Cargando información del paciente...</LoadingMessage>
      </PacienteDetailContainer>
    );
  }

  if (error) {
    return (
      <PacienteDetailContainer>
        <ErrorMessage>Error cargando la información del paciente</ErrorMessage>
      </PacienteDetailContainer>
    );
  }

  const paciente = pacienteData?.data;

  if (!paciente) {
    return (
      <PacienteDetailContainer>
        <ErrorMessage>Paciente no encontrado</ErrorMessage>
      </PacienteDetailContainer>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'odontograma':
        return (
          <div>
            <h3>Odontograma</h3>
            <p>Aquí se mostraría el componente del odontograma interactivo.</p>
          </div>
        );
      case 'pagos':
        return (
          <div>
            <h3>Historial de Pagos</h3>
            <p>Aquí se mostraría el historial de pagos del paciente.</p>
          </div>
        );
      case 'tratamientos':
        return (
          <div>
            <h3>Tratamientos Realizados</h3>
            <div style={{ marginBottom: '20px' }}>
              <p><strong>Paciente:</strong> {paciente.nombre}</p>
              <p><strong>CI:</strong> {paciente.ci}</p>
              <p><strong>Alergias:</strong> {paciente.alergias || 'Ninguna'}</p>
            </div>
            
            <div style={{ 
              background: 'white', 
              padding: '20px', 
              borderRadius: '8px',
              border: '1px solid #e0e0e0'
            }}>
              <h4>Historial de Tratamientos</h4>
              <p style={{ color: '#666', fontStyle: 'italic' }}>
                Aquí se mostrarían los tratamientos dentales realizados, incluyendo:
              </p>
              <ul style={{ color: '#666', marginTop: '10px' }}>
                <li>Fecha del tratamiento</li>
                <li>Tipo de procedimiento</li>
                <li>Pieza dental tratada</li>
                <li>Costo del tratamiento</li>
                <li>Observaciones del dentista</li>
              </ul>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <PacienteDetailContainer>
      <Header>
        <PacienteTitle>{paciente.nombre}</PacienteTitle>
      </Header>

      <NavigationTabs>
        <TabButton 
          $active={activeTab === 'odontograma'}
          onClick={() => setActiveTab('odontograma')}
        >
          Odontograma
        </TabButton>
        <TabButton 
          $active={activeTab === 'pagos'}
          onClick={() => setActiveTab('pagos')}
        >
          Pagos
        </TabButton>
        <TabButton 
          $active={activeTab === 'tratamientos'}
          onClick={() => setActiveTab('tratamientos')}
        >
          Tratamientos
        </TabButton>
      </NavigationTabs>

      <ContentArea>
        {renderTabContent()}
      </ContentArea>
    </PacienteDetailContainer>
  );
};

export default PacienteDetailPage;
