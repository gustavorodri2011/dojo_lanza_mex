import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Miembros', href: '/members' },
    { name: 'Pagos', href: '/payments' },
    { name: 'Clases', href: '/classes' },
    { name: 'Graduaciones', href: '/graduations' },
    { name: 'QR Check-in', href: '/qr-checkin' },
    { name: 'QR Miembros', href: '/member-qr' },
    { name: 'Alertas', href: '/alerts' },
    { name: 'Reportes', href: '/reports' }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-800">🥋 Dojo Manager</h1>
            </div>
            
            {/* Mobile menu button - Always visible */}
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 hover:text-gray-900 p-2"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation - Always mobile style */}
          {mobileMenuOpen && (
            <div className="border-t border-gray-200">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition duration-200 ${
                      location.pathname === item.href
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="border-t border-gray-200 pt-2">
                  <div className="px-3 py-2 text-gray-600 text-sm">Hola, {user?.username}</div>
                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md text-base font-medium transition duration-200"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;