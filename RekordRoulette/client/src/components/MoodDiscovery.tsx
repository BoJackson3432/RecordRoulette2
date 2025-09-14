import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Heart, Zap, Coffee, Moon, Sun, Headphones, Car } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { queryClient } from "@/lib/queryClient";

interface Mood {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
}

interface TimeContext {
  id: string;
  name: string;
  icon: any;
  description: string;
  timeRange?: string;
}

const TIME_CONTEXTS: TimeContext[] = [
  { id: 'morning', name: 'Morning Vibes', icon: Sun, description: 'Start your day right', timeRange: '6AM - 12PM' },
  { id: 'afternoon', name: 'Afternoon Energy', icon: Coffee, description: 'Stay productive', timeRange: '12PM - 5PM' },
  { id: 'evening', name: 'Evening Wind Down', icon: Moon, description: 'Relax and unwind', timeRange: '5PM - 10PM' },
  { id: 'night', name: 'Late Night', icon: Moon, description: 'Calm nighttime sounds', timeRange: '10PM - 6AM' },
  { id: 'workout', name: 'Workout Mode', icon: Zap, description: 'High energy motivation' },
  { id: 'commute', name: 'Commute Companion', icon: Car, description: 'Perfect for travel' }
];

export default function MoodDiscovery() {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [selectedTime, setSelectedTime] = useState<TimeContext | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [discoveryType, setDiscoveryType] = useState<'mood' | 'time'>('mood');

  // Get all available moods
  const { data: moods, isLoading: moodsLoading } = useQuery({
    queryKey: ['/api/moods'],
  });

  // Get user's mood preferences
  const { data: preferences } = useQuery({
    queryKey: ['/api/moods/preferences'],
  });

  // Mood discovery mutation
  const moodDiscoveryMutation = useMutation({
    mutationFn: async (moodId: string) => {
      const response = await fetch(`/api/discover/mood/${moodId}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to get mood recommendations');
      return response.json();
    },
    onSuccess: (data) => {
      setRecommendations(data.recommendations || []);
      queryClient.invalidateQueries({ queryKey: ['/api/moods/preferences'] });
    }
  });

  // Time-based discovery mutation
  const timeDiscoveryMutation = useMutation({
    mutationFn: async (timeContext: string) => {
      const response = await fetch(`/api/discover/time/${timeContext}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to get time-based recommendations');
      return response.json();
    },
    onSuccess: (data) => {
      setRecommendations(data.recommendations || []);
    }
  });

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    setDiscoveryType('mood');
    moodDiscoveryMutation.mutate(mood.id);
  };

  const handleTimeSelect = (timeContext: TimeContext) => {
    setSelectedTime(timeContext);
    setDiscoveryType('time');
    timeDiscoveryMutation.mutate(timeContext.id);
  };

  const getCurrentTimeContext = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return TIME_CONTEXTS[0]; // morning
    if (hour >= 12 && hour < 17) return TIME_CONTEXTS[1]; // afternoon
    if (hour >= 17 && hour < 22) return TIME_CONTEXTS[2]; // evening
    return TIME_CONTEXTS[3]; // night
  };

  useEffect(() => {
    // Auto-select current time context on load
    const currentContext = getCurrentTimeContext();
    setSelectedTime(currentContext);
  }, []);

  if (moodsLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isLoading = moodDiscoveryMutation.isPending || timeDiscoveryMutation.isPending;

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="text-primary" size={24} />
          Smart Discovery
        </CardTitle>
        <p className="text-muted-foreground">
          Find music that matches your mood and moment
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs value={discoveryType} onValueChange={(value) => setDiscoveryType(value as 'mood' | 'time')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mood">Mood-Based</TabsTrigger>
            <TabsTrigger value="time">Time-Based</TabsTrigger>
          </TabsList>

          <TabsContent value="mood" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-4">How are you feeling?</h3>
              
              {/* User's preferred moods */}
              {preferences && preferences.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Your favorites:</p>
                  <div className="flex gap-2 flex-wrap">
                    {preferences.slice(0, 4).map((pref: any) => (
                      <Button
                        key={pref.moodId}
                        variant={selectedMood?.id === pref.moodId ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleMoodSelect(pref)}
                        className="text-sm"
                        data-testid={`button-mood-favorite-${pref.name.toLowerCase()}`}
                      >
                        {pref.emoji} {pref.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* All available moods */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {moods?.map((mood: Mood) => (
                  <motion.div
                    key={mood.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant={selectedMood?.id === mood.id ? "default" : "outline"}
                      onClick={() => handleMoodSelect(mood)}
                      className="h-auto p-4 flex flex-col items-center gap-2 w-full"
                      disabled={isLoading}
                      data-testid={`button-mood-${mood.name.toLowerCase()}`}
                    >
                      <span className="text-2xl">{mood.emoji}</span>
                      <span className="font-medium">{mood.name}</span>
                      <span className="text-xs text-muted-foreground text-center">
                        {mood.description}
                      </span>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="time" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-4">What's the moment?</h3>
              
              {/* Current time suggestion */}
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Right now:</p>
                <Button
                  variant={selectedTime?.id === getCurrentTimeContext().id ? "default" : "outline"}
                  onClick={() => handleTimeSelect(getCurrentTimeContext())}
                  className="flex items-center gap-2"
                  data-testid="button-time-current"
                >
                  <getCurrentTimeContext().icon size={16} />
                  {getCurrentTimeContext().name}
                  <Badge variant="secondary" className="ml-2">Recommended</Badge>
                </Button>
              </div>

              {/* All time contexts */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {TIME_CONTEXTS.map((context) => {
                  const IconComponent = context.icon;
                  return (
                    <motion.div
                      key={context.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant={selectedTime?.id === context.id ? "default" : "outline"}
                        onClick={() => handleTimeSelect(context)}
                        className="h-auto p-4 flex flex-col items-center gap-2 w-full"
                        disabled={isLoading}
                        data-testid={`button-time-${context.id}`}
                      >
                        <IconComponent size={20} />
                        <span className="font-medium">{context.name}</span>
                        <span className="text-xs text-muted-foreground text-center">
                          {context.description}
                        </span>
                        {context.timeRange && (
                          <Badge variant="outline" className="text-xs">
                            {context.timeRange}
                          </Badge>
                        )}
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Finding perfect albums for you...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        <AnimatePresence>
          {recommendations.length > 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  {discoveryType === 'mood' ? 
                    `${selectedMood?.emoji} ${selectedMood?.name} Albums` :
                    `${selectedTime?.name} Picks`
                  }
                </h3>
                <Badge variant="outline">
                  {recommendations.length} recommendations
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.map((album, index) => (
                  <motion.div
                    key={album.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" data-testid={`card-album-${album.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <img
                            src={album.coverUrl}
                            alt={album.name}
                            className="w-16 h-16 rounded object-cover flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium truncate">{album.name}</h4>
                            <p className="text-sm text-muted-foreground truncate">
                              {album.artist}
                            </p>
                            {album.year && (
                              <p className="text-xs text-muted-foreground">
                                {album.year}
                              </p>
                            )}
                            <p className="text-xs text-primary mt-1">
                              {album.reason}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (discoveryType === 'mood' && selectedMood) {
                      handleMoodSelect(selectedMood);
                    } else if (discoveryType === 'time' && selectedTime) {
                      handleTimeSelect(selectedTime);
                    }
                  }}
                  data-testid="button-refresh-recommendations"
                >
                  <Headphones size={16} className="mr-2" />
                  Get More Recommendations
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}