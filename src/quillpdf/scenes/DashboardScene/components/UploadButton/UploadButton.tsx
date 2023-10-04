'use client';

import { useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { UploadDropzone } from '..';

export type UploadButtonProps = {
  isSubscribed: boolean;
};

const UploadButton: React.FC<UploadButtonProps> = ({ isSubscribed }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <Dialog open={isOpen} onOpenChange={v => !v && setIsOpen(v)}>
      <DialogTrigger onClick={() => setIsOpen(true)} asChild>
        <Button>Upload PDF</Button>
      </DialogTrigger>

      <DialogContent>
        <UploadDropzone isSubscribed />
      </DialogContent>
    </Dialog>
  );
};

export default UploadButton;
