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

export const ListaComisiones = ({ theme,usuario }) => {
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

  // Clases según tema
  const cardClass = theme === 'lights' ? 'card-light' : 'card-dark';
  const textClass = theme === 'lights' ? 'text-dark' : 'text-light';
  const borderColor = theme === 'lights' ? '#E0D8C5' : '#1F2535';
  const titleColor = '#EF7F1A';

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
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <Spinner animation="border" variant={theme === 'lights' ? 'primary' : 'light'} />
        <span className={`ms-2 ${textClass}`}>Cargando comisiones...</span>
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

        {/* Modal para crear nueva comisión (siempre disponible) */}
        <ModalCrearComision
          show={showCreateModal}
          handleClose={handleCloseCreateModal}
          setRefreshData={setRefreshData}
          navigate={navigate}
          theme={theme}
        />
      </>
    );
  }

  // Renderizar Lista de Comisiones (vista por defecto)
  return (
    <div className={`card ${cardClass} card-with-shadow p-4`}>
      {/* Header */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 style={{ color: titleColor }}>🏫 Gestión de Comisiones</h2>
            <p className={textClass}>
              Total: {comisiones.length} comisiones •
              <span className="ms-2">En curso: {comisiones.filter(c => c.estado === 'En curso').length}</span>
            </p>
          </div>
          <Button
            variant="primary"
            onClick={handleShowCreateModal}
            style={{ backgroundColor: titleColor, borderColor: titleColor }}
          >
            <Plus className="me-2" /> Nueva Comisión
          </Button>
        </div>
      </div>

      {/* Buscador */}
      <Row className="mb-4">
        <Col md={12}>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Buscar por nombre de comisión, carrera..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={theme === 'lights' ? 'bg-white text-dark' : 'bg-dark text-light'}
              style={{ borderColor: borderColor }}
            />
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
            <Card className={`text-center py-5 ${cardClass}`} style={{ borderColor: borderColor }}>
              <Card.Body>
                <Book size={48} className="mb-3 text-muted" />
                <h5 className="mb-3">No hay comisiones</h5>
                <p className="text-muted mb-4">
                  {searchTerm ? 'No se encontraron comisiones con ese criterio' : 'No hay comisiones registradas.'}
                </p>
                <Button
                  variant="primary"
                  onClick={handleShowCreateModal}
                  style={{ backgroundColor: titleColor, borderColor: titleColor }}
                >
                  <Plus className="me-2" /> Crear primera comisión
                </Button>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {/* Modal para crear nueva comisión */}
      <ModalCrearComision
        show={showCreateModal}
        handleClose={handleCloseCreateModal}
        setRefreshData={setRefreshData}
        navigate={navigate}
        theme={theme}
      />
    </div>
  );
};

export default ListaComisiones;