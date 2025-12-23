import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useQuery, useQueryClient } from 'react-query';
import { getPaciente, getOdontograma, saveOdontograma } from '../services/pacienteService';
import Odontograma from '../components/Odontograma/Odontograma';
import { useNotification } from '../hooks/useNotification';

const OdontogramaContainer = styled.div`
  padding: 20px;
  background-color: #ffffff;
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

const OdontogramaPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();
  const [isSaving, setIsSaving] = useState(false);
  
  const { data: pacienteData, isLoading, error } = useQuery(
    ['paciente', id],
    () => getPaciente(id!),
    {
      enabled: !!id,
    }
  );

  const { data: odontogramaData } = useQuery(
    ['odontograma', id],
    () => getOdontograma(id!),
    {
      enabled: !!id,
    }
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
        // Invalidar y refetch los datos del odontograma
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
      <OdontogramaContainer>
        <LoadingMessage>Cargando información del paciente...</LoadingMessage>
      </OdontogramaContainer>
    );
  }

  if (error) {
    return (
      <OdontogramaContainer>
        <ErrorMessage>Error cargando la información del paciente</ErrorMessage>
      </OdontogramaContainer>
    );
  }

  const paciente = pacienteData?.data;

  if (!paciente) {
    return (
      <OdontogramaContainer>
        <ErrorMessage>Paciente no encontrado</ErrorMessage>
      </OdontogramaContainer>
    );
  }

  return (
    <OdontogramaContainer>
      <Odontograma
        pacienteId={paciente._id || ''}
        odontogramaData={odontogramaData?.data}
        onSave={handleSaveOdontograma}
        isSaving={isSaving}
      />
    </OdontogramaContainer>
  );
};

export default OdontogramaPage;
