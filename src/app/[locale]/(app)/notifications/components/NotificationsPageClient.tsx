"use client";

import { useTranslations } from "next-intl";
import FilterDropdown from "@/src/components/FilterDropdown";
import Toolbar from "@/src/components/Toolbar";
import { useNotificationsPage } from "../hooks/useNotificationsPage";
import CreateNotificationModal from "./CreateNotificationModal";
import NotificationFilters from "./NotificationFilters";
import NotificationsTable from "./NotificationsTable";

type Props = {
  /** Where the browser calls the API, or null when the sign-in names none this app trusts. */
  apiBaseUrl: string | null;
  /** Ability Portal, for signing in again when the session has ended. */
  portalBaseUrl: string | null;
};

/**
 * The send form, and the sent notifications' table. No admin route lists what was sent, so the
 * table stays empty and the filters that only act on it are disabled.
 */
export default function NotificationsPageClient({ apiBaseUrl, portalBaseUrl }: Props) {
  const t = useTranslations("Notifications");
  const tScreen = useTranslations("NotificationsScreen");
  const page = useNotificationsPage({ apiBaseUrl, portalBaseUrl });
  const unavailable = tScreen("notAvailableYet");

  return (
    <>
      <Toolbar
        labels={{
          searchPlaceholder: t("searchPlaceholder"),
          exactSearch: t("exactSearch"),
          status: t("status"),
          addLabel: t("newNotification"),
        }}
        // The Status filter is drawn here, where it can be disabled, in its usual place.
        hideStatus
        extraFilters={
          <>
            <FilterDropdown
              label={t("status")}
              options={[
                { value: "published", label: t("statuses.published") },
                { value: "scheduled", label: t("statuses.scheduled") },
                { value: "draft", label: t("statuses.draft") },
              ]}
              disabled
              title={unavailable}
            />
            <NotificationFilters disabled title={unavailable} />
          </>
        }
        onAdd={page.openModal}
      />

      <div className="flex flex-col gap-3 px-5">
        {page.lastSent !== null && (
          <div
            role="status"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[12px] text-emerald-800"
          >
            <span>{tScreen("sent", { count: page.lastSent })}</span>
            <button
              type="button"
              onClick={page.dismissSent}
              className="rounded-lg bg-white px-3 py-1.5 font-semibold text-emerald-800 shadow-sm hover:bg-emerald-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              {tScreen("dismiss")}
            </button>
          </div>
        )}
      </div>

      {/* The table keeps its own margins, as before. */}
      <NotificationsTable />

      {page.modalOpen && (
        <CreateNotificationModal
          projects={page.projects.data}
          projectsLoading={page.projects.loading}
          projectsFailure={page.projects.failure}
          onRetryProjects={page.projects.reload}
          pending={page.pending}
          failure={page.failure}
          onClose={page.closeModal}
          onSubmit={page.submit}
        />
      )}
    </>
  );
}
