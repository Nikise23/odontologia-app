import React from 'react';
import styled from 'styled-components';
import { FaPills, FaPrescriptionBottleAlt, FaPlus } from 'react-icons/fa';

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
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #229954;
  }
`;

const ContentCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  text-align: center;
`;

const ComingSoonIcon = styled.div`
  font-size: 64px;
  color: #27ae60;
  margin-bottom: 20px;
`;

const ComingSoonTitle = styled.h2`
  color: #2c3e50;
  font-size: 24px;
  margin-bottom: 15px;
`;

const ComingSoonText = styled.p`
  color: #7f8c8d;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 20px;
`;

const FeatureList = styled.ul`
  text-align: left;
  color: #7f8c8d;
  font-size: 14px;
  line-height: 1.8;
  max-width: 400px;
  margin: 0 auto;
`;

const MedicamentosPage: React.FC = () => {
  return (
    <PageContainer>
      <PageHeader>
        <div>
          <PageTitle>
            <FaPills />
            Gestión de Medicamentos
          </PageTitle>
          <PageSubtitle>
            Administra el inventario de medicamentos y recetas
          </PageSubtitle>
        </div>
        <NuevoButton>
          <FaPlus />
          Nuevo Medicamento
        </NuevoButton>
      </PageHeader>
      
      <ContentCard>
        <ComingSoonIcon>
          <FaPrescriptionBottleAlt />
        </ComingSoonIcon>
        <ComingSoonTitle>Próximamente</ComingSoonTitle>
        <ComingSoonText>
          Esta funcionalidad estará disponible en una próxima actualización.
        </ComingSoonText>
        <FeatureList>
          <li>💊 Inventario de medicamentos</li>
          <li>📋 Recetas digitales</li>
          <li>⚠️ Alertas de vencimiento</li>
          <li>📊 Control de stock</li>
          <li>🏥 Interacción con pacientes</li>
          <li>📈 Reportes de consumo</li>
        </FeatureList>
      </ContentCard>
    </PageContainer>
  );
};

export default MedicamentosPage;
