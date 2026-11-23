"use client";

import { useCallback } from "react";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import Pagination from "@/src/components/Pagination";
import { useApiDownload } from "@/src/hooks/useApiDownload";
import { reservationsSheetRequest } from "@/src/services/rentals";
import { useRentalManagementPage } from "../hooks/useRentalManagementPage";
import AddRentalModal from "./AddRentalModal";
import RentalActionDialog from "./RentalActionDialog";
import RentalDetail from "./RentalDetail";
import RentalToolbar from "./RentalToolbar";
import ReservationsTable from "./ReservationsTable";
import WalkInRequestsTable from "./WalkInRequestsTable";

type Props = {
  /** Where the browser calls the API, or null when the sign-in names none this app trusts. */
  apiBaseUrl: string | null;
  /** Ability Portal, for signing in again when the session has ended. */
  portalBaseUrl: string | null;
};

export default function RentalManagementPageClient({ apiBaseUrl, portalBaseUrl }: Props) {
  const screen = useRentalManagementPage({ apiBaseUrl, portalBaseUrl });
  const exporting = useApiDownload({ apiBaseUrl, portalBaseUrl });
  const { view, list, selected, dialog, select, setAddOpen, reloadReservations } = screen;
  const projectsUnavailable = screen.projects.failure !== null;
  const busy = screen.actionPending;

  const viewRow = useCallback((id: number) => select({ view, id }), [select, view]);
  // Escape on an open dialog closes the dialog, not the panel under it.
  const closeDetail = useCallback(() => {
    if (!dialog) select(null);
  }, [dialog, select]);
  const closeAdd = useCallback(() => setAddOpen(false), [setAddOpen]);

  // The detail queries keep their last answer while another row loads: only show the selected one.
  const reservationDetail =
    screen.reservationDetail.data && screen.reservationDetail.data.id === selected?.id
      ? screen.reservationDetail.data
      : null;
  const walkInDetail =
    screen.walkInDetail.data && screen.walkInDetail.data.id === selected?.id ? screen.walkInDetail.data : null;
  const detailQuery = selected?.view === "walkIns" ? screen.walkInDetail : screen.reservationDetail;

  return (
    <>
      <RentalToolbar
        view={view}
        onViewChange={screen.setView}
        searchField={screen.searchField}
        onSearchFieldChange={screen.setSearchField}
        search={screen.search}
        onSearch={screen.setSearch}
        projectId={screen.projectId}
        onProjectChange={screen.setProjectId}
        projects={screen.projects.data}
        projectsUnavailable={projectsUnavailable}
        statusId={screen.statusId}
        onStatusChange={screen.setStatusId}
        sourceId={screen.sourceId}
        onSourceChange={screen.setSourceId}
        onExport={
          view === "reservations" && apiBaseUrl && (screen.reservations.data?.totalCount ?? 0) > 0
            ? () => void exporting.download(reservationsSheetRequest(screen.reservationFilter))
            : null
        }
        exporting={exporting.pending}
        onAdd={() => setAddOpen(true)}
      />
      <div className="flex flex-col gap-3 px-5">
        {list.failure && <ApiFailureNotice failure={list.failure} onRetry={list.reload} />}
        {exporting.failure && <ApiFailureNotice failure={exporting.failure} />}
        <div aria-busy={list.loading}>
          {view === "reservations" ? (
            <ReservationsTable
              items={screen.reservations.data?.items ?? []}
              loading={screen.reservations.loading}
              busy={busy}
              onView={viewRow}
              onAction={screen.openDialog}
            />
          ) : (
            <WalkInRequestsTable
              items={screen.walkIns.data?.items ?? []}
              loading={screen.walkIns.loading}
              busy={busy}
              onView={viewRow}
              onAction={screen.openDialog}
            />
          )}
        </div>
        {list.data && (
          <Pagination
            page={screen.page}
            totalPages={list.data.totalPages}
            totalCount={list.data.totalCount}
            onPageChange={screen.setPage}
            disabled={list.loading}
          />
        )}
      </div>

      {selected && (
        <RentalDetail
          detail={
            selected.view === "walkIns"
              ? { kind: "walkIns", data: walkInDetail }
              : { kind: "reservations", data: reservationDetail }
          }
          loading={detailQuery.loading}
          failure={detailQuery.failure}
          onRetry={detailQuery.reload}
          busy={busy}
          onAction={screen.openDialog}
          onClose={closeDetail}
        />
      )}

      {dialog && (
        <RentalActionDialog
          key={`${dialog.mode}-${dialog.target.id}`}
          dialog={dialog}
          problem={screen.dialogProblem}
          pending={busy}
          failure={screen.actionFailure}
          onSubmit={(values) => void screen.submitDialog(values)}
          onClose={screen.closeDialog}
        />
      )}

      {screen.addOpen && (
        <AddRentalModal
          apiBaseUrl={apiBaseUrl}
          portalBaseUrl={portalBaseUrl}
          projects={screen.projects.data}
          projectsUnavailable={projectsUnavailable}
          onSaved={reloadReservations}
          onClose={closeAdd}
        />
      )}
    </>
  );
}
