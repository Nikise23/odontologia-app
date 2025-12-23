import React from 'react';
import styled from 'styled-components';
import { FaTimes, FaUser, FaIdCard, FaPhone, FaEnvelope, FaMapMarkerAlt, FaExclamationTriangle } from 'react-icons/fa';
import { Paciente } from '../../types';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 0;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
  background-color: #f8f9fa;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #e74c3c;
  }
`;

const ModalBody = styled.div`
  padding: 20px;
`;

const InfoSection = styled.div`
  margin-bottom: 25px;
`;

const SectionTitle = styled.h3`
  color: #2c3e50;
  font-size: 16px;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 2px solid #3498db;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
`;

const InfoIcon = styled.div<{ $color: string }>`
  color: ${props => props.$color};
  font-size: 16px;
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoLabel = styled.div`
  font-size: 12px;
  color: #666;
  font-weight: 500;
  text-transform: uppercase;
`;

const InfoValue = styled.div`
  font-size: 14px;
  color: #2c3e50;
  margin-top: 2px;
`;

const AnamnesisSection = styled.div`
  margin-top: 20px;
`;

const AnamnesisGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const AnamnesisItem = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: ${props => props.$active ? '#e8f5e8' : '#f8f9fa'};
  border-radius: 4px;
  border-left: 3px solid ${props => props.$active ? '#27ae60' : '#ddd'};
`;

const AnamnesisLabel = styled.span`
  font-size: 14px;
  color: #2c3e50;
`;

const AnamnesisIcon = styled.div<{ $active: boolean }>`
  color: ${props => props.$active ? '#27ae60' : '#95a5a6'};
  font-size: 14px;
`;

interface PacienteModalProps {
  paciente: Paciente;
  onClose: () => void;
}

const PacienteModal: React.FC<PacienteModalProps> = ({ paciente, onClose }) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES');
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Detalles del Paciente</ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <InfoSection>
            <SectionTitle>Información Personal</SectionTitle>
            <InfoGrid>
              <InfoItem>
                <InfoIcon $color="#3498db">
                  <FaUser />
                </InfoIcon>
                <InfoContent>
                  <InfoLabel>Nombre</InfoLabel>
                  <InfoValue>{paciente.nombre}</InfoValue>
                </InfoContent>
              </InfoItem>

              <InfoItem>
                <InfoIcon $color="#9b59b6">
                  <FaIdCard />
                </InfoIcon>
                <InfoContent>
                  <InfoLabel>Cédula</InfoLabel>
                  <InfoValue>{paciente.ci}</InfoValue>
                </InfoContent>
              </InfoItem>

              {paciente.edad && (
                <InfoItem>
                  <InfoIcon $color="#e67e22">
                    <FaUser />
                  </InfoIcon>
                  <InfoContent>
                    <InfoLabel>Edad</InfoLabel>
                    <InfoValue>{paciente.edad} años</InfoValue>
                  </InfoContent>
                </InfoItem>
              )}

              {paciente.telefono && (
                <InfoItem>
                  <InfoIcon $color="#27ae60">
                    <FaPhone />
                  </InfoIcon>
                  <InfoContent>
                    <InfoLabel>Teléfono</InfoLabel>
                    <InfoValue>{paciente.telefono}</InfoValue>
                  </InfoContent>
                </InfoItem>
              )}

              {paciente.email && (
                <InfoItem>
                  <InfoIcon $color="#e74c3c">
                    <FaEnvelope />
                  </InfoIcon>
                  <InfoContent>
                    <InfoLabel>Email</InfoLabel>
                    <InfoValue>{paciente.email}</InfoValue>
                  </InfoContent>
                </InfoItem>
              )}

              {paciente.direccion && (
                <InfoItem>
                  <InfoIcon $color="#f39c12">
                    <FaMapMarkerAlt />
                  </InfoIcon>
                  <InfoContent>
                    <InfoLabel>Dirección</InfoLabel>
                    <InfoValue>{paciente.direccion}</InfoValue>
                  </InfoContent>
                </InfoItem>
              )}

              <InfoItem>
                <InfoIcon $color="#e74c3c">
                  <FaExclamationTriangle />
                </InfoIcon>
                <InfoContent>
                  <InfoLabel>Alergias</InfoLabel>
                  <InfoValue>{paciente.alergias}</InfoValue>
                </InfoContent>
              </InfoItem>
            </InfoGrid>
          </InfoSection>

          <AnamnesisSection>
            <SectionTitle>Anamnesis</SectionTitle>
            <AnamnesisGrid>
              <AnamnesisItem $active={paciente.anamnesis?.diabetes || false}>
                <AnamnesisIcon $active={paciente.anamnesis?.diabetes || false}>
                  {paciente.anamnesis?.diabetes ? '✓' : '○'}
                </AnamnesisIcon>
                <AnamnesisLabel>Diabetes</AnamnesisLabel>
              </AnamnesisItem>

              <AnamnesisItem $active={paciente.anamnesis?.hipertension || false}>
                <AnamnesisIcon $active={paciente.anamnesis?.hipertension || false}>
                  {paciente.anamnesis?.hipertension ? '✓' : '○'}
                </AnamnesisIcon>
                <AnamnesisLabel>Hipertensión</AnamnesisLabel>
              </AnamnesisItem>

              <AnamnesisItem $active={paciente.anamnesis?.cardiopatia || false}>
                <AnamnesisIcon $active={paciente.anamnesis?.cardiopatia || false}>
                  {paciente.anamnesis?.cardiopatia ? '✓' : '○'}
                </AnamnesisIcon>
                <AnamnesisLabel>Cardiopatía</AnamnesisLabel>
              </AnamnesisItem>

              <AnamnesisItem $active={paciente.anamnesis?.embarazo || false}>
                <AnamnesisIcon $active={paciente.anamnesis?.embarazo || false}>
                  {paciente.anamnesis?.embarazo ? '✓' : '○'}
                </AnamnesisIcon>
                <AnamnesisLabel>Embarazo</AnamnesisLabel>
              </AnamnesisItem>
            </AnamnesisGrid>

            {paciente.anamnesis?.medicamentos && paciente.anamnesis.medicamentos !== 'Ninguno' && (
              <InfoItem style={{ marginTop: '15px' }}>
                <InfoIcon $color="#8e44ad">
                  💊
                </InfoIcon>
                <InfoContent>
                  <InfoLabel>Medicamentos</InfoLabel>
                  <InfoValue>{paciente.anamnesis.medicamentos}</InfoValue>
                </InfoContent>
              </InfoItem>
            )}

            {paciente.anamnesis?.antecedentesFamiliares && paciente.anamnesis.antecedentesFamiliares !== 'Ninguno' && (
              <InfoItem style={{ marginTop: '10px' }}>
                <InfoIcon $color="#16a085">
                  👥
                </InfoIcon>
                <InfoContent>
                  <InfoLabel>Antecedentes Familiares</InfoLabel>
                  <InfoValue>{paciente.anamnesis.antecedentesFamiliares}</InfoValue>
                </InfoContent>
              </InfoItem>
            )}

            {paciente.anamnesis?.observacionesMedicas && (
              <InfoItem style={{ marginTop: '10px' }}>
                <InfoIcon $color="#f39c12">
                  📝
                </InfoIcon>
                <InfoContent>
                  <InfoLabel>Observaciones Médicas</InfoLabel>
                  <InfoValue>{paciente.anamnesis.observacionesMedicas}</InfoValue>
                </InfoContent>
              </InfoItem>
            )}
          </AnamnesisSection>

          <InfoItem style={{ marginTop: '20px' }}>
            <InfoIcon $color="#95a5a6">
              📅
            </InfoIcon>
            <InfoContent>
              <InfoLabel>Fecha de Registro</InfoLabel>
              <InfoValue>{paciente.fechaRegistro ? formatDate(paciente.fechaRegistro) : 'No disponible'}</InfoValue>
            </InfoContent>
          </InfoItem>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default PacienteModal;
