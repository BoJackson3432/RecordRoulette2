import { motion } from "framer-motion";
import { 
  Disc, Shuffle, Trophy, TrendingUp, Users, Share2, 
  Headphones, Calendar, Star, Target, Music, Zap 
} from "lucide-react";

export default function Features() {
  const mainFeatures = [
    {
      icon: Disc,
      title: "Vinyl Roulette Experience",
      description: "Authentic vinyl record spinning animation with realistic physics and sound effects",
      color: "from-red-500 to-pink-500"
    },
    {
      icon: Shuffle,
      title: "Smart Discovery Modes",
      description: "Six intelligent ways to discover music: From My Music, For You, New Artists, Russian Roulette, Mood Discovery, and Time-Based",
      color: "from-blue-500 to-indigo-500"
    },
    {
      icon: Trophy,
      title: "Minecraft-Style Achievements",
      description: "31+ fun trophies to unlock, from 'Getting Wood' to 'Diamond!' - gamify your music journey",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: TrendingUp,
      title: "Weekly Statistics & Insights",
      description: "Beautiful recap cards showing your listening habits, genre diversity, and completion rates",
      color: "from-green-500 to-emerald-500"
    }
  ];

  const detailedFeatures = [
    {
      category: "Discovery Engine",
      icon: Target,
      features: [
        "Algorithm filters out singles and greatest hits",
        "Minimum 4-track requirement ensures full albums",
        "Intelligent genre classification and diversity scoring",
        "Personalized recommendations based on listening history"
      ]
    },
    {
      category: "Gamification",
      icon: Trophy,
      features: [
        "Progressive achievement tiers (Bronze → Silver → Gold → Diamond)",
        "Streak tracking for consistent daily listening",
        "Genre exploration rewards for musical diversity",
        "Completion trophies for finishing full albums"
      ]
    },
    {
      category: "Social Features",
      icon: Users,
      features: [
        "Beautiful share cards optimized for Instagram Stories",
        "Profile showcasing with recent achievements",
        "Weekly recap cards with listening statistics",
        "Trophy galleries to show off your musical taste"
      ]
    },
    {
      category: "User Experience",
      icon: Star,
      features: [
        "Stunning vinyl record animations with authentic physics",
        "Gunshot sound effects and explosion animations",
        "Mobile-first design with native sharing capabilities",
        "Dark/light theme support with smooth transitions"
      ]
    }
  ];

  const stats = [
    { number: "6", label: "Discovery Modes", icon: Shuffle },
    { number: "31+", label: "Achievements", icon: Trophy },
    { number: "∞", label: "Albums to Discover", icon: Music },
    { number: "100%", label: "Fun Guaranteed", icon: Zap }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Features That Make Music Discovery Fun
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            RecordRoulette combines the excitement of discovery with the satisfaction of achievement - 
            turning your music exploration into an engaging, gamified experience.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <Icon className="text-indigo-600 dark:text-indigo-400 mx-auto mb-3" size={32} />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.number}</div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</div>
              </div>
            );
          })}
        </motion.div>

        {/* Main Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {mainFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6`}>
                  <Icon className="text-white" size={28} />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Detailed Features */}
        <div className="space-y-12">
          {detailedFeatures.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.8 }}
                className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <Icon className="text-white" size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {section.category}
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-600 dark:text-gray-400">{feature}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="text-center mt-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-12 text-white"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Discover Your Next Favorite Album?</h2>
          <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of music lovers who've transformed their listening habits through gamified discovery
          </p>
          <a 
            href="/" 
            className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            <Headphones size={20} />
            Start Your Musical Journey
          </a>
        </motion.div>
      </div>
    </div>
  );
}