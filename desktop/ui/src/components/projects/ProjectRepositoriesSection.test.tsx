import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { InitiativeProject, Repository } from "@/api";
import { ProjectRepositoriesSection } from "@/components/projects/ProjectRepositoriesSection";
import { I18nProvider } from "@/hooks/useI18n";

const mockProject: InitiativeProject = {
  id: "proj-1",
  name: "Laravel Apps",
  description: "Test project",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

const mockRepo: Repository = {
  id: "repo-1",
  name: "kartepemnet",
  description: "Kent rehberi",
  root_path: "C:\\Projeler\\kartepemnet",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  project_ids: ["proj-1"],
};

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <I18nProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </I18nProvider>,
  );
}

describe("ProjectRepositoriesSection drag and drop", () => {
  it("renders repository row without drag handle when onRepoDragStart is not provided", () => {
    renderWithProviders(
      <ProjectRepositoriesSection
        project={mockProject}
        repositories={[mockRepo]}
        projectNameById={{ "proj-1": "Laravel Apps" }}
        onEditProject={vi.fn()}
        onRestored={vi.fn()}
        onAddRepository={vi.fn()}
        addDisabled={false}
      />,
    );

    expect(screen.getByText("kartepemnet")).toBeInTheDocument();
    expect(screen.queryByTitle(/sürükleyin|Drag/i)).not.toBeInTheDocument();
  });

  it("renders drag handle when onRepoDragStart is provided", () => {
    renderWithProviders(
      <ProjectRepositoriesSection
        project={mockProject}
        repositories={[mockRepo]}
        projectNameById={{ "proj-1": "Laravel Apps" }}
        onEditProject={vi.fn()}
        onRestored={vi.fn()}
        onAddRepository={vi.fn()}
        addDisabled={false}
        onRepoDragStart={vi.fn()}
        onRepoDragEnd={vi.fn()}
      />,
    );

    expect(screen.getByText("kartepemnet")).toBeInTheDocument();
    expect(screen.getByTitle(/sürükleyin|Drag/i)).toBeInTheDocument();
  });

  it("highlights the card and renders drop cue when isDropTarget is true", () => {
    renderWithProviders(
      <ProjectRepositoriesSection
        project={mockProject}
        repositories={[mockRepo]}
        projectNameById={{ "proj-1": "Laravel Apps" }}
        onEditProject={vi.fn()}
        onRestored={vi.fn()}
        onAddRepository={vi.fn()}
        addDisabled={false}
        isDropTarget={true}
      />,
    );

    const card = screen.getByText("Laravel Apps").closest("[data-project-id='proj-1']") as HTMLElement;
    expect(card.className).toContain("border-primary");
    expect(card.className).toContain("bg-primary/5");
    expect(screen.getByText(/Drop to link to Laravel Apps/i)).toBeInTheDocument();
  });

  it("calls onDragOver and onDrop handlers", () => {
    const onDragOver = vi.fn();
    const onDrop = vi.fn();

    renderWithProviders(
      <ProjectRepositoriesSection
        project={mockProject}
        repositories={[mockRepo]}
        projectNameById={{ "proj-1": "Laravel Apps" }}
        onEditProject={vi.fn()}
        onRestored={vi.fn()}
        onAddRepository={vi.fn()}
        addDisabled={false}
        onDragOver={onDragOver}
        onDrop={onDrop}
      />,
    );

    const card = screen.getByText("Laravel Apps").closest("[data-project-id='proj-1']") as HTMLElement;
    fireEvent.dragOver(card);
    expect(onDragOver).toHaveBeenCalled();

    fireEvent.drop(card);
    expect(onDrop).toHaveBeenCalled();
  });
});
