"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import Pagination from "@/src/components/Pagination";
import type { ToolbarLabels } from "@/src/components/Toolbar";
import ImportSheetModal from "../../customers/components/ImportSheetModal";
import { useFamilyMembersPage } from "../hooks/useFamilyMembersPage";
import { useAddFamilyMember } from "../hooks/useAddFamilyMember";
import type { FamilyMemberRequest } from "../types";
import AddFamilyMemberModal from "./AddFamilyMemberModal";
import AnswerRequestDialog from "./AnswerRequestDialog";
import FamilyMemberFilters from "./FamilyMemberFilters";
import FamilyMembersTable from "./FamilyMembersTable";
import FamilyMembersToolbar from "./FamilyMembersToolbar";

type Props = {
  /** Where the browser calls the API, or null when the sign-in names none this app trusts. */
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
  labels: ToolbarLabels;
};

type Answering = { mode: "reject" | "revert"; request: FamilyMemberRequest };

/** The owners' requests to add relatives, loaded page by page from the API in the browser. */
export default function FamilyMembersPageClient({ apiBaseUrl, portalBaseUrl, labels }: Props) {
  const tf = useTranslations("FamilyMembersScreen");
  const tc = useTranslations("CustomersScreen");
  const page = useFamilyMembersPage({ apiBaseUrl, portalBaseUrl });
  const [answering, setAnswering] = useState<Answering | null>(null);
  const [importing, setImporting] = useState(false);
  const [adding, setAdding] = useState(false);
  /** Relatives added in the last Add Member session, for the confirmation under the toolbar. */
  const [lastAdded, setLastAdded] = useState(0);
  const addForm = useAddFamilyMember({ apiBaseUrl, portalBaseUrl, onAdded: () => undefined });

  function openAdd() {
    addForm.reset();
    setLastAdded(0);
    setAdding(true);
  }
  function closeAdd() {
    setLastAdded(addForm.addedCount);
    setAdding(false);
  }

  const { data, loading, failure, reload } = page.list;
  const projectOptions = page.projects.options;
  const projectNames = useMemo(
    () =>
      new Map(
        (projectOptions ?? []).flatMap((project) => (project.name ? [[project.id, project.name] as const] : [])),
      ),
    [projectOptions],
  );

  function openAnswer(mode: Answering["mode"], request: FamilyMemberRequest) {
    page.action.reset();
    setAnswering({ mode, request });
  }

  return (
    <>
      <FamilyMembersToolbar
        labels={labels}
        onStatusChange={page.setStatuses}
        onSearch={page.setSearch}
        searchField={page.searchField}
        onSearchFieldChange={page.setSearchField}
        onImport={() => setImporting(true)}
        onExport={() => void page.exportSheet()}
        onAdd={openAdd}
        extraFilters={<FamilyMemberFilters projects={projectOptions} onProjectChange={page.setProjects} />}
      />
      <div className="flex flex-col gap-3 px-5">
        {lastAdded > 0 && (
          <p role="status" className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-[11px] text-green-700">
            {tf("add.added", { count: lastAdded })}
          </p>
        )}
        {page.severalTicked && (
          <p className="text-[11px] text-amber-700" role="status">{tc("oneChoiceHint")}</p>
        )}
        {failure && <ApiFailureNotice failure={failure} onRetry={reload} />}
        {/* An approval's failure shows here; a rejection's or a revert's shows in its dialog. */}
        {!answering && page.action.failure && <ApiFailureNotice failure={page.action.failure} />}
        {page.exporting.failure && <ApiFailureNotice failure={page.exporting.failure} />}
        <div aria-busy={loading || undefined} className={loading && data ? "opacity-60 transition-opacity" : undefined}>
          <FamilyMembersTable
            requests={data?.requests ?? []}
            loading={loading}
            projectNames={projectNames}
            busy={page.action.pending}
            pendingId={page.pendingId}
            onAccept={(request) => {
              page.action.reset();
              void page.accept(request.id);
            }}
            onReject={(request) => openAnswer("reject", request)}
            onRevert={(request) => openAnswer("revert", request)}
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

      {answering && (
        <AnswerRequestDialog
          mode={answering.mode}
          request={answering.request}
          onConfirm={(reason) =>
            answering.mode === "reject"
              ? page.reject(answering.request.id, reason)
              : page.revert(answering.request.id)
          }
          pending={page.action.pending}
          failure={page.action.failure}
          onClose={() => setAnswering(null)}
        />
      )}

      {adding && <AddFamilyMemberModal form={addForm} onClose={closeAdd} />}

      {importing && (
        <ImportSheetModal
          kind="relatives"
          title={tf("importTitle")}
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
