import React from 'react';
import styled from 'styled-components';
import { FaBox, FaBoxes, FaPlus } from 'react-icons/fa';

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
  background-color: #f39c12;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #e67e22;
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
  color: #f39c12;
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

const InventarioPage: React.FC = () => {
  return (
    <PageContainer>
      <PageHeader>
        <div>
          <PageTitle>
            <FaBox />
            Gestión de Inventario
          </PageTitle>
          <PageSubtitle>
            Controla el inventario de materiales y equipos dentales
          </PageSubtitle>
        </div>
        <NuevoButton>
          <FaPlus />
          Nuevo Item
        </NuevoButton>
      </PageHeader>
      
      <ContentCard>
        <ComingSoonIcon>
          <FaBoxes />
        </ComingSoonIcon>
        <ComingSoonTitle>Próximamente</ComingSoonTitle>
        <ComingSoonText>
          Esta funcionalidad estará disponible en una próxima actualización.
        </ComingSoonText>
        <FeatureList>
          <li>📦 Control de materiales dentales</li>
          <li>🔧 Gestión de equipos</li>
          <li>📊 Reportes de inventario</li>
          <li>⚠️ Alertas de stock bajo</li>
          <li>📈 Análisis de consumo</li>
          <li>🛒 Órdenes de compra</li>
        </FeatureList>
      </ContentCard>
    </PageContainer>
  );
};

export default InventarioPage;
