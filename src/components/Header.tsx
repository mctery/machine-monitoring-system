// src/components/Header.tsx
import { Activity } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Time Line' },
    { path: '/status', label: 'Machine Status' },
    { path: '/setup', label: 'Setup' },
    { path: '/contact', label: 'Contact' }
  ];
  
  return (
    <header className="bg-gray-700 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-red-500" />
            <div>
              <h1 className="text-xl font-bold">TMOT</h1>
              <p className="text-xs text-gray-300">Machine Monitoring</p>
            </div>
          </div>
          
          <nav className="flex gap-1">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  px-6 py-2 transition-colors font-medium
                  ${location.pathname === item.path
                    ? 'bg-gray-200 text-gray-900'
                    : 'bg-gray-600 hover:bg-gray-500'
                  }
                `}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
