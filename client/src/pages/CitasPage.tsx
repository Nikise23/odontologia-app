import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery } from 'react-query';
import { FaSearch, FaCalendarAlt } from 'react-icons/fa';
import CitasDelDia from '../components/Citas/CitasDelDia';
import { getCitas } from '../services/citaService';
import { Cita } from '../types';

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 15px 10px;
  }
`;

const SearchSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const SearchTitle = styled.h2`
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SearchInput = styled.div`
  position: relative;
  display: flex;
  gap: 10px;
  align-items: center;
  
  input {
    flex: 1;
    padding: 12px 40px 12px 12px;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    font-size: 14px;
    
    &:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }
  }
  
  .search-icon {
    position: absolute;
    right: 15px;
    color: #6c757d;
    pointer-events: none;
  }
`;

const ResultsContainer = styled.div`
  margin-top: 20px;
`;

const ResultsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ResultItem = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  border-left: 4px solid #007bff;
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .hora {
    font-weight: 600;
    color: #007bff;
    font-size: 16px;
  }
  
  .estado {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    text-transform: capitalize;
    
    &.programada { background: #fff3cd; color: #856404; }
    &.confirmada { background: #d1ecf1; color: #0c5460; }
    &.completada { background: #d4edda; color: #155724; }
    &.ausente { background: #f8d7da; color: #721c24; }
    &.cancelada { background: #e2e3e5; color: #383d41; }
  }
  
  .paciente {
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 5px;
  }
  
  .info {
    font-size: 14px;
    color: #6c757d;
  }
`;

const NoResults = styled.div`
  text-align: center;
  padding: 40px;
  color: #6c757d;
`;

const CitasPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Obtener fecha de hoy en formato YYYY-MM-DD
  const getFechaHoy = () => {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const { data: citasData, isLoading } = useQuery(
    ['citas', 'search', searchTerm],
    () => getCitas({ limite: 100 }), // Aumentar límite para buscar más citas
    {
      enabled: showSearch && searchTerm.length > 0,
    }
  );

  const citas = citasData?.data || [];
  
  // Filtrar citas: solo de hoy o futuras, y que coincidan con el término de búsqueda
  const citasFiltradas = citas.filter((cita: Cita) => {
    if (!searchTerm) return false;
    
    // Filtrar por fecha: solo hoy o futuras
    const fechaCita = new Date(cita.fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Inicio del día de hoy
    fechaCita.setHours(0, 0, 0, 0); // Inicio del día de la cita
    
    // Si la fecha de la cita es anterior a hoy, no incluirla
    if (fechaCita < hoy) {
      return false;
    }
    
    // Filtrar por término de búsqueda
    const term = searchTerm.toLowerCase();
    const paciente = typeof cita.pacienteId === 'object' ? cita.pacienteId : null;
    const nombre = paciente?.nombre?.toLowerCase() || '';
    const ci = paciente?.ci?.toLowerCase() || '';
    const motivo = cita.motivo?.toLowerCase() || '';
    const hora = cita.hora?.toLowerCase() || '';
    
    return nombre.includes(term) || 
           ci.includes(term) || 
           motivo.includes(term) ||
           hora.includes(term);
  });
  
  // Ordenar por fecha y hora (más próximas primero)
  citasFiltradas.sort((a: Cita, b: Cita) => {
    const fechaA = new Date(a.fecha);
    const fechaB = new Date(b.fecha);
    if (fechaA.getTime() !== fechaB.getTime()) {
      return fechaA.getTime() - fechaB.getTime();
    }
    // Si es el mismo día, ordenar por hora
    return (a.hora || '').localeCompare(b.hora || '');
  });

  return (
    <Container>
      <SearchSection>
        <SearchTitle>
          <FaSearch />
          Buscar Citas
        </SearchTitle>
        <SearchInput>
          <input
            type="text"
            placeholder="Buscar turnos de hoy o futuros por nombre, CI, hora o motivo..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSearch(e.target.value.length > 0);
            }}
          />
          <FaSearch className="search-icon" />
        </SearchInput>
        
        {showSearch && searchTerm.length > 0 && (
          <ResultsContainer>
            {isLoading ? (
              <NoResults>Cargando...</NoResults>
            ) : citasFiltradas.length > 0 ? (
              <ResultsList>
                {citasFiltradas.map((cita: Cita) => {
                  const paciente = typeof cita.pacienteId === 'object' ? cita.pacienteId : null;
                  const fecha = new Date(cita.fecha);
                  const fechaStr = fecha.toLocaleDateString('es-ES');
                  
                  return (
                    <ResultItem key={cita._id}>
                      <div className="header">
                        <div className="hora">{cita.hora}</div>
                        <div className={`estado ${cita.estado}`}>
                          {cita.estado.replace('_', ' ')}
                        </div>
                      </div>
                      <div className="paciente">
                        {paciente?.nombre || 'Paciente no encontrado'}
                      </div>
                      <div className="info">
                        CI: {paciente?.ci || 'N/A'} | Fecha: {fechaStr} | Tipo: {cita.tipoCita}
                      </div>
                      {cita.motivo && (
                        <div className="info" style={{ marginTop: '5px' }}>
                          Motivo: {cita.motivo}
                        </div>
                      )}
                    </ResultItem>
                  );
                })}
              </ResultsList>
            ) : (
              <NoResults>No se encontraron citas que coincidan con la búsqueda</NoResults>
            )}
          </ResultsContainer>
        )}
      </SearchSection>
      
      <CitasDelDia />
    </Container>
  );
};

export default CitasPage;
