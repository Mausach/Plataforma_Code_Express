// Components/TestCarreraCompleta.jsx - COMPONENTE DE PRUEBA DIRECTO
import React, { useEffect, useState } from 'react';
import { Card, Button, Spinner, Alert, Accordion, Badge } from 'react-bootstrap';
import { ArrowLeft, Book, Calendar } from 'react-bootstrap-icons';
import { CargarCarreraCompleta } from '../../../Helper/CargarComision_Id';


const TestCarreraCompleta = ({ comision, theme, onBack }) => {
    const [carrera, setCarrera] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Extraer ID de carrera
    const carreraId = comision.carrera?._id || comision.carrera_id || comision.carrera;
    
    // Cargar datos
    useEffect(() => {
        if (!carreraId) {
            setError('La comisión no tiene referencia a carrera');
            return;
        }
        
        const cargar = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const carreraData = await CargarCarreraCompleta(carreraId, setCarrera, null);
                
                if (!carreraData) {
                    setError('No se pudo cargar la carrera');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        cargar();
    }, [carreraId]);
    
    // Renderizar
    return (
        <div className="card p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <Button variant="outline-secondary" onClick={onBack}>
                    <ArrowLeft className="me-2" /> Volver
                </Button>
                <h4 className="mb-0">🔬 TEST: Cargar Carrera desde Comisión</h4>
            </div>
            
            {/* Info de la comisión */}
            <Card className="mb-4">
                <Card.Header>
                    <strong>Comisión Seleccionada</strong>
                </Card.Header>
                <Card.Body>
                    <p><strong>Nombre:</strong> {comision.nombre}</p>
                    <p><strong>ID Carrera en comisión:</strong> {carreraId || 'NO ENCONTRADO'}</p>
                    <p><strong>Nombre en cache:</strong> {comision.carrera_info?.nombre || 'No disponible'}</p>
                </Card.Body>
            </Card>
            
            {/* Estado de carga */}
            <Card className="mb-4">
                <Card.Header>
                    <strong>Estado del Test</strong>
                </Card.Header>
                <Card.Body>
                    {loading ? (
                        <div className="text-center py-3">
                            <Spinner animation="border" />
                            <p className="mt-2">Cargando carrera desde ID: {carreraId}</p>
                        </div>
                    ) : error ? (
                        <Alert variant="danger">
                            <Alert.Heading>Error</Alert.Heading>
                            <p>{error}</p>
                        </Alert>
                    ) : carrera ? (
                        <Alert variant="success">
                            <Alert.Heading>✅ TEST EXITOSO</Alert.Heading>
                            <p>
                                Carrera cargada correctamente desde la referencia en la comisión.
                            </p>
                        </Alert>
                    ) : null}
                </Card.Body>
            </Card>
            
            {/* Resultados */}
            {carrera && (
                <Card>
                    <Card.Header className="d-flex justify-content-between align-items-center">
                        <strong>📚 Carrera Cargada (Desde Referencia)</strong>
                        <Badge bg="success">
                            {carrera.modulos?.length || 0} módulos
                        </Badge>
                    </Card.Header>
                    <Card.Body>
                        <h5>{carrera.nombre}</h5>
                        <p className="text-muted">{carrera.descripcion}</p>
                        
                        <div className="row mb-4">
                            <div className="col-md-3">
                                <div className="text-center p-3 bg-light rounded">
                                    <div className="h4 mb-0">{carrera.estadisticas?.total_modulos || 0}</div>
                                    <small>Módulos</small>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="text-center p-3 bg-light rounded">
                                    <div className="h4 mb-0">{carrera.estadisticas?.total_contenidos || 0}</div>
                                    <small>Contenidos</small>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="text-center p-3 bg-light rounded">
                                    <div className="h4 mb-0">{carrera.duracion}</div>
                                    <small>Duración</small>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="text-center p-3 bg-light rounded">
                                    <Badge bg={carrera.estado === 'Activo' ? 'success' : 'warning'}>
                                        {carrera.estado}
                                    </Badge>
                                    <div className="mt-1"><small>Estado</small></div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Módulos */}
                        {carrera.modulos && carrera.modulos.length > 0 ? (
                            <Accordion>
                                {carrera.modulos.map((modulo, index) => (
                                    <Accordion.Item key={index} eventKey={index.toString()}>
                                        <Accordion.Header>
                                            <div className="d-flex align-items-center">
                                                <Badge bg="primary" className="me-3">
                                                    Módulo {modulo.orden}
                                                </Badge>
                                                <strong>{modulo.nombre}</strong>
                                                <span className="ms-3 text-muted">
                                                    ({modulo.contenidos?.length || 0} contenidos)
                                                </span>
                                            </div>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            {modulo.contenidos?.map((contenido, cIndex) => (
                                                <div key={cIndex} className="mb-2 p-2 border rounded">
                                                    <div className="d-flex justify-content-between">
                                                        <span>{contenido.nombre}</span>
                                                        <Badge bg={contenido.estado ? "success" : "secondary"}>
                                                            {contenido.estado ? "Activo" : "Inactivo"}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </Accordion.Body>
                                    </Accordion.Item>
                                ))}
                            </Accordion>
                        ) : (
                            <Alert variant="info">No hay módulos definidos en esta carrera</Alert>
                        )}
                    </Card.Body>
                </Card>
            )}
            
            {/* Conclusión del test */}
            <div className="mt-4 p-3 border rounded">
                <h6>📝 Conclusión del Test:</h6>
                <p>
                    {carrera ? (
                        <span className="text-success">
                            ✅ La arquitectura funciona: La carrera se carga dinámicamente 
                            desde la referencia en la comisión, sin duplicar datos.
                        </span>
                    ) : loading ? (
                        <span className="text-warning">⏳ Probando carga dinámica...</span>
                    ) : (
                        <span className="text-danger">
                            ❌ No se pudo cargar la carrera. Revisar: 
                            1) Ruta /carreras/:id/completa, 2) ID de carrera en comisión
                        </span>
                    )}
                </p>
            </div>
        </div>
    );
};

export default TestCarreraCompleta;