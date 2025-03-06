'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const Navigation = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'DAW Demo', path: '/demo' },
  ];

  return (
    <nav className="bg-gray-800 text-white py-3 px-4 shadow-md border-b border-gray-700">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-lg">BB</span>
          </div>
          <span className="font-bold text-xl">BeatBattles</span>
        </Link>
        <ul className="flex space-x-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link 
                href={item.path}
                className={cn(
                  "px-3 py-2 rounded-md hover:bg-gray-700 transition-colors",
                  pathname === item.path 
                    ? "bg-gray-700 font-medium text-blue-400" 
                    : "text-gray-300 hover:text-white"
                )}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation; 