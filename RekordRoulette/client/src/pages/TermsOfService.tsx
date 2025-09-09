import { motion } from "framer-motion";
import { FileText, AlertCircle, Users, Gavel, Shield } from "lucide-react";

export default function TermsOfService() {
  const sections = [
    {
      title: "Acceptance of Terms",
      content: [
        "By accessing and using RecordRoulette, you agree to be bound by these Terms of Service",
        "If you do not agree to these terms, please do not use our service",
        "We may update these terms from time to time, and your continued use constitutes acceptance"
      ]
    },
    {
      title: "Description of Service",
      content: [
        "RecordRoulette is a music discovery platform that connects to your Spotify account",
        "We provide album recommendations, achievement tracking, and social features",
        "Our service requires a valid Spotify account to function properly"
      ]
    },
    {
      title: "User Accounts and Responsibilities",
      content: [
        "You are responsible for maintaining the confidentiality of your account",
        "You must provide accurate and complete information when creating an account",
        "You are responsible for all activities that occur under your account",
        "You must not use the service for any illegal or unauthorized purpose"
      ]
    },
    {
      title: "Intellectual Property",
      content: [
        "All music content is provided by Spotify and subject to their terms",
        "RecordRoulette's interface, algorithms, and features are our intellectual property",
        "You may not copy, modify, or distribute our software without permission",
        "User-generated content remains your property, but you grant us rights to display it"
      ]
    },
    {
      title: "Privacy and Data Use",
      content: [
        "Your privacy is important to us - see our Privacy Policy for details",
        "We collect and use data as described in our Privacy Policy",
        "You consent to our collection and use of your Spotify data for service functionality",
        "We implement appropriate security measures to protect your information"
      ]
    },
    {
      title: "Prohibited Uses",
      content: [
        "Do not attempt to hack, reverse engineer, or circumvent our security measures",
        "Do not use automated tools to interact with our service",
        "Do not share inappropriate content or engage in harassment",
        "Do not violate any applicable laws or regulations while using our service"
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
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="text-white" size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Please read these terms carefully before using RecordRoulette. 
            They govern your use of our music discovery platform.
          </p>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Last updated: September 2025
          </div>
        </motion.div>

        {/* Quick Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-8 rounded-xl mb-12"
        >
          <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-3">
            <AlertCircle className="text-blue-600" size={28} />
            Quick Summary
          </h2>
          <div className="space-y-4 text-blue-800 dark:text-blue-200">
            <p>
              <strong>In simple terms:</strong> RecordRoulette is a fun music discovery service. 
              Be respectful, don't try to break our systems, and enjoy discovering new music! 
              We connect to your Spotify account to provide personalized recommendations and track your achievements.
            </p>
            <p>
              <strong>Key points:</strong> You need a Spotify account, we respect your privacy, 
              and both parties have rights and responsibilities. Read the full terms below for all the details.
            </p>
          </div>
        </motion.div>

        {/* Detailed Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.4 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {index + 1}. {section.title}
              </h2>
              <ul className="space-y-3">
                {section.content.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-600 dark:text-gray-400 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Limitation of Liability */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 p-8 rounded-xl mt-12"
        >
          <h2 className="text-2xl font-bold text-yellow-900 dark:text-yellow-100 mb-4 flex items-center gap-3">
            <AlertCircle className="text-yellow-600" size={28} />
            Limitation of Liability
          </h2>
          <div className="space-y-4 text-yellow-800 dark:text-yellow-200">
            <p>
              RecordRoulette is provided "as is" without warranties of any kind. We strive to provide 
              a great service but cannot guarantee it will be error-free or always available.
            </p>
            <p>
              Our liability is limited to the maximum extent permitted by law. We are not responsible 
              for any indirect damages or loss of data, though we take reasonable measures to protect your information.
            </p>
          </div>
        </motion.div>

        {/* Termination */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mt-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <Gavel className="text-indigo-600" size={28} />
            Termination
          </h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-400">
            <p>
              You may terminate your account at any time by disconnecting your Spotify account 
              or contacting our support team. We may terminate accounts that violate these terms.
            </p>
            <p>
              Upon termination, your right to use the service ceases immediately. 
              We may retain some data as required by law or for legitimate business purposes.
            </p>
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="text-center mt-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white"
        >
          <h3 className="text-2xl font-bold mb-4">Questions About These Terms?</h3>
          <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
            If you have any questions about these Terms of Service or need clarification, 
            please contact our legal team.
          </p>
          <a 
            href="mailto:legal@recordroulette.app"
            className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            <FileText size={20} />
            Contact Legal Team
          </a>
        </motion.div>
      </div>
    </div>
  );
}