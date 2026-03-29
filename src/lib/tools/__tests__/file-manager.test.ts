import { test, expect, beforeEach } from "vitest";
import { VirtualFileSystem } from "@/lib/file-system";
import { buildFileManagerTool } from "../file-manager";

let fs: VirtualFileSystem;
let execute: (args: { command: "rename" | "delete"; path: string; new_path?: string }) => Promise<unknown>;

beforeEach(() => {
  fs = new VirtualFileSystem();
  const tool = buildFileManagerTool(fs);
  execute = tool.execute as typeof execute;
});

test("rename succeeds and file is accessible at new path", async () => {
  fs.createFileWithParents("src/Button.tsx", "export default function Button() {}");

  const result = await execute({ command: "rename", path: "src/Button.tsx", new_path: "src/components/Button.tsx" });

  expect(result).toEqual({ success: true, message: "Successfully renamed src/Button.tsx to src/components/Button.tsx" });
  expect(fs.exists("/src/components/Button.tsx")).toBe(true);
  expect(fs.exists("/src/Button.tsx")).toBe(false);
});

test("rename fails when source path does not exist", async () => {
  const result = await execute({ command: "rename", path: "src/Missing.tsx", new_path: "src/Other.tsx" });

  expect(result).toEqual({ success: false, error: "Failed to rename src/Missing.tsx to src/Other.tsx" });
});

test("rename fails when destination path already exists", async () => {
  fs.createFileWithParents("src/Foo.tsx", "");
  fs.createFileWithParents("src/Bar.tsx", "");

  const result = await execute({ command: "rename", path: "src/Foo.tsx", new_path: "src/Bar.tsx" });

  expect(result).toEqual({ success: false, error: "Failed to rename src/Foo.tsx to src/Bar.tsx" });
  expect(fs.exists("/src/Foo.tsx")).toBe(true);
});

test("rename fails when new_path is omitted", async () => {
  fs.createFileWithParents("src/Button.tsx", "");

  const result = await execute({ command: "rename", path: "src/Button.tsx" });

  expect(result).toEqual({ success: false, error: "new_path is required for rename command" });
});

test("rename creates intermediate directories as needed", async () => {
  fs.createFileWithParents("src/Button.tsx", "content");

  const result = await execute({ command: "rename", path: "src/Button.tsx", new_path: "src/components/ui/Button.tsx" });

  expect(result).toMatchObject({ success: true });
  expect(fs.exists("/src/components/ui/Button.tsx")).toBe(true);
  expect(fs.exists("/src/components/ui")).toBe(true);
});

test("rename preserves file content", async () => {
  const content = "export default function Button() {}";
  fs.createFileWithParents("src/Button.tsx", content);

  await execute({ command: "rename", path: "src/Button.tsx", new_path: "src/NewButton.tsx" });

  expect(fs.viewFile("/src/NewButton.tsx")).toContain(content);
});
