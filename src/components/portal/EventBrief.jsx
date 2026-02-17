/**
 * EventBrief.jsx
 * Printable production brief for an event.
 * Usage: <EventBrief event={event} crew={crewMembers} equipment={equipment} onClose={() => {}} />
 */

export default function EventBrief({ event, crew, equipment, onClose }) {
  if (!event) return null

  const getCrewByIds = (ids) =>
    (ids || []).map(id => crew.find(c => c.id === id)).filter(Boolean)

  const getEquipmentByIds = (ids) =>
    (ids || []).map(id => equipment.find(e => e.id === id)).filter(Boolean)

  function formatDateLong(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-AU', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  const assignedCrew = getCrewByIds(event.crew_ids)
  const assignedEquipment = getEquipmentByIds(event.equipment_ids)

  // Group equipment by category
  const equipmentByCategory = assignedEquipment.reduce((acc, eq) => {
    const cat = eq.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(eq)
    return acc
  }, {})

  const statusColors = {
    confirmed: '#10b981',
    tentative: '#f59e0b',
    completed: '#6b7280',
    cancelled: '#ef4444'
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-start justify-center z-50 p-4 overflow-y-auto">
      {/* Screen Controls — hidden when printing */}
      <div className="print:hidden fixed top-4 right-4 flex items-center gap-3 z-10">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-white font-medium flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Brief
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
        >
          Close
        </button>
      </div>

      {/* Brief Content */}
      <div
        id="event-brief"
        className="bg-white text-gray-900 w-full max-w-3xl my-4 rounded-xl overflow-hidden print:m-0 print:rounded-none print:shadow-none"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', color: 'white', padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', color: '#e5383b', fontWeight: '700', marginBottom: '8px' }}>
                FIT FOCUS MEDIA — PRODUCTION BRIEF
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px' }}>{event.name}</h1>
              <p style={{ fontSize: '16px', color: '#e5383b', margin: '0' }}>{event.client}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{
                background: statusColors[event.status] || '#6b7280',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {event.status}
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '32px' }}>
          {/* Event Details Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
            <div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: '#9ca3af', marginBottom: '6px' }}>DATE</div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>{formatDateLong(event.date)}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: '#9ca3af', marginBottom: '6px' }}>LOCATION</div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>{event.location || 'TBC'}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: '#9ca3af', marginBottom: '6px' }}>CLIENT</div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>{event.client}</div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid #e5e7eb', marginBottom: '28px' }} />

          {/* Crew */}
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#374151', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              👥 Crew ({assignedCrew.length})
            </h2>
            {assignedCrew.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>Name</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>Role</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>Phone</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedCrew.map((c, i) => (
                    <tr key={c.id} style={{ background: i % 2 === 0 ? 'white' : '#f9fafb' }}>
                      <td style={{ padding: '10px 12px', fontWeight: '600', fontSize: '14px', borderBottom: '1px solid #f3f4f6' }}>{c.name}</td>
                      <td style={{ padding: '10px 12px', fontSize: '13px', color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}>{c.role || '—'}</td>
                      <td style={{ padding: '10px 12px', fontSize: '13px', borderBottom: '1px solid #f3f4f6' }}>{c.phone || '—'}</td>
                      <td style={{ padding: '10px 12px', fontSize: '13px', borderBottom: '1px solid #f3f4f6' }}>{c.email || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: '#9ca3af', fontSize: '14px', fontStyle: 'italic' }}>No crew assigned yet. Assign crew from the Crew & Logistics portal.</p>
            )}
          </div>

          {/* Equipment */}
          {assignedEquipment.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#374151', marginBottom: '12px' }}>
                📷 Equipment ({assignedEquipment.length} items)
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                {Object.entries(equipmentByCategory).map(([cat, items]) => (
                  <div key={cat}>
                    <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#9ca3af', marginBottom: '6px' }}>{cat}</div>
                    {items.map(eq => (
                      <div key={eq.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f3f4f6', fontSize: '13px' }}>
                        <span style={{ color: '#111827' }}>{eq.name}</span>
                        <span style={{ color: '#6b7280' }}>×{eq.quantity}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Travel */}
          {((event.flight_links?.length || 0) + (event.accommodation_links?.length || 0) + (event.rental_links?.length || 0)) > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#374151', marginBottom: '12px' }}>
                ✈️ Travel & Logistics
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {event.flight_links?.length > 0 && (
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '6px' }}>Flights</div>
                    {event.flight_links.map((f, i) => (
                      <a key={i} href={f} style={{ display: 'block', color: '#2563eb', fontSize: '13px', marginBottom: '4px', wordBreak: 'break-all' }}>
                        🔗 Flight {i + 1}
                      </a>
                    ))}
                  </div>
                )}
                {event.accommodation_links?.length > 0 && (
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '6px' }}>Accommodation</div>
                    {event.accommodation_links.map((a, i) => (
                      <a key={i} href={a} style={{ display: 'block', color: '#2563eb', fontSize: '13px', marginBottom: '4px', wordBreak: 'break-all' }}>
                        🔗 Booking {i + 1}
                      </a>
                    ))}
                  </div>
                )}
                {event.rental_links?.length > 0 && (
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '6px' }}>Rental Cars</div>
                    {event.rental_links.map((r, i) => (
                      <a key={i} href={r} style={{ display: 'block', color: '#2563eb', fontSize: '13px', marginBottom: '4px', wordBreak: 'break-all' }}>
                        🔗 Rental {i + 1}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {event.notes && (
            <div style={{ marginBottom: '28px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#374151', marginBottom: '12px' }}>
                📝 Notes
              </h2>
              <div style={{ background: '#f9fafb', borderLeft: '3px solid #e5383b', padding: '12px 16px', borderRadius: '4px', fontSize: '14px', lineHeight: '1.6', color: '#374151' }}>
                {event.notes}
              </div>
            </div>
          )}

          {/* Shot List / Run Sheet — blank template */}
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#374151', marginBottom: '12px' }}>
              🎬 Shot List / Run Sheet
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={{ width: '60px', padding: '8px 12px', textAlign: 'left', fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>#</th>
                  <th style={{ width: '80px', padding: '8px 12px', textAlign: 'left', fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>Time</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>Shot / Activity</th>
                  <th style={{ width: '80px', padding: '8px 12px', textAlign: 'left', fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>Done</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                  <tr key={n} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px', color: '#9ca3af', fontSize: '13px' }}>{n}</td>
                    <td style={{ padding: '12px' }}></td>
                    <td style={{ padding: '12px' }}></td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>☐</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>
              Generated by FIT FOCUS MEDIA Portal · {new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>fitfocusmedia.com.au</div>
          </div>
        </div>
      </div>
    </div>
  )
}
