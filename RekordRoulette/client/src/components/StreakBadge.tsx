import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface StreakBadgeProps {
  current: number;
  longest: number;
  className?: string;
}

export default function StreakBadge({ current, longest, className = "" }: StreakBadgeProps) {
  return (
    <div className={`grid grid-cols-2 gap-4 ${className}`} data-testid="streak-badge">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-card/50 border-border text-center relative overflow-hidden">
          <CardContent className="p-4">
            {/* Fire animation background */}
            {current > 0 && (
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-t from-primary/20 to-accent/20 rounded-lg"
              />
            )}
            
            <div className="relative z-10">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <motion.i 
                  className="fas fa-fire text-primary text-xl"
                  animate={current > 0 ? { 
                    scale: [1, 1.2, 1],
                  } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>
              <motion.div 
                className="text-2xl font-bold text-primary mb-1"
                key={current} // Re-animate when value changes
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                data-testid="current-streak"
              >
                {current}
              </motion.div>
              <div className="text-xs text-muted-foreground font-medium">Current Streak</div>
              <div className="text-xs text-muted-foreground">Days in a row</div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-card/50 border-border text-center relative overflow-hidden">
          <CardContent className="p-4">
            {/* Trophy glow */}
            {longest > current && (
              <div className="absolute inset-0 bg-gradient-to-t from-accent/10 to-accent/5 rounded-lg" />
            )}
            
            <div className="relative z-10">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <motion.i 
                  className="fas fa-trophy text-accent text-xl"
                  animate={longest > current ? { 
                    rotateY: [0, 360],
                  } : {}}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </div>
              <motion.div 
                className="text-2xl font-bold text-accent mb-1"
                key={longest}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                data-testid="longest-streak"
              >
                {longest}
              </motion.div>
              <div className="text-xs text-muted-foreground font-medium">Longest Streak</div>
              <div className="text-xs text-muted-foreground">Personal best</div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
