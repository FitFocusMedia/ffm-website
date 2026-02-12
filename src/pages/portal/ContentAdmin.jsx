import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function ContentAdmin() {
  const [organizations, setOrganizations] = useState([])
  const [selectedOrg, setSelectedOrg] = useState(null)
  const [orgEvents, setOrgEvents] = useState([])
  const [orgPackages, setOrgPackages] = useState([])
  const [divisionCategories, setDivisionCategories] = useState([])
  const [divisionSubdivisions, setDivisionSubdivisions] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Sub-tab within org view
  const [orgTab, setOrgTab] = useState('events')
  
  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState(null)
  const [editItem, setEditItem] = useState(null)
  const [formData, setFormData] = useState({})
  
  // Division management
  const [selectedEventForDivisions, setSelectedEventForDivisions] = useState(null)
  const [expandedCategories, setExpandedCategories] = useState([])

  useEffect(() => {
    loadOrganizations()
  }, [])

  useEffect(() => {
    if (selectedOrg) {
      loadOrgData(selectedOrg.id)
    }
  }, [selectedOrg])

  async function loadOrganizations() {
    setLoading(true)
    const { data } = await supabase.from('organizations').select('*').order('name')
    setOrganizations(data || [])
    setLoading(false)
  }

  async function loadOrgData(orgId) {
    const [eventsRes, packagesRes, ordersRes] = await Promise.all([
      supabase.from('events').select('*').eq('organization_id', orgId).order('date', { ascending: true }),
      supabase.from('packages').select('*').eq('organization_id', orgId).order('sort_order'),
      supabase.from('content_orders').select('*, events(name), packages(name)').eq('organization_id', orgId).order('created_at', { ascending: false }).limit(50)
    ])
    
    setOrgEvents(eventsRes.data || [])
    setOrgPackages(packagesRes.data || [])
    setOrders(ordersRes.data || [])
    
    // Load divisions for all events
    const eventIds = (eventsRes.data || []).map(e => e.id)
    if (eventIds.length > 0) {
      const [catsRes, subsRes] = await Promise.all([
        supabase.from('division_categories').select('*').in('event_id', eventIds).order('sort_order'),
        supabase.from('division_subdivisions').select('*').order('sort_order')
      ])
      setDivisionCategories(catsRes.data || [])
      
      // Filter subs to only those belonging to our categories
      const catIds = (catsRes.data || []).map(c => c.id)
      setDivisionSubdivisions((subsRes.data || []).filter(s => catIds.includes(s.category_id)))
    } else {
      setDivisionCategories([])
      setDivisionSubdivisions([])
    }
  }

  function getCategoriesForEvent(eventId) {
    return divisionCategories.filter(c => c.event_id === eventId)
  }

  function getSubdivisionsForCategory(categoryId) {
    return divisionSubdivisions.filter(s => s.category_id === categoryId)
  }

  function openModal(type, item = null, parentId = null) {
    setModalType(type)
    setEditItem(item)
    
    if (type === 'org') {
      setFormData(item || { name: '', slug: '', description: '', logo_url: '', active: true })
    } else if (type === 'event') {
      setFormData(item || { organization_id: selectedOrg?.id, name: '', date: '', location: '', status: 'upcoming', active: true })
    } else if (type === 'package') {
      setFormData(item || { organization_id: selectedOrg?.id, name: '', description: '', price: '', sort_order: 0, active: true })
    } else if (type === 'division-cat') {
      setFormData(item || { event_id: parentId || selectedEventForDivisions, name: '', sort_order: 0, active: true })
    } else if (type === 'division-sub') {
      setFormData(item || { category_id: parentId, name: '', sort_order: 0, active: true })
    }
    
    setShowModal(true)
  }

  async function saveItem() {
    try {
      if (modalType === 'org') {
        if (editItem?.id) {
          await supabase.from('organizations').update(formData).eq('id', editItem.id)
        } else {
          await supabase.from('organizations').insert(formData)
        }
        loadOrganizations()
      } else if (modalType === 'event') {
        const data = { ...formData, organization_id: selectedOrg.id }
        if (editItem?.id) {
          await supabase.from('events').update(data).eq('id', editItem.id)
        } else {
          await supabase.from('events').insert(data)
        }
        loadOrgData(selectedOrg.id)
      } else if (modalType === 'package') {
        const data = { ...formData, organization_id: selectedOrg.id, price: parseFloat(formData.price) }
        if (editItem?.id) {
          await supabase.from('packages').update(data).eq('id', editItem.id)
        } else {
          await supabase.from('packages').insert(data)
        }
        loadOrgData(selectedOrg.id)
      } else if (modalType === 'division-cat') {
        if (editItem?.id) {
          await supabase.from('division_categories').update(formData).eq('id', editItem.id)
        } else {
          await supabase.from('division_categories').insert(formData)
        }
        loadOrgData(selectedOrg.id)
      } else if (modalType === 'division-sub') {
        if (editItem?.id) {
          await supabase.from('division_subdivisions').update(formData).eq('id', editItem.id)
        } else {
          await supabase.from('division_subdivisions').insert(formData)
        }
        loadOrgData(selectedOrg.id)
      }
      
      setShowModal(false)
    } catch (err) {
      console.error('Save error:', err)
      alert('Error saving. Check console.')
    }
  }

  async function deleteItem(table, id) {
    if (!confirm('Are you sure you want to delete this item?')) return
    await supabase.from(table).delete().eq('id', id)
    if (table === 'organizations') {
      loadOrganizations()
      if (selectedOrg?.id === id) setSelectedOrg(null)
    } else {
      loadOrgData(selectedOrg.id)
    }
  }

  async function toggleActive(table, id, currentActive) {
    await supabase.from(table).update({ active: !currentActive }).eq('id', id)
    if (table === 'organizations') {
      loadOrganizations()
    } else {
      loadOrgData(selectedOrg.id)
    }
  }

  if (loading) {
    return <div className="p-8 text-gray-400">Loading...</div>
  }

  // ==================== ORGANIZATION LIST VIEW ====================
  if (!selectedOrg) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Content Management</h1>
            <p className="text-gray-400 text-sm mt-1">Select an organization to manage its events, packages, and divisions</p>
          </div>
          <button 
            onClick={() => openModal('org')}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium"
          >
            + Add Organization
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {organizations.map(org => (
            <div
              key={org.id}
              onClick={() => setSelectedOrg(org)}
              className="bg-gray-900/50 rounded-xl border border-gray-800 p-6 cursor-pointer hover:border-red-500/50 hover:bg-gray-900/80 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {org.logo_url ? (
                    <img src={org.logo_url} alt={org.name} className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-xl font-bold">
                      {org.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-red-400 transition-colors">{org.name}</h3>
                    <p className="text-xs text-gray-500">/{org.slug}</p>
                  </div>
                </div>
                {!org.active && (
                  <span className="text-xs bg-gray-700 px-2 py-1 rounded">Inactive</span>
                )}
              </div>
              {org.description && (
                <p className="text-sm text-gray-400 line-clamp-2">{org.description}</p>
              )}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); openModal('org', org) }}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleActive('organizations', org.id, org.active) }}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  {org.active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for adding/editing org */}
        {showModal && renderModal()}
      </div>
    )
  }

  // ==================== ORGANIZATION DETAIL VIEW ====================
  return (
    <div className="p-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setSelectedOrg(null)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← Back
        </button>
        <div className="flex items-center gap-3">
          {selectedOrg.logo_url ? (
            <img src={selectedOrg.logo_url} alt={selectedOrg.name} className="w-10 h-10 rounded-lg object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-lg font-bold">
              {selectedOrg.name.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{selectedOrg.name}</h1>
            <p className="text-xs text-gray-500">/{selectedOrg.slug}</p>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-700 pb-2">
        {['events', 'packages', 'divisions', 'orders'].map(tab => (
          <button
            key={tab}
            onClick={() => setOrgTab(tab)}
            className={`px-4 py-2 rounded-t-lg capitalize transition-colors ${
              orgTab === tab 
                ? 'bg-red-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab} {tab === 'events' && `(${orgEvents.length})`}
            {tab === 'packages' && `(${orgPackages.length})`}
            {tab === 'orders' && `(${orders.length})`}
          </button>
        ))}
      </div>

      {/* EVENTS TAB */}
      {orgTab === 'events' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Upcoming Events</h2>
            <button 
              onClick={() => openModal('event')}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm"
            >
              + Add Event
            </button>
          </div>
          
          {orgEvents.length === 0 ? (
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-8 text-center text-gray-400">
              No events yet. Add one to get started.
            </div>
          ) : (
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="text-left p-3">Event Name</th>
                    <th className="text-left p-3">Date</th>
                    <th className="text-left p-3">Location</th>
                    <th className="text-center p-3">Status</th>
                    <th className="text-center p-3">Active</th>
                    <th className="text-right p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orgEvents.map(event => (
                    <tr key={event.id} className="border-t border-gray-800">
                      <td className="p-3 font-medium">{event.name}</td>
                      <td className="p-3 text-gray-400">
                        {event.date && new Date(event.date).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-3 text-gray-400">{event.location}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          event.status === 'upcoming' ? 'bg-blue-600' :
                          event.status === 'active' ? 'bg-green-600' : 'bg-gray-600'
                        }`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => toggleActive('events', event.id, event.active)}
                          className={`px-2 py-1 rounded text-xs ${event.active ? 'bg-green-600' : 'bg-gray-600'}`}
                        >
                          {event.active ? 'Yes' : 'No'}
                        </button>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button onClick={() => openModal('event', event)} className="text-blue-400 hover:text-blue-300">Edit</button>
                        <button onClick={() => deleteItem('events', event.id)} className="text-red-400 hover:text-red-300">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PACKAGES TAB */}
      {orgTab === 'packages' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Content Packages</h2>
            <button 
              onClick={() => openModal('package')}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm"
            >
              + Add Package
            </button>
          </div>
          
          {orgPackages.length === 0 ? (
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-8 text-center text-gray-400">
              No packages yet. Add one to get started.
            </div>
          ) : (
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="text-left p-3">Package Name</th>
                    <th className="text-left p-3">Description</th>
                    <th className="text-right p-3">Price</th>
                    <th className="text-center p-3">Active</th>
                    <th className="text-right p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orgPackages.map(pkg => (
                    <tr key={pkg.id} className="border-t border-gray-800">
                      <td className="p-3 font-medium">{pkg.name}</td>
                      <td className="p-3 text-gray-400 truncate max-w-xs">{pkg.description}</td>
                      <td className="p-3 text-right font-semibold text-green-400">${pkg.price}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => toggleActive('packages', pkg.id, pkg.active)}
                          className={`px-2 py-1 rounded text-xs ${pkg.active ? 'bg-green-600' : 'bg-gray-600'}`}
                        >
                          {pkg.active ? 'Yes' : 'No'}
                        </button>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button onClick={() => openModal('package', pkg)} className="text-blue-400 hover:text-blue-300">Edit</button>
                        <button onClick={() => deleteItem('packages', pkg.id)} className="text-red-400 hover:text-red-300">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* DIVISIONS TAB */}
      {orgTab === 'divisions' && (
        <div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Divisions by Event</h2>
            <p className="text-sm text-gray-400 mb-4">Select an event to manage its division categories and subdivisions</p>
            
            {orgEvents.length === 0 ? (
              <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-8 text-center text-gray-400">
                Add events first, then you can manage their divisions.
              </div>
            ) : (
              <>
                <select
                  value={selectedEventForDivisions || ''}
                  onChange={e => setSelectedEventForDivisions(e.target.value)}
                  className="w-full max-w-md px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg"
                >
                  <option value="">Select an event...</option>
                  {orgEvents.map(event => (
                    <option key={event.id} value={event.id}>
                      {event.name} ({event.date && new Date(event.date).toLocaleDateString('en-AU')})
                    </option>
                  ))}
                </select>
                
                {selectedEventForDivisions && (
                  <div className="mt-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">
                        Division Categories ({getCategoriesForEvent(selectedEventForDivisions).length})
                      </h3>
                      <button 
                        onClick={() => openModal('division-cat', null, selectedEventForDivisions)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm"
                      >
                        + Add Category
                      </button>
                    </div>
                    
                    {getCategoriesForEvent(selectedEventForDivisions).length === 0 ? (
                      <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-8 text-center text-gray-400">
                        No division categories for this event yet.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {getCategoriesForEvent(selectedEventForDivisions).map(category => (
                          <div key={category.id} className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
                            <div className="p-4 flex justify-between items-center bg-gray-800/50">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => setExpandedCategories(prev => 
                                    prev.includes(category.id) 
                                      ? prev.filter(id => id !== category.id)
                                      : [...prev, category.id]
                                  )}
                                  className="text-gray-400 hover:text-white"
                                >
                                  <svg 
                                    className={`w-5 h-5 transition-transform ${expandedCategories.includes(category.id) ? 'rotate-90' : ''}`}
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </button>
                                <span className="font-semibold">{category.name}</span>
                                <span className="text-xs text-gray-400">
                                  ({getSubdivisionsForCategory(category.id).length} subdivisions)
                                </span>
                                {!category.active && (
                                  <span className="text-xs bg-gray-600 px-2 py-0.5 rounded">Inactive</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button onClick={() => openModal('division-cat', category)} className="text-blue-400 hover:text-blue-300 text-sm">Edit</button>
                                <button onClick={() => deleteItem('division_categories', category.id)} className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                              </div>
                            </div>
                            
                            {expandedCategories.includes(category.id) && (
                              <div className="p-4 border-t border-gray-700">
                                <div className="flex justify-between items-center mb-3">
                                  <span className="text-sm text-gray-400">Subdivisions:</span>
                                  <button
                                    onClick={() => openModal('division-sub', null, category.id)}
                                    className="text-sm text-green-400 hover:text-green-300"
                                  >
                                    + Add Subdivision
                                  </button>
                                </div>
                                
                                {getSubdivisionsForCategory(category.id).length === 0 ? (
                                  <p className="text-sm text-gray-500 italic">No subdivisions yet</p>
                                ) : (
                                  <div className="flex flex-wrap gap-2">
                                    {getSubdivisionsForCategory(category.id).map(sub => (
                                      <div 
                                        key={sub.id}
                                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm ${
                                          sub.active 
                                            ? 'bg-gray-800 border-gray-600' 
                                            : 'bg-gray-900 border-gray-700 opacity-50'
                                        }`}
                                      >
                                        <span>{sub.name}</span>
                                        <button onClick={() => openModal('division-sub', sub, category.id)} className="text-blue-400 hover:text-blue-300">✎</button>
                                        <button onClick={() => deleteItem('division_subdivisions', sub.id)} className="text-red-400 hover:text-red-300">×</button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Quick Add for NBA */}
                    {selectedOrg.slug === 'nba' && (
                      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800 rounded-xl">
                        <h4 className="font-semibold text-blue-400 mb-2">Quick Add: Standard NBA Divisions</h4>
                        <p className="text-sm text-gray-400 mb-3">Add all standard NBA bodybuilding divisions for this event</p>
                        <button
                          onClick={async (e) => {
                            const btn = e.target
                            const originalText = btn.innerText
                            
                            if (!selectedEventForDivisions) {
                              alert('Please select an event first')
                              return
                            }
                            
                            if (!window.confirm('Add all standard NBA divisions to this event?')) return
                            
                            btn.disabled = true
                            btn.innerText = 'Adding divisions...'
                            
                            try {
                              const standardDivisions = {
                                "Men's Physique": ["Novice", "Open", "Masters 40+", "Masters 50+", "Junior"],
                                "Classic Physique": ["Novice", "Open", "Masters 40+", "Masters 50+"],
                                "Bodybuilding": ["Novice", "Open", "Masters 40+", "Masters 50+", "Junior"],
                                "Figure": ["Novice", "Open", "Masters 35+", "Masters 45+", "Junior"],
                                "Bikini": ["Novice", "Open", "Masters 35+", "Masters 45+", "Junior"],
                                "Wellness": ["Novice", "Open", "Masters 35+", "Masters 45+"],
                                "Fitness Model": ["Open", "Masters"],
                                "Sports Model": ["Open", "Masters"],
                                "Transformation": ["Open"]
                              }
                              
                              let sortOrder = 0
                              let addedCount = 0
                              
                              for (const [catName, subs] of Object.entries(standardDivisions)) {
                                const { data: cat, error: catError } = await supabase.from('division_categories').insert({
                                  event_id: selectedEventForDivisions,
                                  name: catName,
                                  sort_order: sortOrder++,
                                  active: true
                                }).select().single()
                                
                                if (catError) {
                                  console.error('Error adding category:', catName, catError)
                                  continue
                                }
                                
                                if (cat) {
                                  addedCount++
                                  let subOrder = 0
                                  for (const subName of subs) {
                                    const { error: subError } = await supabase.from('division_subdivisions').insert({
                                      category_id: cat.id,
                                      name: subName,
                                      sort_order: subOrder++,
                                      active: true
                                    })
                                    if (subError) console.error('Error adding subdivision:', subName, subError)
                                  }
                                }
                              }
                              
                              alert(`Added ${addedCount} division categories with subdivisions!`)
                              await loadOrgData(selectedOrg.id)
                            } catch (err) {
                              console.error('Error adding divisions:', err)
                              alert('Error adding divisions: ' + err.message)
                            } finally {
                              btn.disabled = false
                              btn.innerText = originalText
                            }
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm disabled:opacity-50"
                        >
                          Add Standard NBA Divisions
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ORDERS TAB */}
      {orgTab === 'orders' && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-800">
                <tr>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Athlete</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Event</th>
                  <th className="text-left p-3">Package</th>
                  <th className="text-right p-3">Amount</th>
                  <th className="text-center p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-400">No orders yet</td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id} className="border-t border-gray-800">
                      <td className="p-3 text-gray-400">{new Date(order.created_at).toLocaleDateString('en-AU')}</td>
                      <td className="p-3 font-medium">{order.first_name} {order.last_name}</td>
                      <td className="p-3 text-gray-400">{order.email}</td>
                      <td className="p-3 text-gray-400">{order.events?.name}</td>
                      <td className="p-3 text-gray-400">{order.packages?.name}</td>
                      <td className="p-3 text-right font-semibold">${order.amount}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          order.status === 'paid' ? 'bg-green-600' :
                          order.status === 'delivered' ? 'bg-blue-600' :
                          order.status === 'pending' ? 'bg-yellow-600' : 'bg-gray-600'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && renderModal()}
    </div>
  )

  function renderModal() {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">
            {editItem ? 'Edit' : 'Add'} {
              modalType === 'org' ? 'Organization' : 
              modalType === 'event' ? 'Event' : 
              modalType === 'package' ? 'Package' :
              modalType === 'division-cat' ? 'Division Category' :
              modalType === 'division-sub' ? 'Subdivision' : ''
            }
          </h3>
          
          <div className="space-y-4">
            {modalType === 'org' && (
              <>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Slug (URL-friendly)</label>
                  <input
                    type="text"
                    value={formData.slug || ''}
                    onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Logo URL</label>
                  <input
                    type="text"
                    value={formData.logo_url || ''}
                    onChange={e => setFormData({ ...formData, logo_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                    rows={3}
                  />
                </div>
              </>
            )}

            {modalType === 'event' && (
              <>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Event Name</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Date</label>
                    <input
                      type="date"
                      value={formData.date || ''}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Location</label>
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Status</label>
                  <select
                    value={formData.status || 'upcoming'}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </>
            )}

            {modalType === 'package' && (
              <>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Package Name</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <input
                    type="text"
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Price (AUD)</label>
                    <input
                      type="number"
                      value={formData.price || ''}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Sort Order</label>
                    <input
                      type="number"
                      value={formData.sort_order || 0}
                      onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                    />
                  </div>
                </div>
              </>
            )}

            {modalType === 'division-cat' && (
              <>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Category Name</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Men's Physique, Bikini, Figure"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sort_order || 0}
                    onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                  />
                </div>
              </>
            )}

            {modalType === 'division-sub' && (
              <>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Subdivision Name</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Novice, Open, Masters 40+"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sort_order || 0}
                    onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                  />
                </div>
              </>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active ?? true}
                onChange={e => setFormData({ ...formData, active: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="active" className="text-sm text-gray-400">Active</label>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowModal(false)}
              className="flex-1 py-2 border border-gray-600 rounded-lg hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={saveItem}
              className="flex-1 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    )
  }
}
