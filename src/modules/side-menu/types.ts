import type { IconProps } from "./icons";

export type SubItem = {
  key: string;
  href: string;
  icon: (props: IconProps) => React.ReactNode;
  badge?: number;
};

export type MenuItem = {
  key: string;
  href: string;
  icon: (props: IconProps) => React.ReactNode;
  children?: SubItem[];
};
