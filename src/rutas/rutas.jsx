import React, { useEffect } from 'react';
import { HashRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { HomeLogin } from '../Pages/HomeLogin/HomeLogin';
import { Admins } from '../Pages/Admin/Admins';
import { Profes } from '../Pages/Profes/Profes';
import { Estudiantes } from '../Pages/Estudiantes/Estudiantes';
import GestionComisionIndividual from '../Pages/Admin/Componentes/GestComiciones';

// Hook para bloquear navegación y redirigir a login
const useNavigationBlocker = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handlePopState = (e) => {
      e.preventDefault();

      // No bloquear si estamos en HomeLogin
      if (location.pathname === '/' || location.pathname === '') {
        return;
      }

      // Determinar el rol según la ruta actual
      const getRolFromPath = () => {
        if (location.pathname.includes('/admin')) return 'Administrador';
        if (location.pathname.includes('/profe')) return 'Profesor';
        if (location.pathname.includes('/Alumno')) return 'Alumno';
        if (location.pathname.includes('/gest-comision')) return 'Usuario';
        return 'Usuario';
      };

      const rolActual = getRolFromPath();

      Swal.fire({
        title: '¿Cerrar sesión?',
        html: `
          <div style="text-align: center;">
            <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">
              <strong>${rolActual}</strong>
            </p>
            <p>Estás a punto de cerrar tu sesión actual.</p>
            <p class="text-muted" style="font-size: 0.9rem;">
              Serás redirigido a la pantalla de inicio de sesión.
            </p>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#EF7F1A',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'Cancelar',
        background: document.body.classList.contains('dark') ? '#1A1F2E' : '#ffffff',
        color: document.body.classList.contains('dark') ? '#e9ecef' : '#212529',
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          // Limpiar cualquier dato de sesión si es necesario
          localStorage.removeItem('token');
          sessionStorage.clear();
          
          // Redirigir al HomeLogin
          navigate('/', { replace: true });
        } else {
          // Si cancela, mantener la página actual
          window.history.pushState(null, '', window.location.href);
        }
      });
    };

    // Agregar un estado inicial al historial
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location, navigate]);
};

// Componente que envuelve el contenido y aplica el bloqueo
const AppContent = () => {
  useNavigationBlocker();
  
  return (
    <Routes>
      <Route path="/*" element={<HomeLogin />} />
      <Route path="/admin/*" element={<Admins />} />
      <Route path="/gest-comision/*" element={<GestionComisionIndividual />} />
      <Route path="/profe/*" element={<Profes />} />
      <Route path="/Alumno/*" element={<Estudiantes />} />
    </Routes>
  );
};

export const AppRouter = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};