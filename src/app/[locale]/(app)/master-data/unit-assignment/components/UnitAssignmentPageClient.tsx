"use client";

import { useTranslations } from "next-intl";
import Toolbar, { type ToolbarLabels } from "@/src/components/Toolbar";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import { useUnitAssignmentPage } from "../hooks/useUnitAssignmentPage";
import AssignmentFilters from "./AssignmentFilters";
import UnitAssignmentTable from "./UnitAssignmentTable";
import UnitAssignmentDetail from "./UnitAssignmentDetail";
import AssignUnitModal from "./AssignUnitModal";

type Props = {
  /** Where the browser calls the API, or null when the sign-in names none this app trusts. */
  apiBaseUrl: string | null;
  /** Ability Portal, for signing in again when the session has ended. */
  portalBaseUrl: string | null;
  labels: ToolbarLabels;
};

export default function UnitAssignmentPageClient({ apiBaseUrl, portalBaseUrl, labels }: Props) {
  const t = useTranslations("MasterData");
  const tScreen = useTranslations("UnitAssignmentScreen");
  const page = useUnitAssignmentPage({ apiBaseUrl, portalBaseUrl });
  const { list } = page;
  const projectOptions = page.projects.data ?? [];

  return (
    <>
      <Toolbar
        labels={labels}
        statusOptions={[
          { value: "active", label: t("active") },
          { value: "inactive", label: t("inactive") },
        ]}
        onSearch={page.setSearch}
        onExactSearchChange={page.setExact}
        onStatusChange={page.setStatusFilter}
        onAdd={page.openAssign}
        extraFilters={
          <AssignmentFilters
            projects={projectOptions}
            projectId={page.projectId}
            onProjectChange={page.setProjectId}
            onOccupancyChange={page.setOccupancyFilter}
          />
        }
      />
      <div className="flex flex-col gap-3 px-5">
        {list.failure && (
          <ApiFailureNotice
            failure={list.failure}
            onRetry={list.reload}
            messages={{ forbidden: tScreen("forbidden") }}
          />
        )}
        {page.endFailure && <ApiFailureNotice failure={page.endFailure} />}
        <UnitAssignmentTable
          data={list.data}
          loading={list.loading}
          page={page.page}
          onPageChange={page.setPage}
          onView={page.select}
          onEnd={page.endAssignment}
          endingId={page.endingId}
        />
      </div>

      {page.selectedId !== null && (
        <UnitAssignmentDetail
          summary={page.selected}
          detail={page.detail.data}
          loading={page.detail.loading}
          failure={page.detail.failure}
          onRetry={page.detail.reload}
          onClose={page.closeDetail}
        />
      )}

      {page.assignOpen && (
        <AssignUnitModal
          apiBaseUrl={apiBaseUrl}
          portalBaseUrl={portalBaseUrl}
          projects={projectOptions.filter((project) => project.active)}
          projectsFailure={page.projects.failure}
          initialProjectId={page.projectId}
          pending={page.assignPending}
          failure={page.assignFailure}
          onClose={page.closeAssign}
          onSubmit={page.submitAssign}
        />
      )}
    </>
  );
}
