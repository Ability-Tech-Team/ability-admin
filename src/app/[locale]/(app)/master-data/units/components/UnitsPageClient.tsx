"use client";

import { useCallback, useState } from "react";
import type { ToolbarLabels } from "@/src/components/Toolbar";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import { isImportRunning } from "@/src/services/units";
import { UNITS_PAGE_SIZE, useUnitsPage } from "../hooks/useUnitsPage";
import { useUnitImport } from "../hooks/useUnitImport";
import UnitToolbarWithModal from "./UnitToolbarWithModal";
import ContractFilter from "./ContractFilter";
import UnitsTable from "./UnitsTable";
import ImportUnitsModal from "./ImportUnitsModal";

type Props = {
  /** Where the browser calls the API, or null when the sign-in names none this app trusts. */
  apiBaseUrl: string | null;
  /** Ability Portal, for signing in again when the session has ended. */
  portalBaseUrl: string | null;
  labels: ToolbarLabels;
};

export default function UnitsPageClient({ apiBaseUrl, portalBaseUrl, labels }: Props) {
  const screen = useUnitsPage({ apiBaseUrl, portalBaseUrl });
  const importFlow = useUnitImport({ apiBaseUrl, portalBaseUrl });
  const [importOpen, setImportOpen] = useState(false);

  const { units, projects } = screen;
  const { status: importStatus, reset: resetImport } = importFlow;
  const { reload: reloadUnits } = units;

  const closeImport = useCallback(() => {
    setImportOpen(false);
    // A finished import may have added units; one still running stays visible next time.
    if (importStatus && !isImportRunning(importStatus)) {
      resetImport();
      reloadUnits();
    }
  }, [importStatus, resetImport, reloadUnits]);

  return (
    <>
      <UnitToolbarWithModal
        labels={labels}
        onStatusChange={screen.setStatusFilter}
        onSearch={screen.setSearch}
        onExactSearchChange={screen.setExact}
        onExport={screen.exportUnits}
        onImport={() => setImportOpen(true)}
        extraFilters={
          <ContractFilter
            projects={projects.data ?? []}
            projectId={screen.projectId}
            onProjectChange={screen.setProjectId}
          />
        }
      />
      <div className="flex flex-col gap-3 px-5">
        {units.failure && <ApiFailureNotice failure={units.failure} onRetry={units.reload} />}
        {screen.toggleFailure && <ApiFailureNotice failure={screen.toggleFailure} />}
        {screen.exportFailure && <ApiFailureNotice failure={screen.exportFailure} />}
        <UnitsTable
          data={units.data}
          loading={units.loading}
          failed={units.failure !== null && !units.data}
          page={screen.page}
          pageSize={UNITS_PAGE_SIZE}
          onPageChange={screen.setPage}
          onToggle={screen.toggleActive}
          togglingId={screen.togglingId}
        />
      </div>
      {importOpen && (
        <ImportUnitsModal
          apiBaseUrl={apiBaseUrl}
          projects={projects.data}
          projectsUnavailable={projects.failure !== null}
          flow={importFlow}
          onClose={closeImport}
        />
      )}
    </>
  );
}
