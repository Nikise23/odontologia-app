import React, { useState } from 'react';
import styled from 'styled-components';
import { FaTimes, FaEdit, FaSave } from 'react-icons/fa';
import { Pago } from '../../types';

const Modal = styled.div<{ $show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.$show ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e0e0e0;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 4px;
  border-radius: 4px;

  &:hover {
    background: #f0f0f0;
  }
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
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  box-sizing: border-box;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
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

  ${props => props.$variant === 'secondary' ? `
    background: #6c757d;
    color: white;
    &:hover { background: #5a6268; }
  ` : `
    background: #007bff;
    color: white;
    &:hover { background: #0056b3; }
  `}
`;

interface EditarPagoModalProps {
  show: boolean;
  onClose: () => void;
  pago: Pago | null;
  onSave: (pagoData: Partial<Pago>) => Promise<void>;
}

const EditarPagoModal: React.FC<EditarPagoModalProps> = ({ show, onClose, pago, onSave }) => {
  const [formData, setFormData] = useState<Partial<Pago>>({
    concepto: '',
    monto: 0,
    metodoPago: 'efectivo',
    observaciones: '',
    estado: 'pendiente'
  });

  React.useEffect(() => {
    if (pago) {
      setFormData({
        concepto: pago.concepto,
        monto: pago.monto,
        metodoPago: pago.metodoPago,
        observaciones: pago.observaciones || '',
        estado: pago.estado
      });
    }
  }, [pago]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.concepto?.trim() || !formData.monto || formData.monto <= 0) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error guardando pago:', error);
    }
  };

  if (!pago) return null;

  return (
    <Modal $show={show}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>
            <FaEdit />
            Editar Pago
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Concepto *</Label>
            <Input
              type="text"
              value={formData.concepto || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, concepto: e.target.value }))}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Monto *</Label>
            <Input
              type="number"
              value={formData.monto || 0}
              onChange={(e) => setFormData(prev => ({ ...prev, monto: Number(e.target.value) }))}
              min="0"
              step="0.01"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Método de Pago</Label>
            <Select
              value={formData.metodoPago || 'efectivo'}
              onChange={(e) => setFormData(prev => ({ ...prev, metodoPago: e.target.value as any }))}
            >
              <option key="efectivo" value="efectivo">Efectivo</option>
              <option key="tarjeta" value="tarjeta">Tarjeta</option>
              <option key="transferencia" value="transferencia">Transferencia</option>
              <option key="cheque" value="cheque">Cheque</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Estado</Label>
            <Select
              value={formData.estado || 'pendiente'}
              onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value as any }))}
            >
              <option key="pendiente" value="pendiente">Pendiente</option>
              <option key="pagado" value="pagado">Pagado</option>
              <option key="cancelado" value="cancelado">Cancelado</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Observaciones</Label>
            <TextArea
              value={formData.observaciones || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
              placeholder="Observaciones adicionales..."
            />
          </FormGroup>

          <ButtonGroup>
            <Button type="button" $variant="secondary" onClick={onClose}>
              <FaTimes />
              Cancelar
            </Button>
            <Button type="submit">
              <FaSave />
              Guardar Cambios
            </Button>
          </ButtonGroup>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default EditarPagoModal;




