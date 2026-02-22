import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gonalgubgldgpkcekaxe.supabase.co'
const supabaseKey = 'sb_publishable_SB4LfH4EkuEyu5qeC_dffQ_G9cF8Fo_'

const supabase = createClient(supabaseUrl, supabaseKey)

const testEvents = [
  {
    title: "Inception Fight Series 12",
    organization: "Inception Fighting Championship",
    venue: "Brisbane Convention Centre",
    start_time: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
    price: 24.99,
    description: "The biggest night of MMA action returns to Brisbane! Featuring 12 professional bouts including a title fight.",
    status: 'published',
    is_live: false,
    thumbnail_url: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&q=80'
  },
  {
    title: "Fortitude Boxing Night 8",
    organization: "Fortitude Boxing",
    venue: "Fortitude Valley Arena",
    start_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
    price: 19.99,
    description: "8 action-packed boxing bouts featuring Queensland's rising stars.",
    status: 'published',
    is_live: false,
    thumbnail_url: 'https://images.unsplash.com/photo-1552072092-7f9b8d63efcb?w=800&q=80'
  },
  {
    title: "Gold Coast Fight Night",
    organization: "Inception Fighting Championship",
    venue: "Gold Coast Convention Centre",
    start_time: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
    price: 29.99,
    description: "A stacked card of MMA action on the beautiful Gold Coast.",
    status: 'published',
    is_live: false,
    thumbnail_url: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800&q=80'
  },
  {
    title: "Warrior's Challenge 15",
    organization: "Warriors Combat",
    venue: "Ipswich Civic Centre",
    start_time: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
    price: 19.99,
    description: "Amateur and semi-pro MMA showcase featuring the best up-and-coming talent.",
    status: 'published',
    is_live: false,
    thumbnail_url: 'https://images.unsplash.com/photo-1517438322307-e67111335449?w=800&q=80'
  },
  {
    title: "Fortitude Boxing Night 7",
    organization: "Fortitude Boxing", 
    venue: "Fortitude Valley Arena",
    start_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
    price: 14.99,
    description: "Watch the replay of last week's incredible boxing action!",
    status: 'ended',
    is_live: false,
    mux_playback_id: 'test-playback-id',
    thumbnail_url: 'https://images.unsplash.com/photo-1552072092-7f9b8d63efcb?w=800&q=80'
  }
]

async function addTestEvents() {
  console.log('Adding test events...\n')
  
  for (const event of testEvents) {
    const { data, error } = await supabase
      .from('livestream_events')
      .insert(event)
      .select()
    
    if (error) {
      console.error(`❌ Failed to add "${event.title}":`, error.message)
    } else {
      console.log(`✅ Added: ${event.title}`)
    }
  }
  
  console.log('\nDone! Refresh the events page to see them.')
}

addTestEvents()
