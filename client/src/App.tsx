import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/LoginPage';
import PacientesPage from './pages/PacientesPage';
import PacienteDetailPage from './pages/PacienteDetailPage';
import PacienteCompletoPage from './pages/PacienteCompletoPage';
import OdontogramaPage from './pages/OdontogramaPage';
import PagosPage from './pages/PagosPage';
import TratamientosPage from './pages/TratamientosPage';
import CitasPage from './pages/CitasPage';
import MedicamentosPage from './pages/MedicamentosPage';
import InventarioPage from './pages/InventarioPage';
import AjustesPage from './pages/AjustesPage';
import DashboardFinanciero from './components/Pagos/DashboardFinanciero';
import UsuariosPage from './pages/UsuariosPage';
import './App.css';
import './styles/responsive.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <AuthProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<PacientesPage />} />
                        <Route path="/pacientes" element={<PacientesPage />} />
                        <Route path="/pacientes/:id" element={<PacienteDetailPage />} />
                        <Route path="/paciente/:id/tratamiento" element={<PacienteCompletoPage />} />
                        <Route path="/pacientes/:id/odontograma" element={<OdontogramaPage />} />
                        <Route path="/pacientes/:id/pagos" element={<PagosPage />} />
                        <Route path="/tratamientos" element={<TratamientosPage />} />
                        <Route path="/citas" element={<CitasPage />} />
                        <Route path="/usuarios" element={<UsuariosPage />} />
                        <Route path="/financiero" element={<DashboardFinanciero />} />
                        <Route path="/medicamentos" element={<MedicamentosPage />} />
                        <Route path="/inventario" element={<InventarioPage />} />
                        <Route path="/ajustes" element={<AjustesPage />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </AuthProvider>
      </NotificationProvider>
    </QueryClientProvider>
  );
}

export default App;
