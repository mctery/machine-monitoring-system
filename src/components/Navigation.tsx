// components/Navigation.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Clock, Settings, Activity } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Time Line', icon: Clock },
    { path: '/status', label: 'Machine Status', icon: Activity },
    { path: '/setup', label: 'Setup', icon: Settings },
    { path: '/contact', label: 'Contact', icon: BarChart3 }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-gray-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-2">
            <Activity className="w-8 h-8 text-red-500" />
            <h1 className="text-xl font-bold">TMOT</h1>
          </div>
          
          <div className="flex items-center">
            <span className="text-sm mr-6">Machine Monitoring</span>
            <div className="flex gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      px-6 py-2 flex items-center gap-2 transition-colors
                      ${active 
                        ? 'bg-gray-200 text-gray-800 font-semibold' 
                        : 'bg-gray-600 hover:bg-gray-500 text-white'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
