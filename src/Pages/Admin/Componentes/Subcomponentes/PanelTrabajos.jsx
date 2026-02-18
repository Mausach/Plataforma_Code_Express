// Components/Subcomponentes/PanelTrabajos.jsx
// 🐋 VERSIÓN COMPLETA CON ACORDEONES POR MÓDULO Y CONTENIDO + VER/DESCARGAR EN HISTORIAL
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
  Collapse,
  Spinner,
  Modal,
  Table
} from 'react-bootstrap';
import { 
  Briefcase, 
  Github, 
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
  InfoCircle,
  PersonPlus,
  People,
  Trash,
  Filter,
  ExclamationTriangle,
  CloudUpload,
  Star,
  FileEarmarkText,
  FileEarmarkPdf,
  FileEarmarkZip,
  FileText,
  CloudDownload,
  ShieldLock
} from 'react-bootstrap-icons';
import Swal from 'sweetalert2';

// HELPERS
import { CargarEntregasUsuario } from '../../../Estudiantes/Helpers/CargaEntregaDelUsuario';
import { CargarEntregasComision } from '../../Helper/CargaEntregasDeComision';
import { GuardarEntrega } from '../../../Estudiantes/Helpers/GuardarEntrega';
import { CalificarEntrega } from '../../Helper/CalificarEntrega';

// ========== 🐋 FUNCIONES PARA MANEJO DE GOOGLE DRIVE ==========
const extraerIdDeGoogleDrive = (url) => {
  if (!url) return null;
  try {
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9_-]+)/,
      /\/presentation\/d\/([a-zA-Z0-9_-]+)/,
      /\/document\/d\/([a-zA-Z0-9_-]+)/,
      /id=([a-zA-Z0-9_-]+)/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  } catch (error) {
    console.error('Error al extraer ID:', error);
    return null;
  }
};

const transformarADescargaDirecta = (url) => {
  if (!url) return url;
  
  try {
    const patrones = [
      /(?:https?:\/\/)?(?:drive\.google\.com\/)?file\/d\/([a-zA-Z0-9_-]+)/,
      /(?:https?:\/\/)?(?:drive\.google\.com\/)?open\?id=([a-zA-Z0-9_-]+)/,
      /(?:https?:\/\/)?(?:drive\.google\.com\/)?uc\?id=([a-zA-Z0-9_-]+)/,
      /id=([a-zA-Z0-9_-]+)/,
      /(?:https?:\/\/)?(?:docs\.google\.com\/)?presentation\/d\/([a-zA-Z0-9_-]+)/,
      /(?:https?:\/\/)?(?:docs\.google\.com\/)?document\/d\/([a-zA-Z0-9_-]+)/
    ];
    
    let fileId = null;
    
    for (const patron of patrones) {
      const match = url.match(patron);
      if (match && match[1]) {
        fileId = match[1];
        break;
      }
    }
    
    if (fileId) {
      return `https://drive.google.com/uc?export=download&confirm=t&id=${fileId}`;
    }
    
    return url;
    
  } catch (error) {
    console.error('Error al transformar URL:', error);
    return url;
  }
};

const detectarTipoArchivo = (url) => {
  if (!url) return 'desconocido';
  
  if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
    return 'google-drive';
  }
  if (url.match(/\.(pdf|PDF)$/)) {
    return 'pdf';
  }
  if (url.match(/\.(zip|rar|7z|gz)$/)) {
    return 'comprimido';
  }
  if (url.match(/\.(doc|docx|odt)$/)) {
    return 'word';
  }
  if (url.match(/\.(xls|xlsx|csv)$/)) {
    return 'excel';
  }
  if (url.match(/\.(ppt|pptx|odp)$/)) {
    return 'powerpoint';
  }
  if (url.includes('github.com')) {
    return 'github';
  }
  return 'web';
};

const getIconoPorTipo = (url) => {
  const tipo = detectarTipoArchivo(url);
  
  switch(tipo) {
    case 'google-drive':
      return <CloudUpload size={16} className="me-1" />;
    case 'pdf':
      return <FileEarmarkPdf size={16} className="me-1" />;
    case 'comprimido':
      return <FileEarmarkZip size={16} className="me-1" />;
    case 'word':
    case 'excel':
    case 'powerpoint':
      return <FileText size={16} className="me-1" />;
    case 'github':
      return <Github size={16} className="me-1" />;
    default:
      return <Download size={16} className="me-1" />;
  }
};

const descargarArchivo = async (url, nombreArchivo, colors, isLight) => {
  if (!url) {
    Swal.fire({
      title: 'Error',
      text: 'No hay URL disponible para descargar',
      icon: 'error',
      background: colors.cardBg,
      color: colors.text,
      confirmButtonColor: colors.danger
    });
    return;
  }

  try {
    Swal.fire({
      title: 'Preparando descarga...',
      html: 'Por favor espera',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      background: colors.cardBg,
      color: colors.text
    });

    const urlDescarga = transformarADescargaDirecta(url);
    
    const link = document.createElement('a');
    link.href = urlDescarga;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    if (nombreArchivo) {
      let nombreLimpio = nombreArchivo.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const tipo = detectarTipoArchivo(url);
      if (tipo === 'pdf' && !nombreLimpio.endsWith('.pdf')) {
        nombreLimpio += '.pdf';
      }
      if (tipo === 'comprimido' && !nombreLimpio.match(/\.(zip|rar|7z|gz)$/)) {
        nombreLimpio += '.zip';
      }
      link.download = nombreLimpio;
    }
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    Swal.close();
    
  } catch (error) {
    console.error('Error en descarga:', error);
    Swal.close();
    Swal.fire({
      title: 'Error al descargar',
      text: 'No se pudo iniciar la descarga. ¿Quieres abrir el enlace manualmente?',
      icon: 'error',
      background: colors.cardBg,
      color: colors.text,
      confirmButtonColor: colors.success,
      cancelButtonColor: colors.danger,
      showCancelButton: true,
      confirmButtonText: 'Sí, abrir enlace',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        window.open(url, '_blank');
      }
    });
  }
};

const abrirEnVistaPrevia = (url, titulo) => {
  if (!url) return;
  
  const driveId = extraerIdDeGoogleDrive(url);
  if (driveId) {
    const previewUrl = `https://drive.google.com/file/d/${driveId}/preview`;
    window.open(previewUrl, '_blank');
  } else if (url.includes('github.com')) {
    window.open(url, '_blank');
  } else {
    window.open(url, '_blank');
  }
};

// ========== 🐋 COMPONENTE AUXILIAR CHEVRON ==========
const ChevronIcon = ({ isExpanded, color }) => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 16 16" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={{
      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
      transition: 'transform 0.3s'
    }}
  >
    <path 
      d={isExpanded 
        ? "M8 12L12 8L8 4L4 8L8 12Z" 
        : "M8 4L4 8L8 12L12 8L8 4Z"
      }
      fill={color}
    />
  </svg>
);

// ========== 🐋 MODAL DE VISTA PREVIA DE PDF ==========
const PdfPreviewModal = ({ show, onHide, pdfUrl, pdfTitle, pdfList, selectedIndex, onIndexChange, isLight, colors, titleColor }) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      fullscreen="lg-down"
      centered
    >
      <Modal.Header
        closeButton
        style={{ 
          backgroundColor: colors.cardBg,
          borderBottomColor: colors.border,
          color: colors.text
        }}
        closeVariant={isLight ? 'dark' : 'white'}
      >
        <Modal.Title style={{ color: titleColor }}>
          <FileEarmarkPdf className="me-2" />
          {pdfTitle || 'Vista previa'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-0" style={{ 
        backgroundColor: colors.cardBg,
        minHeight: '60vh' 
      }}>
        {pdfList && pdfList.length > 1 && (
          <div
            className="p-3"
            style={{
              borderBottom: `1px solid ${colors.border}`,
              backgroundColor: colors.cardHeaderBg
            }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <span style={{ color: colors.text }}>
                <strong>Archivos disponibles:</strong> {pdfList.length}
              </span>
              <div className="d-flex align-items-center gap-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => onIndexChange(selectedIndex - 1)}
                  disabled={selectedIndex === 0}
                  style={{ 
                    borderColor: colors.border, 
                    color: colors.text
                  }}
                >
                  ← Anterior
                </Button>
                <span style={{ color: colors.text }}>
                  {selectedIndex + 1} de {pdfList.length}
                </span>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => onIndexChange(selectedIndex + 1)}
                  disabled={selectedIndex === pdfList.length - 1}
                  style={{ 
                    borderColor: colors.border, 
                    color: colors.text
                  }}
                >
                  Siguiente →
                </Button>
              </div>
            </div>
          </div>
        )}

        {pdfUrl ? (
          <div style={{ width: '100%', height: '60vh' }}>
            <iframe
              src={pdfUrl}
              width="100%"
              height="100%"
              frameBorder="0"
              title="Vista previa"
              style={{
                border: 'none',
                backgroundColor: colors.background
              }}
            />
          </div>
        ) : (
          <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
            <Spinner animation="border" variant={isLight ? 'primary' : 'light'} />
            <span className="ms-2" style={{ color: colors.text }}>Cargando...</span>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer style={{ 
        backgroundColor: colors.cardBg,
        borderTopColor: colors.border
      }}>
        <div className="d-flex justify-content-between w-100 align-items-center">
          <div>
            {pdfList && pdfList[selectedIndex] && (
              <small style={{ color: colors.textMuted }}>
                <strong>Tipo:</strong> {
                  pdfList[selectedIndex].tipo || detectarTipoArchivo(pdfList[selectedIndex].url)
                }
              </small>
            )}
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              onClick={onHide}
              style={{ 
                borderColor: colors.border, 
                color: colors.text
              }}
            >
              Cerrar
            </Button>
            {pdfUrl && pdfList && pdfList[selectedIndex] && (
              <Button
                variant="primary"
                onClick={() => descargarArchivo(
                  pdfList[selectedIndex].url,
                  pdfList[selectedIndex].nombre,
                  colors,
                  isLight
                )}
                style={{ 
                  backgroundColor: titleColor, 
                  borderColor: titleColor,
                  color: '#ffffff'
                }}
              >
                {getIconoPorTipo(pdfList[selectedIndex].url)}
                Descargar
              </Button>
            )}
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

// ========== 🐋 SELECTOR DE MÓDULO Y CONTENIDO ==========
const SelectorModuloContenido = ({ 
  comision, 
  moduloSeleccionado, 
  setModuloSeleccionado,
  contenidoSeleccionado,
  setContenidoSeleccionado,
  isLight,
  borderColor,
  textColor,
  textMutedColor
}) => {
  
  const colors = {
    text: textColor,
    textMuted: textMutedColor,
    border: borderColor,
    inputBg: isLight ? '#FFFFFF' : '#2a3042'
  };

  const modulos = comision?.progreso_carrera || [];

  const contenidosDelModulo = modulos.find(
    m => m.modulo_id === moduloSeleccionado
  )?.contenidos || [];

  const moduloNombre = modulos.find(m => m.modulo_id === moduloSeleccionado)?.nombre_modulo;
  const contenidoNombre = contenidosDelModulo.find(c => c.contenido_id === contenidoSeleccionado)?.nombre_contenido;

  return (
    <Card className="mb-4" style={{ 
      backgroundColor: 'transparent',
      borderColor: colors.border,
      borderLeft: `4px solid #EF7F1A`
    }}>
      <Card.Body>
        <h6 className="mb-3" style={{ color: colors.text }}>
          <Briefcase className="me-2" style={{ color: '#EF7F1A' }} />
          Vincular trabajo a módulo/contenido
        </h6>
        
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: colors.text }}>
                <strong>Módulo *</strong>
              </Form.Label>
              <Form.Select
                value={moduloSeleccionado || ''}
                onChange={(e) => {
                  setModuloSeleccionado(e.target.value);
                  setContenidoSeleccionado('');
                }}
                style={{
                  backgroundColor: colors.inputBg,
                  borderColor: colors.border,
                  color: colors.text
                }}
              >
                <option value="" style={{ color: '#212529' }}>Seleccionar módulo...</option>
                {modulos.map((modulo, index) => (
                  <option 
                    key={modulo.modulo_id || index} 
                    value={modulo.modulo_id}
                    style={{ color: '#212529' }}
                  >
                    {modulo.orden_modulo}. {modulo.nombre_modulo}
                    {modulo.estado_modulo ? ' ✅' : ' ⏳'}
                  </option>
                ))}
              </Form.Select>
              {modulos.length === 0 && (
                <Form.Text style={{ color: colors.textMuted }}>
                  No hay módulos disponibles para esta comisión
                </Form.Text>
              )}
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: colors.text }}>
                <strong>Contenido *</strong>
              </Form.Label>
              <Form.Select
                value={contenidoSeleccionado || ''}
                onChange={(e) => setContenidoSeleccionado(e.target.value)}
                disabled={!moduloSeleccionado}
                style={{
                  backgroundColor: colors.inputBg,
                  borderColor: colors.border,
                  color: colors.text,
                  opacity: !moduloSeleccionado ? 0.6 : 1
                }}
              >
                <option value="" style={{ color: '#212529' }}>
                  {moduloSeleccionado 
                    ? 'Seleccionar contenido...' 
                    : 'Primero selecciona un módulo'}
                </option>
                {contenidosDelModulo.map((contenido, index) => (
                  <option 
                    key={contenido.contenido_id || index} 
                    value={contenido.contenido_id}
                    style={{ color: '#212529' }}
                  >
                    {contenido.nombre_contenido}
                    {contenido.estado_contenido ? ' ✅' : ' ⏳'}
                  </option>
                ))}
              </Form.Select>
              
              {moduloSeleccionado && contenidosDelModulo.length === 0 && (
                <Form.Text style={{ color: colors.textMuted }}>
                  Este módulo no tiene contenidos
                </Form.Text>
              )}
            </Form.Group>
          </Col>
        </Row>

        {moduloSeleccionado && contenidoSeleccionado && (
          <Alert 
            variant="success" 
            className="mt-2 mb-0"
            style={{ 
              backgroundColor: isLight ? '#d1e7dd' : '#0f3b2b',
              borderColor: isLight ? '#badbcc' : '#0f3b2b',
              color: isLight ? '#0a3622' : '#d1e7dd'
            }}
          >
            <CheckCircle className="me-2" />
            <strong>Trabajo vinculado a:</strong>{' '}
            {moduloNombre} → {contenidoNombre}
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

// ========== 🐋 MODAL DE CALIFICACIÓN ==========
const ModalCalificar = ({ show, onHide, entrega, onCalificar, isLight, textClass, borderColor, titleColor }) => {
  const [puntaje, setPuntaje] = useState('');
  const [comentario, setComentario] = useState('');
  const [estado, setEstado] = useState('Calificado');
  const [enviando, setEnviando] = useState(false);

  const colors = {
    bg: isLight ? '#FFFFFF' : '#1F2535',
    text: isLight ? '#212529' : '#e9ecef',
    textMuted: isLight ? '#6c757d' : '#adb5bd',
    border: borderColor,
    inputBg: isLight ? '#FFFFFF' : '#2a3042',
    headerBg: isLight ? '#F8F9FA' : '#1A1F2E',
    footerBg: isLight ? '#F8F9FA' : '#1A1F2E'
  };

  useEffect(() => {
    if (show && entrega) {
      setPuntaje(entrega.calificacion?.puntaje || '');
      setComentario(entrega.feedback || entrega.calificacion?.comentario || '');
      setEstado(entrega.estado === 'Calificado' ? 'Calificado' : 'Calificado');
    }
  }, [show, entrega]);

  const handleSubmit = async () => {
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
          backgroundColor: colors.headerBg,
          borderColor: colors.border,
          color: colors.text
        }}
      >
        <Modal.Title style={{ color: colors.text }}>
          <Star className="me-2" style={{ color: titleColor }} />
          Calificar entrega: {entrega?.trabajo_nombre}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body style={{ 
        backgroundColor: colors.bg,
        color: colors.text
      }}>
        <Form>
          <Form.Group className="mb-4">
            <Form.Label style={{ color: colors.text }}>
              <strong>Estado de la entrega</strong>
            </Form.Label>
            <Form.Select 
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              style={{
                backgroundColor: colors.inputBg,
                borderColor: colors.border,
                color: colors.text
              }}
            >
              <option value="Calificado" style={{ color: '#212529' }}>✅ Calificado (con nota)</option>
              <option value="Rechazado" style={{ color: '#212529' }}>❌ Rechazado</option>
              <option value="En revisión" style={{ color: '#212529' }}>🔍 En revisión</option>
            </Form.Select>
          </Form.Group>

          {estado === 'Calificado' && (
            <Form.Group className="mb-4">
              <Form.Label style={{ color: colors.text }}>
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
                  backgroundColor: colors.inputBg,
                  borderColor: colors.border,
                  color: colors.text
                }}
              />
              <Form.Text style={{ color: colors.textMuted }}>
                Ingresa el puntaje de 0 a 100
              </Form.Text>
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label style={{ color: colors.text }}>
              <strong>Comentario / Feedback</strong>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Agrega comentarios sobre la corrección..."
              style={{
                backgroundColor: colors.inputBg,
                borderColor: colors.border,
                color: colors.text
              }}
            />
          </Form.Group>

          <Alert 
            variant="info" 
            className="mb-0"
            style={{ 
              backgroundColor: isLight ? '#cff4fc' : '#0d4b5c',
              borderColor: isLight ? '#b6effb' : '#0d4b5c',
              color: isLight ? '#055160' : '#e3f0f5'
            }}
          >
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
        backgroundColor: colors.footerBg,
        borderColor: colors.border
      }}>
        <Button 
          variant="secondary" 
          onClick={onHide}
          style={{ 
            backgroundColor: isLight ? '#6c757d' : '#4a5568',
            borderColor: colors.border,
            color: '#ffffff'
          }}
        >
          Cancelar
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={enviando}
          style={{ backgroundColor: titleColor, borderColor: titleColor, color: '#ffffff' }}
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

// ========== 🐋 FORMULARIO DE ENTREGA ==========
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
  titleColor,
  comision,
  moduloSeleccionado,
  setModuloSeleccionado,
  contenidoSeleccionado,
  setContenidoSeleccionado
}) => {
  
  const colors = {
    text: isLight ? '#212529' : '#e9ecef',
    textMuted: isLight ? '#6c757d' : '#adb5bd',
    border: borderColor,
    bg: isLight ? '#FFFFFF' : '#1F2535',
    inputBg: isLight ? '#FFFFFF' : '#2a3042',
    cardBg: isLight ? '#FFFFFF' : '#1F2535',
    tableHeaderBg: isLight ? '#f8f9fa' : '#2a3042',
    tableRowBg: isLight ? '#ffffff' : '#1F2535'
  };
  
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
        backgroundColor: colors.cardBg,
        borderColor: colors.border,
        borderLeft: `4px solid ${titleColor}`,
        color: colors.text
      }}
    >
      <Card.Body>
        <h5 className="mb-4" style={{ color: colors.text }}>
          <Upload className="me-2" style={{ color: titleColor }} />
          Entregar nuevo trabajo práctico
        </h5>
        
        <Form>
          <SelectorModuloContenido
            comision={comision}
            moduloSeleccionado={moduloSeleccionado}
            setModuloSeleccionado={setModuloSeleccionado}
            contenidoSeleccionado={contenidoSeleccionado}
            setContenidoSeleccionado={setContenidoSeleccionado}
            isLight={isLight}
            borderColor={colors.border}
            textColor={colors.text}
            textMutedColor={colors.textMuted}
          />
          
          <Form.Group className="mb-4">
            <Form.Label style={{ color: colors.text }}>
              <strong>Nombre del trabajo *</strong>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: TP3 - React Hooks"
              value={formData.trabajoNombre}
              onChange={handleTrabajoNombreChange}
              style={{
                backgroundColor: colors.inputBg,
                borderColor: colors.border,
                color: colors.text
              }}
            />
            <Form.Text style={{ color: colors.textMuted }}>
              Ingresa el nombre identificatorio del trabajo que estás entregando
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-4">
            <Form.Label style={{ color: colors.text }}>
              <strong>Tipo de trabajo</strong>
            </Form.Label>
            <div className="d-flex gap-4">
              <Form.Check
                type="radio"
                id="individual"
                label={
                  <span style={{ color: colors.text }}>
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
                  <span style={{ color: colors.text }}>
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
          
          <Collapse in={formData.esGrupal}>
            <div>
              <Form.Group className="mb-4">
                <Form.Label style={{ color: colors.text }}>
                  <strong><People className="me-2" />Miembros del grupo</strong>
                  <Badge bg="warning" className="ms-2" style={{ backgroundColor: '#ffc107', color: '#212529' }}>
                    Requerido para grupo
                  </Badge>
                </Form.Label>
                
                {formData.alumnos.length > 0 && (
                  <Table 
                    size="sm" 
                    className="mb-3"
                    style={{ 
                      backgroundColor: colors.tableRowBg,
                      color: colors.text
                    }}
                  >
                    <thead style={{ backgroundColor: colors.tableHeaderBg }}>
                      <tr>
                        <th style={{ color: colors.text }}>#</th>
                        <th style={{ color: colors.text }}>Nombre</th>
                        <th style={{ color: colors.text }}>Apellido</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.alumnos.map((alumno, index) => (
                        <tr key={index}>
                          <td style={{ color: colors.text }}>{index + 1}</td>
                          <td style={{ color: colors.text }}>{alumno.nombre}</td>
                          <td style={{ color: colors.text }}>{alumno.apellido}</td>
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
                
                <div 
                  className="p-3 rounded mb-2"
                  style={{ 
                    backgroundColor: isLight ? '#f8f9fa' : '#2a3042',
                    border: `1px dashed ${colors.border}`
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
                          backgroundColor: colors.inputBg,
                          borderColor: colors.border,
                          color: colors.text,
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
                          backgroundColor: colors.inputBg,
                          borderColor: colors.border,
                          color: colors.text,
                          marginBottom: '0.5rem'
                        }}
                      />
                    </Col>
                    <Col md={2}>
                      <Button
                        variant="outline-primary"
                        onClick={handleAgregarMiembro}
                        style={{ 
                          borderColor: colors.border,
                          color: colors.text,
                          width: '100%'
                        }}
                      >
                        <PersonPlus className="me-1" /> Agregar
                      </Button>
                    </Col>
                  </Row>
                </div>
                
                <Form.Text style={{ color: colors.textMuted }}>
                  Agrega a todos los integrantes del grupo
                </Form.Text>
              </Form.Group>
            </div>
          </Collapse>
          
          <Form.Group className="mb-4">
            <Form.Label style={{ color: colors.text }}>
              <strong>Tipo de entrega *</strong>
            </Form.Label>
            <div className="d-flex gap-4">
              <Form.Check
                type="radio"
                id="github"
                label={
                  <span style={{ color: colors.text }}>
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
                  <span style={{ color: colors.text }}>
                    <CloudUpload className="me-1" /> URL de archivo (Drive, Dropbox, etc.)
                  </span>
                }
                checked={formData.tipoEntrega === 'archivo'}
                onChange={() => handleTipoEntregaChange('archivo')}
              />
            </div>
          </Form.Group>
          
          {formData.tipoEntrega === 'github' ? (
            <Form.Group className="mb-4">
              <Form.Label style={{ color: colors.text }}>
                <Github className="me-2" />
                URL del repositorio
              </Form.Label>
              <InputGroup>
                <InputGroup.Text style={{ 
                  backgroundColor: isLight ? '#F8F9FA' : '#2a3042',
                  borderColor: colors.border,
                  color: colors.text
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
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.text
                  }}
                />
                <Form.Control.Feedback type="invalid" style={{ color: '#dc3545' }}>
                  Debe ser una URL válida de GitHub
                </Form.Control.Feedback>
              </InputGroup>
              <Form.Text style={{ color: colors.textMuted }}>
                Repositorio público o con acceso compartido
              </Form.Text>
            </Form.Group>
          ) : (
            <Form.Group className="mb-4">
              <Form.Label style={{ color: colors.text }}>
                <CloudUpload className="me-2" />
                URL del archivo (Google Drive, Dropbox, etc.)
              </Form.Label>
              <InputGroup>
                <InputGroup.Text style={{ 
                  backgroundColor: isLight ? '#F8F9FA' : '#2a3042',
                  borderColor: colors.border,
                  color: colors.text
                }}>
                  <Link45 />
                </InputGroup.Text>
                <Form.Control
                  type="url"
                  placeholder="https://drive.google.com/file/d/..."
                  value={formData.archivoUrl}
                  onChange={handleArchivoUrlChange}
                  isInvalid={formData.archivoUrl && !isValidUrl(formData.archivoUrl)}
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.text
                  }}
                />
                <Form.Control.Feedback type="invalid" style={{ color: '#dc3545' }}>
                  Ingresa una URL válida
                </Form.Control.Feedback>
              </InputGroup>
              <div className="mt-2">
                <Alert 
                  variant="info" 
                  className="py-2 mb-0" 
                  style={{ 
                    fontSize: '0.9rem',
                    backgroundColor: isLight ? '#cff4fc' : '#0d4b5c',
                    borderColor: isLight ? '#b6effb' : '#0d4b5c',
                    color: isLight ? '#055160' : '#e3f0f5'
                  }}
                >
                  <InfoCircle className="me-2" size={16} />
                  Sube tu archivo a Google Drive, Dropbox o similar y pega el enlace aquí. 
                  Asegúrate de que tenga permisos de acceso público.
                </Alert>
              </div>
              {formData.archivoUrl && isValidUrl(formData.archivoUrl) && (
                <div className="mt-2">
                  <Badge bg="success" style={{ backgroundColor: '#198754', color: '#ffffff' }}>
                    <CheckCircle className="me-1" /> URL válida
                  </Badge>
                  <small className="ms-2" style={{ color: colors.textMuted }}>
                    {formData.archivoUrl.length > 50 ? formData.archivoUrl.substring(0, 50) + '...' : formData.archivoUrl}
                  </small>
                </div>
              )}
            </Form.Group>
          )}
          
          <Form.Group className="mb-4">
            <Form.Label style={{ color: colors.text }}>
              Comentarios (opcional)
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Agrega comentarios sobre tu entrega..."
              value={formData.comentarios}
              onChange={handleComentariosChange}
              style={{
                backgroundColor: colors.inputBg,
                borderColor: colors.border,
                color: colors.text
              }}
            />
          </Form.Group>
          
          <Alert 
            variant="info" 
            className="mb-4"
            style={{ 
              backgroundColor: isLight ? '#cff4fc' : '#0d4b5c',
              borderColor: isLight ? '#b6effb' : '#0d4b5c',
              color: isLight ? '#055160' : '#e3f0f5'
            }}
          >
            <InfoCircle className="me-2" />
            {formData.esGrupal 
              ? "Recuerda agregar a todos los integrantes del grupo." 
              : "El trabajo se registrará a tu nombre."}
            Una vez entregado, quedará en estado "Entregado" hasta que sea calificado.
          </Alert>
          
          <Button
            variant="primary"
            size="lg"
            onClick={handleEntregar}
            disabled={
              !formData.trabajoNombre || 
              !moduloSeleccionado ||
              !contenidoSeleccionado ||
              (formData.tipoEntrega === 'github' && !formData.githubUrl) ||
              (formData.tipoEntrega === 'archivo' && !formData.archivoUrl) ||
              (formData.esGrupal && formData.alumnos.length === 0)
            }
            style={{ backgroundColor: titleColor, borderColor: titleColor, color: '#ffffff' }}
            className="w-100"
          >
            <Upload className="me-2" /> Confirmar entrega
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
});

// ========== 🐋 FUNCIÓN PARA AGRUPAR POR MÓDULO Y CONTENIDO ==========
const agruparEntregasPorModuloYContenido = (entregas) => {
  if (!entregas || entregas.length === 0) return [];
  
  const moduloMap = new Map();
  
  entregas.forEach(entrega => {
    const moduloId = entrega.modulo_id || 'sin-modulo';
    const moduloNombre = entrega.modulo_nombre || 'Sin módulo asignado';
    const moduloOrden = entrega.modulo_orden || 999;
    const contenidoId = entrega.contenido_id || 'sin-contenido';
    const contenidoNombre = entrega.contenido_nombre || 'Sin contenido específico';
    
    if (!moduloMap.has(moduloId)) {
      moduloMap.set(moduloId, {
        modulo_id: moduloId,
        modulo_nombre: moduloNombre,
        modulo_orden: moduloOrden,
        contenidos: new Map(),
        expandido: moduloId === 'sin-modulo' ? false : true,
        totalEntregas: 0,
        estadisticas: {
          calificados: 0,
          pendientes: 0,
          rechazados: 0,
          revision: 0
        }
      });
    }
    
    const modulo = moduloMap.get(moduloId);
    
    if (!modulo.contenidos.has(contenidoId)) {
      modulo.contenidos.set(contenidoId, {
        contenido_id: contenidoId,
        contenido_nombre: contenidoNombre,
        entregas: [],
        expandido: true,
        estadisticas: {
          calificados: 0,
          pendientes: 0,
          rechazados: 0,
          revision: 0
        }
      });
    }
    
    const contenido = modulo.contenidos.get(contenidoId);
    contenido.entregas.push(entrega);
    modulo.totalEntregas++;
    
    switch(entrega.estado) {
      case 'Calificado':
        modulo.estadisticas.calificados++;
        contenido.estadisticas.calificados++;
        break;
      case 'Entregado':
        modulo.estadisticas.pendientes++;
        contenido.estadisticas.pendientes++;
        break;
      case 'Rechazado':
        modulo.estadisticas.rechazados++;
        contenido.estadisticas.rechazados++;
        break;
      case 'En revisión':
        modulo.estadisticas.revision++;
        contenido.estadisticas.revision++;
        break;
      default:
        break;
    }
  });
  
  return Array.from(moduloMap.values())
    .sort((a, b) => a.modulo_orden - b.modulo_orden)
    .map(modulo => ({
      ...modulo,
      contenidos: Array.from(modulo.contenidos.values())
        .map(contenido => ({
          ...contenido,
          entregas: contenido.entregas.sort((a, b) => 
            new Date(b.fecha_entrega) - new Date(a.fecha_entrega)
          )
        }))
        .sort((a, b) => {
          if (a.contenido_id === 'sin-contenido') return 1;
          if (b.contenido_id === 'sin-contenido') return -1;
          return a.contenido_nombre.localeCompare(b.contenido_nombre);
        })
    }));
};

// ========== 🐋 COMPONENTE ACORDEÓN DE MÓDULOS Y CONTENIDOS ==========
const AcordeonModulosContenidos = ({ entregasAgrupadas, isLight, colors, esProfe, EntregaItemComponent }) => {
  const [modulosExpandidos, setModulosExpandidos] = useState(
    entregasAgrupadas.reduce((acc, modulo) => {
      acc[modulo.modulo_id] = modulo.expandido;
      return acc;
    }, {})
  );

  const [contenidosExpandidos, setContenidosExpandidos] = useState({});

  const toggleModulo = (moduloId) => {
    setModulosExpandidos(prev => ({
      ...prev,
      [moduloId]: !prev[moduloId]
    }));
  };

  const toggleContenido = (moduloId, contenidoId) => {
    const key = `${moduloId}-${contenidoId}`;
    setContenidosExpandidos(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const colorsAcordeon = {
    headerBg: isLight ? '#f8f9fa' : '#2a3042',
    headerHover: isLight ? '#e9ecef' : '#363e54',
    border: colors.border,
    text: colors.text,
    textMuted: colors.textMuted,
    accent: '#EF7F1A',
    contenidoBg: isLight ? '#ffffff' : '#1F2535',
    contenidoHover: isLight ? '#f8f9fa' : '#2a3042'
  };

  if (entregasAgrupadas.length === 0) {
    return (
      <div className="text-center py-5">
        <Briefcase size={48} style={{ color: colors.textMuted }} />
        <p className="mt-3" style={{ color: colors.text }}>
          No hay entregas para mostrar
        </p>
      </div>
    );
  }

  return (
    <div className="acordeon-modulos-contenidos">
      {entregasAgrupadas.map(modulo => (
        <Card 
          key={modulo.modulo_id} 
          className="mb-3"
          style={{ 
            backgroundColor: colors.cardBg,
            borderColor: colors.border,
            overflow: 'hidden'
          }}
        >
          <Card.Header 
            onClick={() => toggleModulo(modulo.modulo_id)}
            style={{ 
              backgroundColor: colorsAcordeon.headerBg,
              borderColor: colors.border,
              color: colors.text,
              cursor: 'pointer',
              padding: '1rem',
              transition: 'background-color 0.2s'
            }}
            className="d-flex justify-content-between align-items-center"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colorsAcordeon.headerHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colorsAcordeon.headerBg}
          >
            <div className="d-flex align-items-center gap-3">
              <Briefcase style={{ color: colorsAcordeon.accent }} size={20} />
              <div>
                <h6 className="mb-0" style={{ color: colors.text, fontWeight: 'bold' }}>
                  {modulo.modulo_nombre}
                </h6>
                <small style={{ color: colors.textMuted }}>
                  {modulo.contenidos.length} {modulo.contenidos.length === 1 ? 'contenido' : 'contenidos'} • {modulo.totalEntregas} {modulo.totalEntregas === 1 ? 'entrega' : 'entregas'}
                </small>
              </div>
            </div>
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex gap-2">
                <Badge style={{ backgroundColor: colors.success, color: '#ffffff' }}>
                  ✅ {modulo.estadisticas.calificados}
                </Badge>
                <Badge style={{ backgroundColor: colors.warning, color: '#ffffff' }}>
                  ⏳ {modulo.estadisticas.pendientes}
                </Badge>
                <Badge style={{ backgroundColor: colors.danger, color: '#ffffff' }}>
                  ❌ {modulo.estadisticas.rechazados}
                </Badge>
                {modulo.estadisticas.revision > 0 && (
                  <Badge style={{ backgroundColor: colors.info, color: '#ffffff' }}>
                    🔍 {modulo.estadisticas.revision}
                  </Badge>
                )}
              </div>
              <ChevronIcon 
                isExpanded={modulosExpandidos[modulo.modulo_id]} 
                color={colors.text}
              />
            </div>
          </Card.Header>

          <Collapse in={modulosExpandidos[modulo.modulo_id]}>
            <div>
              {modulo.contenidos.map(contenido => {
                const contenidoKey = `${modulo.modulo_id}-${contenido.contenido_id}`;
                const isContenidoExpanded = contenidosExpandidos[contenidoKey] !== false;
                
                return (
                  <div key={contenido.contenido_id}>
                    <div 
                      onClick={() => toggleContenido(modulo.modulo_id, contenido.contenido_id)}
                      style={{ 
                        backgroundColor: colorsAcordeon.contenidoBg,
                        borderBottom: `1px solid ${colors.border}`,
                        borderTop: `1px solid ${colors.border}`,
                        color: colors.text,
                        cursor: 'pointer',
                        padding: '0.75rem 1rem 0.75rem 2.5rem',
                        transition: 'background-color 0.2s'
                      }}
                      className="d-flex justify-content-between align-items-center"
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colorsAcordeon.contenidoHover}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colorsAcordeon.contenidoBg}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <FileEarmarkText style={{ color: colorsAcordeon.accent }} size={16} />
                        <div>
                          <span style={{ color: colors.text, fontWeight: '500' }}>
                            {contenido.contenido_nombre}
                          </span>
                          <small className="ms-2" style={{ color: colors.textMuted }}>
                            ({contenido.entregas.length} {contenido.entregas.length === 1 ? 'entrega' : 'entregas'})
                          </small>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        <div className="d-flex gap-1">
                          {contenido.estadisticas.calificados > 0 && (
                            <Badge style={{ backgroundColor: colors.success, color: '#ffffff', fontSize: '0.7rem' }}>
                              {contenido.estadisticas.calificados}
                            </Badge>
                          )}
                          {contenido.estadisticas.pendientes > 0 && (
                            <Badge style={{ backgroundColor: colors.warning, color: '#ffffff', fontSize: '0.7rem' }}>
                              {contenido.estadisticas.pendientes}
                            </Badge>
                          )}
                          {contenido.estadisticas.rechazados > 0 && (
                            <Badge style={{ backgroundColor: colors.danger, color: '#ffffff', fontSize: '0.7rem' }}>
                              {contenido.estadisticas.rechazados}
                            </Badge>
                          )}
                        </div>
                        <ChevronIcon 
                          isExpanded={isContenidoExpanded} 
                          color={colors.textMuted}
                        />
                      </div>
                    </div>

                    <Collapse in={isContenidoExpanded}>
                      <div>
                        {contenido.entregas.length === 0 ? (
                          <div className="text-center py-3" style={{ color: colors.textMuted, backgroundColor: colorsAcordeon.contenidoBg }}>
                            No hay entregas en este contenido
                          </div>
                        ) : (
                          <ListGroup variant="flush">
                            {contenido.entregas.map(entrega => (
                              <EntregaItemComponent 
                                key={entrega.id || entrega._id} 
                                entrega={entrega}
                                isLight={isLight}
                                colors={colors}
                                esProfe={esProfe}
                                titleColor={colors.accent}
                              />
                            ))}
                          </ListGroup>
                        )}
                      </div>
                    </Collapse>
                  </div>
                );
              })}
            </div>
          </Collapse>
        </Card>
      ))}
    </div>
  );
};

// ========== 🐋 COMPONENTE DE ITEM DE ENTREGA MEJORADO CON VER/DESCARGAR ==========
const EntregaItem = ({ entrega, isLight, colors, esProfe, titleColor }) => {
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfList, setPdfList] = useState([]);
  const [selectedPdfIndex, setSelectedPdfIndex] = useState(0);
  
  const fechaEntrega = new Date(entrega.fecha_entrega).toLocaleString('es-ES');
  
  const abrirModalCalificar = () => {
    // Esta función se maneja desde el componente padre
    // Se pasa como prop si es necesario
  };

  const verArchivo = (url, nombre) => {
    if (!url) {
      Swal.fire({
        title: 'Sin archivo',
        text: 'No hay URL disponible para visualizar',
        icon: 'info',
        background: colors.cardBg,
        color: colors.text,
        confirmButtonColor: colors.primary
      });
      return;
    }

    const driveId = extraerIdDeGoogleDrive(url);
    if (driveId) {
      const previewUrl = `https://drive.google.com/file/d/${driveId}/preview`;
      setPdfList([{ url, nombre, tipo: detectarTipoArchivo(url) }]);
      setSelectedPdfIndex(0);
      setShowPdfModal(true);
    } else if (url.includes('github.com')) {
      window.open(url, '_blank');
    } else if (url.match(/\.(pdf)$/i)) {
      window.open(url, '_blank');
    } else {
      window.open(url, '_blank');
    }
  };

  const descargarArchivoHandler = (url, nombre) => {
    descargarArchivo(url, nombre, colors, isLight);
  };

  const EstadoBadge = ({ estado }) => {
    let bgColor, textColor;
    
    switch(estado) {
      case 'Entregado':
        bgColor = isLight ? '#ffc107' : '#f39c12';
        textColor = isLight ? '#212529' : '#ffffff';
        return <Badge style={{ backgroundColor: bgColor, color: textColor }}><Clock className="me-1" size={12} /> Pendiente</Badge>;
      case 'Calificado':
        bgColor = isLight ? '#198754' : '#2ecc71';
        textColor = '#ffffff';
        return <Badge style={{ backgroundColor: bgColor, color: textColor }}><CheckCircle className="me-1" size={12} /> Calificado</Badge>;
      case 'Rechazado':
        bgColor = isLight ? '#dc3545' : '#e74c3c';
        textColor = '#ffffff';
        return <Badge style={{ backgroundColor: bgColor, color: textColor }}><XCircle className="me-1" size={12} /> Rechazado</Badge>;
      case 'Borrador':
        bgColor = isLight ? '#6c757d' : '#95a5a6';
        textColor = '#ffffff';
        return <Badge style={{ backgroundColor: bgColor, color: textColor }}><Clock className="me-1" size={12} /> Borrador</Badge>;
      case 'En revisión':
        bgColor = isLight ? '#0dcaf0' : '#3498db';
        textColor = isLight ? '#212529' : '#ffffff';
        return <Badge style={{ backgroundColor: bgColor, color: textColor }}><Clock className="me-1" size={12} /> En revisión</Badge>;
      case 'Modificado':
        bgColor = isLight ? '#0d6efd' : '#2980b9';
        textColor = '#ffffff';
        return <Badge style={{ backgroundColor: bgColor, color: textColor }}><Clock className="me-1" size={12} /> Modificado</Badge>;
      default:
        return <Badge bg="secondary">{estado}</Badge>;
    }
  };

  return (
    <>
      <ListGroup.Item 
        className="border-bottom"
        style={{ 
          backgroundColor: 'transparent',
          borderColor: colors.border,
          color: colors.text
        }}
      >
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
              <strong style={{ color: colors.text }}>
                {entrega.trabajo_nombre}
              </strong>
              <EstadoBadge estado={entrega.estado} />
              {entrega.es_grupal ? (
                <Badge style={{ backgroundColor: colors.info, color: '#ffffff' }}>
                  <People className="me-1" size={12} /> Grupal
                </Badge>
              ) : (
                <Badge style={{ backgroundColor: colors.textMuted, color: '#ffffff' }}>
                  <Person className="me-1" size={12} /> Individual
                </Badge>
              )}
            </div>
            
            {(entrega.modulo_nombre || entrega.contenido_nombre) && (
              <div className="mb-2">
                <small style={{ color: colors.info }}>
                  <Briefcase className="me-1" size={12} />
                  {entrega.modulo_nombre} → {entrega.contenido_nombre}
                </small>
              </div>
            )}
            
            <div className="mb-1">
              <small style={{ color: colors.textMuted }}>
                <Person className="me-1" size={12} />
                Entregado por: {entrega.alumno?.nombres} {entrega.alumno?.apellido}
              </small>
            </div>
            
            {entrega.es_grupal && entrega.miembros && entrega.miembros.length > 1 && (
              <div className="mb-2">
                <small style={{ color: colors.textMuted }}>
                  <People className="me-1" size={12} />
                  Integrantes: {entrega.miembros.map(m => `${m.nombres} ${m.apellido}`).join(', ')}
                </small>
              </div>
            )}
            
            <div className="d-flex flex-wrap gap-3 mb-2">
              <small style={{ color: colors.textMuted }}>
                <Calendar className="me-1" size={12} />
                {fechaEntrega}
              </small>
              
              <small style={{ color: colors.textMuted }}>
                {getIconoPorTipo(entrega.tipo_entrega === 'github' ? entrega.github_url : entrega.archivo_url)}
                {entrega.tipo_entrega === 'github' ? ' GitHub' : ' Archivo'}
              </small>
              
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
                borderLeft: `3px solid ${entrega.estado === 'Rechazado' ? colors.danger : colors.info}`,
                color: colors.text
              }}>
                <small style={{ color: colors.text }}>
                  <strong>Feedback:</strong> {entrega.feedback}
                </small>
              </div>
            )}
            
            <div className="d-flex gap-2 mt-3 flex-wrap">
              {/* Botón VER - siempre disponible */}
              {entrega.tipo_entrega === 'github' ? (
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => verArchivo(entrega.github_url, `${entrega.trabajo_nombre} - Repositorio`)}
                  style={{ 
                    borderColor: colors.border, 
                    color: colors.text
                  }}
                >
                  <Eye className="me-1" size={14} /> Ver Repositorio
                </Button>
              ) : (
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => verArchivo(entrega.archivo_url, entrega.trabajo_nombre)}
                  style={{ 
                    borderColor: colors.border, 
                    color: colors.text
                  }}
                >
                  <Eye className="me-1" size={14} /> Ver Archivo
                </Button>
              )}

              {/* Botón DESCARGAR - siempre disponible */}
              {entrega.tipo_entrega === 'github' ? (
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => descargarArchivoHandler(entrega.github_url, `${entrega.trabajo_nombre} - Repositorio`)}
                  style={{ 
                    borderColor: colors.border, 
                    color: colors.text
                  }}
                >
                  {getIconoPorTipo(entrega.github_url)}
                  Descargar
                </Button>
              ) : (
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => descargarArchivoHandler(entrega.archivo_url, entrega.trabajo_nombre)}
                  style={{ 
                    borderColor: colors.border, 
                    color: colors.text
                  }}
                >
                  {getIconoPorTipo(entrega.archivo_url)}
                  Descargar
                </Button>
              )}
              
              {/* Botones de calificación para profesores */}
              {esProfe && entrega.estado === 'Entregado' && (
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => {
                    // Aquí se manejaría la apertura del modal de calificación
                    // Esto se maneja desde el componente padre
                  }}
                  style={{ 
                    borderColor: colors.border, 
                    color: colors.text
                  }}
                >
                  <CheckCircle className="me-1" size={14} /> Calificar
                </Button>
              )}
              
              {esProfe && (entrega.estado === 'Calificado' || entrega.estado === 'Rechazado' || entrega.estado === 'En revisión') && (
                <Button
                  variant="outline-warning"
                  size="sm"
                  onClick={() => {
                    // Aquí se manejaría la apertura del modal de calificación
                  }}
                  style={{ 
                    borderColor: colors.border, 
                    color: colors.text
                  }}
                >
                  <Star className="me-1" size={14} /> Modificar
                </Button>
              )}
            </div>
          </div>
        </div>
      </ListGroup.Item>

      {/* Modal de vista previa */}
      <PdfPreviewModal
        show={showPdfModal}
        onHide={() => setShowPdfModal(false)}
        pdfUrl={pdfList[selectedPdfIndex]?.url ? `https://drive.google.com/file/d/${extraerIdDeGoogleDrive(pdfList[selectedPdfIndex].url)}/preview` : ''}
        pdfTitle={pdfList[selectedPdfIndex]?.nombre}
        pdfList={pdfList}
        selectedIndex={selectedPdfIndex}
        onIndexChange={setSelectedPdfIndex}
        isLight={isLight}
        colors={colors}
        titleColor={titleColor}
      />
    </>
  );
};

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
  
  // ========== 🐋 NUEVO ESTADO PARA CONTADOR DE PENDIENTES ==========
  const [pendientesPorCorregir, setPendientesPorCorregir] = useState(0);
  
  // ========== 🐋 ESTADOS PARA CALIFICACIÓN ==========
  const [showModalCalificar, setShowModalCalificar] = useState(false);
  const [entregaSeleccionada, setEntregaSeleccionada] = useState(null);
  
  // ========== 🐋 ESTADOS PARA MÓDULO/CONTENIDO ==========
  const [moduloSeleccionado, setModuloSeleccionado] = useState('');
  const [contenidoSeleccionado, setContenidoSeleccionado] = useState('');
  
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
  
  const colors = {
    text: isLight ? '#212529' : '#e9ecef',
    textMuted: isLight ? '#6c757d' : '#adb5bd',
    border: borderColor,
    bg: bgColor,
    cardBg: isLight ? '#FFFFFF' : '#1A1F2E',
    cardHeaderBg: isLight ? '#FAF3E1' : '#1F2535',
    inputBg: isLight ? '#FFFFFF' : '#2a3042',
    tableHeaderBg: isLight ? '#f8f9fa' : '#2a3042',
    tableRowBg: isLight ? '#ffffff' : '#1F2535',
    success: isLight ? '#198754' : '#2ecc71',
    warning: isLight ? '#ffc107' : '#f39c12',
    danger: isLight ? '#dc3545' : '#e74c3c',
    info: isLight ? '#0dcaf0' : '#3498db',
    accent: '#EF7F1A'
  };
  
  // ========== 🐋 NUEVA FUNCIÓN PARA CALCULAR PENDIENTES ==========
  const calcularPendientesPorCorregir = useCallback((entregasLista) => {
    if (!entregasLista || entregasLista.length === 0) return 0;
    return entregasLista.filter(e => e.estado === 'Entregado').length;
  }, []);
  
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
  
  // ========== 🐋 NUEVO EFECTO PARA ACTUALIZAR CONTADOR ==========
  useEffect(() => {
    if (!esAlumno && entregas.entregas) {
      const pendientes = calcularPendientesPorCorregir(entregas.entregas);
      setPendientesPorCorregir(pendientes);
    }
  }, [entregas.entregas, esAlumno, calcularPendientesPorCorregir]);
  
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
  
  const handleEntregar = useCallback(async () => {
    console.log('🧪 Datos del usuario:', usuario);
    console.log('🧪 Datos de la comisión:', comision);
    
    if (!formData.trabajoNombre.trim()) {
      alert('Ingresa el nombre del trabajo');
      return;
    }
    
    if (!moduloSeleccionado) {
      alert('Selecciona el módulo al que pertenece el trabajo');
      return;
    }
    
    if (!contenidoSeleccionado) {
      alert('Selecciona el contenido específico del trabajo');
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

    const modulo = comision?.progreso_carrera?.find(m => m.modulo_id === moduloSeleccionado);
    const moduloNombre = modulo?.nombre_modulo;
    const moduloOrden = modulo?.orden_modulo;
    const contenidoNombre = modulo?.contenidos?.find(c => c.contenido_id === contenidoSeleccionado)?.nombre_contenido;

    const datosEntrega = {
      comision_id: comision._id || comision.id,
      comision_nombre: comision.nombre,
      modulo_id: moduloSeleccionado,
      modulo_nombre: moduloNombre,
      modulo_orden: moduloOrden,
      contenido_id: contenidoSeleccionado,
      contenido_nombre: contenidoNombre,
      trabajo_nombre: formData.trabajoNombre.trim(),
      tipo_entrega: formData.tipoEntrega,
      es_grupal: formData.esGrupal,
      comentarios: formData.comentarios?.trim() || '',
      ...(formData.tipoEntrega === 'github' 
        ? { github_url: formData.githubUrl.trim() }
        : { archivo_url: formData.archivoUrl.trim() }
      )
    };

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
        setFormData({
          trabajoNombre: '',
          esGrupal: false,
          tipoEntrega: 'github',
          githubUrl: '',
          archivoUrl: '',
          comentarios: '',
          alumnos: []
        });
        setModuloSeleccionado('');
        setContenidoSeleccionado('');
        setNuevoMiembro({ nombre: '', apellido: '' });
        
        await cargarDatos(new AbortController().signal);
        setActiveTab('historial');
      }
    } catch (error) {
      console.error('💥 Error al guardar entrega:', error);
    }
  }, [formData, comision, usuario, navigate, cargarDatos, moduloSeleccionado, contenidoSeleccionado]);

  const handleCalificar = useCallback(async (entregaId, datosCalificacion) => {
    try {
      const resultado = await CalificarEntrega(entregaId, datosCalificacion, navigate);
      
      if (resultado?.success || resultado?.ok) {
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
        const matchesModulo = e.modulo_nombre?.toLowerCase().includes(term);
        const matchesContenido = e.contenido_nombre?.toLowerCase().includes(term);
        
        return matchesTrabajo || matchesAlumno || matchesMiembros || matchesModulo || matchesContenido;
      }
      
      return true;
    });
  }, [filtroEstado, searchTerm]);
  
  // ========== 🐋 VISTA DE HISTORIAL (PROFESOR) MODIFICADA CON TARJETA DE PENDIENTES ==========
  const VistaHistorialProfesor = () => {
    if (entregas.isLoading) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" variant={isLight ? 'primary' : 'light'} />
          <p className="mt-3" style={{ color: colors.textMuted }}>Cargando entregas...</p>
        </div>
      );
    }
    
    if (entregas.error) {
      return (
        <Alert 
          variant="danger" 
          className="text-center"
          style={{ 
            backgroundColor: isLight ? '#f8d7da' : '#842029',
            borderColor: isLight ? '#f5c6cb' : '#842029',
            color: isLight ? '#721c24' : '#f8d7da'
          }}
        >
          <ExclamationTriangle size={24} className="mb-2" />
          <p>{entregas.error}</p>
        </Alert>
      );
    }
    
    const entregasFiltradas = filtrarEntregasLocalmente(entregas.entregas);
    const entregasAgrupadas = agruparEntregasPorModuloYContenido(entregasFiltradas);

    return (
      <>
        {/* 🆕 TARJETA DE PENDIENTES PARA PROFESOR */}
        {pendientesPorCorregir > 0 && (
          <Card className="mb-4" style={{ 
            backgroundColor: isLight ? '#fff3cd' : '#856404',
            borderColor: colors.warning,
            borderLeft: `4px solid #dc3545`
          }}>
            <Card.Body className="d-flex align-items-center gap-3">
              <div style={{ 
                backgroundColor: '#dc3545', 
                borderRadius: '50%', 
                width: '40px', 
                height: '40px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}>
                {pendientesPorCorregir}
              </div>
              <div>
                <h6 className="mb-1" style={{ color: isLight ? '#856404' : '#ffffff' }}>
                  ¡Tienes trabajos pendientes por corregir!
                </h6>
                <p className="mb-0" style={{ color: isLight ? '#856404' : '#ffffff', opacity: 0.9 }}>
                  Hay {pendientesPorCorregir} {pendientesPorCorregir === 1 ? 'entrega' : 'entregas'} en estado "Entregado" esperando tu revisión.
                </p>
              </div>
              <Button
                variant={isLight ? 'warning' : 'outline-light'}
                size="sm"
                className="ms-auto"
                onClick={() => {
                  setFiltroEstado('Entregado');
                  setMostrarFiltros(true);
                }}
                style={{ 
                  backgroundColor: isLight ? '#ffc107' : 'transparent',
                  borderColor: isLight ? '#ffc107' : '#ffffff',
                  color: isLight ? '#212529' : '#ffffff'
                }}
              >
                Ver pendientes
              </Button>
            </Card.Body>
          </Card>
        )}

        <Card className="mb-4" style={{ 
          backgroundColor: colors.cardBg,
          borderColor: colors.border
        }}>
          <Card.Body>
            <Button
              variant="link"
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              style={{ 
                color: colors.text, 
                textDecoration: 'none', 
                padding: 0 
              }}
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
                        borderColor: colors.border,
                        color: colors.text
                      }}>
                        <Search />
                      </InputGroup.Text>
                      <Form.Control
                        placeholder="Buscar por trabajo, alumno, módulo o contenido..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                          backgroundColor: colors.inputBg,
                          borderColor: colors.border,
                          color: colors.text
                        }}
                      />
                    </InputGroup>
                  </Col>
                  <Col md={4}>
                    <Form.Select 
                      value={filtroEstado}
                      onChange={(e) => setFiltroEstado(e.target.value)}
                      style={{
                        backgroundColor: colors.inputBg,
                        borderColor: colors.border,
                        color: colors.text
                      }}
                    >
                      <option value="todos" style={{ color: '#212529' }}>📋 Todos los estados</option>
                      <option value="Entregado" style={{ color: '#212529' }}>⏳ Pendientes</option>
                      <option value="Calificado" style={{ color: '#212529' }}>✅ Calificados</option>
                      <option value="Rechazado" style={{ color: '#212529' }}>❌ Rechazados</option>
                      <option value="En revisión" style={{ color: '#212529' }}>🔍 En revisión</option>
                    </Form.Select>
                  </Col>
                </Row>
              </div>
            </Collapse>
          </Card.Body>
        </Card>
        
        <Card style={{ 
          backgroundColor: colors.cardBg,
          borderColor: colors.border
        }}>
          <Card.Header style={{ 
            backgroundColor: colors.cardHeaderBg,
            borderColor: colors.border,
            color: colors.text
          }}>
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0" style={{ color: colors.text }}>
                📋 Entregas agrupadas por módulo y contenido
              </h6>
              <div className="d-flex gap-2">
                <Badge style={{ backgroundColor: colors.success, color: '#ffffff' }}>
                  📚 {entregasAgrupadas.length} módulos
                </Badge>
                <Badge style={{ backgroundColor: colors.info, color: '#ffffff' }}>
                  📄 {entregas.paginacion.total} total
                </Badge>
              </div>
            </div>
          </Card.Header>
          <Card.Body>
            <AcordeonModulosContenidos
              entregasAgrupadas={entregasAgrupadas}
              isLight={isLight}
              colors={colors}
              esProfe={esProfe}
              EntregaItemComponent={EntregaItem}
            />
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
          <p className="mt-3" style={{ color: colors.textMuted }}>Cargando tus entregas...</p>
        </div>
      );
    }
    
    if (misEntregas.error) {
      return (
        <Alert 
          variant="danger" 
          className="text-center"
          style={{ 
            backgroundColor: isLight ? '#f8d7da' : '#842029',
            borderColor: isLight ? '#f5c6cb' : '#842029',
            color: isLight ? '#721c24' : '#f8d7da'
          }}
        >
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
    const entregasAgrupadas = agruparEntregasPorModuloYContenido(entregasFiltradas);

    return (
      <Card style={{ 
        backgroundColor: colors.cardBg,
        borderColor: colors.border
      }}>
        <Card.Header style={{ 
          backgroundColor: colors.cardHeaderBg,
          borderColor: colors.border,
          color: colors.text
        }}>
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0" style={{ color: colors.text }}>
              📋 Mis entregas por módulo y contenido
            </h6>
            <div className="d-flex gap-2">
              <Badge style={{ backgroundColor: colors.success, color: '#ffffff' }}>
                📚 {entregasAgrupadas.length} módulos
              </Badge>
              <Badge style={{ backgroundColor: colors.info, color: '#ffffff' }}>
                📄 {entregasLista.length} entregas
              </Badge>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="mb-3">
            <InputGroup>
              <InputGroup.Text style={{ 
                backgroundColor: isLight ? '#F8F9FA' : '#2a3042',
                borderColor: colors.border,
                color: colors.text
              }}>
                <Search />
              </InputGroup.Text>
              <Form.Control
                placeholder="Buscar por trabajo, módulo o contenido..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  backgroundColor: colors.inputBg,
                  borderColor: colors.border,
                  color: colors.text
                }}
              />
            </InputGroup>
          </div>

          {entregasLista.length === 0 ? (
            <div className="text-center py-5">
              <Briefcase size={48} style={{ color: colors.textMuted }} />
              <p className="mt-3" style={{ color: colors.text }}>
                No has realizado entregas en esta comisión
              </p>
              <Button
                variant="primary"
                onClick={() => setActiveTab('entregar')}
                style={{ backgroundColor: titleColor, borderColor: titleColor, color: '#ffffff' }}
              >
                <Upload className="me-2" /> Entregar ahora
              </Button>
            </div>
          ) : (
            <AcordeonModulosContenidos
              entregasAgrupadas={entregasAgrupadas}
              isLight={isLight}
              colors={colors}
              esProfe={esProfe}
              EntregaItemComponent={EntregaItem}
            />
          )}
        </Card.Body>
      </Card>
    );
  };
  
  // ========== 🐋 RENDERIZADO PRINCIPAL MODIFICADO CON CONTADOR EN TABS Y HEADER ==========
  return (
    <div style={{ backgroundColor: colors.bg, minHeight: '100vh', color: colors.text }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1" style={{ color: colors.text }}>
            <Briefcase className="me-2" style={{ color: titleColor }} />
            Trabajos Prácticos
            {/* 🆕 BADGE DE PENDIENTES EN EL HEADER */}
            {!esAlumno && pendientesPorCorregir > 0 && (
              <Badge 
                className="ms-3"
                style={{ 
                  backgroundColor: '#dc3545',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  padding: '0.5rem 1rem',
                  animation: 'pulse 2s infinite'
                }}
              >
                🔔 {pendientesPorCorregir} trabajo{pendientesPorCorregir !== 1 ? 's' : ''} por corregir
              </Badge>
            )}
          </h4>
          <p style={{ color: colors.textMuted, marginBottom: 0 }}>
            {comision.nombre} - {comision.carrera_info?.nombre || 'Carrera'}
          </p>
        </div>
        
        <Badge 
          style={{ 
            backgroundColor: esAlumno ? colors.info : colors.success,
            color: '#ffffff',
            padding: '0.5rem 1rem',
            fontSize: '0.9rem'
          }}
        >
          {usuario?.rol || 'usuario'}
        </Badge>
      </div>
      
      <Nav variant="tabs" className="mb-4" style={{ borderColor: colors.border }}>
        <Nav.Item>
          <Nav.Link 
            eventKey="entregar"
            active={activeTab === 'entregar'}
            onClick={() => setActiveTab('entregar')}
            style={{ 
              color: activeTab === 'entregar' ? titleColor : colors.text,
              borderColor: colors.border,
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
              color: activeTab === 'historial' ? titleColor : colors.text,
              borderColor: colors.border,
              backgroundColor: activeTab === 'historial' ? (isLight ? '#FFFFFF' : '#1F2535') : 'transparent',
              position: 'relative'
            }}
          >
            <Eye className="me-2" /> Historial de Entregas
            {/* 🆕 BADGE DE PENDIENTES EN EL TAB (SOLO PARA PROFESOR) */}
            {!esAlumno && pendientesPorCorregir > 0 && (
              <>
                <Badge 
                  bg="danger" 
                  className="ms-2"
                  style={{ 
                    backgroundColor: '#dc3545',
                    color: '#ffffff',
                    animation: 'pulse 2s infinite',
                    position: 'relative',
                    top: '-1px'
                  }}
                >
                  {pendientesPorCorregir} pendiente{pendientesPorCorregir !== 1 ? 's' : ''}
                </Badge>
                <style>
                  {`
                    @keyframes pulse {
                      0% {
                        box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7);
                      }
                      70% {
                        box-shadow: 0 0 0 10px rgba(220, 53, 69, 0);
                      }
                      100% {
                        box-shadow: 0 0 0 0 rgba(220, 53, 69, 0);
                      }
                    }
                  `}
                </style>
              </>
            )}
            {/* 🆕 BADGE DE TOTAL (CUANDO NO HAY PENDIENTES O PARA ALUMNO) */}
            {!esAlumno && pendientesPorCorregir === 0 && (
              <Badge 
                bg="secondary" 
                className="ms-2"
                style={{ 
                  backgroundColor: colors.textMuted,
                  color: '#ffffff'
                }}
              >
                {entregas.paginacion.total} total
              </Badge>
            )}
            {esAlumno && (
              <Badge 
                bg="secondary" 
                className="ms-2"
                style={{ 
                  backgroundColor: colors.textMuted,
                  color: '#ffffff'
                }}
              >
                {misEntregas.total_entregas}
              </Badge>
            )}
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
            borderColor={colors.border}
            titleColor={titleColor}
            comision={comision}
            moduloSeleccionado={moduloSeleccionado}
            setModuloSeleccionado={setModuloSeleccionado}
            contenidoSeleccionado={contenidoSeleccionado}
            setContenidoSeleccionado={setContenidoSeleccionado}
          />
        )}
        
        {activeTab === 'historial' && (
          esAlumno ? <VistaHistorialAlumno /> : <VistaHistorialProfesor />
        )}
      </div>

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
        borderColor={colors.border}
        titleColor={titleColor}
      />
    </div>
  );
};

export default PanelTrabajos;