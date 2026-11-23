"use client";

import DeliveryLogsTable, { type DeliveryLogsLabels } from "./DeliveryLogsTable";

type Props = {
  labels: DeliveryLogsLabels;
};

/** No admin route lists what was sent or how its pushes went, so the logs have nothing to load. */
export default function DeliveryLogsPageClient({ labels }: Props) {
  return <DeliveryLogsTable labels={labels} />;
}
