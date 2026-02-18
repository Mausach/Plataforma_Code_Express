import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import NavbarAdmin from './Componentes/NavbarAdmin';
import { GestionUsuarios } from './Componentes/GestUsuarios';
import { GestionCarreras } from './Componentes/GestCarreras';
import ListaComisiones from './Componentes/Listar_Comisiones';

export const Admins = () => {
    const location = useLocation();
    const { usuario, theme: initialTheme } = location.state || {};
    
    const [theme, setTheme] = useState(() => {
        return initialTheme || localStorage.getItem('theme') || 'lights';
    });
    
    const [activePanel, setActivePanel] = useState('dashboard');

    useEffect(() => {
        document.body.className = theme + '-theme';
        localStorage.setItem('theme', theme);
    }, [theme]);

    const handleChangeTheme = () => {
        const newTheme = theme === 'lights' ? 'darks' : 'lights';
        setTheme(newTheme);
    };

    const renderPanel = () => {
        switch (activePanel) {
            case 'usuarios':
                return <GestionUsuarios theme={theme} />;
            case 'carreras':
                return <GestionCarreras theme={theme} />;
            case 'comisiones':
                return <ListaComisiones theme={theme} usuario={usuario} />;
            case 'dashboard':
            default:
                return <GestionUsuarios theme={theme} />;
        }
    };

    return (
        <div className={`admin-container bg-${theme} text-${theme === 'lights' ? 'darks' : 'lights'}`}>
            <NavbarAdmin
                theme={theme}
                handleChangeTheme={handleChangeTheme}
                activePanel={activePanel}
                setActivePanel={setActivePanel}
            />
            <main className="admin-content p-4">
                {renderPanel()}
            </main>
        </div>
    );
};

export default Admins;