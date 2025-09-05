'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Database, Play, Target, BarChart3, Trophy, Code, Users, CheckCircle, ArrowRight, Github, Linkedin, Twitter } from 'lucide-react';

export default function LandingPage() {
  const [isLoginMode, setIsLoginMode] = useState(false);

  const features = [
    {
      icon: <Code className="w-8 h-8 text-blue-600" />,
      title: "Interactive Query Editor",
      description: "Write and execute SQL queries in a professional environment with syntax highlighting and auto-completion."
    },
    {
      icon: <Target className="w-8 h-8 text-green-600" />,
      title: "SQL Challenges & Quizzes",
      description: "Progressive challenges from beginner to expert level with real-world scenarios and instant feedback."
    },
    {
      icon: <Database className="w-8 h-8 text-purple-600" />,
      title: "Real Database Simulation",
      description: "Practice with actual database schemas including e-commerce, HR, and financial data models."
    },
    {
      icon: <Trophy className="w-8 h-8 text-yellow-600" />,
      title: "Progress Tracking",
      description: "Monitor your learning journey with detailed analytics and achievement badges."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Developer",
      content: "SQL Practice Hub helped me land my dream job! The real-world scenarios made all the difference.",
      avatar: "SC"
    },
    {
      name: "Mike Rodriguez",
      role: "Data Analyst",
      content: "Finally, a platform that makes SQL practice engaging. The progressive challenges are perfectly structured.",
      avatar: "MR"
    }
  ];

  const handleGetStarted = () => {
    // Redirect to signup page
    window.location.href = '/signup';
  };

  const handleLogin = () => {
    // Redirect to login page
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Database className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">SQL Practice Hub</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogin}
                className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg transition-colors"
              >
                Login
              </button>
              <button
                onClick={handleGetStarted}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Master SQL With
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Hands-On Practice</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Interactive queries, real-time feedback, and challenges for all levels. 
              Build confidence in SQL with our comprehensive practice platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Start Practicing Free
                <ArrowRight className="w-5 h-5" />
              </button>
              <Link
                href="/playground"
                className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-8 py-4 rounded-xl hover:from-green-600 hover:to-teal-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Try SQL Playground
                <Database className="w-5 h-5" />
              </Link>
              <button
                onClick={handleLogin}
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 font-semibold text-lg"
              >
                Sign In
              </button>
              <button
                onClick={() => window.location.href = '/playground'}
                className="bg-gray-600 text-white px-8 py-4 rounded-xl hover:bg-gray-700 transition-all duration-300 font-medium text-lg"
              >
                Quick Test →
              </button>
            </div>
            
            {/* Stats */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">1000+</div>
                <div className="text-gray-600">Practice Questions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">50k+</div>
                <div className="text-gray-600">Students Learning</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">95%</div>
                <div className="text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From beginner-friendly tutorials to advanced optimization challenges
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300 hover:border-gray-300 h-full">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Practice in a Real Environment
            </h2>
            <p className="text-xl text-gray-600">
              No installation required—start coding immediately
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border">
              {/* Mock Editor Header */}
              <div className="bg-gray-900 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-gray-400 text-sm font-mono">SQL Query Editor</div>
              </div>
              
              {/* Mock Editor Content */}
              <div className="p-6">
                <div className="bg-gray-900 rounded-lg p-6 mb-4">
                  <pre className="text-green-400 font-mono text-sm">
{`SELECT e.name, d.department_name, e.salary
FROM employees e
JOIN departments d ON e.dept_id = d.id
WHERE e.salary > 50000
ORDER BY e.salary DESC;`}
                  </pre>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-2">Query Results (3 rows)</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-200">
                        <tr>
                          <th className="text-left p-2">name</th>
                          <th className="text-left p-2">department_name</th>
                          <th className="text-left p-2">salary</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t">
                          <td className="p-2">John Smith</td>
                          <td className="p-2">Engineering</td>
                          <td className="p-2">75000</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-2">Sarah Johnson</td>
                          <td className="p-2">Marketing</td>
                          <td className="p-2">65000</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by Developers Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands who've advanced their SQL skills
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl border border-gray-200 shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-700 italic leading-relaxed">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Master SQL?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start your journey today with our comprehensive SQL practice platform
          </p>
          <button
            onClick={() => window.location.href = '/playground'}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-flex items-center gap-2"
          >
            Try It Now (No Login Required)
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Database className="w-6 h-6 text-blue-400" />
                <span className="text-xl font-bold text-white">SQL Practice Hub</span>
              </div>
              <p className="text-gray-400 max-w-md">
                The ultimate platform for mastering SQL through hands-on practice and real-world challenges.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <Github className="w-6 h-6 hover:text-white transition-colors cursor-pointer" />
                <Linkedin className="w-6 h-6 hover:text-white transition-colors cursor-pointer" />
                <Twitter className="w-6 h-6 hover:text-white transition-colors cursor-pointer" />
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p>&copy; 2024 SQL Practice Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
