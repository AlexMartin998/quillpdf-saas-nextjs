import { NextPage } from 'next';

import { getUserSubscriptionPlan } from '@/shared/lib/stripe';
import { BillingForm } from '@/shared/components';

export type pageProps = {};

const page: NextPage<pageProps> = async () => {
  const subscriptionPlan = await getUserSubscriptionPlan();

  return <BillingForm subscriptionPlan={subscriptionPlan} />;
};

export default page;
