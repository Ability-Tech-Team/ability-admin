"use client";

import { useCallback, useState } from "react";
import { useApiDownload } from "@/src/hooks/useApiDownload";
import { useApiMutation } from "@/src/hooks/useApiMutation";
import { useApiQuery } from "@/src/hooks/useApiQuery";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import {
  createCustomer,
  customersSheetRequest,
  deleteCustomer,
  fetchCustomer,
  fetchCustomers,
  updateCustomer,
} from "@/src/services/customers";
import type { Customer, CustomerFilters, CustomerFormValues, CustomerSearchField } from "../types";
import { buildCreateCustomerBody, buildUpdateCustomerBody, singleChoice } from "../utils";
import { fetchProjectOptions } from "@/src/services/projects";

type Options = {
  /** Where the browser calls the API (`browserApiBaseUrl`), or null when the sign-in names none this app trusts. */
  apiBaseUrl: string | null;
  /** Ability Portal, for signing in again when the session has ended. */
  portalBaseUrl: string | null;
};

const toId = (value: string | null) => (value === null ? null : Number(value));

/**
 * The project options the customer screens filter and save with. `GET /projects` is Super
 * Admin only: for another role `forbidden` is true and the screens leave the choice out.
 */
export function useProjectOptions({ apiBaseUrl, portalBaseUrl }: Options) {
  const query = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: "projects",
    load: ({ apiBaseUrl, locale }) => fetchProjectOptions(apiBaseUrl, { activeOnly: true }, locale),
  });
  return {
    options: query.data,
    loading: query.loading,
    forbidden: query.failure?.reason === "forbidden",
    failure: query.failure,
    reload: query.reload,
  };
}

/** One customer with their projects and files, while `customerId` is set. */
export function useCustomerDetail({ apiBaseUrl, portalBaseUrl }: Options, customerId: number | null) {
  return useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: `customer|${customerId}`,
    enabled: customerId !== null,
    load: ({ apiBaseUrl, locale }) => fetchCustomer(apiBaseUrl, customerId as number, locale),
  });
}

/**
 * The customers list: the search and filters (applied by the API, the search box debounced),
 * the page, and the saves (status switch, add, edit, delete), each of which reloads the list.
 */
export function useCustomersPage(options: Options) {
  const { apiBaseUrl, portalBaseUrl } = options;
  const exporting = useApiDownload({ apiBaseUrl, portalBaseUrl });
  const [search, setSearchValue] = useState("");
  const [searchField, setSearchFieldValue] = useState<CustomerSearchField>("name");
  const [projectChoice, setProjectChoice] = useState<ReadonlySet<string>>(new Set());
  const [ownershipChoice, setOwnershipChoice] = useState<ReadonlySet<string>>(new Set());
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(search);
  const filters: CustomerFilters = {
    search: debouncedSearch,
    searchField,
    projectId: toId(singleChoice(projectChoice)),
    ownershipId: toId(singleChoice(ownershipChoice)),
  };
  const filtersKey = JSON.stringify(filters);

  const list = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: `customers|${filtersKey}|${page}`,
    load: ({ apiBaseUrl, locale }) => fetchCustomers(apiBaseUrl, filters, page, locale),
  });

  const projects = useProjectOptions(options);

  // A new filter starts again from the first page.
  const setSearch = useCallback((value: string) => {
    setSearchValue(value);
    setPage(1);
  }, []);
  const setSearchField = useCallback((value: CustomerSearchField) => {
    setSearchFieldValue(value);
    setPage(1);
  }, []);
  const setProjects = useCallback((value: ReadonlySet<string>) => {
    setProjectChoice(value);
    setPage(1);
  }, []);
  const setOwnerships = useCallback((value: ReadonlySet<string>) => {
    setOwnershipChoice(value);
    setPage(1);
  }, []);

  const rowAction = useApiMutation(options);
  const formAction = useApiMutation(options);
  const deleteAction = useApiMutation(options);
  const { reload } = list;
  const { run: runRow } = rowAction;
  const { run: runForm } = formAction;
  const { run: runDelete } = deleteAction;

  /** The row's status switch. */
  const setActive = useCallback(
    async (customer: Customer, active: boolean) => {
      const done = await runRow(({ apiBaseUrl, locale }) =>
        updateCustomer(apiBaseUrl, customer.id, { is_active: active ? 1 : 0 }, locale).then(() => true),
      );
      if (done) reload();
    },
    [runRow, reload],
  );

  /** Resolves true once saved; the form stays open with `formAction.failure` otherwise. */
  const create = useCallback(
    async (values: CustomerFormValues) => {
      const done = await runForm(({ apiBaseUrl, locale }) =>
        createCustomer(apiBaseUrl, buildCreateCustomerBody(values), locale).then(() => true),
      );
      if (done) reload();
      return Boolean(done);
    },
    [runForm, reload],
  );

  const update = useCallback(
    async (customer: Customer, values: CustomerFormValues) => {
      const body = buildUpdateCustomerBody(customer, values);
      if (Object.keys(body).length === 0) return true;
      const done = await runForm(({ apiBaseUrl, locale }) =>
        updateCustomer(apiBaseUrl, customer.id, body, locale).then(() => true),
      );
      if (done) reload();
      return Boolean(done);
    },
    [runForm, reload],
  );

  /**
   * Removes the customer from one project. Resolves with whether the customer itself was
   * deleted (their last project), or undefined when the API refused.
   */
  const remove = useCallback(
    async (customerId: number, projectId: number) => {
      const deleted = await runDelete(({ apiBaseUrl, locale }) =>
        deleteCustomer(apiBaseUrl, customerId, projectId, locale),
      );
      if (deleted !== undefined) reload();
      return deleted;
    },
    [runDelete, reload],
  );

  return {
    search,
    setSearch,
    searchField,
    setSearchField,
    setProjects,
    setOwnerships,
    /** A filter with several ticked is ignored: the API takes one value. */
    severalTicked: projectChoice.size > 1 || ownershipChoice.size > 1,
    page,
    setPage,
    list,
    projects,
    exportSheet: () => exporting.download(customersSheetRequest(filters)),
    exporting,
    setActive,
    rowAction,
    create,
    update,
    formAction,
    remove,
    deleteAction,
  };
}
