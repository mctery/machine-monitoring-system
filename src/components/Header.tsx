// src/components/Header.tsx
import { Activity, Moon, Sun } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useThemeStore } from '../store/useThemeStore';

const Header = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useThemeStore();

  const navItems = [
    { path: '/', label: 'Timeline Viewer' },
    { path: '/status', label: 'Machine Monitoring' },
    { path: '/setup', label: 'Setup' },
    // Only show Simulation in development mode
    ...(import.meta.env.DEV ? [{ path: '/simulation', label: 'Simulation' }] : [])
  ];

  return (
    <header className="bg-gray-700 dark:bg-gray-900 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-red-500" />
            <div>
              <h1 className="text-xl font-bold">TMOT</h1>
              <p className="text-xs text-gray-300">Machine Monitoring</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <nav className="flex gap-1">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    px-6 py-2 transition-colors font-medium
                    ${location.pathname === item.path
                      ? 'bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-white'
                      : 'bg-gray-600 hover:bg-gray-500 dark:bg-gray-800 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-600 hover:bg-gray-500 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
