"use client";

import type { NotificationTemplate } from "@/src/services/notificationTemplates";

type Props = {
  templates: NotificationTemplate[];
  labels: {
    newTemplate: string;
    edit: string;
    useTemplate: string;
    uses: string;
  };
};

export default function TemplatesPageClient({ templates, labels }: Props) {
  return (
    <div className="px-5">
      {/* New Template button */}
      <div className="flex justify-end mb-4">
        <button
          type="button"
          className="rounded-md bg-blue-600 px-3 py-1 text-[10.5px] font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          {labels.newTemplate}
        </button>
      </div>

      {/* Template cards grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {templates.map((template) => (
          <div
            key={template.id}
            className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            {/* Header: name + uses */}
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-[13px] font-bold text-gray-900">
                {template.name}
              </h3>
              <span className="text-[11px] text-blue-500 font-medium whitespace-nowrap ms-3">
                {template.uses} {labels.uses}
              </span>
            </div>

            {/* Type badge */}
            <span
              className={`inline-block rounded-full border px-2.5 py-0.5 text-[10.5px] font-medium ${
                template.type === "announcement"
                  ? "border-gray-200 bg-gray-50 text-gray-600"
                  : "border-blue-200 bg-blue-50 text-blue-600"
              }`}
            >
              {template.type}
            </span>

            {/* Body preview */}
            <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-[11px] leading-relaxed text-gray-500 italic">
              &ldquo;{template.body}&rdquo;
            </p>

            {/* Actions */}
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                className="flex-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[10px] text-start font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
              >
                {labels.edit}
              </button>
              <button
                type="button"
                className="flex-1 rounded-lg border border-blue-200 bg-white px-2.5 py-1 text-[10px] text-start font-semibold text-blue-600 shadow-sm hover:bg-blue-50 transition-colors"
              >
                {labels.useTemplate}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
