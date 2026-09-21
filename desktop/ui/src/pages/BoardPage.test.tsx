import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { BoardTask, InitiativeProject, Repository, WorkspaceConfig } from "@/api";
import { BoardPage } from "@/pages/BoardPage";
import { I18nProvider } from "@/hooks/useI18n";

const {
  listAllTasks,
  getWorkspaceConfig,
  listRepositories,
  listInitiativeProjects,
  listAgents,
  listActivity,
} = vi.hoisted(() => ({
  listAllTasks: vi.fn(),
  getWorkspaceConfig: vi.fn(),
  listRepositories: vi.fn(),
  listInitiativeProjects: vi.fn(),
  listAgents: vi.fn(),
  listActivity: vi.fn(),
}));

vi.mock("@/api", async () => {
  const actual = await vi.importActual<typeof import("@/api")>("@/api");
  return {
    ...actual,
    api: {
      ...actual.api,
      listAllTasks,
      getWorkspaceConfig,
      listRepositories,
      listInitiativeProjects,
      listAgents,
      listActivity,
    },
  };
});

const mockConfig: WorkspaceConfig = {
  settings: { key_prefix: "TT" },
  columns: [
    { id: "c1", slug: "todo", label: "To Do", position: 1, is_backlog: false },
    { id: "c2", slug: "in_progress", label: "In Progress", position: 2, is_backlog: false },
  ],
  members: [],
  subscriptions: [],
  transitions: [],
};

const mockProjects: InitiativeProject[] = [
  { id: "proj-1", name: "Alpha Project", description: "Alpha", created_at: "", updated_at: "" },
  { id: "proj-2", name: "Beta Project", description: "Beta", created_at: "", updated_at: "" },
];

const mockRepos: Repository[] = [
  {
    id: "repo-1",
    name: "Repo One",
    description: "",
    root_path: "/tmp/repo1",
    project_ids: ["proj-1"],
    created_at: "",
    updated_at: "",
  },
  {
    id: "repo-2",
    name: "Repo Two",
    description: "",
    root_path: "/tmp/repo2",
    project_ids: ["proj-2"],
    created_at: "",
    updated_at: "",
  },
];

const mockTasks: BoardTask[] = [
  {
    id: "task-1",
    repository_id: "repo-1",
    key: "TT-1",
    task_number: 1,
    title: "Task in Repo One",
    task_type: "task",
    description: "",
    technical_description: "",
    column: "todo",
    position: 1,
    priority: "medium",
    created_by: "human",
    created_at: "2026-09-20T10:00:00Z",
    updated_at: "2026-09-20T10:00:00Z",
  },
  {
    id: "task-2",
    repository_id: "repo-2",
    key: "TT-2",
    task_number: 2,
    title: "Task in Repo Two",
    task_type: "bug",
    description: "",
    technical_description: "",
    column: "todo",
    position: 2,
    priority: "high",
    created_by: "human",
    created_at: "2026-09-20T10:00:00Z",
    updated_at: "2026-09-20T10:00:00Z",
  },
];

describe("BoardPage", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    listAllTasks.mockReset().mockResolvedValue({ tasks: mockTasks });
    getWorkspaceConfig.mockReset().mockResolvedValue(mockConfig);
    listRepositories.mockReset().mockResolvedValue({ repositories: mockRepos });
    listInitiativeProjects.mockReset().mockResolvedValue({ projects: mockProjects });
    listAgents.mockReset().mockResolvedValue({ agents: [] });
    listActivity.mockReset().mockResolvedValue({ items: [] });
  });

  it("renders board with project and repository filters and displays tasks", async () => {
    render(
      <I18nProvider>
        <MemoryRouter initialEntries={["/board"]}>
          <BoardPage />
        </MemoryRouter>
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Board")).toBeInTheDocument();
      expect(screen.getByText("Task in Repo One")).toBeInTheDocument();
      expect(screen.getByText("Task in Repo Two")).toBeInTheDocument();
    });

    // The filter triggers exist in the document (defaulting to "All projects" and "All repositories")
    expect(screen.getByText("All projects")).toBeInTheDocument();
    expect(screen.getByText("All repositories")).toBeInTheDocument();
  });
});
