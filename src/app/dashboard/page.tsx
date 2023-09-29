import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { NextPage } from 'next';
import { redirect } from 'next/navigation';

export type DashboardPageProps = {};

const DashboardPage: NextPage<DashboardPageProps> = () => {
  const { getUser } = getKindeServerSession();
  const user = getUser();

  // the 1st time user does noe exist in our db, so it sync db to allow set auth
  if (!user || !user.id) redirect('/auth-callback?origin=dashboard');

  return <>Hello</>;
};

export default DashboardPage;
