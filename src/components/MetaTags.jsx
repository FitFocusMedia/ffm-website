import { useEffect } from 'react'

/**
 * Dynamic Meta Tags Component
 * Updates page title and OG tags for better social sharing
 * 
 * Usage: <MetaTags title="Event Name" description="..." image="..." />
 */
export default function MetaTags({ 
  title, 
  description, 
  image, 
  url,
  type = 'website'
}) {
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = `${title} | Fit Focus Media`
    }

    // Helper to set meta tag
    const setMetaTag = (property, content) => {
      if (!content) return
      
      let meta = document.querySelector(`meta[property="${property}"]`) ||
                 document.querySelector(`meta[name="${property}"]`)
      
      if (!meta) {
        meta = document.createElement('meta')
        if (property.startsWith('og:') || property.startsWith('twitter:')) {
          meta.setAttribute('property', property)
        } else {
          meta.setAttribute('name', property)
        }
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    }

    // Set Open Graph tags
    setMetaTag('og:title', title)
    setMetaTag('og:description', description)
    setMetaTag('og:image', image)
    setMetaTag('og:url', url || window.location.href)
    setMetaTag('og:type', type)
    
    // Set Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image')
    setMetaTag('twitter:title', title)
    setMetaTag('twitter:description', description)
    setMetaTag('twitter:image', image)

    // Standard description
    setMetaTag('description', description)

    // Cleanup on unmount
    return () => {
      document.title = 'Fit Focus Media'
    }
  }, [title, description, image, url, type])

  return null // This component doesn't render anything
}
