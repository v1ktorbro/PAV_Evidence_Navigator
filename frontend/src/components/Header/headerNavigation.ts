export interface IHeaderNavigationItem {
  href: string;
  label: string;
}

export const HEADER_NAVIGATION_ITEMS: IHeaderNavigationItem[] = [
  {
    href: "/",
    label: "Доказательная база",
  },
  {
    href: "/sources",
    label: "Каталог источников",
  },
  {
    href: "/reviews",
    label: "Проверка опытов",
  },
  {
    href: "/quality",
    label: "Контроль ТЗ",
  },
];
