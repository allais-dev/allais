"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Trash2, GripVertical } from "lucide-react"

interface CalendarEvent {
  id: string
  title: string
  date: string
  color?: string
}

interface CalendarBlockProps {
  id: string
  events: CalendarEvent[]
  onChange: (id: string, events: CalendarEvent[]) => void
  onDelete: (id: string) => void
  onFocus: () => void
  dragHandleProps?: any
}

export function CalendarBlock({
  id,
  events: initialEvents,
  onChange,
  onDelete,
  onFocus,
  dragHandleProps,
}: CalendarBlockProps) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents || [])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showEventForm, setShowEventForm] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: "", date: "" })

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleAddEvent = () => {
    if (newEvent.title.trim() && newEvent.date) {
      const newEventObj = {
        id: Math.random().toString(36).substring(2, 9),
        title: newEvent.title,
        date: newEvent.date,
        color: getRandomColor(),
      }
      const updatedEvents = [...events, newEventObj]
      setEvents(updatedEvents)
      onChange(id, updatedEvents)
      setNewEvent({ title: "", date: "" })
      setShowEventForm(false)
    }
  }

  const handleDeleteEvent = (eventId: string) => {
    const updatedEvents = events.filter((event) => event.id !== eventId)
    setEvents(updatedEvents)
    onChange(id, updatedEvents)
  }

  const getRandomColor = () => {
    const colors = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const renderCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)

    const monthName = currentDate.toLocaleString("default", { month: "long" })

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const dayEvents = events.filter((event) => event.date === date)

      days.push(
        <div
          key={day}
          className={`relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-xs hover:bg-[#333] ${
            dayEvents.length > 0 ? "font-bold" : ""
          }`}
          onClick={() => {
            setNewEvent({ ...newEvent, date })
            setShowEventForm(true)
          }}
        >
          {day}
          {dayEvents.length > 0 && (
            <div
              className="absolute bottom-1 h-1 w-1 rounded-full"
              style={{ backgroundColor: dayEvents[0].color }}
            ></div>
          )}
        </div>,
      )
    }

    return (
      <div className="mt-2">
        <div className="mb-2 flex items-center justify-between">
          <button onClick={handlePrevMonth} className="rounded-md p-1 text-gray-400 hover:bg-[#333] hover:text-white">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="text-sm font-medium">
            {monthName} {year}
          </div>
          <button onClick={handleNextMonth} className="rounded-md p-1 text-gray-400 hover:bg-[#333] hover:text-white">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400">
          <div>Su</div>
          <div>Mo</div>
          <div>Tu</div>
          <div>We</div>
          <div>Th</div>
          <div>Fr</div>
          <div>Sa</div>
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">{days}</div>
      </div>
    )
  }

  return (
    <div className="group relative mb-4 flex items-start" onFocus={onFocus}>
      <div
        className="flex-shrink-0 px-1 py-2 opacity-0 group-hover:opacity-100 cursor-grab transition-opacity"
        {...dragHandleProps}
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>
      <div className="flex-grow rounded-md bg-[#1a1a1a] p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-medium text-gray-300">Calendar</div>
          <button
            onClick={() => onDelete(id)}
            className="hidden rounded-md p-1 text-gray-400 hover:bg-[#333] hover:text-red-400 group-hover:block"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {renderCalendar()}

        {showEventForm ? (
          <div className="mt-3 rounded-md bg-[#0f0f10] p-2">
            <input
              type="text"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              placeholder="Event title"
              className="mb-2 w-full rounded-md bg-[#1a1a1a] p-2 text-sm text-white outline-none"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowEventForm(false)}
                className="rounded-md px-2 py-1 text-xs text-gray-400 hover:bg-[#333] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                className="rounded-md bg-indigo-600 px-2 py-1 text-xs text-white hover:bg-indigo-700"
                disabled={!newEvent.title.trim() || !newEvent.date}
              >
                Add Event
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-3">
            <div className="mb-2 text-xs font-medium text-gray-400">Events</div>
            {events.length > 0 ? (
              <div className="space-y-1">
                {events.map((event) => (
                  <div key={event.id} className="flex items-center justify-between rounded-md bg-[#0f0f10] p-2">
                    <div className="flex items-center">
                      <div className="mr-2 h-2 w-2 rounded-full" style={{ backgroundColor: event.color }}></div>
                      <span className="text-xs text-white">{event.title}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2 text-xs text-gray-400">{new Date(event.date).toLocaleDateString()}</span>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="rounded p-1 text-gray-500 hover:bg-[#333] hover:text-white"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-md bg-[#0f0f10] p-2 text-center text-xs text-gray-500">
                No events. Click on a date to add one.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
