import React from 'react';
import { Router, Route, Link, useLocation } from 'wouter';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { AnimeDetail } from './pages/AnimeDetail';
import { Watch } from './pages/Watch';
import { Browse } from './pages/Browse';
import { Favorites } from './pages/Favorites';
import { ThemeProvider } from './components/ThemeProvider';
import { Navigation } from './components/Navigation';
import { Search as SearchIcon, Home as HomeIcon, Compass, Heart, Menu } from 'lucide-react';

function App() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const isActive = (path: string) => {
    if (path === '/') return location === '/';
    return location.startsWith(path);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <Router>
          {/* Mobile Navigation Header */}
          <div className="md:hidden bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
            <div className="flex items-center justify-between p-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AS</span>
                </div>
                <span className="text-lg font-semibold text-foreground">AnimeStream</span>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
            
            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className="bg-card border-t border-border">
                <nav className="grid grid-cols-4 gap-1 p-2">
                  <Link 
                    href="/" 
                    className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
                      isActive('/') ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <HomeIcon className="w-5 h-5 mb-1" />
                    <span className="text-xs font-medium">Home</span>
                  </Link>
                  <Link 
                    href="/search" 
                    className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
                      isActive('/search') ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <SearchIcon className="w-5 h-5 mb-1" />
                    <span className="text-xs font-medium">Search</span>
                  </Link>
                  <Link 
                    href="/browse" 
                    className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
                      isActive('/browse') ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Compass className="w-5 h-5 mb-1" />
                    <span className="text-xs font-medium">Browse</span>
                  </Link>
                  <Link 
                    href="/favorites" 
                    className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
                      isActive('/favorites') ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Heart className="w-5 h-5 mb-1" />
                    <span className="text-xs font-medium">Favorites</span>
                  </Link>
                </nav>
              </div>
            )}
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex">
            {/* Sidebar Navigation */}
            <div className="fixed left-0 top-0 h-screen w-64 bg-card/50 backdrop-blur-md border-r border-border z-40">
              <div className="flex flex-col h-full p-4">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-3 p-4 rounded-xl hover:bg-muted/50 transition-all duration-200 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold">AS</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-foreground">AnimeStream</h1>
                    <p className="text-xs text-muted-foreground">Watch & Download</p>
                  </div>
                </Link>

                {/* Navigation */}
                <nav className="flex-1 space-y-2">
                  <Link 
                    href="/" 
                    className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                      isActive('/') ? 'text-primary bg-primary/10 shadow-lg' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <HomeIcon className="w-5 h-5" />
                    <span className="font-medium">Home</span>
                  </Link>
                  <Link 
                    href="/search" 
                    className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                      isActive('/search') ? 'text-primary bg-primary/10 shadow-lg' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <SearchIcon className="w-5 h-5" />
                    <span className="font-medium">Search</span>
                  </Link>
                  <Link 
                    href="/browse" 
                    className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                      isActive('/browse') ? 'text-primary bg-primary/10 shadow-lg' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Compass className="w-5 h-5" />
                    <span className="font-medium">Browse</span>
                  </Link>
                  <Link 
                    href="/favorites" 
                    className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                      isActive('/favorites') ? 'text-primary bg-primary/10 shadow-lg' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Heart className="w-5 h-5" />
                    <span className="font-medium">Favorites</span>
                  </Link>
                </nav>

                {/* Footer */}
                <div className="mt-auto pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center">
                    AnimeStream v1.0<br />
                    Powered by AnimeKai
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="ml-64 flex-1">
              <main className="min-h-screen">
                <Route path="/" component={Home} />
                <Route path="/search" component={Search} />
                <Route path="/browse" component={Browse} />
                <Route path="/favorites" component={Favorites} />
                <Route path="/anime/:id" component={AnimeDetail} />
                <Route path="/watch/:id/:episodeId" component={Watch} />
              </main>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden">
            <main className="pb-20">
              <Route path="/" component={Home} />
              <Route path="/search" component={Search} />
              <Route path="/browse" component={Browse} />
              <Route path="/favorites" component={Favorites} />
              <Route path="/anime/:id" component={AnimeDetail} />
              <Route path="/watch/:id/:episodeId" component={Watch} />
            </main>
          </div>
        </Router>
      </div>
    </ThemeProvider>
  );
}

export default App;