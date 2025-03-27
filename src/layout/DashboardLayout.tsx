// src/layout/DashboardLayout.tsx
import React from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div
      className="min-h-screen w-full text-white font-sans"
      style={{
        backgroundImage: 'linear-gradient(rgba(15,23,42,0.92), rgba(15,23,42,0.92)), url(/assets/network-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Header */}
      <header className="bg-slate-900/70 backdrop-blur-sm shadow p-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400 tracking-wide">
            🌐 Real-Time Analytics Dashboard
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="p-6 sm:p-10 max-w-7xl mx-auto">{children}</main>

      {/* Footer */}
      <footer className="text-gray-400 text-sm text-center mt-10 py-6 border-t border-gray-800">
        &copy; {new Date().getFullYear()} Interactive Analytics — All rights reserved.
      </footer>
    </div>
  );
};

export default DashboardLayout;
