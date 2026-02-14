import React from 'react';
import { Row, Col, Card, Table, Badge, Button, ProgressBar } from 'react-bootstrap';
// Iconos corregidos - UserCheck en lugar de UserCheck
import { CheckCircle, XCircle, Clock, PersonCheck, People } from 'react-bootstrap-icons';

export const PanelAsistencias = ({ comision, theme }) => {
  const isLight = theme === 'lights';
  const textColor = isLight ? '#212529' : '#E9ECEF';
  const cardBg = isLight ? '#F8F9FA' : '#252A3A';
  const borderColor = isLight ? '#DEE2E6' : '#3A4255';
  const accentColor = '#3B82F6'; // Azul para Asistencias
  
  // Datos de ejemplo para asistencias
  const alumnos = [
    { 
      nombre: 'María González', 
      dni: '40123456',
      asistencia: 85,
      presente: 17,
      ausente: 3,
      justificado: 2,
      estado: 'Regular'
    },
    { 
      nombre: 'Juan Pérez', 
      dni: '38987654',
      asistencia: 95,
      presente: 19,
      ausente: 1,
      justificado: 0,
      estado: 'Excelente'
    },
    { 
      nombre: 'Laura Martínez', 
      dni: '42111222',
      asistencia: 70,
      presente: 14,
      ausente: 6,
      justificado: 2,
      estado: 'Atención'
    },
    { 
      nombre: 'Carlos Rodríguez', 
      dni: '40333444',
      asistencia: 65,
      presente: 13,
      ausente: 7,
      justificado: 0,
      estado: 'Riesgo'
    },
    { 
      nombre: 'Ana López', 
      dni: '39555666',
      asistencia: 90,
      presente: 18,
      ausente: 2,
      justificado: 1,
      estado: 'Regular'
    }
  ];

  const calcularPromedios = () => {
    const totalAlumnos = alumnos.length;
    const promedioAsistencia = alumnos.reduce((sum, alumno) => sum + alumno.asistencia, 0) / totalAlumnos;
    const totalPresentes = alumnos.reduce((sum, alumno) => sum + alumno.presente, 0);
    const totalAusentes = alumnos.reduce((sum, alumno) => sum + alumno.ausente, 0);
    
    return {
      promedioAsistencia: promedioAsistencia.toFixed(1),
      totalPresentes,
      totalAusentes,
      totalAlumnos
    };
  };

  const promedios = calcularPromedios();

  return (
    <div>
      {/* Tarjetas de resumen */}
      <Row className="mb-4">
        <Col md={3} sm={6}>
          <Card style={{ 
            backgroundColor: cardBg,
            borderColor: borderColor
          }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 style={{ color: accentColor }}>{promedios.promedioAsistencia}%</h2>
                  <small style={{ color: isLight ? '#6C757D' : '#ADB5BD' }}>
                    Asistencia promedio
                  </small>
                </div>
                <PersonCheck size={32} color={accentColor} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} sm={6}>
          <Card style={{ 
            backgroundColor: cardBg,
            borderColor: borderColor
          }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 style={{ color: '#10B981' }}>{promedios.totalPresentes}</h2>
                  <small style={{ color: isLight ? '#6C757D' : '#ADB5BD' }}>
                    Total presentes
                  </small>
                </div>
                <CheckCircle size={32} color="#10B981" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} sm={6}>
          <Card style={{ 
            backgroundColor: cardBg,
            borderColor: borderColor
          }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 style={{ color: '#EF4444' }}>{promedios.totalAusentes}</h2>
                  <small style={{ color: isLight ? '#6C757D' : '#ADB5BD' }}>
                    Total ausentes
                  </small>
                </div>
                <XCircle size={32} color="#EF4444" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} sm={6}>
          <Card style={{ 
            backgroundColor: cardBg,
            borderColor: borderColor
          }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 style={{ color: '#8B5CF6' }}>{promedios.totalAlumnos}</h2>
                  <small style={{ color: isLight ? '#6C757D' : '#ADB5BD' }}>
                    Total alumnos
                  </small>
                </div>
                <People size={32} color="#8B5CF6" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabla de asistencias */}
      <Card 
        className="mb-4"
        style={{ 
          backgroundColor: cardBg,
          borderColor: borderColor
        }}
      >
        <Card.Header style={{ 
          backgroundColor: 'transparent',
          borderBottomColor: borderColor,
          color: textColor
        }}>
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Registro de asistencias por alumno</h6>
            <div>
              <Button
                variant="outline-primary"
                size="sm"
                className="me-2"
                style={{ 
                  borderColor: accentColor,
                  color: accentColor
                }}
              >
                <CheckCircle size={14} className="me-1" />
                Tomar asistencia
              </Button>
              <Button
                variant="primary"
                size="sm"
                style={{ 
                  backgroundColor: accentColor,
                  borderColor: accentColor
                }}
              >
                Exportar reporte
              </Button>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0" style={{ color: textColor }}>
            <thead style={{ backgroundColor: isLight ? '#F1F3F5' : '#2D3447' }}>
              <tr>
                <th style={{ borderColor: borderColor }}>Alumno</th>
                <th style={{ borderColor: borderColor }}>DNI</th>
                <th style={{ borderColor: borderColor }}>Asistencia</th>
                <th style={{ borderColor: borderColor }}>Presente</th>
                <th style={{ borderColor: borderColor }}>Ausente</th>
                <th style={{ borderColor: borderColor }}>Justificado</th>
                <th style={{ borderColor: borderColor }}>Estado</th>
                <th style={{ borderColor: borderColor }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {alumnos.map((alumno, index) => (
                <tr key={index} style={{ borderColor: borderColor }}>
                  <td style={{ borderColor: borderColor }}>
                    <div className="fw-bold">{alumno.nombre}</div>
                  </td>
                  <td style={{ borderColor: borderColor }}>
                    <div className="small">{alumno.dni}</div>
                  </td>
                  <td style={{ borderColor: borderColor }}>
                    <div className="d-flex align-items-center">
                      <div className="me-2" style={{ width: '80px' }}>
                        <ProgressBar 
                          now={alumno.asistencia} 
                          style={{ height: '8px' }}
                          variant={
                            alumno.asistencia >= 85 ? 'success' :
                            alumno.asistencia >= 70 ? 'warning' : 'danger'
                          }
                        />
                      </div>
                      <span className="fw-bold">{alumno.asistencia}%</span>
                    </div>
                  </td>
                  <td style={{ borderColor: borderColor }}>
                    <Badge bg="success" className="py-1 px-2">
                      {alumno.presente}
                    </Badge>
                  </td>
                  <td style={{ borderColor: borderColor }}>
                    <Badge bg="danger" className="py-1 px-2">
                      {alumno.ausente}
                    </Badge>
                  </td>
                  <td style={{ borderColor: borderColor }}>
                    <Badge bg="info" className="py-1 px-2">
                      {alumno.justificado}
                    </Badge>
                  </td>
                  <td style={{ borderColor: borderColor }}>
                    <Badge bg={
                      alumno.estado === 'Excelente' ? 'success' :
                      alumno.estado === 'Regular' ? 'primary' :
                      alumno.estado === 'Atención' ? 'warning' : 'danger'
                    }>
                      {alumno.estado}
                    </Badge>
                  </td>
                  <td style={{ borderColor: borderColor }}>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0"
                      style={{ color: accentColor }}
                    >
                      Ver historial
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Estadísticas y gráficos */}
      <Row>
        <Col lg={6}>
          <Card 
            style={{ 
              backgroundColor: cardBg,
              borderColor: borderColor
            }}
          >
            <Card.Header style={{ 
              backgroundColor: 'transparent',
              borderBottomColor: borderColor,
              color: textColor
            }}>
              <div className="d-flex align-items-center">
                <CheckCircle size={18} className="me-2" color={accentColor} />
                <h6 className="mb-0">Resumen de estados</h6>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-around text-center">
                <div>
                  <div className="fw-bold h4" style={{ color: '#10B981' }}>
                    {alumnos.filter(a => a.estado === 'Excelente').length}
                  </div>
                  <small style={{ color: isLight ? '#6C757D' : '#ADB5BD' }}>
                    Excelente
                  </small>
                </div>
                <div>
                  <div className="fw-bold h4" style={{ color: '#3B82F6' }}>
                    {alumnos.filter(a => a.estado === 'Regular').length}
                  </div>
                  <small style={{ color: isLight ? '#6C757D' : '#ADB5BD' }}>
                    Regular
                  </small>
                </div>
                <div>
                  <div className="fw-bold h4" style={{ color: '#F59E0B' }}>
                    {alumnos.filter(a => a.estado === 'Atención').length}
                  </div>
                  <small style={{ color: isLight ? '#6C757D' : '#ADB5BD' }}>
                    Atención
                  </small>
                </div>
                <div>
                  <div className="fw-bold h4" style={{ color: '#EF4444' }}>
                    {alumnos.filter(a => a.estado === 'Riesgo').length}
                  </div>
                  <small style={{ color: isLight ? '#6C757D' : '#ADB5BD' }}>
                    Riesgo
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6}>
          <Card 
            style={{ 
              backgroundColor: cardBg,
              borderColor: borderColor
            }}
          >
            <Card.Header style={{ 
              backgroundColor: 'transparent',
              borderBottomColor: borderColor,
              color: textColor
            }}>
              <div className="d-flex align-items-center">
                <Clock size={18} className="me-2" color={accentColor} />
                <h6 className="mb-0">Última actualización</h6>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="text-center py-3">
                <div className="mb-3">
                  <div className="fw-bold h3" style={{ color: textColor }}>
                    Hoy, 15:30
                  </div>
                  <small style={{ color: isLight ? '#6C757D' : '#ADB5BD' }}>
                    Último registro de asistencia
                  </small>
                </div>
                <Button
                  variant="outline-primary"
                  size="sm"
                  style={{ 
                    borderColor: accentColor,
                    color: accentColor
                  }}
                >
                  <Clock size={14} className="me-1" />
                  Actualizar ahora
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PanelAsistencias;