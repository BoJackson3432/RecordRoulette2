import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface ViralTemplate {
  id: string;
  name: string;
  description: string;
  emoji: string;
  template: string;
  hashtags: string[];
  platform: 'instagram' | 'tiktok' | 'twitter' | 'all';
  category: 'add-yours' | 'challenge' | 'trend' | 'story';
}

const VIRAL_TEMPLATES: ViralTemplate[] = [
  {
    id: 'music-taste-addyours',
    name: 'Music Taste Add Yours',
    description: 'Let friends add their music discoveries',
    emoji: '🎵',
    template: '🎵 ADD YOURS: Show your latest music discovery\n\nMine: "[ALBUM_NAME]" by [ARTIST_NAME]\n\n✨ Found on RecordRoulette\n\nDrop yours below! 👇\n\n#MusicTasteAddYours #RecordRoulette #MusicDiscovery #AddYours',
    hashtags: ['#MusicTasteAddYours', '#RecordRoulette', '#MusicDiscovery', '#AddYours'],
    platform: 'instagram',
    category: 'add-yours'
  },
  {
    id: 'first-listen-challenge',
    name: 'First Listen Challenge',
    description: 'Challenge friends to listen to full albums',
    emoji: '🎧',
    template: '🎧 FIRST LISTEN CHALLENGE\n\nListening to "[ALBUM_NAME]" by [ARTIST_NAME] for the first time\n\n🎰 Spun on RecordRoulette\n⏰ Full album, no skips\n\nWho else is doing first listens? Tag me! 🎵\n\n#FirstListenChallenge #RecordRoulette #FullAlbumExperience',
    hashtags: ['#FirstListenChallenge', '#RecordRoulette', '#FullAlbumExperience'],
    platform: 'instagram',
    category: 'challenge'
  },
  {
    id: 'vinyl-vs-digital',
    name: 'Vinyl vs Digital',
    description: 'Compare vinyl and digital listening experiences',
    emoji: '💿',
    template: '💿 VINYL vs DIGITAL\n\nAlbum: "[ALBUM_NAME]" by [ARTIST_NAME]\n\n🎰 Discovered on RecordRoulette\n📀 Digital first listen\n🔥 Now I need the vinyl\n\nDoes vinyl sound better? Drop your thoughts 👇\n\n#VinylVsDigital #RecordRoulette #VinylCollection',
    hashtags: ['#VinylVsDigital', '#RecordRoulette', '#VinylCollection'],
    platform: 'instagram',
    category: 'trend'
  },
  {
    id: 'album-rating-addyours',
    name: 'Album Rating Add Yours',
    description: 'Rate albums and let friends add theirs',
    emoji: '⭐',
    template: '⭐ ALBUM RATING ADD YOURS\n\n"[ALBUM_NAME]" by [ARTIST_NAME]\nMy Rating: [RATING]/10 ⭐\n\n🎰 Found on RecordRoulette\n🎵 [FAVORITE_TRACK] hits different\n\nRate this album in your stories!\n\n#AlbumRating #RecordRoulette #AddYours #MusicReview',
    hashtags: ['#AlbumRating', '#RecordRoulette', '#AddYours', '#MusicReview'],
    platform: 'instagram',
    category: 'add-yours'
  },
  {
    id: 'decade-discovery',
    name: 'Decade Discovery',
    description: 'Discover music from different decades',
    emoji: '🕺',
    template: '🕺 DECADE DISCOVERY: [DECADE]s\n\n"[ALBUM_NAME]" by [ARTIST_NAME]\n\n✨ Time traveling with RecordRoulette\n🎵 This [DECADE]s vibe hits perfect\n\nWhat decade are you exploring? Add yours! 👇\n\n#DecadeDiscovery #RecordRoulette #TimeTravelMusic #[DECADE]sMusic',
    hashtags: ['#DecadeDiscovery', '#RecordRoulette', '#TimeTravelMusic'],
    platform: 'instagram',
    category: 'add-yours'
  },
  {
    id: 'mood-album-match',
    name: 'Mood Album Match',
    description: 'Match albums to current mood',
    emoji: '😌',
    template: '😌 CURRENT MOOD: [MOOD]\n\nPerfect album match: "[ALBUM_NAME]" by [ARTIST_NAME]\n\n🎰 RecordRoulette knows my vibe\n✨ Sometimes random = perfect\n\nWhat album matches your mood? Add yours! 👇\n\n#MoodAlbumMatch #RecordRoulette #CurrentMood #AddYours',
    hashtags: ['#MoodAlbumMatch', '#RecordRoulette', '#CurrentMood', '#AddYours'],
    platform: 'instagram',
    category: 'add-yours'
  },
  {
    id: 'tiktok-pov-discovery',
    name: 'POV Discovery',
    description: 'TikTok POV format for music discovery',
    emoji: '🎬',
    template: '🎬 POV: RecordRoulette just changed your music taste\n\n"[ALBUM_NAME]" - [ARTIST_NAME]\n\n✨ Didn\'t expect to love this\n🎵 Now it\'s on repeat\n💿 Already ordering vinyl\n\n#POV #RecordRoulette #MusicTok #MusicDiscovery #VinylTok #DiscoveryMode',
    hashtags: ['#POV', '#RecordRoulette', '#MusicTok', '#MusicDiscovery', '#VinylTok'],
    platform: 'tiktok',
    category: 'trend'
  },
  {
    id: 'discovery-streak',
    name: 'Discovery Streak',
    description: 'Show off your music discovery consistency',
    emoji: '🔥',
    template: '🔥 DISCOVERY STREAK: [STREAK_COUNT] DAYS\n\nToday\'s find: "[ALBUM_NAME]" by [ARTIST_NAME]\n\n🎰 Daily spins on RecordRoulette\n🎵 Expanding my taste daily\n✨ Consistency > perfection\n\nWho else is on a discovery streak? 👇\n\n#DiscoveryStreak #RecordRoulette #DailyMusic #[STREAK_COUNT]Days',
    hashtags: ['#DiscoveryStreak', '#RecordRoulette', '#DailyMusic'],
    platform: 'all',
    category: 'challenge'
  }
];

export default function ViralTemplates() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  const filteredTemplates = VIRAL_TEMPLATES.filter(template => 
    selectedCategory === 'all' || template.category === selectedCategory
  );

  const copyTemplate = async (template: ViralTemplate) => {
    try {
      await navigator.clipboard.writeText(template.template);
      setCopiedTemplate(template.id);
      toast({
        title: `${template.emoji} Template Copied!`,
        description: `"${template.name}" is ready to customize and share!`,
      });
      setTimeout(() => setCopiedTemplate(null), 2000);
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = template.template;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopiedTemplate(template.id);
      toast({
        title: `${template.emoji} Template Copied!`,
        description: `"${template.name}" is ready to customize and share!`,
      });
      setTimeout(() => setCopiedTemplate(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          🔥 Viral Templates
        </h2>
        <p className="text-muted-foreground">
          Copy, customize, and share these trending templates to go viral!
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        {[
          { key: 'all', label: 'All Templates', emoji: '🎵' },
          { key: 'add-yours', label: 'Add Yours', emoji: '➕' },
          { key: 'challenge', label: 'Challenges', emoji: '🏆' },
          { key: 'trend', label: 'Trends', emoji: '🔥' },
          { key: 'story', label: 'Stories', emoji: '📱' }
        ].map((category) => (
          <Button
            key={category.key}
            variant={selectedCategory === category.key ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.key)}
            className={selectedCategory === category.key ? "bg-primary text-primary-foreground" : ""}
          >
            {category.emoji} {category.label}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="bg-card border-border hover:border-primary/50 transition-colors h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="text-2xl">{template.emoji}</span>
                  {template.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    template.category === 'add-yours' ? 'bg-pink-500/20 text-pink-400' :
                    template.category === 'challenge' ? 'bg-purple-500/20 text-purple-400' :
                    template.category === 'trend' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {template.category === 'add-yours' ? '➕ Add Yours' :
                     template.category === 'challenge' ? '🏆 Challenge' :
                     template.category === 'trend' ? '🔥 Trend' :
                     '📱 Story'}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                    {template.platform === 'all' ? '🌐 All Platforms' :
                     template.platform === 'instagram' ? '📷 Instagram' :
                     template.platform === 'tiktok' ? '🎵 TikTok' :
                     '🐦 Twitter'}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Template Preview */}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="text-sm text-foreground whitespace-pre-line">
                    {template.template.substring(0, 120)}
                    {template.template.length > 120 && '...'}
                  </div>
                </div>

                {/* Hashtags */}
                <div className="flex flex-wrap gap-1">
                  {template.hashtags.slice(0, 3).map((hashtag, i) => (
                    <span key={i} className="text-xs text-primary font-medium">
                      {hashtag}
                    </span>
                  ))}
                  {template.hashtags.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{template.hashtags.length - 3} more
                    </span>
                  )}
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => copyTemplate(template)}
                  className="w-full"
                  variant={copiedTemplate === template.id ? "default" : "outline"}
                >
                  {copiedTemplate === template.id ? (
                    <>
                      <i className="fas fa-check mr-2 text-green-500"></i>
                      Copied!
                    </>
                  ) : (
                    <>
                      <i className="fas fa-copy mr-2"></i>
                      Copy Template
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Instructions */}
      <Card className="bg-muted/20 border-primary/20">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <i className="fas fa-lightbulb text-yellow-500"></i>
            How to Use Viral Templates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground mb-2">📝 Customize:</p>
              <ul className="space-y-1">
                <li>• Replace [ALBUM_NAME] with your discovery</li>
                <li>• Replace [ARTIST_NAME] with the artist</li>
                <li>• Add your personal touch and opinion</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground mb-2">🚀 Share:</p>
              <ul className="space-y-1">
                <li>• Post on Instagram, TikTok, or Twitter</li>
                <li>• Tag friends to join the trend</li>
                <li>• Use all the provided hashtags</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}