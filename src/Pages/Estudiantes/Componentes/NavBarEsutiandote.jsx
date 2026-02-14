import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function NavbarDinamico({ theme, handleChangeTheme, usuario }) {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  // 🔥 CONFIGURACIÓN DINÁMICA SEGÚN EL ROL
  const getRolConfig = () => {
    const rol = usuario?.rol?.toLowerCase() || 'alumno';
    
    const config = {
      // ROLES DE ESTUDIANTES
      alumno: {
        nombre: 'Estudiante',
        icono: '🎓',
        color: '#EF7F1A',
        badge: 'Estudiante',
        brandText: 'Academia Estudiante',
        descripcion: 'Panel de Estudiante'
      },
      // ROLES DE DOCENTES
      profe: {
        nombre: 'Profesor',
        icono: '👨‍🏫',
        color: '#4CAF50',
        badge: 'Docente',
        brandText: 'Academia Profesor',
        descripcion: 'Panel de Profesor'
      },
      acompañante: {
        nombre: 'Acompañante',
        icono: '👥',
        color: '#2196F3',
        badge: 'Acompañante',
        brandText: 'Academia Acompañante',
        descripcion: 'Panel de Acompañamiento'
      },
      cordinador: {
        nombre: 'Coordinador',
        icono: '📋',
        color: '#9C27B0',
        badge: 'Coordinación',
        brandText: 'Academia Coordinador',
        descripcion: 'Panel de Coordinación'
      },
      corrector: {
        nombre: 'Corrector',
        icono: '✅',
        color: '#FF9800',
        badge: 'Corrección',
        brandText: 'Academia Corrector',
        descripcion: 'Panel de Corrección'
      },
      admin: {
        nombre: 'Administrador',
        icono: '⚙️',
        color: '#F44336',
        badge: 'Admin',
        brandText: 'Academia Admin',
        descripcion: 'Panel de Administración'
      }
    };

    return config[rol] || config.alumno;
  };

  const rolConfig = getRolConfig();

  // Obtener iniciales del nombre para el avatar
  const getInitials = () => {
    if (usuario?.nombres && usuario?.apellido) {
      return `${usuario.nombres.charAt(0)}${usuario.apellido.charAt(0)}`.toUpperCase();
    }
    return 'U';
  };

  // Formatear fecha de nacimiento
  const formatFechaNacimiento = (fecha) => {
    if (!fecha) return 'N/A';
    const [year, month, day] = fecha.split('-');
    return `${day}/${month}/${year}`;
  };

  // Obtener género en español
  const getGenero = (genero) => {
    const generos = {
      'M': 'Masculino',
      'F': 'Femenino',
      'Otro': 'Otro'
    };
    return generos[genero] || genero || 'N/A';
  };

  // Obtener color de fondo según el rol
  const getGradientByRol = () => {
    const rol = usuario?.rol?.toLowerCase() || 'alumno';
    const gradients = {
      alumno: 'linear-gradient(135deg, #EF7F1A 0%, #D96B0E 100%)',
      profe: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
      acompañante: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
      cordinador: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
      corrector: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
      admin: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)'
    };
    return gradients[rol] || gradients.alumno;
  };

  const ir_LogOut = () => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Se cerrará tu sesión actual.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
      background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
      color: theme === 'lights' ? '#353432' : '#ebe5e5',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        navigate("/");
      }
    });
  };

  return (
    <Navbar expand="lg" className={`${theme === 'lights' ? 'card-light' : 'card-dark'}`}>
      <Container>
        {/* Logo/Brand DINÁMICO según el rol */}
        <Navbar.Brand
          style={{ 
            color: 'inherit',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>{rolConfig.icono}</span>
          <span>Academia</span>
          <span style={{ color: rolConfig.color }}>{rolConfig.brandText.split(' ')[1]}</span>
          
          {/* Badge de rol */}
          <span style={{
            backgroundColor: rolConfig.color,
            color: 'white',
            padding: '0.25rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            marginLeft: '0.5rem'
          }}>
            {rolConfig.badge}
          </span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          {/* Botón de tema */}
          <button
            className="btn-theme rounded-circle border-0 me-3"
            onClick={handleChangeTheme}
            style={{
              backgroundColor: 'transparent',
              border: `2px solid ${theme === 'lights' ? '#353432' : '#ebe5e5'}`,
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease'
            }}
            title={`Cambiar a tema ${theme === 'lights' ? 'oscuro' : 'claro'}`}
          >
            {theme === 'lights' ?
              <i className="bi bi-moon" style={{ color: '#353432' }}></i> :
              <i className="bi bi-brightness-high" style={{ color: '#ebe5e5' }}></i>
            }
          </button>

          {/* Menú de perfil */}
          <div className="position-relative">
            {/* Círculo del perfil - Muestra iniciales con color del rol */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              style={{
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                background: getGradientByRol(),
                border: `2px solid ${theme === 'lights' ? '#353432' : '#ebe5e5'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                transition: 'transform 0.2s ease',
                boxShadow: `0 2px 8px ${rolConfig.color}40`
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              title={`Mi perfil - ${rolConfig.nombre}`}
            >
              {getInitials()}
            </button>

            {/* Menú desplegable del perfil - MEJORADO */}
            {showMenu && (
              <>
                {/* Overlay para cerrar al hacer click fuera */}
                <div
                  onClick={() => setShowMenu(false)}
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 999
                  }}
                />
                
                {/* Dropdown menu - Diseño mejorado */}
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    width: '340px',
                    backgroundColor: theme === 'lights' ? '#FFFFFF' : '#1E1E2A',
                    border: `1px solid ${theme === 'lights' ? '#E0E0E0' : '#2A2A36'}`,
                    borderRadius: '12px',
                    boxShadow: theme === 'lights' 
                      ? '0 8px 24px rgba(0,0,0,0.12)' 
                      : '0 8px 24px rgba(0,0,0,0.4)',
                    zIndex: 1000,
                    overflow: 'hidden'
                  }}
                >
                  {/* Header con fondo dinámico según rol */}
                  <div style={{
                    background: getGradientByRol(),
                    padding: '1.5rem 1rem',
                    color: 'white'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem'
                    }}>
                      <div
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          backdropFilter: 'blur(4px)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '1.4rem',
                          border: '2px solid white'
                        }}
                      >
                        {getInitials()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontWeight: 'bold',
                          fontSize: '1.1rem',
                          marginBottom: '0.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          {usuario?.nombres || 'Usuario'} {usuario?.apellido || ''}
                          <span style={{
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            padding: '0.2rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.7rem',
                            fontWeight: 'bold'
                          }}>
                            {rolConfig.nombre}
                          </span>
                        </div>
                        <div style={{ 
                          fontSize: '0.85rem',
                          opacity: 0.9,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <i className="bi bi-envelope"></i>
                          {usuario?.email || 'email@ejemplo.com'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información personal - TODO el modelo */}
                  <div style={{
                    padding: '1.25rem'
                  }}>
                    <h6 style={{
                      color: theme === 'lights' ? '#666' : '#AAA',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <i className="bi bi-person-badge"></i>
                      INFORMACIÓN PERSONAL • {rolConfig.descripcion}
                    </h6>

                    {/* Grid de 2 columnas */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '1rem'
                    }}>
                      {/* DNI */}
                      <div>
                        <div style={{ 
                          fontSize: '0.7rem',
                          color: theme === 'lights' ? '#999' : '#777',
                          textTransform: 'uppercase'
                        }}>
                          DNI
                        </div>
                        <div style={{ 
                          fontWeight: 'bold',
                          color: theme === 'lights' ? '#353432' : '#ebe5e5'
                        }}>
                          {usuario?.dni || 'N/A'}
                        </div>
                      </div>

                      {/* Fecha Nacimiento */}
                      <div>
                        <div style={{ 
                          fontSize: '0.7rem',
                          color: theme === 'lights' ? '#999' : '#777',
                          textTransform: 'uppercase'
                        }}>
                          F. Nacimiento
                        </div>
                        <div style={{ 
                          fontWeight: 'bold',
                          color: theme === 'lights' ? '#353432' : '#ebe5e5'
                        }}>
                          {formatFechaNacimiento(usuario?.fecha_nacimiento)}
                        </div>
                      </div>

                      {/* Género */}
                      <div>
                        <div style={{ 
                          fontSize: '0.7rem',
                          color: theme === 'lights' ? '#999' : '#777',
                          textTransform: 'uppercase'
                        }}>
                          Género
                        </div>
                        <div style={{ 
                          fontWeight: 'bold',
                          color: theme === 'lights' ? '#353432' : '#ebe5e5'
                        }}>
                          {getGenero(usuario?.genero)}
                        </div>
                      </div>

                      {/* Teléfono */}
                      <div>
                        <div style={{ 
                          fontSize: '0.7rem',
                          color: theme === 'lights' ? '#999' : '#777',
                          textTransform: 'uppercase'
                        }}>
                          Teléfono
                        </div>
                        <div style={{ 
                          fontWeight: 'bold',
                          color: theme === 'lights' ? '#353432' : '#ebe5e5'
                        }}>
                          {usuario?.telefono || 'N/A'}
                        </div>
                      </div>

                      {/* Provincia */}
                      <div>
                        <div style={{ 
                          fontSize: '0.7rem',
                          color: theme === 'lights' ? '#999' : '#777',
                          textTransform: 'uppercase'
                        }}>
                          Provincia
                        </div>
                        <div style={{ 
                          fontWeight: 'bold',
                          color: theme === 'lights' ? '#353432' : '#ebe5e5'
                        }}>
                          {usuario?.provincia || 'N/A'}
                        </div>
                      </div>

                      {/* Rol */}
                      <div>
                        <div style={{ 
                          fontSize: '0.7rem',
                          color: theme === 'lights' ? '#999' : '#777',
                          textTransform: 'uppercase'
                        }}>
                          Rol
                        </div>
                        <div style={{ 
                          fontWeight: 'bold',
                          color: rolConfig.color,
                          textTransform: 'capitalize'
                        }}>
                          {rolConfig.nombre}
                        </div>
                      </div>
                    </div>

                    {/* Legajo o ID - Adaptado según rol */}
                    <div style={{
                      marginTop: '1rem',
                      padding: '0.75rem',
                      backgroundColor: theme === 'lights' ? `${rolConfig.color}10` : `${rolConfig.color}20`,
                      borderRadius: '8px',
                      borderLeft: `4px solid ${rolConfig.color}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ 
                        fontSize: '0.85rem',
                        color: theme === 'lights' ? '#666' : '#AAA'
                      }}>
                        <i className="bi bi-qr-code me-2"></i>
                        {usuario?.rol?.toLowerCase() === 'alumno' ? 'Legajo:' : 'ID:'}
                      </span>
                      <span style={{ 
                        fontWeight: 'bold',
                        color: rolConfig.color,
                        fontSize: '1rem'
                      }}>
                        {usuario?.legajo || usuario?.dni || usuario?._id?.slice(-6) || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Botón de salir */}
                  <div style={{
                    padding: '1rem',
                    borderTop: `1px solid ${theme === 'lights' ? '#E0E0E0' : '#2A2A36'}`
                  }}>
                    <button
                      onClick={ir_LogOut}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: '#d33',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#b71c1c';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#d33';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      <i className="bi bi-box-arrow-right"></i>
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarDinamico;