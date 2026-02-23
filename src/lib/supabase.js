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
 * Look up a CRM lead by org_name (flexible matching)
 */
export async function getLeadByOrgName(orgName) {
  if (!orgName) return null
  
  // First try exact match
  let { data, error } = await supabase
    .from('crm_leads')
    .select('*')
    .ilike('org_name', orgName)
    .limit(1)
    .single()
  
  if (data) return data
  
  // Try partial match - extract key words and search
  // Remove common suffixes like "Pty Ltd", "Inc", etc.
  const cleanName = orgName
    .replace(/\s*(Pty|Ltd|Inc|LLC|Pty Ltd|PTY LTD|Corporation|Corp)\.?\s*/gi, '')
    .trim()
  
  // Try with cleaned name
  const result = await supabase
    .from('crm_leads')
    .select('*')
    .ilike('org_name', `%${cleanName}%`)
    .limit(1)
    .single()
  
  if (result.data) return result.data
  
  // Try matching first significant word (e.g., "Queensland" from "Queensland Brazilian...")
  const words = cleanName.split(/\s+/).filter(w => w.length > 3)
  if (words.length > 0) {
    const firstWord = words[0]
    const lastResult = await supabase
      .from('crm_leads')
      .select('*')
      .ilike('org_name', `%${firstWord}%BJJ%`)
      .limit(1)
      .single()
    
    if (lastResult.data) return lastResult.data
  }
  
  return null
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

/**
 * Onboarding Sessions
 */

// Generate unique token
const generateToken = () => Array.from({ length: 24 }, () =>
  Math.floor(Math.random() * 16).toString(16)
).join('')

export async function getOnboardingSessions() {
  const { data, error } = await supabase
    .from('onboarding_sessions')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getOnboardingSessionById(id) {
  const { data, error } = await supabase
    .from('onboarding_sessions')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function getOnboardingSessionByToken(token) {
  const { data, error } = await supabase
    .from('onboarding_sessions')
    .select('*')
    .eq('share_token', token)
  
  if (error) throw error
  if (!data || data.length === 0) {
    throw new Error('Onboarding session not found. Please check your link or contact Fit Focus Media.')
  }
  
  const session = data[0]
  
  // If first access, update status to in_progress
  if (session && session.status === 'pending') {
    await supabase
      .from('onboarding_sessions')
      .update({ status: 'in_progress' })
      .eq('share_token', token)
    session.status = 'in_progress'
  }
  
  return session
}

export async function createOnboardingSession(sessionData) {
  const { data, error } = await supabase
    .from('onboarding_sessions')
    .insert({
      ...sessionData,
      share_token: generateToken(),
      status: 'pending'
    })
    .select()
    .single()
  
  if (error) throw error
  
  // Auto-create Google Drive folders if org_name and event_name are provided
  if (data && data.org_name && data.event_name) {
    try {
      await createOnboardingFolders(data.id, data.org_name, data.event_name)
    } catch (err) {
      console.error('Failed to create Drive folders:', err)
      // Don't fail the whole operation
    }
  }
  
  return data
}

export async function createOnboardingFromContract(contractId) {
  // Get contract data
  const contract = await getContractById(contractId)
  if (!contract) throw new Error('Contract not found')
  
  // Check if session already exists
  const { data: existing } = await supabase
    .from('onboarding_sessions')
    .select('id, share_token')
    .eq('contract_id', contractId)
    .single()
  
  if (existing) return existing
  
  // Create session from contract
  const contractData = contract.contract_data || {}
  
  // Try to find matching lead in CRM to pull social data
  const crmLead = await getLeadByOrgName(contract.org_name)
  const crmContact = crmLead?.contact || {}
  
  // Pre-fill collected_data - prioritize CRM data, fallback to contract data
  const collectedData = {}
  
  // Helper to format social URLs
  const formatFacebookUrl = (fb) => {
    if (!fb) return null
    if (fb.startsWith('http')) return fb
    // Remove @ if present and create full URL
    const handle = fb.replace(/^@/, '').replace(/^\//, '')
    return `https://facebook.com/${handle}`
  }
  
  const formatInstagramHandle = (ig) => {
    if (!ig) return null
    // Ensure @ prefix for consistency
    return ig.startsWith('@') ? ig : `@${ig}`
  }
  
  // Social & Promotion fields - pull from CRM first, then contract
  const orgInstagram = crmContact.instagram || contractData.org_instagram
  const orgFacebook = crmContact.facebook || contractData.org_facebook
  const orgWebsite = crmContact.website || contractData.org_website
  
  if (orgInstagram || orgFacebook || orgWebsite) {
    collectedData.social = {}
    if (orgInstagram) collectedData.social.org_instagram = formatInstagramHandle(orgInstagram)
    if (orgFacebook) collectedData.social.org_facebook = formatFacebookUrl(orgFacebook)
    if (orgWebsite) collectedData.social.org_website = orgWebsite
  }
  
  const { data, error } = await supabase
    .from('onboarding_sessions')
    .insert({
      contract_id: contractId,
      org_name: contract.org_name,
      contact_name: contract.promoter_name,
      contact_email: contract.promoter_email,
      contact_phone: contract.promoter_phone,
      event_name: contractData.event_name,
      event_date: contractData.event_date,
      event_location: contractData.event_location,
      collected_data: Object.keys(collectedData).length > 0 ? collectedData : null,
      share_token: generateToken(),
      status: 'pending'
    })
    .select()
    .single()
  
  if (error) throw error
  
  // Auto-create Google Drive folders
  try {
    await createOnboardingFolders(data.id, contract.org_name, contractData.event_name)
  } catch (err) {
    console.error('Failed to create Drive folders:', err)
    // Don't fail the whole operation if Drive folder creation fails
  }
  
  return data
}

export async function updateOnboardingSession(id, updates) {
  // Don't allow updating certain fields
  delete updates.id
  delete updates.created_at
  delete updates.share_token
  delete updates.contract_id
  
  const { data, error } = await supabase
    .from('onboarding_sessions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateOnboardingByToken(token, updates) {
  delete updates.id
  delete updates.created_at
  delete updates.share_token
  delete updates.contract_id
  
  const { data, error } = await supabase
    .from('onboarding_sessions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('share_token', token)
    .select()
  
  if (error) throw error
  if (!data || data.length === 0) {
    throw new Error('Failed to save changes - session not found')
  }
  return data[0]
}

export async function submitOnboardingSession(sessionOrToken) {
  // Accept either session object (with share_token) or raw token string
  const token = typeof sessionOrToken === 'string' 
    ? sessionOrToken 
    : sessionOrToken?.share_token
  
  if (!token) {
    throw new Error('No share token provided for submission')
  }
  
  const { data, error } = await supabase
    .from('onboarding_sessions')
    .update({ 
      status: 'submitted',
      submitted_at: new Date().toISOString()
    })
    .eq('share_token', token)
    .select()
  
  if (error) throw error
  if (!data || data.length === 0) {
    throw new Error('Session not found or update blocked by permissions')
  }
  return data[0]
}

export async function markOnboardingReviewed(id, reviewedBy, adminNotes) {
  const { data, error } = await supabase
    .from('onboarding_sessions')
    .update({ 
      status: 'reviewed',
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewedBy,
      admin_notes: adminNotes
    })
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data
}

export async function deleteOnboardingSession(id) {
  // First delete any associated files
  const { error: filesError } = await supabase
    .from('onboarding_files')
    .delete()
    .eq('session_id', id)
  
  if (filesError) console.error('Error deleting files:', filesError)
  
  // Then delete the session
  const { error } = await supabase
    .from('onboarding_sessions')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

// Storage bucket name
const STORAGE_BUCKET = 'onboarding'

/**
 * Upload file to Supabase Storage
 * Files are synced to Google Drive automatically by background job
 */
export async function uploadOnboardingFile(sessionId, category, fileType, file) {
  // Fetch session to get org name for human-readable folder
  const { data: session } = await supabase
    .from('onboarding_sessions')
    .select('org_name, event_name')
    .eq('id', sessionId)
    .single()
  
  // Build nested folder structure: OrgName/EventName/category/file
  // Sanitize for folder name (remove special chars except spaces and hyphens)
  const sanitize = (str) => str?.replace(/[^a-zA-Z0-9 -]/g, '').trim().substring(0, 50) || ''
  const orgPart = sanitize(session?.org_name) || sessionId.substring(0, 8)
  const eventPart = session?.event_name ? sanitize(session.event_name) : null
  
  // Generate unique path: OrgName/EventName/category/timestamp_filename
  // If no event, just: OrgName/category/timestamp_filename
  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const storagePath = eventPart 
    ? `${orgPart}/${eventPart}/${category}/${timestamp}_${safeName}`
    : `${orgPart}/${category}/${timestamp}_${safeName}`
  
  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false
    })
  
  if (uploadError) {
    throw new Error(uploadError.message || 'Upload failed')
  }
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storagePath)
  
  const publicUrl = urlData?.publicUrl || null
  
  // Create file record in database
  const { data: fileRecord, error: recordError } = await supabase
    .from('onboarding_files')
    .insert({
      session_id: sessionId,
      category: category,
      file_type: fileType,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      storage_path: storagePath,
      public_url: publicUrl,
      synced_to_drive: false // Will be synced by background job
    })
    .select()
    .single()
  
  if (recordError) {
    // Try to clean up the uploaded file
    await supabase.storage.from(STORAGE_BUCKET).remove([storagePath])
    throw new Error(recordError.message || 'Failed to create file record')
  }
  
  return { 
    file: fileRecord, 
    url: publicUrl,
    message: 'File uploaded. Will sync to Google Drive automatically.'
  }
}

/**
 * Create Google Drive folders (called by background sync, not directly)
 * This is kept for compatibility but folders are now created during sync
 */
export async function createOnboardingFolders(sessionId, orgName, eventName) {
  // Drive folders are now created automatically when files sync
  // This function is a no-op for the frontend
  console.log('Drive folders will be created automatically during sync')
  return { success: true, message: 'Folders created during sync' }
}

export async function getOnboardingFiles(sessionId) {
  const { data, error } = await supabase
    .from('onboarding_files')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function deleteOnboardingFile(fileId) {
  // Get file record
  const { data: file, error: fetchError } = await supabase
    .from('onboarding_files')
    .select('*')
    .eq('id', fileId)
    .single()
  
  if (fetchError) throw fetchError
  
  // Delete from storage
  await supabase.storage
    .from('onboarding')
    .remove([file.storage_path])
  
  // Delete record
  const { error: deleteError } = await supabase
    .from('onboarding_files')
    .delete()
    .eq('id', fileId)
  
  if (deleteError) throw deleteError
}

// ============================================
// LIVESTREAM FUNCTIONS
// ============================================

/**
 * Get all published livestream events
 */
export async function getLivestreamEvents() {
  const { data, error } = await supabase
    .from('livestream_events')
    .select('*')
    .in('status', ['published', 'live', 'ended'])
    .order('start_time', { ascending: true })
  
  if (error) throw error
  return data
}

/**
 * Get a single livestream event by ID
 */
export async function getLivestreamEvent(id) {
  const { data, error } = await supabase
    .from('livestream_events')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

/**
 * Get all livestream events (admin - includes drafts)
 */
export async function getAllLivestreamEvents() {
  const { data, error } = await supabase
    .from('livestream_events')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

/**
 * Create a livestream event
 */
export async function createLivestreamEvent(eventData) {
  const { data, error } = await supabase
    .from('livestream_events')
    .insert([eventData])
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Update a livestream event
 */
export async function updateLivestreamEvent(id, updates) {
  const { data, error } = await supabase
    .from('livestream_events')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Delete a livestream event
 */
export async function deleteLivestreamEvent(id) {
  const { error } = await supabase
    .from('livestream_events')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

/**
 * Get livestream settings
 */
export async function getLivestreamSettings() {
  const { data, error } = await supabase
    .from('livestream_settings')
    .select('*')
    .eq('id', 1)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data || { demo_mode: false }
}

/**
 * Update livestream settings
 */
export async function updateLivestreamSettings(settings) {
  const { data, error } = await supabase
    .from('livestream_settings')
    .upsert({ id: 1, ...settings, updated_at: new Date().toISOString() })
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Create a livestream order
 */
export async function createLivestreamOrder(orderData) {
  const { data, error } = await supabase
    .from('livestream_orders')
    .insert([orderData])
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Get order by email and event
 */
export async function getLivestreamOrderByEmail(eventId, email) {
  const { data, error } = await supabase
    .from('livestream_orders')
    .select('*')
    .eq('event_id', eventId)
    .eq('email', email.toLowerCase())
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(1)
  
  if (error) throw error
  return data?.[0] || null
}

/**
 * Get all orders for an event
 */
export async function getLivestreamOrders(eventId) {
  let query = supabase
    .from('livestream_orders')
    .select('*, event:livestream_events(*)')
    .order('created_at', { ascending: false })
  
  if (eventId) {
    query = query.eq('event_id', eventId)
  }
  
  const { data, error } = await query
  if (error) throw error
  return data
}

/**
 * Update order status
 */
export async function updateLivestreamOrder(id, updates) {
  const { data, error } = await supabase
    .from('livestream_orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Create viewing session
 */
export async function createLivestreamSession(sessionData) {
  const { data, error } = await supabase
    .from('livestream_sessions')
    .insert([sessionData])
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Get active session by token
 */
export async function getLivestreamSession(token) {
  const { data, error } = await supabase
    .from('livestream_sessions')
    .select('*')
    .eq('token', token)
    .eq('active', true)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

/**
 * Update session last seen
 */
export async function updateSessionHeartbeat(token) {
  const { data, error } = await supabase
    .from('livestream_sessions')
    .update({ last_seen: new Date().toISOString() })
    .eq('token', token)
    .eq('active', true)
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Invalidate session
 */
export async function invalidateLivestreamSession(token) {
  const { error } = await supabase
    .from('livestream_sessions')
    .update({ active: false, invalidated_at: new Date().toISOString() })
    .eq('token', token)
  
  if (error) throw error
}

// ============================================
// USER AUTHENTICATION (Magic Links)
// ============================================

/**
 * Send magic link to user's email
 */
export async function sendMagicLink(email, redirectTo) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email: email.toLowerCase(),
    options: {
      emailRedirectTo: redirectTo || window.location.origin
    }
  })
  
  if (error) throw error
  return data
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

/**
 * Get current session
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

/**
 * Sign out user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * Listen for auth state changes
 */
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback)
}

// ============================================
// USER PROFILES
// ============================================

/**
 * Get or create user profile by email
 */
export async function getOrCreateUserProfile(email) {
  // First try to get existing profile
  const { data: existing, error: fetchError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', email.toLowerCase())
    .single()
  
  if (existing) return existing
  
  // Create new profile if doesn't exist
  const { data, error } = await supabase
    .from('user_profiles')
    .insert([{ email: email.toLowerCase() }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Get user profile by auth ID
 */
export async function getUserProfile(authId) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('auth_id', authId)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

/**
 * Update user profile
 */
export async function updateUserProfile(profileId, updates) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', profileId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Link auth user to profile (after magic link login)
 */
/**
 * Get or create user profile, and link to Supabase Auth
 * Called on every sign-in to ensure profile exists and is linked
 */
export async function syncUserProfile(authId, email) {
  const normalizedEmail = email.toLowerCase()
  
  // First, try to find existing profile
  const { data: existing } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', normalizedEmail)
    .single()
  
  if (existing) {
    // Update with auth link and last login
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ 
        auth_id: authId, 
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
  
  // Create new profile
  const { data: newProfile, error: createError } = await supabase
    .from('user_profiles')
    .insert({
      email: normalizedEmail,
      auth_id: authId,
      last_login_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (createError) throw createError
  
  // Link any existing orders to this new profile
  await supabase
    .from('livestream_orders')
    .update({ user_id: newProfile.id })
    .eq('email', normalizedEmail)
    .is('user_id', null)
  
  return newProfile
}

/**
 * Legacy: Link auth to existing profile (use syncUserProfile instead)
 */
export async function linkAuthToProfile(authId, email) {
  return syncUserProfile(authId, email)
}

/**
 * Get user's purchase history
 */
export async function getUserPurchaseHistory(email) {
  const { data, error } = await supabase
    .from('livestream_orders')
    .select('*, event:livestream_events(*)')
    .eq('email', email.toLowerCase())
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// ============================================
// PROPOSAL GENERATOR
// ============================================

/**
 * Generate URL-safe slug from org name
 */
function generateSlug(orgName, eventName) {
  const base = eventName 
    ? `${orgName}-${eventName}` 
    : orgName
  
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60)
}

/**
 * Get all proposals (admin)
 */
export async function getProposals() {
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

/**
 * Get proposal by ID (admin)
 */
export async function getProposalById(id) {
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

/**
 * Get proposal by slug (public)
 */
export async function getProposalBySlug(slug) {
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error) throw error
  return data
}

/**
 * Create a proposal
 */
export async function createProposal(proposalData) {
  // Generate slug if not provided
  const slug = proposalData.slug || generateSlug(
    proposalData.org_name, 
    proposalData.event_name
  )
  
  // Add timestamp suffix if slug might conflict
  const uniqueSlug = `${slug}-${Date.now().toString(36)}`
  
  const { data, error } = await supabase
    .from('proposals')
    .insert([{
      ...proposalData,
      slug: uniqueSlug,
      status: proposalData.status || 'draft'
    }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Update a proposal
 */
export async function updateProposal(id, updates) {
  const { data, error } = await supabase
    .from('proposals')
    .update({ 
      ...updates, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Delete a proposal
 */
export async function deleteProposal(id) {
  const { error } = await supabase
    .from('proposals')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

/**
 * Track proposal view (public)
 */
export async function trackProposalView(slug) {
  // Use RPC function or direct update
  const { data: proposal, error: fetchError } = await supabase
    .from('proposals')
    .select('id, views')
    .eq('slug', slug)
    .single()
  
  if (fetchError) throw fetchError
  
  const { error } = await supabase
    .from('proposals')
    .update({ 
      views: (proposal.views || 0) + 1,
      last_viewed_at: new Date().toISOString()
    })
    .eq('id', proposal.id)
  
  if (error) throw error
}

/**
 * Update proposal status
 */
export async function updateProposalStatus(id, status) {
  return updateProposal(id, { status })
}

/**
 * Create lead from proposal
 */
export async function createLeadFromProposal(proposalId) {
  // Get proposal data
  const proposal = await getProposalById(proposalId)
  if (!proposal) throw new Error('Proposal not found')
  
  // Check if lead already exists
  if (proposal.lead_id) {
    return { existing: true, lead_id: proposal.lead_id }
  }
  
  // Create lead
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .insert([{
      name: proposal.contact_name,
      email: proposal.contact_email,
      phone: proposal.contact_phone,
      org_name: proposal.org_name,
      source: 'proposal',
      completed_form: false
    }])
    .select()
    .single()
  
  if (leadError) throw leadError
  
  // Link lead to proposal
  await updateProposal(proposalId, { lead_id: lead.id })
  
  return { existing: false, lead_id: lead.id }
}
