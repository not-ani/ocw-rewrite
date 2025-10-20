"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { memo, useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { GetIcon } from "./icons";
import type { SidebarData } from "./types";
import Link from "next/link";

const Overlay = ({
  data,
  onSelectUnit,
  onClose,
}: {
  data: SidebarData;
  onSelectUnit: (unitId: string) => void;
  onClose: () => void;
}) => (
  <AnimatePresence>
    <motion.div
      animate={{ opacity: 1 }}
      aria-modal="true"
      className="bg-background fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      transition={{ duration: 0.3 }}
    >
      <motion.div
        animate={{ y: 0, opacity: 1 }}
        className="border-sidebar-border bg-sidebar-background max-h-[80vh] w-[90vw] max-w-md overflow-y-auto rounded-lg border p-6 shadow-lg"
        exit={{ y: "50px", opacity: 0 }}
        initial={{ y: "-50px", opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-sidebar-foreground mb-4 text-xl font-semibold">
          Select Unit
        </h2>
        <ul className="space-y-1">
          {data.map((unit) => (
            <li key={unit.id}>
              <Button
                className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full justify-start px-2 py-1.5 text-left"
                onClick={() => onSelectUnit(unit.id)}
                variant="ghost"
              >
                {unit.name}
              </Button>
            </li>
          ))}
        </ul>
        <Button
          className="border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground mt-6 w-full"
          onClick={onClose}
          variant="outline"
        >
          Close
        </Button>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

function UnitLessonNav({
  data,
  courseId,
  initialUnitId,
  initialLessonId,
}: {
  data: SidebarData;
  courseId: string;
  initialUnitId: string;
  initialLessonId: string;
}) {
  const [currentUnitId, setCurrentUnitId] = useState<string>(initialUnitId);
  const [selectedLessonId, setSelectedLessonId] =
    useState<string>(initialLessonId);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  const currentUnitIndex = useMemo(
    () => data.findIndex((unit) => unit.id === currentUnitId),
    [data, currentUnitId],
  );

  const currentUnit = useMemo(
    () => (currentUnitIndex !== -1 ? data[currentUnitIndex] : undefined),
    [data, currentUnitIndex],
  );
  const prevUnit = useMemo(
    () => (currentUnitIndex > 0 ? data[currentUnitIndex - 1] : undefined),
    [data, currentUnitIndex],
  );
  const nextUnit = useMemo(
    () =>
      currentUnitIndex !== -1 && currentUnitIndex < data.length - 1
        ? data[currentUnitIndex + 1]
        : undefined,
    [data, currentUnitIndex],
  );

  // Modified: Only update state, do not navigate
  const handleUnitChange = useCallback(
    (newUnitId: string) => {
      setCurrentUnitId(newUnitId);
    },
    [], // Removed courseId and router from dependencies
  );

  const handleNextUnit = useCallback(() => {
    if (nextUnit) {
      handleUnitChange(nextUnit.id);
    }
  }, [nextUnit, handleUnitChange]);

  const handlePrevUnit = useCallback(() => {
    if (prevUnit) {
      handleUnitChange(prevUnit.id);
    }
  }, [prevUnit, handleUnitChange]);

  // This function now only updates the visual selection state
  const handleLessonClick = useCallback((lessonId: string) => {
    setSelectedLessonId(lessonId);
    // Navigation is handled by the Link component itself via its href
  }, []);

  const toggleOverlay = useCallback(() => {
    setIsOverlayOpen((prev) => !prev);
  }, []);

  // Selecting from overlay also only updates state now
  const handleSelectUnitFromOverlay = useCallback(
    (unitId: string) => {
      handleUnitChange(unitId);
      setIsOverlayOpen(false);
    },
    [handleUnitChange],
  );

  if (!currentUnit) {
    return <div className="text-sidebar-foreground p-4">Unit not found.</div>;
  }

  return (
    <>
      <SidebarGroup className="border-sidebar-border bg-sidebar-background sticky top-0 z-10 border-b p-2">
        <div className="flex items-center justify-between">
          <Button
            aria-label="Previous Unit"
            className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground disabled:opacity-50"
            disabled={!prevUnit}
            onClick={handlePrevUnit}
            size="icon"
            variant="ghost"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            aria-expanded={isOverlayOpen}
            aria-haspopup="dialog"
            className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-[20px] flex-1 truncate px-2 text-center text-sm font-medium"
            onClick={toggleOverlay}
            variant="ghost"
          >
            {currentUnit.name}
          </Button>
          <Button
            aria-label="Next Unit"
            className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground disabled:opacity-50"
            disabled={!nextUnit}
            onClick={handleNextUnit}
            size="icon"
            variant="ghost"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu className="list-none">
            {currentUnit.lessons.map((lesson) => (
              <SidebarMenuItem key={lesson.id}>
                <SidebarMenuButton
                  asChild
                  className="h-auto justify-start py-2 pr-2 pl-3 text-sm"
                  // Use onClick to update visual state *before* navigation potentially happens
                  isActive={selectedLessonId === lesson.id}
                  onClick={() => handleLessonClick(lesson.id)}
                >
                  <Link
                    rel={lesson.pureLink ? "noopener noreferrer" : undefined}
                    target={lesson.pureLink ? "_blank" : undefined}
                    href={
                      lesson.pureLink
                        ? (lesson?.embeds?.embedUrl ?? "#")
                        : `/course/${courseId}/${lesson.unitId}/${lesson.id}`
                    }
                  >
                    <GetIcon type={lesson.contentType} />
                    <span className="ml-2 truncate">{lesson.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {isOverlayOpen && (
        <Overlay
          data={data}
          onClose={toggleOverlay}
          onSelectUnit={handleSelectUnitFromOverlay}
        />
      )}
    </>
  );
}

export const UnitLessonNavigation = memo(UnitLessonNav);
