import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery } from 'react-query';
import { FaSearch, FaUser, FaTooth, FaStethoscope, FaDollarSign, FaPrint } from 'react-icons/fa';
import { searchPacientes } from '../../services/pacienteService';
import { getHistorialTratamientos } from '../../services/tratamientoService';
import { getResumenConsultas } from '../../services/consultaService';
import { getHistorialPagos } from '../../services/pagoService';
import { formatCurrency } from '../../utils/currency';
import { useNotification } from '../../hooks/useNotification';

const Container = styled.div`
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Titulo = styled.h1`
  font-size: 28px;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SearchContainer = styled.div`
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 30px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  margin-bottom: 15px;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const SearchResults = styled.div`
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-top: 10px;
`;

const PatientOption = styled.div`
  padding: 12px 15px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const SelectedPatient = styled.div`
  background: #e8f5e9;
  padding: 15px;
  border-radius: 6px;
  margin-top: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
`;

const ReportSection = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
  overflow: hidden;
`;

const SectionHeader = styled.div`
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
`;

const SectionContent = styled.div`
  padding: 25px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
`;

const Th = styled.th`
  background: #f8f9fa;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #dee2e6;
`;

const Tr = styled.tr`
  &:hover {
    background: #f8f9fa;
  }
`;

const TotalCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  margin-top: 30px;
`;

const TotalLabel = styled.div`
  font-size: 18px;
  margin-bottom: 10px;
  opacity: 0.9;
`;

const TotalValue = styled.div`
  font-size: 42px;
  font-weight: bold;
`;

const Button = styled.button`
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.3s;
  
  &:hover {
    background: #2980b9;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 50px;
  color: #7f8c8d;
  font-size: 16px;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 50px;
  color: #3498db;
  font-size: 18px;
`;

const ReportePaciente: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const { showNotification } = useNotification();

  // Búsqueda de pacientes
  const { data: pacientesData, isLoading: isLoadingPacientes } = useQuery(
    ['searchPacientes', searchTerm],
    () => searchPacientes(searchTerm),
    {
      enabled: searchTerm.length >= 2,
      staleTime: 5000,
    }
  );

  // Datos del paciente seleccionado
  const { data: tratamientosData, isLoading: isLoadingTratamientos } = useQuery(
    ['tratamientos', selectedPatientId],
    () => getHistorialTratamientos(selectedPatientId!),
    {
      enabled: !!selectedPatientId,
    }
  );

  const { data: consultasData, isLoading: isLoadingConsultas } = useQuery(
    ['consultas', selectedPatientId],
    () => getResumenConsultas(selectedPatientId!),
    {
      enabled: !!selectedPatientId,
    }
  );

  const { data: pagosData, isLoading: isLoadingPagos } = useQuery(
    ['historialPagos', selectedPatientId],
    () => getHistorialPagos(selectedPatientId!),
    {
      enabled: !!selectedPatientId,
    }
  );

  const pacientes = pacientesData?.data || [];
  const tratamientos = tratamientosData?.tratamientos || [];
  const consultas = consultasData?.data?.historial || [];
  const pagos = pagosData?.pagos || [];

  const selectedPatient = pacientes.find((p: any) => p._id === selectedPatientId);

  const handlePatientSelect = (patientId: string, nombre: string, apellido: string) => {
    setSelectedPatientId(patientId);
    setSearchTerm(`${nombre} ${apellido}`);
    showNotification(`Reporte generado para ${nombre} ${apellido}`, 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  // Calcular totales
  const totalTratamientos = tratamientos.reduce((sum: number, t: any) => sum + (t.costo || 0), 0);
  const totalConsultas = consultas.reduce((sum: number, c: any) => sum + (c.costoConsulta || 0), 0);
  const totalPagos = pagos.filter((p: any) => p.estado === 'pagado').reduce((sum: number, p: any) => sum + (p.monto || 0), 0);
  const totalGeneral = totalTratamientos + totalConsultas;

  return (
    <Container>
      <Header>
        <Titulo>
          <FaSearch /> Reporte de Búsqueda por Paciente
        </Titulo>
        {selectedPatientId && (
          <Button onClick={handlePrint}>
            <FaPrint /> Imprimir
          </Button>
        )}
      </Header>

      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Buscar paciente por nombre o apellido..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (e.target.value.length < 2) {
              setSelectedPatientId(null);
            }
          }}
        />
        
        {searchTerm.length >= 2 && isLoadingPacientes && (
          <LoadingMessage>Buscando pacientes...</LoadingMessage>
        )}

        {searchTerm.length >= 2 && !isLoadingPacientes && pacientes.length > 0 && !selectedPatientId && (
          <SearchResults>
            {pacientes.map((paciente: any) => (
              <PatientOption
                key={paciente._id}
                onClick={() => handlePatientSelect(paciente._id, paciente.nombre, (paciente as any).apellido || '')}
              >
                <FaUser style={{ marginRight: '8px', color: '#3498db' }} />
                {paciente.nombre} {(paciente as any).apellido || ''} - {paciente.ci || 'Sin CI'}
              </PatientOption>
            ))}
          </SearchResults>
        )}

        {selectedPatient && (
          <SelectedPatient>
            <FaUser style={{ color: '#2ecc71' }} />
            Paciente seleccionado: <strong>{selectedPatient.nombre} {(selectedPatient as any).apellido || ''}</strong>
          </SelectedPatient>
        )}
      </SearchContainer>

      {selectedPatientId && (
        <>
          {/* Tratamientos */}
          <ReportSection>
            <SectionHeader>
              <FaTooth /> Tratamientos
            </SectionHeader>
            <SectionContent>
              {isLoadingTratamientos ? (
                <LoadingMessage>Cargando tratamientos...</LoadingMessage>
              ) : tratamientos.length > 0 ? (
                <>
                  <Table>
                    <thead>
                      <tr>
                        <Th>Nombre</Th>
                        <Th>Pieza Dental</Th>
                        <Th>Fecha</Th>
                        <Th>Costo</Th>
                        <Th>Estado</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {tratamientos.map((tratamiento: any) => (
                        <Tr key={tratamiento._id}>
                          <Td>{tratamiento.nombre}</Td>
                          <Td>{tratamiento.piezaDental || 'N/A'}</Td>
                          <Td>{new Date(tratamiento.fecha).toLocaleDateString('es-AR')}</Td>
                          <Td>{formatCurrency(tratamiento.costo || 0)}</Td>
                          <Td>{tratamiento.estado || 'Pendiente'}</Td>
                        </Tr>
                      ))}
                    </tbody>
                  </Table>
                  <div style={{ marginTop: '15px', textAlign: 'right', fontWeight: 'bold' }}>
                    Total Tratamientos: {formatCurrency(totalTratamientos)}
                  </div>
                </>
              ) : (
                <EmptyState>No hay tratamientos registrados</EmptyState>
              )}
            </SectionContent>
          </ReportSection>

          {/* Consultas */}
          <ReportSection>
            <SectionHeader>
              <FaStethoscope /> Consultas
            </SectionHeader>
            <SectionContent>
              {isLoadingConsultas ? (
                <LoadingMessage>Cargando consultas...</LoadingMessage>
              ) : consultas.length > 0 ? (
                <>
                  <Table>
                    <thead>
                      <tr>
                        <Th>Número</Th>
                        <Th>Fecha</Th>
                        <Th>Motivo</Th>
                        <Th>Costo</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {consultas.map((consulta: any) => (
                        <Tr key={consulta._id}>
                          <Td>#{consulta.numeroConsulta}</Td>
                          <Td>{new Date(consulta.fecha).toLocaleDateString('es-AR')}</Td>
                          <Td>{consulta.motivoConsulta || 'N/A'}</Td>
                          <Td>{formatCurrency(consulta.costoConsulta || 0)}</Td>
                        </Tr>
                      ))}
                    </tbody>
                  </Table>
                  <div style={{ marginTop: '15px', textAlign: 'right', fontWeight: 'bold' }}>
                    Total Consultas: {formatCurrency(totalConsultas)}
                  </div>
                </>
              ) : (
                <EmptyState>No hay consultas registradas</EmptyState>
              )}
            </SectionContent>
          </ReportSection>

          {/* Total General */}
          <TotalCard>
            <TotalLabel>Total General (Tratamientos + Consultas)</TotalLabel>
            <TotalValue>{formatCurrency(totalGeneral)}</TotalValue>
            <div style={{ marginTop: '15px', fontSize: '16px', opacity: 0.9 }}>
              Total Pagado: {formatCurrency(totalPagos)}
            </div>
          </TotalCard>
        </>
      )}

      {!selectedPatientId && (
        <EmptyState>
          Busque un paciente para generar el reporte
        </EmptyState>
      )}
    </Container>
  );
};

export default ReportePaciente;

