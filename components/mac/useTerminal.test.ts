import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { STRINGS, projectsMeta } from "@/lib/copy";
import { useTerminal } from "./useTerminal";

/**
 * Characterization tests for the MacBook shell (slice S7): they pin what the
 * commands print and which state they change today.
 */

const t = STRINGS.en;
const titles: Record<string, string> = { cw: "CW Terminal", portal: "CW Portal", itch: "ITCH Handler" };
const HOST = "nhan@macbook-pro-m1";

let onShutdown: Mock<() => void>;
let openSpy: ReturnType<typeof vi.spyOn>;

function setup() {
  const hook = renderHook(() => useTerminal({ t, titles, onShutdown }));
  const run = (...cmds: string[]) => {
    for (const c of cmds) act(() => hook.result.current.submit(c));
  };
  /** Text of every line on screen, echoed prompts included. */
  const output = () => hook.result.current.lines.map((l) => l.text);
  return { hook, run, output, term: () => hook.result.current };
}

beforeEach(() => {
  onShutdown = vi.fn<() => void>();
  openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
});

afterEach(() => {
  cleanup();
  openSpy.mockRestore();
});

describe("useTerminal initial state and reset", () => {
  it("starts empty at the home directory with nothing running", () => {
    const { term } = setup();
    expect(term().lines).toEqual([]);
    expect(term().cwd).toBeNull();
    expect(term().running).toBeNull();
    expect(term().prompt).toBe(`${HOST}:~/portfolio $`);
  });

  it("reset prints the login banner and clears cwd, running and history lines", () => {
    const { run, term, hook } = setup();
    run("cd cw", "run");
    act(() => term().reset(t));
    expect(term().cwd).toBeNull();
    expect(term().running).toBeNull();
    expect(term().lines.map((l) => [l.id, l.text, l.kind])).toEqual([
      [0, "Last login: today on ttys001", "dim"],
      [1, "", undefined],
      [2, t.mac.hintBoot, "ok"],
    ]);
    hook.unmount();
  });
});

describe("useTerminal commands", () => {
  it("echoes each command as a `cmd` line with the prompt and cwd", () => {
    const { run, term } = setup();
    run("whoami");
    expect(term().lines[0]).toMatchObject({ text: `${HOST}:~/portfolio $ whoami`, kind: "cmd" });
    run("cd cw", "pwd");
    expect(term().lines.some((l) => l.text === `${HOST}:~/portfolio/cw $ pwd`)).toBe(true);
  });

  it("ignores blank input after echoing the prompt, and adds nothing to history", () => {
    const { run, term } = setup();
    run("   ");
    expect(term().lines).toHaveLength(1);
    expect(term().lines[0]).toMatchObject({ kind: "cmd" });
    expect(term().recall(-1)).toBeNull();
  });

  it("help lists every command", () => {
    const { run, output } = setup();
    run("help");
    const out = output().slice(1).join("\n");
    for (const word of ["ls", "cd <id>", "cd ..", "run [id]", "open", "clear", "exit"]) {
      expect(out).toContain(word);
    }
    expect(output().slice(1)).toHaveLength(6);
  });

  it("ls lists the projects, padded to 8 columns", () => {
    const { run, output } = setup();
    run("ls");
    expect(output().slice(1)).toEqual([
      "cw      CW Terminal",
      "portal  CW Portal",
      "itch    ITCH Handler",
    ]);
  });

  it("ls falls back to the project id when no title is given", () => {
    const hook = renderHook(() => useTerminal({ t, titles: {}, onShutdown }));
    act(() => hook.result.current.submit("ls"));
    expect(hook.result.current.lines.slice(1).map((l) => l.text)).toEqual([
      "cw      cw",
      "portal  portal",
      "itch    itch",
    ]);
  });

  it("whoami prints nhan", () => {
    const { run, output } = setup();
    run("whoami");
    expect(output().at(-1)).toBe("nhan");
  });

  it("pwd prints the path, including the selected project", () => {
    const { run, output } = setup();
    run("pwd");
    expect(output().at(-1)).toBe("/Users/nhan/portfolio");
    run("cd itch", "pwd");
    expect(output().at(-1)).toBe("/Users/nhan/portfolio/itch");
  });

  it("cd <id> selects the project, updates the prompt and prints two hint lines", () => {
    const { run, term } = setup();
    run("cd cw");
    expect(term().cwd).toBe("cw");
    expect(term().prompt).toBe(`${HOST}:~/portfolio/cw $`);
    const [, a, b] = term().lines;
    expect(a).toMatchObject({ text: `${t.mac.selected}: CW Terminal`, kind: "ok" });
    expect(b).toMatchObject({ text: t.mac.hintTerminal, kind: "dim" });
  });

  it("cd with an unknown id prints an error and leaves cwd alone", () => {
    const { run, term } = setup();
    run("cd cw", "cd nope");
    expect(term().cwd).toBe("cw");
    expect(term().lines.at(-1)).toMatchObject({ text: "cd: no such project: nope", kind: "err" });
  });

  it.each(["cd ..", "cd", "cd ~"])("`%s` goes home, stops the running project, prints nothing", (cmd) => {
    const { run, term } = setup();
    run("run cw");
    expect(term().running).toBe("cw");
    const before = term().lines.length;
    run(cmd);
    expect(term().cwd).toBeNull();
    expect(term().running).toBeNull();
    expect(term().lines.length).toBe(before + 1); // only the echoed prompt
  });

  it("cd to another project stops the running one", () => {
    const { run, term } = setup();
    run("run cw", "cd itch");
    expect(term().cwd).toBe("itch");
    expect(term().running).toBeNull();
  });

  it("run with no selection prints the no-selection error", () => {
    const { run, term } = setup();
    run("run");
    expect(term().lines.at(-1)).toMatchObject({ text: t.mac.noSelection, kind: "err" });
    expect(term().running).toBeNull();
  });

  it("run uses the selected project, boots its url and marks it running", () => {
    const { run, term } = setup();
    run("cd cw", "run");
    expect(term().running).toBe("cw");
    expect(term().lines.at(-1)).toMatchObject({ text: `booting ${projectsMeta[0].url} ...`, kind: "ok" });
  });

  it("run <id> selects that project and runs it, even from home", () => {
    const { run, term } = setup();
    run("run portal");
    expect(term().cwd).toBe("portal");
    expect(term().running).toBe("portal");
    expect(term().lines.at(-1)?.text).toBe(`booting ${projectsMeta[1].url} ...`);
  });

  it("run <unknown> prints an error", () => {
    const { run, term } = setup();
    run("run nope");
    expect(term().lines.at(-1)).toMatchObject({ text: "run: no such project: nope", kind: "err" });
    expect(term().running).toBeNull();
  });

  it("open before anything runs prints the no-selection error and opens nothing", () => {
    const { run, term } = setup();
    run("open");
    expect(term().lines.at(-1)).toMatchObject({ text: t.mac.noSelection, kind: "err" });
    expect(openSpy).not.toHaveBeenCalled();
  });

  it("open on a selected but not running project is also an error (needs `run` first)", () => {
    const { run } = setup();
    run("cd cw", "open");
    expect(openSpy).not.toHaveBeenCalled();
  });

  it("open launches the running project in a new, isolated tab and prints nothing", () => {
    const { run, term } = setup();
    run("run cw");
    const before = term().lines.length;
    run("open");
    expect(openSpy).toHaveBeenCalledWith(projectsMeta[0].url, "_blank", "noopener,noreferrer");
    expect(term().lines.length).toBe(before + 1);
  });

  it("clear empties the screen (the echo of `clear` itself goes too)", () => {
    const { run, term } = setup();
    run("ls", "whoami", "clear");
    expect(term().lines).toEqual([]);
  });

  it.each(["exit", "shutdown"])("%s prints the shutdown line and calls onShutdown once", (cmd) => {
    const { run, term } = setup();
    run(cmd);
    expect(term().lines.at(-1)).toMatchObject({ text: t.mac.shutdown, kind: "dim" });
    expect(onShutdown).toHaveBeenCalledTimes(1);
  });

  it("unknown commands report `zsh: command not found: <cmd>`; commands are case-sensitive", () => {
    const { run, term } = setup();
    run("foo bar");
    expect(term().lines.at(-1)).toMatchObject({ text: `zsh: ${t.mac.unknown}: foo`, kind: "err" });
    run("LS");
    expect(term().lines.at(-1)?.text).toBe(`zsh: ${t.mac.unknown}: LS`);
  });

  it("trims input and splits on any whitespace; extra args are ignored", () => {
    const { run, term } = setup();
    run("   cd    cw   extra ");
    expect(term().cwd).toBe("cw");
  });

  it("assigns increasing line ids", () => {
    const { run, term } = setup();
    run("whoami", "pwd");
    expect(term().lines.map((l) => l.id)).toEqual([0, 1, 2, 3]);
  });

  // The `run: <id>: not deployed yet` branch cannot be reached today because
  // every entry in projectsMeta has a url; it is deliberately not pinned.
});

describe("useTerminal history (arrow keys)", () => {
  it("returns null when there is no history", () => {
    const { term } = setup();
    expect(term().recall(-1)).toBeNull();
    expect(term().recall(1)).toBeNull();
  });

  it("walks back through commands with up and forward with down, ending on an empty line", () => {
    const { run, term } = setup();
    run("ls", "pwd", "whoami");
    expect(term().recall(-1)).toBe("whoami");
    expect(term().recall(-1)).toBe("pwd");
    expect(term().recall(-1)).toBe("ls");
    expect(term().recall(-1)).toBe("ls"); // clamped at the oldest
    expect(term().recall(1)).toBe("pwd");
    expect(term().recall(1)).toBe("whoami");
    expect(term().recall(1)).toBe(""); // past the newest: blank prompt
    expect(term().recall(1)).toBe(""); // stays blank
  });

  it("down arrow on a fresh cursor gives a blank line", () => {
    const { run, term } = setup();
    run("ls");
    expect(term().recall(1)).toBe("");
  });

  it("submitting resets the cursor to the newest entry", () => {
    const { run, term } = setup();
    run("ls", "pwd");
    expect(term().recall(-1)).toBe("pwd");
    expect(term().recall(-1)).toBe("ls");
    run("whoami");
    expect(term().recall(-1)).toBe("whoami");
  });

  it("records unknown commands and trimmed text, keeps duplicates, skips blank input", () => {
    const { run, term } = setup();
    run("ls", "  nonsense  ", "", "nonsense");
    expect(term().recall(-1)).toBe("nonsense");
    expect(term().recall(-1)).toBe("nonsense");
    expect(term().recall(-1)).toBe("ls");
    expect(term().recall(-1)).toBe("ls"); // clamped
  });

  it("history survives `clear` and `reset`", () => {
    const { run, term } = setup();
    run("ls", "clear");
    act(() => term().reset(t));
    expect(term().recall(-1)).toBe("clear");
    expect(term().recall(-1)).toBe("ls");
  });
});
