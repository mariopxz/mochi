import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function PublicRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (token) {
    return <Navigate to="/dashboard" replace />;
  } 

  return children;
}