// Image paths - all optimized for web
const BASE = import.meta.env.BASE_URL

export const heroImages = [
  `${BASE}images/hero/aggression-hero-1.jpg`,
  `${BASE}images/hero/aggression-hero-2.jpg`,
  `${BASE}images/hero/aggression-hero-3.jpg`,
  `${BASE}images/hero/wng1-hero-1.jpg`,
  `${BASE}images/hero/wng1-hero-2.jpg`,
]

export const portfolioImages = {
  wng1: [
    { src: `${BASE}images/events/wng1/wng1-01226.jpg`, alt: 'WNG1 Grappling Action', category: 'events' },
    { src: `${BASE}images/events/wng1/wng1-01675.jpg`, alt: 'WNG1 Competition', category: 'events' },
    { src: `${BASE}images/events/wng1/wng1-02953.jpg`, alt: 'WNG1 Match', category: 'events' },
    { src: `${BASE}images/events/wng1/wng1-05237.jpg`, alt: 'WNG1 Event Atmosphere', category: 'events' },
    { src: `${BASE}images/events/wng1/wng1-02527.jpg`, alt: 'WNG1 Action Shot', category: 'events' },
    { src: `${BASE}images/events/wng1/wng1-01588.jpg`, alt: 'WNG1 Grappling', category: 'events' },
  ],
  wng2: [
    { src: `${BASE}images/events/wng2/wng2-09820.jpg`, alt: 'WNG2 Competition', category: 'events' },
    { src: `${BASE}images/events/wng2/wng2-08613.jpg`, alt: 'WNG2 Grappling Action', category: 'events' },
    { src: `${BASE}images/events/wng2/wng2-01906.jpg`, alt: 'WNG2 Match', category: 'events' },
    { src: `${BASE}images/events/wng2/wng2-09420.jpg`, alt: 'WNG2 Event', category: 'events' },
    { src: `${BASE}images/events/wng2/wng2-07770.jpg`, alt: 'WNG2 Action', category: 'events' },
    { src: `${BASE}images/events/wng2/wng2-09170.jpg`, alt: 'WNG2 Competition', category: 'events' },
  ],
  aggression: [
    { src: `${BASE}images/events/aggression/aggression-06388.jpg`, alt: 'Aggression Muay Thai Fight', category: 'events' },
    { src: `${BASE}images/events/aggression/aggression-06742.jpg`, alt: 'Aggression Ring Action', category: 'events' },
    { src: `${BASE}images/events/aggression/aggression-06140.jpg`, alt: 'Aggression Muay Thai', category: 'events' },
    { src: `${BASE}images/events/aggression/aggression-05876.jpg`, alt: 'Aggression Fight Night', category: 'events' },
    { src: `${BASE}images/events/aggression/aggression-06843.jpg`, alt: 'Aggression MT Event', category: 'events' },
  ],
  athletes: [
    { src: `${BASE}images/athletes/wng1-promo/athlete-00666.jpg`, alt: 'Athlete Promo - WNG1', category: 'athletes' },
    { src: `${BASE}images/athletes/wng1-promo/athlete-00559.jpg`, alt: 'Fighter Portrait', category: 'athletes' },
    { src: `${BASE}images/athletes/wng1-promo/athlete-00669.jpg`, alt: 'Athlete Promo Shot', category: 'athletes' },
    { src: `${BASE}images/athletes/wng1-promo/athlete-00601.jpg`, alt: 'Fighter Promo', category: 'athletes' },
    { src: `${BASE}images/athletes/wng1-promo/athlete-00692.jpg`, alt: 'WNG1 Fighter', category: 'athletes' },
    { src: `${BASE}images/athletes/wng1-promo/athlete-00485.jpg`, alt: 'Athlete Portrait', category: 'athletes' },
    { src: `${BASE}images/athletes/wng2-promo/athlete-06134.jpg`, alt: 'WNG2 Athlete Promo', category: 'athletes' },
    { src: `${BASE}images/athletes/wng2-promo/athlete-06092.jpg`, alt: 'WNG2 Fighter Portrait', category: 'athletes' },
    { src: `${BASE}images/athletes/wng2-promo/athlete-05913.jpg`, alt: 'WNG2 Promo Shot', category: 'athletes' },
    { src: `${BASE}images/athletes/wng2-promo/athlete-06067.jpg`, alt: 'WNG2 Athlete', category: 'athletes' },
    { src: `${BASE}images/athletes/wng2-promo/athlete-06031.jpg`, alt: 'Fighter Promo WNG2', category: 'athletes' },
    { src: `${BASE}images/athletes/wng2-promo/athlete-05884.jpg`, alt: 'WNG2 Fighter', category: 'athletes' },
    { src: `${BASE}images/athletes/headshots/headshot-00670.jpg`, alt: 'Professional Headshot', category: 'athletes' },
    { src: `${BASE}images/athletes/headshots/headshot-00667.jpg`, alt: 'Gi Headshot', category: 'athletes' },
    { src: `${BASE}images/athletes/headshots/headshot-00669.jpg`, alt: 'Athlete Headshot', category: 'athletes' },
    { src: `${BASE}images/athletes/headshots/headshot-00678.jpg`, alt: 'BJJ Headshot', category: 'athletes' },
  ],
  gym: [
    { src: `${BASE}images/gym/bjj/bjj-08397.jpg`, alt: 'One Purpose BJJ Training', category: 'promo' },
    { src: `${BASE}images/gym/bjj/bjj-08410.jpg`, alt: 'BJJ Class', category: 'promo' },
    { src: `${BASE}images/gym/bjj/bjj-08478.jpg`, alt: 'BJJ Training Environment', category: 'promo' },
    { src: `${BASE}images/gym/bjj/bjj-08390.jpg`, alt: 'One Purpose BJJ', category: 'promo' },
    { src: `${BASE}images/gym/bjj/bjj-08467.jpg`, alt: 'BJJ Rolling', category: 'promo' },
    { src: `${BASE}images/gym/stuart/stuart-06855.jpg`, alt: 'Fight House Industries', category: 'promo' },
    { src: `${BASE}images/gym/stuart/stuart-07156.jpg`, alt: 'Fight House Training', category: 'promo' },
    { src: `${BASE}images/gym/stuart/stuart-04954.jpg`, alt: 'Gym Environment', category: 'promo' },
    { src: `${BASE}images/gym/stuart/stuart-07504.jpg`, alt: 'Class Photos', category: 'promo' },
    { src: `${BASE}images/gym/stuart/stuart-07260.jpg`, alt: 'Training Session', category: 'promo' },
  ],
}

// Flattened array of all portfolio images
export const allPortfolioImages = [
  ...portfolioImages.wng1,
  ...portfolioImages.wng2,
  ...portfolioImages.aggression,
  ...portfolioImages.athletes,
  ...portfolioImages.gym,
]

// Featured work - hand-picked for the home page grid
export const featuredWork = [
  portfolioImages.aggression[0],
  portfolioImages.wng1[0],
  portfolioImages.athletes[0],
  portfolioImages.wng2[0],
  portfolioImages.gym[0],
  portfolioImages.wng1[2],
  portfolioImages.athletes[6],
  portfolioImages.aggression[3],
]

// Project categories for portfolio page
export const projectCategories = [
  {
    id: 'wng1',
    name: "Who's Next Grappling",
    shortName: 'WNG1',
    description: 'Professional grappling event coverage with multi-camera production and athlete promo shoots.',
    images: portfolioImages.wng1,
    tags: ['Event', 'Grappling', 'Live Production'],
  },
  {
    id: 'wng2',
    name: "Who's Next Grappling 2",
    shortName: 'WNG2',
    description: 'Second edition of WNG featuring expanded coverage, athlete content packages, and PPV streaming.',
    images: portfolioImages.wng2,
    tags: ['Event', 'Grappling', 'PPV'],
  },
  {
    id: 'aggression',
    name: 'Aggression Muay Thai',
    shortName: 'Aggression MT',
    description: 'High-energy Muay Thai fight night with dramatic ring-side photography and broadcast production.',
    images: portfolioImages.aggression,
    tags: ['Event', 'Muay Thai', 'Fight Night'],
  },
  {
    id: 'athletes',
    name: 'Athlete Promo Shoots',
    shortName: 'Athletes',
    description: 'Professional athlete portraits and promotional imagery for fighters across multiple events.',
    images: portfolioImages.athletes,
    tags: ['Athletes', 'Portraits', 'Promo'],
  },
  {
    id: 'gym',
    name: 'Gym & Training',
    shortName: 'Gym/Training',
    description: 'Training environment photography for gyms including One Purpose BJJ and Fight House Industries.',
    images: portfolioImages.gym,
    tags: ['Gym', 'Training', 'Content'],
  },
]
