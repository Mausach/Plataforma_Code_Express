// Components/Subcomponentes/PanelTrabajos.jsx
// 🐋 VERSIÓN CON FORMULARIO FUERA DEL COMPONENTE PRINCIPAL
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Alert, 
  Badge, 
  Button, 
  Form, 
  InputGroup,
  Row,
  Col,
  Nav,
  ListGroup,
  Table,
  Collapse,
  Spinner,
  Modal
} from 'react-bootstrap';
import { 
  Briefcase, 
  Github, 
  FileZip, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  Download,
  Search,
  Calendar,
  Upload,
  Link,
  Person,
  StarFill,
  FileEarmarkArrowUp,
  InfoCircle,
  Check2Circle,
  PersonPlus,
  People,
  Trash,
  Filter,
  ExclamationTriangle,
  CloudUpload,
  Star
} from 'react-bootstrap-icons';

// HELPERS
import { CargarEntregasUsuario } from '../../../Estudiantes/Helpers/CargaEntregaDelUsuario';
import { CargarEntregasComision } from '../../Helper/CargaEntregasDeComision';
import { GuardarEntrega } from '../../../Estudiantes/Helpers/GuardarEntrega';
import { CalificarEntrega } from '../../Helper/CalificarEntrega'; // 🆕 Nuevo helper

// ========== 🐋 MODAL DE CALIFICACIÓN ==========
const ModalCalificar = ({ show, onHide, entrega, onCalificar, isLight, textClass, borderColor, titleColor }) => {
  const [puntaje, setPuntaje] = useState('');
  const [comentario, setComentario] = useState('');
  const [estado, setEstado] = useState('Calificado');
  const [enviando, setEnviando] = useState(false);

  // Resetear cuando se abre el modal
  useEffect(() => {
    if (show && entrega) {
      setPuntaje(entrega.calificacion?.puntaje || '');
      setComentario(entrega.feedback || entrega.calificacion?.comentario || '');
      setEstado(entrega.estado === 'Calificado' ? 'Calificado' : 'Calificado');
    }
  }, [show, entrega]);

  const handleSubmit = async () => {
    // Validaciones
    if (estado === 'Calificado' && !puntaje) {
      alert('Debes ingresar un puntaje para calificar');
      return;
    }

    if (puntaje && (puntaje < 0 || puntaje > 100)) {
      alert('El puntaje debe estar entre 0 y 100');
      return;
    }

    setEnviando(true);
    
    const resultado = await onCalificar(entrega._id || entrega.id, {
      puntaje: puntaje ? Number(puntaje) : undefined,
      comentario: comentario.trim(),
      estado: estado
    });

    setEnviando(false);
    
    if (resultado) {
      onHide();
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide}
      centered
      contentClassName={isLight ? 'bg-light' : 'bg-dark'}
    >
      <Modal.Header 
        closeButton 
        closeVariant={isLight ? undefined : 'white'}
        style={{ 
          backgroundColor: isLight ? '#FFFFFF' : '#1F2535',
          borderColor: borderColor,
          color: textClass
        }}
      >
        <Modal.Title>
          <Star className="me-2" style={{ color: titleColor }} />
          Calificar entrega: {entrega?.trabajo_nombre}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body style={{ 
        backgroundColor: isLight ? '#FFFFFF' : '#1F2535',
        color: textClass
      }}>
        <Form>
          <Form.Group className="mb-4">
            <Form.Label>
              <strong>Estado de la entrega</strong>
            </Form.Label>
            <Form.Select 
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              style={{
                backgroundColor: isLight ? '#FFFFFF' : '#1F2535',
                borderColor: borderColor,
                color: textClass
              }}
            >
              <option value="Calificado">✅ Calificado (con nota)</option>
              <option value="Rechazado">❌ Rechazado</option>
              <option value="En revisión">🔍 En revisión</option>
            </Form.Select>
          </Form.Group>

          {estado === 'Calificado' && (
            <Form.Group className="mb-4">
              <Form.Label>
                <strong>Puntaje (0-100) *</strong>
              </Form.Label>
              <Form.Control
                type="number"
                min="0"
                max="100"
                value={puntaje}
                onChange={(e) => setPuntaje(e.target.value)}
                placeholder="Ej: 85"
                style={{
                  backgroundColor: isLight ? '#FFFFFF' : '#1F2535',
                  borderColor: borderColor,
                  color: textClass
                }}
              />
              <Form.Text className="text-muted">
                Ingresa el puntaje de 0 a 100
              </Form.Text>
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>
              <strong>Comentario / Feedback</strong>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Agrega comentarios sobre la corrección..."
              style={{
                backgroundColor: isLight ? '#FFFFFF' : '#1F2535',
                borderColor: borderColor,
                color: textClass
              }}
            />
          </Form.Group>

          <Alert variant="info" className="mb-0">
            <InfoCircle className="me-2" />
            {estado === 'Calificado' 
              ? 'La entrega pasará a estado "Calificado" y el alumno verá su nota.'
              : estado === 'Rechazado'
              ? 'La entrega será rechazada y el alumno deberá corregirla.'
              : 'La entrega quedará en revisión mientras la evalúas.'}
          </Alert>
        </Form>
      </Modal.Body>
      
      <Modal.Footer style={{ 
        backgroundColor: isLight ? '#F8F9FA' : '#1A1F2E',
        borderColor: borderColor
      }}>
        <Button 
          variant="secondary" 
          onClick={onHide}
          style={{ 
            backgroundColor: isLight ? '#6c757d' : '#4a5568',
            borderColor: borderColor
          }}
        >
          Cancelar
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={enviando}
          style={{ backgroundColor: titleColor, borderColor: titleColor }}
        >
          {enviando ? (
            <>
              <Spinner size="sm" animation="border" className="me-2" />
              Guardando...
            </>
          ) : (
            <>
              <CheckCircle className="me-2" /> Guardar calificación
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// ========== 🐋 COMPONENTE FORMULARIO FUERA DEL COMPONENTE PRINCIPAL ==========
const FormularioEntrega = React.memo(({ 
  formData, 
  setFormData,
  nuevoMiembro,
  setNuevoMiembro,
  handleAgregarMiembro,
  handleEliminarMiembro,
  handleTipoEntregaChange,
  handleGithubUrlChange,
  handleArchivoUrlChange,
  handleComentariosChange,
  handleEntregar,
  isLight,
  textClass,
  borderColor,
  titleColor
}) => {
  
  const handleTrabajoNombreChange = (e) => {
    setFormData(prev => ({ ...prev, trabajoNombre: e.target.value }));
  };
  
  const handleNombreMiembroChange = (e) => {
    setNuevoMiembro(prev => ({ ...prev, nombre: e.target.value }));
  };
  
  const handleApellidoMiembroChange = (e) => {
    setNuevoMiembro(prev => ({ ...prev, apellido: e.target.value }));
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  return (
    <Card 
      className="shadow-sm mb-4" 
      style={{ 
        backgroundColor: isLight ? '#FFFFFF' : '#1F2535',
        borderColor: borderColor,
        borderLeft: `4px solid ${titleColor}`
      }}
    >
      <Card.Body>
        <h5 className="mb-4" style={{ color: textClass }}>
          <Upload className="me-2" style={{ color: titleColor }} />
          Entregar nuevo trabajo práctico
        </h5>
        
        <Form>
          {/* NOMBRE DEL TRABAJO */}
          <Form.Group className="mb-4">
            <Form.Label style={{ color: textClass }}>
              <strong>Nombre del trabajo *</strong>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: TP3 - React Hooks"
              value={formData.trabajoNombre}
              onChange={handleTrabajoNombreChange}
              style={{
                backgroundColor: isLight ? '#FFFFFF' : '#1F2535',
                borderColor: borderColor,
                color: textClass
              }}
            />
            <Form.Text className="text-muted">
              Ingresa el nombre identificatorio del trabajo que estás entregando
            </Form.Text>
          </Form.Group>
          
          {/* RADIO BUTTON: INDIVIDUAL / GRUPAL */}
          <Form.Group className="mb-4">
            <Form.Label style={{ color: textClass }}>
              <strong>Tipo de trabajo</strong>
            </Form.Label>
            <div className="d-flex gap-4">
              <Form.Check
                type="radio"
                id="individual"
                label={
                  <span style={{ color: textClass }}>
                    <Person className="me-1" size={16} /> Individual
                  </span>
                }
                checked={!formData.esGrupal}
                onChange={() => setFormData(prev => ({ 
                  ...prev, 
                  esGrupal: false,
                  alumnos: []
                }))}
              />
              <Form.Check
                type="radio"
                id="grupal"
                label={
                  <span style={{ color: textClass }}>
                    <People className="me-1" size={16} /> Grupal
                  </span>
                }
                checked={formData.esGrupal}
                onChange={() => setFormData(prev => ({ 
                  ...prev, 
                  esGrupal: true 
                }))}
              />
            </div>
          </Form.Group>
          
          {/* SECCIÓN DE MIEMBROS (SOLO SI ES GRUPAL) */}
          <Collapse in={formData.esGrupal}>
            <div>
              <Form.Group className="mb-4">
                <Form.Label style={{ color: textClass }}>
                  <strong><People className="me-2" />Miembros del grupo</strong>
                  <Badge bg="warning" className="ms-2">Requerido para grupo</Badge>
                </Form.Label>
                
                {/* Lista de miembros agregados */}
                {formData.alumnos.length > 0 && (
                  <Table 
                    size="sm" 
                    className="mb-3"
                    style={{ 
                      backgroundColor: isLight ? '#f8f9fa' : '#2a3042',
                      color: textClass
                    }}
                  >
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.alumnos.map((alumno, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{alumno.nombre}</td>
                          <td>{alumno.apellido}</td>
                          <td className="text-end">
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => handleEliminarMiembro(index)}
                              style={{ color: '#dc3545' }}
                            >
                              <Trash size={16} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
                
                {/* Formulario para agregar nuevo miembro */}
                <div 
                  className="p-3 rounded mb-2"
                  style={{ 
                    backgroundColor: isLight ? '#f8f9fa' : '#2a3042',
                    border: `1px dashed ${borderColor}`
                  }}
                >
                  <Row>
                    <Col md={5}>
                      <Form.Control
                        type="text"
                        placeholder="Nombre"
                        value={nuevoMiembro.nombre}
                        onChange={handleNombreMiembroChange}
                        style={{
                          backgroundColor: isLight ? '#FFFFFF' : '#1F2535',
                          borderColor: borderColor,
                          color: textClass,
                          marginBottom: '0.5rem'
                        }}
                      />
                    </Col>
                    <Col md={5}>
                      <Form.Control
                        type="text"
                        placeholder="Apellido"
                        value={nuevoMiembro.apellido}
                        onChange={handleApellidoMiembroChange}
                        style={{
                          backgroundColor: isLight ? '#FFFFFF' : '#1F2535',
                          borderColor: borderColor,
                          color: textClass,
                          marginBottom: '0.5rem'
                        }}
                      />
                    </Col>
                    <Col md={2}>
                      <Button
                        variant="outline-primary"
                        onClick={handleAgregarMiembro}
                        style={{ 
                          borderColor: borderColor,
                          color: textClass,
                          width: '100%'
                        }}
                      >
                        <PersonPlus className="me-1" /> Agregar
                      </Button>
                    </Col>
                  </Row>
                </div>
                
                <Form.Text className="text-muted">
                  Agrega a todos los integrantes del grupo
                </Form.Text>
              </Form.Group>
            </div>
          </Collapse>
          
          {/* TIPO DE ENTREGA */}
          <Form.Group className="mb-4">
            <Form.Label style={{ color: textClass }}>
              <strong>Tipo de entrega *</strong>
            </Form.Label>
            <div className="d-flex gap-4">
              <Form.Check
                type="radio"
                id="github"
                label={
                  <span style={{ color: textClass }}>
                    <Github className="me-1" /> URL de GitHub
                  </span>
                }
                checked={formData.tipoEntrega === 'github'}
                onChange={() => handleTipoEntregaChange('github')}
              />
              <Form.Check
                type="radio"
                id="archivo"
                label={
                  <span style={{ color: textClass }}>
                    <CloudUpload className="me-1" /> URL de archivo (Drive, Dropbox, etc.)
                  </span>
                }
                checked={formData.tipoEntrega === 'archivo'}
                onChange={() => handleTipoEntregaChange('archivo')}
              />
            </div>
          </Form.Group>
          
          {/* CAMPO SEGÚN TIPO */}
          {formData.tipoEntrega === 'github' ? (
            <Form.Group className="mb-4">
              <Form.Label style={{ color: textClass }}>
                <Github className="me-2" />
                URL del repositorio
              </Form.Label>
              <InputGroup>
                <InputGroup.Text style={{ 
                  backgroundColor: isLight ? '#F8F9FA' : '#1F2535',
                  borderColor: borderColor,
                  color: textClass
                }}>
                  <Link />
                </InputGroup.Text>
                <Form.Control
                  type="url"
                  placeholder="https://github.com/usuario/repositorio"
                  value={formData.githubUrl}
                  onChange={handleGithubUrlChange}
                  isInvalid={formData.githubUrl && !formData.githubUrl.includes('github.com')}
                  style={{
                    backgroundColor: isLight ? '#FFFFFF' : '#1F2535',
                    borderColor: borderColor,
                    color: textClass
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  Debe ser una URL válida de GitHub
                </Form.Control.Feedback>
              </InputGroup>
              <Form.Text className="text-muted">
                Repositorio público o con acceso compartido
              </Form.Text>
            </Form.Group>
          ) : (
            <Form.Group className="mb-4">
              <Form.Label style={{ color: textClass }}>
                <CloudUpload className="me-2" />
                URL del archivo (Google Drive, Dropbox, etc.)
              </Form.Label>
              <InputGroup>
                <InputGroup.Text style={{ 
                  backgroundColor: isLight ? '#F8F9FA' : '#1F2535',
                  borderColor: borderColor,
                  color: textClass
                }}>
                  <Link />
                </InputGroup.Text>
                <Form.Control
                  type="url"
                  placeholder="https://drive.google.com/file/d/..."
                  value={formData.archivoUrl}
                  onChange={handleArchivoUrlChange}
                  isInvalid={formData.archivoUrl && !isValidUrl(formData.archivoUrl)}
                  style={{
                    backgroundColor: isLight ? '#FFFFFF' : '#1F2535',
                    borderColor: borderColor,
                    color: textClass
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  Ingresa una URL válida
                </Form.Control.Feedback>
              </InputGroup>
              <div className="mt-2">
                <Alert variant="info" className="py-2 mb-0" style={{ fontSize: '0.9rem' }}>
                  <InfoCircle className="me-2" size={16} />
                  Sube tu archivo a Google Drive, Dropbox o similar y pega el enlace aquí. 
                  Asegúrate de que tenga permisos de acceso público.
                </Alert>
              </div>
              {formData.archivoUrl && isValidUrl(formData.archivoUrl) && (
                <div className="mt-2">
                  <Badge bg="success">
                    <CheckCircle className="me-1" /> URL válida
                  </Badge>
                  <small className="ms-2 text-muted">
                    {formData.archivoUrl.length > 50 ? formData.archivoUrl.substring(0, 50) + '...' : formData.archivoUrl}
                  </small>
                </div>
              )}
            </Form.Group>
          )}
          
          {/* COMENTARIOS */}
          <Form.Group className="mb-4">
            <Form.Label style={{ color: textClass }}>
              Comentarios (opcional)
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Agrega comentarios sobre tu entrega..."
              value={formData.comentarios}
              onChange={handleComentariosChange}
              style={{
                backgroundColor: isLight ? '#FFFFFF' : '#1F2535',
                borderColor: borderColor,
                color: textClass
              }}
            />
          </Form.Group>
          
          {/* INFORMACIÓN ADICIONAL */}
          <Alert variant="info" className="mb-4">
            <InfoCircle className="me-2" />
            {formData.esGrupal 
              ? "Recuerda agregar a todos los integrantes del grupo." 
              : "El trabajo se registrará a tu nombre."}
            Una vez entregado, quedará en estado "Entregado" hasta que sea calificado.
          </Alert>
          
          {/* BOTÓN DE ENTREGA */}
          <Button
            variant="primary"
            size="lg"
            onClick={handleEntregar}
            disabled={
              !formData.trabajoNombre || 
              (formData.tipoEntrega === 'github' && !formData.githubUrl) ||
              (formData.tipoEntrega === 'archivo' && !formData.archivoUrl) ||
              (formData.esGrupal && formData.alumnos.length === 0)
            }
            style={{ backgroundColor: titleColor, borderColor: titleColor }}
            className="w-100"
          >
            <Upload className="me-2" /> Confirmar entrega
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
});

// ========== 🐋 COMPONENTE PRINCIPAL ==========
const PanelTrabajos = ({ comision, theme, navigate, usuario }) => {
  // ========== 🐋 ESTADOS PRINCIPALES ==========
  const [entregas, setEntregas] = useState({
    comision: { id: comision?.id, nombre: comision?.nombre || '' },
    entregas: [],
    paginacion: {
      total: 0,
      pagina_actual: 1,
      total_paginas: 1,
      limite: 50
    },
    metricas: null,
    isLoading: true,
    error: null
  });
  
  const [misEntregas, setMisEntregas] = useState({
    usuario_id: usuario?._id || '',
    total_entregas: 0,
    entregas_por_comision: [],
    paginacion: {
      total: 0,
      pagina_actual: 1,
      total_paginas: 1,
      limite: 20
    },
    isLoading: true,
    error: null
  });
  
  // ========== 🐋 ESTADOS PARA CALIFICACIÓN ==========
  const [showModalCalificar, setShowModalCalificar] = useState(false);
  const [entregaSeleccionada, setEntregaSeleccionada] = useState(null);
  
  // ========== 🐋 CONFIGURACIÓN DE ROL ==========
  const rolUsuario = usuario?.rol || 'alumno';
  const esAlumno = rolUsuario === 'alumno';
  const esProfe = ['admin', 'profe', 'cordinador', 'corrector'].includes(rolUsuario);
  
  // ========== 🐋 ESTADOS UI ==========
  const [activeTab, setActiveTab] = useState('entregar');
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  
  // ========== 🐋 ESTADO DEL FORMULARIO DE ENTREGA ==========
  const [formData, setFormData] = useState({
    trabajoNombre: '',
    esGrupal: false,
    tipoEntrega: 'github',
    githubUrl: '',
    archivoUrl: '',
    comentarios: '',
    alumnos: []
  });
  
  // Estado para agregar nuevo miembro
  const [nuevoMiembro, setNuevoMiembro] = useState({
    nombre: '',
    apellido: ''
  });
  
  // ========== 🐋 CONFIGURACIÓN DE TEMA ==========
  const isLight = theme === 'lights';
  const textClass = isLight ? 'text-dark' : 'text-light';
  const borderColor = isLight ? '#DEE2E6' : '#3A4255';
  const bgColor = isLight ? '#FFFFFF' : '#1A1F2E';
  const titleColor = '#EF7F1A';
  
  // ========== 🐋 CARGA DE DATOS SEGÚN ROL ==========
  const cargarDatos = useCallback(async (signal) => {
    if (esAlumno) {
      await CargarEntregasUsuario(
        usuario._id,
        setMisEntregas,
        navigate,
        { 
          signal,
          filtros: { 
            comision_id: comision.id,
            page: paginaActual,
            limit: 20
          }
        }
      );
    } else {
      await CargarEntregasComision(
        comision.id,
        setEntregas,
        navigate,
        { 
          signal,
          filtros: { 
            page: paginaActual,
            limit: 50,
            estado: filtroEstado !== 'todos' ? filtroEstado : undefined
          }
        }
      );
    }
  }, [esAlumno, usuario?._id, comision.id, navigate, paginaActual, filtroEstado]);
  
  useEffect(() => {
    const abortController = new AbortController();
    cargarDatos(abortController.signal);
    return () => abortController.abort();
  }, [cargarDatos]);
  
  // ========== 🐋 FUNCIONES PARA MANEJO DE MIEMBROS ==========
  const handleAgregarMiembro = useCallback(() => {
    if (nuevoMiembro.nombre.trim() && nuevoMiembro.apellido.trim()) {
      setFormData(prev => ({
        ...prev,
        alumnos: [...prev.alumnos, { 
          nombre: nuevoMiembro.nombre,
          apellido: nuevoMiembro.apellido,
          usuario_id: null,
          email: '',
          es_registrado: false
        }]
      }));
      setNuevoMiembro({ nombre: '', apellido: '' });
    } else {
      alert('Completa nombre y apellido del miembro');
    }
  }, [nuevoMiembro]);
  
  const handleEliminarMiembro = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      alumnos: prev.alumnos.filter((_, i) => i !== index)
    }));
  }, []);
  
  // ========== 🐋 FUNCIONES PARA MANEJO DE ENTREGAS ==========
  const handleTipoEntregaChange = useCallback((tipo) => {
    setFormData(prev => ({
      ...prev,
      tipoEntrega: tipo,
      githubUrl: tipo === 'github' ? prev.githubUrl : '',
      archivoUrl: tipo === 'archivo' ? prev.archivoUrl : ''
    }));
  }, []);
  
  const handleGithubUrlChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, githubUrl: e.target.value }));
  }, []);
  
  const handleArchivoUrlChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, archivoUrl: e.target.value }));
  }, []);
  
  const handleComentariosChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, comentarios: e.target.value }));
  }, []);
  
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };
  
  // ========== 🐋 FUNCIÓN handleEntregar (SIN ALERT DE ÉXITO) ==========
  const handleEntregar = useCallback(async () => {
    console.log('🧪 Datos del usuario:', usuario);
    console.log('🧪 Datos de la comisión:', comision);
    
    // Validaciones básicas
    if (!formData.trabajoNombre.trim()) {
      alert('Ingresa el nombre del trabajo');
      return;
    }
    
    if (formData.tipoEntrega === 'github' && !formData.githubUrl) {
      alert('Ingresa la URL del repositorio de GitHub');
      return;
    }
    
    if (formData.tipoEntrega === 'archivo' && !formData.archivoUrl) {
      alert('Ingresa la URL del archivo');
      return;
    }
    
    if (formData.esGrupal && formData.alumnos.length === 0) {
      alert('Agrega al menos un miembro del grupo');
      return;
    }

    // Construir objeto de entrega
    const datosEntrega = {
      comision_id: comision._id || comision.id,
      comision_nombre: comision.nombre,
      trabajo_nombre: formData.trabajoNombre.trim(),
      tipo_entrega: formData.tipoEntrega,
      es_grupal: formData.esGrupal,
      comentarios: formData.comentarios?.trim() || '',
      ...(formData.tipoEntrega === 'github' 
        ? { github_url: formData.githubUrl.trim() }
        : { archivo_url: formData.archivoUrl.trim() }
      )
    };

    // Manejar miembros
    if (formData.esGrupal) {
      datosEntrega.miembros = formData.alumnos.map(m => ({
        usuario_id: m.usuario_id || null,
        nombres: m.nombre || m.nombres || '',
        apellido: m.apellido || '',
        email: m.email || '',
        es_registrado: m.es_registrado || false
      }));
    } else {
      datosEntrega.miembros = [{
        usuario_id: usuario._id || usuario.id,
        nombres: usuario.nombres || '',
        apellido: usuario.apellido || '',
        email: usuario.email || '',
        es_registrado: true
      }];
    }

    console.log('📦 Enviando datos al helper:', JSON.stringify(datosEntrega, null, 2));
    
    try {
      const resultado = await GuardarEntrega(datosEntrega, navigate);
      
      if (resultado?.success || resultado?.ok) {
        // Resetear formulario (sin alert, el helper ya muestra su propio mensaje)
        setFormData({
          trabajoNombre: '',
          esGrupal: false,
          tipoEntrega: 'github',
          githubUrl: '',
          archivoUrl: '',
          comentarios: '',
          alumnos: []
        });
        setNuevoMiembro({ nombre: '', apellido: '' });
        
        // Recargar datos y cambiar a historial
        await cargarDatos(new AbortController().signal);
        setActiveTab('historial');
      }
    } catch (error) {
      console.error('💥 Error al guardar entrega:', error);
      // El error ya se maneja en el helper
    }
  }, [formData, comision, usuario, navigate, cargarDatos]);

  // ========== 🐋 FUNCIÓN PARA CALIFICAR ==========
  const handleCalificar = useCallback(async (entregaId, datosCalificacion) => {
    try {
      const resultado = await CalificarEntrega(entregaId, datosCalificacion, navigate);
      
      if (resultado?.success || resultado?.ok) {
        // Recargar datos después de calificar
        await cargarDatos(new AbortController().signal);
        return true;
      }
      return false;
    } catch (error) {
      console.error('💥 Error al calificar:', error);
      return false;
    }
  }, [cargarDatos, navigate]);
  
  // ========== 🐋 FUNCIONES PARA FILTRADO LOCAL ==========
  const filtrarEntregasLocalmente = useCallback((entregasLista) => {
    if (!entregasLista || entregasLista.length === 0) return [];
    
    return entregasLista.filter(e => {
      if (filtroEstado !== 'todos' && e.estado !== filtroEstado) {
        return false;
      }
      
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesTrabajo = e.trabajo_nombre?.toLowerCase().includes(term);
        const matchesAlumno = e.alumno ? 
          `${e.alumno.nombres} ${e.alumno.apellido}`.toLowerCase().includes(term) : false;
        const matchesMiembros = e.miembros?.some(m => 
          `${m.nombres} ${m.apellido}`.toLowerCase().includes(term)
        );
        
        return matchesTrabajo || matchesAlumno || matchesMiembros;
      }
      
      return true;
    });
  }, [filtroEstado, searchTerm]);
  
  // ========== 🐋 COMPONENTES VISUALES ==========
  
  const EstadoBadge = ({ estado }) => {
    switch(estado) {
      case 'Entregado':
        return <Badge bg="warning"><Clock className="me-1" size={12} /> Pendiente</Badge>;
      case 'Calificado':
        return <Badge bg="success"><CheckCircle className="me-1" size={12} /> Calificado</Badge>;
      case 'Rechazado':
        return <Badge bg="danger"><XCircle className="me-1" size={12} /> Rechazado</Badge>;
      case 'Borrador':
        return <Badge bg="secondary"><Clock className="me-1" size={12} /> Borrador</Badge>;
      case 'En revisión':
        return <Badge bg="info"><Clock className="me-1" size={12} /> En revisión</Badge>;
      case 'Modificado':
        return <Badge bg="primary"><Clock className="me-1" size={12} /> Modificado</Badge>;
      default:
        return <Badge bg="secondary">{estado}</Badge>;
    }
  };
  
  // ========== 🐋 ITEM DE ENTREGA ==========
  const EntregaItem = ({ entrega }) => {
    const fechaEntrega = new Date(entrega.fecha_entrega).toLocaleString('es-ES');
    
    const abrirModalCalificar = () => {
      setEntregaSeleccionada(entrega);
      setShowModalCalificar(true);
    };
    
    return (
      <ListGroup.Item 
        className="border-bottom"
        style={{ 
          backgroundColor: 'transparent',
          borderColor: borderColor,
          color: textClass
        }}
      >
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
              <strong style={{ color: textClass }}>
                {entrega.trabajo_nombre}
              </strong>
              <EstadoBadge estado={entrega.estado} />
              {entrega.es_grupal ? (
                <Badge bg="info">
                  <People className="me-1" size={12} /> Grupal
                </Badge>
              ) : (
                <Badge bg="secondary">
                  <Person className="me-1" size={12} /> Individual
                </Badge>
              )}
            </div>
            
            <div className="mb-1">
              <small style={{ color: isLight ? '#6c757d' : '#b0b0b0' }}>
                <Person className="me-1" size={12} />
                Entregado por: {entrega.alumno?.nombres} {entrega.alumno?.apellido}
              </small>
            </div>
            
            {entrega.es_grupal && entrega.miembros && entrega.miembros.length > 1 && (
              <div className="mb-2">
                <small style={{ color: isLight ? '#6c757d' : '#b0b0b0' }}>
                  <People className="me-1" size={12} />
                  Integrantes: {entrega.miembros.map(m => `${m.nombres} ${m.apellido}`).join(', ')}
                </small>
              </div>
            )}
            
            <div className="d-flex flex-wrap gap-3 mb-2">
              <small style={{ color: isLight ? '#6c757d' : '#b0b0b0' }}>
                <Calendar className="me-1" size={12} />
                {fechaEntrega}
              </small>
              
              {entrega.tipo_entrega === 'github' ? (
                <small style={{ color: isLight ? '#6c757d' : '#b0b0b0' }}>
                  <Github className="me-1" size={12} />
                  GitHub
                </small>
              ) : (
                <small style={{ color: isLight ? '#6c757d' : '#b0b0b0' }}>
                  <CloudUpload className="me-1" size={12} />
                  Archivo (URL)
                </small>
              )}
              
              {entrega.calificacion?.puntaje && (
                <small style={{ color: '#ffc107' }}>
                  <StarFill className="me-1" size={12} />
                  {entrega.calificacion.puntaje}/100
                </small>
              )}
            </div>
            
            {entrega.feedback && (
              <div className="mt-2 p-2 rounded" style={{
                backgroundColor: isLight ? '#f8f9fa' : '#2a3042',
                borderLeft: `3px solid ${entrega.estado === 'Rechazado' ? '#dc3545' : '#0dcaf0'}`
              }}>
                <small style={{ color: isLight ? '#6c757d' : '#b0b0b0' }}>
                  <strong>Feedback:</strong> {entrega.feedback}
                </small>
              </div>
            )}
            
            <div className="d-flex gap-2 mt-3">
              {entrega.tipo_entrega === 'github' ? (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  href={entrega.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ borderColor: borderColor, color: textClass }}
                >
                  <Github className="me-1" /> Ver Repositorio
                </Button>
              ) : (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  href={entrega.archivo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ borderColor: borderColor, color: textClass }}
                >
                  <Download className="me-1" /> Ver Archivo
                </Button>
              )}
              
              {esProfe && entrega.estado === 'Entregado' && (
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={abrirModalCalificar}
                  style={{ borderColor: borderColor, color: textClass }}
                >
                  <CheckCircle className="me-1" /> Calificar
                </Button>
              )}
              
              {esProfe && (entrega.estado === 'Calificado' || entrega.estado === 'Rechazado' || entrega.estado === 'En revisión') && (
                <Button
                  variant="outline-warning"
                  size="sm"
                  onClick={abrirModalCalificar}
                  style={{ borderColor: borderColor, color: textClass }}
                >
                  <Star className="me-1" /> Modificar
                </Button>
              )}
            </div>
          </div>
        </div>
      </ListGroup.Item>
    );
  };
  
  // ========== 🐋 VISTA DE HISTORIAL (PROFESOR) ==========
  const VistaHistorialProfesor = () => {
    if (entregas.isLoading) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" variant={isLight ? 'primary' : 'light'} />
          <p className="mt-3" style={{ color: textClass }}>Cargando entregas...</p>
        </div>
      );
    }
    
    if (entregas.error) {
      return (
        <Alert variant="danger" className="text-center">
          <ExclamationTriangle size={24} className="mb-2" />
          <p>{entregas.error}</p>
        </Alert>
      );
    }
    
    const entregasFiltradas = filtrarEntregasLocalmente(entregas.entregas);
    
    return (
      <>
        <Card className="mb-4" style={{ 
          backgroundColor: isLight ? '#FFFFFF' : '#1F2535',
          borderColor: borderColor
        }}>
          <Card.Body>
            <Button
              variant="link"
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              style={{ color: textClass, textDecoration: 'none', padding: 0 }}
              className="d-flex align-items-center mb-3"
            >
              <Filter className="me-2" />
              {mostrarFiltros ? 'Ocultar filtros' : 'Mostrar filtros'}
            </Button>
            
            <Collapse in={mostrarFiltros}>
              <div>
                <Row>
                  <Col md={8}>
                    <InputGroup>
                      <InputGroup.Text style={{ 
                        backgroundColor: isLight ? '#F8F9FA' : '#2a3042',
                        borderColor: borderColor,
                        color: textClass
                      }}>
                        <Search />
                      </InputGroup.Text>
                      <Form.Control
                        placeholder="Buscar por trabajo o alumno..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                          backgroundColor: isLight ? '#FFFFFF' : '#1F2535',
                          borderColor: borderColor,
                          color: textClass
                        }}
                      />
                    </InputGroup>
                  </Col>
                  <Col md={4}>
                    <Form.Select 
                      value={filtroEstado}
                      onChange={(e) => setFiltroEstado(e.target.value)}
                      style={{
                        backgroundColor: isLight ? '#FFFFFF' : '#1F2535',
                        borderColor: borderColor,
                        color: textClass
                      }}
                    >
                      <option value="todos">📋 Todos los estados</option>
                      <option value="Entregado">⏳ Pendientes</option>
                      <option value="Calificado">✅ Calificados</option>
                      <option value="Rechazado">❌ Rechazados</option>
                      <option value="En revisión">🔍 En revisión</option>
                    </Form.Select>
                  </Col>
                </Row>
              </div>
            </Collapse>
          </Card.Body>
        </Card>
        
        <Card style={{ 
          backgroundColor: isLight ? '#FFFFFF' : '#1A1F2E',
          borderColor: borderColor
        }}>
          <Card.Header style={{ 
            backgroundColor: isLight ? '#FAF3E1' : '#1F2535',
            borderColor: borderColor
          }}>
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0" style={{ color: textClass }}>
                📋 Todas las entregas ({entregas.paginacion.total})
              </h6>
              {entregas.metricas && (
                <div className="d-flex gap-2">
                  <Badge bg="info">GitHub: {entregas.metricas.entregas_github || 0}</Badge>
                  <Badge bg="secondary">Archivo: {entregas.metricas.entregas_archivo || 0}</Badge>
                </div>
              )}
            </div>
          </Card.Header>
          <Card.Body style={{ padding: '0' }}>
            {entregasFiltradas.length === 0 ? (
              <div className="text-center py-5">
                <Briefcase size={48} style={{ color: '#6c757d' }} />
                <p className="mt-3" style={{ color: textClass }}>No hay entregas que coincidan con los filtros</p>
              </div>
            ) : (
              <ListGroup variant="flush">
                {entregasFiltradas.map(entrega => (
                  <EntregaItem 
                    key={entrega.id || entrega._id} 
                    entrega={entrega} 
                  />
                ))}
              </ListGroup>
            )}
          </Card.Body>
        </Card>
      </>
    );
  };
  
  // ========== 🐋 VISTA DE HISTORIAL (ALUMNO) ==========
  const VistaHistorialAlumno = () => {
    if (misEntregas.isLoading) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" variant={isLight ? 'primary' : 'light'} />
          <p className="mt-3" style={{ color: textClass }}>Cargando tus entregas...</p>
        </div>
      );
    }
    
    if (misEntregas.error) {
      return (
        <Alert variant="danger" className="text-center">
          <ExclamationTriangle size={24} className="mb-2" />
          <p>{misEntregas.error}</p>
        </Alert>
      );
    }
    
    const entregasComision = misEntregas.entregas_por_comision?.find(
      ec => ec.comision_id === comision.id
    );
    
    const entregasLista = entregasComision?.entregas || [];
    const entregasFiltradas = filtrarEntregasLocalmente(entregasLista);
    
    return (
      <Card style={{ 
        backgroundColor: isLight ? '#FFFFFF' : '#1A1F2E',
        borderColor: borderColor
      }}>
        <Card.Header style={{ 
          backgroundColor: isLight ? '#FAF3E1' : '#1F2535',
          borderColor: borderColor
        }}>
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0" style={{ color: textClass }}>
              📋 Mis entregas en esta comisión
            </h6>
            <Badge bg="info">{entregasLista.length} entregas</Badge>
          </div>
        </Card.Header>
        <Card.Body style={{ padding: '0' }}>
          {entregasLista.length === 0 ? (
            <div className="text-center py-5">
              <Briefcase size={48} style={{ color: '#6c757d' }} />
              <p className="mt-3" style={{ color: textClass }}>No has realizado entregas en esta comisión</p>
              <Button
                variant="primary"
                onClick={() => setActiveTab('entregar')}
                style={{ backgroundColor: titleColor, borderColor: titleColor }}
              >
                <Upload className="me-2" /> Entregar ahora
              </Button>
            </div>
          ) : (
            <>
              <div className="p-3 border-bottom" style={{ borderColor }}>
                <InputGroup>
                  <InputGroup.Text style={{ 
                    backgroundColor: isLight ? '#F8F9FA' : '#2a3042',
                    borderColor: borderColor,
                    color: textClass
                  }}>
                    <Search />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Buscar por trabajo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      backgroundColor: isLight ? '#FFFFFF' : '#1F2535',
                      borderColor: borderColor,
                      color: textClass
                    }}
                  />
                </InputGroup>
              </div>
              
              <ListGroup variant="flush">
                {entregasFiltradas.map(entrega => (
                  <EntregaItem 
                    key={entrega.id || entrega._id} 
                    entrega={entrega} 
                  />
                ))}
              </ListGroup>
            </>
          )}
        </Card.Body>
      </Card>
    );
  };
  
  // ========== 🐋 RENDERIZADO PRINCIPAL ==========
  return (
    <div style={{ backgroundColor: bgColor, minHeight: '100vh' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1" style={{ color: textClass }}>
            <Briefcase className="me-2" style={{ color: titleColor }} />
            Trabajos Prácticos
          </h4>
          <p style={{ color: isLight ? '#6c757d' : '#b0b0b0', marginBottom: 0 }}>
            {comision.nombre} - {comision.carrera_info?.nombre || 'Carrera'}
          </p>
        </div>
        
        <Badge 
          bg={esAlumno ? 'primary' : 'success'} 
          className="p-2"
          style={{ fontSize: '0.9rem' }}
        >
          {usuario?.rol || 'usuario'}
        </Badge>
      </div>
      
      <Nav variant="tabs" className="mb-4" style={{ borderColor: borderColor }}>
        <Nav.Item>
          <Nav.Link 
            eventKey="entregar"
            active={activeTab === 'entregar'}
            onClick={() => setActiveTab('entregar')}
            style={{ 
              color: activeTab === 'entregar' ? titleColor : textClass,
              borderColor: borderColor,
              backgroundColor: activeTab === 'entregar' ? (isLight ? '#FFFFFF' : '#1F2535') : 'transparent'
            }}
          >
            <Upload className="me-2" /> Entregar Trabajo
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link 
            eventKey="historial"
            active={activeTab === 'historial'}
            onClick={() => setActiveTab('historial')}
            style={{ 
              color: activeTab === 'historial' ? titleColor : textClass,
              borderColor: borderColor,
              backgroundColor: activeTab === 'historial' ? (isLight ? '#FFFFFF' : '#1F2535') : 'transparent'
            }}
          >
            <Eye className="me-2" /> Historial de Entregas
            <Badge bg="secondary" className="ms-2">
              {esAlumno 
                ? misEntregas.total_entregas 
                : entregas.paginacion.total
              }
            </Badge>
          </Nav.Link>
        </Nav.Item>
      </Nav>
      
      <div>
        {activeTab === 'entregar' && (
          <FormularioEntrega 
            formData={formData}
            setFormData={setFormData}
            nuevoMiembro={nuevoMiembro}
            setNuevoMiembro={setNuevoMiembro}
            handleAgregarMiembro={handleAgregarMiembro}
            handleEliminarMiembro={handleEliminarMiembro}
            handleTipoEntregaChange={handleTipoEntregaChange}
            handleGithubUrlChange={handleGithubUrlChange}
            handleArchivoUrlChange={handleArchivoUrlChange}
            handleComentariosChange={handleComentariosChange}
            handleEntregar={handleEntregar}
            isLight={isLight}
            textClass={textClass}
            borderColor={borderColor}
            titleColor={titleColor}
          />
        )}
        
        {activeTab === 'historial' && (
          esAlumno ? <VistaHistorialAlumno /> : <VistaHistorialProfesor />
        )}
      </div>

      {/* Modal de calificación */}
      <ModalCalificar
        show={showModalCalificar}
        onHide={() => {
          setShowModalCalificar(false);
          setEntregaSeleccionada(null);
        }}
        entrega={entregaSeleccionada}
        onCalificar={handleCalificar}
        isLight={isLight}
        textClass={textClass}
        borderColor={borderColor}
        titleColor={titleColor}
      />
    </div>
  );
};

export default PanelTrabajos;