'use client';

import { useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/shared/components/ui/dialog';

export type UploadButtonProps = {};

const UploadButton: React.FC<UploadButtonProps> = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <Dialog open={isOpen} onOpenChange={v => !v && setIsOpen(v)}>
      <DialogTrigger onClick={() => setIsOpen(true)} asChild>
        <Button>Upload PDF</Button>
      </DialogTrigger>

      <DialogContent>
        <>Some text Pro Plus</>
      </DialogContent>
    </Dialog>
  );
};

export default UploadButton;
