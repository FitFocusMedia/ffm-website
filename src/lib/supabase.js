import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qdrszmtugndlwoxyvrsq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkcnN6bXR1Z25kbHdveHl2cnNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NzE0OTMsImV4cCI6MjA4NTU0NzQ5M30.r6_ZjXwM8RLbcBMCrZ09R6m0tcpzif6a2vuis8x8Zkk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Submit a lead to Supabase
 */
export async function submitLead({ name, email, phone, orgName }) {
  const { data, error } = await supabase
    .from('leads')
    .insert([{
      name,
      email,
      phone,
      org_name: orgName,
      completed_form: false,
      source: 'combat-sports-proposal'
    }])
    .select()

  if (error) throw error
  return data?.[0]
}

/**
 * Mark a lead as having completed the full form
 */
export async function markLeadCompleted(leadId, formData) {
  const { error } = await supabase
    .from('leads')
    .update({ 
      completed_form: true,
      form_data: formData
    })
    .eq('id', leadId)

  if (error) throw error
}
