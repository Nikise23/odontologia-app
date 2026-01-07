import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import styled from 'styled-components';
import { FaArrowLeft, FaUser, FaTooth, FaDollarSign, FaNotesMedical } from 'react-icons/fa';
import { getPaciente, getOdontograma, saveOdontograma } from '../services/pacienteService';
import { useNotification } from '../hooks/useNotification';
import Odontograma from '../components/Odontograma/Odontograma';
import HistorialCompleto from '../components/Historial/HistorialCompleto';
import { getConsultas } from '../services/consultaService';

const PageContainer = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e9ecef;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;

  &:hover {
    background: #5a6268;
  }
`;

const Title = styled.h1`
  margin: 0;
  color: #2c3e50;
  font-size: 28px;
  font-weight: 700;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const FullWidthSection = styled.div`
  grid-column: 1 / -1;
`;

const Section = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
`;

const SectionHeader = styled.div`
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

const SectionContent = styled.div`
  padding: 25px;
`;

const PatientInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
`;

const InfoItem = styled.div`
  .label {
    font-size: 12px;
    color: #6c757d;
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 5px;
  }
  
  .value {
    font-size: 16px;
    color: #2c3e50;
    font-weight: 500;
  }
`;

const OdontogramaSection = styled.div`
  grid-column: 1 / -1;
`;


const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #6c757d;
  font-size: 16px;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #dc3545;
  font-size: 16px;
`;

const PacienteCompletoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();
  const [isSaving, setIsSaving] = useState(false);

  // Obtener datos del paciente
  const { data: paciente, isLoading, error } = useQuery(
    ['paciente', id],
    () => getPaciente(id!),
    {
      enabled: !!id,
    }
  );

  // Obtener datos del odontograma
  const { data: odontogramaResponse } = useQuery(
    ['odontograma', id],
    () => getOdontograma(id!),
    {
      enabled: !!id,
    }
  );
  
  const odontogramaData = odontogramaResponse?.data;

  // Obtener consultas (opcional, para historial)
  const { data: consultasPaciente } = useQuery(
    ['consultasPaciente', id],
    () => getConsultas(id!),
    { enabled: !!id }
  );

  const handleSaveOdontograma = async (data: any) => {
    if (!data.pacienteId) {
      showNotification('Error: ID del paciente no válido', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const response = await saveOdontograma(data);
      
      if (response.success) {
        showNotification('Odontograma guardado exitosamente', 'success');
        queryClient.invalidateQueries(['odontograma', id]);
      } else {
        showNotification('Error al guardar el odontograma', 'error');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al guardar el odontograma';
      showNotification(errorMessage, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingMessage>Cargando información del paciente...</LoadingMessage>
      </PageContainer>
    );
  }

  if (error || !paciente?.data) {
    return (
      <PageContainer>
        <ErrorMessage>Error al cargar la información del paciente</ErrorMessage>
      </PageContainer>
    );
  }

  const pacienteData = paciente.data;

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={() => navigate('/pacientes')}>
          <FaArrowLeft />
          Volver a Pacientes
        </BackButton>
        <Title>Tratamiento - {pacienteData.nombre}</Title>
      </Header>

      <ContentGrid>
        {/* Información del Paciente */}
        <Section>
          <SectionHeader>
            <FaUser />
            <SectionTitle>Información del Paciente</SectionTitle>
          </SectionHeader>
          <SectionContent>
            <PatientInfo>
              <InfoItem>
                <div className="label">Nombre</div>
                <div className="value">{pacienteData.nombre}</div>
              </InfoItem>
              <InfoItem>
                <div className="label">CI</div>
                <div className="value">{pacienteData.ci}</div>
              </InfoItem>
              <InfoItem>
                <div className="label">Teléfono</div>
                <div className="value">{pacienteData.telefono || 'No especificado'}</div>
              </InfoItem>
              <InfoItem>
                <div className="label">Email</div>
                <div className="value">{pacienteData.email || 'No especificado'}</div>
              </InfoItem>
              <InfoItem>
                <div className="label">Fecha de Nacimiento</div>
                <div className="value">
                  {pacienteData.fechaNacimiento 
                    ? (() => {
                        const fecha = new Date(pacienteData.fechaNacimiento);
                        // Usar métodos UTC para evitar problemas de zona horaria
                        const year = fecha.getUTCFullYear();
                        const month = String(fecha.getUTCMonth() + 1).padStart(2, '0');
                        const day = String(fecha.getUTCDate()).padStart(2, '0');
                        return `${day}/${month}/${year}`;
                      })()
                    : 'No especificada'}
                </div>
              </InfoItem>
              {pacienteData.edad && (
                <InfoItem>
                  <div className="label">Edad</div>
                  <div className="value">{pacienteData.edad} años</div>
                </InfoItem>
              )}
              <InfoItem>
                <div className="label">Dirección</div>
                <div className="value">{pacienteData.direccion || 'No especificada'}</div>
              </InfoItem>
              {pacienteData.obraSocial && (
                <InfoItem>
                  <div className="label">Obra Social</div>
                  <div className="value">{pacienteData.obraSocial}</div>
                </InfoItem>
              )}
              {pacienteData.numeroAfiliado && (
                <InfoItem>
                  <div className="label">N° de Afiliado</div>
                  <div className="value">{pacienteData.numeroAfiliado}</div>
                </InfoItem>
              )}
            </PatientInfo>
          </SectionContent>
        </Section>

        {/* Anamnesis del paciente */}
        <Section>
          <SectionHeader>
            <FaNotesMedical />
            <SectionTitle>Anamnesis</SectionTitle>
          </SectionHeader>
          <SectionContent>
            {pacienteData.anamnesis && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {(pacienteData.anamnesis.diabetes || 
                  pacienteData.anamnesis.hipertension || 
                  pacienteData.anamnesis.cardiopatia || 
                  pacienteData.anamnesis.embarazo) && (
                  <div style={{ gridColumn: '1 / -1', marginBottom: '10px' }}>
                    <div className="label" style={{ marginBottom: '8px' }}>Condiciones Médicas</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {pacienteData.anamnesis.diabetes && (
                        <span style={{ 
                          padding: '4px 12px', 
                          background: '#e74c3c', 
                          color: 'white', 
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}>Diabetes</span>
                      )}
                      {pacienteData.anamnesis.hipertension && (
                        <span style={{ 
                          padding: '4px 12px', 
                          background: '#e74c3c', 
                          color: 'white', 
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}>Hipertensión</span>
                      )}
                      {pacienteData.anamnesis.cardiopatia && (
                        <span style={{ 
                          padding: '4px 12px', 
                          background: '#e74c3c', 
                          color: 'white', 
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}>Cardiopatía</span>
                      )}
                      {pacienteData.anamnesis.embarazo && (
                        <span style={{ 
                          padding: '4px 12px', 
                          background: '#e74c3c', 
                          color: 'white', 
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}>Embarazo</span>
                      )}
                    </div>
                  </div>
                )}
                {pacienteData.anamnesis.medicamentos && pacienteData.anamnesis.medicamentos !== 'Ninguno' && (
                  <div>
                    <div className="label">Medicamentos</div>
                    <div className="value">{pacienteData.anamnesis.medicamentos}</div>
                  </div>
                )}
                {pacienteData.anamnesis.antecedentesFamiliares && pacienteData.anamnesis.antecedentesFamiliares !== 'Ninguno' && (
                  <div>
                    <div className="label">Antecedentes Familiares</div>
                    <div className="value">{pacienteData.anamnesis.antecedentesFamiliares}</div>
                  </div>
                )}
                {pacienteData.anamnesis.observacionesMedicas && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div className="label">Observaciones Médicas</div>
                    <div className="value">{pacienteData.anamnesis.observacionesMedicas}</div>
                  </div>
                )}
                {!pacienteData.anamnesis.diabetes && 
                 !pacienteData.anamnesis.hipertension && 
                 !pacienteData.anamnesis.cardiopatia && 
                 !pacienteData.anamnesis.embarazo &&
                 (!pacienteData.anamnesis.medicamentos || pacienteData.anamnesis.medicamentos === 'Ninguno') &&
                 (!pacienteData.anamnesis.antecedentesFamiliares || pacienteData.anamnesis.antecedentesFamiliares === 'Ninguno') &&
                 !pacienteData.anamnesis.observacionesMedicas && (
                  <div style={{ color: '#6c757d', gridColumn: '1 / -1' }}>
                    No hay Anamnesis registrada.
                  </div>
                )}
              </div>
            )}
            {!pacienteData.anamnesis && (
              <div style={{ color: '#6c757d' }}>
                No hay Anamnesis registrada.
              </div>
            )}
          </SectionContent>
        </Section>

      </ContentGrid>

      {/* Odontograma */}
      <OdontogramaSection>
        <Section>
          <SectionHeader>
            <FaTooth />
            <SectionTitle>Odontograma</SectionTitle>
          </SectionHeader>
          <SectionContent>
            <Odontograma
              pacienteId={id!}
              odontogramaData={odontogramaData}
              onSave={handleSaveOdontograma}
              isSaving={isSaving}
            />
          </SectionContent>
        </Section>
      </OdontogramaSection>

      {/* Sección de Consultas */}
      <FullWidthSection>
        <HistorialCompleto pacienteId={pacienteData._id || ''} />
      </FullWidthSection>
    </PageContainer>
  );
};

export default PacienteCompletoPage;
