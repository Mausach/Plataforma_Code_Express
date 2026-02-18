import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ListaComisionesDin from '../Estudiantes/Componentes/ListaCOmisionDinamicas';
import NavbarDinamico from '../Estudiantes/Componentes/NavBarEsutiandote';

export const Profes = () => {
    const location = useLocation();
    const { usuario, theme: initialTheme } = location.state || {};  // ← Recibimos el theme del state
    
    // Estado para el tema - prioridad: theme del state, localStorage, 'lights'
    const [theme, setTheme] = useState(() => {
        return initialTheme || localStorage.getItem('theme') || 'lights';
    });
    
    const [activePanel, setActivePanel] = useState('comisiones');

    // Sincronizar body y localStorage cuando cambia el theme
    useEffect(() => {
        document.body.className = theme + '-theme';
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Función para cambiar tema
    const handleChangeTheme = () => {
        const newTheme = theme === 'lights' ? 'darks' : 'lights';
        setTheme(newTheme);
    };

    // Función para renderizar el panel activo
    const renderPanel = () => {
        switch (activePanel) {
            case 'comisiones':
            default:
                return <ListaComisionesDin theme={theme} usuario={usuario} />;
        }
    };

    return (
        <div className={`student-container bg-${theme} text-${theme === 'lights' ? 'darks' : 'lights'}`}>
            <NavbarDinamico
                theme={theme}
                handleChangeTheme={handleChangeTheme}
                usuario={usuario}
            />
            
            <main className="student-content p-4">
                {renderPanel()}
            </main>
        </div>
    );
};
