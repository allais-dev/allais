import { User } from "lucide-react"

interface UserAvatarProps {
  className?: string
}

export function UserAvatar({ className = "" }: UserAvatarProps) {
  return (
    <div
      className={`h-8 w-8 rounded-md overflow-hidden flex items-center justify-center ${className}`}
      style={{
        background: "#0f0f10",
        border: "1px solid #333333",
      }}
    >
      <User className="h-5 w-5 text-gray-400" />
    </div>
  )
}
