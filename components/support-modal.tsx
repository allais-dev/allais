"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { submitSupportMessage } from "@/app/actions/support-actions"
import { useToast } from "@/components/ui/use-toast"

interface SupportModalProps {
  isOpen: boolean
  onClose: () => void
  userEmail?: string
  userName?: string
}

export function SupportModal({ isOpen, onClose, userEmail = "", userName = "" }: SupportModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)

    try {
      const result = await submitSupportMessage(formData)

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        onClose()
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-[#0f0f10] border-[#333] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Contact Support</DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={userName}
                required
                className="bg-[#1a1a1a] border-[#333] focus:border-gray-500 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={userEmail}
                required
                className="bg-[#1a1a1a] border-[#333] focus:border-gray-500 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              name="subject"
              required
              className="bg-[#1a1a1a] border-[#333] focus:border-gray-500 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              name="message"
              required
              rows={5}
              className="bg-[#1a1a1a] border-[#333] focus:border-gray-500 text-white resize-none"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-[#333] bg-transparent hover:bg-[#1a1a1a] text-white"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
