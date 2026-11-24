"use client";

import { useApiQuery } from "@/src/hooks/useApiQuery";
import { fetchDropdowns, fetchServiceOptions } from "@/src/services/definitions";

type Options = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
  /**
   * The project whose per-project lists (departments, invoice and complaint types, locations...)
   * to load; null for the API's default (the sign-in project, every project for the Super Admin).
   */
  projectId: number | null;
  /** False skips loading, e.g. while a form is closed. */
  enabled?: boolean;
};

/** The definitions' option lists (`GET /definitions/all-dropdowns`) for the forms and filters. */
export function useDropdowns({ apiBaseUrl, portalBaseUrl, projectId, enabled = true }: Options) {
  return useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: `dropdowns|${projectId ?? ""}`,
    enabled,
    load: ({ apiBaseUrl: base, locale }) => fetchDropdowns(base, projectId, locale),
  });
}

/** One department's active services in a project (`GET /definitions/services`), once both are chosen. */
export function useServiceOptions({
  apiBaseUrl,
  portalBaseUrl,
  projectId,
  departmentId,
}: Omit<Options, "enabled" | "projectId"> & { projectId: number | null; departmentId: number | null }) {
  return useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: `services|${projectId ?? ""}|${departmentId ?? ""}`,
    enabled: projectId !== null && departmentId !== null,
    load: ({ apiBaseUrl: base, locale }) =>
      fetchServiceOptions(base, { projectId: projectId as number, departmentId: departmentId as number }, locale),
  });
}
