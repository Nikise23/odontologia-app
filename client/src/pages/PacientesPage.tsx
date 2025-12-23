import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { FaPlus, FaSearch, FaDownload, FaEye, FaTrash, FaEdit } from 'react-icons/fa';
import { Paciente } from '../types';
import { getPacientes, deletePaciente } from '../services/pacienteService';
import PacienteForm from '../components/Pacientes/PacienteForm';
import PacienteModal from '../components/Pacientes/PacienteModal';

const PacientesContainer = styled.div`
  padding: 20px;
  background-color: #ffffff;
  
  @media (max-width: 768px) {
    padding: 15px 10px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const NuevoPacienteButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  
  &:hover {
    background-color: #229954;
  }
`;

const ListaPacientesTitle = styled.h1`
  color: #2c3e50;
  font-size: 24px;
  margin: 0;
`;

const SearchAndExportBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    
    button {
      width: 100%;
    }
  }
`;

const SearchInput = styled.div`
  position: relative;
  flex: 1;
  
  input {
    width: 100%;
    padding: 10px 40px 10px 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    
    &:focus {
      outline: none;
      border-color: #3498db;
    }
  }
  
  .search-icon {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
  }
  
  .clear-icon {
    position: absolute;
    right: 35px;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
    cursor: pointer;
    
    &:hover {
      color: #e74c3c;
    }
  }
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 15px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: #2980b9;
  }
`;

const PacientesTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  @media (max-width: 768px) {
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
`;

const TableHeader = styled.thead`
  background-color: #34495e;
  color: white;
`;

const TableHeaderCell = styled.th`
  padding: 15px 10px;
  text-align: left;
  font-weight: 500;
  font-size: 14px;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr<{ $isEven: boolean }>`
  background-color: ${props => props.$isEven ? '#f8f9fa' : 'white'};
  
  &:hover {
    background-color: #e8f4f8;
  }
`;

const TableCell = styled.td`
  padding: 12px 10px;
  font-size: 14px;
  color: #2c3e50;
  
  @media (max-width: 768px) {
    padding: 10px 8px;
    font-size: 12px;
  }
`;

const ActionsCell = styled.td`
  padding: 12px 10px;
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button<{ $color: string }>`
  padding: 6px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
  background-color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    opacity: 0.8;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
  flex-wrap: wrap;
  gap: 10px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const RowsPerPage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PaginationButton = styled.button<{ $disabled?: boolean }>`
  padding: 6px 10px;
  border: 1px solid #ddd;
  background-color: white;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.$disabled ? 0.5 : 1};
  
  &:hover:not(:disabled) {
    background-color: #f8f9fa;
  }
`;

const PacientesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [showForm, setShowForm] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [editingPaciente, setEditingPaciente] = useState<Paciente | null>(null);

  const queryClient = useQueryClient();

  const { data: pacientesData, isLoading, error } = useQuery(
    ['pacientes', currentPage, rowsPerPage, searchTerm],
    () => getPacientes(currentPage, rowsPerPage, searchTerm),
    {
      keepPreviousData: true,
    }
  );

  const deletePacienteMutation = useMutation(deletePaciente, {
    onSuccess: () => {
      queryClient.invalidateQueries('pacientes');
    },
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleDeletePaciente = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este paciente?')) {
      try {
        await deletePacienteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error eliminando paciente:', error);
      }
    }
  };

  const handleViewPaciente = (paciente: Paciente) => {
    // Redirigir a la página de tratamiento del paciente
    navigate(`/paciente/${paciente._id}/tratamiento`);
  };

  const handleEditPaciente = (paciente: Paciente) => {
    setEditingPaciente(paciente);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPaciente(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingPaciente(null);
    queryClient.invalidateQueries('pacientes');
  };

  if (isLoading) {
    return (
      <PacientesContainer>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          Cargando pacientes...
        </div>
      </PacientesContainer>
    );
  }

  if (error) {
    return (
      <PacientesContainer>
        <div style={{ textAlign: 'center', padding: '50px', color: '#e74c3c' }}>
          Error cargando pacientes
        </div>
      </PacientesContainer>
    );
  }

  const pacientes = pacientesData?.data || [];
  const pagination = pacientesData?.pagination;

  return (
    <PacientesContainer>
      <Header>
        <NuevoPacienteButton onClick={() => setShowForm(true)}>
          <FaPlus />
          NUEVO PACIENTE
        </NuevoPacienteButton>
      </Header>

      <ListaPacientesTitle>Lista de Pacientes</ListaPacientesTitle>

      <SearchAndExportBar>
        <SearchInput>
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearch}
          />
          <FaSearch className="search-icon" />
          {searchTerm && (
            <span className="clear-icon" onClick={handleClearSearch}>
              ×
            </span>
          )}
        </SearchInput>
        <ExportButton>
          <FaDownload />
        </ExportButton>
      </SearchAndExportBar>

      <PacientesTable>
        <TableHeader>
          <tr>
            <TableHeaderCell>N°</TableHeaderCell>
            <TableHeaderCell>Nombre/Paciente</TableHeaderCell>
            <TableHeaderCell>CI</TableHeaderCell>
            <TableHeaderCell>Alergias</TableHeaderCell>
            <TableHeaderCell>Edad</TableHeaderCell>
            <TableHeaderCell>Fecha</TableHeaderCell>
            <TableHeaderCell>Acciones</TableHeaderCell>
          </tr>
        </TableHeader>
        <TableBody>
          {pacientes.map((paciente: Paciente, index: number) => (
            <TableRow key={paciente._id} $isEven={index % 2 === 0}>
              <TableCell>{index + 1 + (currentPage - 1) * rowsPerPage}</TableCell>
              <TableCell>{paciente.nombre}</TableCell>
              <TableCell>{paciente.ci}</TableCell>
              <TableCell>{paciente.alergias}</TableCell>
              <TableCell>{paciente.edad || '-'}</TableCell>
              <TableCell>{paciente.fechaRegistro ? new Date(paciente.fechaRegistro).toLocaleDateString('es-ES') : 'No disponible'}</TableCell>
              <ActionsCell>
                <ActionButton 
                  $color="#3498db" 
                  onClick={() => handleViewPaciente(paciente)}
                  title="Ver detalles"
                >
                  <FaEye />
                </ActionButton>
                <ActionButton 
                  $color="#e74c3c" 
                  onClick={() => paciente._id && handleDeletePaciente(paciente._id)}
                  title="Eliminar"
                >
                  <FaTrash />
                </ActionButton>
                <ActionButton 
                  $color="#f39c12" 
                  onClick={() => handleEditPaciente(paciente)}
                  title="Editar"
                >
                  <FaEdit />
                </ActionButton>
              </ActionsCell>
            </TableRow>
          ))}
        </TableBody>
      </PacientesTable>

      {pagination && (
        <PaginationContainer>
          <RowsPerPage>
            <span>{pagination.total} rows</span>
            <select 
              value={rowsPerPage} 
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </RowsPerPage>
          
          <PaginationControls>
            <PaginationButton 
              $disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
            >
              {'<<'}
            </PaginationButton>
            <PaginationButton 
              $disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              {'<'}
            </PaginationButton>
            <span>
              {((currentPage - 1) * rowsPerPage) + 1}-{Math.min(currentPage * rowsPerPage, pagination.total)} of {pagination.total}
            </span>
            <PaginationButton 
              $disabled={currentPage === pagination.pages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              {'>'}
            </PaginationButton>
            <PaginationButton 
              $disabled={currentPage === pagination.pages}
              onClick={() => setCurrentPage(pagination.pages)}
            >
              {'>>'}
            </PaginationButton>
          </PaginationControls>
        </PaginationContainer>
      )}

      {showForm && (
        <PacienteForm
          paciente={editingPaciente}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {selectedPaciente && (
        <PacienteModal
          paciente={selectedPaciente}
          onClose={() => setSelectedPaciente(null)}
        />
      )}
    </PacientesContainer>
  );
};

export default PacientesPage;
