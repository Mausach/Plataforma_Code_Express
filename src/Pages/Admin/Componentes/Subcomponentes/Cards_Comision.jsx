// Subcomponentes/CardComision.js
import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Calendar, People, Clock, Book, ChevronRight, Person, PersonCheck } from 'react-bootstrap-icons';

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

  // Obtener nombre del coordinador (si existe)
  const getCoordinadorNombre = () => {
    if (comision.coordinador) {
      return `${comision.coordinador.nombres || ''} ${comision.coordinador.apellido || ''}`.trim();
    }
    if (comision.coordinador_nombre) {
      return comision.coordinador_nombre;
    }
    return 'Sin coordinador';
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

  const diasHastaInicio = getDiasHastaInicio();

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
          {/* Fechas */}
          <div className="d-flex align-items-center">
            <Calendar size={14} className="me-2" style={{ color: titleColor }} />
            <small style={{ color: 'inherit' }}>
              <strong>Inicio:</strong> {formatFecha(comision.fecha_inicio)}
            </small>
          </div>
          
          {/* Alumnos */}
          <div className="d-flex align-items-center">
            <People size={14} className="me-2" style={{ color: titleColor }} />
            <small style={{ color: 'inherit' }}>
              <strong>Alumnos:</strong> {comision.total_alumnos || 0}
              {/* Si también quieres mostrar profesores: */}
              {comision.total_profesores !== undefined && (
                <>
                  <span className="mx-1">•</span>
                  <strong>Profesores:</strong> {comision.total_profesores || 0}
                </>
              )}
            </small>
          </div>
          
          {/* Clases */}
          <div className="d-flex align-items-center">
            <Clock size={14} className="me-2" style={{ color: titleColor }} />
            <small style={{ color: 'inherit' }}>
              <strong>Clases:</strong> {comision.total_clases || comision.total_clases_generadas || 0}
            </small>
          </div>

          {/* Modalidad de carrera */}
          {comision.carrera_info?.modalidad && (
            <div className="d-flex align-items-center">
              <PersonCheck size={14} className="me-2" style={{ color: titleColor }} />
              <small style={{ color: 'inherit' }}>
                <strong>Modalidad carrera:</strong> {comision.carrera_info.modalidad === 'grabado' ? 'Grabado' : 'En vivo'}
              </small>
            </div>
          )}
        </div>

        {/* Coordinador */}
        <div className="mt-2 pt-2 border-top" style={{ borderColor: borderColor }}>
          <div className="d-flex align-items-center">
            <Person size={14} className="me-2" style={{ color: titleColor }} />
            <small style={{ 
              color: theme === 'lights' ? '#6c757d' : '#b0b0b0',
              fontSize: '0.85rem'
            }}>
              <strong>Coordinador:</strong> {getCoordinadorNombre()}
            </small>
          </div>
        </div>
      </Card.Body>
      
      <Card.Footer 
        className="d-flex justify-content-between align-items-center py-2"
        style={{ 
          backgroundColor: backgroundColor,
          borderTopColor: borderColor
        }}
      >
        {/* Fecha de creación */}
        {comision.fecha_creacion && (
          <small style={{ 
            color: theme === 'lights' ? '#6c757d' : '#b0b0b0',
            fontSize: '0.8rem'
          }}>
            Creada: {formatFecha(comision.fecha_creacion)}
          </small>
        )}
        
        {/* Fecha de fin */}
        {comision.fecha_fin && (
          <small style={{ 
            color: theme === 'lights' ? '#6c757d' : '#b0b0b0',
            fontSize: '0.8rem'
          }}>
            Finaliza: {formatFecha(comision.fecha_fin)}
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