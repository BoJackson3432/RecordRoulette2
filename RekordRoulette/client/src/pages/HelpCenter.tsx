import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle, Search, Book, MessageCircle } from "lucide-react";

export default function HelpCenter() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqs = [
    {
      question: "How does RecordRoulette work?",
      answer: "RecordRoulette connects to your Spotify account and uses intelligent algorithms to suggest full albums based on your chosen discovery mode. You can explore your saved music, get personalized recommendations, discover new artists, try completely random albums, or use mood-based and time-based discovery."
    },
    {
      question: "What are the different discovery modes?",
      answer: "We offer six discovery modes: From My Music (albums from your liked songs), For You (personalized recommendations), New Artists (fresh artists you haven't discovered yet), Russian Roulette (completely random popular albums), Mood Discovery (albums matching your current mood), and Time-Based (perfect albums for your current moment like morning, evening, or workout)."
    },
    {
      question: "How do achievements and trophies work?",
      answer: "Our achievement system features 31+ unique trophies that you unlock by listening to music, building streaks, exploring genres, and completing albums. Trophies range from Bronze to Diamond tier and appear on your profile to showcase your musical journey and discoveries."
    },
    {
      question: "Why only full albums and not individual songs?",
      answer: "We believe in the artistic integrity of albums as complete works. Our algorithm filters out singles and greatest hits compilations, requiring a minimum of 4 tracks to ensure you experience music as the artist intended."
    },
    {
      question: "How are my listening statistics calculated?",
      answer: "Your stats track total spins, completed albums, unique artists discovered, genres explored, and daily listening streaks. We generate beautiful analytics showing your musical diversity, completion rate, and top discoveries that you can share on social media."
    },
    {
      question: "Can I share my discoveries on social media?",
      answer: "Absolutely! RecordRoulette offers viral-optimized sharing with Instagram Stories templates, TikTok POV formats, Twitter threads, and achievement cards. Copy pre-written captions with trending hashtags or download beautiful share images for any platform."
    },
    {
      question: "Is my Spotify data safe and private?",
      answer: "Absolutely. We only access the necessary permissions to read your music library and listening history. We never modify your playlists, share your data with third parties, or store sensitive information unnecessarily."
    },
    {
      question: "What if I don't like an album recommendation?",
      answer: "That's part of the discovery process! Not every spin will be a hit, but each one is an opportunity to expand your musical horizons. You can always spin again and try a different discovery mode."
    },
    {
      question: "How do listening streaks work?",
      answer: "Streaks count consecutive days where you've spun at least one album. Your current streak and longest streak are tracked, with special achievements for maintaining consistent listening habits."
    },
    {
      question: "Can I use RecordRoulette without a Spotify Premium account?",
      answer: "RecordRoulette works with both Spotify Free and Premium accounts. However, for the full listening experience and to earn completion-based achievements, Spotify Premium is recommended."
    }
  ];

  const helpCategories = [
    {
      icon: Book,
      title: "Getting Started",
      description: "Learn the basics of using RecordRoulette",
      color: "from-blue-500 to-indigo-500"
    },
    {
      icon: HelpCircle,
      title: "Troubleshooting",
      description: "Solve common issues and problems",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: MessageCircle,
      title: "Contact Support",
      description: "Get personalized help from our team",
      color: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <div className="min-h-screen bg-background py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Help Center
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Find answers to common questions and get the most out of your RecordRoulette experience
          </p>
        </motion.div>

        {/* Help Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {helpCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div key={index} className="bg-card p-6 rounded-xl shadow-sm border border-border text-center hover:shadow-md transition-shadow">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${category.color} flex items-center justify-center`}>
                  <Icon className="text-white" size={28} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {category.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {category.description}
                </p>
              </div>
            );
          })}
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-foreground text-center mb-10">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <span className="text-lg font-medium text-foreground pr-4">
                    {faq.question}
                  </span>
                  {openFAQ === index ? (
                    <ChevronUp className="text-muted-foreground flex-shrink-0" size={20} />
                  ) : (
                    <ChevronDown className="text-muted-foreground flex-shrink-0" size={20} />
                  )}
                </button>
                
                {openFAQ === index && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="px-6 pb-6"
                  >
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-16 bg-gradient-to-r from-primary to-accent rounded-xl p-8 text-primary-foreground"
        >
          <MessageCircle className="mx-auto mb-4" size={48} />
          <h3 className="text-2xl font-bold mb-4">Still Need Help?</h3>
          <p className="text-primary-foreground/80 mb-6 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is here to help you get the most out of your music discovery journey.
          </p>
          <a 
            href="mailto:support@recordroulette.com"
            className="inline-flex items-center gap-2 bg-primary-foreground text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary-foreground/90 transition-colors"
          >
            <MessageCircle size={20} />
            Contact Support
          </a>
        </motion.div>
      </div>
    </div>
  );
}