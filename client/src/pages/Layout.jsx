import React, { useContext } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { LogOut } from 'lucide-react'

const Layout = () => {
  const { user, logout } = useContext(AppContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/app" className="flex items-center">
              <img src="/logo.svg" alt="logo" className="h-10" />
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Hello, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </div>
    </div>
  )
}

export default Layout