import { useState, useEffect, useRef } from 'react'
import { getTemplates, renderTemplate, getLeads } from '../../../lib/crmSupabase'
import { Copy, Mail, Check } from 'lucide-react'

export default function OutreachTemplates() {
  const [templates] = useState(getTemplates())
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0])
  const [selectedLead, setSelectedLead] = useState(null)
  const [leads, setLeads] = useState([])
  const [rendered, setRendered] = useState(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const textareaRef = useRef(null)

  useEffect(() => {
    const loadLeads = async () => {
      setLoading(true)
      const data = await getLeads()
      setLeads(data)
      setLoading(false)
    }
    loadLeads()
  }, [])

  useEffect(() => {
    if (selectedTemplate && selectedLead) {
      const result = renderTemplate(selectedTemplate.id, selectedLead)
      setRendered(result)
    } else {
      setRendered(null)
    }
  }, [selectedTemplate, selectedLead])

  const handleCopy = async () => {
    const textToCopy = rendered ? `Subject: ${rendered.subject}\n\n${rendered.body}` : ''
    
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(textToCopy)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        return
      } catch (err) {
        console.log('Clipboard API failed, falling back to textarea method')
      }
    }
    
    // Fallback for mobile Safari
    if (textareaRef.current) {
      textareaRef.current.value = textToCopy
      textareaRef.current.style.display = 'block'
      textareaRef.current.select()
      textareaRef.current.setSelectionRange(0, 99999)
      
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        alert('Copy failed. Please select and copy manually.')
      }
      
      textareaRef.current.style.display = 'none'
    }
  }

  const handleOpenEmail = () => {
    if (!rendered || !selectedLead?.contact?.email) {
      alert('No email address available for this lead')
      return
    }

    const subject = encodeURIComponent(rendered.subject)
    const body = encodeURIComponent(rendered.body)
    const mailto = `mailto:${selectedLead.contact.email}?subject=${subject}&body=${body}`
    
    window.location.href = mailto
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hidden textarea for mobile copy fallback */}
      <textarea
        ref={textareaRef}
        style={{ 
          position: 'absolute', 
          left: '-9999px',
          display: 'none'
        }}
        readOnly
      />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight mb-2">
          <span className="text-red-500">OUTREACH</span> TEMPLATES
        </h1>
        <p className="text-gray-400">Pre-built email templates for sales outreach</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left - Template Selection */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800/50">
            <h3 className="text-lg font-bold text-white mb-4">Templates</h3>
            <div className="space-y-2">
              {templates.map(template => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'bg-red-600 text-white'
                      : 'bg-[#12122a] text-gray-300 hover:bg-[#16162e]'
                  }`}
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>

          {/* Lead Selection */}
          <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800/50">
            <h3 className="text-lg font-bold text-white mb-4">Select Lead</h3>
            <select
              value={selectedLead?.id || ''}
              onChange={(e) => {
                const lead = leads.find(l => l.id === e.target.value)
                setSelectedLead(lead)
              }}
              className="w-full px-4 py-3 bg-[#12122a] border border-gray-800/50 rounded-xl text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/40"
            >
              <option value="">-- Select a lead --</option>
              {leads
                .filter(l => l.stage !== 'lost' && l.verification_status !== 'do_not_contact')
                .map(lead => (
                  <option key={lead.id} value={lead.id}>
                    {lead.org_name}
                  </option>
                ))}
            </select>

            {selectedLead && (
              <div className="mt-4 p-3 bg-[#12122a] rounded-lg border border-gray-800/50">
                <div className="text-xs text-gray-500 mb-1">Selected Lead</div>
                <div className="text-white font-bold mb-1">{selectedLead.org_name}</div>
                <div className="text-sm text-gray-400">{selectedLead.sport}</div>
                <div className="text-sm text-gray-400">{selectedLead.location}</div>
                {selectedLead.contact.email && (
                  <div className="text-sm text-green-400 mt-2 flex items-center gap-1">
                    <Mail size={14} /> {selectedLead.contact.email}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right - Preview & Actions */}
        <div className="lg:col-span-2">
          <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Preview</h3>
              {rendered && (
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className={`${
                      copied ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'
                    } text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2`}
                  >
                    {copied ? (
                      <>
                        <Check size={16} /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={16} /> Copy to Clipboard
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleOpenEmail}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
                  >
                    <Mail size={16} /> Open in Email
                  </button>
                </div>
              )}
            </div>

            {!rendered ? (
              <div className="text-center text-gray-500 py-12">
                <Mail size={48} className="mx-auto mb-4 opacity-50" />
                <p>Select a template and lead to preview</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Subject Line */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Subject Line</label>
                  <div className="px-4 py-3 bg-[#12122a] border border-gray-800/50 rounded-xl text-white font-medium">
                    {rendered.subject}
                  </div>
                </div>

                {/* Email Body */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email Body</label>
                  <div className="px-4 py-4 bg-[#12122a] border border-gray-800/50 rounded-xl text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed min-h-[400px]">
                    {rendered.body}
                  </div>
                </div>

                {/* Variables Reference */}
                <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-lg">
                  <div className="text-xs font-bold text-blue-400 uppercase mb-2">Available Variables</div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-blue-300">
                    <div><code className="bg-blue-900/30 px-2 py-1 rounded">{'{{org_name}}'}</code></div>
                    <div><code className="bg-blue-900/30 px-2 py-1 rounded">{'{{decision_maker}}'}</code></div>
                    <div><code className="bg-blue-900/30 px-2 py-1 rounded">{'{{sport}}'}</code></div>
                    <div><code className="bg-blue-900/30 px-2 py-1 rounded">{'{{upcoming_event}}'}</code></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Template Info */}
          <div className="mt-4 p-4 bg-green-600/10 border border-green-500/20 rounded-lg">
            <div className="text-xs font-bold text-green-400 uppercase mb-1">✓ Templates Ready</div>
            <div className="text-sm text-green-300">
              All email templates are pre-configured with FFM branding. Select a lead and template to preview, then copy or open in your email client.
            </div>
          </div>
        </div>
      </div>

      {/* Template Guide */}
      <div className="mt-8 bg-[#1a1a2e] rounded-xl p-6 border border-gray-800/50">
        <h3 className="text-lg font-bold text-white mb-4">Outreach Strategy Guide</h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-bold text-red-400 mb-2">Cold Outreach (First Contact)</h4>
            <ul className="space-y-1 text-gray-400">
              <li>• Keep it short and personal</li>
              <li>• Lead with value, not features</li>
              <li>• Mention specific details about their organization</li>
              <li>• End with a clear, low-pressure CTA</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-red-400 mb-2">Follow-up #1 (3-5 days later)</h4>
            <ul className="space-y-1 text-gray-400">
              <li>• Acknowledge they're busy</li>
              <li>• Share a relevant work example</li>
              <li>• Reiterate availability</li>
              <li>• Keep it brief</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-red-400 mb-2">Meeting Request (After engagement)</h4>
            <ul className="space-y-1 text-gray-400">
              <li>• Be specific about what you'll cover</li>
              <li>• Show you've researched them</li>
              <li>• Offer flexible scheduling</li>
              <li>• Include calendar link if available</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-red-400 mb-2">Post-Meeting (Same day)</h4>
            <ul className="space-y-1 text-gray-400">
              <li>• Send within 2 hours of meeting</li>
              <li>• Recap what was discussed</li>
              <li>• Outline next steps clearly</li>
              <li>• Attach proposal or contract</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
