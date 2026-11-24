"use client";

import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import { useComplaintsPage } from "../hooks/useComplaintsPage";
import ComplaintDetail from "./ComplaintDetail";
import ComplaintsTable from "./ComplaintsTable";
import ComplaintsToolbar from "./ComplaintsToolbar";
import NewComplaintModal from "./NewComplaintModal";

type Props = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
};

export default function ComplaintsPageClient({ apiBaseUrl, portalBaseUrl }: Props) {
  const page = useComplaintsPage({ apiBaseUrl, portalBaseUrl });
  const { list, selected } = page;

  return (
    <>
      <ComplaintsToolbar
        search={page.search}
        onSearchChange={page.setSearch}
        statusId={page.statusId}
        onStatusChange={page.setStatusId}
        onNewComplaint={page.openNewComplaint}
      />
      {list.failure && (
        <ApiFailureNotice failure={list.failure} onRetry={list.reload} className="mx-5" />
      )}
      <ComplaintsTable
        data={list.data}
        loading={list.loading}
        page={page.page}
        onPageChange={page.setPage}
        onSelect={page.select}
      />
      {selected && (
        <ComplaintDetail
          key={selected.id}
          complaint={selected}
          refreshing={list.loading}
          saving={page.saving}
          saveFailure={page.saveFailure}
          onAddResponse={(response) => page.addResponse(selected.id, response)}
          onChangeStatus={(statusId) => page.changeStatus(selected.id, statusId)}
          onClose={() => page.select(null)}
        />
      )}
      {page.creating && (
        <NewComplaintModal
          apiBaseUrl={apiBaseUrl}
          portalBaseUrl={portalBaseUrl}
          onClose={page.closeNewComplaint}
          onCreated={page.complaintCreated}
        />
      )}
    </>
  );
}
