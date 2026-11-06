
import React, { useState } from 'react';
import { SocialPost, Language } from '../types';
import { translations } from '../data/initialData';
import {
  Youtube,
  Instagram,
  Facebook,
  Pause,
  Play,
} from 'lucide-react';

interface SocialMediaSectionProps {
  posts: SocialPost[];
  language: Language;
}

// Convert social media URLs into embed URLs
const getEmbedUrl = (
  url: string,
  platform?: 'youtube' | 'instagram' | 'facebook'
): string | null => {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);

    // YouTube
    if (platform === 'youtube') {
      let videoId = '';

      if (parsedUrl.hostname.includes('youtu.be')) {
        videoId = parsedUrl.pathname.slice(1).split('/')[0];
      } else if (parsedUrl.hostname.includes('youtube.com')) {
        if (parsedUrl.pathname === '/watch') {
          videoId = parsedUrl.searchParams.get('v') || '';
        } else if (
          parsedUrl.pathname.startsWith('/shorts/') ||
          parsedUrl.pathname.startsWith('/live/') ||
          parsedUrl.pathname.startsWith('/embed/')
        ) {
          videoId = parsedUrl.pathname.split('/')[2] || '';
        }
      }

      return videoId
        ? `https://www.youtube-nocookie.com/embed/${videoId}`
        : null;
    }

    // Instagram
    if (platform === 'instagram') {
      const match = parsedUrl.pathname.match(
        /\/(p|reel|tv)\/([^/]+)/
      );

      return match
        ? `https://www.instagram.com/${match[1]}/${match[2]}/embed`
        : null;
    }

    // Facebook
    if (platform === 'facebook') {
      return `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(
        url
      )}&show_text=true&width=260`;
    }

    return null;
  } catch {
    return null;
  }
};

export const SocialMediaSection: React.FC<SocialMediaSectionProps> = ({
  posts,
  language,
}) => {
  const t = translations[language];

  const [platformFilter, setPlatformFilter] = useState<
    'all' | 'youtube' | 'instagram' | 'facebook'
  >('all');

  const [isPaused, setIsPaused] = useState(false);

  const filteredPosts =
    platformFilter === 'all'
      ? posts
      : posts.filter((post) => post.platform === platformFilter);

  // Duplicate posts for seamless animation
  const displayPosts = [...filteredPosts, ...filteredPosts];

  const getPlatformIcon = (
    platform?: 'youtube' | 'instagram' | 'facebook'
  ) => {
    switch (platform) {
      case 'youtube':
        return <Youtube className="w-4 h-4 text-red-500" />;

      case 'instagram':
        return <Instagram className="w-4 h-4 text-pink-500" />;

      case 'facebook':
        return <Facebook className="w-4 h-4 text-blue-600" />;

      default:
        return <Instagram className="w-4 h-4 text-pink-500" />;
    }
  };

  return (
    <section
      id="social"
      className="py-16 md:py-20 bg-[#FBF9F5] overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Heading */}
        <div className="flex items-end justify-between gap-4 mb-8">

          <div>
            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-[#78716C] mb-2 font-mono">
              COMMUNITY BROADCASTS · SOCIAL FEED
            </p>

            <h2 className="font-bengali-serif text-3xl sm:text-4xl text-[#1C1917] font-semibold">
              {t.socialHeading}
            </h2>

            {t.socialSubtitle && (
              <p className="text-[#57534E] text-sm mt-2 max-w-xl">
                {t.socialSubtitle}
              </p>
            )}
          </div>

          {/* Pause / Resume Button */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center gap-2 text-xs text-[#991B1B] border border-[#DDD6C8] rounded-full px-3 py-2 hover:bg-[#EBE6DF] transition-colors shrink-0"
          >
            {isPaused ? (
              <>
                <Play size={13} />
                Resume
              </>
            ) : (
              <>
                <Pause size={13} />
                Pause
              </>
            )}
          </button>

        </div>

        {/* Platform Filters */}
        <div className="flex flex-wrap gap-2 mb-8">

          {[
            {
              id: 'all',
              label: 'All Posts',
              icon: null,
            },
            {
              id: 'youtube',
              label: 'YouTube',
              icon: <Youtube size={14} />,
            },
            {
              id: 'instagram',
              label: 'Instagram',
              icon: <Instagram size={14} />,
            },
            {
              id: 'facebook',
              label: 'Facebook',
              icon: <Facebook size={14} />,
            },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setPlatformFilter(
                  item.id as
                    | 'all'
                    | 'youtube'
                    | 'instagram'
                    | 'facebook'
                );
                setIsPaused(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs transition-all ${
                platformFilter === item.id
                  ? 'bg-[#991B1B] text-white'
                  : 'bg-[#EBE6DF] text-[#57534E] hover:bg-[#DDD6C8]'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}

        </div>
      </div>

      {/* Horizontal Social Media Feed */}
      {filteredPosts.length > 0 ? (
        <div
          className="w-full overflow-x-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
        >
          <div
            className="flex w-max gap-4"
            style={{
              animation: `socialMarquee ${Math.max(
                filteredPosts.length * 12,
                30
              )}s linear infinite`,
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          >
            {displayPosts.map((post, index) => {
              const embedUrl = getEmbedUrl(
                post.url,
                post.platform
              );

              return (
                <div
                  key={`${post.id}-${index}`}
                  className="relative w-[240px] sm:w-[260px] shrink-0"
                  onClick={() => setIsPaused(true)}
                >
                  {/* Original Embedded Post */}
                  {embedUrl ? (
                    <iframe
                      src={embedUrl}
                      title={post.title}
                      className="w-full h-[420px] border-0 bg-white"
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      scrolling="yes"
                    />
                  ) : (
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center h-[300px] text-[#991B1B] text-sm"
                    >
                      {getPlatformIcon(post.platform)}
                      <span className="mt-3">
                        View Original Post
                      </span>
                    </a>
                  )}

                  {/* Pause Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPaused(true);
                    }}
                    aria-label="Pause social feed"
                    className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/90 text-[#991B1B] shadow-sm hover:bg-white"
                  >
                    <Pause size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-center text-sm text-[#78716C] py-12">
          No social media posts available at the moment.
        </p>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes socialMarquee {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          #social .social-marquee {
            animation: none !important;
          }
        }
      `}</style>

    </section>
  );
};
