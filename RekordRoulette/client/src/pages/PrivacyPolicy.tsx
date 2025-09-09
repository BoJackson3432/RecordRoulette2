import { motion } from "framer-motion";
import { Shield, Lock, Eye, Database, UserCheck } from "lucide-react";

export default function PrivacyPolicy() {
  const sections = [
    {
      title: "Information We Collect",
      icon: Database,
      content: [
        "Spotify account information (username, email, profile picture)",
        "Your saved albums, playlists, and listening history",
        "Application usage data (spins, achievements, streaks)",
        "Device and browser information for technical support"
      ]
    },
    {
      title: "How We Use Your Information",
      icon: UserCheck,
      content: [
        "Provide personalized album recommendations",
        "Track your listening achievements and statistics",
        "Generate weekly recap cards and insights",
        "Improve our recommendation algorithms"
      ]
    },
    {
      title: "Information Sharing",
      icon: Lock,
      content: [
        "We never sell your personal data to third parties",
        "Spotify data is only used within our application",
        "Anonymous usage statistics may be used for product improvement",
        "We comply with all applicable data protection regulations"
      ]
    },
    {
      title: "Data Security",
      icon: Shield,
      content: [
        "All data is encrypted in transit and at rest",
        "Regular security audits and vulnerability assessments",
        "Limited access controls for our team members",
        "Secure authentication through Spotify OAuth 2.0"
      ]
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
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="text-white" size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Last updated: September 2025
          </div>
        </motion.div>

        {/* Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <Eye className="text-indigo-600" size={28} />
            Overview
          </h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
            <p>
              RecordRoulette is committed to protecting your privacy and ensuring you understand 
              how we handle your data. We only collect information necessary to provide you with 
              a personalized music discovery experience.
            </p>
            <p>
              This policy applies to all users of RecordRoulette and explains our practices 
              regarding the collection, use, and disclosure of your information when you use our service.
            </p>
          </div>
        </motion.div>

        {/* Detailed Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.4 }}
                className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <Icon className="text-indigo-600" size={28} />
                  {section.title}
                </h2>
                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-600 dark:text-gray-400">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Spotify Integration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-8 rounded-xl mt-12"
        >
          <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-4">
            Spotify Integration
          </h2>
          <div className="space-y-4 text-green-800 dark:text-green-200">
            <p>
              RecordRoulette uses Spotify's API to provide music recommendations and track your 
              listening habits. We request the following permissions:
            </p>
            <ul className="space-y-2 ml-4">
              <li>• Read your saved albums and playlists</li>
              <li>• Access your recently played tracks</li>
              <li>• View your top artists and tracks</li>
              <li>• Get your music recommendations</li>
            </ul>
            <p>
              You can revoke these permissions at any time through your Spotify account settings. 
              We never modify your Spotify library or playlists.
            </p>
          </div>
        </motion.div>

        {/* Your Rights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mt-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Rights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-600 dark:text-gray-400">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Access</h3>
              <p>You can view all your data in your profile and statistics pages.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Deletion</h3>
              <p>Contact us to request deletion of your account and associated data.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Correction</h3>
              <p>You can update your profile information at any time.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Portability</h3>
              <p>Request a copy of your data in a machine-readable format.</p>
            </div>
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="text-center mt-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white"
        >
          <h3 className="text-2xl font-bold mb-4">Questions About Privacy?</h3>
          <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
            If you have any questions about this Privacy Policy or our data practices, 
            please don't hesitate to contact us.
          </p>
          <a 
            href="mailto:privacy@recordroulette.app"
            className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            <Shield size={20} />
            Contact Privacy Team
          </a>
        </motion.div>
      </div>
    </div>
  );
}