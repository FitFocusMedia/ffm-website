import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_GALLERY_API_URL || 'http://localhost:5230';

export default function DownloadPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(new Set());

  useEffect(() => {
    if (token) {
      fetchOrder();
    } else {
      setError('No download token provided');
      setLoading(false);
    }
  }, [token]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`${API_URL}/api/galleries/download/${token}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to load order');
      }
      const data = await res.json();
      setOrder(data.order);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPhoto = async (photoId, filename) => {
    setDownloading(prev => new Set([...prev, photoId]));
    
    try {
      const res = await fetch(`${API_URL}/api/galleries/download/${token}/photo/${photoId}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Download failed');
      }
      const data = await res.json();
      
      // Open download URL in new tab (triggers browser download)
      const link = document.createElement('a');
      link.href = data.download_url;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Update download status in UI
      setOrder(prev => ({
        ...prev,
        gallery_order_items: prev.gallery_order_items.map(item => 
          item.photo_id === photoId 
            ? { ...item, downloaded: true, download_count: (item.download_count || 0) + 1 }
            : item
        )
      }));
    } catch (err) {
      alert('Download failed: ' + err.message);
    } finally {
      setDownloading(prev => {
        const next = new Set(prev);
        next.delete(photoId);
        return next;
      });
    }
  };

  const downloadAll = async () => {
    const items = order.gallery_order_items || [];
    for (const item of items) {
      await downloadPhoto(item.photo_id, item.gallery_photos.filename);
      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Loading your photos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl text-white mb-4">Unable to Load Downloads</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <p className="text-sm text-gray-500">
            If you've completed your purchase and can't access your photos, 
            please contact us at info@fitfocusmedia.com.au
          </p>
        </div>
      </div>
    );
  }

  const items = order.gallery_order_items || [];
  const gallery = order.galleries;
  const expiresAt = new Date(order.token_expires_at);
  const daysLeft = Math.max(0, Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-white mb-2">Thank You for Your Purchase!</h1>
          <p className="text-gray-400">
            Your photos from <span className="text-white">{gallery?.title}</span> are ready to download.
          </p>
        </div>
      </header>

      {/* Order Info */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-gray-400">Order ID:</span>
              <span className="text-white ml-2">{order.id.slice(0, 8)}</span>
            </div>
            <div>
              <span className="text-gray-400">Email:</span>
              <span className="text-white ml-2">{order.email}</span>
            </div>
            <div>
              <span className="text-gray-400">Photos:</span>
              <span className="text-white ml-2">{items.length}</span>
            </div>
            <div>
              <span className="text-gray-400">Total:</span>
              <span className="text-white ml-2">${(order.total_amount / 100).toFixed(2)}</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between flex-wrap gap-4">
            <div className="text-sm">
              <span className="text-yellow-400">⚠️</span>
              <span className="text-gray-400 ml-2">
                {daysLeft > 0 
                  ? `Downloads expire in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`
                  : 'Downloads have expired'
                }
              </span>
            </div>
            {daysLeft > 0 && (
              <button
                onClick={downloadAll}
                disabled={downloading.size > 0}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg"
              >
                {downloading.size > 0 ? 'Downloading...' : 'Download All'}
              </button>
            )}
          </div>
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(item => {
            const photo = item.gallery_photos;
            const isDownloading = downloading.has(item.photo_id);
            
            return (
              <div key={item.id} className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="aspect-square bg-gray-700 flex items-center justify-center">
                  <div className="text-4xl">📷</div>
                </div>
                
                <div className="p-3">
                  <p className="text-white text-sm truncate mb-2" title={photo.filename}>
                    {photo.filename}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {item.downloaded ? `Downloaded ${item.download_count}x` : 'Not downloaded'}
                    </span>
                    {daysLeft > 0 && (
                      <button
                        onClick={() => downloadPhoto(item.photo_id, photo.filename)}
                        disabled={isDownloading}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                      >
                        {isDownloading ? '...' : '⬇️ Download'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 text-center">
          <h3 className="text-white font-semibold mb-2">Need Help?</h3>
          <p className="text-gray-400 text-sm">
            If you have any issues downloading your photos, please email us at{' '}
            <a href="mailto:info@fitfocusmedia.com.au" className="text-red-400 hover:underline">
              info@fitfocusmedia.com.au
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
