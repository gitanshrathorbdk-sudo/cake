'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Playlist } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { User } from 'lucide-react';

interface MakePublicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playlist: Playlist | null;
  onConfirm: (playlist: Playlist, ownerName: string) => void;
}

export function MakePublicDialog({ open, onOpenChange, playlist, onConfirm }: MakePublicDialogProps) {
  const [ownerName, setOwnerName] = React.useState('');
  const { toast } = useToast();
  
  React.useEffect(() => {
    if (playlist) {
      setOwnerName(playlist.ownerName || '');
    }
  }, [playlist]);

  const handleSubmit = () => {
    if (!ownerName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Owner Name Required',
        description: 'Please enter a name for the owner of this public playlist.',
      });
      return;
    }
    if (playlist) {
      onConfirm(playlist, ownerName);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Make Playlist Public</DialogTitle>
          <DialogDescription>
            Public playlists are visible to everyone. Please provide an owner's name for this playlist.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
            <Label htmlFor="owner-name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Owner Name
            </Label>
            <Input
            id="owner-name"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder="Your Name"
            />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Confirm and Make Public</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
