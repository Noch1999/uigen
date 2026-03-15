import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationMessage, getToolLabel } from "../ToolInvocationMessage";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

// --- getToolLabel unit tests ---

test("getToolLabel: str_replace_editor create command", () => {
  const tool = { toolName: "str_replace_editor", args: { command: "create", path: "src/components/Button.tsx" } } as unknown as ToolInvocation;
  expect(getToolLabel(tool)).toBe("Creating Button.tsx");
});

test("getToolLabel: str_replace_editor str_replace command", () => {
  const tool = { toolName: "str_replace_editor", args: { command: "str_replace", path: "src/components/Button.tsx" } } as unknown as ToolInvocation;
  expect(getToolLabel(tool)).toBe("Editing Button.tsx");
});

test("getToolLabel: str_replace_editor insert command", () => {
  const tool = { toolName: "str_replace_editor", args: { command: "insert", path: "src/utils/helpers.ts" } } as unknown as ToolInvocation;
  expect(getToolLabel(tool)).toBe("Editing helpers.ts");
});

test("getToolLabel: str_replace_editor view command", () => {
  const tool = { toolName: "str_replace_editor", args: { command: "view", path: "src/app/page.tsx" } } as unknown as ToolInvocation;
  expect(getToolLabel(tool)).toBe("Viewing page.tsx");
});

test("getToolLabel: str_replace_editor unknown command falls back to Editing", () => {
  const tool = { toolName: "str_replace_editor", args: { command: "undo_edit", path: "src/lib/utils.ts" } } as unknown as ToolInvocation;
  expect(getToolLabel(tool)).toBe("Editing utils.ts");
});

test("getToolLabel: str_replace_editor missing path falls back to tool name", () => {
  const tool = { toolName: "str_replace_editor", args: {} } as unknown as ToolInvocation;
  expect(getToolLabel(tool)).toBe("str_replace_editor");
});

test("getToolLabel: file_manager delete command", () => {
  const tool = { toolName: "file_manager", args: { command: "delete", path: "src/components/OldComponent.tsx" } } as unknown as ToolInvocation;
  expect(getToolLabel(tool)).toBe("Deleting OldComponent.tsx");
});

test("getToolLabel: file_manager rename command with new_path", () => {
  const tool = { toolName: "file_manager", args: { command: "rename", path: "src/components/Foo.tsx", new_path: "src/components/Bar.tsx" } } as unknown as ToolInvocation;
  expect(getToolLabel(tool)).toBe("Renaming Foo.tsx to Bar.tsx");
});

test("getToolLabel: file_manager rename command without new_path", () => {
  const tool = { toolName: "file_manager", args: { command: "rename", path: "src/components/Foo.tsx" } } as unknown as ToolInvocation;
  expect(getToolLabel(tool)).toBe("Renaming Foo.tsx");
});

test("getToolLabel: file_manager missing path falls back to tool name", () => {
  const tool = { toolName: "file_manager", args: {} } as unknown as ToolInvocation;
  expect(getToolLabel(tool)).toBe("file_manager");
});

test("getToolLabel: unknown tool name returns tool name", () => {
  const tool = { toolName: "some_other_tool", args: {} } as unknown as ToolInvocation;
  expect(getToolLabel(tool)).toBe("some_other_tool");
});

// --- ToolInvocationMessage rendering tests ---

test("ToolInvocationMessage shows spinner when state is call", () => {
  const tool: ToolInvocation = {
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "create", path: "src/Button.tsx" },
    state: "call",
  };
  const { container } = render(<ToolInvocationMessage toolInvocation={tool} />);
  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
  // Spinner should be present (no green dot)
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
  expect(container.querySelector(".animate-spin")).toBeDefined();
});

test("ToolInvocationMessage shows green dot when state is result", () => {
  const tool: ToolInvocation = {
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "create", path: "src/Button.tsx" },
    state: "result",
    result: "Success",
  };
  const { container } = render(<ToolInvocationMessage toolInvocation={tool} />);
  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("ToolInvocationMessage renders str_replace as Editing", () => {
  const tool: ToolInvocation = {
    toolCallId: "2",
    toolName: "str_replace_editor",
    args: { command: "str_replace", path: "src/components/Card.tsx" },
    state: "result",
    result: "Success",
  };
  render(<ToolInvocationMessage toolInvocation={tool} />);
  expect(screen.getByText("Editing Card.tsx")).toBeDefined();
});

test("ToolInvocationMessage renders file_manager delete", () => {
  const tool: ToolInvocation = {
    toolCallId: "3",
    toolName: "file_manager",
    args: { command: "delete", path: "src/components/Old.tsx" },
    state: "result",
    result: { success: true },
  };
  render(<ToolInvocationMessage toolInvocation={tool} />);
  expect(screen.getByText("Deleting Old.tsx")).toBeDefined();
});

test("ToolInvocationMessage renders file_manager rename", () => {
  const tool: ToolInvocation = {
    toolCallId: "4",
    toolName: "file_manager",
    args: { command: "rename", path: "src/Foo.tsx", new_path: "src/Bar.tsx" },
    state: "call",
  };
  render(<ToolInvocationMessage toolInvocation={tool} />);
  expect(screen.getByText("Renaming Foo.tsx to Bar.tsx")).toBeDefined();
});
