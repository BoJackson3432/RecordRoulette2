import { motion } from "framer-motion";
import { Heart, Music, Users, Target, Lightbulb, Disc } from "lucide-react";

export default function About() {
  const values = [
    {
      icon: Heart,
      title: "Passion for Music",
      description: "We believe in the transformative power of music and the joy of discovering something completely new"
    },
    {
      icon: Target,
      title: "Intentional Discovery",
      description: "Moving beyond algorithmic suggestions to create meaningful, serendipitous musical encounters"
    },
    {
      icon: Users,
      title: "Community Focus",
      description: "Building connections between music lovers who share the excitement of exploration and discovery"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            About RecordRoulette
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Rediscovering the art of album listening through gamified musical exploration
          </p>
        </motion.div>

        {/* Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-12"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Lightbulb className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Story</h2>
          </div>
          
          <div className="space-y-6 text-gray-600 dark:text-gray-400 leading-relaxed">
            <p>
              In an era of infinite playlists and 30-second previews, we noticed something was missing: 
              the magic of discovering a complete album. The thrill of not knowing what comes next, 
              the surprise of an unexpected genre switch, the satisfaction of experiencing an artist's 
              full creative vision.
            </p>
            
            <p>
              RecordRoulette was born from the simple idea that music discovery should be both 
              intentional and surprising. By combining the excitement of chance with intelligent 
              curation, we've created a space where every spin could lead to your next favorite album.
            </p>
            
            <p>
              We added gamification not just for fun, but because we believe in celebrating the 
              journey of musical exploration. Every streak, every new genre, every completed album 
              is an achievement worth recognizing.
            </p>
          </div>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 md:p-12 text-white mb-12"
        >
          <div className="text-center">
            <Disc className="mx-auto mb-6" size={48} />
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-indigo-100 text-lg max-w-2xl mx-auto">
              To bring back the lost art of album listening by making music discovery 
              an engaging, rewarding, and social experience that celebrates both 
              artistic integrity and personal musical growth.
            </p>
          </div>
        </motion.div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-10">
            What We Believe
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Future */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <Music className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Looking Forward</h2>
          </div>
          
          <div className="space-y-4 text-gray-600 dark:text-gray-400">
            <p>
              We're just getting started. Our roadmap includes social leaderboards, 
              collaborative discovery sessions, artist partnerships, and deeper integration 
              with music streaming platforms.
            </p>
            
            <p>
              But most importantly, we're building a community of music lovers who believe 
              that the best discoveries happen when you give an album the time and attention 
              it deserves.
            </p>
            
            <div className="pt-6">
              <p className="text-gray-900 dark:text-white font-semibold">
                Ready to rediscover the magic of full-album listening?
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}