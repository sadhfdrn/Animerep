import React from 'react';
import { Link, useLocation } from 'wouter';
import { Home, Search, Compass, Heart, Settings } from 'lucide-react';

export function Navigation() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location === '/';
    return location.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-md border-t border-border z-50 md:hidden">
      <div className="grid grid-cols-5 gap-1 p-2">
        <Link 
          href="/" 
          className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
            isActive('/') ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Home className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Home</span>
        </Link>
        
        <Link 
          href="/search" 
          className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
            isActive('/search') ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Search className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Search</span>
        </Link>
        
        <Link 
          href="/browse" 
          className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
            isActive('/browse') ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Compass className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Browse</span>
        </Link>
        
        <Link 
          href="/favorites" 
          className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
            isActive('/favorites') ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Heart className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Favorites</span>
        </Link>
        
        <Link 
          href="/settings" 
          className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
            isActive('/settings') ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Settings className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Settings</span>
        </Link>
      </div>
    </nav>
  );
}