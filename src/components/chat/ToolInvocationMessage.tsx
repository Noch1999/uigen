"use client";

import { Loader2 } from "lucide-react";
import type { ToolInvocation } from "ai";

interface ToolInvocationMessageProps {
  toolInvocation: ToolInvocation;
}

function getFileName(path: string): string {
  return path.split("/").pop() || path;
}

export function getToolLabel(toolInvocation: ToolInvocation): string {
  const { toolName, args } = toolInvocation;

  if (toolName === "str_replace_editor") {
    const { command, path } = args as { command?: string; path?: string };
    if (!path) return toolName;
    const filename = getFileName(path);
    switch (command) {
      case "create":
        return `Creating ${filename}`;
      case "str_replace":
      case "insert":
        return `Editing ${filename}`;
      case "view":
        return `Viewing ${filename}`;
      default:
        return `Editing ${filename}`;
    }
  }

  if (toolName === "file_manager") {
    const { command, path, new_path } = args as {
      command?: string;
      path?: string;
      new_path?: string;
    };
    if (!path) return toolName;
    const filename = getFileName(path);
    switch (command) {
      case "delete":
        return `Deleting ${filename}`;
      case "rename":
        return new_path
          ? `Renaming ${filename} to ${getFileName(new_path)}`
          : `Renaming ${filename}`;
      default:
        return toolName;
    }
  }

  return toolName;
}

export function ToolInvocationMessage({
  toolInvocation,
}: ToolInvocationMessageProps) {
  const label = getToolLabel(toolInvocation);
  const isDone = toolInvocation.state === "result";

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
