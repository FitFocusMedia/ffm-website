import { createClient } from '@supabase/supabase-js'

// Fit Focus Media Web Services project
const supabaseUrl = 'https://gonalgubgldgpkcekaxe.supabase.co'
const supabasePublishableKey = 'sb_publishable_SB4LfH4EkuEyu5qeC_dffQ_G9cF8Fo_'

export const supabase = createClient(supabaseUrl, supabasePublishableKey)

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

/**
 * Contract Management
 */

export async function getContracts() {
  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getContractById(id) {
  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function getContractByShareToken(shareToken) {
  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('share_token', shareToken)
    .single()
  
  if (error) throw error
  return data
}

export async function createContract(contractData) {
  // Generate unique share token
  const shareToken = Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('')
  
  const { data, error } = await supabase
    .from('contracts')
    .insert({
      ...contractData,
      share_token: shareToken
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateContract(id, updates) {
  const { data, error } = await supabase
    .from('contracts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteContract(id) {
  const { error } = await supabase
    .from('contracts')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function markContractViewed(id) {
  const { data, error } = await supabase
    .from('contracts')
    .update({
      viewed_at: new Date().toISOString(),
      status: 'viewed',
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Athlete Content Orders
 */
export async function createContentOrder(orderData) {
  const { data, error } = await supabase
    .from('orders')
    .insert([orderData])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function signContract(id, signature, isClient = false) {
  const updates = isClient
    ? {
        client_signature: signature,
        client_signed_at: new Date().toISOString(),
        status: 'signed',
        updated_at: new Date().toISOString()
      }
    : {
        ffm_signature: signature,
        ffm_signed_at: new Date().toISOString(),
        status: 'sent',
        updated_at: new Date().toISOString()
      }
  
  const { data, error } = await supabase
    .from('contracts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}
