import React, { useEffect, useState } from 'react';
import { Button, Table, Badge, Spinner, Alert, Form, Row, Col, Accordion, Card, ListGroup, Modal, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  ChevronDown, ChevronUp, Eye, Pencil, Plus,
  ToggleOn, ToggleOff, FileEarmarkPdf, EyeFill,
  Book, JournalBookmarkFill, PeopleFill, FileText,
  Clock, Tag, Calendar
} from 'react-bootstrap-icons';

import { CargarCarreras } from '../Helper/CargarCarreras';
import ModalCrearCarrera from './Subcomponentes/ModalCrearCarrera';
import ModalEditarCarrera from './Subcomponentes/ModalEditarCarrera';

export const GestionCarreras = ({ theme }) => {
  const navigate = useNavigate();

  // Estados
  const [carreras, setCarreras] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshData, setRefreshData] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCarrera, setSelectedCarrera] = useState(null);
  const [expandedCarrera, setExpandedCarrera] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para PDFs
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfList, setPdfList] = useState([]);
  const [selectedPdfIndex, setSelectedPdfIndex] = useState(0);

  // Clases según tema
  const cardClass = theme === 'lights' ? 'card-light' : 'card-dark';
  const textClass = theme === 'lights' ? 'text-dark' : 'text-light';
  const borderColor = theme === 'lights' ? '#E0D8C5' : '#1F2535';
  const titleColor = '#EF7F1A';

  // ========== FUNCIONES PARA PDFs ==========

  // Función para ver PDF individual
  const verPdfIndividual = (url, nombre) => {
    if (!url) {
      Swal.fire({
        title: 'Sin URL',
        text: 'No hay archivo disponible.',
        icon: 'info',
        background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
        color: theme === 'lights' ? '#353432' : '#ebe5e5'
      });
      return;
    }

    const driveId = extraerIdDeGoogleDrive(url);
    const previewUrl = driveId ? `https://drive.google.com/file/d/${driveId}/preview` : url;

    setPdfList([{ url, nombre, tipo: 'individual' }]);
    setSelectedPdfIndex(0);
    setPdfUrl(previewUrl);
    setPdfTitle(nombre);
    setShowPdfModal(true);
  };

  // Función para ver múltiples PDFs (para clase con varias diapositivas)
  const verMultiplesPdfs = (urls, nombreBase, tipo) => {
    if (!urls || urls.length === 0) {
      Swal.fire({
        title: 'Sin PDFs',
        text: 'No hay diapositivas disponibles.',
        icon: 'info',
        background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
        color: theme === 'lights' ? '#353432' : '#ebe5e5'
      });
      return;
    }

    const pdfs = urls.map((url, idx) => ({
      url,
      nombre: `${nombreBase} - Diapositiva ${idx + 1}`,
      tipo
    }));

    setPdfList(pdfs);
    setSelectedPdfIndex(0);
    const driveId = extraerIdDeGoogleDrive(pdfs[0].url);
    setPdfUrl(driveId ? `https://drive.google.com/file/d/${driveId}/preview` : pdfs[0].url);
    setPdfTitle(pdfs[0].nombre);
    setShowPdfModal(true);
  };

  // Función para extraer ID de Google Drive
  const extraerIdDeGoogleDrive = (url) => {
    if (!url) return null;
    try {
      const patterns = [
        /\/file\/d\/([a-zA-Z0-9_-]+)/,
        /\/presentation\/d\/([a-zA-Z0-9_-]+)/,
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

  // Resto de funciones para PDFs
  const handleSelectPdf = (index) => {
    if (index < 0 || index >= pdfList.length) return;
    setSelectedPdfIndex(index);
    const selectedPdf = pdfList[index];
    const driveId = extraerIdDeGoogleDrive(selectedPdf.url);
    setPdfUrl(driveId ? `https://drive.google.com/file/d/${driveId}/preview` : selectedPdf.url);
    setPdfTitle(selectedPdf.nombre);
  };

  const handleDownloadPdf = () => {
    if (pdfList.length === 0 || selectedPdfIndex >= pdfList.length) return;
    const currentPdf = pdfList[selectedPdfIndex];
    const driveId = extraerIdDeGoogleDrive(currentPdf.url);
    if (driveId) {
      window.open(`https://drive.google.com/uc?id=${driveId}&export=download`, '_blank');
    } else {
      window.open(currentPdf.url, '_blank');
    }
  };

  const handleClosePdfModal = () => {
    setShowPdfModal(false);
    setPdfUrl('');
    setPdfTitle('');
    setPdfList([]);
    setSelectedPdfIndex(0);
  };

  // ========== COMPONENTE PARA MOSTRAR RECURSOS DEL CONTENIDO ==========
  // ========== COMPONENTE PARA MOSTRAR RECURSOS DEL CONTENIDO ==========
  const RecursosContenido = ({ contenido }) => {
    return (
      <div className="mt-3">
        <ListGroup>
          {/* SECCIÓN DE CLASE */}
          {contenido.clase?.diapositivas && contenido.clase.diapositivas.length > 0 && (
            <ListGroup.Item className={`${cardClass} ${textClass}`} style={{ borderColor: borderColor }}>
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <Book className="me-2" style={{ color: '#0d6efd' }} />
                  <div>
                    <strong>Clase</strong>
                    <div className="small">
                      {contenido.clase.diapositivas.length} diapositiva{contenido.clase.diapositivas.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => verMultiplesPdfs(contenido.clase.diapositivas, contenido.nombre, 'clase')}
                  style={{ borderColor: borderColor }}
                >
                  <EyeFill className="me-1" /> Ver
                </Button>
              </div>
            </ListGroup.Item>
          )}

          {/* SECCIÓN DE AUTOAPRENDIZAJE */}
          {contenido.autoaprendizaje?.guia_estudio && (
            <ListGroup.Item className={`${cardClass} ${textClass}`} style={{ borderColor: borderColor }}>
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <JournalBookmarkFill className="me-2" style={{ color: '#198754' }} />
                  <div>
                    <strong>Guía de Estudio</strong>
                    <div className="small">Autoaprendizaje</div>
                  </div>
                </div>
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => verPdfIndividual(contenido.autoaprendizaje.guia_estudio, `${contenido.nombre} - Guía de Estudio`)}
                  style={{ borderColor: borderColor }}
                >
                  <EyeFill className="me-1" /> Ver
                </Button>
              </div>
            </ListGroup.Item>
          )}

          {/* SECCIÓN DE TUTORÍA */}
          {contenido.tutoria && (
            <>
              {/* Diapositivas de tutoría */}
              {contenido.tutoria.diapositivas && contenido.tutoria.diapositivas.length > 0 && (
                <ListGroup.Item className={`${cardClass} ${textClass}`} style={{ borderColor: borderColor }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <PeopleFill className="me-2" style={{ color: '#6f42c1' }} />
                      <div>
                        <strong>Tutoría - Diapositivas</strong>
                        <div className="small">
                          {contenido.tutoria.diapositivas.length} diapositiva{contenido.tutoria.diapositivas.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={() => verMultiplesPdfs(contenido.tutoria.diapositivas, `${contenido.nombre} - Tutoría`, 'tutoria')}
                      style={{ borderColor: borderColor }}
                    >
                      <EyeFill className="me-1" /> Ver
                    </Button>
                  </div>
                </ListGroup.Item>
              )}

              {/* Material de apoyo de tutoría */}
              {contenido.tutoria.apoyo && (
                <ListGroup.Item className={`${cardClass} ${textClass}`} style={{ borderColor: borderColor }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <FileEarmarkPdf className="me-2" style={{ color: '#fd7e14' }} />
                      <div>
                        <strong>Material de Apoyo</strong>
                        <div className="small">Recursos adicionales</div>
                      </div>
                    </div>
                    <Button
                      variant="outline-warning"
                      size="sm"
                      onClick={() => verPdfIndividual(contenido.tutoria.apoyo, `${contenido.nombre} - Material de Apoyo`)}
                      style={{ borderColor: borderColor }}
                    >
                      <EyeFill className="me-1" /> Ver
                    </Button>
                  </div>
                </ListGroup.Item>
              )}

              {/* Proyectos de tutoría - ACTUALIZADO */}
              {contenido.tutoria.proyectos && contenido.tutoria.proyectos.length > 0 && (
                <ListGroup.Item className={`${cardClass} ${textClass}`} style={{ borderColor: borderColor }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex align-items-center">
                      <FileText className="me-2" style={{ color: '#20c997' }} />
                      <div>
                        <strong>Proyectos</strong>
                        <div className="small">
                          {contenido.tutoria.proyectos.length} proyecto{contenido.tutoria.proyectos.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </div>

                  {contenido.tutoria.proyectos.map((proyecto, idx) => (
                    <div key={idx} className="mt-2 p-2 rounded" style={{
                      backgroundColor: theme === 'lights' ? '#f8f9fa' : '#2a3042',
                      border: `1px solid ${borderColor}`
                    }}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <strong className="small">Tarea {idx + 1}:</strong>
                          <p className="small mb-2" style={{
                            color: theme === 'lights' ? '#6c757d' : '#b0b0b0'
                          }}>
                            {proyecto.tarea}
                          </p>
                        </div>
                        {/* BOTÓN PARA VER LA TAREA COMO PDF */}
                        {proyecto.tarea && (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => verPdfIndividual(proyecto.tarea, `${contenido.nombre} - Tarea Proyecto ${idx + 1}`)}
                            style={{ borderColor: borderColor }}
                            title="Ver Tarea"
                          >
                            <EyeFill size={12} className="me-1" /> Ver Tarea
                          </Button>
                        )}
                      </div>
                      {proyecto.solucion && (
                        <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                          <span className="small">Solución:</span>
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => verPdfIndividual(proyecto.solucion, `${contenido.nombre} - Solución Proyecto ${idx + 1}`)}
                            style={{ borderColor: borderColor }}
                            title="Ver Solución"
                          >
                            <EyeFill size={12} className="me-1" /> Ver Solución
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </ListGroup.Item>
              )}
            </>
          )}
        </ListGroup>

        {/* Mensaje si no hay recursos */}
        {!contenido.clase?.diapositivas?.length &&
          !contenido.autoaprendizaje?.guia_estudio &&
          !contenido.tutoria && (
            <div className="text-center py-2">
              <small className="text-muted">Sin recursos asignados</small>
            </div>
          )}
      </div>
    );
  };

  // useEffect para cargar carreras
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);
        await CargarCarreras(setCarreras, navigate, { signal });
      } catch (error) {
        if (error.name !== 'AbortError') {
          setError("Error al cargar las carreras. Contacte soporte.");
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

  // ========== FUNCIÓN PARA CAMBIAR ESTADO DE CARRERA ==========
  const handleChangeEstadoCarrera = (carrera) => {
    const action = carrera.estado === 'Activo' ? 'desactivar' : 'activar';
    const nuevoEstado = carrera.estado === 'Activo' ? 'Inactivo' : 'Activo';

    Swal.fire({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} carrera?`,
      text: `La carrera "${carrera.nombre}" pasará a estar ${nuevoEstado.toLowerCase()}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: carrera.estado === 'Activo' ? '#d33' : '#3085d6',
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Sí, ${action}`,
      cancelButtonText: 'Cancelar',
      background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
      color: theme === 'lights' ? '#353432' : '#ebe5e5'
    }).then((result) => {
      if (result.isConfirmed) {
        setCarreras(prevCarreras =>
          prevCarreras.map(c =>
            c._id === carrera._id ? { ...c, estado: nuevoEstado } : c
          )
        );

        Swal.fire({
          title: 'Éxito',
          text: `Carrera ${action}da correctamente`,
          icon: 'success',
          background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
          color: theme === 'lights' ? '#353432' : '#ebe5e5'
        });
      }
    });
  };

  // Loading
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <Spinner animation="border" variant={theme === 'lights' ? 'primary' : 'light'} />
        <span className={`ms-2 ${textClass}`}>Cargando carreras...</span>
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

  // Handlers para modales
  const handleShowEditModal = (carrera) => {
    setSelectedCarrera(carrera);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedCarrera(null);
  };

  const handleShowCreateModal = () => setShowCreateModal(true);
  const handleCloseCreateModal = () => setShowCreateModal(false);

  const toggleCarrera = (id) => {
    setExpandedCarrera(expandedCarrera === id ? null : id);
  };

  // Badges
  const getEstadoBadge = (estado) => {
    const colors = {
      'Activo': 'success',
      'Inactivo': 'secondary',
      'En desarrollo': 'warning',
      'Archivado': 'dark'
    };
    return <Badge bg={colors[estado] || 'secondary'}>{estado}</Badge>;
  };

  const getModalidadBadge = (modalidad) => {
    const colors = {
      'part-time': 'info',
      'full-time': 'primary',
      'grabado': 'secondary'
    };
    const textos = {
      'part-time': 'Part-Time',
      'full-time': 'Full-Time',
      'grabado': 'Grabado'
    };
    return <Badge bg={colors[modalidad] || 'secondary'}>{textos[modalidad] || modalidad}</Badge>;
  };

  // Buscador
  const filteredCarreras = (carreras || []).filter(carrera => {
    if (!carrera) return false;
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (carrera.nombre && carrera.nombre.toLowerCase().includes(searchLower)) ||
      (carrera.descripcion && carrera.descripcion.toLowerCase().includes(searchLower)) ||
      (carrera.modalidad && carrera.modalidad.toLowerCase().includes(searchLower)) ||
      (carrera.estado && carrera.estado.toLowerCase().includes(searchLower)) ||
      (carrera.titulo_certificacion && carrera.titulo_certificacion.toLowerCase().includes(searchLower)) ||
      (carrera.version && carrera.version.toLowerCase().includes(searchLower))
    );
  });

  // ========== COMPONENTE DE DETALLE DE CARRERA ==========
  const CarreraDetalle = ({ carrera }) => {
    // Estado para controlar qué módulos están expandidos
    const [modulosExpandidos, setModulosExpandidos] = useState({});

    const toggleModulo = (moduloId) => {
      setModulosExpandidos(prev => ({
        ...prev,
        [moduloId]: !prev[moduloId]
      }));
    };

    return (
      <div className="p-3">
        <Row>
          <Col md={6}>
            {/* INFORMACIÓN BÁSICA */}
            <Card className={`mb-3 ${cardClass}`} style={{ borderColor: borderColor }}>
              <Card.Header style={{ backgroundColor: theme === 'lights' ? '#FAF3E1' : '#1F2535' }}>
                <strong>📋 Información Básica</strong>
              </Card.Header>
              <Card.Body className={textClass}>
                <div className="mb-2">
                  <strong>Nombre:</strong>
                  <p className="mt-1">{carrera.nombre}</p>
                </div>
                <div className="mb-2">
                  <strong>Descripción:</strong>
                  <p className="mt-1">{carrera.descripcion}</p>
                </div>
                <Row>
                  <Col md={6}>
                    <strong>Duración:</strong>
                    <p className="mt-1">{carrera.duracion}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Clases/semana:</strong>
                    <p className="mt-1">{carrera.clases_por_semana}</p>
                  </Col>
                </Row>
                <div className="mb-2">
                  <strong>Duración clase:</strong>
                  <p className="mt-1">{carrera.duracion_de_cada_clase}</p>
                </div>
              </Card.Body>
            </Card>

            {/* CERTIFICACIÓN */}
            <Card className={`mb-3 ${cardClass}`} style={{ borderColor: borderColor }}>
              <Card.Header style={{ backgroundColor: theme === 'lights' ? '#FAF3E1' : '#1F2535' }}>
                <strong>🏆 Certificación</strong>
              </Card.Header>
              <Card.Body className={textClass}>
                <p className="mb-0">{carrera.titulo_certificacion}</p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            {/* REQUISITOS */}
            <Card className={`mb-3 ${cardClass}`} style={{ borderColor: borderColor }}>
              <Card.Header style={{ backgroundColor: theme === 'lights' ? '#FAF3E1' : '#1F2535' }}>
                <strong>📝 Requisitos</strong>
              </Card.Header>
              <Card.Body className={textClass}>
                {carrera.requisitos && carrera.requisitos.length > 0 ? (
                  <ul className="list-unstyled mb-0">
                    {carrera.requisitos.map((req, idx) => (
                      <li key={idx} className="d-flex align-items-start mb-2">
                        <div className="me-2" style={{ color: titleColor }}>•</div>
                        {req}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mb-0 text-muted">No se especificaron requisitos</p>
                )}
              </Card.Body>
            </Card>

            {/* ESTADO, MODALIDAD Y VERSIÓN */}
            <Card className={`mb-3 ${cardClass}`} style={{ borderColor: borderColor }}>
              <Card.Header style={{ backgroundColor: theme === 'lights' ? '#FAF3E1' : '#1F2535' }}>
                <strong>⚙️ Detalles</strong>
              </Card.Header>
              <Card.Body className={textClass}>
                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong>Modalidad:</strong>
                      <div className="mt-1">{getModalidadBadge(carrera.modalidad)}</div>
                    </div>
                    <div className="mb-3">
                      <strong>Estado:</strong>
                      <div className="mt-1">{getEstadoBadge(carrera.estado)}</div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong>Versión:</strong>
                      <div className="mt-1">
                        <Badge bg="info">
                          <Tag size={12} className="me-1" />
                          v{carrera.version || '1.0.0'}
                        </Badge>
                      </div>
                    </div>
                    <div className="mb-3">
                      <strong>Fecha versión:</strong>
                      <div className="mt-1">
                        <Badge bg="secondary">
                          <Calendar size={12} className="me-1" />
                          {carrera.fecha_version ? new Date(carrera.fecha_version).toLocaleDateString() : 'N/A'}
                        </Badge>
                      </div>
                    </div>
                  </Col>
                </Row>
                <div className="mt-3 pt-2 border-top">
                  <strong>Precio:</strong>
                  <p className="mt-1 fs-5" style={{ color: titleColor }}>{carrera.precio}</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* MÓDULOS Y CONTENIDOS - SIN ESTADOS */}
        <Card className={`mb-3 ${cardClass}`} style={{ borderColor: borderColor }}>
          <Card.Header className="d-flex align-items-center justify-content-between" style={{ backgroundColor: theme === 'lights' ? '#FAF3E1' : '#1F2535' }}>
            <div>
              <strong>📚 Módulos ({carrera.modulos?.length || 0})</strong>
            </div>
            <div className="d-flex gap-2">
              <Badge bg="info">
                {carrera.modulos?.reduce((total, mod) => total + (mod.contenidos?.length || 0), 0)} contenidos
              </Badge>
              <Badge bg="secondary">
                <Clock size={12} className="me-1" />
                {carrera.duracion}
              </Badge>
            </div>
          </Card.Header>
          <Card.Body className={textClass}>
            {carrera.modulos && carrera.modulos.length > 0 ? (
              <Accordion
                flush
                bsPrefix={`accordion ${theme === 'dark' ? 'accordion-dark' : ''}`}
              >
                {carrera.modulos.sort((a, b) => a.orden - b.orden).map((modulo, idx) => (
                  <Accordion.Item
                    key={modulo._id || idx}
                    eventKey={modulo._id || idx}
                    className="mb-3"
                    style={{
                      borderColor: borderColor,
                      backgroundColor: theme === 'lights' ? '#FFFFFF' : '#1F2535'
                    }}
                  >
                    <Accordion.Header>
                      <div className="d-flex align-items-center justify-content-between w-100">
                        <div>
                          <strong>{modulo.orden}. {modulo.nombre}</strong>
                          <Badge bg="info" className="ms-2">
                            {modulo.contenidos?.length || 0} contenidos
                          </Badge>
                          {/* ❌ ELIMINADO: Badge de estado del módulo */}
                        </div>
                      </div>
                    </Accordion.Header>
                    <Accordion.Body style={{
                      backgroundColor: theme === 'lights' ? '#f8f9fa' : '#2a3042',
                      color: textClass.includes('dark') ? '#ebe5e5' : '#353432'
                    }}>
                      {modulo.descripcion && (
                        <div className="mb-3">
                          <strong>Descripción:</strong>
                          <p className="mt-1">{modulo.descripcion}</p>
                        </div>
                      )}

                      {modulo.contenidos && modulo.contenidos.length > 0 ? (
                        <div className="row">
                          {modulo.contenidos.map((contenido, cIdx) => (
                            <div key={contenido._id || cIdx} className="col-12 mb-3">
                              <Card style={{
                                backgroundColor: theme === 'lights' ? '#FFFFFF' : '#1F2535',
                                borderColor: borderColor
                                // ❌ ELIMINADO: opacity condicional basada en estado
                              }}>
                                <Card.Body>
                                  <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div>
                                      <strong>{contenido.nombre}</strong>
                                      {/* ❌ ELIMINADO: Badge de estado del contenido */}
                                    </div>
                                  </div>

                                  {/* Mostrar recursos del contenido */}
                                  <RecursosContenido contenido={contenido} />
                                </Card.Body>
                              </Card>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-muted">No hay contenidos cargados</p>
                        </div>
                      )}
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted">No hay módulos cargados</p>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    );
  };

  // ========== MODAL PARA VISUALIZAR PDF ==========
  const PdfModal = () => (
    <Modal
      show={showPdfModal}
      onHide={handleClosePdfModal}
      size="xl"
      fullscreen="lg-down"
      centered
    >
      <Modal.Header
        closeButton
        className={`${cardClass} ${textClass}`}
        style={{ borderBottomColor: borderColor }}
      >
        <Modal.Title style={{ color: titleColor }}>
          <FileEarmarkPdf className="me-2" />
          {pdfTitle || 'Vista previa del PDF'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className={`${cardClass} p-0`} style={{ minHeight: '60vh' }}>
        {/* Selector de PDFs */}
        {pdfList.length > 1 && (
          <div
            className="p-3"
            style={{
              borderBottom: `1px solid ${borderColor}`,
              backgroundColor: theme === 'lights' ? '#f8f9fa' : '#2a3042'
            }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <span className={textClass}>
                <strong>PDFs disponibles:</strong> {pdfList.length} archivo(s)
              </span>
              <div className="d-flex align-items-center gap-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => handleSelectPdf(selectedPdfIndex - 1)}
                  disabled={selectedPdfIndex === 0}
                  style={{ borderColor: borderColor }}
                >
                  ← Anterior
                </Button>
                <Dropdown>
                  <Dropdown.Toggle
                    variant="info"
                    size="sm"
                    id="dropdown-pdfs"
                    style={{
                      backgroundColor: theme === 'lights' ? '#0dcaf0' : '#20c997',
                      borderColor: borderColor
                    }}
                  >
                    {pdfList[selectedPdfIndex]?.nombre || 'Seleccionar PDF'}
                  </Dropdown.Toggle>

                  <Dropdown.Menu
                    className={cardClass}
                    style={{
                      maxHeight: '300px',
                      overflowY: 'auto'
                    }}
                  >
                    {pdfList.map((pdf, index) => (
                      <Dropdown.Item
                        key={index}
                        active={index === selectedPdfIndex}
                        onClick={() => handleSelectPdf(index)}
                        className="d-flex align-items-center"
                        style={{
                          backgroundColor: index === selectedPdfIndex
                            ? (theme === 'lights' ? '#e7f1ff' : '#1a2537')
                            : 'transparent',
                          color: textClass.includes('dark') ? '#ebe5e5' : '#353432'
                        }}
                      >
                        <span className="me-2">
                          {pdf.tipo === 'clase' ? <Book /> :
                            pdf.tipo === 'tutoria' ? <PeopleFill /> :
                              <FileEarmarkPdf />}
                        </span>
                        {pdf.nombre}
                        {index === selectedPdfIndex && (
                          <Badge bg="success" className="ms-2">Actual</Badge>
                        )}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => handleSelectPdf(selectedPdfIndex + 1)}
                  disabled={selectedPdfIndex === pdfList.length - 1}
                  style={{ borderColor: borderColor }}
                >
                  Siguiente →
                </Button>
              </div>
            </div>

            {/* Info del PDF actual */}
            {pdfList[selectedPdfIndex] && (
              <div className="mt-2">
                <Badge
                  bg="info"
                  className="me-2"
                >
                  {pdfList[selectedPdfIndex].tipo === 'clase' ? '📚 Clase' :
                    pdfList[selectedPdfIndex].tipo === 'tutoria' ? '👥 Tutoría' :
                      '📄 Archivo'}
                </Badge>
                <small className={textClass}>
                  PDF {selectedPdfIndex + 1} de {pdfList.length}
                </small>
              </div>
            )}
          </div>
        )}

        {/* Vista del PDF */}
        {pdfUrl ? (
          <div style={{ width: '100%', height: '60vh' }}>
            <iframe
              src={pdfUrl}
              width="100%"
              height="100%"
              frameBorder="0"
              title="Vista previa del PDF"
              style={{
                border: 'none',
                backgroundColor: theme === 'lights' ? '#FFFFFF' : '#0A0E17'
              }}
            />
          </div>
        ) : (
          <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
            <Spinner animation="border" variant={theme === 'lights' ? 'primary' : 'light'} />
            <span className={`ms-2 ${textClass}`}>Cargando PDF...</span>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className={`${cardClass} ${textClass}`}>
        <div className="d-flex justify-content-between w-100 align-items-center">
          <div>
            {pdfList[selectedPdfIndex] && (
              <small className={textClass}>
                <strong>Tipo:</strong> {pdfList[selectedPdfIndex].tipo === 'clase' ? 'Diapositiva de Clase' :
                  pdfList[selectedPdfIndex].tipo === 'tutoria' ? 'Diapositiva de Tutoría' :
                    'Archivo'}
              </small>
            )}
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              onClick={handleClosePdfModal}
              style={{ borderColor: borderColor }}
            >
              Cerrar
            </Button>
            {pdfUrl && pdfList[selectedPdfIndex] && (
              <Button
                variant="primary"
                onClick={handleDownloadPdf}
                style={{ backgroundColor: titleColor, borderColor: titleColor }}
              >
                <FileEarmarkPdf className="me-2" />
                Descargar PDF
              </Button>
            )}
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );

  return (
    <div className={`card ${cardClass} card-with-shadow p-4`}>
      {/* Header */}
      <div className="mb-4">
        <h2 style={{ color: titleColor }}>📚 Gestión de Carreras</h2>
        <div className="d-flex justify-content-between align-items-center">
          <p className={`${textClass} mb-0`}>Total: {carreras.length} carreras registradas</p>
          <div className="d-flex gap-2">
            <Badge bg="info">
              <Tag size={12} className="me-1" />
              Sistema de Versiones
            </Badge>
          </div>
        </div>
      </div>

      {/* Buscador y Botones */}
      <Row className="mb-4">
        <Col md={8} className="mb-3 mb-md-0">
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Buscar por nombre, descripción, modalidad, versión..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={theme === 'lights' ? 'bg-white text-dark' : 'bg-dark text-light'}
              style={{ borderColor: borderColor }}
            />
          </Form.Group>
        </Col>
        <Col md={4} className="d-flex gap-2 justify-content-md-end">
          <Button
            variant="primary"
            onClick={handleShowCreateModal}
            style={{ backgroundColor: titleColor, borderColor: titleColor }}
          >
            <Plus className="me-2" /> Nueva Carrera
          </Button>
        </Col>
      </Row>

      {/* Tabla de Carreras */}
      <div className="table-responsive">
        <Table
          hover
          className={`${theme === 'lights' ? 'table-light' : 'table-dark'} ${textClass}`}
          style={{ borderColor: borderColor, color: 'inherit' }}
        >
          <thead>
            <tr style={{
              borderBottom: `2px solid ${borderColor}`,
              backgroundColor: theme === 'lights' ? '#FAF3E1' : '#1F2535'
            }}>
              <th style={{ width: '5%' }}></th>
              <th style={{ width: '25%' }}>Nombre</th>
              <th style={{ width: '10%' }}>Versión</th>
              <th style={{ width: '10%' }}>Duración</th>
              <th style={{ width: '10%' }}>Modalidad</th>
              <th style={{ width: '10%' }}>Precio</th>
              <th style={{ width: '10%' }}>Estado</th>
              <th style={{ width: '10%' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredCarreras.length > 0 ? (
              filteredCarreras
                .sort((a, b) => {
                  // Primero por estado "Activo"
                  if (a.estado === 'Activo' && b.estado !== 'Activo') return -1;
                  if (b.estado === 'Activo' && a.estado !== 'Activo') return 1;
                  // Luego por nombre
                  return a.nombre.localeCompare(b.nombre);
                })
                .map((carrera) => (
                  <React.Fragment key={carrera._id}>
                    {/* Fila principal */}
                    <tr style={{
                      borderBottom: `1px solid ${borderColor}`,
                      backgroundColor: theme === 'lights' ? '#FFFFFF' : '#0A0E17'
                    }}>
                      <td>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => toggleCarrera(carrera._id)}
                          className={textClass}
                          style={{ color: 'inherit' }}
                        >
                          {expandedCarrera === carrera._id ? <ChevronUp /> : <ChevronDown />}
                        </Button>
                      </td>
                      <td>
                        <strong style={{ color: 'inherit' }}>{carrera.nombre}</strong>
                        <div className="mt-1" style={{
                          color: theme === 'lights' ? '#6c757d' : '#b0b0b0',
                          fontSize: '0.875rem'
                        }}>
                          {carrera.descripcion?.substring(0, 60)}...
                        </div>
                      </td>
                      <td>
                        <Badge bg="info">
                          <Tag size={12} className="me-1" />
                          v{carrera.version || '1.0.0'}
                        </Badge>
                      </td>
                      <td style={{ color: 'inherit' }}>{carrera.duracion}</td>
                      <td>{getModalidadBadge(carrera.modalidad)}</td>
                      <td>
                        <span className="fw-bold" style={{ color: 'inherit' }}>
                          {carrera.precio}
                        </span>
                        <div style={{
                          color: theme === 'lights' ? '#6c757d' : '#b0b0b0',
                          fontSize: '0.875rem'
                        }}>
                          {carrera.clases_por_semana} clases/sem
                        </div>
                      </td>
                      <td>{getEstadoBadge(carrera.estado)}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-warning"
                            size="sm"
                            onClick={() => handleShowEditModal(carrera)}
                            style={{
                              borderColor: borderColor,
                              color: theme === 'lights' ? '#ffc107' : '#ffda6a'
                            }}
                            title="Editar"
                          >
                            <Pencil />
                          </Button>
                          {carrera.estado === 'Activo' ? (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleChangeEstadoCarrera(carrera)}
                              style={{
                                borderColor: borderColor,
                                color: theme === 'lights' ? '#dc3545' : '#e98f97'
                              }}
                              title="Desactivar carrera"
                            >
                              <ToggleOff />
                            </Button>
                          ) : (
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleChangeEstadoCarrera(carrera)}
                              style={{
                                borderColor: borderColor,
                                color: theme === 'lights' ? '#198754' : '#75b798'
                              }}
                              title="Activar carrera"
                            >
                              <ToggleOn />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Fila expandible con detalles */}
                    {expandedCarrera === carrera._id && (
                      <tr>
                        <td colSpan="8" className="p-0">
                          <div style={{
                            backgroundColor: theme === 'lights' ? '#f8f9fa' : '#2a3042',
                            borderTop: `1px solid ${borderColor}`
                          }}>
                            <CarreraDetalle carrera={carrera} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-4" style={{
                  color: 'inherit',
                  backgroundColor: theme === 'lights' ? '#FFFFFF' : '#0A0E17'
                }}>
                  <p>
                    {searchTerm ? 'No se encontraron carreras con ese criterio' : 'No hay carreras registradas.'}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Modal de PDFs */}
      <PdfModal />

      {/* Modales de creación y edición */}
      <ModalCrearCarrera
        show={showCreateModal}
        handleClose={handleCloseCreateModal}
        setRefreshData={setRefreshData}
        navigate={navigate}
        theme={theme}
      />

      <ModalEditarCarrera
        show={showEditModal}
        handleClose={handleCloseEditModal}
        carrera={selectedCarrera}
        setRefreshData={setRefreshData}
        navigate={navigate}
        theme={theme}
      />
    </div>
  );
};

export default GestionCarreras;
