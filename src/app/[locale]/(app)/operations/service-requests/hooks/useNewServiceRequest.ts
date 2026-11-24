"use client";

import { useCallback, useState } from "react";
import { useApiMutation } from "@/src/hooks/useApiMutation";
import { useApiQuery } from "@/src/hooks/useApiQuery";
import { useDropdowns, useServiceOptions } from "@/src/hooks/useDropdowns";
import { useOwnedUnitSearch } from "@/src/hooks/useOwnedUnitSearch";
import { fetchCustomer } from "@/src/services/customers";
import { createServiceRequest, createServiceRequestBody } from "@/src/services/serviceRequests";
import {
  cairoNow,
  emptyNewRequestForm,
  requesterOf,
  validateNewRequest,
  type NewRequestErrors,
  type NewRequestFormValues,
} from "../utils";

type Options = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
  /** After the request is created (the modal then closes). */
  onCreated: () => void;
};

/**
 * New Request (`POST /orders/tickets`): the owned-unit search (the unit carries its project and
 * owners), the owner's mobile from their customer record (`GET /customers/:id`, which the unit
 * list doesn't carry), the project's departments (`GET /definitions/all-dropdowns`) and the
 * chosen department's services with their prices (`GET /definitions/services`), and saving.
 */
export function useNewServiceRequest({ apiBaseUrl, portalBaseUrl, onCreated }: Options) {
  const [values, setValues] = useState<NewRequestFormValues>(emptyNewRequestForm);
  const [errors, setErrors] = useState<NewRequestErrors>({});
  const unitSearch = useOwnedUnitSearch({ apiBaseUrl, portalBaseUrl });
  const { unit, owner } = unitSearch;
  const projectId = unit?.projectId ?? null;
  const save = useApiMutation({ apiBaseUrl, portalBaseUrl });

  const dropdowns = useDropdowns({ apiBaseUrl, portalBaseUrl, projectId, enabled: projectId !== null });
  // Another unit may be in another project: a department it doesn't list no longer counts.
  const departments = dropdowns.loading ? [] : (dropdowns.data?.departments ?? []);
  const departmentId = departments.some((department) => department.id === values.departmentId)
    ? values.departmentId
    : null;

  const services = useServiceOptions({ apiBaseUrl, portalBaseUrl, projectId, departmentId });
  // While another department's list loads, the previous one doesn't count.
  const serviceOptions = departmentId !== null && !services.loading ? (services.data ?? []) : [];
  const service = serviceOptions.find((option) => option.id === values.serviceId) ?? null;

  const ownerId = owner?.customerId ?? null;
  const customer = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: `customer|${ownerId ?? ""}`,
    enabled: ownerId !== null,
    load: ({ apiBaseUrl: base, locale }) => fetchCustomer(base, ownerId as number, locale),
  });
  const customerLoaded = ownerId !== null && !customer.loading && customer.data?.id === ownerId;
  const ownerMobile = customerLoaded ? customer.data?.mobile?.trim() || null : null;

  const set = useCallback(<K extends keyof NewRequestFormValues>(field: K, value: NewRequestFormValues[K]) => {
    setValues((current) => ({
      ...current,
      [field]: value,
      // A new department lists other services.
      ...(field === "departmentId" ? { serviceId: null } : {}),
    }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }, []);

  // The picker sets the unit and owner itself: their flags last only while still true.
  const shownErrors: NewRequestErrors = {
    ...errors,
    unit: unit ? undefined : errors.unit,
    ownerId: owner ? undefined : errors.ownerId,
    customer: customerLoaded && !ownerMobile ? errors.customer : undefined,
  };

  const { run } = save;
  const submit = useCallback(async () => {
    const checked = validateNewRequest(
      { ...values, departmentId },
      { unit, owner, ownerMobile, service, now: cairoNow(new Date()) },
    );
    if (!checked.ok) {
      setErrors(checked.errors);
      return false;
    }
    setErrors({});
    const ticketId = await run(({ apiBaseUrl: base, locale }) =>
      createServiceRequest(base, createServiceRequestBody(checked.input), locale),
    );
    if (ticketId === undefined) return false;
    onCreated();
    return true;
  }, [values, departmentId, unit, owner, ownerMobile, service, run, onCreated]);

  return {
    values,
    set,
    errors: shownErrors,
    unitSearch,
    departmentId,
    departments,
    departmentsLoading: projectId !== null && dropdowns.loading,
    departmentsFailure: projectId !== null ? dropdowns.failure : null,
    reloadDepartments: dropdowns.reload,
    serviceOptions,
    service,
    servicesLoading: departmentId !== null && services.loading,
    servicesFailure: departmentId !== null ? services.failure : null,
    reloadServices: services.reload,
    /** The owner's record, for their mobile; loading or failed only once an owner is chosen. */
    customerLoading: ownerId !== null && customer.loading,
    customerFailure: ownerId !== null ? customer.failure : null,
    reloadCustomer: customer.reload,
    customerLoaded,
    ownerMobile,
    /** The requester shown: the owner's until edited. */
    requester: requesterOf(values, { owner, ownerMobile }),
    /** The earliest due date the date picker offers (today in Cairo). */
    minDueDate: cairoNow(new Date()).slice(0, 10),
    submit,
    pending: save.pending,
    failure: save.failure,
  };
}

export type NewServiceRequestForm = ReturnType<typeof useNewServiceRequest>;
