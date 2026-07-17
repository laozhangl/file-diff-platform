import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, BookOpen, TrendingUp, User, Users, LogOut, GitCompare } from 'lucide-react'
import { useAppStore } from '../store'

const Navbar: React.FC = () => {
  const location = useLocation()
  const user = useAppStore((state) => state.user)

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                <GitCompare className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                文件比对平台
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/') ? 'bg-blue-50 text-primary' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <GitCompare className="w-5 h-5" />
              <span>文件比对</span>
            </Link>
            <Link
              to="/home"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/home') ? 'bg-blue-50 text-primary' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Home className="w-5 h-5" />
              <span>首页</span>
            </Link>
            <Link
              to="/courses"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/courses') ? 'bg-blue-50 text-primary' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span>课程</span>
            </Link>
            <Link
              to="/progress"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/progress') ? 'bg-blue-50 text-primary' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span>进度</span>
            </Link>
            <Link
              to="/community"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/community') ? 'bg-blue-50 text-primary' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>社区</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full" />
                  <span className="text-sm font-medium text-gray-700">{user.username}</span>
                </div>
                <Link to="/profile" className="p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <User className="w-5 h-5 text-gray-600" />
                </Link>
                <button className="p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <LogOut className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm">
                登录
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-100">
        <div className="flex justify-around py-2">
          <Link to="/" className={`flex flex-col items-center p-2 ${isActive('/') ? 'text-primary' : 'text-gray-500'}`}>
            <GitCompare className="w-6 h-6" />
            <span className="text-xs mt-1">比对</span>
          </Link>
          <Link to="/home" className={`flex flex-col items-center p-2 ${isActive('/home') ? 'text-primary' : 'text-gray-500'}`}>
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">首页</span>
          </Link>
          <Link to="/courses" className={`flex flex-col items-center p-2 ${isActive('/courses') ? 'text-primary' : 'text-gray-500'}`}>
            <BookOpen className="w-6 h-6" />
            <span className="text-xs mt-1">课程</span>
          </Link>
          <Link to="/progress" className={`flex flex-col items-center p-2 ${isActive('/progress') ? 'text-primary' : 'text-gray-500'}`}>
            <TrendingUp className="w-6 h-6" />
            <span className="text-xs mt-1">进度</span>
          </Link>
          <Link to="/community" className={`flex flex-col items-center p-2 ${isActive('/community') ? 'text-primary' : 'text-gray-500'}`}>
            <Users className="w-6 h-6" />
            <span className="text-xs mt-1">社区</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar