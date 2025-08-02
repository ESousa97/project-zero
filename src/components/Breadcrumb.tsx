import React from 'react';
import type { BreadcrumbItem } from '../types/app';

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  darkMode?: boolean;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ 
  items, 
  darkMode = true 
}) => {
  return (
    <div className="mb-6">
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-4">
          {items.map((item, index) => (
            <React.Fragment key={index}>
              <li>
                {item.onClick && !item.isActive ? (
                  <button
                    onClick={item.onClick}
                    className={`transition-colors ${
                      darkMode 
                        ? 'text-slate-400 hover:text-white' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ) : (
                  <span className={`font-medium ${
                    item.isActive 
                      ? (darkMode ? 'text-blue-400' : 'text-blue-600')
                      : (darkMode ? 'text-slate-400' : 'text-gray-600')
                  }`}>
                    {item.label}
                  </span>
                )}
              </li>
              {index < items.length - 1 && (
                <li>
                  <span className={`${darkMode ? 'text-slate-600' : 'text-gray-400'}`}>
                    /
                  </span>
                </li>
              )}
            </React.Fragment>
          ))}
        </ol>
      </nav>
    </div>
  );
};

export default Breadcrumb;
