import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes, FaSave, FaTooth } from 'react-icons/fa';
import { useMutation, useQueryClient } from 'react-query';
import { createTratamiento, updateTratamiento } from '../../services/tratamientoService';
import { useNotification } from '../../hooks/useNotification';
import { parseCurrencyInput } from '../../utils/currency';
import { Tratamiento } from '../../types';

const ModalOverlay = styled.div<{ $show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.$show ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e9ecef;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #6c757d;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background: #f8f9fa;
    color: #dc3545;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
`;

const Input = styled.input`
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Select = styled.select`
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const TextArea = styled.textarea`
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 20px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

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

interface NuevoTratamientoModalProps {
  show: boolean;
  onClose: () => void;
  pacienteId: string;
  tratamiento?: Tratamiento | null; // Tratamiento a editar, null para crear nuevo
}

const NuevoTratamientoModal: React.FC<NuevoTratamientoModalProps> = ({ 
  show, 
  onClose, 
  pacienteId,
  tratamiento = null
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    piezaDental: '',
    tipoTratamiento: 'restaurativo' as 'preventivo' | 'restaurativo' | 'endodoncia' | 'periodoncia' | 'ortodoncia' | 'cirugia' | 'protesis' | 'otros',
    costo: 0,
    costoInput: '', // Para manejar el input como string y preservar decimales
    fechaProgramada: '',
    observaciones: ''
  });

  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  // Cargar datos del tratamiento cuando se pasa para editar
  useEffect(() => {
    if (tratamiento && show) {
      const fechaProgramada = tratamiento.fechaProgramada 
        ? new Date(tratamiento.fechaProgramada).toISOString().split('T')[0]
        : '';
      
      setFormData({
        nombre: tratamiento.nombre || '',
        descripcion: tratamiento.descripcion || '',
        piezaDental: tratamiento.piezaDental || '',
        tipoTratamiento: tratamiento.tipoTratamiento || 'restaurativo',
        costo: tratamiento.costo || 0,
        costoInput: tratamiento.costo ? tratamiento.costo.toFixed(2).replace('.', ',') : '',
        fechaProgramada,
        observaciones: tratamiento.observaciones || ''
      });
    } else if (!tratamiento && show) {
      // Resetear formulario para nuevo tratamiento
      setFormData({
        nombre: '',
        descripcion: '',
        piezaDental: '',
        tipoTratamiento: 'restaurativo',
        costo: 0,
        costoInput: '',
        fechaProgramada: '',
        observaciones: ''
      });
    }
  }, [tratamiento, show]);

  const createTratamientoMutation = useMutation(createTratamiento, {
    onSuccess: () => {
      showNotification('Tratamiento creado exitosamente', 'success');
      // Invalidar todas las queries relacionadas con tratamientos
      queryClient.invalidateQueries(['historialTratamientos', pacienteId]);
      queryClient.invalidateQueries(['tratamientos', pacienteId]);
      onClose();
      setFormData({
        nombre: '',
        descripcion: '',
        piezaDental: '',
        tipoTratamiento: 'restaurativo',
        costo: 0,
        costoInput: '',
        fechaProgramada: '',
        observaciones: ''
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error al crear el tratamiento';
      showNotification(errorMessage, 'error');
    }
  });

  const updateTratamientoMutation = useMutation(
    (data: Partial<Tratamiento>) => updateTratamiento(tratamiento!._id!, data),
    {
      onSuccess: () => {
        showNotification('Tratamiento actualizado exitosamente', 'success');
        // Invalidar todas las queries relacionadas con tratamientos
        queryClient.invalidateQueries(['historialTratamientos', pacienteId]);
        queryClient.invalidateQueries(['tratamientos', pacienteId]);
        onClose();
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || 'Error al actualizar el tratamiento';
        showNotification(errorMessage, 'error');
      }
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim() || !formData.piezaDental.trim()) {
      showNotification('Por favor completa los campos obligatorios', 'error');
      return;
    }

    const tratamientoData = {
      pacienteId,
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      piezaDental: formData.piezaDental,
      tipoTratamiento: formData.tipoTratamiento,
      costo: formData.costo,
      fechaProgramada: formData.fechaProgramada ? new Date(formData.fechaProgramada) : undefined,
      observaciones: formData.observaciones,
      estado: tratamiento?.estado || 'programado'
    };

    if (tratamiento && tratamiento._id) {
      // Editar tratamiento existente
      updateTratamientoMutation.mutate(tratamientoData);
    } else {
      // Crear nuevo tratamiento
      createTratamientoMutation.mutate(tratamientoData);
    }
  };

  return (
    <ModalOverlay $show={show}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>
            <FaTooth />
            {tratamiento ? 'Editar Tratamiento' : 'Nuevo Tratamiento'}
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Nombre del Tratamiento *</Label>
            <Input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
              placeholder="Ej: Obturación, Endodoncia, Extracción..."
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Tipo de Tratamiento *</Label>
            <Select
              value={formData.tipoTratamiento}
              onChange={(e) => setFormData(prev => ({ ...prev, tipoTratamiento: e.target.value as any }))}
            >
              <option value="preventivo">Preventivo</option>
              <option value="restaurativo">Restaurativo</option>
              <option value="endodoncia">Endodoncia</option>
              <option value="periodoncia">Periodoncia</option>
              <option value="ortodoncia">Ortodoncia</option>
              <option value="cirugia">Cirugía</option>
              <option value="protesis">Prótesis</option>
              <option value="otros">Otros</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Pieza Dental *</Label>
            <Input
              type="text"
              value={formData.piezaDental}
              onChange={(e) => setFormData(prev => ({ ...prev, piezaDental: e.target.value }))}
              placeholder="Ej: 11, 21, 36..."
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Costo (Pesos Argentinos)</Label>
            <Input
              type="text"
              inputMode="decimal"
              value={formData.costoInput}
              onChange={(e) => {
                const inputValue = e.target.value;
                // Permitir solo números, punto y coma
                if (inputValue === '' || /^[\d.,]+$/.test(inputValue)) {
                  const parsed = parseCurrencyInput(inputValue);
                  setFormData(prev => ({ 
                    ...prev, 
                    costoInput: inputValue,
                    costo: parsed !== null ? parsed : 0
                  }));
                }
              }}
              onBlur={(e) => {
                // Al perder el foco, normalizar el formato
                const parsed = parseCurrencyInput(e.target.value);
                if (parsed !== null) {
                  setFormData(prev => ({ 
                    ...prev, 
                    costoInput: parsed.toFixed(2).replace('.', ','),
                    costo: parsed
                  }));
                } else {
                  setFormData(prev => ({ 
                    ...prev, 
                    costoInput: '',
                    costo: 0
                  }));
                }
              }}
              placeholder="0,00"
            />
            {formData.costo > 0 && (
              <span style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                {formData.costo.toLocaleString('es-AR', { 
                  style: 'currency', 
                  currency: 'ARS',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            )}
          </FormGroup>

          <FormGroup>
            <Label>Fecha Programada</Label>
            <Input
              type="date"
              value={formData.fechaProgramada}
              onChange={(e) => setFormData(prev => ({ ...prev, fechaProgramada: e.target.value }))}
            />
          </FormGroup>

          <FormGroup>
            <Label>Descripción</Label>
            <TextArea
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Describe el tratamiento a realizar..."
            />
          </FormGroup>

          <FormGroup>
            <Label>Observaciones</Label>
            <TextArea
              value={formData.observaciones}
              onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
              placeholder="Observaciones adicionales..."
            />
          </FormGroup>

          <ButtonGroup>
            <Button type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              $variant="primary" 
              disabled={createTratamientoMutation.isLoading || updateTratamientoMutation.isLoading}
            >
              <FaSave />
              {(createTratamientoMutation.isLoading || updateTratamientoMutation.isLoading) 
                ? 'Guardando...' 
                : (tratamiento ? 'Actualizar Tratamiento' : 'Guardar Tratamiento')}
            </Button>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default NuevoTratamientoModal;
