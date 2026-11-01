import { useTranslations } from "next-intl";
import type { SessionAccount } from "@/src/lib/access";

type AccountBarProps = {
  account: SessionAccount | null;
  /** The Portal home in this locale, where users sign out and switch apps. */
  portalHomeUrl: string | null;
};

export default function AccountBar({ account, portalHomeUrl }: AccountBarProps) {
  const t = useTranslations("Access");

  if (!account && !portalHomeUrl) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-1 text-sm text-gray-600">
      {account ? (
        <p>
          {t.rich("signedInAs", {
            name: account.name,
            strong: (chunks) => (
              <strong className="font-semibold text-gray-900">
                {/* Isolated, so a Latin name's punctuation stays with it
                    in RTL. */}
                <bdi>{chunks}</bdi>
              </strong>
            ),
          })}
          {account.roleName ? (
            <>
              {" · "}
              <bdi>{account.roleName}</bdi>
            </>
          ) : null}
        </p>
      ) : null}
      {portalHomeUrl ? (
        <a href={portalHomeUrl} className="underline underline-offset-4">
          {t("backToPortal")}
        </a>
      ) : null}
    </div>
  );
}
