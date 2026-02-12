// Migration Script: Push all leads to Supabase
// Run AFTER creating tables in Supabase SQL Editor

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gonalgubgldgpkcekaxe.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvbmFsZ3ViZ2xkZ3BrY2VrYXhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTk3NDIsImV4cCI6MjA4NjQzNTc0Mn0.GuvFAgWtB0bJ_yf_6NKfPK3Gv-vJH7WhHcJFzvqm9Ew'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// All your leads data
const LEADS = [
  {
    "id": "qbjjc",
    "org_name": "Queensland BJJ Circuit (QBJJC)",
    "sport": "Brazilian Jiu-Jitsu",
    "location": "Queensland-wide (Brisbane-based)",
    "type": "Pure Promotion",
    "tier": 1,
    "priority_score": 92,
    "stage": "contacted",
    "contact": {
      "email": "qbjjcaustralia@gmail.com",
      "phone": null,
      "website": "https://qbjjc.com.au",
      "instagram": "@qbjjc",
      "facebook": "QBJJC",
      "contact_form": "https://qbjjc.com.au/contact-us/",
      "decision_maker": null,
      "confidence": "high"
    },
    "events": {
      "frequency": "15+ events/year",
      "upcoming": ["Gold Coast Championship: Nov 22, 2026"],
      "typical_venue": "Various QLD venues"
    },
    "media_quality": "Basic photography only. No professional video. Major upgrade opportunity.",
    "revenue_potential": "$15K–$70K annually",
    "notes": "Highest volume opportunity in QLD. Zero video coverage currently. Season package potential.",
    "verification_status": "verified",
    "tags": ["bjj", "high-volume", "brisbane", "no-video"],
    "last_contact": "2026-02-07T02:31:57.705Z"
  },
  {
    "id": "beatdown",
    "org_name": "Beatdown Promotions",
    "sport": "MMA",
    "location": "Brisbane (Eatons Hill Hotel)",
    "type": "Pure Promotion",
    "tier": 1,
    "priority_score": 85,
    "stage": "contacted",
    "contact": {
      "email": "damien@base-training.com.au",
      "phone": null,
      "website": "https://beatdownpromotions.com.au",
      "instagram": "@beatdownpromos",
      "facebook": "Beatdown Promotions",
      "contact_form": "https://beatdownpromotions.com.au/contact/",
      "decision_maker": "Damien Brown (former UFC fighter)",
      "confidence": "high"
    },
    "events": {
      "frequency": "Quarterly (3-4/year)",
      "upcoming": ["Beatdown 13: March 20, 2026", "Beatdown 14: July 4, 2026", "Beatdown 15: October 3, 2026"],
      "typical_venue": "Eatons Hill Hotel"
    },
    "media_quality": "Professional multi-cam with DAZN broadcast deal. May have existing media team.",
    "revenue_potential": "$9K–$25K annually",
    "notes": "UFC fighter-owned. Professional operation. Already on DAZN — may need to complement rather than replace.",
    "verification_status": "verified",
    "tags": ["mma", "brisbane", "professional", "dazn"],
    "last_contact": "2026-02-07T02:32:02.482Z"
  },
  {
    "id": "honour",
    "org_name": "Honour Premier League",
    "sport": "Muay Thai",
    "location": "Brisbane",
    "type": "Pure Promotion",
    "tier": 1,
    "priority_score": 82,
    "stage": "new",
    "contact": {
      "email": "team@honourpremierleague.com",
      "phone": "0422 655 064",
      "website": "https://honourpremierleague.com",
      "instagram": "@honourpremierleague",
      "facebook": "HonourPremierLeague",
      "contact_form": null,
      "decision_maker": null,
      "confidence": "high"
    },
    "events": {
      "frequency": "2-4 events/year",
      "upcoming": ["HONOUR ORIGINS: February 28, 2026"],
      "typical_venue": "Major Brisbane venues"
    },
    "media_quality": "Mid-level. Multi-cam but basic graphics. Room for cinematic enhancement.",
    "revenue_potential": "$7K–$32K annually",
    "notes": "Best contact accessibility. Both phone and email verified. Traditional Muay Thai values.",
    "verification_status": "verified",
    "tags": ["muay-thai", "brisbane", "accessible-contact"]
  },
  {
    "id": "tfc",
    "org_name": "The Fight Centre (TFC)",
    "sport": "Boxing, Muay Thai, BJJ, MMA",
    "location": "Logan/Brisbane Southside (Slacks Creek)",
    "type": "Gym + Promotion",
    "tier": 1,
    "priority_score": 86,
    "stage": "new",
    "contact": {
      "email": null,
      "phone": "0488 852 775",
      "website": "https://tfcgym.com.au",
      "instagram": "@tfcgym",
      "facebook": "@thefightcentrebrisbane",
      "contact_form": "https://tfcgym.com.au/contact/",
      "decision_maker": null,
      "confidence": "high"
    },
    "events": {
      "frequency": "20+ fight events annually",
      "upcoming": [],
      "typical_venue": "On-site facility"
    },
    "media_quality": "Basic. One of largest combat sports facilities in Logan/Australia.",
    "revenue_potential": "$12K–$40K annually",
    "notes": "Runs TFC Fight Night series. Gym + promotion hybrid. Verified phone. Regular events.",
    "verification_status": "verified",
    "tags": ["multi-sport", "brisbane", "high-volume", "gym-promotion"]
  },
  {
    "id": "fortitude",
    "org_name": "Fortitude Boxing",
    "sport": "Boxing",
    "location": "Bowen Hills, Brisbane",
    "type": "Gym + Promotion",
    "tier": 1,
    "priority_score": 84,
    "stage": "new",
    "contact": {
      "email": "admin@fortitudeboxinggym.com",
      "phone": "0435 929 311",
      "website": "https://fortitudeboxing.com.au",
      "instagram": "@fortitudeboxing",
      "facebook": "@FortitudeBoxingGymansium",
      "contact_form": "https://fortitudeboxing.com.au/contact",
      "decision_maker": null,
      "confidence": "high"
    },
    "events": {
      "frequency": "Multiple series (Fight Night, Tradie Night, Corporate)",
      "upcoming": [],
      "typical_venue": "Own facility + Fortitude Music Hall"
    },
    "media_quality": "Basic event coverage. Multiple event types = diverse content opportunities.",
    "revenue_potential": "$8K–$25K annually",
    "notes": "3 event series. Brisbane inner city. Verified phone + email. Multiple event types.",
    "verification_status": "verified",
    "tags": ["boxing", "brisbane", "multiple-series", "accessible-contact"]
  },
  {
    "id": "eternal",
    "org_name": "Eternal MMA",
    "sport": "MMA",
    "location": "National (Gold Coast base)",
    "type": "Pure Promotion",
    "tier": 1,
    "priority_score": 81,
    "stage": "new",
    "contact": {
      "email": "media@eternalmma.com",
      "phone": null,
      "website": "https://eternalmma.com",
      "instagram": "@eternalmma",
      "facebook": "Eternal MMA",
      "contact_form": "https://eternalmma.com/contact/",
      "decision_maker": null,
      "confidence": "high"
    },
    "events": {
      "frequency": "2-4 events/month (HIGHEST in Australia)",
      "upcoming": [],
      "typical_venue": "Multiple cities"
    },
    "media_quality": "Existing media department. Dedicated media email suggests existing budget.",
    "revenue_potential": "$20K–$80K annually",
    "notes": "Australia's most active MMA promotion. 100+ events held. 39K Instagram. Dedicated media dept = existing budget.",
    "verification_status": "verified",
    "tags": ["mma", "national", "highest-volume", "media-budget"]
  },
  {
    "id": "rise",
    "org_name": "RISE Championship",
    "sport": "Muay Thai",
    "location": "Brisbane",
    "type": "Pure Promotion",
    "tier": 1,
    "priority_score": 60,
    "stage": "new",
    "contact": {
      "email": null,
      "phone": null,
      "website": "https://www.risechampionship.com.au",
      "instagram": "@risechampionship",
      "facebook": "RISE Championship",
      "contact_form": null,
      "decision_maker": null,
      "confidence": "low"
    },
    "events": {
      "frequency": "Multiple per year (historical)",
      "upcoming": [],
      "typical_venue": "Various Brisbane venues"
    },
    "media_quality": "Unknown. Website down, status uncertain.",
    "revenue_potential": "TBD",
    "notes": "WBC sanctioned. Website currently down. Need to verify if still operating via social media.",
    "verification_status": "needs_verification",
    "tags": ["muay-thai", "brisbane", "uncertain-status"]
  },
  {
    "id": "aftershock",
    "org_name": "Aftershock MMA",
    "sport": "MMA",
    "location": "Brisbane (Nathan)",
    "type": "Gym + Promotion",
    "tier": 1,
    "priority_score": 75,
    "stage": "new",
    "contact": {
      "email": "info@aftershockmma.com",
      "phone": "1300 556 795",
      "website": "https://aftershockmma.com",
      "instagram": "@aftershockmma",
      "facebook": "AftershockMMA",
      "contact_form": null,
      "decision_maker": null,
      "confidence": "high"
    },
    "events": {
      "frequency": "TBD — verify event schedule",
      "upcoming": [],
      "typical_venue": "Nathan, Brisbane"
    },
    "media_quality": "TBD — website reportedly working. Needs assessment.",
    "revenue_potential": "TBD",
    "notes": "1300 business number. Website actually working (conflicting reports). Verify event schedule.",
    "verification_status": "needs_verification",
    "tags": ["mma", "brisbane", "gym-promotion"]
  },
  {
    "id": "infliction",
    "org_name": "Infliction Fight Series",
    "sport": "Muay Thai, Boxing",
    "location": "Gold Coast",
    "type": "Pure Promotion",
    "tier": 2,
    "priority_score": 78,
    "stage": "new",
    "contact": {
      "email": null,
      "phone": null,
      "website": "https://www.inflictionfightseries.com.au",
      "instagram": "@inflictionfightseries",
      "facebook": "Infliction Fight Series",
      "contact_form": "https://www.inflictionfightseries.com.au/contact",
      "decision_maker": "Nick Atkins (IBF Muay Thai Heavyweight World Champion)",
      "confidence": "medium"
    },
    "events": {
      "frequency": "1-2 major events/year",
      "upcoming": ["March 14, 2026 at RACV Royal Pines Resort"],
      "typical_venue": "RACV Royal Pines Resort, Gold Coast"
    },
    "media_quality": "Mid-level with theatrical elements. Ramp walkouts, smoke, music. Could be elevated.",
    "revenue_potential": "$5K–$20K annually",
    "notes": "Premium venue. Founded by world champion. Australia-wide expansion plans = scalable. Next event March 14.",
    "verification_status": "verified",
    "tags": ["muay-thai", "boxing", "gold-coast", "premium-venue"]
  },
  {
    "id": "explosive",
    "org_name": "Explosive Fight Promotions",
    "sport": "Muay Thai, MMA",
    "location": "Cairns, North QLD",
    "type": "Pure Promotion",
    "tier": 2,
    "priority_score": 72,
    "stage": "new",
    "contact": {
      "email": null,
      "phone": null,
      "website": "https://explosivefightpromotions.com.au",
      "instagram": "@explosivefightpromotions",
      "facebook": "Explosive Fight Promotions Cairns",
      "contact_form": "https://explosivefightpromotions.com.au/contact-us/",
      "decision_maker": null,
      "confidence": "medium"
    },
    "events": {
      "frequency": "Quarterly (estimated)",
      "upcoming": [],
      "typical_venue": "Cairns venues"
    },
    "media_quality": "Mid-level. Professional photography, some video. Live streaming variable quality.",
    "revenue_potential": "$8K–$25K annually",
    "notes": "13+ years, 27+ events. Sold out 1400+ attendees. Cairns = travel costs. Already has live streaming.",
    "verification_status": "needs_verification",
    "tags": ["muay-thai", "mma", "cairns", "regional", "travel-required"]
  },
  {
    "id": "ipw",
    "org_name": "IPW Australia (Impact Pro Wrestling)",
    "sport": "Professional Wrestling",
    "location": "Underwood, Brisbane",
    "type": "Pure Promotion",
    "tier": 1,
    "priority_score": 65,
    "stage": "new",
    "contact": {
      "email": null,
      "phone": null,
      "website": "https://www.ipwaustralia.com.au",
      "instagram": "@ipwaustralia",
      "facebook": "IPW Australia",
      "contact_form": "https://www.ipwaustralia.com.au",
      "decision_maker": null,
      "confidence": "medium"
    },
    "events": {
      "frequency": "Monthly",
      "upcoming": [],
      "typical_venue": "Underwood, Brisbane"
    },
    "media_quality": "Basic. Family-friendly wrestling = broader content appeal.",
    "revenue_potential": "$4K–$15K annually",
    "notes": "Monthly events. Family-friendly. Pitch entrance videos, character promos.",
    "verification_status": "verified",
    "tags": ["wrestling", "brisbane", "monthly", "family-friendly"]
  },
  {
    "id": "hamma",
    "org_name": "Hamma Fight Night",
    "sport": "Kickboxing, Boxing, MMA, Grappling",
    "location": "Brisbane (Mansfield Tavern area)",
    "type": "Pure Promotion",
    "tier": 1,
    "priority_score": 62,
    "stage": "new",
    "contact": {
      "email": "h.nguyen@fightcross.com",
      "phone": null,
      "website": null,
      "instagram": null,
      "facebook": "HammaFightNight",
      "contact_form": null,
      "decision_maker": null,
      "confidence": "medium"
    },
    "events": {
      "frequency": "Periodic",
      "upcoming": [],
      "typical_venue": "Mansfield Tavern area"
    },
    "media_quality": "Grassroots. Needs affordable media solutions.",
    "revenue_potential": "$3K–$10K annually",
    "notes": "Grassroots operation. Multiple fight styles. Start with affordable package.",
    "verification_status": "needs_verification",
    "tags": ["multi-sport", "brisbane", "grassroots"]
  },
  {
    "id": "crown",
    "org_name": "Crown Kickboxing",
    "sport": "Kickboxing, BJJ, MMA",
    "location": "West Brisbane (Sumner)",
    "type": "Gym + Promotion",
    "tier": 1,
    "priority_score": 50,
    "stage": "new",
    "contact": {
      "email": null,
      "phone": null,
      "website": "https://crownkickboxing.com.au",
      "instagram": "@crownkickboxing",
      "facebook": "Crown Kickboxing",
      "contact_form": "https://crownkickboxing.com.au",
      "decision_maker": null,
      "confidence": "medium"
    },
    "events": {
      "frequency": "Unverified — may be gym only",
      "upcoming": [],
      "typical_venue": "42 Spine Street, Sumner"
    },
    "media_quality": "Unknown — verify if they run events.",
    "revenue_potential": "TBD",
    "notes": "Established 2021. May not run events (gym classes primarily). Verify before outreach.",
    "verification_status": "needs_verification",
    "tags": ["kickboxing", "brisbane", "gym-only-maybe"]
  },
  {
    "id": "xfc",
    "org_name": "XFC Australia",
    "sport": "MMA, Kickboxing",
    "location": "Brisbane (Mansfield Tavern)",
    "type": "Pure Promotion",
    "tier": 1,
    "priority_score": 55,
    "stage": "new",
    "contact": {
      "email": null,
      "phone": null,
      "website": null,
      "instagram": "@xfcaustralia",
      "facebook": "XFCAustralia",
      "contact_form": null,
      "decision_maker": null,
      "confidence": "medium"
    },
    "events": {
      "frequency": "Unclear — last verified event Aug 2024",
      "upcoming": [],
      "typical_venue": "Mansfield Tavern"
    },
    "media_quality": "Unknown. Website DNS issues.",
    "revenue_potential": "TBD",
    "notes": "Established 2003, 70+ events. Last verified event Aug 2024. May be inactive. DM via Facebook.",
    "verification_status": "needs_verification",
    "tags": ["mma", "kickboxing", "brisbane", "possibly-inactive"]
  },
  {
    "id": "muayx",
    "org_name": "Muay X",
    "sport": "Muay Thai (Amateur)",
    "location": "Brisbane",
    "type": "Pure Promotion",
    "tier": 1,
    "priority_score": 55,
    "stage": "new",
    "contact": {
      "email": null,
      "phone": null,
      "website": null,
      "instagram": null,
      "facebook": null,
      "contact_form": null,
      "decision_maker": null,
      "confidence": "low"
    },
    "events": {
      "frequency": "Periodic SUPA! tournaments",
      "upcoming": [],
      "typical_venue": "Eastside Boxing Gym"
    },
    "media_quality": "Unknown.",
    "revenue_potential": "TBD",
    "notes": "Runs SUPA! Amateur Muaythai tournaments. Contact via MTA-Q or Eventbrite messaging.",
    "verification_status": "needs_verification",
    "tags": ["muay-thai", "amateur", "brisbane"]
  },
  {
    "id": "dundees",
    "org_name": "Dundee's Boxing & Fitness",
    "sport": "Boxing (White Collar, Amateur, Pro)",
    "location": "West End, Brisbane",
    "type": "Gym + Promotion",
    "tier": 1,
    "priority_score": 70,
    "stage": "new",
    "contact": {
      "email": "admin@fortitudeboxinggym.com",
      "phone": null,
      "website": "https://www.dundeesfitness.com.au",
      "instagram": "@dundeesfitness",
      "facebook": "Dundee's Boxing & Fitness",
      "contact_form": null,
      "decision_maker": "Dundee Kim (Managing Director & Head Coach)",
      "confidence": "high"
    },
    "events": {
      "frequency": "Periodic white collar + corporate events",
      "upcoming": [],
      "typical_venue": "Own facility"
    },
    "media_quality": "Unknown.",
    "revenue_potential": "$5K–$15K annually",
    "notes": "High-profile owner (Jeff Horn's strength coach). White collar and corporate boxing events. Fight for a Cause.",
    "verification_status": "verified",
    "tags": ["boxing", "brisbane", "white-collar", "corporate"]
  },
  {
    "id": "mta-q",
    "org_name": "Muay Thai Australia - Queensland (MTA-Q)",
    "sport": "Muay Thai (Governing Body)",
    "location": "Queensland",
    "type": "Governing Body",
    "tier": 2,
    "priority_score": 68,
    "stage": "new",
    "contact": {
      "email": "muaythaiqld@gmail.com",
      "phone": null,
      "website": "https://www.muaythaiqld.com.au",
      "instagram": "@muaythaiqld",
      "facebook": "MuaythaiAustraliaQueensland",
      "contact_form": "https://www.muaythaiqld.com.au/contact",
      "decision_maker": "Michael Smith (President)",
      "confidence": "high"
    },
    "events": {
      "frequency": "N/A — sanctioning body",
      "upcoming": [],
      "typical_venue": "N/A"
    },
    "media_quality": "N/A — strategic referral partner.",
    "revenue_potential": "Referral value — connects to ALL QLD Muay Thai promoters",
    "notes": "Non-profit. Strategic partner for referrals. Offer discounted rate for MTA-Q sanctioned events. Seek 'preferred media partner' status.",
    "verification_status": "verified",
    "tags": ["muay-thai", "governing-body", "referral-partner", "queensland"]
  },
  {
    "id": "boxing-qld",
    "org_name": "Boxing Queensland Inc",
    "sport": "Boxing (Governing Body)",
    "location": "Queensland",
    "type": "Governing Body",
    "tier": 2,
    "priority_score": 55,
    "stage": "new",
    "contact": {
      "email": "secretary@boxingqueensland.com",
      "phone": null,
      "website": "https://www.boxingqueenslandinc.org",
      "instagram": null,
      "facebook": "boxingqld",
      "contact_form": null,
      "decision_maker": null,
      "confidence": "medium"
    },
    "events": {
      "frequency": "State championships",
      "upcoming": [],
      "typical_venue": "Various"
    },
    "media_quality": "N/A — bureaucratic governing body.",
    "revenue_potential": "Low direct, high referral value",
    "notes": "Committee-run. Slow response likely. Better to contact affiliated clubs directly.",
    "verification_status": "verified",
    "tags": ["boxing", "governing-body", "queensland"]
  },
  {
    "id": "wrestling-qld",
    "org_name": "Wrestling Queensland Inc",
    "sport": "Wrestling (Governing Body)",
    "location": "Queensland",
    "type": "Governing Body",
    "tier": 2,
    "priority_score": 50,
    "stage": "new",
    "contact": {
      "email": "admin@wrestlingqld.org.au",
      "phone": "0439 702 136",
      "website": "http://wrestlingqld.org.au",
      "instagram": null,
      "facebook": "Wrestling Queensland",
      "contact_form": "http://wrestlingqld.org.au/contact/",
      "decision_maker": null,
      "confidence": "high"
    },
    "events": {
      "frequency": "State championships",
      "upcoming": [],
      "typical_venue": "Various"
    },
    "media_quality": "Underserved market. Could establish FFM as 'the' wrestling media provider in QLD.",
    "revenue_potential": "Low–Medium",
    "notes": "Smaller niche sport. Phone contact available. Niche-focused pitch for wrestling storytelling.",
    "verification_status": "verified",
    "tags": ["wrestling", "governing-body", "niche", "queensland"]
  },
  {
    "id": "afbjj",
    "org_name": "AFBJJ Queensland",
    "sport": "Brazilian Jiu-Jitsu (Sanctioning)",
    "location": "National (QLD rep)",
    "type": "Governing Body",
    "tier": 3,
    "priority_score": 45,
    "stage": "new",
    "contact": {
      "email": "qld@afbjj.com",
      "phone": null,
      "website": "https://afbjj.com",
      "instagram": "@afbjjofficial",
      "facebook": "AFBJJ",
      "contact_form": "https://afbjj.com/contact",
      "decision_maker": "Daniel Lima (QLD State Rep)",
      "confidence": "high"
    },
    "events": {
      "frequency": "N/A — sanctioning body",
      "upcoming": [],
      "typical_venue": "N/A"
    },
    "media_quality": "N/A",
    "revenue_potential": "Low — use for referrals to other states",
    "notes": "Low priority. QBJJC is the actual event organizer in QLD. Use AFBJJ for interstate expansion referrals.",
    "verification_status": "verified",
    "tags": ["bjj", "governing-body", "national"]
  },
  {
    "id": "jez",
    "org_name": "JEZ Premier Promotions",
    "sport": "Multiple combat sports",
    "location": "Sydney, NSW",
    "type": "Pure Promotion",
    "tier": 3,
    "priority_score": 40,
    "stage": "new",
    "contact": {
      "email": null,
      "phone": null,
      "website": "https://www.jezpremierpromotions.com.au",
      "instagram": "@jezpremierpromotions",
      "facebook": "JEZ Premier Promotions",
      "contact_form": null,
      "decision_maker": null,
      "confidence": "low"
    },
    "events": {
      "frequency": "TBD",
      "upcoming": [],
      "typical_venue": "Sydney"
    },
    "media_quality": "Unknown.",
    "revenue_potential": "TBD",
    "notes": "Interstate — lower priority. Consider after Brisbane market established.",
    "verification_status": "needs_verification",
    "tags": ["multi-sport", "sydney", "interstate"]
  },
  {
    "id": "ultimate",
    "org_name": "Ultimate Promotions / Ultimate Gym",
    "sport": "Kickboxing, Muay Thai, Boxing, MMA",
    "location": "St Albans, Melbourne",
    "type": "Gym + Promotion",
    "tier": 3,
    "priority_score": 45,
    "stage": "new",
    "contact": {
      "email": null,
      "phone": "(03) 9364 3744",
      "phone_mobile": "0411 665 565",
      "website": "https://www.ultimatepromotions.com.au",
      "instagram": "@ultimategymkickboxing",
      "facebook": "Ultimate Gym Kickboxing",
      "contact_form": "https://www.ultimatepromotions.com.au/contact-us/",
      "decision_maker": "John Scida (Founder, 40+ years experience)",
      "confidence": "high"
    },
    "events": {
      "frequency": "Multiple per year",
      "upcoming": [],
      "typical_venue": "St Albans, Melbourne"
    },
    "media_quality": "Unknown.",
    "revenue_potential": "TBD",
    "notes": "Interstate Melbourne. Easy to contact (phone + mobile). IF expanding to VIC = strong first contact.",
    "verification_status": "verified",
    "tags": ["multi-sport", "melbourne", "interstate"]
  },
  {
    "id": "showdown",
    "org_name": "Showdown MMA",
    "sport": "MMA",
    "location": "Sydney",
    "type": "Pure Promotion",
    "tier": 3,
    "priority_score": 35,
    "stage": "new",
    "contact": {
      "email": null,
      "phone": null,
      "website": null,
      "instagram": "@showdownmma",
      "facebook": "Showdown Sydney MMA",
      "contact_form": null,
      "decision_maker": null,
      "confidence": "low"
    },
    "events": {
      "frequency": "Periodic",
      "upcoming": ["March 14, 2026, Sydney"],
      "typical_venue": "North Sydney Leagues Club"
    },
    "media_quality": "Unknown.",
    "revenue_potential": "TBD",
    "notes": "Interstate, low priority.",
    "verification_status": "needs_verification",
    "tags": ["mma", "sydney", "interstate"]
  },
  {
    "id": "samurai",
    "org_name": "Samurai Fight Series",
    "sport": "MMA, Kickboxing, Muay Thai",
    "location": "Sydney (Marrickville)",
    "type": "Pure Promotion",
    "tier": 3,
    "priority_score": 35,
    "stage": "new",
    "contact": {
      "email": null,
      "phone": null,
      "website": null,
      "instagram": "@samuraifightseries",
      "facebook": "Samurai Fight Series",
      "contact_form": null,
      "decision_maker": null,
      "confidence": "low"
    },
    "events": {
      "frequency": "Quarterly",
      "upcoming": [],
      "typical_venue": "Sydney Portuguese Club, Marrickville"
    },
    "media_quality": "Unknown.",
    "revenue_potential": "TBD",
    "notes": "Interstate, low priority.",
    "verification_status": "needs_verification",
    "tags": ["multi-sport", "sydney", "interstate"]
  },
  {
    "id": "diamondback",
    "org_name": "Diamondback Fighting Championship",
    "sport": "MMA, Kickboxing",
    "location": "Adelaide",
    "type": "Pure Promotion",
    "tier": 3,
    "priority_score": 50,
    "stage": "new",
    "contact": {
      "email": null,
      "phone": null,
      "website": "https://diamondbackfc.com",
      "instagram": "@diamondback_fc",
      "facebook": "@diamondbackfc",
      "contact_form": "https://diamondbackfc.com",
      "decision_maker": null,
      "confidence": "medium"
    },
    "events": {
      "frequency": "Multiple per year",
      "upcoming": ["DFC 25 SAVAGE SUNDAY: March 15, 2026"],
      "typical_venue": "Adelaide Oval"
    },
    "media_quality": "Unknown. Premium venue (Adelaide Oval).",
    "revenue_potential": "TBD",
    "notes": "SA's #1 combat sports promotion. Premium venue. Interstate but professional operation.",
    "verification_status": "verified",
    "tags": ["mma", "kickboxing", "adelaide", "interstate", "premium-venue"]
  },
  {
    "id": "wsw",
    "org_name": "World Series Wrestling",
    "sport": "Professional Wrestling",
    "location": "National (touring)",
    "type": "Pure Promotion",
    "tier": 3,
    "priority_score": 40,
    "stage": "new",
    "contact": {
      "email": null,
      "phone": null,
      "website": "https://worldserieswrestling.com.au",
      "instagram": "@worldserieswrestling",
      "facebook": "World Series Wrestling",
      "contact_form": null,
      "decision_maker": null,
      "confidence": "low"
    },
    "events": {
      "frequency": "Touring shows",
      "upcoming": ["RISE AGAINST Tour: May 15, 2026, Adelaide"],
      "typical_venue": "Major entertainment venues"
    },
    "media_quality": "Unknown. Major touring operation.",
    "revenue_potential": "TBD",
    "notes": "Major national touring promotion. Consider when tours hit Brisbane/GC.",
    "verification_status": "verified",
    "tags": ["wrestling", "national", "touring"]
  },
  {
    "id": "pwa",
    "org_name": "Pro Wrestling Australia (PWA)",
    "sport": "Professional Wrestling",
    "location": "Sydney CBD",
    "type": "Pure Promotion",
    "tier": 3,
    "priority_score": 35,
    "stage": "new",
    "contact": {
      "email": null,
      "phone": null,
      "website": "https://www.prowrestlingaustralia.com.au",
      "instagram": "@pwaustralia",
      "facebook": "@PWAAustralia",
      "contact_form": null,
      "decision_maker": null,
      "confidence": "low"
    },
    "events": {
      "frequency": "Monthly to bi-monthly",
      "upcoming": [],
      "typical_venue": "Sydney CBD"
    },
    "media_quality": "Unknown. Alumni include AEW's Kyle Fletcher, WWE's Grayson Waller.",
    "revenue_potential": "TBD",
    "notes": "Sydney's leading pro wrestling. Interstate, low priority. High-profile alumni.",
    "verification_status": "verified",
    "tags": ["wrestling", "sydney", "interstate"]
  },
  {
    "id": "upw",
    "org_name": "United Pro Wrestling (UPW)",
    "sport": "Professional Wrestling",
    "location": "Sunshine Coast, QLD",
    "type": "Pure Promotion",
    "tier": 2,
    "priority_score": 0,
    "stage": "lost",
    "contact": {
      "email": null,
      "phone": null,
      "website": "https://www.unitedprowrestling.com.au",
      "instagram": "@unitedprowrestling",
      "facebook": "United Pro Wrestling",
      "contact_form": null,
      "decision_maker": null,
      "confidence": "low"
    },
    "events": {
      "frequency": "Unknown",
      "upcoming": [],
      "typical_venue": "Sunshine Coast"
    },
    "media_quality": "Unknown.",
    "revenue_potential": "N/A",
    "notes": "⚠️ CRITICAL: Owner charged with crimes (Oct 2025). DO NOT CONTACT.",
    "verification_status": "do_not_contact",
    "tags": ["wrestling", "sunshine-coast", "DO-NOT-CONTACT"]
  }
]

async function migrate() {
  console.log('🚀 Starting migration to Supabase...')
  console.log(`📊 ${LEADS.length} leads to migrate`)
  
  // First, try to insert leads
  for (const lead of LEADS) {
    try {
      const { error } = await supabase
        .from('crm_leads')
        .upsert({
          id: lead.id,
          org_name: lead.org_name,
          sport: lead.sport,
          location: lead.location,
          type: lead.type,
          tier: lead.tier,
          priority_score: lead.priority_score,
          stage: lead.stage || 'new',
          contact: lead.contact,
          events: lead.events,
          media_quality: lead.media_quality,
          revenue_potential: lead.revenue_potential,
          notes: lead.notes,
          verification_status: lead.verification_status,
          tags: lead.tags,
          last_contact: lead.last_contact || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' })
      
      if (error) {
        console.error(`❌ Error inserting ${lead.org_name}:`, error.message)
      } else {
        console.log(`✅ ${lead.org_name}`)
      }
    } catch (err) {
      console.error(`❌ Exception for ${lead.org_name}:`, err.message)
    }
  }
  
  console.log('\n✨ Migration complete!')
  
  // Verify
  const { data, error } = await supabase.from('crm_leads').select('id, org_name')
  if (error) {
    console.error('❌ Error verifying:', error.message)
  } else {
    console.log(`\n📊 Verified: ${data.length} leads in database`)
  }
}

migrate()
