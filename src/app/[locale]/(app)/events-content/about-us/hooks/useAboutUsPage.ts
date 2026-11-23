"use client";

import { useCallback, useMemo, useState } from "react";
import { useApiMutation } from "@/src/hooks/useApiMutation";
import { useApiQuery } from "@/src/hooks/useApiQuery";
import {
  fetchAboutUsContent,
  saveAboutUsContent,
  type AboutUsContent,
} from "@/src/services/aboutUs";

type Options = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
};

/**
 * The About Us text: loaded from the branding, edited locally, saved back. Saving is refused
 * until the current text has loaded, so a failed load can't overwrite it with blanks.
 */
export function useAboutUsPage({ apiBaseUrl, portalBaseUrl }: Options) {
  const content = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: "about-us",
    load: ({ apiBaseUrl: base, locale }) => fetchAboutUsContent(base, locale),
  });

  // What the user typed; until then the fields show what the API holds.
  const [draft, setDraft] = useState<AboutUsContent | null>(null);
  const current: AboutUsContent = useMemo(
    () => draft ?? content.data ?? { contentEn: "", contentAr: "" },
    [draft, content.data],
  );
  const loaded = content.data !== null;

  const setContentEn = useCallback(
    (contentEn: string) => setDraft((previous) => ({ ...(previous ?? current), contentEn })),
    [current],
  );
  const setContentAr = useCallback(
    (contentAr: string) => setDraft((previous) => ({ ...(previous ?? current), contentAr })),
    [current],
  );

  const save = useApiMutation({ apiBaseUrl, portalBaseUrl });
  const { run } = save;
  /** Resolves true once the API has saved it. */
  const submit = useCallback(async () => {
    if (!loaded) return false;
    const saved = await run(({ apiBaseUrl: base, locale }) => saveAboutUsContent(base, current, locale));
    if (!saved) return false;
    setDraft(saved);
    return true;
  }, [loaded, run, current]);

  return {
    contentEn: current.contentEn,
    contentAr: current.contentAr,
    setContentEn,
    setContentAr,
    loading: content.loading,
    loaded,
    loadFailure: content.failure,
    reload: content.reload,
    submit,
    savePending: save.pending,
    saveFailure: save.failure,
  };
}
