"use client";

import { useLocale, useTranslations } from "next-intl";
import type { ToolbarLabels } from "@/src/components/Toolbar";
import Toolbar from "@/src/components/Toolbar";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import CloseButton from "@/src/components/CloseButton";
import ModalWrapper from "@/src/components/ModalWrapper";
import DeleteContentDialog from "../../components/DeleteContentDialog";
import { useNewsShopsPage } from "../hooks/useNewsShopsPage";
import NewsArticleForm from "./NewsArticleForm";
import NewsShopsTable from "./NewsShopsTable";

type Props = {
  /** Where the browser calls the API, or null when the sign-in names none this app trusts. */
  apiBaseUrl: string | null;
  /** Ability Portal, for signing in again when the session has ended. */
  portalBaseUrl: string | null;
  labels: ToolbarLabels;
};

const TITLE_ID = "news-article-title";

export default function NewsShopsPageClient({ apiBaseUrl, portalBaseUrl, labels }: Props) {
  const t = useTranslations("EventsContent.newsShops.form");
  const locale = useLocale();
  const page = useNewsShopsPage({ apiBaseUrl, portalBaseUrl });
  const { list, modal, editing, deletion } = page;

  const projectOptions = (page.projects.data ?? []).map((project) => ({
    value: String(project.id),
    label: project.name,
  }));
  // Closing waits for a save in flight, and for the delete confirmation over the form.
  const close = () => {
    if (!page.savePending && !deletion.target) page.closeModal();
  };
  const formProps = {
    projectOptions,
    projectsFailure: page.projects.failure,
    pending: page.savePending,
    failure: page.saveFailure,
    onCancel: close,
  };

  return (
    <div className="flex flex-col gap-4">
      <Toolbar labels={labels} onSearch={page.setSearch} onAdd={page.openCreate} />
      {list.failure && (
        <ApiFailureNotice failure={list.failure} onRetry={list.reload} className="mx-5" />
      )}
      <NewsShopsTable
        data={list.data}
        loading={list.loading}
        page={page.page}
        onPageChange={page.setPage}
        onEdit={page.openEdit}
      />

      {modal && (
        <ModalWrapper onClose={close} width="max-w-[560px]" labelledBy={TITLE_ID}>
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 id={TITLE_ID} className="text-[15px] font-bold text-gray-900">
              {t(modal.mode === "create" ? "newTitle" : "editTitle")}
            </h2>
            <CloseButton onClick={close} label={t("close")} />
          </div>
          {modal.mode === "create" ? (
            <NewsArticleForm {...formProps} article={null} onSave={page.submitCreate} />
          ) : editing ? (
            <NewsArticleForm
              {...formProps}
              key={editing.id}
              article={editing}
              onDelete={() =>
                deletion.ask({ id: editing.id, name: locale === "ar" ? editing.titleAr : editing.titleEn })
              }
              onSave={(values) => page.submitEdit(editing, values)}
            />
          ) : (
            <div className="px-6 py-8">
              {page.articleFailure ? (
                <ApiFailureNotice failure={page.articleFailure} onRetry={page.reloadArticle} />
              ) : (
                <p role="status" className="text-center text-[12px] text-gray-400">{t("loading")}</p>
              )}
            </div>
          )}
        </ModalWrapper>
      )}
      <DeleteContentDialog kind="news" deletion={deletion} />
    </div>
  );
}
