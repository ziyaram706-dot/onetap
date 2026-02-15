import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import DashboardHome from './pages/DashboardHome';
import Leads from './pages/Leads';
import Users from './pages/Users';
import Register from './pages/Register';
import UserHome from './pages/UserHome';
import ServiceRequests from './pages/ServiceRequests';

function ProtectedRoute({ children, roles }) {
    const { user, role, loading } = useAuth();

    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;

    if (roles && !roles.includes(role)) {
        // Redirect based on role presence
        if (role === 'member') return <Navigate to="/user" replace />;
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Member Routes */}
                    <Route path="/user" element={
                        <ProtectedRoute roles={['member']}>
                            <UserHome />
                        </ProtectedRoute>
                    } />

                    {/* Admin Dashboard Routes */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute roles={['super_admin', 'manager', 'telecaller', 'marketing_lead']}>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<DashboardHome />} />
                        <Route path="users" element={
                            <ProtectedRoute roles={['super_admin']}>
                                <Users />
                            </ProtectedRoute>
                        } />
                        <Route path="leads" element={<Leads />} />
                        <Route path="requests" element={
                            <ProtectedRoute roles={['super_admin', 'manager']}>
                                <ServiceRequests />
                            </ProtectedRoute>
                        } />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
