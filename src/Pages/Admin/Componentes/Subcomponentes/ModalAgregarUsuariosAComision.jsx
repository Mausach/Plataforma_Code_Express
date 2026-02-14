import React, { useState, useEffect } from 'react';
import { 
  Modal, Button, Form, ListGroup, Spinner, Alert, Badge 
} from 'react-bootstrap';
import Swal from 'sweetalert2';
import { CargarUsuarios } from '../../Helper/CargarUsuarios';
// Importar el helper cuando lo tengas:
// import { agregarUsuarioAComision } from '../../Helper/AgregarUsuarioAComision';

export const ModalAgregarUsuario = ({
  show,
  handleClose,
  comision,
  tipoUsuario, // 'alumno' o 'profesor'
  setRefreshData,
  navigate,
  theme
}) => {
  // Estados
  const [usuarios, setUsuarios] = useState([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsuarios, setSelectedUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Configuración según tipo de usuario
  const config = {
    alumno: {
      title: 'Agregar Alumnos',
      rol: 'Alumno',
      placeholder: 'Buscar alumnos por nombre, apellido, DNI...',
      icon: '👨‍🎓',
      color: '#198754', // verde
      endpoint: 'alumnos'
    },
    profesor: {
      title: 'Agregar Profesores',
      rol: 'profe', // según tu enum de roles
      placeholder: 'Buscar profesores por nombre, apellido, especialidad...',
      icon: '👨‍🏫',
      color: '#0d6efd', // azul
      endpoint: 'profesores'
    }
  };

  const currentConfig = config[tipoUsuario] || config.alumno;

  // Clases CSS según tema
  const cardClass = theme === 'lights' ? 'card-light' : 'card-dark';
  const textClass = theme === 'lights' ? 'text-dark' : 'text-light';
  const formControlClass = theme === 'lights' ? 'bg-white text-dark' : 'bg-dark text-light';
  const borderColor = theme === 'lights' ? '#353432' : '#ebe5e5';
  const titleColor = '#EF7F1A';

  // useEffect para cargar usuarios
  useEffect(() => {
    if (!show || !tipoUsuario) return;

    const controller = new AbortController();
    const { signal } = controller;

    const cargarUsuarios = async () => {
      try {
        setLoading(true);
        setError(null);
        setUsuarios([]);
        setFilteredUsuarios([]);
        setSelectedUsuarios([]);
        
        // Cargar todos los usuarios
        await CargarUsuarios((data) => {
          // Filtrar por rol y que no estén ya en la comisión
          const usuariosFiltrados = data.filter(user => {
            // Filtrar por rol
            if (user.rol !== currentConfig.rol) return false;
            
            // Verificar si ya está en la comisión
            if (tipoUsuario === 'alumno') {
              const yaEsAlumno = comision?.alumnos?.some(
                alumno => alumno.usuario_id?._id === user._id || alumno.usuario_id === user._id
              );
              return !yaEsAlumno;
            } else if (tipoUsuario === 'profesor') {
              const yaEsProfesor = comision?.profesores?.some(
                profesor => profesor.usuario_id?._id === user._id || profesor.usuario_id === user._id
              );
              return !yaEsProfesor;
            }
            
            return true;
          });
          
          setUsuarios(usuariosFiltrados);
          setFilteredUsuarios(usuariosFiltrados);
        }, navigate, { signal });
        
      } catch (error) {
        if (error.name !== 'AbortError') {
          setError("Error al cargar los usuarios. Contacte soporte.");
          console.error('Error al cargar usuarios:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    cargarUsuarios();

    return () => {
      controller.abort();
    };
  }, [show, tipoUsuario, comision, navigate, currentConfig.rol]);

  // Filtrar usuarios por búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsuarios(usuarios);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtrados = usuarios.filter(user => {
      return (
        (user.nombres && user.nombres.toLowerCase().includes(term)) ||
        (user.apellido && user.apellido.toLowerCase().includes(term)) ||
        (user.email && user.email.toLowerCase().includes(term)) ||
        (user.dni && user.dni.toLowerCase().includes(term)) ||
        (user.especialidad && user.especialidad.toLowerCase().includes(term))
      );
    });
    
    setFilteredUsuarios(filtrados);
  }, [searchTerm, usuarios]);

  // Manejar selección de usuarios
  const handleSelectUsuario = (usuarioId) => {
    setSelectedUsuarios(prev => {
      if (prev.includes(usuarioId)) {
        return prev.filter(id => id !== usuarioId);
      } else {
        return [...prev, usuarioId];
      }
    });
  };

  // Manejar selección/deselección todos
  const handleSelectAll = () => {
    if (selectedUsuarios.length === filteredUsuarios.length) {
      setSelectedUsuarios([]);
    } else {
      setSelectedUsuarios(filteredUsuarios.map(user => user._id));
    }
  };

  // Obtener datos de usuarios seleccionados
  const getUsuariosSeleccionados = () => {
    return usuarios.filter(user => selectedUsuarios.includes(user._id));
  };

  // Enviar usuarios seleccionados
  const handleSubmit = async () => {
    if (selectedUsuarios.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Ningún usuario seleccionado',
        text: `Por favor, seleccione al menos un ${tipoUsuario === 'alumno' ? 'alumno' : 'profesor'} para agregar.`,
        background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
        color: theme === 'lights' ? '#353432' : '#ebe5e5'
      });
      return;
    }

    const usuariosSeleccionados = getUsuariosSeleccionados();

    // Preparar datos para enviar al backend
    const datosParaEnviar = {
      comisionId: comision._id,
      usuarios: usuariosSeleccionados.map(user => ({
        usuario_id: user._id,
        nombres: user.nombres,
        apellido: user.apellido,
        email: user.email,
        telefono: user.telefono,
        dni: user.dni,
        ...(tipoUsuario === 'profesor' && { 
          especialidad: user.especialidad || 'Sin especialidad' 
        })
      })),
      tipo: tipoUsuario
    };

    try {
      // Aquí llamarías al helper cuando lo tengas
      // await agregarUsuarioAComision(datosParaEnviar, setRefreshData, navigate, theme);
      
      // Por ahora, mostrar éxito simulado
      Swal.fire({
        icon: 'success',
        title: `¡${selectedUsuarios.length} ${tipoUsuario === 'alumno' ? 'alumno(s)' : 'profesor(es)'} agregado(s)!`,
        text: `${selectedUsuarios.length} ${tipoUsuario === 'alumno' ? 'alumno(s) ha(n)' : 'profesor(es) ha(n)'} sido agregado(s) a la comisión "${comision.nombre}".`,
        background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
        color: theme === 'lights' ? '#353432' : '#ebe5e5',
        confirmButtonColor: currentConfig.color
      });

      resetForm();
      setRefreshData(true);
      handleClose();
    } catch (error) {
      console.error('Error al agregar usuarios:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || `Error al agregar ${tipoUsuario === 'alumno' ? 'alumno(s)' : 'profesor(es)'}.`,
        background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
        color: theme === 'lights' ? '#353432' : '#ebe5e5'
      });
    }
  };

  const resetForm = () => {
    setSelectedUsuarios([]);
    setSearchTerm('');
    setError(null);
  };

  const handleCloseModal = () => {
    resetForm();
    handleClose();
  };

  // Si no hay tipo de usuario, no mostrar el modal
  if (!tipoUsuario) return null;

  return (
    <Modal
      show={show}
      onHide={handleCloseModal}
      size="lg"
      centered
      className={theme}
    >
      <Modal.Header
        closeButton
        className={`${cardClass} ${textClass}`}
        style={{
          borderBottomColor: theme === 'lights' ? '#E0D8C5' : '#1F2535'
        }}
      >
        <Modal.Title style={{ color: currentConfig.color }}>
          <span style={{ fontSize: '1.5em', marginRight: '10px' }}>
            {currentConfig.icon}
          </span>
          {currentConfig.title}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className={`${cardClass} ${textClass}`}>
        {/* Información de la comisión */}
        <div className="mb-4 p-3 rounded" style={{
          backgroundColor: theme === 'lights' ? '#f8f9fa' : '#2a3042',
          border: `1px solid ${borderColor}`
        }}>
          <h6 style={{ color: titleColor }}>Comisión: {comision?.nombre}</h6>
          <p className="mb-1">Carrera: {comision?.carrera_info?.nombre}</p>
          <p className="mb-0">
            {tipoUsuario === 'alumno' ? 'Alumnos actuales' : 'Profesores actuales'}: 
            <strong className="ms-2">
              {tipoUsuario === 'alumno' 
                ? comision?.alumnos?.length || 0 
                : comision?.profesores?.length || 0}
            </strong>
          </p>
        </div>

        {/* Buscador y contador */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Form.Group className="mb-0" style={{ flex: 1 }}>
            <Form.Control
              type="text"
              placeholder={currentConfig.placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={formControlClass}
              style={{ borderColor: borderColor }}
            />
          </Form.Group>
          <div className="ms-3">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleSelectAll}
              style={{ borderColor: borderColor }}
              disabled={filteredUsuarios.length === 0}
            >
              {selectedUsuarios.length === filteredUsuarios.length && filteredUsuarios.length > 0
                ? 'Deseleccionar todos' 
                : 'Seleccionar todos'}
            </Button>
          </div>
        </div>

        <div className="d-flex justify-content-between mb-2">
          <small>
            {filteredUsuarios.length} {tipoUsuario === 'alumno' ? 'alumnos' : 'profesores'} disponibles
          </small>
          <small>
            <strong style={{ color: currentConfig.color }}>
              {selectedUsuarios.length} seleccionados
            </strong>
          </small>
        </div>

        {/* Lista de usuarios */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant={theme === 'lights' ? 'primary' : 'light'} />
            <p className="mt-3">Cargando {tipoUsuario === 'alumno' ? 'alumnos' : 'profesores'}...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">
            <Alert.Heading>Error</Alert.Heading>
            <p>{error}</p>
          </Alert>
        ) : filteredUsuarios.length === 0 ? (
          <div className="text-center py-5">
            <p className="mb-3">
              {searchTerm 
                ? `No se encontraron ${tipoUsuario === 'alumno' ? 'alumnos' : 'profesores'} con ese criterio`
                : `No hay ${tipoUsuario === 'alumno' ? 'alumnos' : 'profesores'} disponibles para agregar. Todos los ${tipoUsuario === 'alumno' ? 'alumnos' : 'profesores'} ya están en esta comisión.`
              }
            </p>
            {searchTerm && (
              <Button
                variant="outline-secondary"
                onClick={() => setSearchTerm('')}
              >
                Limpiar búsqueda
              </Button>
            )}
          </div>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <ListGroup>
              {filteredUsuarios.map((usuario) => (
                <ListGroup.Item
                  key={usuario._id}
                  className={`${cardClass} ${textClass}`}
                  style={{
                    borderColor: borderColor,
                    backgroundColor: selectedUsuarios.includes(usuario._id)
                      ? (theme === 'lights' ? currentConfig.color + '20' : currentConfig.color + '40')
                      : 'inherit',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleSelectUsuario(usuario._id)}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center me-3"
                        style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: selectedUsuarios.includes(usuario._id) 
                            ? currentConfig.color 
                            : (theme === 'lights' ? '#f8f9fa' : '#495057'),
                          color: selectedUsuarios.includes(usuario._id) ? 'white' : 'inherit',
                          fontWeight: 'bold'
                        }}
                      >
                        {usuario.nombres?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="fw-bold">
                          {usuario.nombres} {usuario.apellido}
                        </div>
                        <div className="small">
                          <span className="me-3">📧 {usuario.email}</span>
                          <span>📱 {usuario.telefono || 'Sin teléfono'}</span>
                        </div>
                        <div className="small">
                          <span className="me-3">🆔 {usuario.dni}</span>
                          {tipoUsuario === 'profesor' && usuario.especialidad && (
                            <span>🎯 {usuario.especialidad}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-end">
                      <Badge 
                        bg={usuario.estado ? 'success' : 'secondary'}
                        className="mb-1"
                      >
                        {usuario.estado ? 'Activo' : 'Inactivo'}
                      </Badge>
                      <div className="small">
                        {selectedUsuarios.includes(usuario._id) ? '✓ Seleccionado' : 'Click para seleccionar'}
                      </div>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className={`${cardClass} ${textClass}`}>
        <div className="d-flex justify-content-between w-100 align-items-center">
          <div>
            <small>
              Comisión: <strong>{comision?.nombre}</strong>
            </small>
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="secondary"
              onClick={handleCloseModal}
              style={{
                backgroundColor: theme === 'lights' ? '#353432' : '#1F2535',
                borderColor: theme === 'lights' ? '#353432' : '#1F2535'
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={selectedUsuarios.length === 0 || loading}
              style={{
                backgroundColor: currentConfig.color,
                borderColor: currentConfig.color
              }}
            >
              Agregar {tipoUsuario === 'alumno' ? 'Alumnos' : 'Profesores'} ({selectedUsuarios.length})
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalAgregarUsuario;