import React, { useState, useEffect } from 'react';
import { 
  Button, Card, Row, Col, 
  Container, Badge 
} from 'react-bootstrap';
import { 
  ArrowLeft, GraphUp, CalendarCheck, 
  People, Book, Briefcase, 
  ShieldLock, Person, FileText
} from 'react-bootstrap-icons';

// Importar componentes
import PanelAsistencias from './Subcomponentes/PanelAsistencias';
import PanelProgresoComision from './Subcomponentes/Panel_progreso';
import PanelTrabajos from './Subcomponentes/PanelTrabajos';
import PanelInscripcion from './Subcomponentes/PanelInscripciones';
import PanelClasesAsistencia from './Subcomponentes/PanelClase';

export const PanelDinamicoComision = ({ comision, theme, onBack, usuario }) => {
  // Estado para controlar qué panel está activo
  const [activePanel, setActivePanel] = useState('progreso');
  
  // 🔥 NORMALIZAR USUARIO (IGUAL QUE EN EL NAVBAR)
  const usuarioNormalizado = {
    id: usuario?._id || usuario?.id,
    _id: usuario?._id || usuario?.id,
    nombres: usuario?.nombres || usuario?.nombre || 'Usuario',
    apellido: usuario?.apellido || '',
    email: usuario?.email || '',
    rol: (usuario?.rol || 'alumno').toLowerCase(),
    dni: usuario?.dni || '',
    legajo: usuario?.legajo || usuario?.dni || ''
  };

  

  // 🔥 CONFIGURACIÓN DINÁMICA DE OPCIONES SEGÚN EL ROL (IGUAL QUE EL NAVBAR)
  const getOpcionesPorRol = () => {
    const rol = usuarioNormalizado.rol;
    
    // ============ CONFIGURACIÓN DE PANELES POR ROL ============
    const configPaneles = {
      // ADMIN: Ve todo
      admin: [
        { id: 'progreso', nombre: 'Progreso', icono: <GraphUp size={20} />, color: '#EF7F1A', descripcion: 'Seguimiento del progreso' },
        { id: 'clases', nombre: 'Clases', icono: <CalendarCheck size={20} />, color: '#10B981', descripcion: 'Gestión de clases' },
        { id: 'inscripciones', nombre: 'Inscripciones', icono: <FileText size={20} />, color: '#9C27B0', descripcion: 'Gestión de inscripciones' },
        { id: 'trabajos', nombre: 'Trabajos', icono: <Briefcase size={20} />, color: '#8B5CF6', descripcion: 'Gestión de trabajos' }
      ],
      
      // PROFE: Progreso, Clases, Asistencias, Trabajos
      profe: [
        { id: 'progreso', nombre: 'Progreso', icono: <GraphUp size={20} />, color: '#EF7F1A', descripcion: 'Seguimiento del progreso' },
        { id: 'clases', nombre: 'Clases', icono: <CalendarCheck size={20} />, color: '#10B981', descripcion: 'Mis clases' },
        { id: 'trabajos', nombre: 'Trabajos', icono: <Briefcase size={20} />, color: '#8B5CF6', descripcion: 'Trabajos de la comisión' }
      ],
      
      // ALUMNO: Progreso y Trabajos
      alumno: [
        { id: 'progreso', nombre: 'Progreso', icono: <GraphUp size={20} />, color: '#EF7F1A', descripcion: 'Mi progreso académico' },
        { id: 'trabajos', nombre: 'Trabajos', icono: <Briefcase size={20} />, color: '#8B5CF6', descripcion: 'Mis trabajos prácticos' }
      ],
      
      // COORDINADOR: Igual que admin (a definir bien)
      cordinador: [
        { id: 'progreso', nombre: 'Progreso', icono: <GraphUp size={20} />, color: '#EF7F1A', descripcion: 'Seguimiento del progreso' },
        { id: 'clases', nombre: 'Clases', icono: <CalendarCheck size={20} />, color: '#10B981', descripcion: 'Gestión de clases' },
        { id: 'inscripciones', nombre: 'Inscripciones', icono: <FileText size={20} />, color: '#9C27B0', descripcion: 'Gestión de inscripciones' },
        { id: 'trabajos', nombre: 'Trabajos', icono: <Briefcase size={20} />, color: '#8B5CF6', descripcion: 'Gestión de trabajos' }
      ],
      
      // ACOMPAÑANTE: Progreso e Inscripciones
      acompañante: [
        { id: 'progreso', nombre: 'Progreso', icono: <GraphUp size={20} />, color: '#EF7F1A', descripcion: 'Seguimiento del progreso' },
        { id: 'inscripciones', nombre: 'Inscripciones', icono: <FileText size={20} />, color: '#9C27B0', descripcion: 'Gestión de inscripciones' }
      ],
      
      // CORRECTOR: Solo Trabajos
      corrector: [
        { id: 'trabajos', nombre: 'Trabajos', icono: <Briefcase size={20} />, color: '#8B5CF6', descripcion: 'Trabajos a corregir' }
      ]
    };

    // Obtener la configuración para el rol actual, o usar alumno como fallback
    const paneles = configPaneles[rol] || configPaneles.alumno;
    
    // Mapear los paneles a componentes reales
    return paneles.map(panel => {
      let componente;
      
      switch(panel.id) {
        case 'progreso':
          componente = <PanelProgresoComision comision={comision} theme={theme} usuario={usuarioNormalizado} />;
          break;
        case 'clases':
          componente = <PanelClasesAsistencia comision={comision} theme={theme} usuario={usuarioNormalizado} />;
          break;
        case 'inscripciones':
          componente = <PanelInscripcion comision={comision} theme={theme} modo="inscripciones" usuario={usuarioNormalizado} />;
          break;
        case 'trabajos':
          componente = <PanelTrabajos comision={comision} theme={theme} usuario={usuarioNormalizado} />;
          break;
        default:
          componente = null;
      }
      
      return {
        ...panel,
        componente
      };
    });
  };

  // Obtener opciones según el rol
  const opcionesPrincipales = getOpcionesPorRol();

  // 🔥 DEBUG: Ver qué opciones tiene cada rol
  

  // Si no hay opciones, mostrar mensaje
  if (opcionesPrincipales.length === 0) {
    return (
      <Container fluid className="p-4 text-center">
        <Card className="border-0 shadow-sm p-5">
          <ShieldLock size={48} className="mb-3 text-muted" />
          <h4>Sin acceso</h4>
          <p className="text-muted">
            No tienes permisos para ver este panel
          </p>
          <Button variant="primary" onClick={onBack}>
            <ArrowLeft className="me-2" />
            Volver
          </Button>
        </Card>
      </Container>
    );
  }

  // Configurar primer panel activo si el actual no está disponible
  useEffect(() => {
    if (!opcionesPrincipales.find(o => o.id === activePanel)) {
      setActivePanel(opcionesPrincipales[0]?.id || 'progreso');
    }
  }, [usuarioNormalizado.rol, opcionesPrincipales]);

  // Configuración del tema
  const isLight = theme === 'lights';
  const bgColor = isLight ? '#FFFFFF' : '#1A1F2E';
  const cardBg = isLight ? '#F8F9FA' : '#252A3A';
  const textColor = isLight ? '#212529' : '#E9ECEF';
  const borderColor = isLight ? '#DEE2E6' : '#3A4255';
  const hoverColor = isLight ? '#E9ECEF' : '#3A4255';

  // Encontrar la opción activa
  const opcionActiva = opcionesPrincipales.find(p => p.id === activePanel) || opcionesPrincipales[0];

  // 🔥 CONFIGURACIÓN DE ROL (IGUAL QUE EL NAVBAR)
  const getRolConfig = () => {
    const rol = usuarioNormalizado.rol;
    
    const config = {
      alumno: { color: '#EF7F1A', nombre: 'Estudiante', icono: '🎓' },
      profe: { color: '#4CAF50', nombre: 'Profesor', icono: '👨‍🏫' },
      acompañante: { color: '#2196F3', nombre: 'Acompañante', icono: '👥' },
      cordinador: { color: '#9C27B0', nombre: 'Coordinador', icono: '📋' },
      corrector: { color: '#FF9800', nombre: 'Corrector', icono: '✅' },
      admin: { color: '#F44336', nombre: 'Admin', icono: '⚙️' }
    };

    return config[rol] || config.alumno;
  };

  const rolConfig = getRolConfig();

  // Obtener gradiente según el rol
  const getGradientByRol = () => {
    const gradients = {
      alumno: 'linear-gradient(135deg, #EF7F1A 0%, #D96B0E 100%)',
      profe: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
      acompañante: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
      cordinador: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
      corrector: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
      admin: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)'
    };
    return gradients[usuarioNormalizado.rol] || gradients.alumno;
  };

  return (
    <Container fluid className="p-0">
      {/* Header superior */}
      <Card 
        className="border-0 rounded-0 shadow-sm"
        style={{ 
          backgroundColor: bgColor,
          borderBottom: `2px solid ${borderColor}`
        }}
      >
        <Card.Body className="py-3">
          <Row className="align-items-center">
            <Col xs={12} md={6}>
              <div className="d-flex align-items-center">
                {/* BOTÓN VOLVER */}
                <Button
                  variant="outline-secondary"
                  onClick={onBack}
                  className="me-3 d-flex align-items-center"
                  size="sm"
                >
                  <ArrowLeft className="me-1" size={18} />
                  Volver
                </Button>
                
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <h4 
                      className="mb-0"
                      style={{ color: textColor }}
                    >
                      {comision.nombre}
                    </h4>
                    {/* BADGE DE ROL - IGUAL QUE EL NAVBAR */}
                    <Badge
                      style={{
                        backgroundColor: rolConfig.color,
                        color: 'white',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem'
                      }}
                    >
                      <Person size={12} className="me-1" />
                      {rolConfig.nombre}
                    </Badge>
                  </div>
                  <div className="d-flex align-items-center flex-wrap">
                    <Badge 
                      bg={comision.estado === 'En curso' ? 'success' : 'secondary'}
                      className="me-2 mb-1"
                    >
                      {comision.estado}
                    </Badge>
                    <Badge 
                      bg={isLight ? 'light' : 'dark'}
                      text={isLight ? 'dark' : 'light'}
                      className="me-2 mb-1"
                    >
                      <Book size={12} className="me-1" />
                      {comision.carrera_info?.nombre || 'Carrera'}
                    </Badge>
                    <span 
                      className="small mb-1"
                      style={{ color: isLight ? '#6C757D' : '#ADB5BD' }}
                    >
                      {comision.modalidad}
                    </span>
                  </div>
                </div>
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div className="d-flex justify-content-end align-items-center">
                <div className="me-3">
                  <small 
                    className="d-block text-end"
                    style={{ color: isLight ? '#6C757D' : '#ADB5BD' }}
                  >
                    Período
                  </small>
                  <div 
                    className="small fw-bold"
                    style={{ color: textColor }}
                  >
                    {new Date(comision.fecha_inicio).toLocaleDateString()} - {new Date(comision.fecha_fin).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Navegación principal - CONFIGURACIÓN DINÁMICA POR ROL */}
      <div 
        className="py-3"
        style={{ 
          backgroundColor: cardBg,
          borderBottom: `1px solid ${borderColor}`
        }}
      >
        <Container fluid>
          <Row className="g-2">
            {opcionesPrincipales.map((opcion) => (
              <Col 
                key={opcion.id} 
                xs={6} 
                md={Math.floor(12 / opcionesPrincipales.length)} 
                className="mb-1 mb-md-0"
              >
                <Card 
                  className={`h-100 border-0 cursor-pointer ${activePanel === opcion.id ? 'shadow' : ''}`}
                  style={{ 
                    backgroundColor: activePanel === opcion.id ? bgColor : 'transparent',
                    borderLeft: activePanel === opcion.id ? `4px solid ${opcion.color}` : '4px solid transparent',
                    transition: 'all 0.3s',
                    minHeight: '90px',
                    cursor: 'pointer'
                  }}
                  onClick={() => setActivePanel(opcion.id)}
                  onMouseEnter={(e) => {
                    if (activePanel !== opcion.id) {
                      e.currentTarget.style.backgroundColor = hoverColor;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activePanel !== opcion.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <Card.Body className="py-3 px-3">
                    <div className="d-flex align-items-center">
                      <div 
                        className="rounded-circle p-2 me-3 flex-shrink-0"
                        style={{ 
                          backgroundColor: activePanel === opcion.id ? opcion.color : `${opcion.color}20`,
                          color: activePanel === opcion.id ? '#FFFFFF' : opcion.color
                        }}
                      >
                        {opcion.icono}
                      </div>
                      <div className="flex-grow-1">
                        <h6 
                          className="mb-1"
                          style={{ 
                            color: activePanel === opcion.id ? opcion.color : textColor,
                            fontSize: '0.95rem'
                          }}
                        >
                          {opcion.nombre}
                        </h6>
                        <small 
                          className="d-block text-truncate"
                          style={{ 
                            color: isLight ? '#6C757D' : '#ADB5BD',
                            fontSize: '0.75rem'
                          }}
                        >
                          {opcion.descripcion}
                        </small>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      {/* Contenido principal del panel activo */}
      <Container fluid className="py-4">
        <Card 
          className="border-0 shadow-sm"
          style={{ 
            backgroundColor: bgColor
          }}
        >
          <Card.Body className="p-3 p-md-4">
            {/* Header del panel activo con gradiente del rol */}
            <div className="mb-4">
              <div className="d-flex align-items-center mb-2">
                <div 
                  className="rounded-circle p-2 me-3"
                  style={{ 
                    background: getGradientByRol(),
                    color: '#FFFFFF'
                  }}
                >
                  {opcionActiva.icono}
                </div>
                <div>
                  <div className="d-flex align-items-center gap-2">
                    <h4 
                      className="mb-0"
                      style={{ color: textColor }}
                    >
                      {opcionActiva.nombre}
                    </h4>
                    <Badge
                      style={{
                        backgroundColor: `${rolConfig.color}20`,
                        color: rolConfig.color,
                        border: `1px solid ${rolConfig.color}`,
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.7rem'
                      }}
                    >
                      {rolConfig.nombre}
                    </Badge>
                  </div>
                  <small 
                    className="d-block"
                    style={{ 
                      color: isLight ? '#6C757D' : '#ADB5BD'
                    }}
                  >
                    {comision.nombre} • {opcionActiva.descripcion}
                  </small>
                </div>
              </div>
            </div>

            {/* Contenido del panel activo */}
            <div style={{ color: textColor }}>
              {opcionActiva.componente}
            </div>
          </Card.Body>
        </Card>
      </Container>
    </Container>
  );
};

export default PanelDinamicoComision;
