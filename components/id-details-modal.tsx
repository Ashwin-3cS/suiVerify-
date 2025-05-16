"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Calendar, User, Globe, Key } from "lucide-react"
import type { VerifiedId } from "@/lib/types"

interface IdDetailsModalProps {
  id: VerifiedId
  isOpen: boolean
  onClose: () => void
}

export function IdDetailsModal({ id, isOpen, onClose }: IdDetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <div className="bg-slate-100 p-2 rounded-lg mr-3">{id.icon}</div>
            {id.type}
          </DialogTitle>
          <DialogDescription>
            {id.status === "Verified" ? (
              <Badge className="bg-green-600 mt-2">
                <CheckCircle className="h-3 w-3 mr-1" /> Verified
              </Badge>
            ) : (
              <Badge variant="outline" className="text-amber-600 border-amber-600 mt-2">
                Pending
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-muted-foreground mr-3" />
            <div>
              <p className="text-sm font-medium">Issue Date</p>
              <p className="text-sm text-muted-foreground">{id.issueDate}</p>
            </div>
          </div>

          <div className="flex items-center">
            <User className="h-5 w-5 text-muted-foreground mr-3" />
            <div>
              <p className="text-sm font-medium">Issued By</p>
              <p className="text-sm text-muted-foreground">{id.issuedBy}</p>
            </div>
          </div>

          <div className="flex items-center">
            <Globe className="h-5 w-5 text-muted-foreground mr-3" />
            <div>
              <p className="text-sm font-medium">ID Scope</p>
              <p className="text-sm text-muted-foreground">{id.scope}</p>
            </div>
          </div>

          <div className="flex items-center">
            <Key className="h-5 w-5 text-muted-foreground mr-3" />
            <div>
              <p className="text-sm font-medium">Token ID</p>
              <p className="text-sm text-muted-foreground break-all">{id.tokenId}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
