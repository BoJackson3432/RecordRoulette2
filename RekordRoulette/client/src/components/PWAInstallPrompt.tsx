import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Download, Smartphone } from "lucide-react";
import { pwa } from "@/utils/pwa";
import { motion, AnimatePresence } from "framer-motion";

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    const checkInstallability = () => {
      if (pwa.canInstall() && !localStorage.getItem('pwa-prompt-dismissed')) {
        // Show prompt after a delay to not interrupt initial experience
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 5000);
        return () => clearTimeout(timer);
      }
    };

    // Check initially and after potential events
    checkInstallability();
    
    // Listen for the custom event when install becomes available
    const handleInstallAvailable = () => checkInstallability();
    window.addEventListener('beforeinstallprompt', handleInstallAvailable);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallAvailable);
    };
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const installed = await pwa.promptInstall();
      if (installed) {
        setShowPrompt(false);
        localStorage.setItem('pwa-installed', 'true');
      }
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
    
    // Show again in 7 days
    setTimeout(() => {
      localStorage.removeItem('pwa-prompt-dismissed');
    }, 7 * 24 * 60 * 60 * 1000);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
        >
          <Card className="bg-gradient-to-r from-primary/90 to-primary border-primary/20 backdrop-blur-sm">
            <CardContent className="p-4">
              <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 text-primary-foreground/60 hover:text-primary-foreground"
                data-testid="button-dismiss-install"
              >
                <X size={16} />
              </button>
              
              <div className="flex items-start space-x-3">
                <div className="bg-primary-foreground/10 p-2 rounded-full">
                  <Smartphone className="text-primary-foreground" size={20} />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-primary-foreground mb-1">
                    Install RecordRoulette
                  </h3>
                  <p className="text-xs text-primary-foreground/80 mb-3">
                    Add to your home screen for faster access and offline listening history
                  </p>
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleInstall}
                      disabled={isInstalling}
                      size="sm"
                      variant="secondary"
                      className="text-xs"
                      data-testid="button-install-pwa"
                    >
                      {isInstalling ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
                      ) : (
                        <Download size={12} className="mr-1" />
                      )}
                      {isInstalling ? 'Installing...' : 'Install'}
                    </Button>
                    
                    <Button
                      onClick={handleDismiss}
                      size="sm"
                      variant="ghost"
                      className="text-xs text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                      data-testid="button-not-now"
                    >
                      Not Now
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}