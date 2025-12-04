import { Navigate, Route, Routes } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';
import { useAuthStore } from './store/useAuthStore';

const App = () => {
  const token = useAuthStore((state) => state.token);

  return (
    <Routes>
      <Route
        path="/"
        element={token ? <ChatPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/login"
        element={token ? <Navigate to="/" replace /> : <AuthPage />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;

