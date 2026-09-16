import React, { useState } from 'react';
import { Play, Image as ImageIcon, ExternalLink, Maximize2, Video as VideoIcon } from 'lucide-react';

interface MediaViewerProps {
  imageUrl?: string | null;
  videoUrl?: string | null;
  title?: string;
}

export const MediaViewer: React.FC<MediaViewerProps> = ({ imageUrl, videoUrl, title = 'Material Multimedia' }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  if (!imageUrl && !videoUrl) return null;

  // Extraer ID de YouTube de forma robusta (soporta watch?v=, youtu.be/, shorts/, embed/)
  const getYouTubeId = (url: string): string | null => {
    try {
      if (!url) return null;
      const cleanUrl = url.trim();

      // Formato directo de embed
      const embedMatch = cleanUrl.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
      if (embedMatch) return embedMatch[1];

      // Formato shorts
      const shortsMatch = cleanUrl.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
      if (shortsMatch) return shortsMatch[1];

      // Formato youtu.be
      const shortLinkMatch = cleanUrl.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
      if (shortLinkMatch) return shortLinkMatch[1];

      // Formato estándar watch?v=
      const watchMatch = cleanUrl.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
      if (watchMatch) return watchMatch[1];

      // Fallback genérico para 11 caracteres
      const genericMatch = cleanUrl.match(/([a-zA-Z0-9_-]{11})/);
      return genericMatch ? genericMatch[1] : null;
    } catch {
      return null;
    }
  };

  const youtubeId = videoUrl ? getYouTubeId(videoUrl) : null;
  // Usar youtube-nocookie o youtube estándar con referrerPolicy strict-origin-when-cross-origin
  const youtubeEmbedUrl = youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}?rel=0&enablejsapi=1`
    : null;

  const originalYoutubeWatchUrl = youtubeId ? `https://www.youtube.com/watch?v=/${youtubeId}` : videoUrl;
  const isDirectVideo = videoUrl && !youtubeId && (videoUrl.endsWith('.mp4') || videoUrl.endsWith('.webm'));

  return (
    <div className="my-4 rounded-2xl overflow-hidden bg-black/50 border border-white/15 shadow-xl">
      {/* Video section */}
      {videoUrl && (
        <div className="relative w-full aspect-video bg-black flex flex-col items-center justify-center">
          {youtubeEmbedUrl ? (
            <>
              <iframe
                src={youtubeEmbedUrl}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="w-full h-full border-0"
              />
              {/* Botón flotante para abrir en YouTube si hay problemas de reproducción en navegador */}
              <div className="w-full bg-stone-900/90 py-1.5 px-3 flex items-center justify-between text-[11px] text-rose-200 border-t border-white/10">
                <span className="flex items-center gap-1.5 truncate">
                  <VideoIcon className="w-3.5 h-3.5 text-rose-400" />
                  <span>Video táctico de jugada</span>
                </span>
                <a
                  href={originalYoutubeWatchUrl || videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-white hover:text-rose-300 font-bold underline transition-colors"
                >
                  <span>Abrir en YouTube</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </>
          ) : isDirectVideo ? (
            <video controls className="w-full h-full max-h-[420px] object-contain">
              <source src={videoUrl} type="video/mp4" />
              Tu navegador no soporta reproducción de video.
            </video>
          ) : (
            <div className="p-6 text-center">
              <Play className="w-10 h-10 text-rose-400 mx-auto mb-2" />
              <p className="text-sm text-stone-300 mb-3">Enlace de video o situación de juego:</p>
              <a
                href={videoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-semibold tracking-wide transition-all shadow-md"
              >
                <span>Abrir video en nueva pestaña</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Image section */}
      {imageUrl && (
        <div className="relative group overflow-hidden bg-stone-900/60 p-2 flex items-center justify-center">
          <img
            src={imageUrl}
            alt={title}
            className="max-h-72 w-auto object-contain rounded-xl shadow-md transition-transform duration-300 group-hover:scale-[1.01]"
          />
          <button
            onClick={() => setIsZoomed(true)}
            className="absolute bottom-4 right-4 bg-black/70 hover:bg-rose-600 text-white p-2 rounded-full backdrop-blur-md opacity-80 group-hover:opacity-100 transition-all"
            title="Ampliar imagen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Zoom Modal */}
      {isZoomed && imageUrl && (
        <div
          onClick={() => setIsZoomed(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <img
            src={imageUrl}
            alt={title}
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
