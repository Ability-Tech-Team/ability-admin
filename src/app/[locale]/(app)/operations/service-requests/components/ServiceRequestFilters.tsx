"use client";

import { useTranslations } from "next-intl";
import { filterSelectClass, optionalId } from "../utils";
import type { ProjectOption } from "@/src/services/projects";

type Props = {
  options: ProjectOption[];
  projectId: number | null;
  onProjectChange: (projectId: number | null) => void;
};

/** The project filter, from the API's projects (`project_id` takes one). */
export default function ServiceRequestFilters({ options, projectId, onProjectChange }: Props) {
  const t = useTranslations("Operations");
  const ts = useTranslations("ServiceRequestsScreen");

  return (
    <select
      value={projectId ?? ""}
      onChange={(e) => onProjectChange(optionalId(e.target.value))}
      aria-label={t("filters.projects")}
      className={filterSelectClass}
    >
      <option value="">{ts("allProjects")}</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.name ?? `#${option.id}`}
        </option>
      ))}
    </select>
  );
}
