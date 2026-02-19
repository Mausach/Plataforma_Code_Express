import React, { useEffect, useState } from 'react';
import {
  Button, Card, Row, Col, Form,
  Spinner, Alert
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Plus, Book } from 'react-bootstrap-icons';

// Importamos los nuevos componentes
import ModalCrearComision from './Subcomponentes/ModalCrearComision';

import { CargarComisiones } from '../Helper/CargarComisiones';
import CardComision from './Subcomponentes/Cards_Comision';
import PanelInformacionGeneral from './GestComiciones';

export const ListaComisiones = ({ theme, usuario }) => {
  const navigate = useNavigate();

  // Estados principales
  const [comisiones, setComisiones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshData, setRefreshData] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Nuevos estados para controlar la vista
  const [selectedComision, setSelectedComision] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' o 'panel'

  // Configuración de tema
  const isLight = theme === 'lights';
  
  // Colores según tema
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
    placeholderColor: isLight ? '#6c757d' : '#a0a0a0',
    success: isLight ? '#198754' : '#2ecc71',
    warning: isLight ? '#ffc107' : '#f39c12',
    danger: isLight ? '#dc3545' : '#e74c3c',
    info: isLight ? '#0dcaf0' : '#3498db'
  };

  // Clases según tema
  const cardClass = isLight ? 'card-light' : 'card-dark';
  const textClass = isLight ? 'text-dark' : 'text-light';
  const borderColor = colors.border;
  const titleColor = colors.primary;
  const backgroundColor = colors.background;
  const cardBg = colors.cardBg;

  // Determinar si el usuario puede crear comisiones (solo admin/coordinador)
  const puedeCrearComision = ['admin', 'cordinador'].includes(usuario?.rol);

  // Cargar datos
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);
        await CargarComisiones(setComisiones, navigate);
      } catch (error) {
        setError("Error al cargar las comisiones. Contacte soporte.");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [refreshData, navigate]);

  // Handlers
  const handleShowCreateModal = () => setShowCreateModal(true);
  const handleCloseCreateModal = () => setShowCreateModal(false);

  // Manejar selección de comisión
  const handleSelectComision = (comision) => {
    setSelectedComision(comision);
    setViewMode('panel');
  };

  // Volver a la lista
  const handleBackToList = () => {
    setViewMode('list');
    setSelectedComision(null);
  };

  // Refrescar datos después de crear una comisión
  const handleComisionCreated = () => {
    setRefreshData(true);
    handleCloseCreateModal();
  };

  // Filtro de búsqueda
  const filteredComisiones = comisiones.filter(comision => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      comision.nombre?.toLowerCase().includes(searchLower) ||
      comision.carrera_info?.nombre?.toLowerCase().includes(searchLower) ||
      comision.estado?.toLowerCase().includes(searchLower) ||
      comision.modalidad?.toLowerCase().includes(searchLower)
    );
  });

  // Loading
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ 
        minHeight: '300px',
        backgroundColor: colors.background,
        color: colors.text
      }}>
        <Spinner animation="border" variant={isLight ? 'primary' : 'light'} />
        <span className={`ms-2`} style={{ color: colors.text }}>Cargando comisiones...</span>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <Alert 
        variant="danger" 
        className="mt-3"
        style={{ 
          backgroundColor: isLight ? '#f8d7da' : '#842029',
          borderColor: isLight ? '#f5c6cb' : '#842029',
          color: isLight ? '#721c24' : '#f8d7da'
        }}
      >
        <Alert.Heading>Error</Alert.Heading>
        <p>{error}</p>
        <Button
          variant={isLight ? "outline-danger" : "outline-light"}
          onClick={() => setRefreshData(true)}
          className="ms-2"
          style={{ 
            borderColor: isLight ? '#dc3545' : '#f8d7da',
            color: isLight ? '#dc3545' : '#f8d7da'
          }}
        >
          Reintentar
        </Button>
      </Alert>
    );
  }

  // Renderizar Panel de Comisión
  if (viewMode === 'panel' && selectedComision) {
    return (
      <>
        <PanelInformacionGeneral
          comision={selectedComision}
          theme={theme}
          onBack={handleBackToList}
          usuario={usuario}
        />

        {/* Modal para crear nueva comisión (solo si tiene permisos) */}
        {puedeCrearComision && (
          <ModalCrearComision
            show={showCreateModal}
            handleClose={handleCloseCreateModal}
            setRefreshData={setRefreshData}
            navigate={navigate}
            theme={theme}
          />
        )}
      </>
    );
  }

  // Renderizar Lista de Comisiones (vista por defecto)
  return (
    <div style={{ 
      backgroundColor: colors.background,
      minHeight: '100vh',
      padding: '2rem',
      color: colors.text
    }}>
      <div className="container-fluid">
        {/* Header */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 style={{ color: titleColor }}>🏫 Gestión de Comisiones</h2>
              <p style={{ color: colors.textMuted }}>
                Total: {comisiones.length} comisiones •
                <span className="ms-2">En curso: {comisiones.filter(c => c.estado === 'En curso').length}</span>
              </p>
            </div>
            {puedeCrearComision && (
              <Button
                variant="primary"
                onClick={handleShowCreateModal}
                style={{ 
                  backgroundColor: titleColor, 
                  borderColor: titleColor,
                  color: '#ffffff'
                }}
              >
                <Plus className="me-2" /> Nueva Comisión
              </Button>
            )}
          </div>
        </div>

        {/* Buscador mejorado */}
        <Row className="mb-4">
          <Col md={12}>
            <Form.Group>
              <Form.Control
                type="text"
                placeholder="Buscar por nombre de comisión, carrera..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  backgroundColor: colors.inputBg,
                  borderColor: colors.border,
                  color: colors.text
                }}
                className="border"
              />
              {/* Estilo personalizado para el placeholder */}
              <style>
                {`
                  input::placeholder {
                    color: ${colors.placeholderColor} !important;
                    opacity: 1;
                  }
                  input:-ms-input-placeholder {
                    color: ${colors.placeholderColor} !important;
                  }
                  input::-ms-input-placeholder {
                    color: ${colors.placeholderColor} !important;
                  }
                `}
              </style>
            </Form.Group>
          </Col>
        </Row>

        {/* Grid de Cards usando el componente CardComision */}
        <Row>
          {filteredComisiones.length > 0 ? (
            filteredComisiones
              .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))
              .map((comision) => (
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
              <Card 
                className="text-center py-5" 
                style={{ 
                  backgroundColor: colors.cardBg,
                  borderColor: colors.border,
                  color: colors.text
                }}
              >
                <Card.Body>
                  <Book size={48} className="mb-3" style={{ color: colors.textMuted }} />
                  <h5 className="mb-3" style={{ color: colors.text }}>No hay comisiones</h5>
                  <p className="mb-4" style={{ color: colors.textMuted }}>
                    {searchTerm ? 'No se encontraron comisiones con ese criterio' : 'No hay comisiones registradas.'}
                  </p>
                  {puedeCrearComision && (
                    <Button
                      variant="primary"
                      onClick={handleShowCreateModal}
                      style={{ 
                        backgroundColor: titleColor, 
                        borderColor: titleColor,
                        color: '#ffffff'
                      }}
                    >
                      <Plus className="me-2" /> Crear primera comisión
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>

        {/* Modal para crear nueva comisión (solo si tiene permisos) */}
        {puedeCrearComision && (
          <ModalCrearComision
            show={showCreateModal}
            handleClose={handleCloseCreateModal}
            setRefreshData={setRefreshData}
            navigate={navigate}
            theme={theme}
          />
        )}
      </div>
    </div>
  );
};

export default ListaComisiones;