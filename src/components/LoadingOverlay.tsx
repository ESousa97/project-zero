import React from 'react';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  submessage?: string;
  darkMode?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = 'Carregando dados do GitHub...',
  submessage = 'Isso pode levar alguns segundos',
  darkMode = true,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className={`rounded-xl p-6 border text-center ${
        darkMode 
          ? 'bg-slate-800 border-slate-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {message}
        </p>
        <p className={`text-sm mt-2 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
          {submessage}
        </p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
