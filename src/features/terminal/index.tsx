import { useEffect, useRef, useState } from "react";
import { Header } from "../../components";

type Step = "title" | "description" | "type" | "priority" | "status";

const STEPS: Step[] = ["title", "description", "type", "priority", "status"];

const PROMPTS: Record<Step, string> = {
  title: "Enter title:",
  description: "Enter description:",
  type: "Select type (bug / feature / improvement):",
  priority: "Select priority (low / medium / high):",
  status: "Select status (open / in-progress / resolved):",
};

interface Issue {
  id: number;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
}

export default function Index() {
  const [lines, setLines] = useState<string[]>(["FixMe Issue Tracker CLI", "Type `fixme add` to create an issue"]);
  const [input, setInput] = useState("");
  const [stepIndex, setStepIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<Partial<Issue>>({});
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const appendLine = (line: string) => setLines((prev) => [...prev, line]);

  const runCommand = (command: string) => {
    if (command === "fixme add") {
      setDraft({});
      setStepIndex(0);
      setUpdatingId(null);
      appendLine(`> ${command}`);
      appendLine(PROMPTS.title);
      return;
    }

    if (command.startsWith("fixme select:")) {
      const id = parseInt(command.split(":")[1]);
      const issue = issues.find((i) => i.id === id);
      appendLine(`> ${command}`);
      if (!issue) {
        appendLine(`Issue #${id} not found`);
        return;
      }
      setSelectedId(id);
      setDraft(issue);
      setStepIndex(null);
      appendLine(`Selected issue #${id} for preview`);
      return;
    }

    if (command.startsWith("fixme update:")) {
      const id = parseInt(command.split(":")[1]);
      const issue = issues.find((i) => i.id === id);
      appendLine(`> ${command}`);
      if (!issue) {
        appendLine(`Issue #${id} not found`);
        return;
      }
      setUpdatingId(id);
      setDraft(issue);
      setStepIndex(0);
      appendLine(PROMPTS.title);
      return;
    }

    if (command.startsWith("fixme delete:")) {
      const id = parseInt(command.split(":")[1]);
      const index = issues.findIndex((i) => i.id === id);
      appendLine(`> ${command}`);
      if (index === -1) {
        appendLine(`Issue #${id} not found`);
        return;
      }
      const updated = [...issues];
      updated.splice(index, 1);
      setIssues(updated);
      appendLine(`✔ Issue #${id} deleted`);
      if (selectedId === id) setSelectedId(null);
      return;
    }

    if (command === "fixme list") {
      appendLine(`> ${command}`);
      if (issues.length === 0) {
        appendLine("No issues found");
        return;
      }
      issues.forEach((i) => appendLine(`${i.id}. [${i.status}] ${i.title} (${i.priority})`));
      return;
    }

    if (command === "fixme clear") {
      setLines([]);
      return;
    }

    appendLine(`> ${command}`);
    appendLine("Unknown command");
  };

  const handleStepInput = (value: string) => {
    const key = STEPS[stepIndex!];
    const updated = { ...draft, [key]: value };
    setDraft(updated);

    if (stepIndex! < STEPS.length - 1) {
      setStepIndex(stepIndex! + 1);
      appendLine(PROMPTS[STEPS[stepIndex! + 1]]);
    } else {
      if (updatingId !== null) {
        setIssues((prev) => prev.map((i) => (i.id === updatingId ? (updated as Issue) : i)));
        appendLine(`✔ Issue #${updatingId} updated successfully`);
      } else {
        const newIssue: Issue = { ...(updated as Issue), id: issues.length ? issues[issues.length - 1].id + 1 : 1 };
        setIssues((prev) => [...prev, newIssue]);
        appendLine(`✔ Issue #${newIssue.id} created successfully`);
      }
      setStepIndex(null);
      setUpdatingId(null);
      setDraft({});
    }
  };

  const handleEnter = () => {
    if (!input.trim()) return;
    if (stepIndex === null) runCommand(input.trim());
    else handleStepInput(input.trim());
    setInput("");
  };

  return (
    <div className="main-container">
      <div className="terminal-container p-3 d-flex flex-column">
        <Header />

        <main className="flex-grow-1 d-flex flex-row gap-2">
          {/* Left Pane */}
          <section className="p-2 w-100 border rounded d-flex flex-column" style={{ gap: "0.5rem" }}>
            <div className="flex-grow-1 overflow-auto">
              {lines.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>

            <div className="border-top-line d-flex align-items-center p-1" style={{ flexShrink: 0 }}>
              <span className="me-2">{">"}</span>
              <input
                ref={inputRef}
                className="custom-input w-100"
                type="text"
                placeholder="fixme..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEnter()}
              />
            </div>
          </section>

          {/* Right Pane */}
          <section className="w-100 d-flex flex-column gap-2">
            <div className="flex-grow-1 border rounded p-2 overflow-auto">
              <strong>
                {stepIndex !== null
                  ? updatingId !== null
                    ? `Update Issue #${updatingId}`
                    : "Add Issue"
                  : selectedId
                  ? `Preview Issue #${selectedId}`
                  : "Draft / Preview"}
              </strong>

              <div className="mt-2">
                {stepIndex !== null ? (
                  <div>
                    <div>{PROMPTS[STEPS[stepIndex]]}</div>
                    <div className="mt-1 bg-dark text-light p-2 rounded">{draft[STEPS[stepIndex]] || ""}</div>
                  </div>
                ) : (
                  <pre className="mt-2">{JSON.stringify(draft, null, 2)}</pre>
                )}
              </div>
            </div>

            <div className="flex-shrink-0 border rounded p-2 overflow-auto" style={{ maxHeight: "150px" }}>
              <strong>Help</strong>
              <div className="mt-1">Commands:</div>
              <ul className="ms-3">
                <li>fixme add — create a new issue</li>
                <li>fixme list — show all issues</li>
                <li>fixme select:ID — preview issue</li>
                <li>fixme update:ID — update issue step-by-step</li>
                <li>fixme delete:ID — delete issue</li>
                <li>fixme clear — clear terminal</li>
              </ul>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
