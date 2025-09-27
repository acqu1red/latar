"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const onSelectChange = (nextLocale: string) => {
    const newPath = `/${nextLocale}${pathname.substring(3)}`; // Adjust path for /en/ or /ru/
    router.push(newPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          {locale.toUpperCase()}
          <span className="sr-only">{t("label")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onSelectChange("en")}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSelectChange("ru")}>
          Русский
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
