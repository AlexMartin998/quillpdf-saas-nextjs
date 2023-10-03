'use client';

import { ArrowRight } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

export type UpgradeProPlanButtonProps = {};

const UpgradeProPlanButton: React.FC<UpgradeProPlanButtonProps> = () => {
  return (
    <Button onClick={() => {}} className="w-full">
      Upgrade now <ArrowRight className="h-5 w-5 ml-1.5" />
    </Button>
  );
};

export default UpgradeProPlanButton;
