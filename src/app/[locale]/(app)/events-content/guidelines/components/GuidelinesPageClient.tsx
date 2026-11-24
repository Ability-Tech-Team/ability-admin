"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { ToolbarLabels } from "@/src/components/Toolbar";
import Toolbar from "@/src/components/Toolbar";
import FilterDropdown from "@/src/components/FilterDropdown";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import { ALL_PROJECTS_ID } from "@/src/services/guidelines";
import DeleteContentDialog from "../../components/DeleteContentDialog";
import { useGuidelinesPage } from "../hooks/useGuidelinesPage";
import type { ProjectChoice } from "../types";
import GuidelineStatsCards from "./GuidelineStatsCards";
import GuidelinesTable from "./GuidelinesTable";
import NewGuidelineModal from "./NewGuidelineModal";
import EditGuidelineModal from "./EditGuidelineModal";

type Props = {
  /** Where the browser calls the API, or null when the sign-in names none this app trusts. */
  apiBaseUrl: string | null;
  /** Ability Portal, for signing in again when the session has ended. */
  portalBaseUrl: string | null;
  labels: ToolbarLabels;
  statsLabels: {
    published: string;
    publishedSub: string;
    draft: string;
    draftSub: string;
    sections: string;
    sectionsSub: string;
  };
  projectsLabel: string;
};

export default function GuidelinesPageClient({ apiBaseUrl, portalBaseUrl, labels, statsLabels, projectsLabel }: Props) {
  const t = useTranslations("EventsContent.guidelines");
  const locale = useLocale();
  const page = useGuidelinesPage({ apiBaseUrl, portalBaseUrl });
  const { list, stats, editing, deletion } = page;

  // The active projects (none for a role that can't list them); the form adds "All Projects".
  const projectOptions: ProjectChoice[] = useMemo(
    () => (page.projects.data ?? []).map((project) => ({ value: String(project.id), label: project.name })),
    [page.projects.data],
  );
  const filterOptions: ProjectChoice[] = useMemo(
    () => [{ value: String(ALL_PROJECTS_ID), label: t("newModal.allProjects") }, ...projectOptions],
    [projectOptions, t],
  );

  return (
    <div className="flex flex-col gap-4">
      {page.modal?.mode === "create" && (
        <NewGuidelineModal
          projectOptions={projectOptions}
          pending={page.savePending}
          failure={page.saveFailure}
          onClose={page.closeModal}
          onSubmit={page.submitCreate}
        />
      )}
      {page.modal?.mode === "edit" && editing && (
        <EditGuidelineModal
          key={editing.id}
          guideline={editing}
          projectOptions={projectOptions}
          pending={page.savePending}
          failure={page.saveFailure}
          onClose={() => {
            // The delete confirmation over the form closes first.
            if (!deletion.target) page.closeModal();
          }}
          onDelete={() => deletion.ask({ id: editing.id, name: locale === "ar" ? editing.titleAr : editing.titleEn })}
          onSubmit={(input) => page.submitEdit(editing.id, input)}
        />
      )}
      <DeleteContentDialog kind="guideline" deletion={deletion} />
      <GuidelineStatsCards
        stats={{ published: stats.data?.published ?? null, draft: stats.data?.draft ?? null, contentSections: null }}
        labels={statsLabels}
      />
      <Toolbar
        labels={labels}
        hideStatus
        onSearch={page.setSearch}
        onAdd={page.openCreate}
        extraFilters={
          <FilterDropdown
            label={projectsLabel}
            options={filterOptions}
            onChange={page.setProjectFilter}
          />
        }
      />
      {(list.failure || stats.failure) && (
        <div className="flex flex-col gap-3 px-5">
          {list.failure && <ApiFailureNotice failure={list.failure} onRetry={list.reload} />}
          {!list.failure && stats.failure && <ApiFailureNotice failure={stats.failure} onRetry={stats.reload} />}
        </div>
      )}
      <GuidelinesTable
        data={list.data}
        loading={list.loading}
        page={page.page}
        onPageChange={page.setPage}
        onEdit={page.openEdit}
      />
    </div>
  );
}
