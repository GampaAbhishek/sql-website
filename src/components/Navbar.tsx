'use client';

import { useState } from 'react';
import { Database, Plus, Menu, X, Home, BookOpen, Target, Trophy, Info, User, Settings } from 'lucide-react';

interface NavbarProps {
  onGenerateQuestion: () => void;
  showCustomTopic: boolean;
}

export default function Navbar({ onGenerateQuestion, showCustomTopic }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navItems = [
    { name: 'Home', href: '#', icon: Home },
    { name: 'Playground', href: '/playground', icon: Database },
    { name: 'Topics', href: '#topics', icon: BookOpen },
    { name: 'Practice', href: '#practice', icon: Target },
    { name: 'Leaderboard', href: '#leaderboard', icon: Trophy },
    { name: 'About', href: '#about', icon: Info },
  ];

  return (
    <>
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Database className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">SQL Practice Hub</h1>
                  <p className="text-xs text-gray-500 hidden sm:block">Master SQL with AI-powered questions</p>
                </div>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </a>
                );
              })}
            </nav>
            
            {/* Right side actions */}
            <div className="flex items-center gap-4">
              {/* Generate Question Button */}
              <button
                onClick={onGenerateQuestion}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showCustomTopic 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {showCustomTopic ? (
                  <>
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Close</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Generate</span>
                  </>
                )}
              </button>

              {/* User Menu */}
              <div className="hidden md:flex items-center gap-2">
                <button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                  <User className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t bg-white">
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </a>
                );
              })}
              
              {/* Mobile User Actions */}
              <div className="pt-4 border-t space-y-2">
                <button className="flex items-center gap-3 w-full px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                  <User className="w-5 h-5" />
                  Profile
                </button>
                <button className="flex items-center gap-3 w-full px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                  <Settings className="w-5 h-5" />
                  Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
