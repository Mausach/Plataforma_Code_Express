import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function NavbarAdmin({ theme, handleChangeTheme, activePanel, setActivePanel }) {
  const location = useLocation();
  const usuario = location.state;
  const navigate = useNavigate();

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
        navigate("/");
      }
    });
  };

  // Función para manejar clicks en los enlaces
  const handleNavClick = (panelName, e) => {
    e.preventDefault(); // Prevenir comportamiento por defecto de enlace
    setActivePanel(panelName);
  };

  return (
    <Navbar expand="lg" className={`${theme === 'lights' ? 'card-light' : 'card-dark'}`}>
      <Container>
        {/* Logo/Brand que lleva al dashboard */}
        <Navbar.Brand
          style={{ 
            color: 'inherit',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
          onClick={(e) => handleNavClick('dashboard', e)}
        >
          Academia Admin
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {/* Enlace Usuarios */}
            <Nav.Link
              href="#usuarios"
              onClick={(e) => handleNavClick('usuarios', e)}
              style={{ 
                color: activePanel === 'usuarios' ? '#EF7F1A' : 'inherit',
                fontWeight: activePanel === 'usuarios' ? 'bold' : 'normal',
                cursor: 'pointer'
              }}
            >
              👥 Gestión de Usuarios
            </Nav.Link>

            {/* Enlace Carreras */}
            <Nav.Link
              href="#carreras"
              onClick={(e) => handleNavClick('carreras', e)}
              style={{ 
                color: activePanel === 'carreras' ? '#EF7F1A' : 'inherit',
                fontWeight: activePanel === 'carreras' ? 'bold' : 'normal',
                cursor: 'pointer'
              }}
            >
              📚 Gestión de Carreras
            </Nav.Link>

            {/* Enlace Comisiones */}
            <Nav.Link
              href="#comisiones"
              onClick={(e) => handleNavClick('comisiones', e)}
              style={{ 
                color: activePanel === 'comisiones' ? '#EF7F1A' : 'inherit',
                fontWeight: activePanel === 'comisiones' ? 'bold' : 'normal',
                cursor: 'pointer'
              }}
            >
              🏫 Gestión de Comisiones
            </Nav.Link>

            {/* Separador visual */}
            <div style={{
              width: '1px',
              height: '24px',
              backgroundColor: theme === 'lights' ? '#353432' : '#ebe5e5',
              opacity: 0.3,
              margin: '0 1rem',
              alignSelf: 'center'
            }} />

            {/* Enlace Salir */}
            <Nav.Link
              onClick={ir_LogOut}
              style={{ 
                color: 'inherit',
                cursor: 'pointer'
              }}
            >
              🚪 Salir
            </Nav.Link>
          </Nav>

          {/* Botón de tema - Mejor posicionado */}
          <button
            className="btn-theme rounded-circle border-0"
            onClick={handleChangeTheme}
            style={{
              backgroundColor: 'transparent',
              border: `2px solid ${theme === 'lights' ? '#353432' : '#ebe5e5'}`,
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: '1rem'
            }}
            title={`Cambiar a tema ${theme === 'lights' ? 'oscuro' : 'claro'}`}
          >
            {theme === 'lights' ?
              <i className="bi bi-moon" style={{ color: '#353432' }}></i> :
              <i className="bi bi-brightness-high" style={{ color: '#ebe5e5' }}></i>
            }
          </button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarAdmin;