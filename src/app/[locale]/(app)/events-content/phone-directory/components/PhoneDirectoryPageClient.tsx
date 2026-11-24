"use client";

import { useLocale } from "next-intl";
import type { ToolbarLabels } from "@/src/components/Toolbar";
import Toolbar from "@/src/components/Toolbar";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import DeleteContentDialog from "../../components/DeleteContentDialog";
import { usePhoneDirectoryPage } from "../hooks/usePhoneDirectoryPage";
import PhoneContactModal from "./PhoneContactModal";
import PhoneDirectoryGrid from "./PhoneDirectoryGrid";

type Props = {
  /** Where the browser calls the API, or null when the sign-in names none this app trusts. */
  apiBaseUrl: string | null;
  /** Ability Portal, for signing in again when the session has ended. */
  portalBaseUrl: string | null;
  labels: ToolbarLabels;
};

export default function PhoneDirectoryPageClient({ apiBaseUrl, portalBaseUrl, labels }: Props) {
  const locale = useLocale();
  const page = usePhoneDirectoryPage({ apiBaseUrl, portalBaseUrl });
  const { list, editing, deletion } = page;

  const formProps = {
    projectOptions: (page.projects.data ?? []).map((project) => ({
      value: String(project.id),
      label: project.name,
    })),
    projectsFailure: page.projects.failure,
    pending: page.savePending,
    failure: page.saveFailure,
    // Closing waits for a save in flight, and for the delete confirmation over the form.
    onClose: () => {
      if (!page.savePending && !deletion.target) page.closeModal();
    },
  };

  return (
    <div className="flex flex-col gap-4">
      <Toolbar labels={labels} onSearch={page.setSearch} onAdd={page.openCreate} />
      {list.failure && (
        <div className="px-5">
          <ApiFailureNotice failure={list.failure} onRetry={list.reload} />
        </div>
      )}
      <PhoneDirectoryGrid
        data={list.data}
        loading={list.loading}
        page={page.page}
        onPageChange={page.setPage}
        onEdit={page.openEdit}
      />

      {page.modal?.mode === "create" && (
        <PhoneContactModal {...formProps} contact={null} onSave={page.submitCreate} />
      )}
      {page.modal?.mode === "edit" && editing && (
        <PhoneContactModal
          {...formProps}
          key={editing.id}
          contact={editing}
          onDelete={() => deletion.ask({ id: editing.id, name: locale === "ar" ? editing.nameAr : editing.nameEn })}
          onSave={(values) => page.submitEdit(editing, values)}
        />
      )}
      <DeleteContentDialog kind="contact" deletion={deletion} />
    </div>
  );
}
