import React, { useEffect, useState } from 'react';
import { Button, Modal, ListGroup, Spinner, Alert, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
//import { changeEstadoUsuario } from './Helper/CambiarEstadoUsuario';
import { CargarUsuarios } from '../Helper/CargarUsuarios';
import ModalCrearUsuario from './Subcomponentes/ModalCrearUsuario';
import ModalEditarUsuario from './Subcomponentes/ModalEdutarUsuario';
import { changeEstadoUsuario } from '../Helper/CambiarEstadoUsuario';

export const GestionUsuarios = ({ theme }) => {
  const navigate = useNavigate();

  // Estados
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshData, setRefreshData] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clases según tema
  const cardClass = theme === 'lights' ? 'card-light' : 'card-dark';
  const textClass = theme === 'lights' ? 'text-dark' : 'text-light';
  const borderColor = theme === 'lights' ? '#E0D8C5' : '#1F2535';
  const titleColor = '#EF7F1A';

  // useEffect para cargar usuarios
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);
        await CargarUsuarios(setUsers, navigate, { signal });
      } catch (error) {
        if (error.name !== 'AbortError') {
          setError("Error crítico. Contacte soporte.");
        }
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    if (refreshData) {
      cargarDatos();
      setRefreshData(false);
    } else {
      cargarDatos();
    }

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [refreshData, navigate]);

  // Loading
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <Spinner animation="border" variant={theme === 'lights' ? 'primary' : 'light'} />
        <span className="ms-2">Cargando usuarios...</span>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <Alert variant="danger" className={`mt-3 ${cardClass} ${textClass}`}>
        <Alert.Heading>Error</Alert.Heading>
        <p>{error}</p>
        <Button 
          variant="outline-danger" 
          onClick={() => setRefreshData(true)}
          className="ms-2"
        >
          Reintentar
        </Button>
      </Alert>
    );
  }

  // Handlers
  const handleShowModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleShowCreateModal = () => setShowCreateModal(true);
  const handleCloseCreateModal = () => setShowCreateModal(false);

  const handleShowDetailsModal = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedUser(null);
  };

  // Buscador seguro
  const filteredUsers = (users || []).filter(user => {
    if (!user) return false;
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    return (
      (user.nombres && user.nombres.toLowerCase().includes(searchLower)) ||
      (user.apellido && user.apellido.toLowerCase().includes(searchLower)) ||
      (user.email && user.email.toLowerCase().includes(searchLower)) ||
      (user.dni && user.dni.toLowerCase().includes(searchLower)) ||
      (user.telefono && String(user.telefono).includes(searchTerm)) ||
      (user.provincia && user.provincia.toLowerCase().includes(searchLower)) ||
      (user.rol && user.rol.toLowerCase().includes(searchLower))
    );
  });

  // Función para cambiar estado (activar/desactivar)
  const handleChangeEstado = (user) => {
    const action = user.estado ? 'desactivar' : 'activar';
    const estadoText = user.estado ? 'inactivo' : 'activo';
    
    Swal.fire({
      title: `¿${user.estado ? 'Desactivar' : 'Activar'} usuario?`,
      text: `El usuario ${user.nombres} ${user.apellido} pasará a estar ${estadoText}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: user.estado ? '#d33' : '#3085d6',
      cancelButtonColor: '#6c757d',
      confirmButtonText: user.estado ? 'Sí, desactivar' : 'Sí, activar',
      cancelButtonText: 'Cancelar',
      background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
      color: theme === 'lights' ? '#353432' : '#ebe5e5',
      customClass: {
        popup: cardClass
      }
    }).then((result) => {
      if (result.isConfirmed) {
        changeEstadoUsuario(user, setRefreshData, navigate, theme);
      }
    });
  };

  return (
    <div className={`card ${theme === 'lights' ? 'card-light' : 'card-dark'} card-with-shadow p-4`}>
      {/* Header */}
      <div className="mb-4">
        <h2 className='title'>👥 Gestión de Usuarios</h2>
        <p >Total: {users.length} usuarios registrados</p>
      </div>

      {/* Buscador y Botones */}
      <div className="row mb-4">
        <div className="col-md-8 mb-3 mb-md-0">
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Buscar por nombre, apellido, email, DNI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ borderColor: borderColor }}
            />
          </Form.Group>
        </div>
        
        <div className="col-md-4 d-flex gap-2 justify-content-md-end">
          <Button 
            variant="primary" 
            onClick={handleShowCreateModal}
            style={{ 
              backgroundColor: titleColor,
              borderColor: titleColor
            }}
          >
            <i className="bi bi-person-plus me-2"></i>
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {/* Lista de Usuarios */}
      <ListGroup className={`${cardClass} card-with-shadow`}>
        {filteredUsers.length > 0 ? (
          filteredUsers
            .sort((a, b) => (a.apellido || '').localeCompare(b.apellido || ''))
            .map((user) => (
              <ListGroup.Item 
                key={user._id || user.id} 
                className={`d-flex justify-content-between align-items-center ${cardClass} ${textClass}`}
                style={{ borderColor: borderColor }}
              >
                <div className="row w-100">
                  <div className="col-md-8 mb-2 mb-md-0">
                    <div>
                      <strong>{user.nombres || 'Sin nombre'} {user.apellido || ''}</strong>
                    </div>
                    <div >
                      {user.email} • {user.rol} • 
                      <span className={user.estado ? 'text-success ms-1' : 'text-danger ms-1'}>
                        {user.estado ? ' Activo' : ' Inactivo'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="col-md-4 d-flex flex-wrap justify-content-end gap-2">
                    {/* Botón Ver Detalles */}
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleShowDetailsModal(user)}
                      style={{
                        borderColor: borderColor,
                        color: 'inherit'
                      }}
                      title="Ver detalles"
                    >
                      <i className="bi bi-eye"></i>
                    </Button>
                    
                    {/* Botón Editar */}
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={() => handleShowModal(user)}
                      style={{
                        borderColor: borderColor,
                        color: 'inherit'
                      }}
                      title="Editar"
                    >
                      <i className="bi bi-pencil-square"></i>
                    </Button>
                    
                    {/* Botón Activar/Desactivar */}
                    {user.estado ? (
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleChangeEstado(user)}
                        style={{
                          borderColor: borderColor,
                          color: 'inherit'
                        }}
                        title="Desactivar usuario"
                      >
                        <i className="bi bi-person-slash"></i>
                      </Button>
                    ) : (
                      <Button 
                        variant="outline-success" 
                        size="sm"
                        onClick={() => handleChangeEstado(user)}
                        style={{
                          borderColor: borderColor,
                          color: 'inherit'
                        }}
                        title="Activar usuario"
                      >
                        <i className="bi bi-person-check"></i>
                      </Button>
                    )}
                  </div>
                </div>
              </ListGroup.Item>
            ))
        ) : (
          <ListGroup.Item className={`text-center ${cardClass} ${textClass}`}>
            {searchTerm ? 'No se encontraron usuarios con ese criterio' : 'No hay usuarios registrados.'}
          </ListGroup.Item>
        )}
      </ListGroup>

      {/* Modal de Detalles */}
      <Modal 
        show={showDetailsModal} 
        onHide={handleCloseDetailsModal}
        centered
      >
        <Modal.Header 
          closeButton
          className={`${cardClass} ${textClass}`}
          style={{ borderBottomColor: borderColor }}
        >
          <Modal.Title style={{ color: titleColor }}>
            Detalles del Usuario
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className={`${cardClass} ${textClass}`}>
          {selectedUser && (
            <div className="row">
              <div className="col-md-6 mb-3">
                <h6 style={{ color: titleColor }}>Información Personal</h6>
                <p><strong>Nombres:</strong> {selectedUser.nombres}</p>
                <p><strong>Apellido:</strong> {selectedUser.apellido}</p>
                <p><strong>DNI:</strong> {selectedUser.dni}</p>
                <p><strong>Fecha Nacimiento:</strong> {selectedUser.fecha_nacimiento}</p>
                <p><strong>Género:</strong> {selectedUser.genero}</p>
              </div>
              
              <div className="col-md-6 mb-3">
                <h6 style={{ color: titleColor }}>Contacto y Sistema</h6>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Teléfono:</strong> {selectedUser.telefono}</p>
                <p><strong>Provincia:</strong> {selectedUser.provincia}</p>
                <p><strong>Rol:</strong> {selectedUser.rol}</p>
                <p>
                  <strong>Estado:</strong> 
                  <span className={selectedUser.estado ? 'text-success ms-1' : 'text-danger ms-1'}>
                    {selectedUser.estado ? 'Activo' : 'Inactivo'}
                  </span>
                </p>
              </div>
            </div>
          )}
        </Modal.Body>
        
        <Modal.Footer className={`${cardClass} ${textClass}`}>
          <Button 
            variant="secondary" 
            onClick={handleCloseDetailsModal}
            style={{
              backgroundColor: theme === 'lights' ? '#353432' : '#1F2535',
              borderColor: theme === 'lights' ? '#353432' : '#1F2535'
            }}
          >
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Crear Usuario */}
      <ModalCrearUsuario
        show={showCreateModal}
        handleClose={handleCloseCreateModal}
        setRefreshData={setRefreshData}
        navigate={navigate}
        theme={theme}
      />

      {/* Modal Editar Usuario */}
      <ModalEditarUsuario
        show={showModal}
        handleClose={handleCloseModal}
        usuario={selectedUser}
        setRefreshData={setRefreshData}
        navigate={navigate}
        theme={theme}
      />
    </div>
  );
};