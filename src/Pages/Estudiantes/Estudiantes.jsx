import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ListaComisionesDin from './Componentes/ListaCOmisionDinamicas';
import NavbarDinamico from './Componentes/NavBarEsutiandote';

export const Estudiantes = () => {
    const location = useLocation();
    const { usuario, theme: initialTheme } = location.state || {};
    
    const [theme, setTheme] = useState(() => {
        return initialTheme || localStorage.getItem('theme') || 'lights';
    });
    
    const [activePanel, setActivePanel] = useState('comisiones');

    useEffect(() => {
        document.body.className = theme + '-theme';
        localStorage.setItem('theme', theme);
    }, [theme]);

    const handleChangeTheme = () => {
        const newTheme = theme === 'lights' ? 'darks' : 'lights';
        setTheme(newTheme);
    };

    const renderPanel = () => {
        return <ListaComisionesDin theme={theme} usuario={usuario} />;
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

