function h(o){const e=o.contract_data||{},t=(r,a="[NOT SET]")=>r||`<span class="text-gray-500">${a}</span>`,i=(r,a,p="[NOT SET]")=>!r&&!a?`<span class="text-gray-500">${p}</span>`:r?!a||a===r?r:`${r}–${a}`:a,d=r=>r?"☑":"☐";let l="";e.multi_events&&e.multi_events.length>0&&e.multi_events.forEach((r,a)=>{(r.name||r.date||r.venue)&&(l+=`
          <tr>
            <td class="border border-gray-700 px-4 py-2">${a+1}</td>
            <td class="border border-gray-700 px-4 py-2">${t(r.name)}</td>
            <td class="border border-gray-700 px-4 py-2">${t(r.date)}</td>
            <td class="border border-gray-700 px-4 py-2">${t(r.venue)}</td>
          </tr>
        `)});const s=r=>r?`$${parseFloat(r).toLocaleString()}`:"$0";let n="";return e.athlete_revenue_ffm_100?n="<p><strong>☑ FFM retains 100%</strong> of Athlete Media Package sales. This is reflected in the zero upfront cost and Client deliverables provided at no charge.</p>":n=`
      <table class="w-full border-collapse border border-gray-700 my-4">
        <tr><th class="border border-gray-700 px-4 py-2 bg-gray-800">Party</th><th class="border border-gray-700 px-4 py-2 bg-gray-800">Share</th></tr>
        <tr><td class="border border-gray-700 px-4 py-2"><strong>FFM</strong></td><td class="border border-gray-700 px-4 py-2">${t(e.athlete_ffm_split,"80")}%</td></tr>
        <tr><td class="border border-gray-700 px-4 py-2"><strong>Client</strong></td><td class="border border-gray-700 px-4 py-2">${t(e.athlete_client_split,"20")}%</td></tr>
      </table>
      <p>The Client's share will be paid monthly, with a statement of sales provided.</p>
    `,`
    <div class="contract-content prose prose-invert max-w-none">
      <h1 class="text-3xl font-bold mb-6">EVENT MEDIA COVERAGE & PARTNERSHIP AGREEMENT</h1>
      
      <p><strong>AGREEMENT</strong> made on <strong>${t(e.agreement_date,new Date().toLocaleDateString())}</strong></p>
      
      <p><strong>BETWEEN:</strong></p>
      
      <p>
        <strong>Fit Focus Media</strong> ABN ${t(e.ffm_abn,"[ABN]")}<br>
        Represented by: Brandon Hibbs<br>
        Email: info@fitfocusmedia.com.au<br>
        Website: www.fitfocusmedia.com.au<br>
        (hereinafter referred to as <strong>"FFM"</strong> or <strong>"the Media Provider"</strong>)
      </p>
      
      <p><strong>AND:</strong></p>
      
      <p>
        <strong>${t(e.org_name,"[ORGANIZATION NAME]")}</strong><br>
        Represented by: ${t(e.promoter_name,"[PROMOTER NAME]")}<br>
        Position: ${t(e.promoter_position,"[POSITION]")}<br>
        Email: ${t(e.promoter_email,"[EMAIL]")}<br>
        Phone: ${t(e.promoter_phone,"[PHONE]")}<br>
        (hereinafter referred to as <strong>"the Client"</strong> or <strong>"the Event Organiser"</strong>)
      </p>
      
      <hr class="my-6 border-gray-700">
      
      <h2 class="text-2xl font-bold mt-6 mb-4">1. EVENT DETAILS</h2>
      <table class="w-full border-collapse border border-gray-700 my-4">
        <tr><th class="border border-gray-700 px-4 py-2 bg-gray-800">Field</th><th class="border border-gray-700 px-4 py-2 bg-gray-800">Details</th></tr>
        <tr><td class="border border-gray-700 px-4 py-2"><strong>Event Name</strong></td><td class="border border-gray-700 px-4 py-2">${t(e.event_name)}</td></tr>
        <tr><td class="border border-gray-700 px-4 py-2"><strong>Event Date(s)</strong></td><td class="border border-gray-700 px-4 py-2">${t(e.event_date)}</td></tr>
        <tr><td class="border border-gray-700 px-4 py-2"><strong>Event Location</strong></td><td class="border border-gray-700 px-4 py-2">${t(e.event_location)}</td></tr>
        <tr><td class="border border-gray-700 px-4 py-2"><strong>Event Type</strong></td><td class="border border-gray-700 px-4 py-2">${t(e.event_type,"BJJ / Grappling Competition")}</td></tr>
        <tr><td class="border border-gray-700 px-4 py-2"><strong>Estimated Matches</strong></td><td class="border border-gray-700 px-4 py-2">${t(e.estimated_matches)}</td></tr>
        <tr><td class="border border-gray-700 px-4 py-2"><strong>Expected Athlete Participants</strong></td><td class="border border-gray-700 px-4 py-2">${t(e.expected_athletes)}</td></tr>
        <tr><td class="border border-gray-700 px-4 py-2"><strong>Expected Audience</strong></td><td class="border border-gray-700 px-4 py-2">${t(e.expected_audience)}</td></tr>
      </table>
      
      <h2 class="text-2xl font-bold mt-6 mb-4">2. PARTNERSHIP MODEL — ZERO UPFRONT COST</h2>
      
      <h3 class="text-xl font-bold mt-4 mb-2">2.1 No Upfront Fee</h3>
      <p>FFM will provide full professional media coverage for the Event at <strong>no upfront cost</strong> to the Client.</p>
      
      <h3 class="text-xl font-bold mt-4 mb-2">2.2 What FFM Provides at Zero Cost</h3>
      <ul class="list-disc pl-6 my-4">
        <li>Multi-camera professional video coverage (${i(e.camera_angles,e.camera_angles_max,"2")} camera angles)</li>
        ${e.photography_type==="professional"?"<li>Professional event photography</li>":""}
        ${e.photography_type==="base"?"<li>Base event photography</li>":""}
        <li>Livestream and/or PPV broadcast production (if applicable)</li>
        <li>Post-event highlight reel for the Client's promotional use</li>
        <li>Access to the FFM Athlete Media Portal for athlete content delivery</li>
        <li>On-site crew (${i(e.crew_size,e.crew_size_max,"2")} persons)</li>
      </ul>
      
      <h3 class="text-xl font-bold mt-4 mb-2">2.3 Multi-Event Commitment</h3>
      <p>This Agreement covers <strong>${t(e.multi_event_count,"1")}</strong> events over a period of <strong>${t(e.multi_event_duration,"[DURATION]")}</strong>${l?", as scheduled below:":"."}</p>
      
      ${l?`
        <table class="w-full border-collapse border border-gray-700 my-4">
          <tr><th class="border border-gray-700 px-4 py-2 bg-gray-800">#</th><th class="border border-gray-700 px-4 py-2 bg-gray-800">Event Name</th><th class="border border-gray-700 px-4 py-2 bg-gray-800">Date</th><th class="border border-gray-700 px-4 py-2 bg-gray-800">Venue</th></tr>
          ${l}
        </table>
      `:""}
      
      <h2 class="text-2xl font-bold mt-6 mb-4">3. SCOPE OF MEDIA COVERAGE</h2>
      
      <h3 class="text-xl font-bold mt-4 mb-2">3.1 Post-Production Deliverables for the Client</h3>
      <ul class="list-disc pl-6 my-4">
        <li>One (1) Event Highlight Reel (60–120 seconds) within ${i(e.highlight_delivery_days,e.highlight_delivery_days_max,"7")} business days</li>
        <li>${i(e.social_clips_count,e.social_clips_count_max,"5")} social media clips within ${i(e.social_clips_delivery_days,e.social_clips_delivery_days_max,"5")} business days</li>
        ${e.photography_type&&e.photography_type!=="none"?`<li>Curated photo gallery of ${i(e.photo_count,e.photo_count_max,"50")} edited images</li>`:""}
      </ul>
      
      <h3 class="text-xl font-bold mt-4 mb-2">3.2 Livestream / PPV Production</h3>
      <p>
        <strong>Livestream included:</strong> ${d(e.livestream_included)} ${e.livestream_included?"Yes":"No"}<br>
        <strong>PPV included:</strong> ${d(e.ppv_included)} ${e.ppv_included?"Yes":"No"}
      </p>
      ${e.ppv_included?`
        <p>
          <strong>Platform:</strong> ${t(e.ppv_platform)}<br>
          <strong>PPV Price Point:</strong> ${e.ppv_price_type==="range"&&e.ppv_price_max?`${s(e.ppv_price)} - ${s(e.ppv_price_max)}`:s(e.ppv_price)} per viewer
        </p>
      `:""}
      
      <h2 class="text-2xl font-bold mt-6 mb-4">4. LIVESTREAM & PPV REVENUE SHARE</h2>
      ${e.ppv_included?`
        <table class="w-full border-collapse border border-gray-700 my-4">
          <tr><th class="border border-gray-700 px-4 py-2 bg-gray-800">Party</th><th class="border border-gray-700 px-4 py-2 bg-gray-800">Share</th></tr>
          <tr><td class="border border-gray-700 px-4 py-2"><strong>FFM</strong></td><td class="border border-gray-700 px-4 py-2">${t(e.ppv_ffm_split,"70")}%</td></tr>
          <tr><td class="border border-gray-700 px-4 py-2"><strong>Client</strong></td><td class="border border-gray-700 px-4 py-2">${t(e.ppv_client_split,"30")}%</td></tr>
        </table>
        <p>The Client's share will be paid within ${t(e.ppv_payment_days,"21")} days of each Event via bank transfer.</p>
      `:"<p>PPV not included in this agreement.</p>"}
      
      <h2 class="text-2xl font-bold mt-6 mb-4">5. ATHLETE MEDIA PACKAGES</h2>
      
      <h3 class="text-xl font-bold mt-4 mb-2">5.1 Overview</h3>
      <p>FFM operates a direct-to-athlete media sales model through the <strong>FFM Athlete Media Portal</strong>.</p>
      
      <h3 class="text-xl font-bold mt-4 mb-2">5.2 Available Packages</h3>
      ${e.athlete_packages&&e.athlete_packages.length>0?`
        <table class="w-full border-collapse border border-gray-700 my-4">
          <tr>
            <th class="border border-gray-700 px-4 py-2 bg-gray-800 text-left">Package</th>
            <th class="border border-gray-700 px-4 py-2 bg-gray-800 text-left">Price</th>
            <th class="border border-gray-700 px-4 py-2 bg-gray-800 text-left">Description</th>
          </tr>
          ${e.athlete_packages.map(r=>`
            <tr>
              <td class="border border-gray-700 px-4 py-2"><strong>${r.name||"[Package Name]"}</strong></td>
              <td class="border border-gray-700 px-4 py-2">${s(r.price)}</td>
              <td class="border border-gray-700 px-4 py-2">${r.description||"-"}</td>
            </tr>
          `).join("")}
        </table>
      `:`
        <p><strong>🔥 VIP COVERAGE</strong> — ${s(e.vip_price||350)}</p>
        <p><strong>📹 MATCH PACKAGE</strong> — ${s(e.match_price||175)}</p>
        <p><strong>⭐ SEASON PASS</strong> — ${s(e.season_price||899)}/year</p>
      `}
      
      <h3 class="text-xl font-bold mt-4 mb-2">5.3 Athlete Media Package Revenue Split</h3>
      ${n}
      
      ${e.add_ons&&e.add_ons.length>0?`
      <h2 class="text-2xl font-bold mt-6 mb-4">6. CLIENT ADD-ONS</h2>
      <p>The following additional services have been included in this Agreement at the Client's request:</p>
      <table class="w-full border-collapse border border-gray-700 my-4">
        <tr>
          <th class="border border-gray-700 px-4 py-2 bg-gray-800 text-left">Add-On</th>
          <th class="border border-gray-700 px-4 py-2 bg-gray-800 text-left">Price</th>
          <th class="border border-gray-700 px-4 py-2 bg-gray-800 text-left">Description</th>
        </tr>
        ${e.add_ons.map(r=>`
          <tr>
            <td class="border border-gray-700 px-4 py-2"><strong>${r.name||"[Add-On Name]"}</strong></td>
            <td class="border border-gray-700 px-4 py-2">${s(r.price)}</td>
            <td class="border border-gray-700 px-4 py-2">${r.description||"-"}</td>
          </tr>
        `).join("")}
        <tr class="bg-gray-800">
          <td class="border border-gray-700 px-4 py-2"><strong>TOTAL ADD-ONS</strong></td>
          <td class="border border-gray-700 px-4 py-2"><strong>${s(e.add_ons.reduce((r,a)=>r+(parseFloat(a.price)||0),0))}</strong></td>
          <td class="border border-gray-700 px-4 py-2"></td>
        </tr>
      </table>
      <p>Payment for add-ons is due prior to the Event date unless otherwise agreed in writing.</p>
      
      <h2 class="text-2xl font-bold mt-6 mb-4">7. EXCLUSIVE MEDIA COVERAGE RIGHTS</h2>
      `:`
      <h2 class="text-2xl font-bold mt-6 mb-4">6. EXCLUSIVE MEDIA COVERAGE RIGHTS</h2>
      `}
      <p>The Client grants FFM <strong>exclusive rights</strong> to provide professional video and photography media coverage services at the Event.</p>
      
      <h2 class="text-2xl font-bold mt-6 mb-4">7. ACCESS & LOGISTICS</h2>
      <ul class="list-disc pl-6 my-4">
        <li>FFM requires venue access at least ${t(e.setup_hours,"2")} hours prior to first match</li>
        <li>Crew size: ${i(e.crew_size,e.crew_size_max,"2")} persons with complimentary entry</li>
        ${e.internet_speed?`<li>Internet upload speed: minimum ${e.internet_speed} Mbps</li>`:""}
        <li>Event schedule to be provided ${t(e.schedule_hours_before,"48")} hours before Event</li>
        <li>Athlete list to be provided ${t(e.athlete_list_days_before,"7")} days before Event</li>
      </ul>
      
      <h3 class="text-xl font-bold mt-4 mb-2">7.1 Athlete Contact Information</h3>
      <p>The Client <strong>must provide</strong> FFM with contact information for all registered athletes, including but not limited to:</p>
      <ul class="list-disc pl-6 my-4">
        <li>Full name</li>
        <li>Email address</li>
        <li>Phone number (where available)</li>
        <li>Social media handles (Instagram, etc.)</li>
      </ul>
      <p>This information will be used by FFM for:</p>
      <ul class="list-disc pl-6 my-4">
        <li>Delivering content and media packages to athletes via the FFM Athlete Media Portal</li>
        <li>Marketing and promotional communications regarding event content and athlete media services</li>
        <li>Tagging athletes in social media content</li>
      </ul>
      <p>The Client warrants that appropriate consent has been obtained from athletes for their contact information to be shared with FFM for these purposes, as outlined in Section 12.</p>
      
      <h2 class="text-2xl font-bold mt-6 mb-4">8. CANCELLATION & RESCHEDULING</h2>
      <p>Cancellation less than 15 days before Event: Client will pay ${s(e.cancellation_fee||500)} cancellation fee plus non-recoverable expenses.</p>
      
      <h2 class="text-2xl font-bold mt-6 mb-4">9. TERM & TERMINATION</h2>
      <p>Initial term: ${t(e.initial_term_months,"12")} months. Auto-renews for ${t(e.renewal_period_months,"12")}-month periods unless ${t(e.nonrenewal_notice_days,"60")} days' written notice provided.</p>
      <p>Termination: ${t(e.termination_notice_days,"30")} days' written notice. Remedy period: ${t(e.remedy_period_days,"14")} days.</p>
      
      <h2 class="text-2xl font-bold mt-6 mb-4">10. LIABILITY & INSURANCE</h2>
      <p>FFM holds public liability insurance of ${s(e.pli_amount||2e7)}.</p>
      
      <h2 class="text-2xl font-bold mt-6 mb-4">11. INTELLECTUAL PROPERTY & OWNERSHIP</h2>
      
      <h3 class="text-xl font-bold mt-4 mb-2">11.1 Ownership of Content</h3>
      <p>The Client agrees that, subject to the rights and licenses granted herein, FFM is and will remain the <strong>sole and exclusive owner</strong> of all right, title, and interest, throughout the world, to all video footage, photographs, and other media content ("Content") produced under this Agreement, and any copies thereof. Except as expressly provided in this Agreement, FFM reserves all rights and licenses not expressly granted.</p>
      
      <h3 class="text-xl font-bold mt-4 mb-2">11.2 License to Client</h3>
      <p>FFM hereby grants to the Client a <strong>non-exclusive, perpetual license</strong> to use the deliverables specified in Section 3.1 (Event Highlight Reel, social media clips, and curated photo gallery) for promotional purposes related to the Event and Client's organization. This license is non-transferable and does not include the right to sublicense.</p>
      
      <h3 class="text-xl font-bold mt-4 mb-2">11.3 Restrictions on Use</h3>
      <p>The Client will NOT use the Content for any of the following purposes without prior written permission from FFM:</p>
      <ul class="list-disc pl-6 my-4">
        <li><strong>No Unlawful Use:</strong> The Client will not use the Content in any unlawful manner, including but not limited to pornography or defamation.</li>
        <li><strong>No Standalone File Distribution:</strong> The Client will not distribute raw footage or allow Content to be downloaded, extracted, or redistributed by third parties.</li>
        <li><strong>No Trademark Use:</strong> The Client will not use the Content in any trademark, design, logo, or service mark without FFM's written consent.</li>
        <li><strong>No Products for Resale:</strong> The Client will not use the Content in any goods or products where the Content is the primary value.</li>
        <li><strong>No Alterations:</strong> The Client will not alter, modify, or create derivative works from the Content without prior written permission from FFM.</li>
        <li><strong>No Sublicensing:</strong> The Client will not sublicense, sell, or transfer rights to the Content to any third party.</li>
      </ul>
      
      <h3 class="text-xl font-bold mt-4 mb-2">11.4 Credit Requirements</h3>
      <p>The Client must include appropriate credit to <strong>"Fit Focus Media"</strong> or <strong>"@fitfocusmedia"</strong> when publishing or sharing any Content produced under this Agreement on social media, websites, or promotional materials.</p>
      
      <h2 class="text-2xl font-bold mt-6 mb-4">12. MEDIA RELEASE & CONSENT</h2>
      
      <h3 class="text-xl font-bold mt-4 mb-2">12.1 Athlete Media Release</h3>
      <p>The Client acknowledges that FFM will capture video footage and photographs of athletes, coaches, officials, and spectators at the Event. The Client warrants that:</p>
      <ul class="list-disc pl-6 my-4">
        <li>Appropriate media release and consent has been obtained from all athletes participating in the Event, either through registration terms & conditions or separate media release forms.</li>
        <li>Athletes have been informed that professional media coverage will be present and content may be used for promotional, commercial, and broadcast purposes.</li>
        <li>Minors participating in the Event have appropriate parental/guardian consent for media capture and publication.</li>
      </ul>
      
      <h3 class="text-xl font-bold mt-4 mb-2">12.2 Grant of Rights</h3>
      <p>FFM is granted the <strong>perpetual and irrevocable right</strong> to use, publish, and distribute video and photographs captured at the Event for editorial, trade, advertising, promotional, and commercial purposes in any manner and medium, including but not limited to:</p>
      <ul class="list-disc pl-6 my-4">
        <li>Social media platforms and websites</li>
        <li>Marketing and promotional materials</li>
        <li>Broadcast and streaming services</li>
        <li>Athlete Media Packages sold through the FFM Portal</li>
        <li>Portfolio and showcase purposes</li>
      </ul>
      
      <h3 class="text-xl font-bold mt-4 mb-2">12.3 Implied Consent & Opt-Out Procedure</h3>
      <p>The parties agree that:</p>
      <ul class="list-disc pl-6 my-4">
        <li><strong>Implied Consent:</strong> All athletes, by registering for and competing in the Event, are deemed to have consented to the capture, use, and publication of their image, likeness, and performance by FFM for the purposes outlined in this Agreement.</li>
        <li><strong>Opt-Out Requirement:</strong> Any athlete who does not consent to media capture and publication must notify FFM <strong>in writing</strong> (via email to info@fitfocusmedia.com.au) no less than <strong>48 hours prior</strong> to the Event. FFM will make reasonable efforts to exclude such athletes from published content, however FFM cannot guarantee exclusion from all footage, particularly wide-angle or crowd shots.</li>
        <li><strong>Client Responsibility:</strong> The Client is solely responsible for communicating media coverage terms to athletes through registration materials, event signage, and/or announcements. The Client shall include appropriate notice in registration terms and conditions that professional media coverage will be present and content may be used commercially.</li>
        <li><strong>Liability:</strong> The Client assumes all liability for any claims arising from athletes who allege they did not consent to media capture. FFM shall not be held liable for any such claims, and the Client shall indemnify FFM accordingly as outlined in Section 13.</li>
      </ul>
      
      <h2 class="text-2xl font-bold mt-6 mb-4">13. INDEMNIFICATION</h2>
      <p>The Client will <strong>indemnify, defend, and hold harmless</strong> FFM, its officers, employees, agents, and contractors from all liability, claims, demands, causes of action, judgments, damages, and expenses (including reasonable attorneys' fees and costs) arising out of or as a result of:</p>
      <ul class="list-disc pl-6 my-4">
        <li>The Client's use of the Content in violation of this Agreement</li>
        <li>Any breach of the Client's representations or warranties under this Agreement</li>
        <li>Any claim by a third party (including athletes, spectators, or venue operators) relating to the Event</li>
        <li>The Client's failure to obtain proper media releases or consents</li>
      </ul>
      <p>This indemnification does not apply to claims arising solely from FFM's willful misconduct, gross negligence, or bad faith.</p>
      
      <h2 class="text-2xl font-bold mt-6 mb-4">14. LIMITATION OF LIABILITY</h2>
      <p><strong>EXCEPT FOR ANY REMEDIES THAT CANNOT BE EXCLUDED OR LIMITED BY LAW, NEITHER PARTY, NOR ANY AFFILIATE, WILL BE LIABLE UNDER THIS AGREEMENT TO THE OTHER PARTY FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, RELIANCE, OR PUNITIVE DAMAGES OR LOST OR IMPUTED PROFITS, LOST DATA, OR COST OF PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES.</strong></p>
      <p>FFM's total liability under this Agreement shall not exceed the total fees paid or payable by the Client under this Agreement in the twelve (12) months preceding the claim.</p>
      
      <h2 class="text-2xl font-bold mt-6 mb-4">15. FORCE MAJEURE</h2>
      <p>Neither party shall be liable for any failure or delay in performing their obligations under this Agreement if such failure or delay results from circumstances beyond the reasonable control of that party, including but not limited to: acts of God, natural disasters, pandemic, government actions, war, terrorism, civil unrest, or failure of third-party services.</p>
      
      <h2 class="text-2xl font-bold mt-6 mb-4">16. CONFIDENTIALITY</h2>
      <p>Each party agrees to keep confidential and not disclose to any third party any confidential information received from the other party, including but not limited to business strategies, financial information, athlete data, and the specific commercial terms of this Agreement, except as required by law or with prior written consent.</p>
      
      <h2 class="text-2xl font-bold mt-6 mb-4">17. ASSIGNMENT</h2>
      <p>This Agreement may not be assigned by the Client without FFM's prior written consent. FFM may assign this Agreement, in whole or in part, to any affiliate or successor without the Client's consent.</p>
      
      <h2 class="text-2xl font-bold mt-6 mb-4">18. DISPUTE RESOLUTION</h2>
      <p>Any dispute arising from this Agreement shall first be resolved through good-faith negotiation between the parties. If the dispute cannot be resolved through negotiation within thirty (30) days, the dispute shall be submitted to mediation. If mediation fails, the dispute will be resolved through binding arbitration conducted in Brisbane, Queensland in accordance with the rules of the Resolution Institute.</p>
      
      <h2 class="text-2xl font-bold mt-6 mb-4">19. GOVERNING LAW</h2>
      <p>This Agreement shall be governed by and construed in accordance with the laws of <strong>Queensland, Australia</strong>, without reference to rules governing choice of laws. The parties submit to the exclusive jurisdiction of the courts of Queensland.</p>
      
      <h2 class="text-2xl font-bold mt-6 mb-4">20. SEVERABILITY</h2>
      <p>If any provision of this Agreement is held invalid, illegal, or unenforceable by a court of competent jurisdiction, the remainder of the Agreement will remain valid and enforceable, and the parties will negotiate in good faith a substitute provision which most nearly reflects the original intent.</p>
      
      <h2 class="text-2xl font-bold mt-6 mb-4">21. ENTIRE AGREEMENT</h2>
      <p>This Agreement represents and constitutes the <strong>entire agreement</strong> between the parties with respect to the subject matter hereof, and supersedes and merges all prior negotiations, agreements, and understandings, oral or written. This Agreement may not be altered, modified, or amended except in writing signed by both parties.</p>
      
      <h2 class="text-2xl font-bold mt-6 mb-4">22. NOTICES</h2>
      <p>All notices, demands, or other communications under this Agreement shall be in writing and delivered via email with read receipt, registered mail, or hand delivery to the addresses specified in this Agreement. Notices delivered by email shall be deemed received on the business day sent (or the next business day if sent after 5pm AEST). Mailed notices shall be deemed received three (3) business days after posting.</p>
      
      ${e.custom_notes&&e.custom_notes.length>0?`
      <h2 class="text-2xl font-bold mt-6 mb-4">ADDITIONAL TERMS & NOTES</h2>
      <p>The following additional terms and event-specific provisions apply to this Agreement:</p>
      ${e.custom_notes.map((r,a)=>`
        <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-4 my-4">
          <h3 class="text-lg font-bold mb-2">${r.title||`Custom Note ${a+1}`}</h3>
          <p class="whitespace-pre-wrap">${r.content||"[No content provided]"}</p>
        </div>
      `).join("")}
      `:""}
      
      <hr class="my-6 border-gray-700">
      
      <h2 class="text-2xl font-bold mt-6 mb-4">SIGNATURES</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div class="border border-gray-700 rounded-lg p-6">
          <h3 class="text-lg font-bold mb-4">Fit Focus Media</h3>
          ${o.ffm_signature?`
            <img src="${o.ffm_signature}" alt="FFM Signature" class="max-w-full h-auto border border-gray-600 p-2 rounded bg-white mb-4" style="max-width: 300px;">
            <p><strong>Name:</strong> Brandon Hibbs</p>
            <p><strong>Signed:</strong> ${new Date(o.ffm_signed_at).toLocaleString("en-AU",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!0,timeZoneName:"short"})}</p>
          `:'<p class="text-gray-500">[PENDING FFM SIGNATURE]</p>'}
        </div>
        
        <div class="border border-gray-700 rounded-lg p-6">
          <h3 class="text-lg font-bold mb-4">${t(e.org_name,"[ORGANIZATION]")}</h3>
          ${o.client_signature?`
            <img src="${o.client_signature}" alt="Client Signature" class="max-w-full h-auto border border-gray-600 p-2 rounded bg-white mb-4" style="max-width: 300px;">
            <p><strong>Name:</strong> ${t(e.promoter_name)}</p>
            <p><strong>Position:</strong> ${t(e.promoter_position)}</p>
            <p><strong>Signed:</strong> ${new Date(o.client_signed_at).toLocaleString("en-AU",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!0,timeZoneName:"short"})}</p>
          `:'<p class="text-gray-500">[PENDING CLIENT SIGNATURE]</p>'}
        </div>
      </div>
    </div>
  `}function g(o){const e=document.createElement("canvas");e.width=o.width,e.height=o.height;const t=e.getContext("2d"),l=o.getContext("2d").getImageData(0,0,o.width,o.height).data,s=t.createImageData(o.width,o.height),n=s.data;for(let r=0;r<l.length;r+=4)l[r+3]>10?(n[r]=0,n[r+1]=0,n[r+2]=0,n[r+3]=255):(n[r]=255,n[r+1]=255,n[r+2]=255,n[r+3]=255);return t.putImageData(s,0,0),e.toDataURL("image/png")}function m(o){return o.getContext("2d").getImageData(0,0,o.width,o.height).data.some(i=>i!==0)}function c(o){const e=window.location.hostname;let t;return e==="localhost"||e.includes("192.168.")||e.includes("100.")?t="https://clawdbots-mini.tailcfdc1.ts.net:5198":t=window.location.origin,`${t}/#/contract/${o}`}function b(o,e,t){const i=c(o);return{subject:`Event Media Coverage Agreement — Fit Focus Media × ${t}`,body:`Hi ${e},

Please find your Event Media Coverage & Partnership Agreement with Fit Focus Media ready for review and signature.

Review & Sign Here:
${i}

Once you've reviewed the terms, you can sign directly on the page. If you have any questions, reply to this email.

Cheers,
Brandon Hibbs
Fit Focus Media
info@fitfocusmedia.com.au
www.fitfocusmedia.com.au`}}function u(o){return{draft:"📝",sent:"📤",viewed:"👀",signed:"✅",expired:"❌"}[o]||"📄"}function y(o){return`${{draft:"bg-gray-600",sent:"bg-blue-600",viewed:"bg-yellow-600",signed:"bg-green-600",expired:"bg-red-600"}[o]||"bg-gray-600"} text-white px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-2`}export{h as a,g as b,y as c,c as d,b as e,u as g,m as h};
