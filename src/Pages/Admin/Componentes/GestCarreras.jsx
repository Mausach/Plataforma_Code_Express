import React, { useEffect, useState } from 'react';
import { Button, Table, Badge, Spinner, Alert, Form, Row, Col, Accordion, Card, ListGroup, Modal, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  ChevronDown, ChevronUp, Eye, Pencil, Plus,
  ToggleOn, ToggleOff, FileEarmarkPdf, EyeFill,
  Book, JournalBookmarkFill, PeopleFill, FileText,
  Clock, Tag, Calendar, Download, Briefcase, InfoCircle
} from 'react-bootstrap-icons';

import { CargarCarreras } from '../Helper/CargarCarreras';
import ModalCrearCarrera from './Subcomponentes/ModalCrearCarrera';
import ModalEditarCarrera from './Subcomponentes/ModalEditarCarrera';

export const GestionCarreras = ({ theme, navigate: propNavigate }) => {
  const navigate = propNavigate || useNavigate();

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

  // Estados para controlar expansión de módulos y contenidos
  const [expandedModulos, setExpandedModulos] = useState({});
  const [expandedContenidos, setExpandedContenidos] = useState({});

  // Colores según tema - IGUAL QUE LA VERSIÓN ANTERIOR
  const colors = {
    isLight: theme === 'lights',
    text: theme === 'lights' ? '#212529' : '#e9ecef',
    textMuted: theme === 'lights' ? '#6c757d' : '#adb5bd',
    border: theme === 'lights' ? '#E0D8C5' : '#3A4255',
    bgCard: theme === 'lights' ? '#FFFFFF' : '#1A1F2E',
    bgHeader: theme === 'lights' ? '#FAF3E1' : '#1F2535',
    bgBody: theme === 'lights' ? '#f8f9fa' : '#2a3042',
    bgAccordionItem: theme === 'lights' ? '#FFFFFF' : '#1F2535',
    bgAccordionBody: theme === 'lights' ? '#f8f9fa' : '#2a3042',
    titleColor: '#EF7F1A',
    placeholderColor: theme === 'lights' ? '#6c757d' : '#adb5bd'
  };

  // Clases CSS dinámicas
  const cardClass = theme === 'lights' ? 'card-light' : 'card-dark';
  const textClass = theme === 'lights' ? 'text-dark' : 'text-light';
  const borderColor = colors.border;
  const titleColor = colors.titleColor;

  // ========== FUNCIONES PARA PDFs ==========

  // Función para ver PDF individual
  const verPdfIndividual = (url, nombre) => {
    if (!url) {
      Swal.fire({
        title: 'Sin URL',
        text: 'No hay archivo disponible.',
        icon: 'info',
        background: colors.bgCard,
        color: colors.text,
        confirmButtonColor: titleColor
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

  // Función para ver múltiples PDFs
  const verMultiplesPdfs = (urls, nombreBase, tipo) => {
    if (!urls || urls.length === 0) {
      Swal.fire({
        title: 'Sin PDFs',
        text: 'No hay diapositivas disponibles.',
        icon: 'info',
        background: colors.bgCard,
        color: colors.text,
        confirmButtonColor: titleColor
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

  // Función para descargar PDF
  const descargarPdf = (url, nombre) => {
    if (!url) {
      Swal.fire({
        title: 'Sin URL',
        text: 'No hay archivo disponible para descargar.',
        icon: 'info',
        background: colors.bgCard,
        color: colors.text,
        confirmButtonColor: titleColor
      });
      return;
    }

    const driveId = extraerIdDeGoogleDrive(url);
    if (driveId) {
      window.open(`https://drive.google.com/uc?id=${driveId}&export=download`, '_blank');
    } else {
      window.open(url, '_blank');
    }
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

  // ========== FUNCIONES PARA EXPANSIÓN ==========
  const toggleCarrera = (carreraId) => {
    setExpandedCarrera(expandedCarrera === carreraId ? null : carreraId);
  };

  const toggleModulo = (moduloId) => {
    setExpandedModulos(prev => ({
      ...prev,
      [moduloId]: !prev[moduloId]
    }));
  };

  const toggleContenido = (contenidoId) => {
    setExpandedContenidos(prev => ({
      ...prev,
      [contenidoId]: !prev[contenidoId]
    }));
  };

  // ========== useEffect para cargar carreras ==========
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
      background: colors.bgCard,
      color: colors.text
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
          background: colors.bgCard,
          color: colors.text,
          confirmButtonColor: titleColor
        });
      }
    });
  };

  // ========== FUNCIÓN PARA OBTENER BADGES ==========
  const getEstadoBadge = (estado) => {
    const bgColors = {
      'Activo': theme === 'lights' ? '#198754' : '#2ecc71',
      'Inactivo': theme === 'lights' ? '#6c757d' : '#95a5a6',
      'En desarrollo': theme === 'lights' ? '#ffc107' : '#f39c12',
      'Archivado': theme === 'lights' ? '#343a40' : '#34495e'
    };
    return (
      <Badge style={{ backgroundColor: bgColors[estado] || '#6c757d', color: '#ffffff' }}>
        {estado}
      </Badge>
    );
  };

  const getModalidadBadge = (modalidad) => {
    const bgColors = {
      'part-time': theme === 'lights' ? '#0dcaf0' : '#3498db',
      'full-time': theme === 'lights' ? '#0d6efd' : '#2980b9',
      'grabado': theme === 'lights' ? '#6c757d' : '#7f8c8d'
    };
    const textos = {
      'part-time': 'Part-Time',
      'full-time': 'Full-Time',
      'grabado': 'Grabado'
    };
    return (
      <Badge style={{ backgroundColor: bgColors[modalidad] || '#6c757d', color: '#ffffff' }}>
        {textos[modalidad] || modalidad}
      </Badge>
    );
  };

  // ========== FILTRADO DE CARRERAS ==========
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

  // ========== COMPONENTE RECURSOS CONTENIDO (VERSIÓN ANTERIOR) ==========
  const RecursosContenido = ({ contenido }) => {
    return (
      <div className="mt-3">
        <ListGroup>
          {/* SECCIÓN DE CLASE */}
          {contenido.clase?.diapositivas && contenido.clase.diapositivas.length > 0 && (
            <ListGroup.Item 
              style={{ 
                backgroundColor: colors.bgCard,
                borderColor: colors.border,
                color: colors.text
              }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <Book className="me-2" style={{ color: '#0d6efd' }} />
                  <div>
                    <strong style={{ color: colors.text }}>Clase</strong>
                    <div className="small" style={{ color: colors.textMuted }}>
                      {contenido.clase.diapositivas.length} diapositiva{contenido.clase.diapositivas.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => verMultiplesPdfs(contenido.clase.diapositivas, contenido.nombre, 'clase')}
                  style={{ borderColor: colors.border, color: colors.text }}
                >
                  <EyeFill className="me-1" /> Ver
                </Button>
              </div>
            </ListGroup.Item>
          )}

          {/* SECCIÓN DE AUTOAPRENDIZAJE */}
          {contenido.autoaprendizaje?.guia_estudio && (
            <ListGroup.Item 
              style={{ 
                backgroundColor: colors.bgCard,
                borderColor: colors.border,
                color: colors.text
              }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <JournalBookmarkFill className="me-2" style={{ color: '#198754' }} />
                  <div>
                    <strong style={{ color: colors.text }}>Guía de Estudio</strong>
                    <div className="small" style={{ color: colors.textMuted }}>Autoaprendizaje</div>
                  </div>
                </div>
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => verPdfIndividual(contenido.autoaprendizaje.guia_estudio, `${contenido.nombre} - Guía de Estudio`)}
                  style={{ borderColor: colors.border, color: colors.text }}
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
                <ListGroup.Item 
                  style={{ 
                    backgroundColor: colors.bgCard,
                    borderColor: colors.border,
                    color: colors.text
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <PeopleFill className="me-2" style={{ color: '#6f42c1' }} />
                      <div>
                        <strong style={{ color: colors.text }}>Tutoría - Diapositivas</strong>
                        <div className="small" style={{ color: colors.textMuted }}>
                          {contenido.tutoria.diapositivas.length} diapositiva{contenido.tutoria.diapositivas.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={() => verMultiplesPdfs(contenido.tutoria.diapositivas, `${contenido.nombre} - Tutoría`, 'tutoria')}
                      style={{ borderColor: colors.border, color: colors.text }}
                    >
                      <EyeFill className="me-1" /> Ver
                    </Button>
                  </div>
                </ListGroup.Item>
              )}

              {/* Material de apoyo de tutoría */}
              {contenido.tutoria.apoyo && (
                <ListGroup.Item 
                  style={{ 
                    backgroundColor: colors.bgCard,
                    borderColor: colors.border,
                    color: colors.text
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <FileEarmarkPdf className="me-2" style={{ color: '#fd7e14' }} />
                      <div>
                        <strong style={{ color: colors.text }}>Material de Apoyo</strong>
                        <div className="small" style={{ color: colors.textMuted }}>Recursos adicionales</div>
                      </div>
                    </div>
                    <Button
                      variant="outline-warning"
                      size="sm"
                      onClick={() => verPdfIndividual(contenido.tutoria.apoyo, `${contenido.nombre} - Material de Apoyo`)}
                      style={{ borderColor: colors.border, color: colors.text }}
                    >
                      <EyeFill className="me-1" /> Ver
                    </Button>
                  </div>
                </ListGroup.Item>
              )}

              {/* Proyectos de tutoría */}
              {contenido.tutoria.proyectos && contenido.tutoria.proyectos.length > 0 && (
                <ListGroup.Item 
                  style={{ 
                    backgroundColor: colors.bgCard,
                    borderColor: colors.border,
                    color: colors.text
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex align-items-center">
                      <FileText className="me-2" style={{ color: '#20c997' }} />
                      <div>
                        <strong style={{ color: colors.text }}>Proyectos</strong>
                        <div className="small" style={{ color: colors.textMuted }}>
                          {contenido.tutoria.proyectos.length} proyecto{contenido.tutoria.proyectos.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </div>

                  {contenido.tutoria.proyectos.map((proyecto, idx) => (
                    <div key={idx} className="mt-2 p-2 rounded" style={{
                      backgroundColor: colors.bgBody,
                      border: `1px solid ${colors.border}`
                    }}>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <span className="small" style={{ color: colors.text }}>
                            <strong>Proyecto {idx + 1}</strong>
                          </span>
                        </div>
                        {proyecto.tarea && (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => verPdfIndividual(proyecto.tarea, `${contenido.nombre} - Proyecto ${idx + 1}`)}
                            style={{ borderColor: colors.border, color: colors.text }}
                            title="Ver Proyecto"
                          >
                            <EyeFill size={12} className="me-1" /> Ver Proyecto
                          </Button>
                        )}
                      </div>
                      
                      {proyecto.solucion && (
                        <div className="d-flex justify-content-between align-items-center mt-2 pt-2" 
                             style={{ borderTop: `1px dashed ${colors.border}` }}>
                          <span className="small" style={{ color: colors.textMuted }}>Solución disponible:</span>
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => descargarPdf(proyecto.solucion, `${contenido.nombre} - Solución Proyecto ${idx + 1}`)}
                            style={{ borderColor: colors.border, color: colors.text }}
                            title="Descargar Solución"
                          >
                            <Download size={12} className="me-1" /> Descargar
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

        {!contenido.clase?.diapositivas?.length &&
          !contenido.autoaprendizaje?.guia_estudio &&
          !contenido.tutoria && (
            <div className="text-center py-2">
              <small style={{ color: colors.textMuted }}>Sin recursos asignados</small>
            </div>
          )}
      </div>
    );
  };

  // ========== COMPONENTE MÓDULOS (VERSIÓN ANTERIOR) ==========
  const ModulosAccordion = ({ modulos }) => {
    return (
      <div>
        {modulos.sort((a, b) => a.orden - b.orden).map((modulo, idx) => (
          <Card
            key={modulo._id || idx}
            className="mb-3"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.bgCard
            }}
          >
            {/* HEADER DEL MÓDULO - CLICKEABLE */}
            <Card.Header
              onClick={() => toggleModulo(modulo._id || idx)}
              style={{
                backgroundColor: colors.bgHeader,
                borderColor: colors.border,
                color: colors.text,
                cursor: 'pointer'
              }}
              className="d-flex align-items-center justify-content-between"
            >
              <div className="d-flex align-items-center">
                {expandedModulos[modulo._id || idx] ? 
                  <ChevronUp className="me-2" style={{ color: titleColor }} /> : 
                  <ChevronDown className="me-2" style={{ color: colors.textMuted }} />
                }
                <strong style={{ color: colors.text }}>
                  {modulo.orden}. {modulo.nombre}
                </strong>
                <Badge className="ms-2" style={{ backgroundColor: colors.textMuted, color: '#ffffff' }}>
                  {modulo.contenidos?.length || 0} contenidos
                </Badge>
              </div>
            </Card.Header>

            {/* BODY DEL MÓDULO - CONDICIONAL */}
            {expandedModulos[modulo._id || idx] && (
              <Card.Body style={{
                backgroundColor: colors.bgBody,
                color: colors.text
              }}>
                {modulo.descripcion && (
                  <div className="mb-3">
                    <strong>Descripción:</strong>
                    <p className="mt-1" style={{ color: colors.text }}>{modulo.descripcion}</p>
                  </div>
                )}

                {modulo.contenidos && modulo.contenidos.length > 0 ? (
                  <div className="row">
                    {modulo.contenidos.map((contenido, cIdx) => (
                      <div key={contenido._id || cIdx} className="col-12 mb-3">
                        <Card style={{
                          backgroundColor: colors.bgCard,
                          borderColor: colors.border
                        }}>
                          {/* HEADER DEL CONTENIDO - CLICKEABLE */}
                          <Card.Header
                            onClick={() => toggleContenido(contenido._id || `c-${idx}-${cIdx}`)}
                            style={{
                              backgroundColor: colors.bgHeader,
                              borderColor: colors.border,
                              color: colors.text,
                              cursor: 'pointer'
                            }}
                            className="d-flex align-items-center"
                          >
                            <div className="d-flex align-items-center">
                              {expandedContenidos[contenido._id || `c-${idx}-${cIdx}`] ? 
                                <ChevronUp className="me-2" style={{ color: titleColor }} /> : 
                                <ChevronDown className="me-2" style={{ color: colors.textMuted }} />
                              }
                              <strong style={{ color: colors.text }}>
                                {contenido.nombre}
                              </strong>
                            </div>
                          </Card.Header>

                          {/* BODY DEL CONTENIDO - CONDICIONAL */}
                          {expandedContenidos[contenido._id || `c-${idx}-${cIdx}`] && (
                            <Card.Body style={{ color: colors.text }}>
                              <RecursosContenido contenido={contenido} />
                            </Card.Body>
                          )}
                        </Card>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p style={{ color: colors.textMuted }}>No hay contenidos cargados</p>
                  </div>
                )}
              </Card.Body>
            )}
          </Card>
        ))}
      </div>
    );
  };

  // ========== COMPONENTE CARRERA DETALLE ==========
  const CarreraDetalle = ({ carrera }) => {
    return (
      <div className="p-3" style={{ color: colors.text }}>
        <Row>
          <Col md={6}>
            {/* INFORMACIÓN BÁSICA */}
            <Card className="mb-3" style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
              <Card.Header style={{ backgroundColor: colors.bgHeader, borderColor: colors.border, color: colors.text }}>
                <strong>📋 Información Básica</strong>
              </Card.Header>
              <Card.Body style={{ color: colors.text }}>
                <div className="mb-2">
                  <strong>Clases por semana:</strong>
                  <p className="mt-1" style={{ color: colors.text }}>{carrera.clases_por_semana}</p>
                </div>
                <div className="mb-2">
                  <strong>Duración de cada clase:</strong>
                  <p className="mt-1" style={{ color: colors.text }}>{carrera.duracion_de_cada_clase}</p>
                </div>
                <div className="mb-2">
                  <strong>Fecha versión:</strong>
                  <p className="mt-1" style={{ color: colors.text }}>
                    {carrera.fecha_version ? new Date(carrera.fecha_version).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </Card.Body>
            </Card>

            {/* CERTIFICACIÓN */}
            <Card className="mb-3" style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
              <Card.Header style={{ backgroundColor: colors.bgHeader, borderColor: colors.border, color: colors.text }}>
                <strong>🏆 Certificación</strong>
              </Card.Header>
              <Card.Body style={{ color: colors.text }}>
                <p className="mb-0">{carrera.titulo_certificacion}</p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            {/* REQUISITOS */}
            <Card className="mb-3" style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
              <Card.Header style={{ backgroundColor: colors.bgHeader, borderColor: colors.border, color: colors.text }}>
                <strong>📝 Requisitos</strong>
              </Card.Header>
              <Card.Body style={{ color: colors.text }}>
                {carrera.requisitos && carrera.requisitos.length > 0 ? (
                  <ul className="list-unstyled mb-0">
                    {carrera.requisitos.map((req, idx) => (
                      <li key={idx} className="d-flex align-items-start mb-2">
                        <div className="me-2" style={{ color: titleColor }}>•</div>
                        <span style={{ color: colors.text }}>{req}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mb-0" style={{ color: colors.textMuted }}>No se especificaron requisitos</p>
                )}
              </Card.Body>
            </Card>

            {/* ESTADO, MODALIDAD Y VERSIÓN */}
            <Card className="mb-3" style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
              <Card.Header style={{ backgroundColor: colors.bgHeader, borderColor: colors.border, color: colors.text }}>
                <strong>⚙️ Detalles</strong>
              </Card.Header>
              <Card.Body style={{ color: colors.text }}>
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
                        <Badge style={{ backgroundColor: colors.textMuted, color: '#ffffff' }}>
                          <Tag size={12} className="me-1" />
                          v{carrera.version || '1.0.0'}
                        </Badge>
                      </div>
                    </div>
                    <div className="mb-3">
                      <strong>Precio:</strong>
                      <div className="mt-1">
                        <span className="fw-bold" style={{ color: titleColor }}>
                          {carrera.precio}
                        </span>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* MÓDULOS Y CONTENIDOS */}
        {carrera.modulos && carrera.modulos.length > 0 && (
          <div className="mt-4">
            <h6 style={{ color: titleColor, marginBottom: '1rem' }}>📚 Módulos y Contenidos</h6>
            <ModulosAccordion modulos={carrera.modulos} />
          </div>
        )}
      </div>
    );
  };

  // ========== MODAL PDF ==========
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
        style={{ 
          backgroundColor: colors.bgCard,
          borderBottomColor: colors.border,
          color: colors.text
        }}
        closeVariant={theme === 'lights' ? 'dark' : 'white'}
      >
        <Modal.Title style={{ color: titleColor }}>
          <FileEarmarkPdf className="me-2" />
          {pdfTitle || 'Vista previa del PDF'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-0" style={{ 
        backgroundColor: colors.bgCard,
        minHeight: '60vh' 
      }}>
        {pdfList.length > 1 && (
          <div
            className="p-3"
            style={{
              borderBottom: `1px solid ${colors.border}`,
              backgroundColor: colors.bgHeader
            }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <span style={{ color: colors.text }}>
                <strong>PDFs disponibles:</strong> {pdfList.length} archivo(s)
              </span>
              <div className="d-flex align-items-center gap-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => handleSelectPdf(selectedPdfIndex - 1)}
                  disabled={selectedPdfIndex === 0}
                  style={{ borderColor: colors.border, color: colors.text }}
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
                      borderColor: colors.border,
                      color: '#ffffff'
                    }}
                  >
                    {pdfList[selectedPdfIndex]?.nombre || 'Seleccionar PDF'}
                  </Dropdown.Toggle>

                  <Dropdown.Menu
                    style={{
                      backgroundColor: colors.bgCard,
                      borderColor: colors.border,
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
                          color: colors.text
                        }}
                      >
                        <span className="me-2">
                          {pdf.tipo === 'clase' ? <Book /> :
                            pdf.tipo === 'tutoria' ? <PeopleFill /> :
                              <FileEarmarkPdf />}
                        </span>
                        {pdf.nombre}
                        {index === selectedPdfIndex && (
                          <Badge className="ms-2" style={{ backgroundColor: titleColor, color: '#ffffff' }}>Actual</Badge>
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
                  style={{ borderColor: colors.border, color: colors.text }}
                >
                  Siguiente →
                </Button>
              </div>
            </div>

            {pdfList[selectedPdfIndex] && (
              <div className="mt-2">
                <Badge
                  style={{ 
                    backgroundColor: titleColor,
                    color: '#ffffff',
                    marginRight: '0.5rem'
                  }}
                >
                  {pdfList[selectedPdfIndex].tipo === 'clase' ? '📚 Clase' :
                    pdfList[selectedPdfIndex].tipo === 'tutoria' ? '👥 Tutoría' :
                      '📄 Archivo'}
                </Badge>
                <small style={{ color: colors.textMuted }}>
                  PDF {selectedPdfIndex + 1} de {pdfList.length}
                </small>
              </div>
            )}
          </div>
        )}

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
                backgroundColor: colors.bgCard
              }}
            />
          </div>
        ) : (
          <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
            <Spinner animation="border" variant={theme === 'lights' ? 'primary' : 'light'} />
            <span className="ms-2" style={{ color: colors.text }}>Cargando PDF...</span>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer style={{ 
        backgroundColor: colors.bgCard,
        borderColor: colors.border,
        color: colors.text
      }}>
        <div className="d-flex justify-content-between w-100 align-items-center">
          <div>
            {pdfList[selectedPdfIndex] && (
              <small style={{ color: colors.textMuted }}>
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
              style={{ borderColor: colors.border, color: colors.text }}
            >
              Cerrar
            </Button>
            {pdfUrl && pdfList[selectedPdfIndex] && (
              <Button
                variant="primary"
                onClick={handleDownloadPdf}
                style={{ backgroundColor: titleColor, borderColor: titleColor, color: '#ffffff' }}
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

  // ========== LOADING ==========
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <Spinner animation="border" variant={theme === 'lights' ? 'primary' : 'light'} />
        <span className="ms-2" style={{ color: colors.text }}>Cargando carreras...</span>
      </div>
    );
  }

  // ========== ERROR ==========
  if (error) {
    return (
      <Alert 
        variant="danger" 
        className="mt-3"
        style={{ 
          backgroundColor: theme === 'lights' ? '#f8d7da' : '#842029',
          borderColor: theme === 'lights' ? '#f5c6cb' : '#842029',
          color: theme === 'lights' ? '#721c24' : '#f8d7da'
        }}
      >
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

  // ========== HANDLERS MODALES ==========
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

  // ========== RENDER PRINCIPAL ==========
  return (
    <div className={`card ${cardClass} card-with-shadow p-4`} style={{ color: colors.text }}>
      {/* Header */}
      <div className="mb-4">
        <h2 style={{ color: titleColor }}>📚 Gestión de Carreras</h2>
        <div className="d-flex justify-content-between align-items-center">
          <p className="mb-0" style={{ color: colors.text }}>Total: {carreras.length} carreras registradas</p>
          <div className="d-flex gap-2">
            <Badge style={{ backgroundColor: colors.textMuted, color: '#ffffff' }}>
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
              style={{
                backgroundColor: colors.bgCard,
                borderColor: colors.border,
                color: colors.text
              }}
              className={theme === 'lights' ? 'bg-white text-dark' : 'bg-dark text-light'}
            />
            {/* Estilo personalizado para el placeholder */}
            <style>
              {`
                .form-control::placeholder {
                  color: ${colors.placeholderColor} !important;
                  opacity: 1;
                }
                .form-control:-ms-input-placeholder {
                  color: ${colors.placeholderColor} !important;
                }
                .form-control::-ms-input-placeholder {
                  color: ${colors.placeholderColor} !important;
                }
              `}
            </style>
          </Form.Group>
        </Col>
        <Col md={4} className="d-flex gap-2 justify-content-md-end">
          <Button
            variant="primary"
            onClick={handleShowCreateModal}
            style={{ backgroundColor: titleColor, borderColor: titleColor, color: '#ffffff' }}
          >
            <Plus className="me-2" /> Nueva Carrera
          </Button>
        </Col>
      </Row>

      {/* ACORDEÓN DE CARRERAS - CON EL MISMO ESTILO QUE MÓDULOS */}
      {filteredCarreras.length > 0 ? (
        <div>
          {filteredCarreras
            .sort((a, b) => {
              if (a.estado === 'Activo' && b.estado !== 'Activo') return -1;
              if (b.estado === 'Activo' && a.estado !== 'Activo') return 1;
              return a.nombre.localeCompare(b.nombre);
            })
            .map((carrera) => (
              <Card
                key={carrera._id}
                className="mb-3"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.bgCard
                }}
              >
                {/* HEADER DE LA CARRERA - CLICKEABLE (IGUAL QUE MÓDULOS) */}
                <Card.Header
                  onClick={() => toggleCarrera(carrera._id)}
                  style={{
                    backgroundColor: colors.bgHeader,
                    borderColor: colors.border,
                    color: colors.text,
                    cursor: 'pointer'
                  }}
                  className="d-flex align-items-center justify-content-between"
                >
                  <div className="d-flex align-items-center">
                    {expandedCarrera === carrera._id ? 
                      <ChevronUp className="me-2" style={{ color: titleColor }} /> : 
                      <ChevronDown className="me-2" style={{ color: colors.textMuted }} />
                    }
                    <strong style={{ color: colors.text, fontSize: '1.1rem' }}>
                      {carrera.nombre}
                    </strong>
                    
                    <Badge 
                      className="ms-2" 
                      style={{ 
                        backgroundColor: colors.textMuted, 
                        color: '#ffffff',
                        fontSize: '0.8rem'
                      }}
                    >
                      <Tag size={12} className="me-1" />
                      v{carrera.version || '1.0.0'}
                    </Badge>

                    <Badge 
                      className="ms-2" 
                      style={{ 
                        backgroundColor: carrera.estado === 'Activo' ? 
                          (theme === 'lights' ? '#198754' : '#2ecc71') : 
                          carrera.estado === 'Inactivo' ? 
                            (theme === 'lights' ? '#6c757d' : '#95a5a6') : 
                            carrera.estado === 'En desarrollo' ? 
                              (theme === 'lights' ? '#ffc107' : '#f39c12') : 
                              (theme === 'lights' ? '#343a40' : '#34495e'),
                        color: '#ffffff',
                        fontSize: '0.8rem'
                      }}
                    >
                      {carrera.estado}
                    </Badge>
                  </div>

                  {/* Información resumida a la derecha (NO CLICKEABLE) */}
                  <div className="d-flex align-items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <div className="d-flex align-items-center">
                      <Clock size={14} className="me-1" style={{ color: colors.textMuted }} />
                      <small style={{ color: colors.textMuted }}>{carrera.duracion}</small>
                    </div>

                    <Badge style={{ 
                      backgroundColor: carrera.modalidad === 'part-time' ? 
                        (theme === 'lights' ? '#0dcaf0' : '#3498db') : 
                        carrera.modalidad === 'full-time' ? 
                          (theme === 'lights' ? '#0d6efd' : '#2980b9') : 
                          (theme === 'lights' ? '#6c757d' : '#7f8c8d'),
                      color: '#ffffff',
                      fontSize: '0.8rem'
                    }}>
                      {carrera.modalidad === 'part-time' ? 'Part-Time' :
                       carrera.modalidad === 'full-time' ? 'Full-Time' : 'Grabado'}
                    </Badge>

                    <span className="fw-bold" style={{ color: titleColor }}>
                      {carrera.precio}
                    </span>

                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-warning"
                        size="sm"
                        onClick={() => handleShowEditModal(carrera)}
                        style={{
                          borderColor: colors.border,
                          color: colors.text
                        }}
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </Button>
                      {carrera.estado === 'Activo' ? (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleChangeEstadoCarrera(carrera)}
                          style={{
                            borderColor: colors.border,
                            color: colors.text
                          }}
                          title="Desactivar carrera"
                        >
                          <ToggleOff size={14} />
                        </Button>
                      ) : (
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => handleChangeEstadoCarrera(carrera)}
                          style={{
                            borderColor: colors.border,
                            color: colors.text
                          }}
                          title="Activar carrera"
                        >
                          <ToggleOn size={14} />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card.Header>

                {/* BODY DE LA CARRERA - CONDICIONAL */}
                {expandedCarrera === carrera._id && (
                  <Card.Body style={{
                    backgroundColor: colors.bgBody,
                    color: colors.text,
                    padding: '1.5rem'
                  }}>
                    <CarreraDetalle carrera={carrera} />
                  </Card.Body>
                )}
              </Card>
            ))}
        </div>
      ) : (
        <div className="text-center py-5" style={{ color: colors.textMuted }}>
          <Briefcase size={48} style={{ color: colors.textMuted }} />
          <p className="mt-3">
            {searchTerm ? 'No se encontraron carreras con ese criterio' : 'No hay carreras registradas.'}
          </p>
        </div>
      )}

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
