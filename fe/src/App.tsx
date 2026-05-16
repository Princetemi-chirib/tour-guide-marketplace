import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { BookingPage } from './pages/BookingPage';
import { GuideDashboardPage } from './pages/GuideDashboardPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { TourDetailPage } from './pages/TourDetailPage';
import { TourListPage } from './pages/TourListPage';
import { UserDashboardPage } from './pages/UserDashboardPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route index element={<HomePage />} />
          <Route element={<Layout />}>
            <Route path="tours" element={<TourListPage />} />
            <Route path="tours/:id" element={<TourDetailPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route
              path="tours/:id/book"
              element={
                <ProtectedRoute roles={['traveler']}>
                  <BookingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute roles={['traveler']}>
                  <UserDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="guide"
              element={
                <ProtectedRoute roles={['guide']}>
                  <GuideDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
