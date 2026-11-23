"use client";

import { useTranslations } from "next-intl";
import Toolbar, { type ToolbarLabels } from "@/src/components/Toolbar";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import { useProjectsPage } from "../hooks/useProjectsPage";
import ProjectsTable from "./ProjectsTable";
import ProjectFormModal from "./ProjectFormModal";

type Props = {
  /** Where the browser calls the API, or null when the sign-in names none this app trusts. */
  apiBaseUrl: string | null;
  /** Ability Portal, for signing in again when the session has ended. */
  portalBaseUrl: string | null;
  labels: ToolbarLabels;
  exportLabel: string;
  importLabel: string;
};

const idleButton =
  "flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 h-7 text-[10.5px] font-medium text-gray-600 disabled:cursor-not-allowed disabled:opacity-50";

export default function ProjectsPageClient({
  apiBaseUrl,
  portalBaseUrl,
  labels,
  exportLabel,
  importLabel,
}: Props) {
  const t = useTranslations("MasterData");
  const tScreen = useTranslations("ProjectsScreen");
  const page = useProjectsPage({ apiBaseUrl, portalBaseUrl });
  const { list } = page;
  const forbidden = { forbidden: tScreen("forbidden") };

  return (
    <>
      <Toolbar
        labels={labels}
        statusOptions={[
          { value: "active", label: t("active") },
          { value: "inactive", label: t("inactive") },
        ]}
        onStatusChange={page.setStatusFilter}
        onSearch={page.setSearch}
        onExactSearchChange={page.setExact}
        onAdd={page.openCreate}
        trailingContent={
          <>
            {/* No export or import route for projects yet. */}
            <button type="button" disabled title={tScreen("notAvailableYet")} className={idleButton}>
              {exportLabel}
            </button>
            <button type="button" disabled title={tScreen("notAvailableYet")} className={idleButton}>
              {importLabel}
            </button>
          </>
        }
      />
      <div className="flex flex-col gap-3 px-5">
        {list.failure && (
          <ApiFailureNotice failure={list.failure} onRetry={list.reload} messages={forbidden} />
        )}
        {page.statusFailure && (
          <ApiFailureNotice failure={page.statusFailure} messages={forbidden} />
        )}
        <ProjectsTable
          data={list.data}
          loading={list.loading}
          page={page.page}
          onPageChange={page.setPage}
          onEdit={page.openEdit}
          onToggleActive={page.toggleActive}
          togglingId={page.togglingId}
        />
      </div>

      {page.modal?.mode === "create" && (
        <ProjectFormModal
          mode="create"
          project={null}
          pending={page.savePending}
          failure={page.saveFailure}
          onClose={page.closeModal}
          onSubmit={page.submitCreate}
        />
      )}
      {page.modal?.mode === "edit" && page.editing && (
        <ProjectFormModal
          key={page.editing.id}
          mode="edit"
          project={page.editing}
          pending={page.savePending}
          failure={page.saveFailure}
          onClose={page.closeModal}
          onSubmit={(input) => page.editing && page.submitEdit(page.editing.id, input)}
        />
      )}
    </>
  );
}
