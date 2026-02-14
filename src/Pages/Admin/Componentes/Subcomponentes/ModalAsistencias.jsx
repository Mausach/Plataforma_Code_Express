import React, { useState, useEffect } from 'react';
import { 
  Modal, Button, Form, Table, Badge, Spinner, Alert,
  Row, Col, InputGroup, Card
} from 'react-bootstrap';
import Swal from 'sweetalert2';
import { 
  CheckCircle, XCircle, Clock, PersonCheck,
  Save, Search, Filter
} from 'react-bootstrap-icons';

export const ModalTomaAsistencia = ({
  show,
  handleClose,
  comision,
  clase, // La clase específica para tomar asistencia
  setRefreshData,
  navigate,
  theme
}) => {
  // Estados
  const [asistencia, setAsistencia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos'); // 'todos', 'alumno', 'profesor'
  const [filterEstado, setFilterEstado] = useState('todos'); // 'todos', 'presente', 'ausente'
  const [justificaciones, setJustificaciones] = useState({}); // { usuarioId: "justificación" }

  // Clases CSS según tema
  const cardClass = theme === 'lights' ? 'card-light' : 'card-dark';
  const textClass = theme === 'lights' ? 'text-dark' : 'text-light';
  const borderColor = theme === 'lights' ? '#353432' : '#ebe5e5';
  const titleColor = '#EF7F1A';
  const successColor = '#28a745';
  const dangerColor = '#dc3545';

  // Cargar datos iniciales
  useEffect(() => {
    if (!show || !comision || !clase) return;

    const cargarDatos = () => {
      setLoading(true);
      
      // Combinar alumnos y profesores para la asistencia
      const todosUsuarios = [
        ...(comision.alumnos || []).map(alumno => ({
          ...alumno,
          tipo: 'Alumno',
          usuario_id: alumno.usuario_id?._id || alumno.usuario_id
        })),
        ...(comision.profesores || []).map(profesor => ({
          ...profesor,
          tipo: 'Profesor',
          usuario_id: profesor.usuario_id?._id || profesor.usuario_id
        })),
        // Agregar coordinador si existe
        ...(comision.coordinador ? [{
          ...comision.coordinador,
          tipo: 'Coordinador',
          usuario_id: comision.coordinador.usuario_id?._id || comision.coordinador.usuario_id
        }] : [])
      ];

      // Inicializar asistencia (ver si ya hay registro previo)
      const asistenciaInicial = todosUsuarios.map(usuario => {
        // Buscar si ya hay registro de asistencia para esta clase
        const registroExistente = clase.asistencia?.find(
          a => a.usuario_id?._id === usuario.usuario_id || a.usuario_id === usuario.usuario_id
        );

        return {
          usuario_id: usuario.usuario_id,
          nombres: usuario.nombres,
          apellido: usuario.apellido,
          tipo: usuario.tipo,
          presente: registroExistente?.presente || false,
          justificacion: registroExistente?.justificacion || '',
          hora_registro: registroExistente?.hora_registro || null
        };
      });

      setAsistencia(asistenciaInicial);
      
      // Inicializar justificaciones
      const justificacionesInicial = {};
      asistenciaInicial.forEach(item => {
        if (item.justificacion) {
          justificacionesInicial[item.usuario_id] = item.justificacion;
        }
      });
      setJustificaciones(justificacionesInicial);
      
      setLoading(false);
    };

    cargarDatos();
  }, [show, comision, clase]);

  // Manejar cambio de asistencia
  const handleToggleAsistencia = (usuarioId) => {
    setAsistencia(prev => prev.map(item => 
      item.usuario_id === usuarioId 
        ? { ...item, presente: !item.presente }
        : item
    ));
  };

  // Manejar cambio de justificación
  const handleJustificacionChange = (usuarioId, justificacion) => {
    setJustificaciones(prev => ({
      ...prev,
      [usuarioId]: justificacion
    }));
  };

  // Marcar todos como presentes
  const handleMarcarTodosPresentes = () => {
    setAsistencia(prev => prev.map(item => ({
      ...item,
      presente: true
    })));
  };

  // Marcar todos como ausentes
  const handleMarcarTodosAusentes = () => {
    setAsistencia(prev => prev.map(item => ({
      ...item,
      presente: false
    })));
  };

  // Filtrar asistencia
  const filteredAsistencia = asistencia.filter(item => {
    // Filtro por búsqueda
    if (searchTerm && !`${item.nombres} ${item.apellido}`.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filtro por tipo
    if (filterTipo !== 'todos' && item.tipo !== filterTipo) {
      return false;
    }
    
    // Filtro por estado
    if (filterEstado !== 'todos') {
      if (filterEstado === 'presente' && !item.presente) return false;
      if (filterEstado === 'ausente' && item.presente) return false;
    }
    
    return true;
  });

  // Calcular estadísticas
  const estadisticas = {
    total: asistencia.length,
    presentes: asistencia.filter(item => item.presente).length,
    ausentes: asistencia.filter(item => !item.presente).length,
    alumnos: asistencia.filter(item => item.tipo === 'Alumno').length,
    profesores: asistencia.filter(item => item.tipo === 'Profesor').length,
    coordinadores: asistencia.filter(item => item.tipo === 'Coordinador').length
  };

  // Guardar asistencia
  const handleGuardarAsistencia = async () => {
    setSaving(true);

    try {
      // Preparar datos para enviar
      const datosAsistencia = asistencia.map(item => ({
        usuario_id: item.usuario_id,
        nombres: item.nombres,
        apellido: item.apellido,
        tipo: item.tipo,
        presente: item.presente,
        justificacion: justificaciones[item.usuario_id] || '',
        hora_registro: new Date().toISOString()
      }));

      // Aquí llamarías a tu API para guardar la asistencia
      // await guardarAsistencia(clase._id, datosAsistencia);
      
      // Simulación de éxito
      Swal.fire({
        icon: 'success',
        title: '¡Asistencia guardada!',
        text: `Se guardó la asistencia para ${estadisticas.presentes} presentes de ${estadisticas.total} personas.`,
        background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
        color: theme === 'lights' ? '#353432' : '#ebe5e5',
        confirmButtonColor: titleColor
      });

      setRefreshData(true);
      handleClose();
      
    } catch (error) {
      console.error('Error al guardar asistencia:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar la asistencia. Por favor, intente nuevamente.',
        background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
        color: theme === 'lights' ? '#353432' : '#ebe5e5'
      });
    } finally {
      setSaving(false);
    }
  };

  if (!clase) return null;

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="xl"
      fullscreen="lg-down"
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
        <Modal.Title style={{ color: titleColor }}>
          <PersonCheck className="me-2" />
          Toma de Asistencia
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className={`${cardClass} ${textClass}`}>
        {/* Información de la clase */}
        <Card className={`mb-4 ${cardClass}`} style={{ borderColor: borderColor }}>
          <Card.Body>
            <Row>
              <Col md={6}>
                <h5 style={{ color: titleColor }}>{clase.tema || 'Clase sin tema'}</h5>
                <p className="mb-1">
                  <strong>Fecha:</strong> {new Date(clase.fecha).toLocaleDateString()}
                </p>
                <p className="mb-1">
                  <strong>Horario:</strong> {clase.horario_inicio} - {clase.horario_fin}
                </p>
                <p className="mb-0">
                  <strong>Comisión:</strong> {comision.nombre}
                </p>
              </Col>
              <Col md={6}>
                <div className="d-flex justify-content-end h-100 align-items-center">
                  <div className="text-center mx-3">
                    <div className="fs-3 fw-bold" style={{ color: successColor }}>
                      {estadisticas.presentes}
                    </div>
                    <small>Presentes</small>
                  </div>
                  <div className="text-center mx-3">
                    <div className="fs-3 fw-bold" style={{ color: dangerColor }}>
                      {estadisticas.ausentes}
                    </div>
                    <small>Ausentes</small>
                  </div>
                  <div className="text-center mx-3">
                    <div className="fs-3 fw-bold">{estadisticas.total}</div>
                    <small>Total</small>
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Filtros y búsqueda */}
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <InputGroup>
                <InputGroup.Text>
                  <Search />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Buscar por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={theme === 'lights' ? 'bg-white text-dark' : 'bg-dark text-light'}
                  style={{ borderColor: borderColor }}
                />
              </InputGroup>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className={theme === 'lights' ? 'bg-white text-dark' : 'bg-dark text-light'}
                style={{ borderColor: borderColor }}
              >
                <option value="todos">Todos los tipos</option>
                <option value="Alumno">Solo alumnos</option>
                <option value="Profesor">Solo profesores</option>
                <option value="Coordinador">Solo coordinadores</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className={theme === 'lights' ? 'bg-white text-dark' : 'bg-dark text-light'}
                style={{ borderColor: borderColor }}
              >
                <option value="todos">Todos los estados</option>
                <option value="presente">Solo presentes</option>
                <option value="ausente">Solo ausentes</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={2}>
            <div className="d-flex gap-2">
              <Button
                variant="outline-success"
                size="sm"
                onClick={handleMarcarTodosPresentes}
                style={{ borderColor: borderColor }}
              >
                <CheckCircle className="me-1" /> Todos
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={handleMarcarTodosAusentes}
                style={{ borderColor: borderColor }}
              >
                <XCircle className="me-1" /> Ninguno
              </Button>
            </div>
          </Col>
        </Row>

        {/* Tabla de asistencia */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant={theme === 'lights' ? 'primary' : 'light'} />
            <p className="mt-3">Cargando lista de asistencia...</p>
          </div>
        ) : (
          <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <Table hover className={`${theme === 'lights' ? 'table-light' : 'table-dark'}`}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: theme === 'lights' ? '#FAF3E1' : '#1F2535' }}>
                <tr>
                  <th style={{ width: '10%' }}>#</th>
                  <th style={{ width: '25%' }}>Persona</th>
                  <th style={{ width: '15%' }}>Tipo</th>
                  <th style={{ width: '15%' }}>Estado</th>
                  <th style={{ width: '25%' }}>Justificación</th>
                  <th style={{ width: '10%' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredAsistencia.map((item, index) => (
                  <tr key={item.usuario_id}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="me-3">
                          <div className="rounded-circle d-flex align-items-center justify-content-center" 
                            style={{
                              width: '36px',
                              height: '36px',
                              backgroundColor: item.tipo === 'Alumno' ? '#e9ecef' : 
                                            item.tipo === 'Profesor' ? '#e7f1ff' : '#f8d7da',
                              color: 'inherit',
                              fontSize: '14px',
                              fontWeight: 'bold'
                            }}>
                            {item.nombres?.charAt(0) || 'U'}
                          </div>
                        </div>
                        <div>
                          <div className="fw-bold">{item.nombres} {item.apellido}</div>
                          <small className="text-muted">
                            {item.tipo === 'Alumno' ? '🎓 Alumno' : 
                             item.tipo === 'Profesor' ? '👨‍🏫 Profesor' : '👑 Coordinador'}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge bg={
                        item.tipo === 'Alumno' ? 'info' :
                        item.tipo === 'Profesor' ? 'primary' : 'warning'
                      }>
                        {item.tipo}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={item.presente ? 'success' : 'secondary'}>
                        {item.presente ? 'PRESENTE' : 'AUSENTE'}
                      </Badge>
                      {item.hora_registro && (
                        <div className="small text-muted">
                          <Clock size={10} className="me-1" />
                          {new Date(item.hora_registro).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </td>
                    <td>
                      <Form.Control
                        type="text"
                        placeholder="Justificación (opcional)"
                        value={justificaciones[item.usuario_id] || ''}
                        onChange={(e) => handleJustificacionChange(item.usuario_id, e.target.value)}
                        size="sm"
                        className={theme === 'lights' ? 'bg-white text-dark' : 'bg-dark text-light'}
                        style={{ borderColor: borderColor }}
                        disabled={item.presente}
                      />
                    </td>
                    <td>
                      <Button
                        variant={item.presente ? "success" : "secondary"}
                        size="sm"
                        onClick={() => handleToggleAsistencia(item.usuario_id)}
                        style={{
                          width: '100%',
                          backgroundColor: item.presente ? successColor : 'transparent',
                          borderColor: item.presente ? successColor : borderColor,
                          color: item.presente ? 'white' : 'inherit'
                        }}
                      >
                        {item.presente ? <CheckCircle /> : <XCircle />}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            
            {filteredAsistencia.length === 0 && (
              <div className="text-center py-5">
                <p>No se encontraron personas con los filtros aplicados.</p>
              </div>
            )}
          </div>
        )}

        {/* Resumen */}
        <Card className={`mt-3 ${cardClass}`} style={{ borderColor: borderColor }}>
          <Card.Body>
            <Row>
              <Col md={4}>
                <div className="text-center">
                  <div className="fs-5 fw-bold">{estadisticas.alumnos}</div>
                  <small>Alumnos</small>
                </div>
              </Col>
              <Col md={4}>
                <div className="text-center">
                  <div className="fs-5 fw-bold">{estadisticas.profesores}</div>
                  <small>Profesores</small>
                </div>
              </Col>
              <Col md={4}>
                <div className="text-center">
                  <div className="fs-5 fw-bold">{estadisticas.coordinadores}</div>
                  <small>Coordinadores</small>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Modal.Body>

      <Modal.Footer className={`${cardClass} ${textClass}`}>
        <div className="d-flex justify-content-between w-100 align-items-center">
          <div>
            <small className="text-muted">
              Clase del {new Date(clase.fecha).toLocaleDateString()} • {clase.horario_inicio} - {clase.horario_fin}
            </small>
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="secondary"
              onClick={handleClose}
              style={{
                backgroundColor: theme === 'lights' ? '#353432' : '#1F2535',
                borderColor: theme === 'lights' ? '#353432' : '#1F2535'
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleGuardarAsistencia}
              disabled={saving || loading}
              style={{
                backgroundColor: titleColor,
                borderColor: titleColor
              }}
            >
              {saving ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="me-2" />
                  Guardar Asistencia ({estadisticas.presentes}/{estadisticas.total})
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalTomaAsistencia;