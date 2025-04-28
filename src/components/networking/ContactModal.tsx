
import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Mail, Phone, User } from 'lucide-react'

interface ContactModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contactInfo: {
    name: string
    email: string
    phone?: string
  }
}

export const ContactModal = ({ open, onOpenChange, contactInfo }: ContactModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Informações de Contato</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <span>{contactInfo.name}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <a href={`mailto:${contactInfo.email}`} className="text-primary hover:underline">
              {contactInfo.email}
            </a>
          </div>
          
          {contactInfo.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <a href={`tel:${contactInfo.phone}`} className="text-primary hover:underline">
                {contactInfo.phone}
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
