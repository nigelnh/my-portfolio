"use client";

import { useCallback, useRef, useState } from "react";
import { projectsMeta, type ProjectId, type Strings } from "@/lib/copy";

export interface Line {
  id: number;
  text: string;
  kind?: "cmd" | "err" | "ok" | "dim";
}

const PROMPT_HOST = "nhan@macbook-pro-m1";

export interface Terminal {
  lines: Line[];
  cwd: ProjectId | null;
  prompt: string;
  running: ProjectId | null;
  submit: (raw: string) => void;
  reset: (t: Strings) => void;
  recall: (dir: -1 | 1) => string | null;
}

/**
 * A small but real shell: `ls`, `cd`, `run`, `open`, `clear`, `help`,
 * `whoami`, `exit`. Unknown input reports "command not found", like a shell.
 */
export function useTerminal({
  t,
  titles,
  onShutdown,
}: {
  t: Strings;
  /** Project display names in the current language, keyed by id. */
  titles: Record<string, string>;
  onShutdown: () => void;
}): Terminal {
  const [lines, setLines] = useState<Line[]>([]);
  const [cwd, setCwd] = useState<ProjectId | null>(null);
  const [running, setRunning] = useState<ProjectId | null>(null);
  const nextId = useRef(0);
  const history = useRef<string[]>([]);
  const cursor = useRef(-1);

  const push = useCallback((entries: Array<string | [string, Line["kind"]]>) => {
    setLines((prev) => [
      ...prev,
      ...entries.map((e) => {
        const [text, kind] = Array.isArray(e) ? e : [e, undefined];
        return { id: nextId.current++, text, kind };
      }),
    ]);
  }, []);

  const reset = useCallback(
    (strings: Strings) => {
      setLines([]);
      setCwd(null);
      setRunning(null);
      nextId.current = 0;
      push([
        ["Last login: today on ttys001", "dim"],
        ["macOS 14 · Apple M1 Pro · zsh", "dim"],
        "",
        [strings.mac.hintBoot, "ok"],
      ]);
    },
    [push],
  );

  const listProjects = useCallback(() => {
    push(
      projectsMeta.map((p) => {
        const flag = p.url ? "" : `  (${t.mac.notDeployed})`;
        return [`${p.id.padEnd(8)}${titles[p.id] ?? p.id}${flag}`, p.url ? undefined : "dim"] as [
          string,
          Line["kind"],
        ];
      }),
    );
  }, [push, t.mac.notDeployed, titles]);

  const submit = useCallback(
    (raw: string) => {
      const input = raw.trim();
      const prompt = `${PROMPT_HOST}:~/portfolio${cwd ? `/${cwd}` : ""} $ ${input}`;
      push([[prompt, "cmd"]]);

      if (input) {
        history.current = [...history.current, input];
        cursor.current = -1;
      }
      if (!input) return;

      const [cmd, ...args] = input.split(/\s+/);
      const arg = args[0];

      switch (cmd) {
        case "help":
          push([
            "ls              list projects",
            "cd <id>         select a project (cd .. to deselect)",
            "run [id]        launch the selected project on this screen",
            "open            open the running project in a new tab",
            "clear           clear the screen",
            "exit            shut the machine down",
          ]);
          return;

        case "ls":
          listProjects();
          return;

        case "whoami":
          push(["nhan"]);
          return;

        case "pwd":
          push([`/Users/nhan/portfolio${cwd ? `/${cwd}` : ""}`]);
          return;

        case "cd": {
          if (!arg || arg === "~" || arg === "..") {
            setCwd(null);
            setRunning(null);
            return;
          }
          const found = projectsMeta.find((p) => p.id === arg);
          if (!found) {
            push([[`cd: no such project: ${arg}`, "err"]]);
            return;
          }
          setCwd(found.id);
          setRunning(null);
          push([[`${t.mac.selected}: ${titles[found.id] ?? found.id}`, "ok"], [t.mac.hintTerminal, "dim"]]);
          return;
        }

        case "run": {
          const id = arg ?? cwd;
          if (!id) {
            push([[t.mac.noSelection, "err"]]);
            return;
          }
          const found = projectsMeta.find((p) => p.id === id);
          if (!found) {
            push([[`run: no such project: ${id}`, "err"]]);
            return;
          }
          // Widened so the guard survives every project currently having a URL.
          const url: string | null = found.url;
          if (!url) {
            push([[`run: ${found.id}: ${t.mac.notDeployed}`, "err"]]);
            return;
          }
          setCwd(found.id);
          push([[`booting ${url} ...`, "ok"]]);
          setRunning(found.id);
          return;
        }

        case "open": {
          const found = projectsMeta.find((p) => p.id === running);
          if (!found?.url) {
            push([[t.mac.noSelection, "err"]]);
            return;
          }
          window.open(found.url, "_blank", "noopener,noreferrer");
          return;
        }

        case "clear":
          setLines([]);
          return;

        case "exit":
        case "shutdown":
          push([[t.mac.shutdown, "dim"]]);
          onShutdown();
          return;

        default:
          push([[`zsh: ${t.mac.unknown}: ${cmd}`, "err"]]);
      }
    },
    [cwd, listProjects, onShutdown, push, running, t.mac, titles],
  );

  /** Up/down arrow history, like a real shell. */
  const recall = useCallback((dir: -1 | 1) => {
    const h = history.current;
    if (!h.length) return null;
    if (cursor.current === -1) cursor.current = h.length;
    cursor.current = Math.max(0, Math.min(h.length, cursor.current + dir));
    return cursor.current === h.length ? "" : h[cursor.current];
  }, []);

  return {
    lines,
    cwd,
    running,
    prompt: `${PROMPT_HOST}:~/portfolio${cwd ? `/${cwd}` : ""} $`,
    submit,
    reset,
    recall,
  };
}
