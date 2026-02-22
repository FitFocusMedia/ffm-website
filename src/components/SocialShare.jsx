import { Share2, Twitter, Facebook, Link, MessageCircle } from 'lucide-react'
import { useState } from 'react'

/**
 * Social Sharing Component
 * Easy share to Twitter, Facebook, WhatsApp, or copy link
 * Used on event pages to encourage viral sharing
 */
export default function SocialShare({ url, title, description, className = '' }) {
  const [copied, setCopied] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const shareUrl = url || window.location.href
  const shareTitle = title || document.title
  const shareText = description || ''

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`,
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        })
      } catch (err) {
        // User cancelled or error - fall back to menu
        setShowMenu(true)
      }
    } else {
      setShowMenu(!showMenu)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleNativeShare}
        className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded-lg text-gray-300 hover:text-white transition-colors"
      >
        <Share2 className="w-4 h-4" />
        <span className="text-sm font-medium">Share Event</span>
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-50 overflow-hidden">
            <a
              href={shareLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 hover:bg-dark-700 text-gray-300 hover:text-white transition-colors"
              onClick={() => setShowMenu(false)}
            >
              <Twitter className="w-4 h-4 text-[#1DA1F2]" />
              <span className="text-sm">Twitter</span>
            </a>
            <a
              href={shareLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 hover:bg-dark-700 text-gray-300 hover:text-white transition-colors"
              onClick={() => setShowMenu(false)}
            >
              <Facebook className="w-4 h-4 text-[#4267B2]" />
              <span className="text-sm">Facebook</span>
            </a>
            <a
              href={shareLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 hover:bg-dark-700 text-gray-300 hover:text-white transition-colors"
              onClick={() => setShowMenu(false)}
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span className="text-sm">WhatsApp</span>
            </a>
            <button
              onClick={() => { copyToClipboard(); setShowMenu(false); }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-dark-700 text-gray-300 hover:text-white transition-colors w-full border-t border-dark-700"
            >
              <Link className="w-4 h-4" />
              <span className="text-sm">{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
