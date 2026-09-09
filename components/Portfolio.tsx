"use client";

import { LangProvider } from "@/lib/i18n";
import { site } from "@/lib/site";
import { BlobProvider } from "./Blob";
import { SideRail, TabBar } from "./Nav";
import { About } from "./sections/About";
import { Journey } from "./sections/Journey";
import { Experience } from "./sections/Experience";
import { Projects } from "./sections/Projects";
import { Stack } from "./sections/Stack";
import { Contact } from "./sections/Contact";

export function Portfolio() {
  return (
    <LangProvider>
      <BlobProvider>
        <div className="page" data-grid={site.showPixelGrid ? "on" : "off"}>
          <SideRail showLabels={site.navLabels} />
          <main className="main">
            <About />
            <Journey />
            <Experience />
            <Projects />
            <Stack />
            <Contact />
          </main>
        </div>
        <TabBar />
      </BlobProvider>
    </LangProvider>
  );
}
