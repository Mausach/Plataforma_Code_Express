import React from 'react'
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom'
import { HomeLogin } from '../Pages/HomeLogin/HomeLogin'
import { Admins } from '../Pages/Admin/Admins'
import { Profes } from '../Pages/Profes/Profes'
import { Estudiantes } from '../Pages/Estudiantes/Estudiantes'
import GestionComisionIndividual from '../Pages/Admin/Componentes/GestComiciones'

export const AppRouter = () => {
  return (
    <HashRouter>
        <Routes>

        <Route path="/*" element={<HomeLogin />} />
        <Route path="/admin" element={<Admins />} />
        <Route path="/gest-comision" element={<GestionComisionIndividual />} />
        <Route path="/profe" element={<Profes />} />
        <Route path="/Alumno" element={<Estudiantes />} />
        



      </Routes>

    </HashRouter>
    
  )
}