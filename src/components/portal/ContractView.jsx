import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getContractById, deleteContract } from '../../lib/supabase'
import { 
  generateContractHTML, 
  getStatusIcon, 
  getStatusBadgeClass,
  getContractShareLink,
  generateClientEmail
} from '../../lib/contractHelpers'

export default function ContractView() {
  const { id } = useParams()
  const [contract, setContract] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadContract()
  }, [id])

  const loadContract = async () => {
    try {
      const data = await getContractById(id)
      setContract(data)
    } catch (error) {
      console.error('Error loading contract:', error)
      alert('Contract not found')
      navigate('/portal/contracts')
    } finally {
      setLoading(false)
    }
  }

  const [copySuccess, setCopySuccess] = useState(false)

  const handleCopyLink = async () => {
    const link = getContractShareLink(contract.share_token)
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(link)
      } else {
        // Fallback for mobile: create temp textarea
        const textarea = document.createElement('textarea')
        textarea.value = link
        textarea.style.position = 'fixed'
        textarea.style.left = '-9999px'
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 3000)
    } catch {
      // Last resort: show link for manual copy
      alert('Copy this link:\n\n' + link)
    }
  }

  const handleSendToClient = () => {
    const { subject, body } = generateClientEmail(
      contract.share_token,
      contract.contract_data?.promoter_name || 'there',
      contract.org_name || 'Organization'
    )
    
    const clientEmail = contract.contract_data?.promoter_email || ''
    const mailtoLink = `mailto:${clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoLink, '_blank')
    
    // Also copy link as backup
    navigator.clipboard.writeText(getContractShareLink(contract.share_token)).catch(() => {})
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this contract? This cannot be undone.')) {
      return
    }

    try {
      await deleteContract(contract.id)
      alert('Contract deleted successfully.')
      navigate('/portal/contracts')
    } catch (error) {
      console.error('Error deleting contract:', error)
      alert('Failed to delete contract: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading contract...</div>
      </div>
    )
  }

  if (!contract) {
    return null
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header - hidden when printing */}
      <div className="mb-6 print:hidden">
        <button
          onClick={() => navigate('/portal/contracts')}
          className="text-gray-400 hover:text-white mb-2 inline-flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {contract.org_name || 'Untitled Contract'}
            </h1>
            <p className="text-gray-400">{contract.promoter_name || 'No promoter name'}</p>
          </div>
          <span className={getStatusBadgeClass(contract.status)}>
            {getStatusIcon(contract.status)} {contract.status}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-6 print:hidden">
        <button
          onClick={handleCopyLink}
          className={`px-4 py-2 ${copySuccess ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'} text-white rounded-lg transition-colors`}
        >
          {copySuccess ? '✅ Copied!' : '📋 Copy Link'}
        </button>

        {contract.status !== 'signed' && (
          <button
            onClick={handleSendToClient}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            📧 Send to Client
          </button>
        )}

        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          📄 Download PDF
        </button>

        {contract.status !== 'signed' && (
          <button
            onClick={() => navigate(`/portal/contracts/${contract.id}/edit`)}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
          >
            ✏️ Edit Contract
          </button>
        )}

        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors ml-auto"
        >
          🗑️ Delete
        </button>
      </div>

      {/* Contract Display */}
      <div 
        className="bg-dark-900 rounded-lg p-8 border border-gray-800"
        dangerouslySetInnerHTML={{ __html: generateContractHTML(contract) }}
      />
    </div>
  )
}
