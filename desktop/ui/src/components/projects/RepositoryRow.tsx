import { FolderKanban, GripVertical, Settings, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { Repository } from "@/api";
import { RepositoryGitNotice } from "@/components/projects/RepositoryGitNotice";
import { ProjectIndexStatus } from "@/components/projects/ProjectIndexStatus";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/useI18n";
import { cn, formatRelativeDate } from "@/lib/utils";

interface RepositoryRowProps {
  repository: Repository;
  /** Only used to label a repo's OTHER project links — the section it is drawn in already says this one. */
  projectNameById: Record<string, string>;
  /** Omit to draw no bin icon — see `ProjectRepositoriesSection.onDeleteRepository`. */
  onDeleteRequest?: (repository: Repository) => void;
  onRestored: () => void;
  draggable?: boolean;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

/**
 * One repository, as a list row rather than a grid card — the shape that
 * fits inside a project's section now that repositories live under projects
 * instead of on their own page. Everything here is the same information the
 * standalone Repositories page showed; only the layout changed.
 */
export function RepositoryRow({
  repository,
  projectNameById,
  onDeleteRequest,
  onRestored,
  draggable = false,
  isDragging = false,
  onDragStart,
  onDragEnd,
}: RepositoryRowProps) {
  const { t } = useI18n();
  // Every project this repo is linked to, including the one whose section it
  // is drawn in — filtering that one out would need the caller to pass its
  // id in, for a badge row that only ever shows on the rarer multi-project repo.
  const linkedProjectIds = repository.project_ids ?? [];

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "px-4 py-3 transition-colors",
        draggable && "cursor-grab active:cursor-grabbing hover:bg-muted/40",
        isDragging && "opacity-50 ring-2 ring-primary/30 bg-primary/5",
      )}
    >
      <RepositoryGitNotice
        repository={repository}
        onRestored={onRestored}
        className="mb-3 rounded-lg px-3 py-2 text-xs shadow-none"
      />
      <div className="flex items-start gap-3">
        {draggable && (
          <div
            className="mt-2.5 text-muted-foreground/40 hover:text-muted-foreground shrink-0"
            title={t("projectAdmin.projects.dragToReassign")}
          >
            <GripVertical className="h-4 w-4" />
          </div>
        )}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          <FolderKanban className="h-4 w-4 text-muted-foreground" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="truncate font-medium">{repository.name}</h4>
            <div className="flex shrink-0 items-center gap-1">
              <ProjectIndexStatus repositoryId={repository.id} />
              {onDeleteRequest && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => onDeleteRequest(repository)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {repository.description || t("boardArea.repos.noDescription")}
          </p>
          {linkedProjectIds.length > 1 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {linkedProjectIds.map((pid) => (
                <Badge key={pid} variant="outline" className="text-micro">
                  {projectNameById[pid] ?? t("boardArea.repos.projectFallback")}
                </Badge>
              ))}
            </div>
          )}
          <p className="mt-1 text-micro text-muted-foreground">
            {t("boardArea.repos.updated", { date: formatRelativeDate(repository.updated_at) })}
          </p>
          <Button variant="outline" size="sm" className="mt-3 gap-2" asChild>
            <Link to={`/repositories/${repository.id}/settings`}>
              <Settings className="h-3.5 w-3.5" />
              {t("boardArea.repos.settings")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
