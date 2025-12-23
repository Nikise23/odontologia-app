import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { FaUsers, FaPlus, FaEdit, FaTrash, FaUserShield, FaUserTie, FaUserSecret } from 'react-icons/fa';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario, Usuario } from '../services/usuarioService';
import { useNotification } from '../hooks/useNotification';
import { useAuth } from '../contexts/AuthContext';

const Container = styled.div`
  padding: 30px;
  max-width: 1200px;
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
    align-items: stretch;
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

const Button = styled.button`
  padding: 12px 24px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
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

const Modal = styled.div<{ $show: boolean }>`
  display: ${props => props.$show ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    padding: 20px;
    width: 95%;
    max-height: 95vh;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #2c3e50;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #7f8c8d;
  
  &:hover {
    color: #2c3e50;
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
  font-weight: 500;
  color: #2c3e50;
  font-size: 14px;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 10px;
`;

const CancelButton = styled(Button)`
  background: #95a5a6;
  
  &:hover {
    background: #7f8c8d;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
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

const Badge = styled.span<{ $rol: string }>`
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  
  ${props => {
    switch (props.$rol) {
      case 'admin':
        return 'background: #e74c3c; color: white;';
      case 'dentista':
        return 'background: #3498db; color: white;';
      case 'secretaria':
        return 'background: #9b59b6; color: white;';
      default:
        return 'background: #95a5a6; color: white;';
    }
  }}
`;

const StatusBadge = styled.span<{ $activo: boolean }>`
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  
  ${props => props.$activo 
    ? 'background: #d4edda; color: #155724;'
    : 'background: #f8d7da; color: #721c24;'
  }
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-right: 5px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s;
  
  &.edit {
    background: #3498db;
    color: white;
    
    &:hover {
      background: #2980b9;
    }
  }
  
  &.delete {
    background: #e74c3c;
    color: white;
    
    &:hover {
      background: #c0392b;
    }
  }
  
  &:disabled {
    background: #95a5a6;
    cursor: not-allowed;
  }
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

const getRolIcon = (rol: string) => {
  switch (rol) {
    case 'admin':
      return <FaUserShield />;
    case 'dentista':
      return <FaUserTie />;
    case 'secretaria':
      return <FaUserSecret />;
    default:
      return <FaUsers />;
  }
};

const UsuariosPage: React.FC = () => {
  const { usuario } = useAuth();
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'secretaria' as 'dentista' | 'secretaria',
    activo: true
  });

  const { data, isLoading, error } = useQuery(
    'usuarios',
    getUsuarios,
    {
      enabled: usuario?.rol === 'admin',
      refetchOnWindowFocus: false
    }
  );

  const createMutation = useMutation(createUsuario, {
    onSuccess: () => {
      queryClient.invalidateQueries('usuarios');
      setShowModal(false);
      resetForm();
      showNotification('Usuario creado exitosamente', 'success');
    },
    onError: (error: any) => {
      showNotification(error.response?.data?.message || 'Error al crear usuario', 'error');
    }
  });

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => updateUsuario(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('usuarios');
        setShowModal(false);
        resetForm();
        showNotification('Usuario actualizado exitosamente', 'success');
      },
      onError: (error: any) => {
        showNotification(error.response?.data?.message || 'Error al actualizar usuario', 'error');
      }
    }
  );

  const deleteMutation = useMutation(deleteUsuario, {
    onSuccess: () => {
      queryClient.invalidateQueries('usuarios');
      showNotification('Usuario desactivado exitosamente', 'success');
    },
    onError: (error: any) => {
      showNotification(error.response?.data?.message || 'Error al desactivar usuario', 'error');
    }
  });

  const resetForm = () => {
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: 'secretaria',
      activo: true
    });
    setEditingUsuario(null);
  };

  const handleOpenModal = (usuario?: Usuario) => {
    if (usuario) {
      setEditingUsuario(usuario);
      setFormData({
        nombre: usuario.nombre,
        email: usuario.email,
        password: '',
        rol: usuario.rol as 'dentista' | 'secretaria',
        activo: usuario.activo
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUsuario) {
      const updateData: any = {
        nombre: formData.nombre,
        email: formData.email,
        rol: formData.rol,
        activo: formData.activo
      };
      if (formData.password) {
        updateData.password = formData.password;
      }
      updateMutation.mutate({ id: editingUsuario._id!, data: updateData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas desactivar este usuario?')) {
      deleteMutation.mutate(id);
    }
  };

  if (usuario?.rol !== 'admin') {
    return (
      <Container>
        <ErrorMessage>No tienes permisos para acceder a esta sección</ErrorMessage>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container>
        <LoadingMessage>Cargando usuarios...</LoadingMessage>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage>Error al cargar usuarios</ErrorMessage>
      </Container>
    );
  }

  const usuarios = data?.data || [];

  return (
    <Container>
      <Header>
        <Titulo>
          <FaUsers /> Gestión de Usuarios
        </Titulo>
        <Button onClick={() => handleOpenModal()}>
          <FaPlus /> Nuevo Usuario
        </Button>
      </Header>

      {usuarios.length === 0 ? (
        <EmptyState>No hay usuarios registrados</EmptyState>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Nombre</Th>
              <Th>Email</Th>
              <Th>Rol</Th>
              <Th>Estado</Th>
              <Th>Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <Tr key={usuario._id}>
                <Td>{usuario.nombre}</Td>
                <Td>{usuario.email}</Td>
                <Td>
                  <Badge $rol={usuario.rol}>
                    {getRolIcon(usuario.rol)}
                    {usuario.rol}
                  </Badge>
                </Td>
                <Td>
                  <StatusBadge $activo={usuario.activo}>
                    {usuario.activo ? 'Activo' : 'Inactivo'}
                  </StatusBadge>
                </Td>
                <Td>
                  <ActionButton
                    className="edit"
                    onClick={() => handleOpenModal(usuario)}
                    disabled={usuario.rol === 'admin'}
                  >
                    <FaEdit /> Editar
                  </ActionButton>
                  {usuario.rol !== 'admin' && (
                    <ActionButton
                      className="delete"
                      onClick={() => handleDelete(usuario._id!)}
                      disabled={deleteMutation.isLoading}
                    >
                      <FaTrash /> Desactivar
                    </ActionButton>
                  )}
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal $show={showModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              {editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
            </ModalTitle>
            <CloseButton onClick={handleCloseModal}>×</CloseButton>
          </ModalHeader>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Nombre</Label>
              <Input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Contraseña {editingUsuario && '(dejar vacío para no cambiar)'}</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingUsuario}
                minLength={6}
              />
            </FormGroup>
            <FormGroup>
              <Label>Rol</Label>
              <Select
                value={formData.rol}
                onChange={(e) => setFormData({ ...formData, rol: e.target.value as 'dentista' | 'secretaria' })}
                required
              >
                <option value="dentista">Dentista</option>
                <option value="secretaria">Secretaria/o</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <CheckboxGroup>
                <Checkbox
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                />
                <Label>Usuario activo</Label>
              </CheckboxGroup>
            </FormGroup>
            <ButtonGroup>
              <CancelButton type="button" onClick={handleCloseModal}>
                Cancelar
              </CancelButton>
              <Button
                type="submit"
                disabled={createMutation.isLoading || updateMutation.isLoading}
              >
                {editingUsuario ? 'Actualizar' : 'Crear'}
              </Button>
            </ButtonGroup>
          </Form>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default UsuariosPage;

