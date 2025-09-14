import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ViralTemplates from "@/components/ViralTemplates";

export default function ViralCenter() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("templates");

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            🔥 Viral Center
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Templates, challenges, and tools to make your music discoveries go viral
          </p>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            size="sm"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Roulette
          </Button>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="templates" className="text-sm">
                📝 Templates
              </TabsTrigger>
              <TabsTrigger value="challenges" className="text-sm">
                🏆 Challenges
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-sm">
                📊 Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-6">
              <ViralTemplates />
            </TabsContent>

            <TabsContent value="challenges" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      🎯 7-Day Discovery Challenge
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Discover a new album every day for 7 days and share your journey
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <i className="fas fa-check-circle text-green-500 mr-2"></i>
                        Daily album discovery
                      </div>
                      <div className="flex items-center text-sm">
                        <i className="fas fa-share text-blue-500 mr-2"></i>
                        Share each discovery
                      </div>
                      <div className="flex items-center text-sm">
                        <i className="fas fa-trophy text-yellow-500 mr-2"></i>
                        Earn streak trophies
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                      Start Challenge
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      🔥 Listening Streak Challenge
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Listen to at least one full album every day and build your streak
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <i className="fas fa-headphones text-purple-500 mr-2"></i>
                        Full album listening
                      </div>
                      <div className="flex items-center text-sm">
                        <i className="fas fa-fire text-orange-500 mr-2"></i>
                        Track daily streaks
                      </div>
                      <div className="flex items-center text-sm">
                        <i className="fas fa-users text-blue-500 mr-2"></i>
                        Challenge friends
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                      Join Challenge
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/10 to-teal-500/10 border-green-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      🎵 Genre Explorer Challenge
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Discover 10 different music genres and expand your taste
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <i className="fas fa-globe text-green-500 mr-2"></i>
                        Explore new genres
                      </div>
                      <div className="flex items-center text-sm">
                        <i className="fas fa-chart-line text-teal-500 mr-2"></i>
                        Track progress
                      </div>
                      <div className="flex items-center text-sm">
                        <i className="fas fa-medal text-yellow-500 mr-2"></i>
                        Unlock genre badges
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600">
                      Explore Genres
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      💫 Influence Challenge
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get 10 friends to join RecordRoulette through your shares
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <i className="fas fa-user-plus text-blue-500 mr-2"></i>
                        Invite friends
                      </div>
                      <div className="flex items-center text-sm">
                        <i className="fas fa-link text-cyan-500 mr-2"></i>
                        Share discoveries
                      </div>
                      <div className="flex items-center text-sm">
                        <i className="fas fa-crown text-yellow-500 mr-2"></i>
                        Earn influencer badge
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                      Start Sharing
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-card border-border text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-share text-pink-500 text-2xl"></i>
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-2">24</div>
                    <div className="text-muted-foreground text-sm">Total Shares</div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-eye text-purple-500 text-2xl"></i>
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-2">156</div>
                    <div className="text-muted-foreground text-sm">Profile Views</div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-users text-blue-500 text-2xl"></i>
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-2">7</div>
                    <div className="text-muted-foreground text-sm">Friends Joined</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>🔥 Viral Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Instagram Shares</span>
                        <span className="text-sm text-muted-foreground">12 this week</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-pink-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">TikTok Shares</span>
                        <span className="text-sm text-muted-foreground">8 this week</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-white h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Twitter Shares</span>
                        <span className="text-sm text-muted-foreground">4 this week</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}