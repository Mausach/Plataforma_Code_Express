import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Button, 
  Spinner, 
  Alert, 
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
  Clock,
  InfoCircle,
  ExclamationTriangle,
  ChevronDown,
  ChevronUp,
  Download,
  CloudUpload,
  FileEarmarkZip,
  ShieldLock
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
    
    // Estados para expansión de módulos y contenidos
    const [expandedModulos, setExpandedModulos] = useState({});
    const [expandedContenidos, setExpandedContenidos] = useState({});
    
    // ========== 🐋 BALLENITA: CONTROL DE ROLES ==========
    const rolUsuario = usuario?.rol || 'alumno';
    const esAlumno = rolUsuario === 'alumno';
    const esProfe = rolUsuario === 'profe';
    const esAdmin = rolUsuario === 'admin';
    const esCoordinador = rolUsuario === 'cordinador';
    const esCorrector = rolUsuario === 'corrector';
    const esAcompaniante = rolUsuario === 'acompañante';
    
    // Roles que pueden ver soluciones (profesores y administrativos)
    const puedeVerSoluciones = ['profe', 'admin', 'cordinador', 'corrector', 'acompañante'].includes(rolUsuario);
    
    // Roles que pueden editar/gestionar (NO alumnos)
    const puedeGestionar = !esAlumno;
    
    // ========== 🐋 BALLENITA: SETEAR TAB POR DEFECTO SEGÚN ROL ==========
    useEffect(() => {
        if (esProfe || esAlumno) {
            setActiveTab('vista');
        } else {
            setActiveTab('gestion');
        }
    }, [esProfe, esAlumno]);
    
    // ========== CONFIGURACIÓN DE TEMA MEJORADA ==========
    const isLight = theme === 'lights';
    
    // Colores principales
    const colors = {
        primary: '#EF7F1A',
        primaryHover: '#d96f0e',
        text: isLight ? '#212529' : '#e9ecef',
        textMuted: isLight ? '#6c757d' : '#adb5bd',
        textLight: isLight ? '#f8f9fa' : '#f8f9fa',
        background: isLight ? '#f8f9fa' : '#0A0E17',
        cardBg: isLight ? '#ffffff' : '#1A1F2E',
        cardHeaderBg: isLight ? '#f8f9fa' : '#252A3A',
        border: isLight ? '#dee2e6' : '#3A4255',
        inputBg: isLight ? '#ffffff' : '#2a3042',
        disabledBg: isLight ? '#e9ecef' : '#363c4e',
        accordionBg: isLight ? '#ffffff' : '#1F2535',
        accordionBodyBg: isLight ? '#f8f9fa' : '#2a3042',
        success: isLight ? '#198754' : '#2ecc71',
        warning: isLight ? '#ffc107' : '#f39c12',
        danger: isLight ? '#dc3545' : '#e74c3c',
        info: isLight ? '#0dcaf0' : '#3498db'
    };
    
    // Clases dinámicas
    const textClass = `text-${isLight ? 'dark' : 'light'}`;
    const borderColor = colors.border;
    const bgColor = colors.background;
    const cardBg = colors.cardBg;
    const titleColor = colors.primary;
    
    // Funciones para expansión
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
        if (!puedeGestionar) return;
        
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
        if (!puedeGestionar) return;
        
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
        if (!puedeGestionar) return;
        
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
        if (!puedeGestionar) return;
        
        setGuardando(true);
        
        try {
            const progresoData = prepararProgresoParaGuardar();
            const resultado = await GuardarProgresoComision(comision.id, progresoData, navigate);
            
            if (resultado) {
                comision.progreso_carrera = progresoData;
                setShowSaveModal(false);
                
                // Mostrar éxito
                Swal.fire({
                    icon: 'success',
                    title: '¡Guardado!',
                    text: 'El progreso se ha guardado correctamente',
                    background: colors.cardBg,
                    color: colors.text,
                    confirmButtonColor: colors.primary
                });
            }
        } catch (err) {
            console.error('Error al guardar:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo guardar el progreso',
                background: colors.cardBg,
                color: colors.text,
                confirmButtonColor: colors.danger
            });
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
    
    // ========== 🐋 BALLENITA: FUNCIONES PARA MANEJO DE GOOGLE DRIVE ==========
    
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
            // Patrones para diferentes formatos de Google Drive
            const patrones = [
                // Formato: /file/d/{ID}/view
                /(?:https?:\/\/)?(?:drive\.google\.com\/)?file\/d\/([a-zA-Z0-9_-]+)/,
                // Formato: /open?id={ID}
                /(?:https?:\/\/)?(?:drive\.google\.com\/)?open\?id=([a-zA-Z0-9_-]+)/,
                // Formato: /uc?id={ID}
                /(?:https?:\/\/)?(?:drive\.google\.com\/)?uc\?id=([a-zA-Z0-9_-]+)/,
                // Formato: id={ID} directo
                /id=([a-zA-Z0-9_-]+)/,
                // Formato: /presentation/d/{ID}
                /(?:https?:\/\/)?(?:docs\.google\.com\/)?presentation\/d\/([a-zA-Z0-9_-]+)/,
                // Formato: /document/d/{ID}
                /(?:https?:\/\/)?(?:docs\.google\.com\/)?document\/d\/([a-zA-Z0-9_-]+)/
            ];
            
            let fileId = null;
            
            // Buscar el ID en todos los patrones
            for (const patron of patrones) {
                const match = url.match(patron);
                if (match && match[1]) {
                    fileId = match[1];
                    break;
                }
            }
            
            // Si encontramos un ID, construir URL de descarga directa
            if (fileId) {
                return `https://drive.google.com/uc?export=download&confirm=t&id=${fileId}`;
            }
            
            // Si no es Google Drive, devolver la URL original
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
        if (url.match(/\.(mp4|avi|mov|wmv)$/)) {
            return 'video';
        }
        if (url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
            return 'imagen';
        }
        return 'web';
    };
    
    const getIconoPorTipo = (url) => {
        const tipo = detectarTipoArchivo(url);
        
        switch(tipo) {
            case 'google-drive':
                return <CloudUpload size={14} className="me-1" />;
            case 'pdf':
                return <FileEarmarkPdf size={14} className="me-1" />;
            case 'comprimido':
                return <FileEarmarkZip size={14} className="me-1" />;
            case 'word':
                return <FileText size={14} className="me-1" />;
            case 'excel':
                return <FileText size={14} className="me-1" />;
            case 'powerpoint':
                return <FileText size={14} className="me-1" />;
            default:
                return <Download size={14} className="me-1" />;
        }
    };
    
    const descargarArchivo = async (url, nombreArchivo) => {
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
            // Mostrar loading
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
    
            // Transformar URL si es de Google Drive
            const urlDescarga = transformarADescargaDirecta(url);
            
            // Crear un enlace temporal
            const link = document.createElement('a');
            link.href = urlDescarga;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            
            // Si el nombre del archivo está disponible, sugerirlo
            if (nombreArchivo) {
                let nombreLimpio = nombreArchivo.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                const tipo = detectarTipoArchivo(url);
                if (tipo === 'pdf' && !nombreLimpio.endsWith('.pdf')) {
                    nombreLimpio += '.pdf';
                }
                link.download = nombreLimpio;
            }
            
            // Simular clic
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Cerrar loading
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
        } else {
            window.open(url, '_blank');
        }
    };
    
    // ========== COMPONENTE PARA MOSTRAR RECURSOS (VERSIÓN CORREGIDA) ==========
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
                    background: colors.cardBg,
                    color: colors.text,
                    confirmButtonColor: colors.primary
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
                    background: colors.cardBg,
                    color: colors.text,
                    confirmButtonColor: colors.primary
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
                        backgroundColor: colors.cardBg,
                        borderBottomColor: colors.border,
                        color: colors.text
                    }}
                    closeVariant={isLight ? 'dark' : 'white'}
                >
                    <Modal.Title style={{ color: titleColor }}>
                        <FileEarmarkPdf className="me-2" />
                        {pdfTitle || 'Vista previa del PDF'}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className="p-0" style={{ 
                    backgroundColor: colors.cardBg,
                    minHeight: '60vh' 
                }}>
                    {pdfList.length > 1 && (
                        <div
                            className="p-3"
                            style={{
                                borderBottom: `1px solid ${colors.border}`,
                                backgroundColor: colors.cardHeaderBg
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
                                        onClick={() => {
                                            if (selectedPdfIndex > 0) {
                                                setSelectedPdfIndex(selectedPdfIndex - 1);
                                                const driveId = extraerIdDeGoogleDrive(pdfList[selectedPdfIndex - 1].url);
                                                setPdfUrl(driveId ? `https://drive.google.com/file/d/${driveId}/preview` : pdfList[selectedPdfIndex - 1].url);
                                                setPdfTitle(pdfList[selectedPdfIndex - 1].nombre);
                                            }
                                        }}
                                        disabled={selectedPdfIndex === 0}
                                        style={{ 
                                            borderColor: colors.border, 
                                            color: colors.text
                                        }}
                                    >
                                        ← Anterior
                                    </Button>
                                    <span style={{ color: colors.text }}>
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
                                title="Vista previa del PDF"
                                style={{
                                    border: 'none',
                                    backgroundColor: colors.background
                                }}
                            />
                        </div>
                    ) : (
                        <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
                            <Spinner animation="border" variant={isLight ? 'primary' : 'light'} />
                            <span className="ms-2" style={{ color: colors.text }}>Cargando PDF...</span>
                        </div>
                    )}
                </Modal.Body>

                <Modal.Footer style={{ 
                    backgroundColor: colors.cardBg,
                    borderTopColor: colors.border
                }}>
                    <div className="d-flex justify-content-between w-100 align-items-center">
                        <div>
                            {pdfList[selectedPdfIndex] && (
                                <small style={{ color: colors.textMuted }}>
                                    <strong>Tipo:</strong> {
                                        pdfList[selectedPdfIndex].tipo === 'clase' ? 'Diapositiva de Clase' :
                                        pdfList[selectedPdfIndex].tipo === 'tutoria' ? 'Diapositiva de Tutoría' : 'Archivo'
                                    }
                                </small>
                            )}
                        </div>
                        <div className="d-flex gap-2">
                            <Button
                                variant="outline-secondary"
                                onClick={() => setShowPdfModal(false)}
                                style={{ 
                                    borderColor: colors.border, 
                                    color: colors.text
                                }}
                            >
                                Cerrar
                            </Button>
                            {pdfUrl && pdfList[selectedPdfIndex] && (
                                <Button
                                    variant="primary"
                                    onClick={() => {
                                        descargarArchivo(
                                            pdfList[selectedPdfIndex].url,
                                            pdfList[selectedPdfIndex].nombre
                                        );
                                    }}
                                    style={{ 
                                        backgroundColor: titleColor, 
                                        borderColor: titleColor,
                                        color: '#ffffff'
                                    }}
                                >
                                    {getIconoPorTipo(pdfList[selectedPdfIndex].url)}
                                    Descargar
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
                        {/* CLASE - SOLO VER (sin descargar) */}
                        {contenido.clase?.diapositivas && contenido.clase.diapositivas.length > 0 && (
                            <ListGroup.Item style={{ 
                                backgroundColor: colors.cardBg,
                                borderColor: colors.border,
                                color: colors.text
                            }}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center">
                                        <Book className="me-2" style={{ color: colors.info }} />
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
                                        style={{ 
                                            borderColor: colors.border, 
                                            color: colors.text
                                        }}
                                    >
                                        <Eye className="me-1" size={14} /> Ver
                                    </Button>
                                </div>
                            </ListGroup.Item>
                        )}

                        {/* AUTOAPRENDIZAJE - VER y DESCARGAR */}
                        {contenido.autoaprendizaje?.guia_estudio && (
                            <ListGroup.Item style={{ 
                                backgroundColor: colors.cardBg,
                                borderColor: colors.border,
                                color: colors.text
                            }}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center">
                                        <JournalBookmarkFill className="me-2" style={{ color: colors.success }} />
                                        <div>
                                            <strong style={{ color: colors.text }}>Guía de Estudio</strong>
                                            <div className="small" style={{ color: colors.textMuted }}>Autoaprendizaje</div>
                                        </div>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <Button
                                            variant="outline-success"
                                            size="sm"
                                            onClick={() => verPdfIndividual(contenido.autoaprendizaje.guia_estudio, `${contenido.nombre} - Guía de Estudio`)}
                                            style={{ 
                                                borderColor: colors.border, 
                                                color: colors.text
                                            }}
                                        >
                                            <Eye className="me-1" size={14} /> Ver
                                        </Button>
                                        <Button
                                            variant="outline-success"
                                            size="sm"
                                            onClick={() => descargarArchivo(
                                                contenido.autoaprendizaje.guia_estudio,
                                                `${contenido.nombre} - Guía de Estudio`
                                            )}
                                            style={{ 
                                                borderColor: colors.border, 
                                                color: colors.text
                                            }}
                                        >
                                            {getIconoPorTipo(contenido.autoaprendizaje.guia_estudio)}
                                            Descargar
                                        </Button>
                                    </div>
                                </div>
                            </ListGroup.Item>
                        )}

                        {/* TUTORÍA - VER y DESCARGAR */}
                        {contenido.tutoria && (
                            <>
                                {contenido.tutoria.diapositivas && contenido.tutoria.diapositivas.length > 0 && (
                                    <ListGroup.Item style={{ 
                                        backgroundColor: colors.cardBg,
                                        borderColor: colors.border,
                                        color: colors.text
                                    }}>
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
                                            <div className="d-flex gap-2">
                                                <Button
                                                    variant="outline-info"
                                                    size="sm"
                                                    onClick={() => verMultiplesPdfs(contenido.tutoria.diapositivas, `${contenido.nombre} - Tutoría`, 'tutoria')}
                                                    style={{ 
                                                        borderColor: colors.border, 
                                                        color: colors.text
                                                    }}
                                                >
                                                    <Eye className="me-1" size={14} /> Ver
                                                </Button>
                                                <Button
                                                    variant="outline-info"
                                                    size="sm"
                                                    onClick={() => descargarArchivo(
                                                        contenido.tutoria.diapositivas[0],
                                                        `${contenido.nombre} - Tutoría.zip`
                                                    )}
                                                    style={{ 
                                                        borderColor: colors.border, 
                                                        color: colors.text
                                                    }}
                                                >
                                                    {getIconoPorTipo(contenido.tutoria.diapositivas[0])}
                                                    Descargar
                                                </Button>
                                            </div>
                                        </div>
                                    </ListGroup.Item>
                                )}

                                {contenido.tutoria.apoyo && (
                                    <ListGroup.Item style={{ 
                                        backgroundColor: colors.cardBg,
                                        borderColor: colors.border,
                                        color: colors.text
                                    }}>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="d-flex align-items-center">
                                                <FileEarmarkPdf className="me-2" style={{ color: colors.warning }} />
                                                <div>
                                                    <strong style={{ color: colors.text }}>Material de Apoyo</strong>
                                                    <div className="small" style={{ color: colors.textMuted }}>Recursos adicionales</div>
                                                </div>
                                            </div>
                                            <div className="d-flex gap-2">
                                                <Button
                                                    variant="outline-warning"
                                                    size="sm"
                                                    onClick={() => verPdfIndividual(contenido.tutoria.apoyo, `${contenido.nombre} - Material de Apoyo`)}
                                                    style={{ 
                                                        borderColor: colors.border, 
                                                        color: colors.text
                                                    }}
                                                >
                                                    <Eye className="me-1" size={14} /> Ver
                                                </Button>
                                                <Button
                                                    variant="outline-warning"
                                                    size="sm"
                                                    onClick={() => descargarArchivo(
                                                        contenido.tutoria.apoyo,
                                                        `${contenido.nombre} - Material de Apoyo`
                                                    )}
                                                    style={{ 
                                                        borderColor: colors.border, 
                                                        color: colors.text
                                                    }}
                                                >
                                                    {getIconoPorTipo(contenido.tutoria.apoyo)}
                                                    Descargar
                                                </Button>
                                            </div>
                                        </div>
                                    </ListGroup.Item>
                                )}

                                {/* PROYECTOS - Solo para profesores la SOLUCIÓN */}
                                {contenido.tutoria.proyectos && contenido.tutoria.proyectos.length > 0 && (
                                    <ListGroup.Item style={{ 
                                        backgroundColor: colors.cardBg,
                                        borderColor: colors.border,
                                        color: colors.text
                                    }}>
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
                                                backgroundColor: colors.accordionBodyBg,
                                                border: `1px solid ${colors.border}`
                                            }}>
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <div>
                                                        <strong className="small" style={{ color: colors.text }}>Proyecto {idx + 1}:</strong>
                                                        <p className="small mb-2" style={{ color: colors.textMuted }}>
                                                            {proyecto.tarea}
                                                        </p>
                                                    </div>
                                                    {proyecto.tarea && (
                                                        <div className="d-flex gap-2">
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                onClick={() => verPdfIndividual(proyecto.tarea, `${contenido.nombre} - Proyecto ${idx + 1}`)}
                                                                style={{ 
                                                                    borderColor: colors.border, 
                                                                    color: colors.text
                                                                }}
                                                                title="Ver Proyecto"
                                                            >
                                                                <Eye size={12} className="me-1" /> Ver
                                                            </Button>
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                onClick={() => descargarArchivo(
                                                                    proyecto.tarea,
                                                                    `${contenido.nombre} - Proyecto ${idx + 1}`
                                                                )}
                                                                style={{ 
                                                                    borderColor: colors.border, 
                                                                    color: colors.text
                                                                }}
                                                                title="Descargar Proyecto"
                                                            >
                                                                {getIconoPorTipo(proyecto.tarea)}
                                                                Descargar
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* SOLUCIÓN - Solo visible para profesores */}
                                                {proyecto.solucion && puedeVerSoluciones && (
                                                    <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top" style={{ borderTopColor: colors.border }}>
                                                        <div className="d-flex align-items-center">
                                                            <ShieldLock size={14} className="me-1" style={{ color: colors.warning }} />
                                                            <span className="small" style={{ color: colors.textMuted }}>Solución (solo profesores):</span>
                                                        </div>
                                                        <div className="d-flex gap-2">
                                                            <Button
                                                                variant="outline-success"
                                                                size="sm"
                                                                onClick={() => verPdfIndividual(proyecto.solucion, `${contenido.nombre} - Solución Proyecto ${idx + 1}`)}
                                                                style={{ 
                                                                    borderColor: colors.border, 
                                                                    color: colors.text
                                                                }}
                                                                title="Ver Solución"
                                                            >
                                                                <Eye size={12} className="me-1" /> Ver
                                                            </Button>
                                                            <Button
                                                                variant="outline-success"
                                                                size="sm"
                                                                onClick={() => descargarArchivo(
                                                                    proyecto.solucion, 
                                                                    `${contenido.nombre} - Solución Proyecto ${idx + 1}`
                                                                )}
                                                                style={{ 
                                                                    borderColor: colors.border, 
                                                                    color: colors.text
                                                                }}
                                                                title="Descargar Solución"
                                                            >
                                                                {getIconoPorTipo(proyecto.solucion)}
                                                                Descargar
                                                            </Button>
                                                        </div>
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
                    backgroundColor: colors.cardBg,
                    borderColor: colors.border,
                    color: colors.text
                }}>
                    <Card.Header className="d-flex align-items-center justify-content-between" style={{ 
                        backgroundColor: colors.cardHeaderBg,
                        borderColor: colors.border,
                        color: colors.text
                    }}>
                        <div>
                            <strong style={{ color: colors.text }}>📚 Módulos Habilitados ({modulosHabilitados.length})</strong>
                        </div>
                        <div className="d-flex gap-2">
                            <Badge style={{ backgroundColor: colors.info, color: '#ffffff' }}>
                                {carrera.modulos?.reduce((total, mod) => total + (mod.contenidos?.length || 0), 0)} contenidos totales
                            </Badge>
                            <Badge style={{ backgroundColor: colors.textMuted, color: '#ffffff' }}>
                                <Clock size={12} className="me-1" />
                                {carrera.duracion}
                            </Badge>
                        </div>
                    </Card.Header>
                    <Card.Body style={{ color: colors.text }}>
                        {modulosHabilitados.length === 0 ? (
                            <Alert variant="warning" style={{ 
                                backgroundColor: isLight ? '#fff3cd' : '#856404',
                                borderColor: isLight ? '#ffecb5' : '#856404',
                                color: isLight ? '#856404' : '#fff3cd'
                            }}>
                                <ExclamationTriangle className="me-2" />
                                No hay módulos habilitados en esta comisión.
                            </Alert>
                        ) : (
                            <div>
                                {modulosHabilitados.sort((a, b) => a.orden - b.orden).map((modulo, idx) => {
                                    const moduloId = (modulo._id || modulo.id).toString();
                                    const contenidosHabilitados = modulo.contenidos?.filter(contenido => {
                                        const contenidoId = (contenido._id || contenido.id).toString();
                                        return modificaciones[moduloId]?.contenidos[contenidoId];
                                    }) || [];
                                    
                                    return (
                                        <Card
                                            key={modulo._id || modulo.id || idx}
                                            className="mb-3"
                                            style={{
                                                borderColor: colors.border,
                                                backgroundColor: colors.cardBg
                                            }}
                                        >
                                            {/* HEADER DEL MÓDULO - CLICKEABLE */}
                                            <Card.Header
                                                onClick={() => toggleModulo(moduloId)}
                                                style={{
                                                    backgroundColor: colors.cardHeaderBg,
                                                    borderColor: colors.border,
                                                    color: colors.text,
                                                    cursor: 'pointer'
                                                }}
                                                className="d-flex align-items-center justify-content-between"
                                            >
                                                <div className="d-flex align-items-center">
                                                    {expandedModulos[moduloId] ? 
                                                        <ChevronUp className="me-2" style={{ color: titleColor }} /> : 
                                                        <ChevronDown className="me-2" style={{ color: colors.textMuted }} />
                                                    }
                                                    <strong style={{ color: colors.text }}>
                                                        {modulo.orden}. {modulo.nombre}
                                                    </strong>
                                                    <Badge className="ms-2" style={{ backgroundColor: colors.success, color: '#ffffff' }}>
                                                        Habilitado
                                                    </Badge>
                                                    <Badge className="ms-2" style={{ backgroundColor: colors.info, color: '#ffffff' }}>
                                                        {contenidosHabilitados.length}/{modulo.contenidos?.length || 0} habilitados
                                                    </Badge>
                                                </div>
                                            </Card.Header>

                                            {/* BODY DEL MÓDULO - CONDICIONAL */}
                                            {expandedModulos[moduloId] && (
                                                <Card.Body style={{
                                                    backgroundColor: colors.accordionBodyBg,
                                                    color: colors.text
                                                }}>
                                                    {modulo.descripcion && (
                                                        <div className="mb-3">
                                                            <strong style={{ color: colors.text }}>Descripción:</strong>
                                                            <p className="mt-1" style={{ color: colors.textMuted }}>{modulo.descripcion}</p>
                                                        </div>
                                                    )}

                                                    {contenidosHabilitados.length === 0 ? (
                                                        <Alert variant="info" style={{ 
                                                            backgroundColor: isLight ? '#d1ecf1' : '#117a8b',
                                                            borderColor: isLight ? '#bee5eb' : '#117a8b',
                                                            color: isLight ? '#0c5460' : '#d1ecf1'
                                                        }}>
                                                            <InfoCircle className="me-2" />
                                                            Este módulo está habilitado, pero no tiene contenidos habilitados.
                                                        </Alert>
                                                    ) : (
                                                        <div className="row">
                                                            {contenidosHabilitados.map((contenido, cIdx) => (
                                                                <div key={contenido._id || contenido.id || cIdx} className="col-12 mb-3">
                                                                    <Card style={{
                                                                        backgroundColor: colors.cardBg,
                                                                        borderColor: colors.border
                                                                    }}>
                                                                        <Card.Body style={{ color: colors.text }}>
                                                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                                                <div>
                                                                                    <strong style={{ color: colors.text }}>{contenido.nombre}</strong>
                                                                                    <Badge className="ms-2" style={{ backgroundColor: colors.success, color: '#ffffff' }}>
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
                                                </Card.Body>
                                            )}
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </div>
        );
    };

    // ========== RENDERIZADO PRINCIPAL CON CONTROL DE ROLES ==========
    return (
        <div className="p-4" style={{ backgroundColor: colors.background, minHeight: '100vh', color: colors.text }}>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0" style={{ color: colors.text }}>
                    <CalendarCheck className="me-2" style={{ color: titleColor }} />
                    Gestión de Progreso - {comision.nombre}
                </h4>
                
                {puedeGestionar && (
                    <Button 
                        variant="success" 
                        onClick={() => setShowSaveModal(true)}
                        disabled={loading || !carrera}
                        style={{ 
                            backgroundColor: colors.success,
                            borderColor: colors.success,
                            color: '#ffffff'
                        }}
                    >
                        <Save className="me-2" /> Guardar Progreso
                    </Button>
                )}
            </div>
            
            {/* Info de la comisión */}
            <Card className="mb-4" style={{ 
                backgroundColor: colors.cardBg,
                borderColor: colors.border,
                color: colors.text
            }}>
                <Card.Header style={{ 
                    backgroundColor: colors.cardHeaderBg,
                    borderColor: colors.border,
                    color: colors.text
                }}>
                    <strong style={{ color: colors.text }}>📋 Información de la Comisión</strong>
                </Card.Header>
                <Card.Body style={{ color: colors.text }}>
                    <Row>
                        <Col md={6}>
                            <p style={{ color: colors.text }}><strong>Nombre:</strong> {comision.nombre}</p>
                            <p style={{ color: colors.text }}><strong>Carrera:</strong> {comision.carrera_info?.nombre || 'No disponible'}</p>
                            <p style={{ color: colors.text }}><strong>Versión carrera:</strong> {comision.carrera_info?.version || '1.0.0'}</p>
                        </Col>
                        <Col md={6}>
                            <p style={{ color: colors.text }}><strong>Estado comisión:</strong> 
                                <Badge className="ms-2" style={{ 
                                    backgroundColor: comision.estado === 'En curso' ? colors.success :
                                                   comision.estado === 'Programada' ? colors.warning : colors.textMuted,
                                    color: '#ffffff'
                                }}>
                                    {comision.estado}
                                </Badge>
                            </p>
                            <p style={{ color: colors.text }}><strong>Fecha inicio:</strong> {new Date(comision.fecha_inicio).toLocaleDateString()}</p>
                            <p style={{ color: colors.text }}><strong>Fecha fin:</strong> {new Date(comision.fecha_fin).toLocaleDateString()}</p>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
            
            {/* Estado de carga */}
            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant={isLight ? 'primary' : 'light'} />
                    <p className="mt-3" style={{ color: colors.textMuted }}>Cargando carrera...</p>
                </div>
            ) : error ? (
                <Alert variant="danger" style={{ 
                    backgroundColor: isLight ? '#f8d7da' : '#842029',
                    borderColor: isLight ? '#f5c6cb' : '#842029',
                    color: isLight ? '#721c24' : '#f8d7da'
                }}>
                    <Alert.Heading><ExclamationTriangle className="me-2" />Error al cargar la carrera</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            ) : !carrera ? null : (
                <>
                    {/* Tabs con control de roles */}
                    <div className="mb-4">
                        <div className="border rounded" style={{ borderColor: colors.border, backgroundColor: colors.cardHeaderBg }}>
                            <div className="d-flex">
                                {puedeGestionar && (
                                    <Button
                                        variant="link"
                                        className={`flex-grow-1 text-decoration-none text-center py-3`}
                                        onClick={() => setActiveTab('gestion')}
                                        style={{
                                            borderRight: `1px solid ${colors.border}`,
                                            borderRadius: 0,
                                            color: activeTab === 'gestion' ? titleColor : colors.text,
                                            backgroundColor: activeTab === 'gestion' ? colors.cardBg : 'transparent',
                                            fontWeight: activeTab === 'gestion' ? 'bold' : 'normal'
                                        }}
                                    >
                                        <ListCheck className="me-2" />
                                        Gestión de Progreso
                                    </Button>
                                )}
                                
                                <Button
                                    variant="link"
                                    className={`flex-grow-1 text-decoration-none text-center py-3`}
                                    onClick={() => setActiveTab('vista')}
                                    style={{
                                        borderRadius: 0,
                                        color: activeTab === 'vista' ? titleColor : colors.text,
                                        backgroundColor: activeTab === 'vista' ? colors.cardBg : 'transparent',
                                        fontWeight: activeTab === 'vista' ? 'bold' : 'normal'
                                    }}
                                >
                                    <Eye className="me-2" />
                                    Vista de Contenidos Habilitados
                                </Button>
                            </div>
                        </div>
                        
                        {/* Contenido de las pestañas */}
                        <div className="mt-3">
                            {activeTab === 'gestion' && puedeGestionar && (
                                <Card style={{ 
                                    backgroundColor: colors.cardBg,
                                    borderColor: colors.border,
                                    color: colors.text
                                }}>
                                    <Card.Header className="d-flex justify-content-between align-items-center" style={{ 
                                        backgroundColor: colors.cardHeaderBg,
                                        borderColor: colors.border,
                                        color: colors.text
                                    }}>
                                        <h5 className="mb-0" style={{ color: colors.text }}>⚙️ Habilitar/Deshabilitar elementos</h5>
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
                                                style={{ 
                                                    borderColor: colors.success, 
                                                    color: colors.success
                                                }}
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
                                                style={{ 
                                                    borderColor: colors.danger, 
                                                    color: colors.danger
                                                }}
                                            >
                                                <Square className="me-1" /> Desactivar todo
                                            </Button>
                                        </div>
                                    </Card.Header>
                                    <Card.Body style={{ color: colors.text }}>
                                        <div>
                                            {carrera.modulos?.sort((a, b) => a.orden - b.orden).map((modulo, index) => {
                                                const moduloId = (modulo._id || modulo.id).toString();
                                                const moduloMods = modificaciones[moduloId] || {};
                                                const contenidosHabilitados = Object.values(moduloMods.contenidos || {}).filter(c => c).length;
                                                const totalContenidos = modulo.contenidos?.length || 0;
                                                
                                                return (
                                                    <Card
                                                        key={index}
                                                        className="mb-3"
                                                        style={{
                                                            borderColor: colors.border,
                                                            backgroundColor: colors.cardBg
                                                        }}
                                                    >
                                                        {/* HEADER DEL MÓDULO - CLICKEABLE */}
                                                        <Card.Header
                                                            onClick={() => toggleModulo(moduloId)}
                                                            style={{
                                                                backgroundColor: colors.cardHeaderBg,
                                                                borderColor: colors.border,
                                                                color: colors.text,
                                                                cursor: 'pointer'
                                                            }}
                                                            className="d-flex align-items-center justify-content-between"
                                                        >
                                                            <div className="d-flex align-items-center w-100">
                                                                <div className="d-flex align-items-center" onClick={(e) => e.stopPropagation()}>
                                                                    <Form.Check
                                                                        type="checkbox"
                                                                        checked={moduloMods.estado_modulo || false}
                                                                        onChange={(e) => handleModuloChange(moduloId, e.target.checked)}
                                                                        className="me-3"
                                                                        label={
                                                                            <strong style={{ color: colors.text }}>
                                                                                Módulo {modulo.orden}: {modulo.nombre}
                                                                            </strong>
                                                                        }
                                                                    />
                                                                </div>
                                                                <span className="ms-auto d-flex align-items-center">
                                                                    {expandedModulos[moduloId] ? 
                                                                        <ChevronUp className="ms-2" style={{ color: titleColor }} /> : 
                                                                        <ChevronDown className="ms-2" style={{ color: colors.textMuted }} />
                                                                    }
                                                                </span>
                                                            </div>
                                                        </Card.Header>

                                                        {/* BODY DEL MÓDULO - CONDICIONAL */}
                                                        {expandedModulos[moduloId] && (
                                                            <Card.Body style={{
                                                                backgroundColor: colors.accordionBodyBg,
                                                                color: colors.text
                                                            }}>
                                                                <div className="mb-3 d-flex justify-content-between align-items-center">
                                                                    <div>
                                                                        <Badge className="me-2" style={{
                                                                            backgroundColor: moduloMods.estado_modulo ? colors.success : colors.textMuted,
                                                                            color: '#ffffff'
                                                                        }}>
                                                                            {moduloMods.estado_modulo ? "Habilitado" : "No habilitado"}
                                                                        </Badge>
                                                                        <Badge style={{ backgroundColor: colors.info, color: '#ffffff' }}>
                                                                            {contenidosHabilitados}/{totalContenidos} contenidos
                                                                        </Badge>
                                                                    </div>
                                                                    <div>
                                                                        <Button 
                                                                            variant="outline-success" 
                                                                            size="sm" 
                                                                            className="me-2"
                                                                            onClick={() => toggleAllContenidos(moduloId, true)}
                                                                            disabled={!moduloMods.estado_modulo}
                                                                            style={{ 
                                                                                borderColor: colors.success, 
                                                                                color: colors.success
                                                                            }}
                                                                        >
                                                                            Habilitar todos
                                                                        </Button>
                                                                        <Button 
                                                                            variant="outline-danger" 
                                                                            size="sm"
                                                                            onClick={() => toggleAllContenidos(moduloId, false)}
                                                                            disabled={!moduloMods.estado_modulo}
                                                                            style={{ 
                                                                                borderColor: colors.danger, 
                                                                                color: colors.danger
                                                                            }}
                                                                        >
                                                                            Deshabilitar todos
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                                
                                                                {modulo.descripcion && (
                                                                    <p className="mb-3" style={{ color: colors.textMuted }}>{modulo.descripcion}</p>
                                                                )}
                                                                
                                                                {modulo.contenidos?.map((contenido, cIndex) => {
                                                                    const contenidoId = (contenido._id || contenido.id).toString();
                                                                    const contenidoHabilitado = moduloMods.contenidos?.[contenidoId] || false;
                                                                    
                                                                    return (
                                                                        <Card 
                                                                            key={cIndex} 
                                                                            className="mb-2" 
                                                                            style={{ 
                                                                                borderColor: colors.border,
                                                                                backgroundColor: colors.cardBg
                                                                            }}
                                                                        >
                                                                            <Card.Body className="py-2" style={{ color: colors.text }}>
                                                                                <div className="d-flex align-items-center">
                                                                                    <Form.Check
                                                                                        type="checkbox"
                                                                                        id={`contenido-${moduloId}-${contenidoId}`}
                                                                                        checked={contenidoHabilitado}
                                                                                        onChange={(e) => handleContenidoChange(moduloId, contenidoId, e.target.checked)}
                                                                                        label={
                                                                                            <strong style={{ color: colors.text }}>
                                                                                                {contenido.nombre}
                                                                                            </strong>
                                                                                        }
                                                                                        className="flex-grow-1"
                                                                                        disabled={!moduloMods.estado_modulo}
                                                                                    />
                                                                                    <div className="ms-3">
                                                                                        {contenidoHabilitado ? (
                                                                                            <CheckCircle style={{ color: colors.success }} size={20} />
                                                                                        ) : (
                                                                                            <Circle style={{ color: colors.textMuted }} size={20} />
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </Card.Body>
                                                                        </Card>
                                                                    );
                                                                })}
                                                            </Card.Body>
                                                        )}
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    </Card.Body>
                                </Card>
                            )}
                            
                            {(activeTab === 'vista' || (esAlumno && activeTab === 'vista')) && (
                                <VistaContenidosHabilitados />
                            )}
                        </div>
                    </div>
                </>
            )}
            
            {/* Modal para guardar - SOLO roles que pueden gestionar */}
            {puedeGestionar && (
                <Modal show={showSaveModal} onHide={() => !guardando && setShowSaveModal(false)}>
                    <Modal.Header closeButton style={{ 
                        backgroundColor: colors.cardBg,
                        borderBottomColor: colors.border,
                        color: colors.text
                    }} closeVariant={isLight ? 'dark' : 'white'}>
                        <Modal.Title style={{ color: colors.text }}>
                            <Save className="me-2" style={{ color: titleColor }} />
                            Guardar progreso de la comisión
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ 
                        backgroundColor: colors.cardBg,
                        color: colors.text
                    }}>
                        <p style={{ color: colors.text }}>¿Estás seguro de que quieres guardar los siguientes cambios en la base de datos?</p>
                        
                        <div className="alert" style={{ 
                            backgroundColor: colors.info + '20',
                            borderColor: colors.info,
                            color: colors.text
                        }}>
                            <strong style={{ color: colors.text }}>Resumen de cambios a guardar:</strong>
                            <ul className="mb-0 mt-2">
                                <li style={{ color: colors.text }}>
                                    <strong>Módulos habilitados:</strong> {estadisticas.modulos_habilitados} de {estadisticas.total_modulos}
                                </li>
                                <li style={{ color: colors.text }}>
                                    <strong>Contenidos habilitados:</strong> {estadisticas.contenidos_habilitados} de {estadisticas.total_contenidos}
                                </li>
                            </ul>
                        </div>
                        
                        <Alert variant="warning" className="mt-3" style={{ 
                            backgroundColor: isLight ? '#fff3cd' : '#856404',
                            borderColor: isLight ? '#ffecb5' : '#856404',
                            color: isLight ? '#856404' : '#fff3cd'
                        }}>
                            <ExclamationTriangle className="me-2" />
                            <strong>Importante:</strong> 
                            <ul className="mb-0 mt-2">
                                <li>Los cambios se guardarán en la base de datos</li>
                                <li>Los estudiantes solo verán los elementos habilitados</li>
                                <li>Esta acción no se puede deshacer automáticamente</li>
                            </ul>
                        </Alert>
                    </Modal.Body>
                    <Modal.Footer style={{ 
                        backgroundColor: colors.cardBg,
                        borderTopColor: colors.border,
                        color: colors.text
                    }}>
                        <Button 
                            variant="secondary" 
                            onClick={() => setShowSaveModal(false)}
                            disabled={guardando}
                            style={{ 
                                borderColor: colors.border, 
                                color: colors.text,
                                backgroundColor: 'transparent'
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button 
                            variant="success" 
                            onClick={handleGuardar}
                            disabled={guardando}
                            style={{ 
                                backgroundColor: colors.success,
                                borderColor: colors.success,
                                color: '#ffffff'
                            }}
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
