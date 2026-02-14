import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Button, 
  Spinner, 
  Alert, 
  Accordion, 
  Badge,
  Form,
  Tabs,
  Tab,
  ListGroup,
  Modal,
  Row,
  Col
} from 'react-bootstrap';
import { 
  Save,
  ListCheck,
  Eye,
  Book,
  JournalBookmarkFill,
  PeopleFill,
  FileEarmarkPdf,
  FileText,
  CheckSquare,
  Square,
  CheckCircle,
  Circle,
  CalendarCheck,
  Clock
} from 'react-bootstrap-icons';
import Swal from 'sweetalert2';

import { CargarCarreraCompleta } from '../../Helper/CargarComision_Id';
import { GuardarProgresoComision } from '../../Helper/Guardar_Cargar_Progrescomision';

const PanelProgresoComision = ({ comision, theme, navigate, usuario }) => {
    // Estados principales
    const [carrera, setCarrera] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('gestion');
    const [modificaciones, setModificaciones] = useState({});
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [guardando, setGuardando] = useState(false);
    
    // ========== 🐋 BALLENITA: CONTROL DE ROLES ==========
    const rolUsuario = usuario?.rol || 'alumno';
    const esAlumno = rolUsuario === 'alumno';
    const esProfe = rolUsuario === 'profe';
    const esAdmin = rolUsuario === 'admin';
    const esCoordinador = rolUsuario === 'cordinador';
    const esCorrector = rolUsuario === 'corrector';
    const esAcompaniante = rolUsuario === 'acompañante';
    
    // Roles que pueden editar/gestionar (NO alumnos)
    const puedeGestionar = !esAlumno;
    
    // ========== 🐋 BALLENITA: SETEAR TAB POR DEFECTO SEGÚN ROL ==========
    useEffect(() => {
        if (esProfe || esAlumno) {
            setActiveTab('vista'); // Profes y alumnos ven contenidos habilitados por defecto
        } else {
            setActiveTab('gestion'); // Admin y otros roles ven gestión
        }
    }, [esProfe, esAlumno]);
    
    // ========== CONFIGURACIÓN DE TEMA ==========
    const isLight = theme === 'lights';
    const textClass = isLight ? 'text-dark' : 'text-light';
    const borderColor = isLight ? '#DEE2E6' : '#3A4255';
    const bgColor = isLight ? '#FFFFFF' : '#1A1F2E';
    const cardBg = isLight ? '#F8F9FA' : '#252A3A';
    const titleColor = '#EF7F1A';
    
    // Extraer ID de carrera
    const carreraId = comision.carrera?.id || comision.carrera_id;
    
    // Cargar datos de la carrera
    useEffect(() => {
        if (!carreraId) {
            setError('La comisión no tiene referencia a carrera');
            return;
        }
        
        const cargarDatos = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const carreraData = await CargarCarreraCompleta(carreraId, null, navigate);
                
                if (!carreraData) {
                    setError('No se pudo cargar la carrera');
                } else {
                    setCarrera(carreraData);
                    
                    inicializarModificaciones(carreraData, comision);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        cargarDatos();
    }, [carreraId, navigate]);
    
    // ========== CORRECCIÓN: Inicializar modificaciones ==========
    const inicializarModificaciones = (carreraData, comisionData) => {
        const mods = {};
        
        // Primero, inicializar todos como false
        carreraData.modulos?.forEach(modulo => {
            const moduloId = (modulo._id || modulo.id).toString();
            
            mods[moduloId] = {
                estado_modulo: false,
                contenidos: {}
            };
            
            modulo.contenidos?.forEach(contenido => {
                const contenidoId = (contenido._id || contenido.id).toString();
                mods[moduloId].contenidos[contenidoId] = false;
            });
        });
        
        // Luego, aplicar progreso existente de la comisión
        if (comisionData.progreso_carrera && comisionData.progreso_carrera.length > 0) {
            comisionData.progreso_carrera.forEach(progModulo => {
                const moduloId = progModulo.modulo_id.toString();
                
                if (mods[moduloId]) {
                    mods[moduloId].estado_modulo = progModulo.estado_modulo || false;
                    
                    progModulo.contenidos.forEach(contenido => {
                        const contenidoId = contenido.contenido_id.toString();
                        if (mods[moduloId].contenidos[contenidoId] !== undefined) {
                            mods[moduloId].contenidos[contenidoId] = contenido.estado_contenido || false;
                        }
                    });
                }
            });
        }
        
        
        setModificaciones(mods);
    };
    
    // ========== FUNCIONES DE MANEJO DE ESTADOS ==========
    const handleModuloChange = (moduloId, checked) => {
        if (!puedeGestionar) return; // 🐋 BALLENITA: Solo roles permitidos
        
        setModificaciones(prev => ({
            ...prev,
            [moduloId]: {
                ...prev[moduloId],
                estado_modulo: checked,
                contenidos: Object.keys(prev[moduloId]?.contenidos || {}).reduce((acc, contId) => {
                    acc[contId] = checked ? prev[moduloId].contenidos[contId] : false;
                    return acc;
                }, {})
            }
        }));
    };
    
    const handleContenidoChange = (moduloId, contenidoId, checked) => {
        if (!puedeGestionar) return; // 🐋 BALLENITA: Solo roles permitidos
        
        setModificaciones(prev => ({
            ...prev,
            [moduloId]: {
                ...prev[moduloId],
                contenidos: {
                    ...prev[moduloId]?.contenidos,
                    [contenidoId]: checked
                }
            }
        }));
    };
    
    const toggleAllContenidos = (moduloId, activar) => {
        if (!puedeGestionar) return; // 🐋 BALLENITA: Solo roles permitidos
        
        setModificaciones(prev => {
            const nuevosContenidos = {};
            Object.keys(prev[moduloId]?.contenidos || {}).forEach(contId => {
                nuevosContenidos[contId] = activar;
            });
            
            return {
                ...prev,
                [moduloId]: {
                    ...prev[moduloId],
                    estado_modulo: activar,
                    contenidos: nuevosContenidos
                }
            };
        });
    };
    
    const prepararProgresoParaGuardar = () => {
        if (!carrera) return [];
        
        const progreso_carrera = [];
        
        carrera.modulos?.forEach((modulo) => {
            const moduloId = (modulo._id || modulo.id).toString();
            const moduloMods = modificaciones[moduloId];
            
            if (moduloMods) {
                const contenidosProgreso = [];
                
                modulo.contenidos?.forEach((contenido) => {
                    const contenidoId = (contenido._id || contenido.id).toString();
                    contenidosProgreso.push({
                        contenido_id: contenido._id || contenido.id,
                        nombre_contenido: contenido.nombre,
                        estado_contenido: moduloMods.contenidos[contenidoId] || false
                    });
                });
                
                progreso_carrera.push({
                    modulo_id: modulo._id || modulo.id,
                    orden_modulo: modulo.orden,
                    nombre_modulo: modulo.nombre,
                    estado_modulo: moduloMods.estado_modulo || false,
                    contenidos: contenidosProgreso
                });
            }
        });
        
        return progreso_carrera;
    };
    
    const handleGuardar = async () => {
        if (!puedeGestionar) return; // 🐋 BALLENITA: Solo roles permitidos
        
        setGuardando(true);
        
        try {
            const progresoData = prepararProgresoParaGuardar();
            const resultado = await GuardarProgresoComision(comision.id, progresoData, navigate);
            
            if (resultado) {
                comision.progreso_carrera = progresoData;
                setShowSaveModal(false);
            }
        } catch (err) {
            console.error('Error al guardar:', err);
        } finally {
            setGuardando(false);
        }
    };
    
    // Calcular estadísticas
    const estadisticas = {
        total_modulos: carrera?.modulos?.length || 0,
        modulos_habilitados: Object.values(modificaciones).filter(m => m?.estado_modulo).length,
        total_contenidos: carrera?.modulos?.reduce((acc, m) => acc + (m.contenidos?.length || 0), 0) || 0,
        contenidos_habilitados: Object.values(modificaciones).reduce((acc, m) => 
            acc + Object.values(m?.contenidos || {}).filter(c => c).length, 0
        )
    };
    
    // ========== COMPONENTE PARA MOSTRAR RECURSOS ==========
    const RecursosContenido = ({ contenido }) => {
        const [showPdfModal, setShowPdfModal] = useState(false);
        const [pdfUrl, setPdfUrl] = useState('');
        const [pdfTitle, setPdfTitle] = useState('');
        const [pdfList, setPdfList] = useState([]);
        const [selectedPdfIndex, setSelectedPdfIndex] = useState(0);

        const verPdfIndividual = (url, nombre) => {
            if (!url) {
                Swal.fire({
                    title: 'Sin URL',
                    text: 'No hay archivo disponible.',
                    icon: 'info',
                    background: isLight ? '#FAF3E1' : '#0A0E17',
                    color: isLight ? '#353432' : '#ebe5e5'
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

        const verMultiplesPdfs = (urls, nombreBase, tipo) => {
            if (!urls || urls.length === 0) {
                Swal.fire({
                    title: 'Sin PDFs',
                    text: 'No hay diapositivas disponibles.',
                    icon: 'info',
                    background: isLight ? '#FAF3E1' : '#0A0E17',
                    color: isLight ? '#353432' : '#ebe5e5'
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

        const PdfModal = () => (
            <Modal
                show={showPdfModal}
                onHide={() => setShowPdfModal(false)}
                size="xl"
                fullscreen="lg-down"
                centered
            >
                <Modal.Header
                    closeButton
                    style={{ 
                        backgroundColor: isLight ? '#FFFFFF' : '#1A1F2E',
                        borderBottomColor: borderColor,
                        color: textClass
                    }}
                >
                    <Modal.Title style={{ color: titleColor }}>
                        <FileEarmarkPdf className="me-2" />
                        {pdfTitle || 'Vista previa del PDF'}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className="p-0" style={{ 
                    backgroundColor: isLight ? '#FFFFFF' : '#1A1F2E',
                    minHeight: '60vh' 
                }}>
                    {pdfList.length > 1 && (
                        <div
                            className="p-3"
                            style={{
                                borderBottom: `1px solid ${borderColor}`,
                                backgroundColor: isLight ? '#f8f9fa' : '#2a3042'
                            }}
                        >
                            <div className="d-flex align-items-center justify-content-between">
                                <span style={{ color: textClass }}>
                                    <strong>PDFs disponibles:</strong> {pdfList.length} archivo(s)
                                </span>
                                <div className="d-flex align-items-center gap-2">
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={() => {
                                            if (selectedPdfIndex > 0) {
                                                setSelectedPdfIndex(selectedPdfIndex - 1);
                                                const driveId = extraerIdDeGoogleDrive(pdfList[selectedPdfIndex - 1].url);
                                                setPdfUrl(driveId ? `https://drive.google.com/file/d/${driveId}/preview` : pdfList[selectedPdfIndex - 1].url);
                                                setPdfTitle(pdfList[selectedPdfIndex - 1].nombre);
                                            }
                                        }}
                                        disabled={selectedPdfIndex === 0}
                                        style={{ borderColor: borderColor, color: textClass }}
                                    >
                                        ← Anterior
                                    </Button>
                                    <span style={{ color: textClass }}>
                                        PDF {selectedPdfIndex + 1} de {pdfList.length}
                                    </span>
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={() => {
                                            if (selectedPdfIndex < pdfList.length - 1) {
                                                setSelectedPdfIndex(selectedPdfIndex + 1);
                                                const driveId = extraerIdDeGoogleDrive(pdfList[selectedPdfIndex + 1].url);
                                                setPdfUrl(driveId ? `https://drive.google.com/file/d/${driveId}/preview` : pdfList[selectedPdfIndex + 1].url);
                                                setPdfTitle(pdfList[selectedPdfIndex + 1].nombre);
                                            }
                                        }}
                                        disabled={selectedPdfIndex === pdfList.length - 1}
                                        style={{ borderColor: borderColor, color: textClass }}
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
                                title="Vista previa del PDF"
                                style={{
                                    border: 'none',
                                    backgroundColor: isLight ? '#FFFFFF' : '#0A0E17'
                                }}
                            />
                        </div>
                    ) : (
                        <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
                            <Spinner animation="border" variant={isLight ? 'primary' : 'light'} />
                            <span className={`ms-2`} style={{ color: textClass }}>Cargando PDF...</span>
                        </div>
                    )}
                </Modal.Body>

                <Modal.Footer style={{ 
                    backgroundColor: isLight ? '#FFFFFF' : '#1A1F2E',
                    borderTopColor: borderColor
                }}>
                    <div className="d-flex justify-content-between w-100 align-items-center">
                        <div>
                            {pdfList[selectedPdfIndex] && (
                                <small style={{ color: textClass }}>
                                    <strong>Tipo:</strong> {pdfList[selectedPdfIndex].tipo === 'clase' ? 'Diapositiva de Clase' :
                                        pdfList[selectedPdfIndex].tipo === 'tutoria' ? 'Diapositiva de Tutoría' :
                                            'Archivo'}
                                </small>
                            )}
                        </div>
                        <div className="d-flex gap-2">
                            <Button
                                variant="outline-secondary"
                                onClick={() => setShowPdfModal(false)}
                                style={{ borderColor: borderColor, color: textClass }}
                            >
                                Cerrar
                            </Button>
                            {pdfUrl && pdfList[selectedPdfIndex] && (
                                <Button
                                    variant="primary"
                                    onClick={() => {
                                        const driveId = extraerIdDeGoogleDrive(pdfList[selectedPdfIndex].url);
                                        if (driveId) {
                                            window.open(`https://drive.google.com/uc?id=${driveId}&export=download`, '_blank');
                                        } else {
                                            window.open(pdfList[selectedPdfIndex].url, '_blank');
                                        }
                                    }}
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
            <>
                <div className="mt-3">
                    <ListGroup>
                        {contenido.clase?.diapositivas && contenido.clase.diapositivas.length > 0 && (
                            <ListGroup.Item style={{ 
                                backgroundColor: isLight ? '#FFFFFF' : '#1A1F2E',
                                borderColor: borderColor,
                                color: textClass
                            }}>
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
                                        style={{ borderColor: borderColor, color: textClass }}
                                    >
                                        <Eye className="me-1" /> Ver
                                    </Button>
                                </div>
                            </ListGroup.Item>
                        )}

                        {contenido.autoaprendizaje?.guia_estudio && (
                            <ListGroup.Item style={{ 
                                backgroundColor: isLight ? '#FFFFFF' : '#1A1F2E',
                                borderColor: borderColor,
                                color: textClass
                            }}>
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
                                        style={{ borderColor: borderColor, color: textClass }}
                                    >
                                        <Eye className="me-1" /> Ver
                                    </Button>
                                </div>
                            </ListGroup.Item>
                        )}

                        {contenido.tutoria && (
                            <>
                                {contenido.tutoria.diapositivas && contenido.tutoria.diapositivas.length > 0 && (
                                    <ListGroup.Item style={{ 
                                        backgroundColor: isLight ? '#FFFFFF' : '#1A1F2E',
                                        borderColor: borderColor,
                                        color: textClass
                                    }}>
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
                                                style={{ borderColor: borderColor, color: textClass }}
                                            >
                                                <Eye className="me-1" /> Ver
                                            </Button>
                                        </div>
                                    </ListGroup.Item>
                                )}

                                {contenido.tutoria.apoyo && (
                                    <ListGroup.Item style={{ 
                                        backgroundColor: isLight ? '#FFFFFF' : '#1A1F2E',
                                        borderColor: borderColor,
                                        color: textClass
                                    }}>
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
                                                style={{ borderColor: borderColor, color: textClass }}
                                            >
                                                <Eye className="me-1" /> Ver
                                            </Button>
                                        </div>
                                    </ListGroup.Item>
                                )}

                                {contenido.tutoria.proyectos && contenido.tutoria.proyectos.length > 0 && (
                                    <ListGroup.Item style={{ 
                                        backgroundColor: isLight ? '#FFFFFF' : '#1A1F2E',
                                        borderColor: borderColor,
                                        color: textClass
                                    }}>
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
                                                backgroundColor: isLight ? '#f8f9fa' : '#2a3042',
                                                border: `1px solid ${borderColor}`
                                            }}>
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <div>
                                                        <strong className="small" style={{ color: textClass }}>Tarea {idx + 1}:</strong>
                                                        <p className="small mb-2" style={{
                                                            color: isLight ? '#6c757d' : '#b0b0b0'
                                                        }}>
                                                            {proyecto.tarea}
                                                        </p>
                                                    </div>
                                                    {proyecto.tarea && (
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            onClick={() => verPdfIndividual(proyecto.tarea, `${contenido.nombre} - Tarea Proyecto ${idx + 1}`)}
                                                            style={{ borderColor: borderColor, color: textClass }}
                                                            title="Ver Tarea"
                                                        >
                                                            <Eye size={12} className="me-1" /> Ver Tarea
                                                        </Button>
                                                    )}
                                                </div>
                                                {proyecto.solucion && (
                                                    <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                                                        <span className="small" style={{ color: textClass }}>Solución:</span>
                                                        <Button
                                                            variant="outline-success"
                                                            size="sm"
                                                            onClick={() => verPdfIndividual(proyecto.solucion, `${contenido.nombre} - Solución Proyecto ${idx + 1}`)}
                                                            style={{ borderColor: borderColor, color: textClass }}
                                                            title="Ver Solución"
                                                        >
                                                            <Eye size={12} className="me-1" /> Ver Solución
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
                                <small className="text-muted">Sin recursos asignados</small>
                            </div>
                        )}
                </div>
                
                <PdfModal />
            </>
        );
    };

    // ========== VISTA DE CONTENIDOS HABILITADOS ==========
    const VistaContenidosHabilitados = () => {
        if (!carrera) return null;
        
        const modulosHabilitados = carrera.modulos?.filter(modulo => {
            const moduloId = (modulo._id || modulo.id).toString();
            return modificaciones[moduloId]?.estado_modulo;
        }) || [];
        
   
        
        return (
            <div>
                <Card style={{ 
                    backgroundColor: isLight ? '#FFFFFF' : '#1A1F2E',
                    borderColor: borderColor,
                    color: textClass
                }}>
                    <Card.Header className="d-flex align-items-center justify-content-between" style={{ 
                        backgroundColor: isLight ? '#FAF3E1' : '#1F2535',
                        borderColor: borderColor,
                        color: textClass
                    }}>
                        <div>
                            <strong>📚 Módulos Habilitados ({modulosHabilitados.length})</strong>
                        </div>
                        <div className="d-flex gap-2">
                            <Badge bg="info">
                                {carrera.modulos?.reduce((total, mod) => total + (mod.contenidos?.length || 0), 0)} contenidos totales
                            </Badge>
                            <Badge bg="secondary">
                                <Clock size={12} className="me-1" />
                                {carrera.duracion}
                            </Badge>
                        </div>
                    </Card.Header>
                    <Card.Body style={{ color: textClass }}>
                        {modulosHabilitados.length === 0 ? (
                            <Alert variant="warning" style={{ 
                                backgroundColor: isLight ? '#FFF3CD' : '#664d03',
                                borderColor: isLight ? '#FFEEBA' : '#ffc107',
                                color: isLight ? '#856404' : '#ffc107'
                            }}>
                                No hay módulos habilitados en esta comisión.
                            </Alert>
                        ) : (
                            <Accordion
                                flush
                                bsPrefix={`accordion ${!isLight ? 'accordion-dark' : ''}`}
                            >
                                {modulosHabilitados.sort((a, b) => a.orden - b.orden).map((modulo, idx) => {
                                    const moduloId = (modulo._id || modulo.id).toString();
                                    const contenidosHabilitados = modulo.contenidos?.filter(contenido => {
                                        const contenidoId = (contenido._id || contenido.id).toString();
                                        return modificaciones[moduloId]?.contenidos[contenidoId];
                                    }) || [];
                                    
                                    return (
                                        <Accordion.Item
                                            key={modulo._id || modulo.id || idx}
                                            eventKey={modulo._id || modulo.id || idx}
                                            className="mb-3"
                                            style={{
                                                borderColor: borderColor,
                                                backgroundColor: isLight ? '#FFFFFF' : '#1F2535'
                                            }}
                                        >
                                            <Accordion.Header>
                                                <div className="d-flex align-items-center justify-content-between w-100">
                                                    <div>
                                                        <strong style={{ color: textClass }}>{modulo.orden}. {modulo.nombre}</strong>
                                                        <Badge bg="success" className="ms-2">
                                                            Habilitado
                                                        </Badge>
                                                        <Badge bg="info" className="ms-2">
                                                            {contenidosHabilitados.length}/{modulo.contenidos?.length || 0} contenidos habilitados
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </Accordion.Header>
                                            <Accordion.Body style={{
                                                backgroundColor: isLight ? '#f8f9fa' : '#2a3042',
                                                color: textClass
                                            }}>
                                                {modulo.descripcion && (
                                                    <div className="mb-3">
                                                        <strong>Descripción:</strong>
                                                        <p className="mt-1">{modulo.descripcion}</p>
                                                    </div>
                                                )}

                                                {contenidosHabilitados.length === 0 ? (
                                                    <Alert variant="info" style={{ 
                                                        backgroundColor: isLight ? '#D1ECF1' : '#0c5460',
                                                        borderColor: isLight ? '#BEE5EB' : '#bee5eb',
                                                        color: isLight ? '#0C5460' : '#d1ecf1'
                                                    }}>
                                                        Este módulo está habilitado, pero no tiene contenidos habilitados.
                                                    </Alert>
                                                ) : (
                                                    <div className="row">
                                                        {contenidosHabilitados.map((contenido, cIdx) => (
                                                            <div key={contenido._id || contenido.id || cIdx} className="col-12 mb-3">
                                                                <Card style={{
                                                                    backgroundColor: isLight ? '#FFFFFF' : '#1F2535',
                                                                    borderColor: borderColor
                                                                }}>
                                                                    <Card.Body style={{ color: textClass }}>
                                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                                            <div>
                                                                                <strong>{contenido.nombre}</strong>
                                                                                <Badge bg="success" className="ms-2">
                                                                                    <CheckCircle className="me-1" /> Habilitado
                                                                                </Badge>
                                                                            </div>
                                                                        </div>

                                                                        <RecursosContenido contenido={contenido} />
                                                                    </Card.Body>
                                                                </Card>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    );
                                })}
                            </Accordion>
                        )}
                    </Card.Body>
                </Card>
            </div>
        );
    };

    // ========== 🐋 BALLENITA: RENDERIZADO PRINCIPAL CON CONTROL DE ROLES ==========
    return (
        <div className="p-4" style={{ backgroundColor: bgColor, minHeight: '100vh' }}>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0" style={{ color: textClass }}>
                    <CalendarCheck className="me-2" style={{ color: titleColor }} />
                    Gestión de Progreso - {comision.nombre}
                </h4>
                
                {/* 🐋 BALLENITA: Botón Guardar Progreso SOLO para roles que pueden gestionar */}
                {puedeGestionar && (
                    <Button 
                        variant="success" 
                        onClick={() => setShowSaveModal(true)}
                        disabled={loading || !carrera}
                    >
                        <Save className="me-2" /> Guardar Progreso
                    </Button>
                )}
            </div>
            
            {/* Info de la comisión */}
            <Card className="mb-4" style={{ 
                backgroundColor: isLight ? '#FFFFFF' : '#1A1F2E',
                borderColor: borderColor,
                color: textClass
            }}>
                <Card.Header style={{ 
                    backgroundColor: isLight ? '#FAF3E1' : '#1F2535',
                    borderColor: borderColor 
                }}>
                    <strong style={{ color: textClass }}>📋 Información de la Comisión</strong>
                </Card.Header>
                <Card.Body style={{ color: textClass }}>
                    <Row>
                        <Col md={6}>
                            <p><strong>Nombre:</strong> {comision.nombre}</p>
                            <p><strong>Carrera:</strong> {comision.carrera_info?.nombre || 'No disponible'}</p>
                            <p><strong>Versión carrera:</strong> {comision.carrera_info?.version || '1.0.0'}</p>
                        </Col>
                        <Col md={6}>
                            <p><strong>Estado comisión:</strong> 
                                <Badge bg={
                                    comision.estado === 'En curso' ? 'success' : 
                                    comision.estado === 'Programada' ? 'warning' : 'secondary'
                                } className="ms-2">
                                    {comision.estado}
                                </Badge>
                            </p>
                            <p><strong>Fecha inicio:</strong> {new Date(comision.fecha_inicio).toLocaleDateString()}</p>
                            <p><strong>Fecha fin:</strong> {new Date(comision.fecha_fin).toLocaleDateString()}</p>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
            
            {/* Estado de carga */}
            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant={isLight ? 'primary' : 'light'} />
                    <p className="mt-3" style={{ color: textClass }}>Cargando carrera...</p>
                </div>
            ) : error ? (
                <Alert variant="danger" style={{ 
                    backgroundColor: isLight ? '#F8D7DA' : '#842029',
                    borderColor: isLight ? '#F5C6CB' : '#842029',
                    color: isLight ? '#721C24' : '#f8d7da'
                }}>
                    <Alert.Heading>Error al cargar la carrera</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            ) : !carrera ? null : (
                <>
                    {/* 🐋 BALLENITA: Tabs con control de roles */}
                    <div className="mb-4">
                        <div className={`border rounded ${isLight ? 'bg-light' : 'bg-dark'}`} style={{ borderColor: borderColor }}>
                            <div className="d-flex">
                                {/* 🐋 BALLENITA: Pestaña Gestión - SOLO si puede gestionar */}
                                {puedeGestionar && (
                                    <Button
                                        variant="link"
                                        className={`flex-grow-1 text-decoration-none text-center py-3 ${activeTab === 'gestion' ? (isLight ? 'bg-white text-dark' : 'bg-secondary text-light') : (isLight ? 'text-dark' : 'text-light')}`}
                                        onClick={() => setActiveTab('gestion')}
                                        style={{
                                            borderRight: `1px solid ${borderColor}`,
                                            borderRadius: 0
                                        }}
                                    >
                                        <ListCheck className="me-2" />
                                        Gestión de Progreso
                                    </Button>
                                )}
                                
                                {/* 🐋 BALLENITA: Pestaña Vista - TODOS pueden ver */}
                                <Button
                                    variant="link"
                                    className={`flex-grow-1 text-decoration-none text-center py-3 ${activeTab === 'vista' ? (isLight ? 'bg-white text-dark' : 'bg-secondary text-light') : (isLight ? 'text-dark' : 'text-light')}`}
                                    onClick={() => setActiveTab('vista')}
                                    style={{ borderRadius: 0 }}
                                >
                                    <Eye className="me-2" />
                                    Vista de Contenidos Habilitados
                                </Button>
                            </div>
                        </div>
                        
                        {/* Contenido de las pestañas */}
                        <div className="mt-3">
                            {/* 🐋 BALLENITA: Gestión SOLO si puede gestionar */}
                            {activeTab === 'gestion' && puedeGestionar && (
                                <Card style={{ 
                                    backgroundColor: isLight ? '#FFFFFF' : '#1A1F2E',
                                    borderColor: borderColor,
                                    color: textClass
                                }}>
                                    <Card.Header className="d-flex justify-content-between align-items-center" style={{ 
                                        backgroundColor: isLight ? '#FAF3E1' : '#1F2535',
                                        borderColor: borderColor 
                                    }}>
                                        <h5 className="mb-0" style={{ color: textClass }}>⚙️ Habilitar/Deshabilitar elementos</h5>
                                        <div>
                                            <Button 
                                                variant="outline-success" 
                                                size="sm" 
                                                className="me-2"
                                                onClick={() => {
                                                    Object.keys(modificaciones).forEach(modId => {
                                                        toggleAllContenidos(modId, true);
                                                    });
                                                }}
                                                style={{ borderColor: borderColor, color: textClass }}
                                            >
                                                <CheckSquare className="me-1" /> Activar todo
                                            </Button>
                                            <Button 
                                                variant="outline-danger" 
                                                size="sm"
                                                onClick={() => {
                                                    Object.keys(modificaciones).forEach(modId => {
                                                        toggleAllContenidos(modId, false);
                                                    });
                                                }}
                                                style={{ borderColor: borderColor, color: textClass }}
                                            >
                                                <Square className="me-1" /> Desactivar todo
                                            </Button>
                                        </div>
                                    </Card.Header>
                                    <Card.Body style={{ color: textClass }}>
                                        <Accordion>
                                            {carrera.modulos?.sort((a, b) => a.orden - b.orden).map((modulo, index) => {
                                                const moduloId = (modulo._id || modulo.id).toString();
                                                const moduloMods = modificaciones[moduloId] || {};
                                                const contenidosHabilitados = Object.values(moduloMods.contenidos || {}).filter(c => c).length;
                                                const totalContenidos = modulo.contenidos?.length || 0;
                                                
                                                return (
                                                    <Accordion.Item 
                                                        key={index} 
                                                        eventKey={index.toString()}
                                                        style={{ 
                                                            borderColor: borderColor,
                                                            backgroundColor: isLight ? '#FFFFFF' : '#1F2535'
                                                        }}
                                                    >
                                                        <Accordion.Header>
                                                            <div className="d-flex align-items-center w-100">
                                                                <Form.Check
                                                                    type="checkbox"
                                                                    checked={moduloMods.estado_modulo || false}
                                                                    onChange={(e) => handleModuloChange(moduloId, e.target.checked)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="me-3"
                                                                    label={
                                                                        <strong style={{ color: textClass }}>
                                                                            Módulo {modulo.orden}: {modulo.nombre}
                                                                        </strong>
                                                                    }
                                                                />
                                                                <span className="ms-auto">
                                                                    <Badge bg={moduloMods.estado_modulo ? "success" : "secondary"} className="me-2">
                                                                        {moduloMods.estado_modulo ? "Habilitado" : "No habilitado"}
                                                                    </Badge>
                                                                    <Badge bg="info">
                                                                        {contenidosHabilitados}/{totalContenidos} contenidos
                                                                    </Badge>
                                                                </span>
                                                            </div>
                                                        </Accordion.Header>
                                                        <Accordion.Body style={{ 
                                                            backgroundColor: isLight ? '#f8f9fa' : '#2a3042',
                                                            color: textClass
                                                        }}>
                                                            {modulo.descripcion && (
                                                                <p className="text-muted mb-3">{modulo.descripcion}</p>
                                                            )}
                                                            
                                                            <div className="mb-3">
                                                                <Button 
                                                                    variant="outline-success" 
                                                                    size="sm" 
                                                                    className="me-2"
                                                                    onClick={() => toggleAllContenidos(moduloId, true)}
                                                                    disabled={!moduloMods.estado_modulo}
                                                                    style={{ borderColor: borderColor, color: textClass }}
                                                                >
                                                                    Habilitar todos los contenidos
                                                                </Button>
                                                                <Button 
                                                                    variant="outline-danger" 
                                                                    size="sm"
                                                                    onClick={() => toggleAllContenidos(moduloId, false)}
                                                                    disabled={!moduloMods.estado_modulo}
                                                                    style={{ borderColor: borderColor, color: textClass }}
                                                                >
                                                                    Deshabilitar todos los contenidos
                                                                </Button>
                                                            </div>
                                                            
                                                            {modulo.contenidos?.map((contenido, cIndex) => {
                                                                const contenidoId = (contenido._id || contenido.id).toString();
                                                                const contenidoHabilitado = moduloMods.contenidos?.[contenidoId] || false;
                                                                
                                                                return (
                                                                    <Card 
                                                                        key={cIndex} 
                                                                        className="mb-2" 
                                                                        style={{ 
                                                                            borderColor: borderColor,
                                                                            backgroundColor: isLight ? '#FFFFFF' : '#1F2535'
                                                                        }}
                                                                    >
                                                                        <Card.Body className="py-2" style={{ color: textClass }}>
                                                                            <div className="d-flex align-items-center">
                                                                                <Form.Check
                                                                                    type="checkbox"
                                                                                    id={`contenido-${moduloId}-${contenidoId}`}
                                                                                    checked={contenidoHabilitado}
                                                                                    onChange={(e) => handleContenidoChange(moduloId, contenidoId, e.target.checked)}
                                                                                    label={
                                                                                        <strong style={{ color: textClass }}>
                                                                                            {contenido.nombre}
                                                                                        </strong>
                                                                                    }
                                                                                    className="flex-grow-1"
                                                                                    disabled={!moduloMods.estado_modulo}
                                                                                />
                                                                                <div className="ms-3">
                                                                                    {contenidoHabilitado ? (
                                                                                        <CheckCircle className="text-success" size={20} />
                                                                                    ) : (
                                                                                        <Circle className="text-secondary" size={20} />
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </Card.Body>
                                                                    </Card>
                                                                );
                                                            })}
                                                        </Accordion.Body>
                                                    </Accordion.Item>
                                                );
                                            })}
                                        </Accordion>
                                    </Card.Body>
                                </Card>
                            )}
                            
                            {/* 🐋 BALLENITA: Vista - TODOS los roles pueden ver */}
                            {(activeTab === 'vista' || (esAlumno && activeTab === 'vista')) && (
                                <VistaContenidosHabilitados />
                            )}
                        </div>
                    </div>
                </>
            )}
            
            {/* 🐋 BALLENITA: Modal para guardar - SOLO roles que pueden gestionar */}
            {puedeGestionar && (
                <Modal show={showSaveModal} onHide={() => !guardando && setShowSaveModal(false)}>
                    <Modal.Header closeButton style={{ 
                        backgroundColor: isLight ? '#FFFFFF' : '#1A1F2E',
                        color: textClass
                    }}>
                        <Modal.Title style={{ color: textClass }}>💾 Guardar progreso de la comisión</Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ 
                        backgroundColor: isLight ? '#FFFFFF' : '#1A1F2E',
                        color: textClass
                    }}>
                        <p>¿Estás seguro de que quieres guardar los siguientes cambios en la base de datos?</p>
                        
                        <div className="alert alert-info">
                            <strong>Resumen de cambios a guardar:</strong>
                            <ul className="mb-0 mt-2">
                                <li><strong>Módulos habilitados:</strong> {estadisticas.modulos_habilitados} de {estadisticas.total_modulos}</li>
                                <li><strong>Contenidos habilitados:</strong> {estadisticas.contenidos_habilitados} de {estadisticas.total_contenidos}</li>
                            </ul>
                        </div>
                        
                        <Alert variant="warning" className="mt-3">
                            <strong>⚠️ Importante:</strong> 
                            <ul className="mb-0 mt-2">
                                <li>Los cambios se guardarán en la base de datos</li>
                                <li>Los estudiantes solo verán los elementos habilitados</li>
                                <li>Esta acción no se puede deshacer automáticamente</li>
                            </ul>
                        </Alert>
                    </Modal.Body>
                    <Modal.Footer style={{ 
                        backgroundColor: isLight ? '#FFFFFF' : '#1A1F2E',
                        color: textClass
                    }}>
                        <Button 
                            variant="secondary" 
                            onClick={() => setShowSaveModal(false)}
                            disabled={guardando}
                            style={{ borderColor: borderColor }}
                        >
                            Cancelar
                        </Button>
                        <Button 
                            variant="success" 
                            onClick={handleGuardar}
                            disabled={guardando}
                        >
                            {guardando ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="me-2" /> Guardar en base de datos
                                </>
                            )}
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </div>
    );
};

export default PanelProgresoComision;
