import * as React from "react"
import { Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface InfoModalProps {
  title: string
  description: string
  children?: React.ReactNode
  variant?: "default" | "small"
}

export function InfoModal({ title, description, children, variant = "default" }: InfoModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size={variant === "small" ? "sm" : "default"}
          className="p-1 h-auto"
        >
          <Info className={variant === "small" ? "h-3 w-3" : "h-4 w-4"} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        {children && (
          <div className="mt-4">
            {children}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}