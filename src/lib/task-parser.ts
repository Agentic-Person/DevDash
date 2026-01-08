/**
 * Parses markdown checklist format into task objects
 * Supports:
 * - [ ] Task title (uncompleted)
 * - [x] Task title (completed)
 * - [X] Task title (completed)
 *
 * Also extracts categories from ## Heading sections
 */

export interface ParsedTask {
  title: string;
  completed: boolean;
  category?: string;
}

export function parseMarkdownTasks(markdown: string): ParsedTask[] {
  const lines = markdown.split("\n");
  const tasks: ParsedTask[] = [];
  let currentCategory: string | undefined;

  for (const line of lines) {
    const trimmed = line.trim();

    // Check for category heading (## Category Name)
    const headingMatch = trimmed.match(/^##\s+(.+)$/);
    if (headingMatch) {
      currentCategory = headingMatch[1].trim();
      continue;
    }

    // Check for task checkbox (- [ ] or - [x] or - [X])
    const taskMatch = trimmed.match(/^-\s*\[([ xX])\]\s+(.+)$/);
    if (taskMatch) {
      const completed = taskMatch[1].toLowerCase() === "x";
      const title = taskMatch[2].trim();

      if (title) {
        tasks.push({
          title,
          completed,
          category: currentCategory,
        });
      }
    }
  }

  return tasks;
}

/**
 * Converts tasks to markdown checklist format
 */
export function tasksToMarkdown(
  tasks: { title: string; completed: boolean; category?: string }[]
): string {
  // Group tasks by category
  const grouped = tasks.reduce(
    (acc, task) => {
      const cat = task.category || "General";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(task);
      return acc;
    },
    {} as Record<string, typeof tasks>
  );

  const lines: string[] = [];

  for (const [category, categoryTasks] of Object.entries(grouped)) {
    if (category !== "General") {
      lines.push(`## ${category}`);
    }
    for (const task of categoryTasks) {
      const checkbox = task.completed ? "[x]" : "[ ]";
      lines.push(`- ${checkbox} ${task.title}`);
    }
    lines.push(""); // Empty line between categories
  }

  return lines.join("\n").trim();
}
