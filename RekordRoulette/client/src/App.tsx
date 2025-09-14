import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

// Pages
import Landing from "@/pages/Landing";
import SpinReveal from "@/pages/SpinReveal";
import Profile from "@/pages/Profile";
import Collection from "@/pages/Collection";
import Statistics from "@/pages/Statistics";
import HowItWorks from "@/pages/HowItWorks";
import Features from "@/pages/Features";
import About from "@/pages/About";
import HelpCenter from "@/pages/HelpCenter";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import NotFound from "@/pages/not-found";

// App Loading Component
function AppLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6">
        {/* Animated Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center space-x-3 mb-8"
        >
          <motion.div 
            className="w-16 h-16 bg-primary rounded-full flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <i className="fas fa-record-vinyl text-primary-foreground text-2xl"></i>
          </motion.div>
          <div className="font-bold text-3xl">
            <span className="text-primary">Record</span>
            <span className="text-foreground">Roulette</span>
          </div>
        </motion.div>

        {/* Loading Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-2"
        >
          <p className="text-xl text-muted-foreground">Getting your music ready...</p>
          <div className="flex items-center justify-center space-x-1">
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0 }}
              className="w-2 h-2 bg-primary rounded-full"
            />
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              className="w-2 h-2 bg-primary rounded-full"
            />
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
              className="w-2 h-2 bg-primary rounded-full"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// App Content Wrapper
function AppContent() {
  const { isLoading: userLoading, error, data: user } = useQuery({
    queryKey: ["/api/me"],
    queryFn: async () => {
      const response = await fetch("/api/me", { credentials: "include" });
      if (response.status === 401) {
        return null; // Return null for unauthenticated users instead of throwing
      }
      if (!response.ok) throw new Error("Failed to fetch user");
      return response.json();
    },
    retry: false,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    refetchInterval: false,
    refetchOnWindowFocus: false, 
    refetchOnReconnect: false,
    refetchOnMount: false, // Don't refetch when component mounts
  });

  // Only show loading on first load, not on subsequent failed auth attempts
  if (userLoading && !error && user === undefined) {
    return <AppLoading />;
  }

  return (
    <div 
      className="min-h-screen"
      style={{
        background: "linear-gradient(135deg, hsl(240 10% 4%) 0%, hsl(240 8% 6%) 100%)",
      }}
    >
      <Navigation />
      
      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Router />
      </motion.main>
      
      <Footer />
      <Toaster />
      <PWAInstallPrompt />
    </div>
  );
}

// Navigation Component
function Navigation() {
  return (
    <motion.nav 
      className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.a 
            href="/" 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            data-testid="nav-logo"
          >
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <i className="fas fa-record-vinyl text-primary-foreground text-xl"></i>
            </div>
            <div className="font-bold text-xl">
              <span className="text-primary">Record</span>
              <span className="text-foreground">Roulette</span>
            </div>
          </motion.a>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-8">
            <a 
              href="/" 
              className="text-foreground hover:text-primary transition-colors font-medium"
              data-testid="nav-home"
            >
              Home
            </a>
            <a 
              href="/collection" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid="nav-collection"
            >
              Collection
            </a>
            <a 
              href="/profile" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid="nav-profile"
            >
              Profile
            </a>
            <a 
              href="/statistics" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid="nav-statistics"
            >
              Statistics
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-muted-foreground hover:text-foreground">
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

// Footer Component  
function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <i className="fas fa-record-vinyl text-primary-foreground"></i>
              </div>
              <div className="font-bold text-lg">
                <span className="text-primary">Record</span>
                <span className="text-foreground">Roulette</span>
              </div>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              Discover music tailored to your taste. Choose from your own collection, personalized recommendations, new artists, or Russian roulette for complete surprise.
            </p>
            <div className="flex items-center space-x-4">
              <a 
                href="https://www.instagram.com/therecordroulette"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="link-instagram"
              >
                <i className="fab fa-instagram text-xl"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="/how-it-works" className="hover:text-foreground transition-colors">How it works</a></li>
              <li><a href="/features" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="/about" className="hover:text-foreground transition-colors">About</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="/help" className="hover:text-foreground transition-colors">Help Center</a></li>
              <li><a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2025 RecordRoulette. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// Router Component
function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/spin/:id" component={SpinReveal} />
      <Route path="/collection" component={Collection} />
      <Route path="/profile" component={Profile} />
      <Route path="/statistics" component={Statistics} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/features" component={Features} />
      <Route path="/about" component={About} />
      <Route path="/help" component={HelpCenter} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfService} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Main App Component
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
