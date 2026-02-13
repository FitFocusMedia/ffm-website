import { motion } from 'framer-motion'
import { Mail, Phone, MessageCircle, Calendar, Download, ArrowLeft, CheckCircle, Rocket } from 'lucide-react'
import html2pdf from 'html2pdf.js'

const Step6Contact = ({ formData, analysis, selectedAddOns = [], prevStep, goToStep }) => {
  const exportProposal = () => {
    const element = document.createElement('div')
    element.innerHTML = `
      <div style="font-family: 'Arial', sans-serif; color: #fff; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid #F83B3B; padding-bottom: 20px;">
          <h1 style="color: #F83B3B; font-size: 36px; margin: 0 0 10px 0; font-weight: 900;">
            FIT FOCUS MEDIA
          </h1>
          <p style="color: #9CA3AF; font-size: 16px; margin: 0;">Combat Sports Media Production Proposal</p>
          <p style="color: #6B7280; font-size: 12px; margin: 10px 0 0 0;">${new Date().toLocaleDateString()}</p>
        </div>

        <!-- Organization Details -->
        <div style="background: #2d2d2d; border: 2px solid #374151; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
          <h2 style="color: #F83B3B; font-size: 24px; margin: 0 0 20px 0; font-weight: bold;">Organization Profile</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #9CA3AF; font-size: 14px;">Organization:</td>
              <td style="padding: 8px 0; color: #fff; font-size: 14px; font-weight: bold;">${formData.orgName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #9CA3AF; font-size: 14px;">Events Per Year:</td>
              <td style="padding: 8px 0; color: #fff; font-size: 14px; font-weight: bold;">${formData.showsPerYear}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #9CA3AF; font-size: 14px;">Average Attendance:</td>
              <td style="padding: 8px 0; color: #fff; font-size: 14px; font-weight: bold;">${formData.avgAttendance.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #9CA3AF; font-size: 14px;">Social Following:</td>
              <td style="padding: 8px 0; color: #fff; font-size: 14px; font-weight: bold;">${formData.socialFollowing.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #9CA3AF; font-size: 14px;">Organization Tier:</td>
              <td style="padding: 8px 0; color: #F83B3B; font-size: 16px; font-weight: bold;">${analysis?.tier}</td>
            </tr>
          </table>
        </div>

        <!-- The Grand Slam Offer -->
        <div style="background: linear-gradient(135deg, #D97706 0%, #DC2626 100%); border: 3px solid #FBBF24; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
          <div style="background: rgba(255,255,255,0.2); display: inline-block; padding: 8px 16px; border-radius: 20px; margin-bottom: 15px;">
            <span style="color: #fff; font-size: 12px; font-weight: bold;">⚡ ZERO-COST PRODUCTION</span>
          </div>
          <h2 style="color: #fff; font-size: 28px; margin: 0 0 10px 0; font-weight: bold;">Our Offer to ${formData.orgName}</h2>
          <p style="color: #FEF3C7; font-size: 18px; font-weight: bold; margin: 0 0 20px 0;">
            Professional live stream production at absolutely zero cost to you
          </p>
          
          <div style="background: rgba(255,255,255,0.1); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #fff; font-size: 16px; margin: 0 0 15px 0; font-weight: bold;">✓ What's Included FREE:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #FEF3C7;">
              <li style="margin-bottom: 8px;">Professional live stream production (1-2 cameras)</li>
              <li style="margin-bottom: 8px;">Complete PPV/streaming setup and management</li>
              <li style="margin-bottom: 8px;">Full show recording</li>
              <li style="margin-bottom: 8px;">1 social media highlight clip</li>
              <li style="margin-bottom: 0;">Revenue share: You earn from every PPV sale</li>
            </ul>
          </div>
          
          <div style="background: rgba(16, 185, 129, 0.3); border: 2px solid #10B981; border-radius: 8px; padding: 15px; text-align: center;">
            <p style="color: #fff; font-size: 20px; font-weight: bold; margin: 0;">
              Your Production Cost: <span style="color: #6EE7B7;">$0</span>
            </p>
            <p style="color: #D1FAE5; font-size: 12px; margin: 5px 0 0 0;">
              Zero upfront cost. Zero risk. Just professional streaming + revenue sharing.
            </p>
          </div>
        </div>
        
        <!-- Premium Add-Ons -->
        <div style="background: #2d2d2d; border: 2px solid #374151; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
          <h2 style="color: #F83B3B; font-size: 24px; margin: 0 0 15px 0; font-weight: bold;">Premium Add-Ons</h2>
          ${selectedAddOns.length > 0 ? `
            <p style="color: #10B981; font-size: 14px; margin: 0 0 15px 0; font-weight: bold;">✅ Selected Add-Ons:</p>
            <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #D1D5DB; line-height: 1.8;">
              ${selectedAddOns.map(addon => `<li style="color: #10B981;">✅ ${addon}</li>`).join('')}
            </ul>
          ` : ''}
          <p style="color: #9CA3AF; font-size: 14px; margin: 0 0 15px 0;">
            ${selectedAddOns.length > 0 ? 'Other available options:' : 'Available premium upgrades:'}
          </p>
          ${analysis?.tier === 'Grassroots' ? `
            <ul style="margin: 0; padding-left: 20px; color: #D1D5DB; line-height: 1.8;">
              ${selectedAddOns.includes('Custom Fight Banner Graphics') ? '' : '<li>○ Custom Fight Banner Graphics ($500-$800/event)</li>'}
              ${selectedAddOns.includes('Professional Event Photography') ? '' : '<li>○ Professional Event Photography ($800-$1,200/event)</li>'}
              ${selectedAddOns.includes('Full Recording Package') ? '' : '<li>○ Full Recording Package ($500-$800/event)</li>'}
            </ul>
          ` : analysis?.tier === 'Regional' ? `
            <ul style="margin: 0; padding-left: 20px; color: #D1D5DB; line-height: 1.8;">
              ${selectedAddOns.includes('Premium Camera Setup') ? '' : '<li>○ Premium Camera Setup ($1,500-$3,000/event)</li>'}
              ${selectedAddOns.includes('Social Media Content Package') ? '' : '<li>○ Social Media Content Package ($1,000-$2,000/event)</li>'}
              ${selectedAddOns.includes('Professional Event Photography') ? '' : '<li>○ Professional Event Photography ($800-$1,200/event)</li>'}
              ${selectedAddOns.includes('Custom Fight Banner Graphics') ? '' : '<li>○ Custom Fight Banner Graphics ($500-$800/event)</li>'}
            </ul>
          ` : `
            <ul style="margin: 0; padding-left: 20px; color: #D1D5DB; line-height: 1.8;">
              ${selectedAddOns.includes('Premium Camera Setup') ? '' : '<li>○ Premium Camera Setup ($1,500-$3,000/event)</li>'}
              ${selectedAddOns.includes('Social Media Content Package') ? '' : '<li>○ Social Media Content Package ($1,000-$2,000/event)</li>'}
              ${selectedAddOns.includes('Ongoing Content Strategy') ? '' : '<li>○ Ongoing Content Strategy ($2,000-$4,000/month)</li>'}
              ${selectedAddOns.includes('Full Premium Package') ? '' : '<li>○ Full Premium Package Bundle ($4,000-$6,000/event)</li>'}
            </ul>
          `}
          <p style="color: #6B7280; font-size: 12px; margin: 15px 0 0 0; font-style: italic;">
            * Your revenue share applies regardless of add-ons selected
          </p>
        </div>

        <!-- Revenue Projection -->
        <div style="background: #2d2d2d; border: 2px solid #10B981; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
          <h2 style="color: #10B981; font-size: 24px; margin: 0 0 20px 0; font-weight: bold;">Your Revenue Projection</h2>
          
          <div style="background: #065F46; border: 2px solid #10B981; border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: center;">
            <p style="color: #D1FAE5; font-size: 14px; margin: 0 0 10px 0;">Your Production Cost</p>
            <p style="color: #6EE7B7; font-size: 36px; font-weight: bold; margin: 0;">$0</p>
            <p style="color: #A7F3D0; font-size: 12px; margin: 10px 0 0 0;">Zero upfront investment required</p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; color: #9CA3AF; font-size: 14px; border-bottom: 1px solid #374151;">Estimated PPV Purchases Per Event:</td>
              <td style="padding: 12px 0; color: #60A5FA; font-size: 16px; font-weight: bold; text-align: right; border-bottom: 1px solid #374151;">${Math.round(analysis?.potentialStreamingRevenue?.viewerEstimate * 0.6).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #9CA3AF; font-size: 14px; border-bottom: 1px solid #374151;">Your Revenue Per Event:</td>
              <td style="padding: 12px 0; color: #10B981; font-size: 16px; font-weight: bold; text-align: right; border-bottom: 1px solid #374151;">$${Math.round(analysis?.potentialStreamingRevenue?.perEvent * 0.3).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #10B981; font-size: 14px; font-weight: bold;">Your Annual Revenue:</td>
              <td style="padding: 12px 0; color: #10B981; font-size: 20px; font-weight: bold; text-align: right;">$${Math.round(analysis?.potentialStreamingRevenue?.annual * 0.3).toLocaleString()}</td>
            </tr>
          </table>
          <p style="color: #6B7280; font-size: 11px; margin: 15px 0 0 0; font-style: italic;">
            * Conservative estimates based on industry benchmarks. 100% pure profit — revenue you weren't generating before at zero cost.
          </p>
        </div>

        <!-- Contact Information -->
        <div style="background: #2d2d2d; border: 2px solid #F83B3B; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
          <h2 style="color: #F83B3B; font-size: 24px; margin: 0 0 20px 0; font-weight: bold;">Next Steps</h2>
          <p style="color: #D1D5DB; font-size: 14px; margin: 0 0 20px 0;">
            Ready to elevate your combat sports events? Contact us to discuss this proposal:
          </p>
          <table style="width: 100%;">
            <tr>
              <td style="padding: 8px 0; color: #9CA3AF; font-size: 14px;">Email:</td>
              <td style="padding: 8px 0; color: #60A5FA; font-size: 14px;">info@fitfocusmedia.com.au</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #9CA3AF; font-size: 14px;">Website:</td>
              <td style="padding: 8px 0; color: #60A5FA; font-size: 14px;">fitfocusmedia.com.au</td>
            </tr>
          </table>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #374151;">
          <p style="color: #6B7280; font-size: 12px; margin: 0;">
            © 2026 Fit Focus Media | Professional Combat Sports Production
          </p>
        </div>
      </div>
    `

    const opt = {
      margin: 0,
      filename: `${formData.orgName.replace(/\s/g, '-')}-proposal.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, backgroundColor: '#1a1a1a' },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }

    html2pdf().set(opt).from(element).save()
  }

  const getPackageDescription = (packageName) => {
    const descriptions = {
      'Essential Coverage': 'Perfect for building your media presence with professional highlights and social content.',
      'Professional Production': 'Live streaming with multi-camera coverage and comprehensive content packages.',
      'Broadcast Premium': 'Broadcast-quality production with PPV capability and instant content delivery.',
      'Media Partnership': 'Full-service media solution with ongoing content strategy and revenue sharing.',
      'Full Media Buyout': 'Complete media rights management with dedicated account support.'
    }
    return descriptions[packageName] || 'Tailored media solution for your organization.'
  }

  const startOver = () => {
    if (confirm('Start a new proposal? Your current data will be cleared.')) {
      goToStep(1)
    }
  }

  return (
    <section className="min-h-screen py-12 sm:py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-green-600 rounded-full mb-6"
          >
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            <span className="text-gradient">Your Proposal is Ready!</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Here's what we've prepared for <span className="text-primary-400 font-bold">{formData.orgName}</span>
          </p>
        </motion.div>

        {/* Quick Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-gradient-to-r from-primary-900/40 to-orange-900/40 border-2 border-primary-600 rounded-xl p-6 sm:p-8 mb-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-300 mb-2">Your Tier</p>
              <p className="text-2xl sm:text-3xl font-black text-white">{analysis?.tier}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-300 mb-2">Your Production Cost</p>
              <p className="text-xl sm:text-2xl font-black text-green-400">
                $0
              </p>
              <p className="text-xs text-green-300 mt-1">Zero upfront investment</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-300 mb-2">Your Annual Revenue</p>
              <p className="text-2xl sm:text-3xl font-black text-green-400">
                ${Math.round(analysis?.potentialStreamingRevenue?.annual * 0.3).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">Revenue you weren't making before</p>
            </div>
          </div>
        </motion.div>

        {/* Selected Add-Ons Display */}
        {selectedAddOns.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="bg-dark-800 border border-green-600 rounded-xl p-6 sm:p-8 mb-8"
          >
            <h3 className="text-xl sm:text-2xl font-black text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-400" />
              Selected Premium Add-Ons
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedAddOns.map((addon, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-dark-900 rounded-lg border border-green-600/30">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-green-400 font-semibold text-sm sm:text-base">{addon}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-dark-800 border border-gray-700 rounded-xl p-6 sm:p-8 mb-8"
        >
          <div className="flex items-start gap-4 mb-6">
            <Rocket className="w-10 h-10 sm:w-12 sm:h-12 text-primary-500 flex-shrink-0" />
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">Next Steps</h3>
              <p className="text-gray-300 text-sm sm:text-base">Let's turn this proposal into reality</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { step: '1', title: 'Schedule a Consultation', desc: 'Free 30-minute call to discuss your specific needs and answer questions' },
              { step: '2', title: 'Refine Your Package', desc: 'We\'ll customize the service package to perfectly match your requirements' },
              { step: '3', title: 'Event Planning', desc: 'Work with our team to plan production logistics and content strategy' },
              { step: '4', title: 'Production Day', desc: 'Sit back while we deliver broadcast-quality coverage of your event' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + (index * 0.1) }}
                className="flex gap-4 p-4 bg-dark-900 rounded-lg border border-gray-700 hover:border-primary-600/50 transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-lg sm:text-xl font-black text-white">{item.step}</span>
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-white mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Social Proof Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-dark-800 border border-gray-700 rounded-xl p-6 sm:p-8 mb-8"
        >
          <div className="text-center">
            <div className="flex justify-center mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-base sm:text-lg text-gray-300 italic mb-4">
              "Brandon's team delivered exactly what we needed. Professional coverage, quick turnaround on highlights, and our sponsors loved the exposure. Worth every dollar."
            </p>
            <p className="text-sm text-gray-500">— Combat Sports Promoter, QLD</p>
          </div>
        </motion.div>

        {/* Risk Reversal / Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-2 border-green-600 rounded-xl p-6 sm:p-8 mb-8"
        >
          <div className="text-center">
            <div className="text-4xl mb-4">✓</div>
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-4">Our Satisfaction Guarantee</h3>
            <p className="text-base sm:text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed">
              We're confident you'll love our work. If you're not completely satisfied with your first event's media package, 
              we'll re-edit the entire deliverable at no additional cost.
            </p>
            <p className="text-sm text-green-400 mt-4 font-semibold">
              Plus: Free consultation with absolutely no commitment required.
            </p>
          </div>
        </motion.div>

        {/* Contact Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-dark-800 border border-gray-700 rounded-xl p-6 sm:p-8 mb-8"
        >
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">Get In Touch</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <a
              href="mailto:info@fitfocusmedia.com.au?subject=Combat Sports Media Proposal - ${formData.orgName}"
              className="flex items-center gap-3 p-4 sm:p-5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all hover:scale-[1.02] group"
            >
              <Mail className="w-6 h-6 sm:w-8 sm:h-8 group-hover:rotate-12 transition-transform" />
              <div>
                <p className="font-bold text-sm sm:text-base">Email Us</p>
                <p className="text-xs sm:text-sm text-white/80">info@fitfocusmedia.com.au</p>
              </div>
            </a>

            <a
              href="mailto:info@fitfocusmedia.com.au?subject=Consultation Request - ${formData.orgName}&body=Hi Brandon,%0D%0A%0D%0AI'd like to schedule a consultation to discuss media production for ${formData.orgName}.%0D%0A%0D%0APlease send me your available times.%0D%0A%0D%0AThanks!"
              className="flex items-center gap-3 p-4 sm:p-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all hover:scale-[1.02] group"
            >
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 group-hover:rotate-12 transition-transform" />
              <div>
                <p className="font-bold text-sm sm:text-base">Request a Call</p>
                <p className="text-xs sm:text-sm text-white/80">We'll send scheduling options</p>
              </div>
            </a>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-400">
              Response time: Usually within 24 hours
            </p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="space-y-3"
        >
          <button
            onClick={exportProposal}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all hover:scale-[1.02] text-base sm:text-lg"
          >
            <Download className="w-5 h-5 sm:w-6 sm:h-6" />
            Download Proposal PDF
          </button>

          <div className="flex gap-3">
            <button
              onClick={prevStep}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-dark-700 hover:bg-dark-600 text-white font-bold rounded-lg transition-all text-base sm:text-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <button
              onClick={startOver}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-dark-700 hover:bg-dark-600 text-white font-semibold rounded-lg transition-all text-sm sm:text-base"
            >
              New Proposal
            </button>
            <button
              onClick={() => goToStep(2)}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all text-sm sm:text-base"
            >
              Edit Details
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-gray-500">
            © 2026 Fit Focus Media | Professional Combat Sports Production
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default Step6Contact
