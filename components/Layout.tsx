import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Sun, Moon } from 'lucide-react';

export const Layout = ({ children }: { children?: React.ReactNode }) => {
  const { isAuthenticated, logout, user } = useAuth();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check system preference or saved preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden transition-colors duration-500 bg-slate-50 dark:bg-[#0f1115]">
      
      {/* --- NEW BACKGROUND START --- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        
        {/* Technical Grid Pattern (Dots) */}
        <div className="absolute inset-0 z-10 opacity-[0.4] dark:opacity-[0.2]" 
             style={{ 
               backgroundImage: isDark 
                 ? 'radial-gradient(#4b5563 1px, transparent 1px)' 
                 : 'radial-gradient(#cbd5e1 1px, transparent 1px)', 
               backgroundSize: '24px 24px' 
             }}>
        </div>

        {/* Moving Gradient Orbs - Tech Colors (Blue/Cyan/Indigo) */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/40 dark:bg-blue-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] opacity-70 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-300/40 dark:bg-teal-500/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-indigo-300/40 dark:bg-indigo-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-70 animate-blob animation-delay-4000"></div>
        
        {/* Vignette Overlay for Depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/60 dark:to-black/60 z-10"></div>
      </div>
      {/* --- NEW BACKGROUND END --- */}

      {/* Content */}
      <div className="relative z-20 flex flex-col min-h-screen">
        <header className="flex justify-between items-center p-6 w-full max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            {/* Logo Icon */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
              M
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white leading-none">
                Motor Asten
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-cyan-400">
                Technical Solutions
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-white/50 hover:bg-white dark:bg-slate-800/50 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md"
              aria-label="Alternar tema"
            >
              {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-600" />}
            </button>

            {isAuthenticated && (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end">
                    <span className="font-semibold text-sm leading-tight text-slate-700 dark:text-slate-200">{user?.username}</span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">{user?.role === 'admin' ? 'Admin' : 'Staff'}</span>
                </div>
                <button 
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 bg-white/50 hover:bg-red-50 dark:bg-slate-800/50 dark:hover:bg-red-900/20 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 rounded-full transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                  <LogOut size={16} />
                  <span className="text-sm font-semibold hidden md:inline">Sair</span>
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-grow flex flex-col items-center justify-center p-4">
          {children}
        </main>

        <footer className="p-6 text-center text-slate-400 dark:text-slate-600 text-sm">
          <p className="font-medium">&copy; {new Date().getFullYear()} Motor Asten. Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
};