import React, { useEffect, useState } from 'react'
import { CardLogin } from './Componentes/CardLogin';
import { useNavigate } from 'react-router-dom';

export const HomeLogin = () => {
    // Recuperar tema guardado o usar 'lights' por defecto
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme || 'lights';
    });

    const navigate = useNavigate();

    // Función para cambiar de tema
    const handleChangeTheme = () => {
        const newTheme = theme === 'lights' ? 'darks' : 'lights';
        setTheme(newTheme);
        document.body.className = newTheme + '-theme';
        localStorage.setItem('theme', newTheme); // Guardar para persistencia
    };

    // Verificar si ya hay token
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/home');
        }
    }, [navigate]);

    // Función para manejar login exitoso desde CardLogin
    const handleLoginSuccess = (userRole, userData) => {
        // Mapeo de roles a rutas
        const roleRoutes = {
            admin: '/admin',
            acompañante: '/admin',
            cordinador: '/admin',
            corrector: '/profe',
            profe: '/profe',
            alumno: '/Alumno',
        };

        // Navegar con el theme incluido en el state
        navigate(roleRoutes[userRole], { 
            state: { 
                usuario: userData,
                theme: theme  // ← Pasamos el theme actual
            } 
        });
    };

    return (
        <div className={`bg-${theme} text-${theme === 'lights' ? 'darks' : 'lights'}`}>
            <button 
                className={`btn btn-${theme === 'lights' ? 'darks' : 'lights'} btn-theme rounded-circle border-0 position-absolute top-0 end-0 m-3`}
                onClick={handleChangeTheme}
            >
                {theme === 'lights' ? 
                    <i className="bi bi-moon text-dark"></i> : 
                    <i className="bi bi-brightness-high text-light"></i>
                }
            </button>

            <CardLogin 
                theme={theme} 
                onLoginSuccess={handleLoginSuccess}  // ← Pasamos la función al CardLogin
            />
        </div>
    );
};