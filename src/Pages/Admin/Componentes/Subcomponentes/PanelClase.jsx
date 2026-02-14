
import { obtenerClasesComision } from '../../Helper/CargarClsesPorComision';
import ModalEditarClase from './micro_componente/ModalUpdateClase';
import Paginador from './micro_componente/Paginador';
import { CargarInscripciones } from '../../Helper/CargarUsuariosInscriptos';


// Components/Subcomponentes/PanelClasesOptimizado.jsx
import React, { useState, useEffect } from 'react';
import { 
  Card, Button, Badge, 
  ListGroup, Form, Alert,
  Row, Col, Spinner, Tabs, Tab,
  Modal, Table, InputGroup, FormControl
} from 'react-bootstrap';
import { 
  Calendar, Clock, Person, People, 
  CheckCircle, XCircle, 
  Search, Pencil, 
  CalendarX, CalendarEvent,
  ClipboardCheck, ClipboardData,
  CheckSquare, XSquare,
  ArrowClockwise, InfoCircle, Download
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { obtenerAsistenciasPorClase } from '../../Helper/TomarAsistencias';

const PanelClases = ({ comision, theme }) => {
  const navigate = useNavigate();
  const isLight = theme === 'lights';
  
  // ===== COLORS BASED ON THEME =====
  const themeColors = {
    text: isLight ? '#212529' : '#E9ECEF',
    bg: isLight ? '#FFFFFF' : '#1A1F2E',
    cardBg: isLight ? '#F8F9FA' : '#252A3A',
    border: isLight ? '#DEE2E6' : '#3A4255',
    inputBg: isLight ? '#FFFFFF' : '#2D3447',
    inputBorder: isLight ? '#CED4DA' : '#4A5368',
    success: isLight ? '#28a745' : '#20c997',
    warning: isLight ? '#ffc107' : '#fd7e14',
    danger: isLight ? '#dc3545' : '#e83e8c',
    info: isLight ? '#17a2b8' : '#6f42c1',
    primary: isLight ? '#007bff' : '#0d6efd',
  };
  
  // ===== MAIN STATES =====
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  
  // ===== DATA STATES =====
  const [clases, setClases] = useState([]);
  const [claseSeleccionada, setClaseSeleccionada] = useState(null);
  
  // ===== INSCRIPCIONES STATE (para asistencia) =====
  const [inscripciones, setInscripciones] = useState({
    alumnos: [],
    profesores: [],
    total: 0,
    isLoading: false,
    error: null
  });
  
  // ===== UI STATES =====
  const [activeTab, setActiveTab] = useState('clases');
  const [modalAbierto, setModalAbierto] = useState(null);
  
  // ===== MODAL EDITAR STATES =====
  const [modalEditarVisible, setModalEditarVisible] = useState(false);
  const [claseIdEditar, setClaseIdEditar] = useState(null);
  
  // ===== ASISTENCIA STATES =====
  const [claseParaAsistencia, setClaseParaAsistencia] = useState(null);
  const [asistenciasTemp, setAsistenciasTemp] = useState([]);
  const [cargandoAlumnos, setCargandoAlumnos] = useState(false);
  const [guardandoAsistencia, setGuardandoAsistencia] = useState(false);
  
  // ===== HISTORIAL STATES =====
  const [asistenciasClase, setAsistenciasClase] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [errorHistorial, setErrorHistorial] = useState(null);
  const [estadisticasHistorial, setEstadisticasHistorial] = useState({
    total_alumnos: 0,
    total_presentes: 0,
    total_ausentes: 0,
    porcentaje_asistencia: 0
  });
  
  // ===== FILTER STATES =====
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  
  // ===== PAGINATION STATES =====
  const [paginaActual, setPaginaActual] = useState(1);
  const clasesPorPagina = 5;

  // ===== USE EFFECTS =====
  useEffect(() => {
    cargarDatosIniciales();
  }, [refreshTrigger, comision._id]);

  useEffect(() => {
    setPaginaActual(1);
  }, [filtroEstado, busqueda]);

  // ===== CARGAR DATOS REALES DESDE EL BACKEND =====
  const cargarDatosIniciales = async () => {
    setLoading(true);
    try {
      console.log('📥 Cargando clases para comisión:', comision._id);
      
      const resultado = await obtenerClasesComision(comision._id);
      
      if (resultado.success) {
        console.log(`✅ Se cargaron ${resultado.count} clases`);
        setClases(resultado.data);
        setError(null);
      } else {
        throw new Error(resultado.error || 'Error al cargar las clases');
      }
    } catch (err) {
      console.error('❌ Error cargando clases:', err);
      setError(err.message || 'Error al cargar las clases');
    } finally {
      setLoading(false);
    }
  };

  // ===== FILTER FUNCTIONS =====
  const getClasesFiltradas = () => {
    let filtradas = [...clases];
    
    if (filtroEstado !== 'todas') {
      filtradas = filtradas.filter(clase => clase.estado === filtroEstado);
    }
    
    if (busqueda.trim()) {
      const term = busqueda.toLowerCase();
      filtradas = filtradas.filter(clase => 
        clase.tema?.toLowerCase().includes(term) ||
        clase.descripcion?.toLowerCase().includes(term) ||
        clase.profesor_nombre_cache?.toLowerCase().includes(term)
      );
    }
    
    return filtradas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  };

  // ===== PAGINATION FUNCTIONS =====
  const handleCambiarPagina = (nuevaPagina) => {
    setPaginaActual(nuevaPagina);
    const listaClases = document.getElementById('lista-clases');
    if (listaClases) {
      listaClases.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getClasesPaginadas = () => {
    const indexUltimaClase = paginaActual * clasesPorPagina;
    const indexPrimeraClase = indexUltimaClase - clasesPorPagina;
    return clasesFiltradas.slice(indexPrimeraClase, indexUltimaClase);
  };

  // ===== HANDLERS =====
  const handleClicEditarClase = (clase) => {
    console.log('📝 Editando clase:', clase._id);
    setClaseIdEditar(clase._id);
    setModalEditarVisible(true);
  };

  const handleClaseActualizada = (claseActualizada) => {
    console.log('✅ Clase actualizada, refrescando lista...');
    setRefreshTrigger(prev => !prev);
  };
  
  // ===== HANDLER PARA TOMAR ASISTENCIA =====
  const handleClicTomarAsistencia = async (clase) => {
    try {
      setCargandoAlumnos(true);
      setClaseParaAsistencia(clase);
      setActiveTab('asistencia');
      
      console.log('📋 Preparando asistencia para clase:', {
        claseId: clase._id,
        comisionId: clase.comision_id || comision._id,
        tema: clase.tema,
        fecha: clase.fecha
      });

      const setInscripcionesLocal = (data) => {
        console.log('📦 Datos recibidos de inscripciones:', {
          alumnos: data.alumnos?.length || 0
        });
        
        setInscripciones(data);
        
        const alumnosActivos = data.alumnos.filter(
          alumno => alumno.estado_inscripcion === 'activo'
        );
        
        console.log(`👥 Alumnos activos para asistencia: ${alumnosActivos.length}`);
        
        const asistenciasIniciales = alumnosActivos.map((alumno, index) => ({
          usuario_id: alumno.usuario_id,
          inscripcion_id: alumno.inscripcion_id,
          nombre_completo: alumno.nombre_completo,
          dni: alumno.dni,
          email: alumno.email,
          presente: false,
          index: index + 1
        }));
        
        setAsistenciasTemp(asistenciasIniciales);
      };

      await CargarInscripciones(
        clase.comision_id || comision._id,
        setInscripcionesLocal,
        navigate,
        {}
      );
      
    } catch (error) {
      console.error('❌ Error cargando alumnos:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cargar la lista de alumnos',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        background: isLight ? '#FAF3E1' : '#0A0E17',
        color: isLight ? '#353432' : '#ebe5e5',
      });
    } finally {
      setCargandoAlumnos(false);
    }
  };
  
  // ===== HANDLER PARA VER HISTORIAL (ACTUALIZADO) =====
  const handleClicVerAsistencias = async (clase) => {
    try {
      setCargandoHistorial(true);
      setErrorHistorial(null);
      setClaseParaAsistencia(clase);
      setActiveTab('historial');
      
      console.log('📋 Cargando historial de asistencia para clase:', clase._id);
      
      const resultado = await obtenerAsistenciasPorClase(clase._id, theme);
      
      if (resultado.success) {
        console.log('✅ Historial cargado:', {
          total: resultado.data.alumnos.length,
          presentes: resultado.data.estadisticas.total_presentes
        });
        
        setAsistenciasClase(resultado.data.alumnos);
        setEstadisticasHistorial(resultado.data.estadisticas);
        setErrorHistorial(null);
      } else {
        throw new Error(resultado.error || 'Error al cargar historial');
      }
      
    } catch (error) {
      console.error('❌ Error cargando historial:', error);
      setErrorHistorial(error.message);
      
      Swal.fire({
        title: 'Error',
        text: error.message || 'No se pudo cargar el historial de asistencia',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        background: isLight ? '#FAF3E1' : '#0A0E17',
        color: isLight ? '#353432' : '#ebe5e5',
      });
    } finally {
      setCargandoHistorial(false);
    }
  };

  const toggleAsistencia = (usuarioId) => {
    setAsistenciasTemp(prev => prev.map(item =>
      item.usuario_id === usuarioId
        ? { ...item, presente: !item.presente }
        : item
    ));
  };

  // ===== HANDLER PARA GUARDAR ASISTENCIA =====
  const handleGuardarAsistencias = async () => {
    setGuardandoAsistencia(true);
    try {
      console.log('💾 Guardando asistencias en batch...');
      
      const resultado = await guardarAsistenciaBatch(
        claseParaAsistencia._id,
        asistenciasTemp.map(a => ({
          usuario_id: a.usuario_id,
          presente: a.presente
        })),
        setRefreshTrigger,
        navigate,
        theme
      );
      
      if (resultado.success) {
        setActiveTab('clases');
      }
      
    } catch (error) {
      console.error('❌ Error guardando asistencia:', error);
    } finally {
      setGuardandoAsistencia(false);
    }
  };

  // ===== HELPER FUNCTIONS =====
  const getBadgeColor = (estado) => {
    switch(estado) {
      case 'Realizada': return 'success';
      case 'Programada': return 'primary';
      case 'En curso': return 'warning';
      case 'Cancelada': return 'danger';
      case 'Reprogramada': return 'info';
      default: return 'secondary';
    }
  };

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'Fecha no disponible';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatearHora = (horaStr) => {
    return horaStr || '--:--';
  };

  // ===== RENDER TABLA ASISTENCIA =====
  const renderTablaAsistencia = () => {
    if (cargandoAlumnos) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" variant={isLight ? 'primary' : 'light'} />
          <p className="mt-3" style={{ color: themeColors.text }}>
            Cargando lista de alumnos...
          </p>
        </div>
      );
    }

    if (asistenciasTemp.length === 0) {
      return (
        <div className="text-center py-5" style={{ color: themeColors.text }}>
          <People size={48} className="mb-3 text-muted" />
          <h5>No hay alumnos activos</h5>
          <p className="text-muted">
            Esta comisión no tiene alumnos inscriptos activos
          </p>
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={() => setActiveTab('clases')}
          >
            Volver a clases
          </Button>
        </div>
      );
    }

    const totalPresentes = asistenciasTemp.filter(a => a.presente).length;

    return (
      <>
        <Card className="mb-4 border-0" style={{ backgroundColor: themeColors.cardBg }}>
          <Card.Body>
            <Row className="align-items-center">
              <Col md={8}>
                <h6 style={{ color: themeColors.text, marginBottom: '0.25rem' }}>
                  {claseParaAsistencia?.tema || 'Sin tema'}
                </h6>
                <small style={{ color: themeColors.text }}>
                  <Calendar size={12} className="me-1" />
                  {formatearFecha(claseParaAsistencia?.fecha)} • 
                  <Clock size={12} className="ms-2 me-1" />
                  {formatearHora(claseParaAsistencia?.horario_inicio)} - {formatearHora(claseParaAsistencia?.horario_fin)}
                </small>
              </Col>
              <Col md={4} className="text-end">
                <Badge bg="info" className="me-2">
                  {asistenciasTemp.length} alumnos activos
                </Badge>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={() => setActiveTab('clases')}
                >
                  Volver
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="border-0 shadow-sm" style={{ backgroundColor: themeColors.bg }}>
          <Card.Body className="p-0">
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <Table hover responsive style={{ color: themeColors.text, marginBottom: 0 }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                  <tr>
                    <th style={{ borderColor: themeColors.border, backgroundColor: themeColors.cardBg }}>#</th>
                    <th style={{ borderColor: themeColors.border, backgroundColor: themeColors.cardBg }}>Alumno</th>
                    <th style={{ borderColor: themeColors.border, backgroundColor: themeColors.cardBg }}>DNI</th>
                    <th style={{ borderColor: themeColors.border, backgroundColor: themeColors.cardBg }}>Email</th>
                    <th style={{ borderColor: themeColors.border, backgroundColor: themeColors.cardBg }} className="text-center">Estado</th>
                    <th style={{ borderColor: themeColors.border, backgroundColor: themeColors.cardBg }} className="text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {asistenciasTemp.map((alumno) => (
                    <tr key={alumno.usuario_id}>
                      <td style={{ borderColor: themeColors.border }}>{alumno.index}</td>
                      <td style={{ borderColor: themeColors.border }}>
                        <div className="d-flex align-items-center">
                          <Person size={16} className="me-2" />
                          <span className="fw-bold">{alumno.nombre_completo}</span>
                        </div>
                      </td>
                      <td style={{ borderColor: themeColors.border }}>{alumno.dni}</td>
                      <td style={{ borderColor: themeColors.border }}>
                        <small>{alumno.email}</small>
                      </td>
                      <td style={{ borderColor: themeColors.border }} className="text-center">
                        {alumno.presente ? (
                          <Badge bg="success">Presente</Badge>
                        ) : (
                          <Badge bg="danger">Ausente</Badge>
                        )}
                      </td>
                      <td style={{ borderColor: themeColors.border }} className="text-center">
                        <Button
                          variant={alumno.presente ? "outline-danger" : "outline-success"}
                          size="sm"
                          onClick={() => toggleAsistencia(alumno.usuario_id)}
                        >
                          {alumno.presente ? (
                            <>
                              <XSquare className="me-1" size={12} />
                              Ausente
                            </>
                          ) : (
                            <>
                              <CheckSquare className="me-1" size={12} />
                              Presente
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

        <Row className="mt-4">
          <Col md={6}>
            <Card className="border-0" style={{ backgroundColor: themeColors.cardBg }}>
              <Card.Body>
                <Row>
                  <Col xs={4} className="text-center">
                    <div className="fs-3 text-success">{totalPresentes}</div>
                    <small style={{ color: themeColors.text }}>Presentes</small>
                  </Col>
                  <Col xs={4} className="text-center">
                    <div className="fs-3 text-danger">{asistenciasTemp.length - totalPresentes}</div>
                    <small style={{ color: themeColors.text }}>Ausentes</small>
                  </Col>
                  <Col xs={4} className="text-center">
                    <div className="fs-3" style={{ color: themeColors.text }}>{asistenciasTemp.length}</div>
                    <small style={{ color: themeColors.text }}>Total</small>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="d-flex align-items-center justify-content-end">
            <Button 
              variant="secondary" 
              className="me-2"
              onClick={() => setActiveTab('clases')}
              disabled={guardandoAsistencia}
            >
              Cancelar
            </Button>
            <Button 
              variant="primary"
              onClick={handleGuardarAsistencias}
              disabled={guardandoAsistencia || asistenciasTemp.length === 0}
            >
              {guardandoAsistencia ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle className="me-1" />
                  Guardar Asistencia ({totalPresentes}/{asistenciasTemp.length})
                </>
              )}
            </Button>
          </Col>
        </Row>
      </>
    );
  };

  // ===== RENDER TABLA HISTORIAL =====
  const renderTablaHistorial = () => {
    if (cargandoHistorial) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" variant={isLight ? 'primary' : 'light'} />
          <p className="mt-3" style={{ color: themeColors.text }}>
            Cargando historial de asistencia...
          </p>
        </div>
      );
    }

    if (errorHistorial) {
      return (
        <div className="text-center py-5" style={{ color: themeColors.text }}>
          <InfoCircle size={48} className="mb-3 text-muted" />
          <h5>Error al cargar el historial</h5>
          <p className="text-muted">{errorHistorial}</p>
          <Button 
            variant="outline-primary"
            onClick={() => handleClicVerAsistencias(claseParaAsistencia)}
          >
            Reintentar
          </Button>
        </div>
      );
    }

    if (asistenciasClase.length === 0) {
      return (
        <div className="text-center py-5" style={{ color: themeColors.text }}>
          <ClipboardData size={48} className="mb-3 text-muted" />
          <h5>No hay registros de asistencia</h5>
          <p className="text-muted">
            Esta clase aún no tiene asistencia registrada
          </p>
          <Button 
            variant="outline-success"
            onClick={() => handleClicTomarAsistencia(claseParaAsistencia)}
          >
            <ClipboardCheck className="me-1" />
            Tomar Asistencia
          </Button>
        </div>
      );
    }

    return (
      <>
        <Row className="mb-4">
          <Col md={3}>
            <Card className="border-0 text-center" style={{ backgroundColor: themeColors.cardBg }}>
              <Card.Body>
                <div className="fs-3 text-success">{estadisticasHistorial.total_presentes}</div>
                <small style={{ color: themeColors.text }}>Presentes</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 text-center" style={{ backgroundColor: themeColors.cardBg }}>
              <Card.Body>
                <div className="fs-3 text-danger">{estadisticasHistorial.total_ausentes}</div>
                <small style={{ color: themeColors.text }}>Ausentes</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 text-center" style={{ backgroundColor: themeColors.cardBg }}>
              <Card.Body>
                <div className="fs-3" style={{ color: themeColors.text }}>
                  {estadisticasHistorial.total_alumnos}
                </div>
                <small style={{ color: themeColors.text }}>Total</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 text-center" style={{ backgroundColor: themeColors.cardBg }}>
              <Card.Body>
                <div className="fs-3 text-info">{estadisticasHistorial.porcentaje_asistencia}%</div>
                <small style={{ color: themeColors.text }}>Asistencia</small>
                <div className="progress mt-2" style={{ height: '6px' }}>
                  <div 
                    className="progress-bar bg-info" 
                    role="progressbar" 
                    style={{ width: `${estadisticasHistorial.porcentaje_asistencia}%` }}
                  ></div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card className="border-0 shadow-sm" style={{ backgroundColor: themeColors.bg }}>
          <Card.Body className="p-0">
            <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
              <Table hover responsive style={{ color: themeColors.text }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                  <tr>
                    <th style={{ 
                      borderColor: themeColors.border, 
                      backgroundColor: themeColors.cardBg 
                    }}>#</th>
                    <th style={{ 
                      borderColor: themeColors.border, 
                      backgroundColor: themeColors.cardBg 
                    }}>Alumno</th>
                    <th style={{ 
                      borderColor: themeColors.border, 
                      backgroundColor: themeColors.cardBg 
                    }}>DNI</th>
                    <th style={{ 
                      borderColor: themeColors.border, 
                      backgroundColor: themeColors.cardBg 
                    }}>Email</th>
                    <th style={{ 
                      borderColor: themeColors.border, 
                      backgroundColor: themeColors.cardBg 
                    }} className="text-center">Estado</th>
                    <th style={{ 
                      borderColor: themeColors.border, 
                      backgroundColor: themeColors.cardBg 
                    }}>Hora registro</th>
                  </tr>
                </thead>
                <tbody>
                  {asistenciasClase.map((alumno, index) => (
                    <tr key={alumno.inscripcion_id || alumno.usuario_id}>
                      <td style={{ borderColor: themeColors.border }}>
                        {index + 1}
                      </td>
                      <td style={{ borderColor: themeColors.border }}>
                        <div className="d-flex align-items-center">
                          <Person size={16} className="me-2" />
                          <span className="fw-bold">{alumno.nombre_completo}</span>
                        </div>
                      </td>
                      <td style={{ borderColor: themeColors.border }}>{alumno.dni}</td>
                      <td style={{ borderColor: themeColors.border }}>
                        <small>{alumno.email}</small>
                      </td>
                      <td style={{ borderColor: themeColors.border }} className="text-center">
                        {alumno.presente ? (
                          <Badge bg="success">Presente</Badge>
                        ) : (
                          <Badge bg="danger">Ausente</Badge>
                        )}
                      </td>
                      <td style={{ borderColor: themeColors.border }}>
                        {alumno.fecha_registro 
                          ? new Date(alumno.fecha_registro).toLocaleTimeString('es-ES', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })
                          : '--:--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

        <Row className="mt-4">
          <Col md={8}>
            <div className="d-flex align-items-center gap-3" style={{ color: themeColors.text }}>
              <small>
                <CheckCircle className="me-1 text-success" size={14} />
                <strong>{estadisticasHistorial.total_presentes}</strong> presentes
              </small>
              <small>
                <XCircle className="me-1 text-danger" size={14} />
                <strong>{estadisticasHistorial.total_ausentes}</strong> ausentes
              </small>
              <small>
                <People className="me-1" size={14} />
                <strong>{estadisticasHistorial.total_alumnos}</strong> total
              </small>
            </div>
          </Col>
          <Col md={4} className="text-end">
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => exportarHistorial()}
              title="Exportar a Excel"
            >
              <Download className="me-1" />
              Exportar
            </Button>
          </Col>
        </Row>
      </>
    );
  };

  // ===== FUNCIÓN PARA EXPORTAR (OPCIONAL) =====
  const exportarHistorial = () => {
    Swal.fire({
      title: 'Próximamente',
      text: 'La exportación de historial estará disponible pronto',
      icon: 'info',
      confirmButtonText: 'Aceptar',
      background: isLight ? '#FAF3E1' : '#0A0E17',
      color: isLight ? '#353432' : '#ebe5e5',
    });
  };

  // ===== RENDER LOADING =====
  if (loading && activeTab === 'clases') {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" variant={isLight ? 'primary' : 'light'} />
        <span className="ms-2" style={{ color: themeColors.text }}>
          Cargando clases...
        </span>
      </div>
    );
  }

  // ===== RENDER ERROR =====
  if (error) {
    return (
      <Alert variant="danger" className="mt-3">
        <Alert.Heading>Error</Alert.Heading>
        <p>{error}</p>
        <Button 
          variant="outline-danger" 
          onClick={() => setRefreshTrigger(prev => !prev)}
          className="ms-2"
        >
          <ArrowClockwise className="me-1" />
          Reintentar
        </Button>
      </Alert>
    );
  }

  // ===== CALCULAR VARIABLES PARA PAGINACIÓN =====
  const clasesFiltradas = getClasesFiltradas();
  const clasesPaginadas = getClasesPaginadas();
  const totalPaginas = Math.ceil(clasesFiltradas.length / clasesPorPagina);
  const inicioResultados = ((paginaActual - 1) * clasesPorPagina) + 1;
  const finResultados = Math.min(paginaActual * clasesPorPagina, clasesFiltradas.length);

  return (
    <div>
      {/* Header de la comisión */}
      <Card className="mb-4 border-0 shadow-sm" style={{ backgroundColor: themeColors.cardBg }}>
        <Card.Body className="py-3">
          <Row className="align-items-center">
            <Col md={8}>
              <h5 style={{ color: themeColors.text, marginBottom: '0.25rem' }}>
                {comision.nombre}
              </h5>
              <small style={{ color: themeColors.text }}>
                {comision.modalidad || 'Sin modalidad'} • {comision.carrera_info?.nombre || 'Carrera no especificada'}
              </small>
            </Col>
            <Col md={4} className="text-end">
              <Badge bg={comision.estado === 'En curso' ? 'success' : 'secondary'}>
                {comision.estado || 'Sin estado'}
              </Badge>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Navegación por Tabs */}
      <Card className="mb-4 border-0 shadow-sm" style={{ backgroundColor: themeColors.bg }}>
        <Card.Body className="p-0">
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="px-3 pt-3"
            fill
          >
            {/* TAB 1: LISTA DE CLASES */}
            <Tab 
              eventKey="clases" 
              title={
                <span>
                  <Calendar className="me-2" size={16} />
                  Clases
                  <Badge bg="secondary" className="ms-2" pill>
                    {clases.length}
                  </Badge>
                </span>
              }
            >
              <div className="p-3">
                <Row className="mb-4">
                  <Col md={6}>
                    <Form.Group>
                      <InputGroup>
                        <InputGroup.Text style={{ 
                          backgroundColor: themeColors.inputBg,
                          borderColor: themeColors.inputBorder,
                          color: themeColors.text 
                        }}>
                          <Search size={14} />
                        </InputGroup.Text>
                        <FormControl
                          placeholder="Buscar clase por tema, profesor..."
                          value={busqueda}
                          onChange={(e) => setBusqueda(e.target.value)}
                          style={{
                            backgroundColor: themeColors.inputBg,
                            borderColor: themeColors.inputBorder,
                            color: themeColors.text
                          }}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Select
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                        style={{
                          backgroundColor: themeColors.inputBg,
                          borderColor: themeColors.inputBorder,
                          color: themeColors.text
                        }}
                      >
                        <option value="todas">Todas las clases</option>
                        <option value="Programada">Programadas</option>
                        <option value="Realizada">Realizadas</option>
                        <option value="Cancelada">Canceladas</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2} className="text-end">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => setRefreshTrigger(prev => !prev)}
                    >
                      <ArrowClockwise size={14} />
                    </Button>
                  </Col>
                </Row>

                <div id="lista-clases">
                  {clasesFiltradas.length === 0 ? (
                    <div className="text-center py-5" style={{ color: themeColors.text }}>
                      <CalendarEvent size={48} className="mb-3 text-muted" />
                      <h5>No hay clases para mostrar</h5>
                      <p className="text-muted">Intenta con otros filtros</p>
                    </div>
                  ) : (
                    <>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <small style={{ color: themeColors.text }}>
                          Mostrando {inicioResultados}-{finResultados} de {clasesFiltradas.length} clases
                          {busqueda && ` (filtradas)`}
                        </small>
                        <Badge 
                          bg="secondary"
                          style={{ 
                            backgroundColor: themeColors.cardBg,
                            color: themeColors.text,
                            border: `1px solid ${themeColors.border}`
                          }}
                        >
                          {paginaActual} / {totalPaginas}
                        </Badge>
                      </div>

                      <ListGroup variant="flush">
                        {clasesPaginadas.map(clase => (
                          <ListGroup.Item
                            key={clase._id}
                            className="px-0 py-3"
                            style={{
                              backgroundColor: 'transparent',
                              borderColor: themeColors.border,
                              color: themeColors.text
                            }}
                          >
                            <Row className="align-items-center">
                              <Col xs={2} md={2}>
                                <div className="d-flex flex-column align-items-center">
                                  <div className="fw-bold" style={{ fontSize: '1.1rem' }}>
                                    {clase.fecha ? new Date(clase.fecha).getDate() : '--'}
                                  </div>
                                  <small className="text-muted">
                                    {clase.fecha ? new Date(clase.fecha).toLocaleDateString('es-ES', { month: 'short' }) : '---'}
                                  </small>
                                </div>
                              </Col>
                              
                              <Col xs={10} md={5}>
                                <div className="d-flex flex-column">
                                  <div className="fw-bold">{clase.tema || 'Sin tema'}</div>
                                  <small className="text-muted">
                                    <Clock size={12} className="me-1" />
                                    {formatearHora(clase.horario_inicio)} - {formatearHora(clase.horario_fin)}
                                  </small>
                                  {clase.descripcion && (
                                    <small className="text-truncate mt-1" style={{ maxWidth: '300px' }}>
                                      {clase.descripcion}
                                    </small>
                                  )}
                                </div>
                              </Col>
                              
                              <Col xs={6} md={2}>
                                <div className="d-flex flex-column">
                                  <small className="text-muted">Profesor</small>
                                  <div className="d-flex align-items-center">
                                    <Person size={14} className="me-1" />
                                    <span>{clase.profesor_nombre_cache || 'No asignado'}</span>
                                  </div>
                                </div>
                              </Col>
                              
                              <Col xs={6} md={1}>
                                <div className="d-flex flex-column align-items-center">
                                  <small className="text-muted">Estado</small>
                                  <Badge bg={getBadgeColor(clase.estado)} className="mt-1">
                                    {clase.estado}
                                  </Badge>
                                </div>
                              </Col>
                              
                              <Col xs={12} md={2}>
                                <div className="d-flex justify-content-end gap-1">
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => handleClicEditarClase(clase)}
                                    title="Editar clase"
                                  >
                                    <Pencil size={14} />
                                  </Button>
                                  
                                  {(clase.estado === 'Programada' || clase.estado === 'Realizada') && (
                                    <Button
                                      variant="outline-success"
                                      size="sm"
                                      onClick={() => handleClicTomarAsistencia(clase)}
                                      title="Tomar asistencia"
                                    >
                                      <ClipboardCheck size={14} />
                                    </Button>
                                  )}
                                  
                                  {clase.estado === 'Realizada' && (
                                    <Button
                                      variant="outline-info"
                                      size="sm"
                                      onClick={() => handleClicVerAsistencias(clase)}
                                      title="Ver asistencia"
                                    >
                                      <ClipboardData size={14} />
                                    </Button>
                                  )}
                                </div>
                              </Col>
                            </Row>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>

                      {totalPaginas > 1 && (
                        <div className="mt-4">
                          <Paginador
                            paginaActual={paginaActual}
                            totalPaginas={totalPaginas}
                            onCambiarPagina={handleCambiarPagina}
                            theme={theme}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </Tab>
            
            {/* TAB 2: TOMAR ASISTENCIA */}
            <Tab 
              eventKey="asistencia" 
              title={
                <span>
                  <ClipboardCheck className="me-2" size={16} />
                  Tomar Asistencia
                  {claseParaAsistencia && (
                    <small className="ms-2 text-muted">
                      • {formatearFecha(claseParaAsistencia.fecha)}
                    </small>
                  )}
                </span>
              }
              disabled={!claseParaAsistencia}
            >
              <div className="p-3">
                {claseParaAsistencia ? (
                  renderTablaAsistencia()
                ) : (
                  <div className="text-center py-5" style={{ color: themeColors.text }}>
                    <InfoCircle size={48} className="mb-3 text-muted" />
                    <h5>Selecciona una clase primero</h5>
                    <p className="text-muted">
                      Ve a la pestaña "Clases" y haz clic en el botón verde ✅
                    </p>
                    <Button 
                      variant="outline-primary"
                      onClick={() => setActiveTab('clases')}
                    >
                      Ir a Clases
                    </Button>
                  </div>
                )}
              </div>
            </Tab>
            
            {/* TAB 3: VER HISTORIAL */}
            <Tab 
              eventKey="historial" 
              title={
                <span>
                  <ClipboardData className="me-2" size={16} />
                  Ver Historial
                  {claseParaAsistencia && (
                    <small className="ms-2 text-muted">
                      • {formatearFecha(claseParaAsistencia.fecha)}
                    </small>
                  )}
                </span>
              }
              disabled={!claseParaAsistencia}
            >
              <div className="p-3">
                {claseParaAsistencia ? (
                  renderTablaHistorial()
                ) : (
                  <div className="text-center py-5" style={{ color: themeColors.text }}>
                    <InfoCircle size={48} className="mb-3 text-muted" />
                    <h5>Selecciona una clase primero</h5>
                    <p className="text-muted">
                      Ve a la pestaña "Clases" y selecciona una realizada para ver el historial
                    </p>
                    <Button 
                      variant="outline-primary"
                      onClick={() => setActiveTab('clases')}
                    >
                      Ir a Clases
                    </Button>
                  </div>
                )}
              </div>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* MODAL EDITAR CLASE */}
      <ModalEditarClase
        show={modalEditarVisible}
        onHide={() => setModalEditarVisible(false)}
        claseId={claseIdEditar}
        onClaseActualizada={handleClaseActualizada}
        setRefreshData={setRefreshTrigger}
        theme={theme}
      />
    </div>
  );
};

export default PanelClases;