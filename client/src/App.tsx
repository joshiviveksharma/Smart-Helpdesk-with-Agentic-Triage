import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { KBPage } from './pages/KBPage';
import { TicketsPage } from './pages/TicketsPage';
import { TicketDetailPage } from './pages/TicketDetailPage';
import { SettingsPage } from './pages/SettingsPage';
import { useAuthStore } from './store/auth';
import { useState, useEffect } from 'react';

function Protected({ children, roles }: { children: JSX.Element; roles?: string[] }) {
  const { token, role } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(role || '')) return <Navigate to="/" replace />;
  return children;
}

function Notification({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) {
  const colors = {
    success: 'bg-green-100 border-green-400 text-green-700',
    error: 'bg-red-100 border-red-400 text-red-700',
    info: 'bg-blue-100 border-blue-400 text-blue-700'
  };

  return (
    <div className={`fixed top-4 right-4 p-4 border rounded-lg shadow-lg ${colors[type]} z-50`}>
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <button onClick={onClose} className="ml-4 text-lg font-bold">&times;</button>
      </div>
    </div>
  );
}

function NavBar() {
  const { token, role, logout } = useAuthStore();
  const nav = useNavigate();
  
  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-gray-800">Smart Helpdesk</Link>
            {token && (
              <>
                <Link to="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
                <Link to="/tickets" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Tickets</Link>
                {role === 'admin' && (
                  <>
                    <Link to="/kb" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Knowledge Base</Link>
                    <Link to="/settings" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Settings</Link>
                  </>
                )}
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {token ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Welcome, {role}</span>
                <button 
                  onClick={() => { logout(); nav('/login'); }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Login</Link>
                <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium rounded-md">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export function App() {
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Protected><DashboardPage onNotification={setNotification} /></Protected>} />
          <Route path="/login" element={<LoginPage onNotification={setNotification} />} />
          <Route path="/register" element={<RegisterPage onNotification={setNotification} />} />
          <Route path="/kb" element={<Protected roles={['admin']}><KBPage onNotification={setNotification} /></Protected>} />
          <Route path="/tickets" element={<Protected><TicketsPage onNotification={setNotification} /></Protected>} />
          <Route path="/tickets/:id" element={<Protected><TicketDetailPage onNotification={setNotification} /></Protected>} />
          <Route path="/settings" element={<Protected roles={['admin']}><SettingsPage onNotification={setNotification} /></Protected>} />
        </Routes>
      </div>
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}
    </div>
  );
}


