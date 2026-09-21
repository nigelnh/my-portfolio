"use client";

import { LangProvider } from "@/lib/i18n";
import { site } from "@/lib/site";
import { BlobSettingsProvider } from "./blob/BlobSettings";
import { SideRail, TabBar } from "./Nav";
import { About } from "./sections/About";
import { Journey } from "./sections/Journey";
import { Experience } from "./sections/Experience";
import { Projects } from "./sections/Projects";
import { Stack } from "./sections/Stack";
import { Arcade } from "./sections/Arcade";
import { Contact } from "./sections/Contact";

export function Portfolio() {
  return (
    <LangProvider>
      <BlobSettingsProvider>
        <div className="page" data-grid={site.showPixelGrid ? "on" : "off"}>
          <SideRail showLabels={site.navLabels} />
          <main className="main">
            <About />
            <Journey />
            <Experience />
            <Projects />
            <Stack />
            <Arcade />
            <Contact />
          </main>
        </div>
        <TabBar />
      </BlobSettingsProvider>
    </LangProvider>
  );
}
