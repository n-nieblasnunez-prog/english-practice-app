import { NavLink } from 'react-router-dom'
import { Mic, BarChart2, Settings, Sun, Moon } from 'lucide-react'

export default function Layout({ children, darkMode, setDarkMode }) {
  const navClass = ({ isActive }) =>
    `flex flex-col items-center gap-0.5 px-4 py-2 text-xs font-medium transition-colors ${
      isActive
        ? 'text-primary-600 dark:text-primary-400'
        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
    }`

  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3
                         bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b
                         border-gray-200 dark:border-gray-800 safe-top">
        <span className="font-bold text-lg text-primary-600 dark:text-primary-400 tracking-tight">
          EnglishPro
        </span>
        <button
          onClick={() => setDarkMode(d => !d)}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-24 animate-fade-in">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 z-20 flex justify-around
                      bg-white/90 dark:bg-gray-900/90 backdrop-blur border-t
                      border-gray-200 dark:border-gray-800 safe-bottom">
        <NavLink to="/" end className={navClass}>
          <Mic size={20} />
          Practice
        </NavLink>
        <NavLink to="/dashboard" className={navClass}>
          <BarChart2 size={20} />
          Progress
        </NavLink>
        <NavLink to="/settings" className={navClass}>
          <Settings size={20} />
          Settings
        </NavLink>
      </nav>
    </div>
  )
}
