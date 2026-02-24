/**
 * Convert Google Drive sharing URLs to direct image URLs
 * Input formats:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 * 
 * Uses lh3.googleusercontent.com which is more reliable for embedding
 */
export function getDirectImageUrl(url) {
  if (!url) return url
  
  // Already a direct URL or not a Google Drive link
  if (!url.includes('drive.google.com')) {
    return url
  }
  
  // Extract file ID from various Google Drive URL formats
  let fileId = null
  
  // Format: /file/d/FILE_ID/
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (fileMatch) {
    fileId = fileMatch[1]
  }
  
  // Format: ?id=FILE_ID or &id=FILE_ID
  if (!fileId) {
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
    if (idMatch) {
      fileId = idMatch[1]
    }
  }
  
  if (fileId) {
    // Use lh3.googleusercontent.com which bypasses CORS issues
    // This is the same CDN Google uses for Drive thumbnails
    return `https://lh3.googleusercontent.com/d/${fileId}`
  }
  
  // Return original if we couldn't parse it
  return url
}
