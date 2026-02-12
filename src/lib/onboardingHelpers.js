// Onboarding Workflow Helper Functions
// localStorage key: ffm_onboarding_workflows

const STORAGE_KEY = 'ffm_onboarding_workflows'

// Default step definitions with descriptions and sub-tasks
export const ONBOARDING_STEPS = [
  // Phase 1: Welcome & Setup
  {
    id: 1,
    phase: 1,
    title: 'Send Welcome Email',
    description: 'Send an auto-generated welcome email introducing FFM services and setting expectations.',
    daysFromSigning: 1,
    emailTemplate: `Hi [CLIENT_NAME],

Welcome to Fit Focus Media! We're excited to work with [ORG_NAME] and capture your combat sports events.

Here's what to expect during our onboarding process:
- Initial call to discuss your needs and event details
- Media release forms setup for your athletes
- Complete event schedule planning
- Technical setup and equipment preparation
- Pre-event venue walkthrough

Your dedicated contact:
Brandon - brandon@fitfocusmedia.com.au

We'll be reaching out soon to schedule our onboarding call.

Best regards,
Fit Focus Media Team`,
    subTasks: [
      'Personalize email with org name and contact details',
      'Include key dates and next steps',
      'Send from brandon@fitfocusmedia.com.au',
      'BCC yourself for records'
    ]
  },
  {
    id: 2,
    phase: 1,
    title: 'Onboarding Call',
    description: '30-minute introduction call to set expectations and gather initial event details.',
    daysFromSigning: 3,
    subTasks: [
      'Schedule 30-minute video/phone call',
      'Discuss org\'s goals and expectations',
      'Gather preliminary event information',
      'Explain FFM service delivery process',
      'Answer any initial questions',
      'Set timeline for next steps'
    ]
  },
  {
    id: 3,
    phase: 1,
    title: 'Collect Media Release Forms',
    description: 'Ensure organization adds media release clause to athlete registration process.',
    daysFromSigning: 7,
    subTasks: [
      'Provide sample media release language',
      'Confirm org will include in athlete sign-up',
      'Verify waiver covers photography, videography, and social media',
      'Get copy of signed waiver template for records',
      'Discuss exceptions process (athletes who opt out)'
    ]
  },
  {
    id: 4,
    phase: 1,
    title: 'Gather Event Schedule',
    description: 'Collect full event calendar for the year to plan coverage and resources.',
    daysFromSigning: 10,
    subTasks: [
      'Request annual event calendar',
      'Get dates, venues, and event types',
      'Identify priority events for coverage',
      'Discuss recurring vs one-off events',
      'Note any special events requiring extra coverage',
      'Add events to FFM production calendar'
    ]
  },
  // Phase 2: Pre-Event Prep
  {
    id: 5,
    phase: 2,
    title: 'Event Details Confirmation',
    description: 'Lock in specifics for upcoming event: venue, timing, fights, special requirements.',
    daysFromSigning: 14,
    subTasks: [
      'Confirm venue name and full address',
      'Verify event date and start time',
      'Get estimated number of fights/matches',
      'Identify special requirements (interviews, highlight reels, etc.)',
      'Confirm ring/cage dimensions',
      'Get contact for day-of coordination'
    ]
  },
  {
    id: 6,
    phase: 2,
    title: 'Equipment Checklist',
    description: 'Verify all filming equipment is ready and functional.',
    daysFromSigning: 18,
    subTasks: [
      '✓ Camera bodies (2-3 units)',
      '✓ Lenses (wide, telephoto, prime)',
      '✓ Audio recorder + wireless mics',
      '✓ Streaming encoder and backup',
      '✓ Cables (HDMI, XLR, power)',
      '✓ Batteries (charged, extras)',
      '✓ Memory cards (formatted, tested)',
      '✓ Tripods and stabilizers',
      '✓ Lighting kit (if needed)',
      '✓ Backup equipment ready'
    ]
  },
  {
    id: 7,
    phase: 2,
    title: 'Streaming Setup',
    description: 'Configure PPV streaming platform and complete test stream.',
    daysFromSigning: 21,
    subTasks: [
      'Select streaming platform (YouTube, Vimeo, custom)',
      'Configure encoder settings (bitrate, resolution)',
      'Set up PPV paywall if applicable',
      'Test stream from venue or similar location',
      'Verify backup stream configuration',
      'Document streaming credentials',
      'Create streaming rundown document'
    ]
  },
  {
    id: 8,
    phase: 2,
    title: 'Promotional Assets Created',
    description: 'Design event graphics, social media templates, and promo clips.',
    daysFromSigning: 25,
    subTasks: [
      'Create event poster/banner graphics',
      'Design social media post templates',
      'Produce teaser/promo video clip',
      'Prepare athlete spotlight graphics',
      'Create countdown graphics for socials',
      'Provide assets to org for promotion',
      'Set up branded overlays for stream'
    ]
  },
  // Phase 3: Go-Live
  {
    id: 9,
    phase: 3,
    title: 'Site Visit / Venue Walkthrough',
    description: 'Scout venue, plan camera positions, test internet connectivity.',
    daysFromSigning: 28,
    subTasks: [
      'Visit venue in person',
      'Map out camera positions (wide, corners, closeups)',
      'Test internet speed and reliability',
      'Identify power outlet locations',
      'Check lighting conditions',
      'Plan equipment load-in logistics',
      'Meet venue contact/coordinator',
      'Take photos for production notes'
    ]
  },
  {
    id: 10,
    phase: 3,
    title: 'Athlete Package Setup',
    description: 'Prepare individual athlete pages/profiles for content delivery.',
    daysFromSigning: 32,
    subTasks: [
      'Collect athlete roster from org',
      'Create individual athlete profiles',
      'Set up content delivery system',
      'Prepare athlete highlight package templates',
      'Test delivery workflow',
      'Confirm org has athlete contact info for delivery'
    ]
  },
  {
    id: 11,
    phase: 3,
    title: 'Final Checklist Review',
    description: 'All systems go - final equipment, personnel, and backup plan check.',
    daysFromSigning: 35,
    subTasks: [
      'Review full equipment checklist',
      'Confirm crew assignments',
      'Verify backup equipment packed',
      'Check streaming platform one more time',
      'Review rundown and shot list',
      'Confirm venue access and timing',
      'Have backup internet plan (hotspot)',
      'Emergency contact list ready'
    ]
  },
  {
    id: 12,
    phase: 3,
    title: 'Post-Event Debrief',
    description: 'Review what worked, areas for improvement, and schedule next event.',
    daysFromSigning: 42,
    subTasks: [
      'Schedule debrief call within 48h of event',
      'Discuss what went well',
      'Identify areas for improvement',
      'Review client feedback',
      'Assess technical performance',
      'Plan adjustments for next event',
      'Confirm date for next event coverage',
      'Update production notes and procedures'
    ]
  }
]

// Generate unique ID
function generateId() {
  return `onb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Calculate due dates based on first event date
export function calculateDueDates(firstEventDate) {
  const baseDate = new Date(firstEventDate)
  return ONBOARDING_STEPS.map(step => {
    const dueDate = new Date(baseDate)
    dueDate.setDate(dueDate.getDate() - (42 - step.daysFromSigning)) // Work backwards from event
    return {
      stepId: step.id,
      dueDate: dueDate.toISOString().split('T')[0]
    }
  })
}

// Get step status
export function getStepStatus(step, dueDate) {
  if (step.completed) return 'complete'
  if (step.inProgress) return 'in-progress'
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  
  if (due < today) return 'overdue'
  return 'pending'
}

// Create new onboarding workflow
export function createOnboarding(clientData) {
  const workflows = getOnboardings()
  const dueDates = calculateDueDates(clientData.firstEventDate)
  
  const newOnboarding = {
    id: generateId(),
    orgName: clientData.orgName,
    contactName: clientData.contactName,
    email: clientData.email,
    phone: clientData.phone || '',
    sport: clientData.sport || 'Combat Sports',
    firstEventDate: clientData.firstEventDate,
    contractId: clientData.contractId || null,
    signingDate: new Date().toISOString().split('T')[0],
    status: 'active', // active or completed
    createdAt: new Date().toISOString(),
    steps: ONBOARDING_STEPS.map(stepDef => {
      const dueDateInfo = dueDates.find(d => d.stepId === stepDef.id)
      return {
        ...stepDef,
        completed: false,
        completedDate: null,
        inProgress: false,
        notes: '',
        dueDate: dueDateInfo.dueDate
      }
    })
  }
  
  workflows.push(newOnboarding)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows))
  return newOnboarding
}

// Get all onboarding workflows
export function getOnboardings() {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

// Get single onboarding by ID
export function getOnboarding(id) {
  const workflows = getOnboardings()
  return workflows.find(w => w.id === id)
}

// Update a specific step
export function updateStep(onboardingId, stepIndex, updates) {
  const workflows = getOnboardings()
  const workflow = workflows.find(w => w.id === onboardingId)
  
  if (!workflow) return null
  
  workflow.steps[stepIndex] = {
    ...workflow.steps[stepIndex],
    ...updates
  }
  
  // Auto-mark as completed if checkbox is checked
  if (updates.completed && !workflow.steps[stepIndex].completedDate) {
    workflow.steps[stepIndex].completedDate = new Date().toISOString().split('T')[0]
  }
  
  // Check if all steps completed
  const allComplete = workflow.steps.every(s => s.completed)
  if (allComplete && workflow.status === 'active') {
    workflow.status = 'completed'
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows))
  return workflow
}

// Delete onboarding
export function deleteOnboarding(id) {
  const workflows = getOnboardings()
  const filtered = workflows.filter(w => w.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  return true
}

// Get overview statistics
export function getOnboardingStats() {
  const workflows = getOnboardings()
  const active = workflows.filter(w => w.status === 'active')
  const completed = workflows.filter(w => w.status === 'completed')
  
  // Calculate average completion time for completed workflows
  let avgCompletionDays = 0
  if (completed.length > 0) {
    const totalDays = completed.reduce((sum, w) => {
      const start = new Date(w.signingDate)
      const lastStep = w.steps.filter(s => s.completedDate).sort((a, b) => 
        new Date(b.completedDate) - new Date(a.completedDate)
      )[0]
      if (lastStep) {
        const end = new Date(lastStep.completedDate)
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
        return sum + days
      }
      return sum
    }, 0)
    avgCompletionDays = Math.round(totalDays / completed.length)
  }
  
  return {
    total: workflows.length,
    active: active.length,
    completed: completed.length,
    avgCompletionDays
  }
}

// Get overdue steps across all active workflows
export function getOverdueSteps() {
  const workflows = getOnboardings().filter(w => w.status === 'active')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const overdueItems = []
  
  workflows.forEach(workflow => {
    workflow.steps.forEach((step, index) => {
      if (!step.completed) {
        const due = new Date(step.dueDate)
        due.setHours(0, 0, 0, 0)
        if (due < today) {
          overdueItems.push({
            workflowId: workflow.id,
            orgName: workflow.orgName,
            stepIndex: index,
            stepTitle: step.title,
            dueDate: step.dueDate,
            daysOverdue: Math.ceil((today - due) / (1000 * 60 * 60 * 24))
          })
        }
      }
    })
  })
  
  return overdueItems
}

// Export checklist as printable HTML
export function exportChecklist(onboardingId) {
  const workflow = getOnboarding(onboardingId)
  if (!workflow) return null
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Onboarding Checklist - ${workflow.orgName}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
    h1 { color: #e51d1d; }
    .header { border-bottom: 2px solid #e51d1d; padding-bottom: 20px; margin-bottom: 30px; }
    .info { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 30px; }
    .phase { margin-bottom: 40px; }
    .phase-title { background: #f5f5f5; padding: 10px; font-weight: bold; margin-bottom: 15px; }
    .step { margin-bottom: 25px; padding-left: 30px; position: relative; }
    .step-number { position: absolute; left: 0; font-weight: bold; }
    .checkbox { display: inline-block; width: 18px; height: 18px; border: 2px solid #333; margin-right: 10px; }
    .subtasks { margin-top: 10px; padding-left: 20px; font-size: 0.9em; color: #666; }
    .subtasks li { margin-bottom: 5px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Client Onboarding Checklist</h1>
    <div class="info">
      <div><strong>Organization:</strong> ${workflow.orgName}</div>
      <div><strong>Contact:</strong> ${workflow.contactName}</div>
      <div><strong>Email:</strong> ${workflow.email}</div>
      <div><strong>Phone:</strong> ${workflow.phone}</div>
      <div><strong>Sport:</strong> ${workflow.sport}</div>
      <div><strong>First Event:</strong> ${workflow.firstEventDate}</div>
      <div><strong>Signing Date:</strong> ${workflow.signingDate}</div>
      <div><strong>Generated:</strong> ${new Date().toLocaleDateString()}</div>
    </div>
  </div>
  
  ${[1, 2, 3].map(phase => `
    <div class="phase">
      <div class="phase-title">
        ${phase === 1 ? 'Phase 1: Welcome & Setup' : 
          phase === 2 ? 'Phase 2: Pre-Event Prep' : 
          'Phase 3: Go-Live'}
      </div>
      ${workflow.steps.filter(s => s.phase === phase).map(step => `
        <div class="step">
          <span class="step-number">${step.id}.</span>
          <div>
            <div><span class="checkbox">☐</span><strong>${step.title}</strong> (Due: ${step.dueDate})</div>
            <div style="color: #666; margin-top: 5px;">${step.description}</div>
            ${step.subTasks && step.subTasks.length > 0 ? `
              <ul class="subtasks">
                ${step.subTasks.map(task => `<li>${task}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `).join('')}
</body>
</html>
  `
  
  return html
}
