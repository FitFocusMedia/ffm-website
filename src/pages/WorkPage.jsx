import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, X, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { projectCategories, allPortfolioImages } from '../lib/images'

const filterOptions = [
  { id: 'all', label: 'All' },
  { id: 'events', label: 'Events' },
  { id: 'athletes', label: 'Athletes' },
  { id: 'promo', label: 'Promo' },
]

const WorkPage = () => {
  const [activeFilter, setActiveFilter] = useState('all')
  const [expandedProject, setExpandedProject] = useState(null)
  const [lightboxImage, setLightboxImage] = useState(null)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [lightboxImages, setLightboxImages] = useState([])

  const filteredImages = activeFilter === 'all'
    ? allPortfolioImages
    : allPortfolioImages.filter(img => img.category === activeFilter)

  const openLightbox = (images, index) => {
    setLightboxImages(images)
    setLightboxIndex(index)
    setLightboxImage(images[index])
  }

  const closeLightbox = () => {
    setLightboxImage(null)
    setLightboxImages([])
  }

  const nextLightbox = () => {
    const next = (lightboxIndex + 1) % lightboxImages.length
    setLightboxIndex(next)
    setLightboxImage(lightboxImages[next])
  }

  const prevLightbox = () => {
    const prev = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length
    setLightboxIndex(prev)
    setLightboxImage(lightboxImages[prev])
  }

  return (
    <div className="pt-20 sm:pt-24">
      {/* Hero */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6">
              <span className="text-gradient">Our Work</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto">
              From grappling events to Muay Thai fight nights, athlete promo shoots to gym content — 
              see how we capture the intensity of combat sports.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-8">Projects</h2>
          
          <div className="space-y-6">
            {projectCategories.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-dark-800 border border-gray-700 rounded-xl overflow-hidden"
              >
                {/* Project header - always visible */}
                <button
                  onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                  className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 sm:p-6 text-left hover:bg-dark-900/30 transition-colors"
                >
                  {/* Preview thumbnail */}
                  <div className="w-full sm:w-24 h-32 sm:h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={project.images[0].src}
                      alt={project.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg sm:text-xl font-bold text-white">{project.name}</h3>
                      <span className="text-xs bg-primary-600/20 text-primary-400 px-2 py-1 rounded-full font-semibold">
                        {project.images.length} photos
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{project.description}</p>
                    <div className="flex gap-2">
                      {project.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-dark-900 text-gray-400 px-2 py-1 rounded border border-gray-700">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-primary-400">
                    <motion.div
                      animate={{ rotate: expandedProject === project.id ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </div>
                </button>

                {/* Expanded gallery */}
                <AnimatePresence>
                  {expandedProject === project.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 sm:px-6 pb-6 border-t border-gray-700 pt-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {project.images.map((img, j) => (
                            <div
                              key={j}
                              onClick={() => openLightbox(project.images, j)}
                              className="gallery-item rounded-lg overflow-hidden cursor-pointer aspect-[4/3]"
                            >
                              <img
                                src={img.src}
                                alt={img.alt}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                              <div className="overlay" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Full Gallery with Filters */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-dark-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Full Gallery</h2>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              {filterOptions.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeFilter === filter.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-800 text-gray-400 hover:text-white border border-gray-700'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            <AnimatePresence mode="popLayout">
              {filteredImages.map((img, i) => (
                <motion.div
                  key={img.src}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => openLightbox(filteredImages, i)}
                  className="gallery-item rounded-lg overflow-hidden cursor-pointer aspect-[4/3]"
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="overlay flex items-end p-3">
                    <p className="text-white text-xs font-semibold">{img.alt}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-black mb-4">
              Want This for <span className="text-gradient">Your Event?</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Get professional media coverage at zero cost. See what we can do for your promotion.
            </p>
            <Link
              to="/proposal"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-lg text-lg transition-all hover:scale-105 card-glow"
            >
              Get Your Free Analysis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lightbox-backdrop"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/80 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {lightboxImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevLightbox() }}
                  className="absolute left-4 z-10 p-3 bg-black/50 rounded-full text-white hover:bg-black/80 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextLightbox() }}
                  className="absolute right-4 z-10 p-3 bg-black/50 rounded-full text-white hover:bg-black/80 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <img
              src={lightboxImage.src}
              alt={lightboxImage.alt}
              className="max-w-[90vw] max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-4 text-center text-white text-sm">
              {lightboxImage.alt} • {lightboxIndex + 1} / {lightboxImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default WorkPage
