// CRM Functions — Supabase Only (Single Source of Truth)
// Uses service role key for admin operations (internal portal only)
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gonalgubgldgpkcekaxe.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvbmFsZ3ViZ2xkZ3BrY2VrYXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDg1OTc0MiwiZXhwIjoyMDg2NDM1NzQyfQ.agovELOmy9ay7MqDAWXWnXbyCAVve_x4ofX8Q0sCj1E'

// Service role client bypasses RLS - safe for internal portal
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// --- Lead Management ---

export async function getLeads() {
  const { data, error } = await supabase
    .from('crm_leads')
    .select('*')
    .order('priority_score', { ascending: false })
  
  if (error) {
    console.error('Error fetching leads:', error)
    return []
  }
  return data || []
}

export async function getLead(id) {
  const { data, error } = await supabase
    .from('crm_leads')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching lead:', error)
    return null
  }
  return data
}

export async function createLead(lead) {
  const { data, error } = await supabase
    .from('crm_leads')
    .insert([{
      ...lead,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single()
  
  if (error) {
    console.error('Error creating lead:', error)
    throw error
  }
  return data
}

export async function updateLead(id, updates) {
  const { data, error } = await supabase
    .from('crm_leads')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating lead:', error)
    throw error
  }
  return data
}

export async function deleteLead(id) {
  const { error } = await supabase
    .from('crm_leads')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting lead:', error)
    throw error
  }
  return true
}

// --- Activity Management ---

export async function getActivities(leadId) {
  const { data, error } = await supabase
    .from('crm_activities')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching activities:', error)
    return []
  }
  return data || []
}

export async function addActivity(leadId, activity) {
  const { data, error } = await supabase
    .from('crm_activities')
    .insert([{
      lead_id: leadId,
      type: activity.type,
      notes: activity.notes,
      created_at: new Date().toISOString()
    }])
    .select()
    .single()
  
  if (error) {
    console.error('Error adding activity:', error)
    throw error
  }
  
  // Also update the lead's last_contact timestamp
  await supabase
    .from('crm_leads')
    .update({ last_contact: new Date().toISOString() })
    .eq('id', leadId)
  
  return data
}

export async function updateActivity(activityId, updates) {
  const { data, error } = await supabase
    .from('crm_activities')
    .update({
      type: updates.type,
      notes: updates.notes
    })
    .eq('id', activityId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating activity:', error)
    throw error
  }
  return data
}

export async function deleteActivity(activityId) {
  const { error } = await supabase
    .from('crm_activities')
    .delete()
    .eq('id', activityId)
  
  if (error) {
    console.error('Error deleting activity:', error)
    throw error
  }
  return true
}

// --- Template Management ---

const EMAIL_TEMPLATES = [
  {
    id: 'cold-outreach',
    name: 'Cold Outreach',
    subject: '{{org_name}} — free event coverage?',
    body: `{{decision_maker || "Hey"}},

I'll keep this short.

We film {{sport}} events — multi-camera, professional grade, full match coverage for every athlete. Livestream if you want it.

Here's the thing: you pay nothing.

We make money when athletes buy their footage through our portal after the event. You get free professional coverage. Athletes get content they actually want. Everyone wins.

We just covered NBA Sydney Nationals — 400 athletes across 2 days. The org paid $0.

If that sounds interesting, I'll explain how it works in 10 minutes. If not, no worries.

Brandon
0411 934 935`
  },
  {
    id: 'follow-up-1',
    name: 'Follow-up #1',
    subject: 'Re: {{org_name}} coverage',
    body: `{{decision_maker || "Hey"}},

Following up on my last email.

I know you're busy running events, so here's the short version:

→ Professional multi-camera coverage for {{org_name}}
→ Athletes buy their own footage (you don't lift a finger)
→ You pay nothing. Ever.

We've done this for grappling comps, bodybuilding shows, and fight nights. Happy to send examples if useful.

10 minutes to see if it fits?

Brandon
0411 934 935`
  },
  {
    id: 'meeting-request',
    name: 'Meeting Request',
    subject: '{{org_name}} — quick call?',
    body: `{{decision_maker || "Hey"}},

Thanks for getting back.

Here's what I'll cover (10 min max):
1. How the zero-cost model works (and why there's no catch)
2. What your athletes would actually receive
3. What we'd need from you (almost nothing)

Send me a time that works or just call me direct.

Brandon
0411 934 935`
  },
  {
    id: 'post-meeting',
    name: 'Post-Meeting Follow-up',
    subject: '{{org_name}} — next steps',
    body: `{{decision_maker || "Hey"}},

Good chat. Here's the recap:

WHAT YOU GET (at zero cost):
→ Multi-camera coverage, every mat, every match
→ Livestream/PPV if you want it
→ Event highlight reel for your socials
→ Full photo gallery

WHAT ATHLETES GET:
→ Professional footage of their matches
→ Access through our portal
→ Delivered within days of the event

WHAT IT COSTS YOU:
→ $0 upfront
→ $0 ongoing
→ We make money on athlete purchases only

NEXT STEP:
I'm sending the agreement now. Read it, flag anything, we lock in the dates.

Questions? Call me.

Brandon
0411 934 935`
  },
  {
    id: 'breakup',
    name: 'Breakup Email',
    subject: '{{org_name}} — closing the loop',
    body: `{{decision_maker || "Hey"}},

I've sent a few emails about covering {{org_name}} events. Haven't heard back, so I'll assume the timing's not right.

All good. If you ever want professional coverage at no cost, the offer stands.

Good luck with the season.

Brandon`
  }
]

export function getTemplates() {
  return EMAIL_TEMPLATES
}

export function renderTemplate(templateId, leadData) {
  const template = EMAIL_TEMPLATES.find(t => t.id === templateId)
  if (!template) return null
  
  const vars = {
    org_name: leadData.org_name || '',
    decision_maker: leadData.contact?.decision_maker || '',
    sport: leadData.sport || '',
    upcoming_event: leadData.events?.upcoming?.[0] || '',
    event_date: leadData.events?.upcoming?.[0]?.split(':')?.[1]?.trim() || ''
  }
  
  let subject = template.subject
  let body = template.body
  
  // Handle variables with fallbacks first (e.g., {{decision_maker || "Hey"}})
  const fallbackRegex = /\{\{(\w+)\s*\|\|\s*"([^"]*)"\}\}/g
  subject = subject.replace(fallbackRegex, (match, varName, fallback) => {
    return vars[varName] || fallback
  })
  body = body.replace(fallbackRegex, (match, varName, fallback) => {
    return vars[varName] || fallback
  })
  
  // Handle simple variables (e.g., {{org_name}})
  const simpleRegex = /\{\{(\w+)\}\}/g
  subject = subject.replace(simpleRegex, (match, varName) => {
    return vars[varName] || ''
  })
  body = body.replace(simpleRegex, (match, varName) => {
    return vars[varName] || ''
  })
  
  return { subject, body }
}

// --- Pipeline Stats ---

export async function getPipelineStats() {
  const leads = await getLeads()
  
  // Get all activities
  const { data: allActivities } = await supabase
    .from('crm_activities')
    .select('*')
    .order('created_at', { ascending: false })
  
  const activities = allActivities || []
  
  // Count by stage
  const stageCounts = {
    new: 0,
    contacted: 0,
    meeting: 0,
    proposal: 0,
    negotiating: 0,
    signed: 0,
    lost: 0
  }
  
  leads.forEach(lead => {
    const stage = lead.stage || 'new'
    if (stageCounts.hasOwnProperty(stage)) {
      stageCounts[stage]++
    }
  })
  
  const totalLeads = leads.length
  const activeLeads = leads.filter(l => !['signed', 'lost', 'do_not_contact'].includes(l.stage)).length
  const signedLeads = stageCounts.signed
  const conversionRate = totalLeads > 0 ? Math.round((signedLeads / totalLeads) * 100) : 0
  
  // Estimated pipeline value
  let pipelineValue = 0
  leads.forEach(lead => {
    if (['proposal', 'negotiating', 'signed'].includes(lead.stage)) {
      const match = lead.revenue_potential?.match(/\$(\d+)K/)
      if (match) pipelineValue += parseInt(match[1]) * 1000
    }
  })
  
  // Meetings this week
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)
  
  const meetingsThisWeek = activities.filter(a => 
    a.type === 'Meeting' && new Date(a.created_at) >= weekStart
  ).length
  
  // Recent activities with lead names
  const recentActivities = activities.slice(0, 10).map(activity => {
    const lead = leads.find(l => l.id === activity.lead_id)
    return {
      ...activity,
      lead_name: lead?.org_name || 'Unknown'
    }
  })
  
  // Leads by tier
  const tierCounts = { 1: 0, 2: 0, 3: 0 }
  leads.forEach(lead => {
    if (tierCounts.hasOwnProperty(lead.tier)) {
      tierCounts[lead.tier]++
    }
  })
  
  return {
    totalLeads,
    activeLeads,
    signedLeads,
    conversionRate,
    pipelineValue,
    meetingsThisWeek,
    stageCounts,
    tierCounts,
    recentActivities
  }
}

// --- Bulk Import (for migration) ---

export async function bulkImportLeads(leads) {
  const { data, error } = await supabase
    .from('crm_leads')
    .upsert(leads.map(lead => ({
      ...lead,
      created_at: lead.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    })), { onConflict: 'id' })
    .select()
  
  if (error) {
    console.error('Error importing leads:', error)
    throw error
  }
  return data
}
