"use client";

import Image from "next/image";
import { SECTIONS, type SectionId } from "@/lib/copy";
import { useLang } from "@/lib/i18n";
import { useActiveSection } from "@/lib/useActiveSection";
import { Icon } from "./icons";
import { LangSwitcher } from "./LangSwitcher";
import { BlobToggles } from "./blob/BlobSettings";

export function scrollToSection(id: SectionId) {
  const el = document.getElementById(id);
  if (el) window.scrollTo({ top: el.offsetTop - 12, behavior: "smooth" });
}

function useNavItems() {
  const { t } = useLang();
  const active = useActiveSection();
  return SECTIONS.map((s) => ({
    ...s,
    label: t.nav[s.navKey],
    href: `#${s.id}`,
    current: s.id === active,
  }));
}

/** Sticky left rail — visible from 880px up. */
export function SideRail({ showLabels = true }: { showLabels?: boolean }) {
  const items = useNavItems();

  return (
    <nav className="rail" aria-label="Sections">
      <div className="rail__mark">
        <Image src="/profile.webp" alt="Nhan Nguyen" fill sizes="92px" priority />
      </div>
      {items.map((item) => (
        <a
          key={item.id}
          href={item.href}
          className="rail__link"
          aria-current={item.current}
          onClick={(e) => {
            e.preventDefault();
            scrollToSection(item.id);
          }}
        >
          <Icon name={item.icon} size={24} />
          {showLabels ? (
            <span className="rail__label">{item.label}</span>
          ) : (
            <span className="visually-hidden">{item.label}</span>
          )}
        </a>
      ))}
      <div className="rail__langs">
        <LangSwitcher />
        <BlobToggles />
      </div>
    </nav>
  );
}

/** Fixed bottom tab bar — the narrow-screen counterpart of the rail. */
export function TabBar() {
  const items = useNavItems();

  return (
    <nav className="tabbar" aria-label="Sections">
      {items.map((item) => (
        <a
          key={item.id}
          href={item.href}
          className="tabbar__link"
          aria-current={item.current}
          onClick={(e) => {
            e.preventDefault();
            scrollToSection(item.id);
          }}
        >
          <Icon name={item.icon} size={24} />
          <span className="tabbar__label">{item.label}</span>
        </a>
      ))}
    </nav>
  );
}
