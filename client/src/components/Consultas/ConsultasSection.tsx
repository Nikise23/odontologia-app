import React, { useState } from 'react';
import styled from 'styled-components';
import { FaPlus, FaCalendarAlt, FaTimes } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getResumenConsultas, createConsulta } from '../../services/consultaService';
import { useNotification } from '../../hooks/useNotification';
import { parseCurrencyInput } from '../../utils/currency';

const ConsultasContainer = styled.div`
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

const NuevoConsultaButton = styled.button`
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

const ResumenGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const ResumenItem = styled.div`
  text-align: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
`;

const ResumenValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 5px;
`;

const ResumenLabel = styled.div`
  font-size: 12px;
  color: #6c757d;
  text-transform: uppercase;
  font-weight: 600;
`;

const HistorialTitle = styled.h3`
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
`;

const ConsultaItem = styled.div`
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
  background: #f8f9fa;
`;

const ConsultaHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const ConsultaInfo = styled.div`
  .numero {
    font-size: 18px;
    font-weight: 700;
    color: #2c3e50;
  }
  
  .fecha {
    font-size: 14px;
    color: #6c757d;
  }
`;

const ConsultaEstado = styled.div<{ $estado: string }>`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background-color: ${props => {
    switch (props.$estado) {
      case 'completada': return '#d4edda';
      case 'pendiente': return '#fff3cd';
      case 'cancelada': return '#f8d7da';
      default: return '#e2e3e5';
    }
  }};
  color: ${props => {
    switch (props.$estado) {
      case 'completada': return '#155724';
      case 'pendiente': return '#856404';
      case 'cancelada': return '#721c24';
      default: return '#383d41';
    }
  }};
`;


const Modal = styled.div<{ $show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.$show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #6c757d;
  cursor: pointer;
  
  &:hover {
    color: #dc3545;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const TratamientosSection = styled.div`
  margin-top: 25px;
`;

const TratamientoForm = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 10px;
  align-items: end;
  margin-bottom: 15px;
`;

const RemoveButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  
  &:hover {
    background: #c82333;
  }
`;

const AddTratamientoButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background: #218838;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  
  ${props => props.$variant === 'primary' ? `
    background: #007bff;
    color: white;
    
    &:hover {
      background: #0056b3;
    }
  ` : `
    background: #6c757d;
    color: white;
    
    &:hover {
      background: #545b62;
    }
  `}
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

interface ConsultasSectionProps {
  pacienteId: string;
}

const ConsultasSection: React.FC<ConsultasSectionProps> = ({ pacienteId }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    motivoConsulta: '',
    diagnostico: '',
    observacionesGenerales: '',
    cambiosOdontograma: '',
    costoConsulta: 0,
    tratamientosRealizados: [] as Array<{
      piezaDental: string;
      tratamiento: string;
      costo: number;
      observaciones: string;
    }>,
    anamnesis: {
      sintomas: '',
      alergias: '',
      medicamentos: '',
      antecedentesClinicos: '',
      examenFisico: '',
      planTratamiento: ''
    }
  });

  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  const { data: resumenData, isLoading, error } = useQuery(
    ['resumenConsultas', pacienteId],
    () => getResumenConsultas(pacienteId),
    {
      enabled: !!pacienteId,
    }
  );

  const createConsultaMutation = useMutation(createConsulta, {
    onSuccess: () => {
      queryClient.invalidateQueries(['resumenConsultas', pacienteId]);
      setShowModal(false);
      setFormData({
        motivoConsulta: '',
        diagnostico: '',
        observacionesGenerales: '',
        cambiosOdontograma: '',
        costoConsulta: 0,
        tratamientosRealizados: [],
        anamnesis: {
          sintomas: '',
          alergias: '',
          medicamentos: '',
          antecedentesClinicos: '',
          examenFisico: '',
          planTratamiento: ''
        }
      });
      showNotification('Consulta creada exitosamente', 'success');
    },
    onError: (error: any) => {
      showNotification('Error al crear la consulta', 'error');
    }
  });

  const handleAddTratamiento = () => {
    setFormData(prev => ({
      ...prev,
      tratamientosRealizados: [...prev.tratamientosRealizados, {
        piezaDental: '',
        tratamiento: '',
        costo: 0,
        observaciones: ''
      }]
    }));
  };

  const handleRemoveTratamiento = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tratamientosRealizados: prev.tratamientosRealizados.filter((_, i) => i !== index)
    }));
  };

  const handleTratamientoChange = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      tratamientosRealizados: prev.tratamientosRealizados.map((tratamiento, i) => 
        i === index ? { ...tratamiento, [field]: value } : tratamiento
      )
    }));
  };

  const handleSubmit = async () => {
    if (!formData.motivoConsulta.trim()) {
      showNotification('El motivo de consulta es requerido', 'error');
      return;
    }

    createConsultaMutation.mutate({
      pacienteId,
      motivoConsulta: formData.motivoConsulta,
      diagnostico: formData.diagnostico,
      tratamientosRealizados: formData.tratamientosRealizados.filter(t =>
        t.piezaDental.trim() && t.tratamiento.trim() && t.costo > 0
      ),
      observacionesGenerales: formData.observacionesGenerales,
      cambiosOdontograma: formData.cambiosOdontograma,
      costoConsulta: formData.costoConsulta,
      anamnesis: formData.anamnesis
    });
  };

  if (isLoading) {
    return (
      <ConsultasContainer>
        <LoadingMessage>Cargando consultas...</LoadingMessage>
      </ConsultasContainer>
    );
  }

  if (error) {
    return (
      <ConsultasContainer>
        <ErrorMessage>Error al cargar las consultas</ErrorMessage>
      </ConsultasContainer>
    );
  }

  const resumen = resumenData?.data;

  return (
    <ConsultasContainer>
      <Header>
        <HeaderLeft>
          <FaCalendarAlt />
          <HeaderTitle>Historia Clínica</HeaderTitle>
        </HeaderLeft>
        <NuevoConsultaButton onClick={() => setShowModal(true)}>
          <FaPlus />
          Nueva Consulta
        </NuevoConsultaButton>
      </Header>

      <Content>
        {resumen && (
          <>
            <ResumenGrid>
              <ResumenItem>
                <ResumenValue>{resumen.totalConsultas}</ResumenValue>
                <ResumenLabel>Total Consultas</ResumenLabel>
              </ResumenItem>
              <ResumenItem>
                <ResumenValue>#{resumen?.historial?.[0]?.numeroConsulta || '-'}</ResumenValue>
                <ResumenLabel>Última Consulta</ResumenLabel>
              </ResumenItem>
            </ResumenGrid>

            <HistorialTitle>Contenido de la Historia Clínica</HistorialTitle>

            {resumen.historial.length > 0 ? (
              resumen.historial.map((consulta: any) => (
                <ConsultaItem key={consulta.numeroConsulta}>
                  <ConsultaHeader>
                    <ConsultaInfo>
                      <div className="numero">Consulta #{consulta.numeroConsulta}</div>
                      <div className="fecha">
                        {new Date(consulta.fecha).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </ConsultaInfo>
                    <ConsultaEstado $estado={consulta.estado}>
                      {consulta.estado}
                    </ConsultaEstado>
                  </ConsultaHeader>

                  {consulta.motivoConsulta && (
                    <div style={{ marginBottom: '15px' }}>
                      <strong>Motivo:</strong> {consulta.motivoConsulta}
                    </div>
                  )}

                  {consulta.cambiosOdontograma && (
                    <div style={{ marginBottom: '15px' }}>
                      <strong>Cambios en Odontograma:</strong> {consulta.cambiosOdontograma}
                    </div>
                  )}
                </ConsultaItem>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                No hay consultas registradas aún
              </div>
            )}
          </>
        )}
      </Content>

      {/* Modal para nueva consulta */}
      <Modal $show={showModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Nueva Consulta</ModalTitle>
            <CloseButton onClick={() => setShowModal(false)}>×</CloseButton>
          </ModalHeader>

          <FormGroup>
            <Label>Motivo de Consulta *</Label>
            <Input
              type="text"
              value={formData.motivoConsulta}
              onChange={(e) => setFormData(prev => ({ ...prev, motivoConsulta: e.target.value }))}
              placeholder="Ej: Dolor en muela, revisión, limpieza..."
            />
          </FormGroup>

          <FormGroup>
            <Label>Diagnóstico</Label>
            <TextArea
              value={formData.diagnostico}
              onChange={(e) => setFormData(prev => ({ ...prev, diagnostico: e.target.value }))}
              placeholder="Diagnóstico realizado..."
            />
          </FormGroup>

          <TratamientosSection>
            <Label>Tratamientos Realizados</Label>
            
            {formData.tratamientosRealizados.map((tratamiento, index) => (
              <TratamientoForm key={index}>
                <Input
                  type="text"
                  placeholder="Pieza dental (ej: 11)"
                  value={tratamiento.piezaDental}
                  onChange={(e) => handleTratamientoChange(index, 'piezaDental', e.target.value)}
                />
                <Input
                  type="text"
                  placeholder="Tratamiento"
                  value={tratamiento.tratamiento}
                  onChange={(e) => handleTratamientoChange(index, 'tratamiento', e.target.value)}
                />
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="Costo (0,00)"
                  value={tratamiento.costo > 0 ? tratamiento.costo.toFixed(2).replace('.', ',') : ''}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    // Permitir solo números, punto y coma
                    if (inputValue === '' || /^[\d.,]+$/.test(inputValue)) {
                      const parsed = parseCurrencyInput(inputValue);
                      handleTratamientoChange(index, 'costo', parsed !== null ? parsed : 0);
                    }
                  }}
                  onBlur={(e) => {
                    const parsed = parseCurrencyInput(e.target.value);
                    if (parsed !== null && parsed > 0) {
                      handleTratamientoChange(index, 'costo', parsed);
                    } else {
                      handleTratamientoChange(index, 'costo', 0);
                    }
                  }}
                />
                <RemoveButton onClick={() => handleRemoveTratamiento(index)}>
                  <FaTimes />
                </RemoveButton>
              </TratamientoForm>
            ))}

            <AddTratamientoButton onClick={handleAddTratamiento}>
              <FaPlus />
              Agregar Tratamiento
            </AddTratamientoButton>
          </TratamientosSection>

          <FormGroup>
            <Label>Cambios en el Odontograma</Label>
            <TextArea
              value={formData.cambiosOdontograma}
              onChange={(e) => setFormData(prev => ({ ...prev, cambiosOdontograma: e.target.value }))}
              placeholder="Describe los cambios realizados en el odontograma..."
            />
          </FormGroup>

          <FormGroup>
            <Label>Costo de Consulta</Label>
            <Input
              type="number"
              value={formData.costoConsulta}
              onChange={(e) => setFormData(prev => ({ ...prev, costoConsulta: Number(e.target.value) || 0 }))}
              placeholder="0"
              min="0"
              step="0.01"
            />
          </FormGroup>

          <FormGroup>
            <Label>Síntomas</Label>
            <TextArea
              value={formData.anamnesis.sintomas}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                anamnesis: { ...prev.anamnesis, sintomas: e.target.value } 
              }))}
              placeholder="Síntomas del paciente..."
            />
          </FormGroup>

          <FormGroup>
            <Label>Alergias</Label>
            <Input
              type="text"
              value={formData.anamnesis.alergias}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                anamnesis: { ...prev.anamnesis, alergias: e.target.value } 
              }))}
              placeholder="Alergias conocidas..."
            />
          </FormGroup>

          <FormGroup>
            <Label>Medicamentos Activos</Label>
            <Input
              type="text"
              value={formData.anamnesis.medicamentos}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                anamnesis: { ...prev.anamnesis, medicamentos: e.target.value } 
              }))}
              placeholder="Medicamentos que toma actualmente..."
            />
          </FormGroup>

          <FormGroup>
            <Label>Antecedentes Clínicos</Label>
            <TextArea
              value={formData.anamnesis.antecedentesClinicos}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                anamnesis: { ...prev.anamnesis, antecedentesClinicos: e.target.value } 
              }))}
              placeholder="Antecedentes clínicos relevantes..."
            />
          </FormGroup>

          <FormGroup>
            <Label>Examen Físico</Label>
            <TextArea
              value={formData.anamnesis.examenFisico}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                anamnesis: { ...prev.anamnesis, examenFisico: e.target.value } 
              }))}
              placeholder="Resultados del examen físico..."
            />
          </FormGroup>

          <FormGroup>
            <Label>Plan de Tratamiento</Label>
            <TextArea
              value={formData.anamnesis.planTratamiento}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                anamnesis: { ...prev.anamnesis, planTratamiento: e.target.value } 
              }))}
              placeholder="Plan de tratamiento propuesto..."
            />
          </FormGroup>

          <FormGroup>
            <Label>Observaciones Generales</Label>
            <TextArea
              value={formData.observacionesGenerales}
              onChange={(e) => setFormData(prev => ({ ...prev, observacionesGenerales: e.target.value }))}
              placeholder="Observaciones adicionales..."
            />
          </FormGroup>

          <ModalActions>
            <Button onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button $variant="primary" onClick={handleSubmit} disabled={createConsultaMutation.isLoading}>
              {createConsultaMutation.isLoading ? 'Guardando...' : 'Crear Consulta'}
            </Button>
          </ModalActions>
        </ModalContent>
      </Modal>
    </ConsultasContainer>
  );
};

export default ConsultasSection;
