"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import type { ToolbarLabels } from "@/src/components/Toolbar";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import Pagination from "@/src/components/Pagination";
import { useEventsPage } from "../hooks/useEventsPage";
import EventToolbarWithModal from "./EventToolbarWithModal";
import EventFilters from "./EventFilters";
import EventsGrid from "./EventsGrid";
import EventsListTable from "./EventsListTable";
import CreateEventModal from "./CreateEventModal";

type Props = {
  /** Where the browser calls the API, or null when the sign-in names none this app trusts. */
  apiBaseUrl: string | null;
  /** Ability Portal, for signing in again when the session has ended. */
  portalBaseUrl: string | null;
  labels: ToolbarLabels;
};

export default function EventsPageClient({ apiBaseUrl, portalBaseUrl, labels }: Props) {
  const t = useTranslations("EventsContent");
  const locale = useLocale();
  const page = useEventsPage({ apiBaseUrl, portalBaseUrl });
  const { list } = page;
  const [view, setView] = useState<"grid" | "list">("grid");

  const projectOptions = (page.projects.data ?? []).map((project) => ({
    value: String(project.id),
    label: project.name,
  }));

  async function publish(eventId: number) {
    if (await page.publish(eventId)) toast.success(t("createModal.eventPublished"));
  }

  return (
    <div className="flex flex-col gap-4">
      <EventToolbarWithModal
        labels={labels}
        extraFilters={
          <EventFilters
            projectOptions={projectOptions}
            projectsUnavailable={Boolean(page.projects.failure)}
            onProjectChange={page.setProjectFilter}
          />
        }
        onStatusChange={page.setStatusFilter}
        onSearch={page.setSearch}
        onAdd={page.openCreate}
        view={view}
        onViewChange={setView}
      />
      {(list.failure || page.publishFailure) && (
        <div className="flex flex-col gap-3 px-5">
          {list.failure && <ApiFailureNotice failure={list.failure} onRetry={list.reload} />}
          {page.publishFailure && <ApiFailureNotice failure={page.publishFailure} />}
        </div>
      )}
      {view === "grid" ? (
        <EventsGrid
          data={list.data}
          loading={list.loading}
          onEdit={page.openEdit}
          onPublish={publish}
          publishingId={page.publishingId}
          onAdd={page.openCreate}
        />
      ) : (
        <EventsListTable data={list.data} loading={list.loading} />
      )}
      {list.data && (
        <div className="px-5">
          <Pagination
            page={page.page}
            totalPages={list.data.totalPages}
            onPageChange={page.setPage}
            disabled={list.loading}
          />
        </div>
      )}

      {page.modal?.mode === "create" && (
        <CreateEventModal
          mode="create"
          event={null}
          projectOptions={projectOptions}
          pending={false}
          failure={null}
          onClose={page.closeModal}
        />
      )}
      {page.modal?.mode === "edit" && page.editing && (
        <CreateEventModal
          key={page.editing.id}
          mode="edit"
          event={page.editing}
          projectOptions={projectOptions}
          pending={page.savePending}
          failure={page.saveFailure}
          onClose={page.closeModal}
          onSubmit={async (values, published) => {
            if (page.editing && (await page.submitEdit(page.editing, values, published, locale))) {
              toast.success(published ? t("createModal.eventPublished") : t("createModal.savedAsDraft"));
            }
          }}
        />
      )}
    </div>
  );
}
