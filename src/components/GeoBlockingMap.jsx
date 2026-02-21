import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Circle, Marker, useMap, useMapEvents } from 'react-leaflet'
import { Search, MapPin } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Component to update map view when coordinates change
function MapUpdater({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView(center, zoom)
    }
  }, [center, zoom, map])
  return null
}

// Component to handle map clicks
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng)
      }
    },
  })
  return null
}

export default function GeoBlockingMap({ 
  latitude, 
  longitude, 
  radius = 50, 
  address = '',
  onLocationChange,
  onRadiusChange,
  className = ''
}) {
  const [searchQuery, setSearchQuery] = useState(address)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const [mapCenter, setMapCenter] = useState([latitude || -27.4698, longitude || 153.0251]) // Brisbane default
  const [markerPosition, setMarkerPosition] = useState(latitude && longitude ? [latitude, longitude] : null)
  const [currentRadius, setCurrentRadius] = useState(radius)

  // Geocode address search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setSearching(true)
    setSearchError(null)

    try {
      // Use Nominatim (OpenStreetMap) for free geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(searchQuery)}&` +
        `format=json&` +
        `limit=1&` +
        `countrycodes=au`
      )
      
      const data = await response.json()
      
      if (data.length === 0) {
        setSearchError('Location not found. Try a more specific address.')
        return
      }

      const result = data[0]
      const lat = parseFloat(result.lat)
      const lng = parseFloat(result.lon)

      setMapCenter([lat, lng])
      setMarkerPosition([lat, lng])
      
      if (onLocationChange) {
        onLocationChange({
          latitude: lat,
          longitude: lng,
          address: result.display_name
        })
      }
    } catch (error) {
      setSearchError('Search failed. Please try again.')
      console.error('Geocoding error:', error)
    } finally {
      setSearching(false)
    }
  }

  // Handle map click to set marker
  const handleMapClick = (latlng) => {
    setMarkerPosition([latlng.lat, latlng.lng])
    if (onLocationChange) {
      onLocationChange({
        latitude: latlng.lat,
        longitude: latlng.lng,
        address: '' // Clear address when manually placing marker
      })
    }
  }

  // Handle radius change
  const handleRadiusChange = (e) => {
    const newRadius = parseInt(e.target.value)
    setCurrentRadius(newRadius)
    if (onRadiusChange) {
      onRadiusChange(newRadius)
    }
  }

  // Update map when props change
  useEffect(() => {
    if (latitude && longitude) {
      setMapCenter([latitude, longitude])
      setMarkerPosition([latitude, longitude])
    }
  }, [latitude, longitude])

  useEffect(() => {
    setCurrentRadius(radius)
  }, [radius])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search bar */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Search Venue Address
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter venue address (e.g., '8 Annerley Rd, Woolloongabba QLD')"
              className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching || !searchQuery.trim()}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-dark-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>
        {searchError && (
          <p className="mt-2 text-sm text-red-500">{searchError}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Or click on the map to manually place the venue marker
        </p>
      </div>

      {/* Radius slider */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Geo-Blocking Radius: {currentRadius}km
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="200"
            step="1"
            value={currentRadius}
            onChange={handleRadiusChange}
            className="flex-1 h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <input
            type="number"
            min="1"
            max="200"
            value={currentRadius}
            onChange={handleRadiusChange}
            className="w-20 px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white text-center focus:outline-none focus:border-red-500"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Viewers within this radius will be blocked from purchasing online access
        </p>
      </div>

      {/* Map */}
      <div className="relative rounded-lg overflow-hidden border border-dark-700" style={{ height: '400px' }}>
        <MapContainer
          center={mapCenter}
          zoom={markerPosition ? 11 : 10}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapUpdater center={mapCenter} zoom={markerPosition ? 11 : 10} />
          <MapClickHandler onMapClick={handleMapClick} />
          
          {markerPosition && (
            <>
              <Marker position={markerPosition}>
                {/* Marker popup could be added here */}
              </Marker>
              <Circle
                center={markerPosition}
                radius={currentRadius * 1000} // Convert km to meters
                pathOptions={{
                  color: '#e63946',
                  fillColor: '#e63946',
                  fillOpacity: 0.2,
                  weight: 2
                }}
              />
            </>
          )}
        </MapContainer>
        
        {!markerPosition && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark-900/50 pointer-events-none z-10">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400">Search for a venue or click on the map</p>
            </div>
          </div>
        )}
      </div>

      {markerPosition && (
        <div className="p-4 bg-dark-800 rounded-lg border border-dark-700">
          <h4 className="text-sm font-medium text-white mb-2">Current Settings</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Latitude:</span>
              <span className="ml-2 text-white font-mono">{markerPosition[0].toFixed(6)}</span>
            </div>
            <div>
              <span className="text-gray-500">Longitude:</span>
              <span className="ml-2 text-white font-mono">{markerPosition[1].toFixed(6)}</span>
            </div>
            <div>
              <span className="text-gray-500">Radius:</span>
              <span className="ml-2 text-white font-mono">{currentRadius}km</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
