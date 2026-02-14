// Components/Subcomponentes/PanelInscripcion.jsx
import React, { useState, useEffect } from 'react';
import { 
  Card, Button, Badge, 
  ListGroup, Form, Alert,
  Row, Col, Spinner, Tabs, Tab
} from 'react-bootstrap';
import { 
  PersonPlus, PersonCheck, PersonX, PersonDash,
  People, Person, Search, Archive, CheckCircle,
  ArrowClockwise, PersonFillCheck, PersonFillSlash
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { CargarInscripciones } from '../../Helper/CargarUsuariosInscriptos';
import { CargarUsuarios } from '../../Helper/CargarUsuarios';
import { InscribirUsuario } from '../../Helper/InscripcionDeUsuarioAComision';
import { 
  DarBajaInscripcion, 
  ReactivarInscripcion, 
  MostrarModalBaja 
} from '../../Helper/DarBajaReactivarUsuarioComision';

const PanelInscripcion = ({ comision, theme }) => {
  const navigate = useNavigate();
  const isLight = theme === 'lights';
  const textColor = isLight ? '#212529' : '#E9ECEF';
  const bgColor = isLight ? '#FFFFFF' : '#1A1F2E';
  const cardBg = isLight ? '#F8F9FA' : '#252A3A';
  const borderColor = isLight ? '#DEE2E6' : '#3A4255';
  const inputBg = isLight ? '#FFFFFF' : '#2D3447';
  const inputBorder = isLight ? '#CED4DA' : '#4A5368';
  
  // Estados principales
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshData, setRefreshData] = useState(false);
  
  // Estados para datos
  const [datosInscripciones, setDatosInscripciones] = useState({
    alumnos: [],
    profesores: [],
    total: 0,
    isLoading: true,
    error: null
  });
  
  const [usuariosSistema, setUsuariosSistema] = useState([]);
  const [usuariosDisponibles, setUsuariosDisponibles] = useState({
    alumnos: [],
    profesores: []
  });
  
  // Estados para selección
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState('');
  const [profesorSeleccionado, setProfesorSeleccionado] = useState('');
  
  // Estados de carga y mensajes
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // useEffect principal para cargar datos
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 1. Cargar inscripciones de la comisión
        await CargarInscripciones(comision._id, setDatosInscripciones, navigate, { signal });
        
        // 2. Cargar todos los usuarios del sistema
        await CargarUsuarios(setUsuariosSistema, navigate, { signal });
        
      } catch (error) {
        if (error.name !== 'AbortError') {
          setError("Error al cargar datos. Por favor, intente nuevamente.");
        }
      } finally {
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
  }, [comision._id, refreshData, navigate]);

  // useEffect para filtrar usuarios disponibles - CORREGIDO
  useEffect(() => {
    if (usuariosSistema.length > 0 && datosInscripciones.alumnos && datosInscripciones.profesores) {
      console.log('📊 Iniciando filtrado de usuarios disponibles...');
      
      // Obtener TODOS los usuarios que ya tienen inscripción en esta comisión (activos e inactivos)
      const todasLasInscripciones = [
        ...datosInscripciones.alumnos,
        ...datosInscripciones.profesores
      ];
      
      // Crear un Set con los IDs de todos los usuarios que ya están inscritos (sin importar estado)
      const idsUsuariosInscritos = new Set(
        todasLasInscripciones.map(inscripcion => inscripcion.usuario_id)
      );
      
      console.log('📋 Total usuarios inscritos en esta comisión:', {
        totalInscritos: idsUsuariosInscritos.size,
        alumnos: datosInscripciones.alumnos.length,
        profesores: datosInscripciones.profesores.length,
        detalleEstados: {
          alumnosActivos: datosInscripciones.alumnos.filter(a => a.estado_inscripcion === 'activo').length,
          alumnosInactivos: datosInscripciones.alumnos.filter(a => a.estado_inscripcion !== 'activo').length,
          profesActivos: datosInscripciones.profesores.filter(p => p.estado_inscripcion === 'activo').length,
          profesInactivos: datosInscripciones.profesores.filter(p => p.estado_inscripcion !== 'activo').length
        }
      });
      
      // Filtrar alumnos disponibles:
      // 1. Que sean de rol "Alumno"
      // 2. Que estén activos en el sistema
      // 3. Que NO estén en la lista de IDs de usuarios ya inscritos (ni activos ni inactivos)
      const alumnosDisponibles = usuariosSistema.filter(usuario => 
        usuario.rol === "alumno" && 
        usuario.estado === true &&
        !idsUsuariosInscritos.has(usuario._id)
      );
      
      // Filtrar profesores disponibles:
      // 1. Que sean de rol "profe"
      // 2. Que estén activos en el sistema
      // 3. Que NO estén en la lista de IDs de usuarios ya inscritos (ni activos ni inactivos)
      const profesoresDisponibles = usuariosSistema.filter(usuario => 
        usuario.rol === "profe" && 
        usuario.estado === true &&
        !idsUsuariosInscritos.has(usuario._id)
      );
      
      setUsuariosDisponibles({
        alumnos: alumnosDisponibles,
        profesores: profesoresDisponibles
      });
      
      console.log('✅ Filtrado completado:', {
        totalUsuariosSistema: usuariosSistema.length,
        alumnosDisponibles: alumnosDisponibles.length,
        profesoresDisponibles: profesoresDisponibles.length,
        idsExcluidos: Array.from(idsUsuariosInscritos)
      });
    }
  }, [usuariosSistema, datosInscripciones]);

  // Función para obtener usuarios activos
  const getUsuariosActivos = (tipo) => {
    const usuarios = tipo === 'alumno' ? datosInscripciones.alumnos : datosInscripciones.profesores;
    return usuarios.filter(u => u.estado_inscripcion === 'activo');
  };

  // Función para obtener usuarios inactivos
  const getUsuariosInactivos = (tipo) => {
    const usuarios = tipo === 'alumno' ? datosInscripciones.alumnos : datosInscripciones.profesores;
    return usuarios.filter(u => u.estado_inscripcion !== 'activo');
  };

  // Función para inscribir alumno
  const inscribirAlumno = async () => {
    if (!alumnoSeleccionado) {
      setMensaje({ tipo: 'warning', texto: 'Selecciona un alumno para inscribir' });
      return;
    }
    
    setCargando(true);
    
    try {
      await InscribirUsuario(
        comision._id,
        alumnoSeleccionado,
        // Callback de éxito
        (inscripcionCreada) => {
          console.log('✅ Inscripción exitosa:', inscripcionCreada);
          setRefreshData(true);
          setAlumnoSeleccionado('');
          
          // Actualizar lista de disponibles inmediatamente
          setUsuariosDisponibles(prev => ({
            ...prev,
            alumnos: prev.alumnos.filter(a => a._id !== alumnoSeleccionado)
          }));
          
          // Mostrar mensaje de éxito
          setMensaje({ tipo: 'success', texto: 'Alumno inscrito correctamente' });
        },
        // Callback de error
        (error) => {
          console.error('❌ Error en inscripción:', error);
          setMensaje({ tipo: 'danger', texto: `Error al inscribir alumno: ${error.message || 'Error desconocido'}` });
        },
        theme
      );
      
    } catch (error) {
      console.error('Error al inscribir alumno:', error);
      setMensaje({ tipo: 'danger', texto: `Error inesperado: ${error.message}` });
    } finally {
      setCargando(false);
    }
  };

  // Función para inscribir profesor
  const inscribirProfesor = async () => {
    if (!profesorSeleccionado) {
      setMensaje({ tipo: 'warning', texto: 'Selecciona un profesor para asignar' });
      return;
    }
    
    setCargando(true);
    
    try {
      await InscribirUsuario(
        comision._id,
        profesorSeleccionado,
        // Callback de éxito
        (inscripcionCreada) => {
          console.log('✅ Asignación exitosa:', inscripcionCreada);
          setRefreshData(true);
          setProfesorSeleccionado('');
          
          // Actualizar lista de disponibles inmediatamente
          setUsuariosDisponibles(prev => ({
            ...prev,
            profesores: prev.profesores.filter(p => p._id !== profesorSeleccionado)
          }));
          
          // Mostrar mensaje de éxito
          setMensaje({ tipo: 'success', texto: 'Profesor asignado correctamente' });
        },
        // Callback de error
        (error) => {
          console.error('❌ Error en asignación:', error);
          setMensaje({ tipo: 'danger', texto: `Error al asignar profesor: ${error.message || 'Error desconocido'}` });
        },
        theme
      );
      
    } catch (error) {
      console.error('Error al asignar profesor:', error);
      setMensaje({ tipo: 'danger', texto: `Error inesperado: ${error.message}` });
    } finally {
      setCargando(false);
    }
  };

  // Función para dar de baja usuario
  const darBajaUsuario = async (inscripcionId, nombre, tipo) => {
    const resultado = await MostrarModalBaja(nombre, tipo, null, theme);
    
    if (resultado.confirmed) {
      setCargando(true);
      
      await DarBajaInscripcion(
        inscripcionId,
        resultado.estado,
        resultado.motivo,
        // Callback de éxito
        (inscripcionActualizada) => {
          console.log('✅ Baja exitosa:', inscripcionActualizada);
          setRefreshData(true);
          setMensaje({ 
            tipo: 'success', 
            texto: `${tipo === 'alumno' ? 'Alumno' : 'Profesor'} dado de baja correctamente` 
          });
        },
        // Callback de error
        (error) => {
          console.error('❌ Error en baja:', error);
          setMensaje({ tipo: 'danger', texto: `Error al dar de baja: ${error.message || 'Error desconocido'}` });
        },
        theme
      );
      
      setCargando(false);
    }
  };

  // Función para reactivar usuario - ACTUALIZADA
  const reactivarUsuario = async (inscripcionId, nombre, tipo) => {
    console.log(`🔄 Intentando reactivar ${tipo}:`, { 
      inscripcionId, 
      nombre,
      tipo 
    });
    
    Swal.fire({
      title: `¿Reactivar ${tipo}?`,
      text: `¿Desea reactivar a ${nombre} en esta comisión?`,
      html: `
        <div style="text-align: left; margin-top: 10px;">
          <small><strong>Acción:</strong> Reactivar inscripción</small><br/>
          <small><strong>Usuario:</strong> ${nombre}</small><br/>
          <small><strong>Tipo:</strong> ${tipo === 'alumno' ? 'Alumno' : 'Profesor'}</small>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, reactivar',
      cancelButtonText: 'Cancelar',
      background: isLight ? '#FAF3E1' : '#0A0E17',
      color: isLight ? '#353432' : '#ebe5e5',
    }).then(async (result) => {
      if (result.isConfirmed) {
        setCargando(true);
        
        console.log(`✅ Confirmada reactivación de ${tipo} ID: ${inscripcionId}`);
        
        try {
          // ✅ LLAMADA A LA FUNCIÓN REACTIVAR INSCRIPCIÓN
          await ReactivarInscripcion(
            inscripcionId,
            // Callback de éxito
            (inscripcionReactiva) => {
              console.log('✅ Reactivación exitosa:', inscripcionReactiva);
              
              // Actualizar los datos inmediatamente
              setRefreshData(true);
              
              // Actualizar la lista de disponibles (si el usuario estaba en la lista de inactivos)
              setDatosInscripciones(prev => {
                const actualizarInscripcion = (usuarios) => 
                  usuarios.map(u => 
                    u.inscripcion_id === inscripcionId 
                      ? { ...u, estado_inscripcion: 'activo', fecha_baja: null, motivo_baja: null }
                      : u
                  );
                
                return {
                  ...prev,
                  alumnos: tipo === 'alumno' ? actualizarInscripcion(prev.alumnos) : prev.alumnos,
                  profesores: tipo === 'profesor' ? actualizarInscripcion(prev.profesores) : prev.profesores
                };
              });
              
              // Mostrar mensaje de éxito adicional
              setMensaje({ 
                tipo: 'success', 
                texto: `${tipo === 'alumno' ? 'Alumno' : 'Profesor'} reactivado correctamente` 
              });
            },
            // Callback de error
            (error) => {
              console.error('❌ Error en reactivación:', error);
              setMensaje({ 
                tipo: 'danger', 
                texto: `Error al reactivar: ${error}` 
              });
            },
            theme
          );
          
        } catch (error) {
          console.error('💥 Error inesperado en reactivarUsuario:', error);
          setMensaje({ 
            tipo: 'danger', 
            texto: `Error inesperado: ${error.message}` 
          });
        } finally {
          setCargando(false);
        }
      } else {
        console.log('❌ Reactivación cancelada por el usuario');
      }
    });
  };

  // Función para obtener color del badge según estado
  const getBadgeColor = (estado) => {
    switch(estado) {
      case 'activo': return 'success';
      case 'inactivo': return 'warning';
      case 'egresado': return 'info';
      case 'abandono': return 'secondary';
      case 'suspendido': return 'danger';
      default: return 'secondary';
    }
  };

  // Función para obtener texto del estado
  const getEstadoTexto = (estado) => {
    const textos = {
      'activo': 'Activo',
      'inactivo': 'Inactivo',
      'egresado': 'Egresado',
      'abandono': 'Abandono',
      'suspendido': 'Suspendido'
    };
    return textos[estado] || estado;
  };

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Función para limpiar mensajes después de un tiempo
  useEffect(() => {
    if (mensaje.texto) {
      const timer = setTimeout(() => {
        setMensaje({ tipo: '', texto: '' });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  // Estados de carga/error
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <Spinner animation="border" variant={isLight ? 'primary' : 'light'} />
        <span className="ms-2" style={{ color: textColor }}>Cargando inscripciones...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mt-3">
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

  // Datos calculados
  const alumnosActivos = getUsuariosActivos('alumno');
  const alumnosInactivos = getUsuariosInactivos('alumno');
  const profesoresActivos = getUsuariosActivos('profesor');
  const profesoresInactivos = getUsuariosInactivos('profesor');

  return (
    <div>
      {mensaje.texto && (
        <Alert 
          variant={mensaje.tipo} 
          onClose={() => setMensaje({ tipo: '', texto: '' })} 
          dismissible
          className="mb-4"
        >
          {mensaje.texto}
        </Alert>
      )}
      
      <Row>
        {/* Sección de Inscripción - Columna izquierda */}
        <Col lg={5} className="mb-4">
          <Card 
            className="border-0 shadow-sm h-100"
            style={{ backgroundColor: bgColor }}
          >
            <Card.Body className="p-4">
              <Card.Title 
                className="mb-4 d-flex align-items-center"
                style={{ color: textColor }}
              >
                <PersonPlus className="me-2" size={24} />
                Inscribir Usuarios
              </Card.Title>
              
              {/* Inscripción de Alumnos */}
              <div className="mb-5">
                <h6 
                  className="mb-3 d-flex align-items-center"
                  style={{ color: textColor }}
                >
                  <People className="me-2" />
                  Inscribir Alumno
                </h6>
                
                <Form.Group className="mb-3">
                  <Form.Label 
                    className="small mb-2"
                    style={{ color: isLight ? '#6C757D' : '#ADB5BD' }}
                  >
                    Seleccionar alumno disponible
                  </Form.Label>
                  <div className="d-flex">
                    <Form.Select
                      value={alumnoSeleccionado}
                      onChange={(e) => setAlumnoSeleccionado(e.target.value)}
                      style={{
                        backgroundColor: inputBg,
                        borderColor: inputBorder,
                        color: textColor,
                        flex: 1
                      }}
                      disabled={cargando || usuariosDisponibles.alumnos.length === 0}
                    >
                      <option value="">{usuariosDisponibles.alumnos.length === 0 ? 'No hay alumnos disponibles' : 'Selecciona un alumno...'}</option>
                      {usuariosDisponibles.alumnos.map(alumno => (
                        <option key={alumno._id} value={alumno._id}>
                          {alumno.nombres} {alumno.apellido} - {alumno.dni}
                        </option>
                      ))}
                    </Form.Select>
                    
                    <Button
                      variant="success"
                      onClick={inscribirAlumno}
                      disabled={!alumnoSeleccionado || cargando}
                      className="ms-2"
                      style={{ minWidth: '100px' }}
                    >
                      {cargando ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <>
                          <PersonCheck className="me-1" />
                          Inscribir
                        </>
                      )}
                    </Button>
                  </div>
                  <Form.Text 
                    className="small mt-1 d-block"
                    style={{ color: isLight ? '#6C757D' : '#ADB5BD' }}
                  >
                    {usuariosDisponibles.alumnos.length} alumno(s) disponible(s)
                    {datosInscripciones.alumnos.length > 0 && (
                      <span className="ms-2">
                        ({datosInscripciones.alumnos.length} ya inscritos en esta comisión)
                      </span>
                    )}
                  </Form.Text>
                </Form.Group>
                
                {/* Separador */}
                <hr style={{ borderColor: borderColor }} />
                
                {/* Inscripción de Profesores */}
                <h6 
                  className="mb-3 d-flex align-items-center"
                  style={{ color: textColor }}
                >
                  <Person className="me-2" />
                  Asignar Profesor
                </h6>
                
                <Form.Group className="mb-3">
                  <Form.Label 
                    className="small mb-2"
                    style={{ color: isLight ? '#6C757D' : '#ADB5BD' }}
                  >
                    Seleccionar profesor disponible
                  </Form.Label>
                  <div className="d-flex">
                    <Form.Select
                      value={profesorSeleccionado}
                      onChange={(e) => setProfesorSeleccionado(e.target.value)}
                      style={{
                        backgroundColor: inputBg,
                        borderColor: inputBorder,
                        color: textColor,
                        flex: 1
                      }}
                      disabled={cargando || usuariosDisponibles.profesores.length === 0}
                    >
                      <option value="">{usuariosDisponibles.profesores.length === 0 ? 'No hay profesores disponibles' : 'Selecciona un profesor...'}</option>
                      {usuariosDisponibles.profesores.map(profesor => (
                        <option key={profesor._id} value={profesor._id}>
                          {profesor.nombres} {profesor.apellido} - {profesor.dni}
                        </option>
                      ))}
                    </Form.Select>
                    
                    <Button
                      variant="primary"
                      onClick={inscribirProfesor}
                      disabled={!profesorSeleccionado || cargando}
                      className="ms-2"
                      style={{ minWidth: '100px' }}
                    >
                      {cargando ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <>
                          <PersonCheck className="me-1" />
                          Asignar
                        </>
                      )}
                    </Button>
                  </div>
                  <Form.Text 
                    className="small mt-1 d-block"
                    style={{ color: isLight ? '#6C757D' : '#ADB5BD' }}
                  >
                    {usuariosDisponibles.profesores.length} profesor(es) disponible(s)
                    {datosInscripciones.profesores.length > 0 && (
                      <span className="ms-2">
                        ({datosInscripciones.profesores.length} ya asignados en esta comisión)
                      </span>
                    )}
                  </Form.Text>
                </Form.Group>
              </div>
              
              {/* Estadísticas rápidas */}
              <Card 
                className="border-0 mt-4"
                style={{ backgroundColor: cardBg }}
              >
                <Card.Body className="p-3">
                  <Row>
                    <Col xs={6} className="text-center">
                      <div 
                        className="fw-bold fs-4"
                        style={{ color: textColor }}
                      >
                        {datosInscripciones.alumnos.length}
                      </div>
                      <small style={{ color: isLight ? '#6C757D' : '#ADB5BD' }}>
                        Total alumnos
                      </small>
                    </Col>
                    <Col xs={6} className="text-center">
                      <div 
                        className="fw-bold fs-4"
                        style={{ color: textColor }}
                      >
                        {datosInscripciones.profesores.length}
                      </div>
                      <small style={{ color: isLight ? '#6C757D' : '#ADB5BD' }}>
                        Total profesores
                      </small>
                    </Col>
                  </Row>
                  <Row className="mt-2">
                    <Col xs={6} className="text-center">
                      <div className="small text-success">
                        <PersonFillCheck size={14} className="me-1" />
                        {alumnosActivos.length} activos
                      </div>
                    </Col>
                    <Col xs={6} className="text-center">
                      <div className="small text-warning">
                        <PersonFillSlash size={14} className="me-1" />
                        {alumnosInactivos.length} inactivos
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </Col>
        
        {/* Sección de Listados - Columnas derecha (2 columnas) */}
        <Col lg={7}>
          <Row>
            {/* ALUMNOS - Columna izquierda */}
            <Col md={6} className="mb-4">
              <Card 
                className="border-0 shadow-sm h-100"
                style={{ backgroundColor: bgColor }}
              >
                <Card.Body className="p-4">
                  <Tabs defaultActiveKey="activos" className="mb-3">
                    {/* Pestaña Alumnos Activos */}
                    <Tab 
                      eventKey="activos" 
                      title={
                        <span>
                          <PersonFillCheck size={14} className="me-1" />
                          Activos ({alumnosActivos.length})
                        </span>
                      }
                    >
                      {alumnosActivos.length === 0 ? (
                        <Alert 
                          variant={isLight ? 'light' : 'dark'}
                          className="text-center py-4 mt-3"
                        >
                          <CheckCircle size={32} className="mb-2 text-success" />
                          <p className="mb-0">No hay alumnos activos</p>
                        </Alert>
                      ) : (
                        <ListGroup variant="flush" className="mt-3">
                          {alumnosActivos.map(alumno => (
                            <ListGroup.Item
                              key={alumno.inscripcion_id}
                              className="d-flex justify-content-between align-items-center px-0 py-3"
                              style={{
                                backgroundColor: 'transparent',
                                borderColor: borderColor,
                                color: textColor
                              }}
                            >
                              <div className="flex-grow-1">
                                <div className="fw-bold">{alumno.nombre_completo}</div>
                                <small style={{ color: isLight ? '#6C757D' : '#ADB5BD' }}>
                                  {alumno.email}
                                </small>
                                <div className="small mt-1">
                                  <Badge bg="secondary" className="me-1">
                                    {alumno.dni}
                                  </Badge>
                                  <Badge bg="success" className="me-1">
                                    Activo
                                  </Badge>
                                  <small className="text-muted d-block mt-1">
                                    <em>Inscrito: {formatearFecha(alumno.fecha_inscripcion)}</em>
                                  </small>
                                </div>
                              </div>
                              
                              {/* Botón para dar de baja */}
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => darBajaUsuario(alumno.inscripcion_id, alumno.nombre_completo, 'alumno')}
                                title="Dar de baja alumno"
                                disabled={cargando}
                              >
                                {cargando ? (
                                  <Spinner animation="border" size="sm" />
                                ) : (
                                  <PersonX size={16} />
                                )}
                              </Button>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      )}
                    </Tab>
                    
                    {/* Pestaña Alumnos Inactivos */}
                    <Tab 
                      eventKey="inactivos" 
                      title={
                        <span>
                          <Archive size={14} className="me-1" />
                          Inactivos ({alumnosInactivos.length})
                        </span>
                      }
                    >
                      {alumnosInactivos.length === 0 ? (
                        <Alert 
                          variant={isLight ? 'light' : 'dark'}
                          className="text-center py-4 mt-3"
                        >
                          <Archive size={32} className="mb-2 text-warning" />
                          <p className="mb-0">No hay alumnos inactivos</p>
                        </Alert>
                      ) : (
                        <ListGroup variant="flush" className="mt-3">
                          {alumnosInactivos.map(alumno => (
                            <ListGroup.Item
                              key={alumno.inscripcion_id}
                              className="d-flex justify-content-between align-items-center px-0 py-3"
                              style={{
                                backgroundColor: 'transparent',
                                borderColor: borderColor,
                                color: textColor
                              }}
                            >
                              <div className="flex-grow-1">
                                <div className="fw-bold">{alumno.nombre_completo}</div>
                                <small style={{ color: isLight ? '#6C757D' : '#ADB5BD' }}>
                                  {alumno.email}
                                </small>
                                <div className="small mt-1">
                                  <Badge bg="secondary" className="me-1">
                                    {alumno.dni}
                                  </Badge>
                                  <Badge bg={getBadgeColor(alumno.estado_inscripcion)} className="me-1">
                                    {getEstadoTexto(alumno.estado_inscripcion)}
                                  </Badge>
                                  <small className="text-muted d-block mt-1">
                                    <em>Baja: {formatearFecha(alumno.fecha_baja)}</em>
                                    {alumno.motivo_baja && (
                                      <div className="text-truncate" style={{ maxWidth: '200px' }} title={alumno.motivo_baja}>
                                        <small><em>Motivo: {alumno.motivo_baja}</em></small>
                                      </div>
                                    )}
                                  </small>
                                </div>
                              </div>
                              
                              {/* ✅ BOTÓN PARA REACTIVAR ALUMNO - CORREGIDO */}
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => reactivarUsuario(
                                  alumno.inscripcion_id, 
                                  alumno.nombre_completo, 
                                  'alumno'
                                )}
                                title="Reactivar alumno"
                                disabled={cargando}
                              >
                                {cargando ? (
                                  <Spinner animation="border" size="sm" />
                                ) : (
                                  <ArrowClockwise size={16} />
                                )}
                              </Button>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      )}
                    </Tab>
                  </Tabs>
                </Card.Body>
              </Card>
            </Col>
            
            {/* PROFESORES - Columna derecha */}
            <Col md={6}>
              <Card 
                className="border-0 shadow-sm h-100"
                style={{ backgroundColor: bgColor }}
              >
                <Card.Body className="p-4">
                  <Tabs defaultActiveKey="activos" className="mb-3">
                    {/* Pestaña Profesores Activos */}
                    <Tab 
                      eventKey="activos" 
                      title={
                        <span>
                          <PersonFillCheck size={14} className="me-1" />
                          Activos ({profesoresActivos.length})
                        </span>
                      }
                    >
                      {profesoresActivos.length === 0 ? (
                        <Alert 
                          variant={isLight ? 'light' : 'dark'}
                          className="text-center py-4 mt-3"
                        >
                          <CheckCircle size={32} className="mb-2 text-success" />
                          <p className="mb-0">No hay profesores activos</p>
                        </Alert>
                      ) : (
                        <ListGroup variant="flush" className="mt-3">
                          {profesoresActivos.map(profesor => (
                            <ListGroup.Item
                              key={profesor.inscripcion_id}
                              className="d-flex justify-content-between align-items-center px-0 py-3"
                              style={{
                                backgroundColor: 'transparent',
                                borderColor: borderColor,
                                color: textColor
                              }}
                            >
                              <div className="flex-grow-1">
                                <div className="fw-bold">{profesor.nombre_completo}</div>
                                <small style={{ color: isLight ? '#6C757D' : '#ADB5BD' }}>
                                  {profesor.email}
                                </small>
                                <div className="small mt-1">
                                  <Badge bg="info" className="me-1">
                                    Profesor
                                  </Badge>
                                  <Badge bg="success" className="me-1">
                                    Activo
                                  </Badge>
                                  <small className="text-muted d-block mt-1">
                                    <em>Asignado: {formatearFecha(profesor.fecha_inscripcion)}</em>
                                  </small>
                                </div>
                              </div>
                              
                              {/* Botón para dar de baja */}
                              <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={() => darBajaUsuario(profesor.inscripcion_id, profesor.nombre_completo, 'profesor')}
                                title="Dar de baja profesor"
                                disabled={cargando}
                              >
                                {cargando ? (
                                  <Spinner animation="border" size="sm" />
                                ) : (
                                  <PersonDash size={16} />
                                )}
                              </Button>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      )}
                    </Tab>
                    
                    {/* Pestaña Profesores Inactivos */}
                    <Tab 
                      eventKey="inactivos" 
                      title={
                        <span>
                          <Archive size={14} className="me-1" />
                          Inactivos ({profesoresInactivos.length})
                        </span>
                      }
                    >
                      {profesoresInactivos.length === 0 ? (
                        <Alert 
                          variant={isLight ? 'light' : 'dark'}
                          className="text-center py-4 mt-3"
                        >
                          <Archive size={32} className="mb-2 text-warning" />
                          <p className="mb-0">No hay profesores inactivos</p>
                        </Alert>
                      ) : (
                        <ListGroup variant="flush" className="mt-3">
                          {profesoresInactivos.map(profesor => (
                            <ListGroup.Item
                              key={profesor.inscripcion_id}
                              className="d-flex justify-content-between align-items-center px-0 py-3"
                              style={{
                                backgroundColor: 'transparent',
                                borderColor: borderColor,
                                color: textColor
                              }}
                            >
                              <div className="flex-grow-1">
                                <div className="fw-bold">{profesor.nombre_completo}</div>
                                <small style={{ color: isLight ? '#6C757D' : '#ADB5BD' }}>
                                  {profesor.email}
                                </small>
                                <div className="small mt-1">
                                  <Badge bg="info" className="me-1">
                                    Profesor
                                  </Badge>
                                  <Badge bg={getBadgeColor(profesor.estado_inscripcion)} className="me-1">
                                    {getEstadoTexto(profesor.estado_inscripcion)}
                                  </Badge>
                                  <small className="text-muted d-block mt-1">
                                    <em>Baja: {formatearFecha(profesor.fecha_baja)}</em>
                                    {profesor.motivo_baja && (
                                      <div className="text-truncate" style={{ maxWidth: '200px' }} title={profesor.motivo_baja}>
                                        <small><em>Motivo: {profesor.motivo_baja}</em></small>
                                      </div>
                                    )}
                                  </small>
                                </div>
                              </div>
                              
                              {/* ✅ BOTÓN PARA REACTIVAR PROFESOR - CORREGIDO */}
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => reactivarUsuario(
                                  profesor.inscripcion_id, 
                                  profesor.nombre_completo, 
                                  'profesor'
                                )}
                                title="Reactivar profesor"
                                disabled={cargando}
                              >
                                {cargando ? (
                                  <Spinner animation="border" size="sm" />
                                ) : (
                                  <ArrowClockwise size={16} />
                                )}
                              </Button>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      )}
                    </Tab>
                  </Tabs>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Información de la Comisión */}
          <Card 
            className="border-0 shadow-sm mt-4"
            style={{ backgroundColor: bgColor }}
          >
            <Card.Body className="p-4">
              <h6 
                className="mb-3"
                style={{ color: textColor }}
              >
                <Search className="me-2" />
                Información de la Comisión
              </h6>
              <Row>
                <Col md={6}>
                  <div className="mb-2">
                    <small style={{ color: isLight ? '#6C757D' : '#ADB5BD' }}>Comisión:</small>
                    <div style={{ color: textColor }}>{comision.nombre}</div>
                  </div>
                  <div className="mb-2">
                    <small style={{ color: isLight ? '#6C757D' : '#ADB5BD' }}>Carrera:</small>
                    <div style={{ color: textColor }}>
                      {comision.carrera_info?.nombre || 'No especificada'}
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-2">
                    <small style={{ color: isLight ? '#6C757D' : '#ADB5BD' }}>Modalidad:</small>
                    <div style={{ color: textColor }}>{comision.modalidad}</div>
                  </div>
                  <div>
                    <small style={{ color: isLight ? '#6C757D' : '#ADB5BD' }}>Estado:</small>
                    <Badge 
                      bg={comision.estado === 'En curso' ? 'success' : 'secondary'}
                      className="ms-2"
                    >
                      {comision.estado}
                    </Badge>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PanelInscripcion;