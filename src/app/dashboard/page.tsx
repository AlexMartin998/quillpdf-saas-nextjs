import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { NextPage } from 'next';
import { redirect } from 'next/navigation';

import { db } from '@/db';
import { DashboardScene } from '@/quillpdf/scenes';
import { getUserSubscriptionPlan } from '@/shared/lib/stripe';

export type DashboardPageProps = {};

// async is allawed 'cause in v13+ this is a ServerComponent
const DashboardPage: NextPage<DashboardPageProps> = async () => {
  const { getUser } = getKindeServerSession();
  const user = getUser();

  // the 1st time user does noe exist in our db, so it sync db to allow set auth
  if (!user || !user.id) redirect('/auth-callback?origin=dashboard');

  // check if the user is already registered in our db
  const dbUser = await db.user.findFirst({ where: { id: user.id } });
  if (!dbUser) redirect('/auth-callback?origin=dashboard');

  // check subscription plan
  const subscriptionPlan = await getUserSubscriptionPlan();

  return <DashboardScene subscriptionPlan={subscriptionPlan} />;
};

export default DashboardPage;
