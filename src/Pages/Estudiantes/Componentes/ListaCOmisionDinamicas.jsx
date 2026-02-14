import React, { useEffect, useState } from 'react';
import {
    Button, Card, Row, Col, Form,
    Spinner, Alert, Badge
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Book, Clock, CheckCircle, PlayCircle } from 'react-bootstrap-icons';

// Importamos nuestro helper específico
import CargarComisionesUsuario from '../Helpers/CargarComisionDeUsuario';
import CardComision from '../../Admin/Componentes/Subcomponentes/Cards_Comision';
import PanelDinamicoComision from '../../Admin/Componentes/GestComiciones';

export const ListaComisionesDin = ({ theme, usuario }) => {
    const navigate = useNavigate();
    


    // 🔥 NORMALIZAR USUARIO: Aceptar tanto _id como id
    const usuarioNormalizado = {
        id: usuario?._id || usuario?.id,  // ✅ Toma _id del MongoDB o id del front
        _id: usuario?._id || usuario?.id,
        nombres: usuario?.nombres || 'Usuario',
        apellido: usuario?.apellido || '',
        email: usuario?.email || '',
        legajo: usuario?.legajo || 'N/A',
        dni: usuario?.dni || '',
        telefono: usuario?.telefono || '',
        provincia: usuario?.provincia || '',
        fecha_nacimiento: usuario?.fecha_nacimiento || '',
        genero: usuario?.genero || '',
        rol: usuario?.rol || 'alumno'
    };



    // Estados principales
    const [comisiones, setComisiones] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshData, setRefreshData] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para vista detallada
    const [selectedComision, setSelectedComision] = useState(null);
    const [viewMode, setViewMode] = useState('list');

    // Estadísticas
    const [stats, setStats] = useState({
        activas: 0,
        finalizadas: 0,
        progreso_promedio: 0
    });

    // Clases según tema
    const cardClass = theme === 'lights' ? 'card-light' : 'card-dark';
    const textClass = theme === 'lights' ? 'text-dark' : 'text-light';
    const borderColor = theme === 'lights' ? '#E0D8C5' : '#1F2535';
    const titleColor = '#EF7F1A';

    // ✅ VALIDACIÓN CORREGIDA: No tiene llaves {}
    if (!usuario || !usuarioNormalizado.id) {
        console.error('❌ Usuario no válido:', usuario);
        return (
            <Alert variant="danger" className={`${cardClass} ${textClass}`}>
                <Alert.Heading>Error de autenticación</Alert.Heading>
                <p>No se pudo identificar al estudiante. Por favor, inicia sesión nuevamente.</p>
                <Button variant="primary" onClick={() => navigate('/login')}>
                    Ir a Login
                </Button>
            </Alert>
        );
    }

    // Cargar comisiones del alumno
    useEffect(() => {
        const cargarComisiones = async () => {
            if (!usuarioNormalizado.id) {
                setError('No se pudo identificar al estudiante');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

             
                
                // ✅ Usar el ID normalizado
                const comisionesData = await CargarComisionesUsuario(
                    usuarioNormalizado.id,
                    setComisiones,
                    navigate
                );

                // ✅ Usar comisionesData si existe
                const data = comisionesData || comisiones;

                // Calcular estadísticas
                if (data && data.length > 0) {
                    const activas = data.filter(c => c.estado === 'En curso').length;
                    const finalizadas = data.filter(c => c.estado === 'Finalizada').length;

                    let progresoTotal = 0;
                    data.forEach(c => {
                        const progreso = c.progreso_resumen?.modulos_completados || 0;
                        const total = c.progreso_resumen?.modulos_totales || 1;
                        progresoTotal += (progreso / total * 100);
                    });

                    setStats({
                        activas,
                        finalizadas,
                        progreso_promedio: data.length > 0
                            ? Math.round(progresoTotal / data.length)
                            : 0
                    });
                }

            } catch (error) {
                console.error('❌ Error cargando comisiones:', error);
                setError('Error al cargar tus comisiones. Por favor, intenta nuevamente.');
            } finally {
                setLoading(false);
            }
        };

        cargarComisiones();
    }, [refreshData, navigate, usuarioNormalizado.id]); // ✅ Dependencia con ID normalizado

    // Handlers
    const handleSelectComision = (comision) => {
        setSelectedComision(comision);
        setViewMode('detalle');
    };

    const handleBackToList = () => {
        setViewMode('list');
        setSelectedComision(null);
        setRefreshData(prev => !prev);
    };

    const handleRefresh = () => {
        setRefreshData(prev => !prev);
    };

    // Filtro de búsqueda
    const filteredComisiones = comisiones.filter(comision => {
        if (!searchTerm.trim()) return true;
        const searchLower = searchTerm.toLowerCase();

        return (
            comision.nombre?.toLowerCase().includes(searchLower) ||
            comision.carrera_info?.nombre?.toLowerCase().includes(searchLower) ||
            comision.modalidad?.toLowerCase().includes(searchLower) ||
            comision.estado?.toLowerCase().includes(searchLower) ||
            `${comision.horario_comision?.hora_inicio || ''} ${comision.horario_comision?.hora_fin || ''}`.includes(searchLower)
        );
    });

    // Ordenar comisiones
    const comisionesOrdenadas = [...filteredComisiones].sort((a, b) => {
        if (a.estado === 'En curso' && b.estado !== 'En curso') return -1;
        if (a.estado !== 'En curso' && b.estado === 'En curso') return 1;

        const progresoA = a.progreso_resumen?.modulos_completados || 0;
        const progresoB = b.progreso_resumen?.modulos_completados || 0;
        if (progresoA !== progresoB) return progresoA - progresoB;

        return new Date(b.inscripcion?.fecha || 0) - new Date(a.inscripcion?.fecha || 0);
    });

    // Loading state
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="text-center">
                    <Spinner
                        animation="border"
                        variant={theme === 'lights' ? 'primary' : 'light'}
                        style={{ width: '3rem', height: '3rem' }}
                    />
                    <p className={`mt-3 ${textClass}`}>
                        Cargando tus comisiones...
                    </p>
                    <small className="text-muted">
                        Estudiante: {usuarioNormalizado.nombres} {usuarioNormalizado.apellido}
                    </small>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <Alert variant="danger" className={`${cardClass} ${textClass} border-0 shadow-sm`}>
                <Alert.Heading className="d-flex align-items-center">
                    <span className="fs-4 me-2">⚠️</span> Error al cargar
                </Alert.Heading>
                <p>{error}</p>
                <div className="d-flex gap-2">
                    <Button variant="outline-danger" onClick={handleRefresh}>
                        Reintentar
                    </Button>
                    <Button variant="outline-secondary" onClick={() => navigate('/dashboard')}>
                        Ir al Dashboard
                    </Button>
                </div>
            </Alert>
        );
    }

    // Renderizar Panel de Detalle
    if (viewMode === 'detalle' && selectedComision) {
        return (
            <PanelDinamicoComision
                comision={selectedComision}
                theme={theme}
                onBack={handleBackToList}
                usuario={usuario}
            />
        );
    }

    // Renderizar Lista de Comisiones
    return (
        <div className={`card ${cardClass} card-with-shadow p-4`}>
            {/* Header */}
            <div className="mb-4">
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                        <div className="d-flex align-items-center gap-2 mb-2">
                            <h2 style={{ color: titleColor, margin: 0 }}>
                                🎓 Mis Comisiones
                            </h2>
                            <Badge
                                bg="warning"
                                style={{
                                    backgroundColor: titleColor,
                                    padding: '0.5rem 1rem',
                                    borderRadius: '20px'
                                }}
                            >
                                <span className="text-white fw-bold">
                                    {comisiones.length} {comisiones.length === 1 ? 'inscripción' : 'inscripciones'}
                                </span>
                            </Badge>
                        </div>

                        {/* Info del estudiante - usando usuarioNormalizado */}
                        <p className={`${textClass} mb-1`}>
                            <span className="fw-bold">{usuarioNormalizado.nombres} {usuarioNormalizado.apellido}</span>
                            <span className="mx-2">•</span>
                            <span className="text-muted">Legajo: {usuarioNormalizado.legajo || 'N/A'}</span>
                            <span className="mx-2">•</span>
                            <span className="text-muted">{usuarioNormalizado.email}</span>
                        </p>

                        {/* Stats rápidas */}
                        <div className="d-flex gap-3 mt-2">
                            <div className="d-flex align-items-center">
                                <PlayCircle className="me-1" style={{ color: '#28a745' }} />
                                <span className={textClass}>
                                    <strong>{stats.activas}</strong> activas
                                </span>
                            </div>
                            <div className="d-flex align-items-center">
                                <CheckCircle className="me-1" style={{ color: '#6c757d' }} />
                                <span className={textClass}>
                                    <strong>{stats.finalizadas}</strong> finalizadas
                                </span>
                            </div>
                            <div className="d-flex align-items-center">
                                <Clock className="me-1" style={{ color: titleColor }} />
                                <span className={textClass}>
                                    <strong>{stats.progreso_promedio}%</strong> progreso promedio
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Botón para ver comisiones disponibles */}
                    <Button
                        variant="outline-primary"
                        onClick={() => navigate('/comisiones-disponibles')}
                        style={{
                            borderColor: titleColor,
                            color: titleColor,
                            padding: '0.5rem 1.5rem',
                            borderRadius: '8px'
                        }}
                        className="d-flex align-items-center"
                    >
                        <Book className="me-2" />
                        + Inscribirme
                    </Button>
                </div>
            </div>

            {/* Buscador */}
            <Row className="mb-4">
                <Col md={12}>
                    <Form.Group>
                        <Form.Control
                            type="text"
                            placeholder="🔍 Buscar por materia, horario, modalidad..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`
                                ${theme === 'lights' ? 'bg-white text-dark' : 'bg-dark text-light'}
                                border-0 shadow-sm
                            `}
                            style={{
                                borderColor: borderColor,
                                padding: '0.75rem 1rem',
                                borderRadius: '10px'
                            }}
                        />
                    </Form.Group>
                </Col>
            </Row>

            {/* Grid de Cards */}
            <Row>
                {comisionesOrdenadas.length > 0 ? (
                    comisionesOrdenadas.map((comision) => (
                        <Col key={comision._id} md={6} lg={4} className="mb-4">
                            <CardComision
                                comision={comision}
                                theme={theme}
                                onSelect={handleSelectComision}
                                titleColor={titleColor}
                            />
                        </Col>
                    ))
                ) : (
                    <Col md={12}>
                        <Card className={`text-center py-5 ${cardClass}`} style={{
                            borderColor: borderColor,
                            borderRadius: '15px',
                            borderStyle: 'dashed',
                            borderWidth: '2px'
                        }}>
                            <Card.Body>
                                <div className="mb-4">
                                    <Book size={64} className="text-muted" />
                                </div>
                                <h4 className="mb-3" style={{ color: titleColor }}>
                                    {searchTerm ? 'Sin resultados' : 'No estás inscrito en ninguna comisión'}
                                </h4>
                                <p className="text-muted mb-4 px-5">
                                    {searchTerm
                                        ? `No encontramos comisiones que coincidan con "${searchTerm}"`
                                        : 'Comienza inscribiéndote en una comisión para ver tu progreso académico.'}
                                </p>
                                {!searchTerm && (
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        onClick={() => navigate('/comisiones-disponibles')}
                                        style={{
                                            backgroundColor: titleColor,
                                            borderColor: titleColor,
                                            padding: '0.75rem 2rem',
                                            borderRadius: '10px'
                                        }}
                                        className="d-inline-flex align-items-center"
                                    >
                                        <Book className="me-2" />
                                        Ver comisiones disponibles
                                    </Button>
                                )}
                                {searchTerm && (
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => setSearchTerm('')}
                                        className="d-inline-flex align-items-center"
                                    >
                                        Limpiar búsqueda
                                    </Button>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                )}
            </Row>

            {/* Footer */}
            {comisiones.length > 0 && (
                <div className={`mt-4 pt-3 text-center ${textClass}`} style={{
                    borderTop: `1px solid ${borderColor}40`
                }}>
                    <small className="text-muted">
                        <Clock className="me-1" />
                        Última actualización: {new Date().toLocaleDateString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </small>
                </div>
            )}
        </div>
    );
};

export default ListaComisionesDin;