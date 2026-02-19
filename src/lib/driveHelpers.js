/**
 * Google Drive Integration Helpers
 * 
 * These functions call a local API endpoint that interfaces with gog CLI
 * to manage Google Drive operations for the onboarding portal.
 */

const DRIVE_API = '/api/drive';

/**
 * Create the onboarding folder structure for an organization
 * Creates: FFM Onboarding / {Org Name} - {Event Name} / {subfolders}
 */
export async function createOnboardingFolders(orgName, eventName) {
  const response = await fetch(`${DRIVE_API}/create-folders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orgName, eventName })
  });
  
  if (!response.ok) {
    throw new Error('Failed to create Drive folders');
  }
  
  return response.json();
}

/**
 * Upload a file to the appropriate subfolder
 */
export async function uploadToDrive(file, sessionId, category, fileType) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('sessionId', sessionId);
  formData.append('category', category);
  formData.append('fileType', fileType);
  
  const response = await fetch(`${DRIVE_API}/upload`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error('Failed to upload to Drive');
  }
  
  return response.json();
}

/**
 * Get the Drive folder URL for a session
 */
export async function getDriveFolderUrl(sessionId) {
  const response = await fetch(`${DRIVE_API}/folder-url/${sessionId}`);
  
  if (!response.ok) {
    throw new Error('Failed to get folder URL');
  }
  
  return response.json();
}

/**
 * List files in a session's folder
 */
export async function listDriveFiles(sessionId, category = null) {
  const url = category 
    ? `${DRIVE_API}/files/${sessionId}?category=${category}`
    : `${DRIVE_API}/files/${sessionId}`;
    
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to list files');
  }
  
  return response.json();
}
