import { motion } from "framer-motion";
import { Disc, Shuffle, Headphones, Trophy, Users, TrendingUp } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: Disc,
      title: "Connect Spotify",
      description: "Link your Spotify account to access your music library and get personalized recommendations",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Shuffle,
      title: "Daily Spin",
      description: "Once per day, choose your discovery mode and let the algorithm surprise you with a carefully selected album",
      color: "from-blue-500 to-indigo-500"
    },
    {
      icon: Headphones,
      title: "Listen & Explore",
      description: "Give the full album a chance - you might discover your new favorite artist or genre",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Trophy,
      title: "Earn Achievements",
      description: "Build streaks, explore genres, and unlock fun achievements as you discover music",
      color: "from-yellow-500 to-orange-500"
    }
  ];

  const discoveryModes = [
    {
      name: "From My Music",
      description: "Albums from your liked songs and saved music",
      icon: "❤️"
    },
    {
      name: "For You",
      description: "Personalized recommendations based on your taste",
      icon: "✨"
    },
    {
      name: "New Artists",
      description: "Fresh artists you haven't discovered yet",
      icon: "🎭"
    },
    {
      name: "Russian Roulette",
      description: "Completely random popular albums across all genres",
      icon: "🎰"
    },
    {
      name: "Mood Discovery",
      description: "Albums that match your current mood and energy",
      icon: "💫"
    },
    {
      name: "Time-Based",
      description: "Perfect albums for your current moment (morning, evening, workout, etc.)",
      icon: "🕒"
    }
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
            How RecordRoulette Works
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Discover one precious album each day through the excitement of chance and the power of personalization
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="text-white" size={32} />
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {index + 1}. {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Discovery Modes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16 mt-36"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Discovery Modes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {discoveryModes.map((mode, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-center"
              >
                <div className="text-4xl mb-4">{mode.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {mode.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {mode.description}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Gamification */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Why Gamification?</h2>
              <p className="text-indigo-100 text-lg mb-6">
                Music discovery is an adventure. Our achievement system rewards consistency, 
                exploration, and deep listening - turning your musical journey into an engaging game.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Trophy className="text-yellow-300" size={20} />
                  <span>Earn creative achievements</span>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="text-green-300" size={20} />
                  <span>Build listening streaks</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="text-blue-300" size={20} />
                  <span>Show off your musical taste</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="inline-block bg-white/10 backdrop-blur-sm rounded-xl p-8">
                <Trophy className="text-yellow-300 mx-auto mb-4" size={64} />
                <h3 className="text-2xl font-bold mb-2">31+ Achievements</h3>
                <p className="text-indigo-100">From beginner to expert - unlock unique achievements as you explore!</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}