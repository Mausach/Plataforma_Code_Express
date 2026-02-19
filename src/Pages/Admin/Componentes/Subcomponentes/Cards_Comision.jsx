// Subcomponentes/CardComision.js
import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { 
  Calendar, 
  People, 
  Clock, 
  Book, 
  ChevronRight, 
  Person, 
  PersonCheck,
  CalendarWeek,
  ClockHistory
} from 'react-bootstrap-icons';

export const CardComision = ({ 
  comision, 
  theme, 
  onSelect, 
  titleColor = '#EF7F1A' 
}) => {
  const cardClass = theme === 'lights' ? 'card-light' : 'card-dark';
  const textClass = theme === 'lights' ? 'text-dark' : 'text-light';
  const borderColor = theme === 'lights' ? '#E0D8C5' : '#1F2535';
  const backgroundColor = theme === 'lights' ? '#FAF3E1' : '#1F2535';

  // Funciones auxiliares para badges
  const getEstadoBadge = (estado) => {
    const config = {
      'Programada': { bg: 'secondary' },
      'En curso': { bg: 'success' },
      'Finalizada': { bg: 'primary' },
      'Cancelada': { bg: 'danger' }
    };
    const { bg } = config[estado] || { bg: 'secondary' };
    return <Badge bg={bg} className="ms-1">{estado}</Badge>;
  };

  const getModalidadBadge = (modalidad) => {
    const config = {
      'Full-Time': { bg: 'info', text: 'FT' },
      'Part-Time': { bg: 'warning', text: 'PT' }
    };
    const { bg, text } = config[modalidad] || { bg: 'secondary', text: modalidad };
    return <Badge bg={bg} className="ms-1">{text}</Badge>;
  };

  const handleCardClick = () => {
    onSelect(comision);
  };

  // Formatear fechas seguras
  const formatFecha = (fecha) => {
    if (!fecha) return 'No especificada';
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return 'Fecha inválida';
    }
  };

  // Formatear días de la semana
  const getDiasSemana = (dias) => {
    if (!dias || !Array.isArray(dias) || dias.length === 0) return 'No especificados';
    
    const diasMap = {
      1: 'Lunes',
      2: 'Martes',
      3: 'Miércoles',
      4: 'Jueves',
      5: 'Viernes',
      6: 'Sábado',
      7: 'Domingo'
    };
    
    const nombresDias = dias.map(d => diasMap[d] || `Día ${d}`);
    
    if (nombresDias.length === 1) return nombresDias[0];
    if (nombresDias.length === 2) return nombresDias.join(' y ');
    return nombresDias.slice(0, -1).join(', ') + ' y ' + nombresDias.slice(-1);
  };

  // Calcular días hasta el inicio
  const getDiasHastaInicio = () => {
    if (!comision.fecha_inicio) return null;
    try {
      const hoy = new Date();
      const inicio = new Date(comision.fecha_inicio);
      inicio.setHours(0, 0, 0, 0);
      hoy.setHours(0, 0, 0, 0);
      
      const diferenciaMs = inicio - hoy;
      const dias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));
      
      if (dias === 0) return 'Hoy';
      if (dias === 1) return 'Mañana';
      if (dias > 1) return `En ${dias} días`;
      if (dias < 0) return 'Ya inició';
      return null;
    } catch (e) {
      return null;
    }
  };

  // Obtener horario formateado
  const getHorario = () => {
    if (!comision.horario_comision) return 'Horario no especificado';
    
    const { hora_inicio, hora_fin } = comision.horario_comision;
    
    if (!hora_inicio || !hora_fin) return 'Horario incompleto';
    
    // Formatear horas (ya vienen en formato "20:00")
    return `${hora_inicio} - ${hora_fin}`;
  };

  const diasHastaInicio = getDiasHastaInicio();
  const diasSemana = getDiasSemana(comision.horario_comision?.dias_semana);
  const horario = getHorario();

  return (
    <Card 
      className={`h-100 ${cardClass}`}
      style={{ 
        borderColor: borderColor,
        cursor: 'pointer',
        transition: 'transform 0.2s',
      }}
      onClick={handleCardClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = `0 5px 15px ${borderColor}50`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <Card.Body>
        <div className="d-flex align-items-start mb-3">
          <div className="me-3">
            <div className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: '48px',
                height: '48px',
                backgroundColor: theme === 'lights' ? '#f8f9fa' : '#2a3042',
                border: `2px solid ${borderColor}`
              }}>
              <Book size={24} style={{ color: titleColor }} />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="d-flex flex-wrap align-items-center mb-1">
              <h5 className="mb-0 me-2" style={{ 
                color: 'inherit',
                fontSize: '1.1rem',
                lineHeight: '1.3'
              }}>
                {comision.nombre || 'Sin nombre'}
              </h5>
              {getEstadoBadge(comision.estado)}
              {getModalidadBadge(comision.modalidad)}
            </div>
            <p className="mb-1" style={{
              color: theme === 'lights' ? '#6c757d' : '#b0b0b0',
              fontSize: '0.9rem'
            }}>
              <strong>Carrera:</strong> {comision.carrera_info?.nombre || 'No especificada'}
            </p>
            
            {/* Indicador de días hasta inicio */}
            {diasHastaInicio && comision.estado === 'Programada' && (
              <Badge bg="warning" className="mt-1">
                {diasHastaInicio}
              </Badge>
            )}
          </div>
        </div>

        <div className="d-flex flex-column gap-2 mb-3">
          {/* Fechas de inicio y fin */}
          <div className="d-flex align-items-center">
            <Calendar size={14} className="me-2" style={{ color: titleColor }} />
            <small style={{ color: 'inherit' }}>
              <strong>Inicio:</strong> {formatFecha(comision.fecha_inicio)} • <strong>Fin:</strong> {formatFecha(comision.fecha_fin)}
            </small>
          </div>
          
          {/* Días de la semana */}
          <div className="d-flex align-items-center">
            <CalendarWeek size={14} className="me-2" style={{ color: titleColor }} />
            <small style={{ color: 'inherit' }}>
              <strong>Días:</strong> {diasSemana}
            </small>
          </div>
          
          {/* Horario */}
          <div className="d-flex align-items-center">
            <ClockHistory size={14} className="me-2" style={{ color: titleColor }} />
            <small style={{ color: 'inherit' }}>
              <strong>Horario:</strong> {horario}
            </small>
          </div>

          {/* Total de clases */}
          <div className="d-flex align-items-center">
            <Book size={14} className="me-2" style={{ color: titleColor }} />
            <small style={{ color: 'inherit' }}>
              <strong>Clases totales:</strong> {comision.total_clases_generadas || 0}
            </small>
          </div>

          {/* Modalidad de carrera (grabado/en vivo) */}
          {comision.carrera_info?.modalidad && (
            <div className="d-flex align-items-center">
              <PersonCheck size={14} className="me-2" style={{ color: titleColor }} />
              <small style={{ color: 'inherit' }}>
                <strong>Modalidad carrera:</strong> {comision.carrera_info.modalidad === 'grabado' ? 'Grabado' : 'En vivo'}
              </small>
            </div>
          )}
        </div>
      </Card.Body>
      
      <Card.Footer 
        className="d-flex justify-content-between align-items-center py-2"
        style={{ 
          backgroundColor: backgroundColor,
          borderTopColor: borderColor
        }}
      >
        {/* Versión de la carrera */}
        <small style={{ 
          color: theme === 'lights' ? '#6c757d' : '#b0b0b0',
          fontSize: '0.8rem'
        }}>
          <strong>Versión:</strong> {comision.carrera_info?.version || comision.carrera?.version || '1.0.0'}
        </small>
        
        {/* Fecha de creación */}
        {comision.fecha_creacion && (
          <small style={{ 
            color: theme === 'lights' ? '#6c757d' : '#b0b0b0',
            fontSize: '0.8rem'
          }}>
            Creada: {formatFecha(comision.fecha_creacion)}
          </small>
        )}
        
        <Button
          variant="link"
          size="sm"
          className="p-0"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(comision);
          }}
          style={{ color: titleColor }}
        >
          <ChevronRight size={20} />
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default CardComision;