import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Upload, Share2, QrCode } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-6xl mx-auto">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          <span className="text-xl font-bold">Droply</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/login">
            <Button variant="ghost" className="text-gray-300 hover:text-white">
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button className="bg-blue-500 hover:bg-blue-600">
              Sign Up
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl font-bold mb-6">
          Simple File Sharing
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Upload files, generate secure links, and share with QR codes. 
          Simple, fast, and secure.
        </p>
        <Link to="/register">
          <Button size="lg" className="bg-blue-500 hover:bg-blue-600 px-8 py-3">
            Get Started
          </Button>
        </Link>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <Upload className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload</h3>
            <p className="text-gray-400">Drag & drop files up to 50MB</p>
          </div>
          <div className="text-center">
            <Share2 className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Share</h3>
            <p className="text-gray-400">Generate secure links instantly</p>
          </div>
          <div className="text-center">
            <QrCode className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">QR Code</h3>
            <p className="text-gray-400">Easy mobile sharing</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 mt-20">
        <div className="max-w-4xl mx-auto px-6 text-center text-gray-500">
          <p>&copy; 2025 Droply. Simple file sharing.</p>
        </div>
      </footer>
    </div>
  );
}
