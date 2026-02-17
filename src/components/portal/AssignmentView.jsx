import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useDraggable, useDroppable } from '@dnd-kit/core'

// Draggable item component
function DraggableItem({ id, children, data }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data,
  })
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50' : ''}`}
    >
      {children}
    </div>
  )
}

// Droppable event card
function DroppableEvent({ event, children, isOver }) {
  const { setNodeRef } = useDroppable({
    id: `event-${event.id}`,
    data: { event },
  })

  return (
    <div
      ref={setNodeRef}
      className={`bg-gray-800/50 rounded-xl border-2 transition-all ${
        isOver 
          ? 'border-orange-500 bg-orange-500/10' 
          : 'border-gray-700/50'
      }`}
    >
      {children}
    </div>
  )
}

export default function AssignmentView({ 
  events, 
  crewMembers, 
  equipment, 
  onAssignCrew,
  onUnassignCrew,
  onAssignEquipment,
  onUnassignEquipment 
}) {
  const [activeId, setActiveId] = useState(null)
  const [activeData, setActiveData] = useState(null)
  const [overId, setOverId] = useState(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor)
  )

  // Filter to upcoming events only
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const upcomingEvents = events
    .filter(e => new Date(e.date) >= now && e.status !== 'cancelled' && e.status !== 'completed')
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  function handleDragStart(event) {
    setActiveId(event.active.id)
    setActiveData(event.active.data.current)
  }

  function handleDragOver(event) {
    setOverId(event.over?.id || null)
  }

  function handleDragEnd(event) {
    const { active, over } = event
    
    if (over && over.id.toString().startsWith('event-')) {
      const eventId = over.id.toString().replace('event-', '')
      const targetEvent = events.find(e => e.id === eventId)
      
      if (targetEvent && active.data.current) {
        const { type, item } = active.data.current
        
        if (type === 'crew') {
          onAssignCrew(targetEvent, item)
        } else if (type === 'equipment') {
          onAssignEquipment(targetEvent, item)
        }
      }
    }
    
    setActiveId(null)
    setActiveData(null)
    setOverId(null)
  }

  function handleDragCancel() {
    setActiveId(null)
    setActiveData(null)
    setOverId(null)
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  // Get unassigned crew and equipment
  const assignedCrewIds = new Set(upcomingEvents.flatMap(e => e.crew_ids || []))
  const assignedEquipIds = new Set(upcomingEvents.flatMap(e => e.equipment_ids || []))

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Events Column */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            📅 Upcoming Events
            <span className="text-sm font-normal text-gray-400">Drop crew & equipment here</span>
          </h3>
          
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {upcomingEvents.map(event => {
              const isOver = overId === `event-${event.id}`
              const eventCrew = crewMembers.filter(c => (event.crew_ids || []).includes(c.id))
              const eventEquip = equipment.filter(e => (event.equipment_ids || []).includes(e.id))
              
              return (
                <DroppableEvent key={event.id} event={event} isOver={isOver}>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-white">{event.name}</h4>
                        <p className="text-orange-500 text-sm">{event.client}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">{formatDate(event.date)}</div>
                        <div className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${
                          event.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                          event.status === 'tentative' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {event.status}
                        </div>
                      </div>
                    </div>
                    
                    {/* Assigned Crew */}
                    <div className="mb-2">
                      <div className="text-xs text-gray-500 mb-1">👥 Crew ({eventCrew.length})</div>
                      <div className="flex flex-wrap gap-1">
                        {eventCrew.length === 0 ? (
                          <span className="text-xs text-gray-600 italic">No crew assigned</span>
                        ) : (
                          eventCrew.map(crew => (
                            <span 
                              key={crew.id} 
                              className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded flex items-center gap-1 group"
                            >
                              {crew.name}
                              <button 
                                onClick={() => onUnassignCrew(event, crew)}
                                className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition"
                              >
                                ×
                              </button>
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                    
                    {/* Assigned Equipment */}
                    <div>
                      <div className="text-xs text-gray-500 mb-1">📷 Equipment ({eventEquip.length})</div>
                      <div className="flex flex-wrap gap-1">
                        {eventEquip.length === 0 ? (
                          <span className="text-xs text-gray-600 italic">No equipment assigned</span>
                        ) : (
                          eventEquip.map(eq => (
                            <span 
                              key={eq.id} 
                              className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded flex items-center gap-1 group"
                            >
                              {eq.name}
                              <button 
                                onClick={() => onUnassignEquipment(event, eq)}
                                className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition"
                              >
                                ×
                              </button>
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </DroppableEvent>
              )
            })}
            
            {upcomingEvents.length === 0 && (
              <div className="text-center text-gray-500 py-12">
                No upcoming events to assign
              </div>
            )}
          </div>
        </div>
        
        {/* Crew & Equipment Pools */}
        <div className="space-y-4">
          {/* Crew Pool */}
          <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 p-4">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              👥 Crew Pool
            </h3>
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {crewMembers.map(crew => (
                <DraggableItem 
                  key={crew.id} 
                  id={`crew-${crew.id}`}
                  data={{ type: 'crew', item: crew }}
                >
                  <div className="p-2 bg-gray-700/50 rounded-lg border border-gray-600/50 hover:border-green-500/50 transition">
                    <div className="font-medium text-white text-sm">{crew.name}</div>
                    <div className="text-xs text-gray-400">{crew.role || 'No role'}</div>
                  </div>
                </DraggableItem>
              ))}
              {crewMembers.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No crew members</p>
              )}
            </div>
          </div>
          
          {/* Equipment Pool */}
          <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 p-4">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              📷 Equipment Pool
            </h3>
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {equipment.map(eq => (
                <DraggableItem 
                  key={eq.id} 
                  id={`equip-${eq.id}`}
                  data={{ type: 'equipment', item: eq }}
                >
                  <div className="p-2 bg-gray-700/50 rounded-lg border border-gray-600/50 hover:border-blue-500/50 transition">
                    <div className="font-medium text-white text-sm">{eq.name}</div>
                    <div className="text-xs text-gray-400">{eq.category} × {eq.quantity}</div>
                  </div>
                </DraggableItem>
              ))}
              {equipment.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No equipment</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Drag Overlay */}
      <DragOverlay>
        {activeId && activeData && (
          <div className={`p-2 rounded-lg border shadow-xl ${
            activeData.type === 'crew' 
              ? 'bg-green-600 border-green-500' 
              : 'bg-blue-600 border-blue-500'
          }`}>
            <div className="font-medium text-white text-sm">{activeData.item.name}</div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
