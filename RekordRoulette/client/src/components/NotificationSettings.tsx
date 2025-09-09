import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface NotificationPreferences {
  dailyReminder: boolean;
  reminderTime: string;
  weeklyRecap: boolean;
}

export default function NotificationSettings() {
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<NotificationPermission>("default");
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    dailyReminder: false,
    reminderTime: "18:00",
    weeklyRecap: true,
  });

  // Check notification permissions on component mount
  useEffect(() => {
    if ("Notification" in window) {
      setPermissions(Notification.permission);
    }
  }, []);

  // Fetch user notification preferences
  const { data: userPreferences, isLoading } = useQuery({
    queryKey: ["/api/notifications/preferences"],
  });

  // Update local preferences when data is fetched
  useEffect(() => {
    if (userPreferences && typeof userPreferences === 'object') {
      setPreferences({
        dailyReminder: (userPreferences as any).dailyReminder ?? false,
        reminderTime: (userPreferences as any).reminderTime ?? "18:00",
        weeklyRecap: (userPreferences as any).weeklyRecap ?? true,
      });
    }
  }, [userPreferences]);

  // Update preferences mutation
  const updatePreferences = useMutation({
    mutationFn: async (newPreferences: NotificationPreferences) => {
      const response = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPreferences),
      });
      if (!response.ok) throw new Error("Failed to update preferences");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Could not save your notification preferences.",
        variant: "destructive",
      });
    },
  });

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      toast({
        title: "Not Supported",
        description: "Your browser doesn't support notifications.",
        variant: "destructive",
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissions(permission);
      
      if (permission === "granted") {
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive daily spin reminders!",
        });
        
        // Send a test notification
        new Notification("RecordRoulette", {
          body: "Daily notifications are now enabled! 🎵",
          icon: "/favicon.ico",
          badge: "/favicon.ico",
        });
      } else if (permission === "denied") {
        toast({
          title: "Notifications Blocked",
          description: "Please enable notifications in your browser settings to receive reminders.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not request notification permission.",
        variant: "destructive",
      });
    }
  };

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean | string) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    updatePreferences.mutate(newPreferences);
  };

  const testNotification = () => {
    if (permissions === "granted") {
      new Notification("RecordRoulette", {
        body: "Time for your daily music discovery! 🎰🎵",
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      });
      toast({
        title: "Test Sent",
        description: "Check if you received the notification!",
      });
    }
  };

  const getPermissionStatus = () => {
    switch (permissions) {
      case "granted":
        return { text: "Enabled", variant: "default" as const, color: "text-green-400" };
      case "denied":
        return { text: "Blocked", variant: "destructive" as const, color: "text-red-400" };
      default:
        return { text: "Not Set", variant: "secondary" as const, color: "text-yellow-400" };
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const status = getPermissionStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <i className="fas fa-bell text-primary"></i>
                Notifications
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Get reminded when new spins are available
              </p>
            </div>
            <Badge variant={status.variant} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full bg-current ${status.color}`}></div>
              {status.text}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Browser Permission */}
          {permissions !== "granted" && (
            <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-info-circle text-primary text-sm"></i>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-foreground mb-1">
                    Enable Browser Notifications
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Allow RecordRoulette to send you notifications so you never miss a daily spin.
                  </p>
                  <Button
                    size="sm"
                    onClick={requestNotificationPermission}
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                    data-testid="button-enable-notifications"
                  >
                    <i className="fas fa-bell mr-2"></i>
                    Enable Notifications
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          <div className="space-y-4">
            {/* Daily Reminder */}
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
              <div className="flex-1">
                <Label htmlFor="daily-reminder" className="text-foreground font-medium">
                  Daily Spin Reminder
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Get notified when your daily spin is available
                </p>
              </div>
              <Switch
                id="daily-reminder"
                checked={preferences.dailyReminder}
                onCheckedChange={(checked) => handlePreferenceChange("dailyReminder", checked)}
                disabled={permissions !== "granted"}
                data-testid="switch-daily-reminder"
              />
            </div>

            {/* Reminder Time */}
            {preferences.dailyReminder && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="pl-4 border-l-2 border-primary/30"
              >
                <div className="flex items-center gap-4">
                  <Label htmlFor="reminder-time" className="text-sm text-foreground">
                    Reminder Time:
                  </Label>
                  <input
                    id="reminder-time"
                    type="time"
                    value={preferences.reminderTime}
                    onChange={(e) => handlePreferenceChange("reminderTime", e.target.value)}
                    className="px-3 py-1 bg-card border border-border rounded-md text-foreground text-sm focus:border-primary/50 focus:outline-none"
                    data-testid="input-reminder-time"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  We'll remind you at this time each day (your local time)
                </p>
              </motion.div>
            )}

            {/* Weekly Recap */}
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
              <div className="flex-1">
                <Label htmlFor="weekly-recap" className="text-foreground font-medium">
                  Weekly Music Recap
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Get a summary of your week's musical discoveries
                </p>
              </div>
              <Switch
                id="weekly-recap"
                checked={preferences.weeklyRecap}
                onCheckedChange={(checked) => handlePreferenceChange("weeklyRecap", checked)}
                disabled={permissions !== "granted"}
                data-testid="switch-weekly-recap"
              />
            </div>
          </div>

          {/* Test Notification */}
          {permissions === "granted" && (
            <div className="pt-4 border-t border-border/50">
              <Button
                variant="outline"
                size="sm"
                onClick={testNotification}
                className="w-full hover:bg-muted/50"
                data-testid="button-test-notification"
              >
                <i className="fas fa-play mr-2"></i>
                Send Test Notification
              </Button>
            </div>
          )}

          {/* Help Text */}
          <div className="text-xs text-muted-foreground/70 space-y-1">
            <p>• Notifications respect your daily spin limit - only when spins are available</p>
            <p>• You can disable notifications anytime in your browser settings</p>
            <p>• Weekly recaps are sent on Sunday evenings</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}