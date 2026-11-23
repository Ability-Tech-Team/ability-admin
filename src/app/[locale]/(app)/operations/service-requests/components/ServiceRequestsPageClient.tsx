"use client";

import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import StatusCards from "../../components/StatusCards";
import { useServiceRequestsPage } from "../hooks/useServiceRequestsPage";
import ServiceRequestDetail from "./ServiceRequestDetail";
import ServiceRequestFilters from "./ServiceRequestFilters";
import ServiceRequestsTable from "./ServiceRequestsTable";
import ServiceRequestsToolbar from "./ServiceRequestsToolbar";

type Props = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
};

export default function ServiceRequestsPageClient({ apiBaseUrl, portalBaseUrl }: Props) {
  const page = useServiceRequestsPage({ apiBaseUrl, portalBaseUrl });
  const { list, stats } = page;

  return (
    <>
      <StatusCards stats={stats.data} loading={stats.loading} />
      <ServiceRequestsToolbar
        search={page.search}
        onSearchChange={page.setSearch}
        exact={page.exact}
        onExactChange={page.setExact}
        statusId={page.statusId}
        onStatusChange={page.setStatusId}
        onExport={page.exportSheet}
        exporting={page.exporting}
        extraFilters={
          page.projectOptions.length > 0 && (
            <ServiceRequestFilters
              options={page.projectOptions}
              projectId={page.projectId}
              onProjectChange={page.setProjectId}
            />
          )
        }
      />
      {list.failure && (
        <ApiFailureNotice failure={list.failure} onRetry={list.reload} className="mx-5" />
      )}
      {page.exportFailure && <ApiFailureNotice failure={page.exportFailure} className="mx-5" />}
      <ServiceRequestsTable
        data={list.data}
        loading={list.loading}
        page={page.page}
        onPageChange={page.setPage}
        onSelect={page.select}
      />
      {page.selectedId !== null && (
        <ServiceRequestDetail
          key={page.selectedId}
          apiBaseUrl={apiBaseUrl}
          portalBaseUrl={portalBaseUrl}
          id={page.selectedId}
          onChanged={page.reloadAll}
          onClose={() => page.select(null)}
        />
      )}
    </>
  );
}
