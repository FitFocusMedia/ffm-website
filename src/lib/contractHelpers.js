/**
 * Generate contract HTML from contract data
 */
export function generateContractHTML(contract) {
  const d = contract.contract_data || {}
  
  // Helper to display value or placeholder
  const v = (value, placeholder = '[NOT SET]') => {
    return value ? value : `<span class="text-gray-500">${placeholder}</span>`
  }
  
  const checked = (value) => value ? '☑' : '☐'
  
  // Build multi-event table
  let multiEventRows = ''
  if (d.multi_events && d.multi_events.length > 0) {
    d.multi_events.forEach((event, index) => {
      if (event.name || event.date || event.venue) {
        multiEventRows += `
          <tr>
            <td class="border border-gray-700 px-4 py-2">${index + 1}</td>
            <td class="border border-gray-700 px-4 py-2">${v(event.name)}</td>
            <td class="border border-gray-700 px-4 py-2">${v(event.date)}</td>
            <td class="border border-gray-700 px-4 py-2">${v(event.venue)}</td>
          </tr>
        `
      }
    })
  }
  
  // Format currency
  const currency = (val) => val ? `$${parseFloat(val).toLocaleString()}` : '$0'
  
  // Build revenue split display
  let athleteRevenueSplit = ''
  if (d.athlete_revenue_ffm_100) {
    athleteRevenueSplit = '<p><strong>☑ FFM retains 100%</strong> of Athlete Media Package sales. This is reflected in the zero upfront cost and Client deliverables provided at no charge.</p>'
  } else {
    athleteRevenueSplit = `
      <table class="w-full border-collapse border border-gray-700 my-4">
        <tr><th class="border border-gray-700 px-4 py-2 bg-gray-800">Party</th><th class="border border-gray-700 px-4 py-2 bg-gray-800">Share</th></tr>
        <tr><td class="border border-gray-700 px-4 py-2"><strong>FFM</strong></td><td class="border border-gray-700 px-4 py-2">${v(d.athlete_ffm_split, '80')}%</td></tr>
        <tr><td class="border border-gray-700 px-4 py-2"><strong>Client</strong></td><td class="border border-gray-700 px-4 py-2">${v(d.athlete_client_split, '20')}%</td></tr>
      </table>
      <p>The Client's share will be paid monthly, with a statement of sales provided.</p>
    `
  }
  
  return `
    <div class="contract-content prose prose-invert max-w-none">
      <h1 class="text-3xl font-bold mb-6">EVENT MEDIA COVERAGE & PARTNERSHIP AGREEMENT</h1>
      
      <p><strong>AGREEMENT</strong> made on <strong>${v(d.agreement_date, new Date().toLocaleDateString())}</strong></p>
      
      <p><strong>BETWEEN:</strong></p>
      
      <p>
        <strong>Fit Focus Media</strong> ABN ${v(d.ffm_abn, '[ABN]')}<br>
        Represented by: Brandon Hibbs<br>
        Email: brandon@fitfocusmedia.com.au<br>
        Website: www.fitfocusmedia.com.au<br>
        (hereinafter referred to as <strong>"FFM"</strong> or <strong>"the Media Provider"</strong>)
      </p>
      
      <p><strong>AND:</strong></p>
      
      <p>
        <strong>${v(d.org_name, '[ORGANIZATION NAME]')}</strong><br>
        Represented by: ${v(d.promoter_name, '[PROMOTER NAME]')}<br>
        Position: ${v(d.promoter_position, '[POSITION]')}<br>
        Email: ${v(d.promoter_email, '[EMAIL]')}<br>
        Phone: ${v(d.promoter_phone, '[PHONE]')}<br>
        (hereinafter referred to as <strong>"the Client"</strong> or <strong>"the Event Organiser"</strong>)
      </p>
      
      <hr class="my-6 border-gray-700">
      
      <h2 class="text-2xl font-bold mt-6 mb-4">1. EVENT DETAILS</h2>
      <table class="w-full border-collapse border border-gray-700 my-4">
        <tr><th class="border border-gray-700 px-4 py-2 bg-gray-800">Field</th><th class="border border-gray-700 px-4 py-2 bg-gray-800">Details</th></tr>
        <tr><td class="border border-gray-700 px-4 py-2"><strong>Event Name</strong></td><td class="border border-gray-700 px-4 py-2">${v(d.event_name)}</td></tr>
        <tr><td class="border border-gray-700 px-4 py-2"><strong>Event Date(s)</strong></td><td class="border border-gray-700 px-4 py-2">${v(d.event_date)}</td></tr>
        <tr><td class="border border-gray-700 px-4 py-2"><strong>Event Location</strong></td><td class="border border-gray-700 px-4 py-2">${v(d.event_location)}</td></tr>
        <tr><td class="border border-gray-700 px-4 py-2"><strong>Event Type</strong></td><td class="border border-gray-700 px-4 py-2">${v(d.event_type, 'BJJ / Grappling Competition')}</td></tr>
        <tr><td class="border border-gray-700 px-4 py-2"><strong>Estimated Matches</strong></td><td class="border border-gray-700 px-4 py-2">${v(d.estimated_matches)}</td></tr>
        <tr><td class="border border-gray-700 px-4 py-2"><strong>Expected Athlete Participants</strong></td><td class="border border-gray-700 px-4 py-2">${v(d.expected_athletes)}</td></tr>
        <tr><td class="border border-gray-700 px-4 py-2"><strong>Expected Audience</strong></td><td class="border border-gray-700 px-4 py-2">${v(d.expected_audience)}</td></tr>
      </table>
      
      <h2 class="text-2xl font-bold mt-6 mb-4">2. PARTNERSHIP MODEL — ZERO UPFRONT COST</h2>
      
      <h3 class="text-xl font-bold mt-4 mb-2">2.1 No Upfront Fee</h3>
      <p>FFM will provide full professional media coverage for the Event at <strong>no upfront cost</strong> to the Client.</p>
      
      <h3 class="text-xl font-bold mt-4 mb-2">2.2 What FFM Provides at Zero Cost</h3>
      <ul class="list-disc pl-6 my-4">
        <li>Multi-camera professional video coverage (minimum ${v(d.camera_angles, '2')} camera angles per mat)</li>
        <li>Professional event photography</li>
        <li>Livestream and/or PPV broadcast production (if applicable)</li>
        <li>Post-event highlight reel for the Client's promotional use</li>
        <li>Access to the FFM Athlete Media Portal for athlete content delivery</li>
        <li>On-site crew (minimum ${v(d.crew_size, '2')} persons)</li>
      </ul>
      
      <h3 class="text-xl font-bold mt-4 mb-2">2.3 Multi-Event Commitment</h3>
      <p>This Agreement covers <strong>${v(d.multi_event_count, '1')}</strong> events over a period of <strong>${v(d.multi_event_duration, '[DURATION]')}</strong>${multiEventRows ? ', as scheduled below:' : '.'}</p>
      
      ${multiEventRows ? `
        <table class="w-full border-collapse border border-gray-700 my-4">
          <tr><th class="border border-gray-700 px-4 py-2 bg-gray-800">#</th><th class="border border-gray-700 px-4 py-2 bg-gray-800">Event Name</th><th class="border border-gray-700 px-4 py-2 bg-gray-800">Date</th><th class="border border-gray-700 px-4 py-2 bg-gray-800">Venue</th></tr>
          ${multiEventRows}
        </table>
      ` : ''}
      
      <h2 class="text-2xl font-bold mt-6 mb-4">3. SCOPE OF MEDIA COVERAGE</h2>
      
      <h3 class="text-xl font-bold mt-4 mb-2">3.1 Post-Production Deliverables for the Client</h3>
      <ul class="list-disc pl-6 my-4">
        <li>One (1) Event Highlight Reel (60–120 seconds) within ${v(d.highlight_delivery_days, '7')} business days</li>
        <li>Up to ${v(d.social_clips_count, '5')} social media clips within ${v(d.social_clips_delivery_days, '5')} business days</li>
        <li>Curated photo gallery of ${v(d.photo_count, '50')} edited images</li>
      </ul>
      
      <h3 class="text-xl font-bold mt-4 mb-2">3.2 Livestream / PPV Production</h3>
      <p>
        <strong>Livestream included:</strong> ${checked(d.livestream_included)} ${d.livestream_included ? 'Yes' : 'No'}<br>
        <strong>PPV included:</strong> ${checked(d.ppv_included)} ${d.ppv_included ? 'Yes' : 'No'}
      </p>
      ${d.ppv_included ? `
        <p>
          <strong>Platform:</strong> ${v(d.ppv_platform)}<br>
          <strong>PPV Price Point:</strong> ${currency(d.ppv_price)} per viewer
        </p>
      ` : ''}
      
      <h2 class="text-2xl font-bold mt-6 mb-4">4. LIVESTREAM & PPV REVENUE SHARE</h2>
      ${d.ppv_included ? `
        <table class="w-full border-collapse border border-gray-700 my-4">
          <tr><th class="border border-gray-700 px-4 py-2 bg-gray-800">Party</th><th class="border border-gray-700 px-4 py-2 bg-gray-800">Share</th></tr>
          <tr><td class="border border-gray-700 px-4 py-2"><strong>FFM</strong></td><td class="border border-gray-700 px-4 py-2">${v(d.ppv_ffm_split, '70')}%</td></tr>
          <tr><td class="border border-gray-700 px-4 py-2"><strong>Client</strong></td><td class="border border-gray-700 px-4 py-2">${v(d.ppv_client_split, '30')}%</td></tr>
        </table>
        <p>The Client's share will be paid within ${v(d.ppv_payment_days, '21')} days of each Event via bank transfer.</p>
      ` : '<p>PPV not included in this agreement.</p>'}
      
      <h2 class="text-2xl font-bold mt-6 mb-4">5. ATHLETE MEDIA PACKAGES</h2>
      
      <h3 class="text-xl font-bold mt-4 mb-2">5.1 Overview</h3>
      <p>FFM operates a direct-to-athlete media sales model through the <strong>FFM Athlete Media Portal</strong>.</p>
      
      <h3 class="text-xl font-bold mt-4 mb-2">5.2 Available Packages</h3>
      <p><strong>🔥 VIP COVERAGE</strong> — ${currency(d.vip_price || 350)} (Pre-Order Only)</p>
      <p><strong>📹 MATCH PACKAGE</strong> — ${currency(d.match_price || 175)} (Post-Event)</p>
      <p><strong>⭐ SEASON PASS</strong> — ${currency(d.season_price || 899)}/year (Ongoing)</p>
      
      <h3 class="text-xl font-bold mt-4 mb-2">5.3 Athlete Media Package Revenue Split</h3>
      ${athleteRevenueSplit}
      
      <h2 class="text-2xl font-bold mt-6 mb-4">6. EXCLUSIVE MEDIA COVERAGE RIGHTS</h2>
      <p>The Client grants FFM <strong>exclusive rights</strong> to provide professional video and photography media coverage services at the Event.</p>
      
      <h2 class="text-2xl font-bold mt-6 mb-4">7. ACCESS & LOGISTICS</h2>
      <ul class="list-disc pl-6 my-4">
        <li>FFM requires venue access at least ${v(d.setup_hours, '2')} hours prior to first match</li>
        <li>Crew size: ${v(d.crew_size, '2')} persons with complimentary entry</li>
        ${d.internet_speed ? `<li>Internet upload speed: minimum ${d.internet_speed} Mbps</li>` : ''}
        <li>Event schedule to be provided ${v(d.schedule_hours_before, '48')} hours before Event</li>
        <li>Athlete list to be provided ${v(d.athlete_list_days_before, '7')} days before Event</li>
      </ul>
      
      <h2 class="text-2xl font-bold mt-6 mb-4">8. CANCELLATION & RESCHEDULING</h2>
      <p>Cancellation less than 15 days before Event: Client will pay ${currency(d.cancellation_fee || 500)} cancellation fee plus non-recoverable expenses.</p>
      
      <h2 class="text-2xl font-bold mt-6 mb-4">9. TERM & TERMINATION</h2>
      <p>Initial term: ${v(d.initial_term_months, '12')} months. Auto-renews for ${v(d.renewal_period_months, '12')}-month periods unless ${v(d.nonrenewal_notice_days, '60')} days' written notice provided.</p>
      <p>Termination: ${v(d.termination_notice_days, '30')} days' written notice. Remedy period: ${v(d.remedy_period_days, '14')} days.</p>
      
      <h2 class="text-2xl font-bold mt-6 mb-4">10. LIABILITY & INSURANCE</h2>
      <p>FFM holds public liability insurance of ${currency(d.pli_amount || 20000000)}.</p>
      
      <hr class="my-6 border-gray-700">
      
      <h2 class="text-2xl font-bold mt-6 mb-4">SIGNATURES</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div class="border border-gray-700 rounded-lg p-6">
          <h3 class="text-lg font-bold mb-4">Fit Focus Media</h3>
          ${contract.ffm_signature ? `
            <img src="${contract.ffm_signature}" alt="FFM Signature" class="max-w-full h-auto border border-gray-600 p-2 rounded bg-white mb-4" style="max-width: 300px;">
            <p><strong>Name:</strong> Brandon Hibbs</p>
            <p><strong>Signed:</strong> ${new Date(contract.ffm_signed_at).toLocaleString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZoneName: 'short' })}</p>
          ` : '<p class="text-gray-500">[PENDING FFM SIGNATURE]</p>'}
        </div>
        
        <div class="border border-gray-700 rounded-lg p-6">
          <h3 class="text-lg font-bold mb-4">${v(d.org_name, '[ORGANIZATION]')}</h3>
          ${contract.client_signature ? `
            <img src="${contract.client_signature}" alt="Client Signature" class="max-w-full h-auto border border-gray-600 p-2 rounded bg-white mb-4" style="max-width: 300px;">
            <p><strong>Name:</strong> ${v(d.promoter_name)}</p>
            <p><strong>Position:</strong> ${v(d.promoter_position)}</p>
            <p><strong>Signed:</strong> ${new Date(contract.client_signed_at).toLocaleString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZoneName: 'short' })}</p>
          ` : '<p class="text-gray-500">[PENDING CLIENT SIGNATURE]</p>'}
        </div>
      </div>
    </div>
  `
}

/**
 * Export signature data as black-on-white PNG (for print)
 * Takes the canvas where white strokes were drawn on dark background
 * and converts to black strokes on white background
 */
export function getSignatureData(canvas) {
  // Create a print-friendly version: black strokes on white background
  const exportCanvas = document.createElement('canvas')
  exportCanvas.width = canvas.width
  exportCanvas.height = canvas.height
  const ctx = exportCanvas.getContext('2d')
  
  // Read original pixel data (white strokes on transparent bg)
  const origCtx = canvas.getContext('2d')
  const origData = origCtx.getImageData(0, 0, canvas.width, canvas.height)
  const pixels = origData.data
  
  // Create new image data: black strokes on white background
  const newData = ctx.createImageData(canvas.width, canvas.height)
  const out = newData.data
  
  for (let i = 0; i < pixels.length; i += 4) {
    const alpha = pixels[i + 3] // Original alpha
    
    if (alpha > 10) {
      // This pixel has a stroke — make it black
      out[i] = 0       // R
      out[i + 1] = 0   // G
      out[i + 2] = 0   // B
      out[i + 3] = 255 // A
    } else {
      // Transparent background — make it white
      out[i] = 255     // R
      out[i + 1] = 255 // G
      out[i + 2] = 255 // B
      out[i + 3] = 255 // A
    }
  }
  
  ctx.putImageData(newData, 0, 0)
  return exportCanvas.toDataURL('image/png')
}

/**
 * Check if canvas has signature
 */
export function hasSignature(canvas) {
  const ctx = canvas.getContext('2d')
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  return imageData.data.some(channel => channel !== 0)
}

/**
 * Generate share URL for contract
 */
export function getContractShareLink(shareToken) {
  const baseUrl = window.location.origin + window.location.pathname
  return `${baseUrl}#/contract/${shareToken}`
}

/**
 * Generate email body for sending to client
 */
export function generateClientEmail(shareToken, clientName, orgName) {
  const link = getContractShareLink(shareToken)
  
  return {
    subject: `Event Media Coverage Agreement — Fit Focus Media × ${orgName}`,
    body: `Hi ${clientName},

Please find your Event Media Coverage & Partnership Agreement with Fit Focus Media ready for review and signature.

Review & Sign Here:
${link}

Once you've reviewed the terms, you can sign directly on the page. If you have any questions, reply to this email.

Cheers,
Brandon Hibbs
Fit Focus Media
brandon@fitfocusmedia.com.au
www.fitfocusmedia.com.au`
  }
}

/**
 * Get status icon
 */
export function getStatusIcon(status) {
  const icons = {
    draft: '📝',
    sent: '📤',
    viewed: '👀',
    signed: '✅',
    expired: '❌'
  }
  return icons[status] || '📄'
}

/**
 * Get status badge classes
 */
export function getStatusBadgeClass(status) {
  const classes = {
    draft: 'bg-gray-600',
    sent: 'bg-blue-600',
    viewed: 'bg-yellow-600',
    signed: 'bg-green-600',
    expired: 'bg-red-600'
  }
  return `${classes[status] || 'bg-gray-600'} text-white px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-2`
}
