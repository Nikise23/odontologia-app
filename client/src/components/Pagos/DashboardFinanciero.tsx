import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useQuery } from 'react-query';
import { FaChartLine, FaPrint, FaFileExport, FaSearch, FaUser, FaTooth, FaStethoscope } from 'react-icons/fa';
import { getReporteFinanciero } from '../../services/pagoService';
import { searchPacientes } from '../../services/pacienteService';
import { getHistorialTratamientos } from '../../services/tratamientoService';
import { getResumenConsultas } from '../../services/consultaService';
import { getHistorialPagos } from '../../services/pagoService';
import { formatCurrency } from '../../utils/currency';
import { useNotification } from '../../hooks/useNotification';
import { useAuth } from '../../contexts/AuthContext';

const Container = styled.div`
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 15px 10px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Titulo = styled.h1`
  font-size: 28px;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 2px solid #e0e0e0;
  margin-bottom: 30px;
  background: white;
  border-radius: 8px 8px 0 0;
  padding: 0 20px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  
  @media (max-width: 768px) {
    padding: 0 10px;
  }
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 15px 24px;
  border: none;
  background: ${props => props.$active ? '#3498db' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#666'};
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  margin-right: 5px;

  &:hover {
    background: ${props => props.$active ? '#2980b9' : '#f8f9fa'};
  }
`;

const TabContent = styled.div`
  background: white;
  border-radius: 0 8px 8px 8px;
  padding: 25px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const FiltrosContainer = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 15px;
    
    label {
      width: 100%;
      
      input {
        width: 100%;
      }
    }
    
    button {
      width: 100%;
    }
  }
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
`;

const Button = styled.button`
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.3s;
  
  &:hover {
    background: #2980b9;
  }
  
  &:disabled {
    background: #95a5a6;
    cursor: not-allowed;
  }
`;

const ResumenGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

const Card = styled.div<{ $highlight?: boolean; $warning?: boolean }>`
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-left: 4px solid ${props => {
    if (props.$highlight) return '#2ecc71';
    if (props.$warning) return '#f39c12';
    return '#3498db';
  }};
`;

const Valor = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: ${props => props.color || '#2c3e50'};
  margin-bottom: 10px;
`;

const Label = styled.div`
  font-size: 14px;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

const AccionesRapidas = styled.div`
  display: flex;
  gap: 15px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Tabla = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    font-size: 12px;
  }
`;

const Th = styled.th`
  padding: 15px;
  text-align: left;
  background: #34495e;
  color: white;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 1px;
`;

const Td = styled.td`
  padding: 15px;
  border-bottom: 1px solid #ecf0f1;
`;

const Tr = styled.tr`
  &:hover {
    background: #f8f9fa;
  }
`;

const Badge = styled.span<{ $estado: string }>`
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  
  ${props => {
    switch (props.$estado) {
      case 'pagado':
        return 'background: #d4edda; color: #155724;';
      case 'pendiente':
        return 'background: #fff3cd; color: #856404;';
      case 'cancelado':
        return 'background: #f8d7da; color: #721c24;';
      default:
        return 'background: #e9ecef; color: #495057;';
    }
  }}
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 50px;
  color: #7f8c8d;
  font-size: 18px;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 50px;
  color: #e74c3c;
  font-size: 18px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 50px;
  color: #7f8c8d;
  font-size: 16px;
`;

// Estilos para el reporte de paciente
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

interface DashboardFinancieroProps {
  fechaDesde?: Date;
  fechaHasta?: Date;
}

const DashboardFinanciero: React.FC<DashboardFinancieroProps> = ({ fechaDesde, fechaHasta }) => {
  const { usuario } = useAuth();
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reporte'>('dashboard');
  const [filtroDesde, setFiltroDesde] = useState<string>(
    fechaDesde ? fechaDesde.toISOString().split('T')[0] : new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [filtroHasta, setFiltroHasta] = useState<string>(
    fechaHasta ? fechaHasta.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );

  // Estados para el reporte de paciente
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Verificar permisos
  const puedeVer = usuario?.rol === 'dentista' || usuario?.rol === 'secretaria';
  
  // Query para reporte financiero
  const { data, isLoading, error, refetch } = useQuery(
    ['reporteFinanciero', filtroDesde, filtroHasta],
    () => getReporteFinanciero(filtroDesde, filtroHasta),
    {
      enabled: puedeVer && activeTab === 'dashboard',
      refetchOnWindowFocus: true,
      refetchInterval: 30000,
      staleTime: 0,
    }
  );

  // Búsqueda de pacientes
  const { data: pacientesData, isLoading: isLoadingPacientes } = useQuery(
    ['searchPacientes', searchTerm],
    () => searchPacientes(searchTerm),
    {
      enabled: searchTerm.length >= 2 && activeTab === 'reporte',
      staleTime: 5000,
    }
  );

  // Datos del paciente seleccionado
  const { data: tratamientosData, isLoading: isLoadingTratamientos } = useQuery(
    ['tratamientos', selectedPatientId],
    () => getHistorialTratamientos(selectedPatientId!),
    {
      enabled: !!selectedPatientId && activeTab === 'reporte',
    }
  );

  const { data: consultasData, isLoading: isLoadingConsultas } = useQuery(
    ['consultas', selectedPatientId],
    () => getResumenConsultas(selectedPatientId!),
    {
      enabled: !!selectedPatientId && activeTab === 'reporte',
    }
  );

  const { data: pagosData, isLoading: isLoadingPagos } = useQuery(
    ['historialPagos', selectedPatientId],
    () => getHistorialPagos(selectedPatientId!),
    {
      enabled: !!selectedPatientId && activeTab === 'reporte',
    }
  );

  useEffect(() => {
    if (!puedeVer) {
      showNotification('No tienes permisos para ver este reporte', 'error');
    }
  }, [puedeVer, showNotification]);

  // Debug: verificar estructura de datos
  useEffect(() => {
    if (data && activeTab === 'dashboard') {
      console.log('=== DEBUG DASHBOARD FINANCIERO ===');
      console.log('Datos completos recibidos:', data);
      console.log('Pagos encontrados:', data.pagos?.length || 0);
      console.log('Estadísticas:', data.estadisticas);
      if (data.pagos && data.pagos.length > 0) {
        console.log('Ejemplo de pago:', data.pagos[0]);
      }
      console.log('===================================');
    }
  }, [data, activeTab]);
  
  const handleAplicarFiltros = () => {
    console.log('Aplicando filtros - Desde:', filtroDesde, 'Hasta:', filtroHasta);
    refetch();
  };

  const handleExportar = () => {
    showNotification('Funcionalidad de exportación próximamente disponible', 'info');
  };

  const handleImprimir = () => {
    window.print();
  };

  const handlePatientSelect = (patientId: string, nombre: string, apellido: string) => {
    setSelectedPatientId(patientId);
    setSearchTerm(`${nombre} ${apellido}`);
    showNotification(`Reporte generado para ${nombre} ${apellido}`, 'success');
  };

  if (!puedeVer) {
    return (
      <Container>
        <ErrorMessage>No tienes permisos para acceder a esta sección</ErrorMessage>
      </Container>
    );
  }

  // Datos del dashboard financiero
  // El servicio getReporteFinanciero ya retorna response.data.data
  // Asegurar que siempre tengamos valores por defecto
  const pagos = data?.pagos || [];
  const estadisticas = data?.estadisticas || {
    total: 0,
    porEstado: { pagado: 0, pendiente: 0, cancelado: 0 },
    porMetodo: { efectivo: 0, tarjeta: 0, transferencia: 0, cheque: 0 },
    cantidadTotal: 0,
    cantidadPagados: 0,
    cantidadPendientes: 0,
  };
  
  // Debug: verificar que los datos se estén parseando correctamente
  if (data && activeTab === 'dashboard') {
    console.log('Pagos parseados:', pagos.length);
    console.log('Estadísticas parseadas:', estadisticas);
  }

  // Datos del reporte de paciente
  const pacientes = pacientesData?.data || [];
  const tratamientos = tratamientosData?.tratamientos || [];
  const consultas = consultasData?.data?.historial || [];
  const pagosPaciente = pagosData?.pagos || [];
  const selectedPatient = pacientes.find((p: any) => p._id === selectedPatientId);

  // Calcular totales del dashboard
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const finDia = new Date();
  finDia.setHours(23, 59, 59, 999);
  
  const pagosHoy = pagos.filter((p: any) => {
    const fechaPago = new Date(p.fecha);
    return fechaPago >= hoy && fechaPago <= finDia;
  });
  const totalHoy = pagosHoy.reduce((sum: number, p: any) => sum + (p.monto || 0), 0);

  const inicioSemana = new Date(hoy);
  inicioSemana.setDate(hoy.getDate() - hoy.getDay());
  const pagosSemana = pagos.filter((p: any) => {
    const fechaPago = new Date(p.fecha);
    return fechaPago >= inicioSemana && fechaPago <= finDia;
  });
  const totalSemana = pagosSemana.reduce((sum: number, p: any) => sum + (p.monto || 0), 0);

  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const pagosMes = pagos.filter((p: any) => {
    const fechaPago = new Date(p.fecha);
    return fechaPago >= inicioMes && fechaPago <= finDia;
  });
  const totalMes = pagosMes.reduce((sum: number, p: any) => sum + (p.monto || 0), 0);

  // Calcular totales del reporte de paciente
  const totalTratamientos = tratamientos.reduce((sum: number, t: any) => sum + (t.costo || 0), 0);
  const totalConsultas = consultas.reduce((sum: number, c: any) => sum + (c.costoConsulta || 0), 0);
  const totalPagos = pagosPaciente.filter((p: any) => p.estado === 'pagado').reduce((sum: number, p: any) => sum + (p.monto || 0), 0);
  const totalGeneral = totalTratamientos + totalConsultas;

  return (
    <Container>
      <Header>
        <Titulo>
          <FaChartLine /> Dashboard Financiero
        </Titulo>
      </Header>

      <TabsContainer>
        <Tab $active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>
          <FaChartLine /> Dashboard General
        </Tab>
        <Tab $active={activeTab === 'reporte'} onClick={() => setActiveTab('reporte')}>
          <FaSearch /> Reporte por Paciente
        </Tab>
      </TabsContainer>

      <TabContent>
        {activeTab === 'dashboard' && (
          <>
            {isLoading ? (
              <LoadingMessage>Cargando reporte financiero...</LoadingMessage>
            ) : error ? (
              <ErrorMessage>Error al cargar el reporte financiero</ErrorMessage>
            ) : (
              <>
                <FiltrosContainer>
                  <label>
                    <strong>Desde:</strong>
                    <Input
                      type="date"
                      value={filtroDesde}
                      onChange={(e) => setFiltroDesde(e.target.value)}
                    />
                  </label>
                  <label>
                    <strong>Hasta:</strong>
                    <Input
                      type="date"
                      value={filtroHasta}
                      onChange={(e) => setFiltroHasta(e.target.value)}
                    />
                  </label>
                  <Button onClick={handleAplicarFiltros}>
                    Aplicar Filtros
                  </Button>
                </FiltrosContainer>

                <ResumenGrid>
                  <Card $highlight>
                    <Valor color="#27ae60">{formatCurrency(totalHoy)}</Valor>
                    <Label>Ingresos de Hoy</Label>
                  </Card>
                  <Card>
                    <Valor color="#3498db">{formatCurrency(totalSemana)}</Valor>
                    <Label>Ingresos de Esta Semana</Label>
                  </Card>
                  <Card>
                    <Valor color="#9b59b6">{formatCurrency(totalMes)}</Valor>
                    <Label>Ingresos de Este Mes</Label>
                  </Card>
                  <Card $warning>
                    <Valor color="#f39c12">{formatCurrency(estadisticas.porEstado.pendiente)}</Valor>
                    <Label>Pendientes</Label>
                  </Card>
                  <Card>
                    <Valor color="#2ecc71">{formatCurrency(estadisticas.porEstado.pagado)}</Valor>
                    <Label>Total Pagado</Label>
                  </Card>
                  <Card>
                    <Valor color="#34495e">{estadisticas.cantidadTotal}</Valor>
                    <Label>Total de Pagos</Label>
                  </Card>
                </ResumenGrid>

                <Grid>
                  <Card>
                    <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Por Método de Pago</h3>
                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>Efectivo:</span>
                        <strong>{formatCurrency(estadisticas.porMetodo.efectivo)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>Tarjeta:</span>
                        <strong>{formatCurrency(estadisticas.porMetodo.tarjeta)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>Transferencia:</span>
                        <strong>{formatCurrency(estadisticas.porMetodo.transferencia)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>Cheque:</span>
                        <strong>{formatCurrency(estadisticas.porMetodo.cheque)}</strong>
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Por Estado</h3>
                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>Pagados:</span>
                        <strong>{formatCurrency(estadisticas.porEstado.pagado)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>Pendientes:</span>
                        <strong>{formatCurrency(estadisticas.porEstado.pendiente)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>Cancelados:</span>
                        <strong>{formatCurrency(estadisticas.porEstado.cancelado)}</strong>
                      </div>
                    </div>
                  </Card>
                </Grid>

                <AccionesRapidas>
                  <Button onClick={handleExportar}>
                    <FaFileExport /> Exportar Reporte
                  </Button>
                  <Button onClick={handleImprimir}>
                    <FaPrint /> Imprimir
                  </Button>
                </AccionesRapidas>

                {pagos.length > 0 ? (
                  <Tabla>
                    <thead>
                      <tr>
                        <Th>Fecha</Th>
                        <Th>Paciente</Th>
                        <Th>Concepto</Th>
                        <Th>Monto</Th>
                        <Th>Método</Th>
                        <Th>Estado</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagos.slice(0, 50).map((pago: any) => (
                        <Tr key={pago._id}>
                          <Td>{new Date(pago.fecha).toLocaleDateString('es-AR')}</Td>
                          <Td>
                            {(pago.pacienteId as any)?.nombre || 'N/A'} {(pago.pacienteId as any)?.apellido || ''}
                          </Td>
                          <Td>{pago.concepto}</Td>
                          <Td>{formatCurrency(pago.monto)}</Td>
                          <Td>{pago.metodoPago}</Td>
                          <Td>
                            <Badge $estado={pago.estado}>{pago.estado}</Badge>
                          </Td>
                        </Tr>
                      ))}
                    </tbody>
                  </Tabla>
                ) : (
                  <EmptyState>No hay pagos registrados en el período seleccionado</EmptyState>
                )}
              </>
            )}
          </>
        )}

        {activeTab === 'reporte' && (
          <>
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
          </>
        )}
      </TabContent>
    </Container>
  );
};

export default DashboardFinanciero;
