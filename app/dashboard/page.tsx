import { redirect } from 'next/navigation';
import { DEFAULT_DASHBOARD_SLUG } from '@/components/dashboard/config';

export const dynamic = 'force-dynamic';

export default function DashboardIndexPage() {
  redirect(`/dashboard/${DEFAULT_DASHBOARD_SLUG}`);
}
