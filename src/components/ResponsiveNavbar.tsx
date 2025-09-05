'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Menu, 
  X, 
  User, 
  Settings, 
  LogOut, 
  Crown, 
  Database
} from 'lucide-react';

interface ResponsiveNavbarProps {
  currentPage?: string;
}

export default function ResponsiveNavbar({ currentPage }: ResponsiveNavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
    setIsUserDropdownOpen(false);
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left Section - Menu Button + Logo */}
            <div className="flex items-center space-x-4">
              {/* Menu Button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Logo */}
              <Link href="/dashboard" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white hidden sm:block">SQL Practice Hub</span>
                <span className="text-lg font-bold text-white sm:hidden">SQL Hub</span>
              </Link>
            </div>

            {/* Right Section - User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-sm font-medium hidden sm:block">Premium</span>
              </div>
              
              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors duration-200 focus:outline-none"
                >
                  <span className="text-sm hidden sm:block">{user.name}</span>
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Left Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Left Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-slate-800 border-r border-slate-700 shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Navigation</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="p-4 space-y-2">
          <Link
            href="/playground"
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <span>Playground</span>
          </Link>
          <Link
            href="/challenges"
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <span>Challenges</span>
          </Link>
          <Link
            href="/learning-path"
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <span>Learning Path</span>
          </Link>
          <Link
            href="/interview-prep"
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <span>Interview Prep</span>
          </Link>
          <Link
            href="/my-roadmap"
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <span>My Roadmap</span>
          </Link>
          <Link
            href="/ai-demo"
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <span>AI Assistant Demo</span>
          </Link>
          <Link
            href="/teacher-analytics"
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <span>Teacher Analytics</span>
          </Link>
          <Link
            href="/company-dashboard"
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <span>Company Dashboard</span>
          </Link>
          <Link
            href="/recruiter-testing"
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <span>Recruiter Testing</span>
          </Link>
          <Link
            href="/progress"
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <span>Progress</span>
          </Link>
          <Link
            href="/leaderboard"
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <span>Leaderboard</span>
          </Link>
          <Link
            href="/badges"
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <span>Badges</span>
          </Link>
          <Link
            href="/forum"
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <span>Forum</span>
          </Link>
          <Link
            href="/share-queries"
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <span>Share Queries</span>
          </Link>
          <Link
            href="/custom-db"
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <span>Custom DB</span>
            <Crown className="w-4 h-4 text-yellow-400 ml-auto" />
          </Link>
        </div>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 bg-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{user.name}</div>
              <div className="flex items-center space-x-1">
                <Crown className="w-3 h-3 text-yellow-400" />
                <span className="text-xs text-yellow-400">Premium User</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
