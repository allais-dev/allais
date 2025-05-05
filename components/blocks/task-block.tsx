"use client"

import { useState } from "react"
import { CheckSquare, Square, Plus, Trash2, GripVertical } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

interface Task {
  id: string
  text: string
  completed: boolean
}

interface TaskBlockProps {
  id: string
  tasks: Task[]
  onChange: (id: string, tasks: Task[]) => void
  onDelete: (id: string) => void
  onFocus: () => void
  dragHandleProps?: any
}

export function TaskBlock({ id, tasks: initialTasks, onChange, onDelete, onFocus, dragHandleProps }: TaskBlockProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks || [])

  const handleTaskChange = (taskId: string, text: string) => {
    const updatedTasks = tasks.map((task) => (task.id === taskId ? { ...task, text } : task))
    setTasks(updatedTasks)
    onChange(id, updatedTasks)
  }

  const handleTaskToggle = (taskId: string) => {
    const updatedTasks = tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task))
    setTasks(updatedTasks)
    onChange(id, updatedTasks)
  }

  const handleAddTask = () => {
    const newTask = { id: uuidv4(), text: "", completed: false }
    const updatedTasks = [...tasks, newTask]
    setTasks(updatedTasks)
    onChange(id, updatedTasks)
  }

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId)
    setTasks(updatedTasks)
    onChange(id, updatedTasks)
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
        <div className="mb-2 text-sm font-medium text-gray-300">Tasks</div>
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center group/task">
              <button
                onClick={() => handleTaskToggle(task.id)}
                className="mr-2 flex-shrink-0 text-gray-400 hover:text-white"
              >
                {task.completed ? <CheckSquare className="h-4 w-4 text-indigo-400" /> : <Square className="h-4 w-4" />}
              </button>
              <input
                type="text"
                value={task.text}
                onChange={(e) => handleTaskChange(task.id, e.target.value)}
                placeholder="Task description"
                className={`flex-1 bg-transparent text-sm outline-none ${
                  task.completed ? "line-through text-gray-500" : "text-white"
                }`}
              />
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="ml-2 hidden rounded p-1 text-gray-500 hover:bg-[#333] hover:text-white group-hover/task:block"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between">
          <button
            onClick={handleAddTask}
            className="flex items-center rounded-md px-2 py-1 text-xs text-gray-400 hover:bg-[#333] hover:text-white"
          >
            <Plus className="mr-1 h-3 w-3" />
            Add task
          </button>
          <button
            onClick={() => onDelete(id)}
            className="hidden rounded-md px-2 py-1 text-xs text-gray-400 hover:bg-[#333] hover:text-red-400 group-hover:block"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
