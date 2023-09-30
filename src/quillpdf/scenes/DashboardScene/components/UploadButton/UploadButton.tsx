'use client';

import { Button, Dialog, DialogTrigger } from '@/shared/components';
import { useState } from 'react';

export type UploadButtonProps = {};

const UploadButton: React.FC<UploadButtonProps> = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={v => v && setIsOpen(v)}>
      <DialogTrigger asChild>
        <Button>Upload PDF</Button>
      </DialogTrigger>
    </Dialog>
  );
};

export default UploadButton;
