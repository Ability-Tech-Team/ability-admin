import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import DashboardContent from "./dashboard/components/DashboardContent";
import { requireProductAccess } from "@/src/lib/access";
import {
  fetchDashboardStats,
  fetchServiceRequestTrend,
  fetchOccupancyByProject,
  fetchQuickMetrics,
  fetchProjectsOverview,
  fetchRecentServiceRequests,
} from "@/src/services/dashboard";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  // Signed-out clients are redirected to the Portal's sign-in page here.
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const [stats, serviceRequests, occupancy, quickMetrics, projects, recentRequests] =
    await Promise.all([
      fetchDashboardStats(),
      fetchServiceRequestTrend(),
      fetchOccupancyByProject(),
      fetchQuickMetrics(),
      fetchProjectsOverview(),
      fetchRecentServiceRequests(),
    ]);

  return (
    <DashboardContent
      stats={stats}
      serviceRequests={serviceRequests}
      occupancy={occupancy}
      quickMetrics={quickMetrics}
      projects={projects}
      recentRequests={recentRequests}
    />
  );
}
