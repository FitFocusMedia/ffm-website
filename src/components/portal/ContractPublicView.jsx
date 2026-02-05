import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getContractByShareToken, markContractViewed, signContract } from '../../lib/supabase'
import { generateContractHTML, getStatusIcon, getStatusBadgeClass, getSignatureData, hasSignature } from '../../lib/contractHelpers'
import SignatureCanvas from './SignatureCanvas'

export default function ContractPublicView() {
  const { shareToken } = useParams()
  const [contract, setContract] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [signatureCanvas, setSignatureCanvas] = useState(null)

  useEffect(() => {
    loadContract()
  }, [shareToken])

  const loadContract = async () => {
    try {
      const data = await getContractByShareToken(shareToken)
      setContract(data)

      // Mark as viewed if not already
      if (data.status === 'sent' && !data.viewed_at) {
        await markContractViewed(data.id)
        setContract({ ...data, status: 'viewed', viewed_at: new Date().toISOString() })
      }
    } catch (error) {
      console.error('Error loading contract:', error)
      alert('Contract not found')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitSignature = async () => {
    if (!signatureCanvas || !hasSignature(signatureCanvas)) {
      alert('Please sign before submitting.')
      return
    }

    if (!confirm('By signing, you agree to all terms and conditions in this agreement. This action cannot be undone.')) {
      return
    }

    setSubmitting(true)

    try {
      const signature = getSignatureData(signatureCanvas)
      const updatedContract = await signContract(contract.id, signature, true)
      
      setContract(updatedContract)
      alert('Contract signed successfully! Both parties will receive confirmation.')
    } catch (error) {
      console.error('Error submitting signature:', error)
      alert('Failed to submit signature: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading contract...</div>
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-3xl font-bold text-white mb-2">Contract Not Found</h1>
          <p className="text-gray-400">This contract link may be invalid or expired.</p>
        </div>
      </div>
    )
  }

  const canSign = contract.status !== 'signed' && !contract.client_signature && contract.ffm_signature

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <header className="bg-dark-900 border-b border-gray-800 print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Fit Focus Media</h1>
              <p className="text-gray-400">Event Media Coverage Agreement</p>
            </div>
            <span className={getStatusBadgeClass(contract.status)}>
              {getStatusIcon(contract.status)} {contract.status}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contract Display */}
        <div 
          className="bg-dark-900 rounded-lg p-8 border border-gray-800 mb-8"
          dangerouslySetInnerHTML={{ __html: generateContractHTML(contract) }}
        />

        {/* Client Signature Section */}
        {canSign && (
          <div className="bg-dark-900 rounded-lg p-8 border border-gray-800 print:hidden">
            <h2 className="text-2xl font-bold text-white mb-4">Sign Agreement</h2>
            
            <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4 mb-6">
              <p className="text-yellow-200 text-sm">
                ⚠️ By signing this agreement, you acknowledge that you have read, understood, and agree to 
                all terms and conditions outlined above. This signature is legally binding.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Signature
              </label>
              <SignatureCanvas
                onSignatureChange={(canvas) => setSignatureCanvas(canvas)}
              />
            </div>

            <button
              onClick={handleSubmitSignature}
              disabled={submitting}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              {submitting ? 'Submitting...' : '✓ Accept & Sign Contract'}
            </button>
          </div>
        )}

        {contract.status === 'signed' && (
          <div className="bg-green-900/20 border border-green-600 rounded-lg p-6 text-center print:hidden">
            <div className="text-5xl mb-3">✅</div>
            <h3 className="text-xl font-bold text-white mb-2">Contract Fully Executed</h3>
            <p className="text-gray-300">
              This contract has been signed by both parties. Both parties will receive confirmation.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
