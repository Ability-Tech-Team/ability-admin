"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import Pagination from "@/src/components/Pagination";
import type { ToolbarLabels } from "@/src/components/Toolbar";
import { useCustomerDetail, useCustomersPage } from "../hooks/useCustomersPage";
import { useDropdowns } from "@/src/hooks/useDropdowns";
import type { Customer, Named } from "../types";
import AddCustomerModal from "./AddCustomerModal";
import AttachmentsModal from "./AttachmentsModal";
import CustomerFilters from "./CustomerFilters";
import CustomerProfile from "./CustomerProfile";
import CustomersTable from "./CustomersTable";
import CustomersToolbar from "./CustomersToolbar";
import DeleteCustomerDialog from "./DeleteCustomerDialog";
import EditCustomerModal from "./EditCustomerModal";
import ImportSheetModal from "./ImportSheetModal";

type Props = {
  /** Where the browser calls the API, or null when the sign-in names none this app trusts. */
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
  /** The sign-in project: where a user who can't list projects adds customers. */
  sessionProject: Named | null;
  labels: ToolbarLabels;
};

/** The customers list, loaded page by page from the API in the browser. */
export default function CustomersPageClient({ apiBaseUrl, portalBaseUrl, sessionProject, labels }: Props) {
  const tc = useTranslations("CustomersScreen");
  const page = useCustomersPage({ apiBaseUrl, portalBaseUrl });
  const [selected, setSelected] = useState<Customer | null>(null);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [attachments, setAttachments] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState<Customer | null>(null);
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState(false);
  const detail = useCustomerDetail({ apiBaseUrl, portalBaseUrl }, selected?.id ?? null);
  // The form's choice lists (id types, countries...), the same for every project.
  const lookups = useDropdowns({ apiBaseUrl, portalBaseUrl, projectId: null, enabled: adding || editing !== null });
  // If the project list is refused (an API without /projects/accessible), add to the sign-in project.
  const addProjects =
    page.projects.forbidden && sessionProject
      ? { options: [sessionProject], forbidden: false, failure: null }
      : page.projects;
  const defaultProjectId = page.projects.forbidden && sessionProject ? String(sessionProject.id) : "";

  const { data, loading, failure, reload } = page.list;
  const customers = data?.customers ?? [];

  function openEdit(customer: Customer) {
    page.formAction.reset();
    setEditing(customer);
  }

  function openDelete(customer: Customer) {
    page.deleteAction.reset();
    setDeleting(customer);
  }

  return (
    <>
      <CustomersToolbar
        labels={labels}
        onSearch={page.setSearch}
        searchField={page.searchField}
        onSearchFieldChange={page.setSearchField}
        onAdd={() => {
          page.formAction.reset();
          setAdding(true);
        }}
        onImport={() => setImporting(true)}
        onExport={() => void page.exportSheet()}
        extraFilters={
          <CustomerFilters
            projects={page.projects.options}
            onProjectChange={page.setProjects}
            onTypeChange={page.setOwnerships}
          />
        }
      />
      <div className="flex flex-col gap-3 px-5">
        {page.severalTicked && (
          <p className="text-[11px] text-amber-700" role="status">{tc("oneChoiceHint")}</p>
        )}
        {failure && <ApiFailureNotice failure={failure} onRetry={reload} />}
        {page.rowAction.failure && <ApiFailureNotice failure={page.rowAction.failure} />}
        {page.exporting.failure && <ApiFailureNotice failure={page.exporting.failure} />}
        <div aria-busy={loading || undefined} className={loading && data ? "opacity-60 transition-opacity" : undefined}>
          <CustomersTable
            customers={customers}
            loading={loading}
            savingStatus={page.rowAction.pending}
            onOpen={setSelected}
            onEdit={openEdit}
            onShowAttachments={setAttachments}
            onSetActive={(customer, active) => void page.setActive(customer, active)}
            footer={
              data && (
                <Pagination
                  page={page.page}
                  totalPages={data.totalPages}
                  totalCount={data.totalCount}
                  onPageChange={page.setPage}
                  disabled={loading}
                />
              )
            }
          />
        </div>
      </div>

      {/* Side panel */}
      {selected && !editing && !deleting && (
        <CustomerProfile
          customer={selected}
          detail={detail}
          onClose={() => setSelected(null)}
          onEdit={() => {
            openEdit(detail.data ?? selected);
            setSelected(null);
          }}
          onDelete={() => openDelete(selected)}
          onShowAttachments={() => {
            setAttachments(detail.data ?? selected);
            setSelected(null);
          }}
        />
      )}

      {/* Add modal */}
      {adding && (
        <AddCustomerModal
          projects={addProjects}
          defaultProjectId={defaultProjectId}
          lookups={lookups}
          onSave={page.create}
          saving={page.formAction.pending}
          failure={page.formAction.failure}
          onClose={() => setAdding(false)}
        />
      )}

      {/* Edit modal */}
      {editing && !deleting && (
        <EditCustomerModal
          customer={editing}
          lookups={lookups}
          onSave={(values) => page.update(editing, values)}
          saving={page.formAction.pending}
          failure={page.formAction.failure}
          onClose={() => setEditing(null)}
          onDelete={() => openDelete(editing)}
        />
      )}

      {/* Delete confirmation */}
      {deleting && (
        <DeleteCustomerDialog
          customer={deleting}
          apiBaseUrl={apiBaseUrl}
          portalBaseUrl={portalBaseUrl}
          onConfirm={(projectId) => page.remove(deleting.id, projectId)}
          pending={page.deleteAction.pending}
          failure={page.deleteAction.failure}
          onClose={(deleted) => {
            setDeleting(null);
            if (deleted) {
              setSelected(null);
              setEditing(null);
            }
          }}
        />
      )}

      {/* Attachments modal */}
      {attachments && <AttachmentsModal customer={attachments} onClose={() => setAttachments(null)} />}

      {/* Import */}
      {importing && (
        <ImportSheetModal
          kind="customers"
          title={tc("import.title")}
          apiBaseUrl={apiBaseUrl}
          portalBaseUrl={portalBaseUrl}
          projects={page.projects}
          onClose={() => {
            setImporting(false);
            reload();
          }}
        />
      )}
    </>
  );
}
