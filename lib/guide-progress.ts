"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

export const GUIDE_PROGRESS_STORAGE_KEY = "viking_hub_guide_progress_v1";
const GUIDE_PROGRESS_EVENT = "viking-hub:guide-progress";

export type GuideProgressMap = Record<string, number[]>;

/**
 * Pure validator/parser for the stored JSON map of `{ [guideId: string]: number[] }`.
 * Keeps only valid non-negative integer step indices, deduplicated and sorted ascending.
 */
export function parseProgressMap(raw: string | null): GuideProgressMap {
  if (!raw || typeof raw !== "string") {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    const result: GuideProgressMap = {};
    for (const [key, value] of Object.entries(
      parsed as Record<string, unknown>,
    )) {
      const normalizedKey = key.trim();
      if (!normalizedKey || !Array.isArray(value)) {
        continue;
      }

      const validIndices = Array.from(
        new Set(
          value.filter(
            (idx): idx is number =>
              typeof idx === "number" &&
              Number.isInteger(idx) &&
              idx >= 0 &&
              idx < 500,
          ),
        ),
      ).sort((a, b) => a - b);

      if (validIndices.length > 0) {
        result[normalizedKey] = validIndices;
      }
    }

    return result;
  } catch (err) {
    if (typeof console !== "undefined") {
      console.warn("Unable to parse Viking Hub guide progress JSON:", err);
    }
    return {};
  }
}

/**
 * Pure selector returning completed 0-based step indices for a guide,
 * filtering out any index `>= totalSteps` if the Google Sheet step count changed.
 */
export function getCompletedFromMap(
  map: GuideProgressMap,
  guideId: string,
  totalSteps: number,
): number[] {
  const key = guideId.trim();
  if (!key || totalSteps <= 0) {
    return [];
  }
  const stored = map[key];
  if (!stored || stored.length === 0) {
    return [];
  }
  return stored.filter((idx) => idx >= 0 && idx < totalSteps);
}

/**
 * Pure immutable reducer toggling a 0-based step index for `guideId`.
 */
export function toggleStepInMap(
  map: GuideProgressMap,
  guideId: string,
  stepIndex: number,
  totalSteps: number,
): GuideProgressMap {
  const key = guideId.trim();
  if (
    !key ||
    !Number.isInteger(stepIndex) ||
    stepIndex < 0 ||
    stepIndex >= totalSteps
  ) {
    return map;
  }

  const current = getCompletedFromMap(map, key, totalSteps);
  const exists = current.includes(stepIndex);
  const nextIndices = exists
    ? current.filter((i) => i !== stepIndex)
    : [...current, stepIndex].sort((a, b) => a - b);

  const nextMap: GuideProgressMap = { ...map };
  if (nextIndices.length === 0) {
    delete nextMap[key];
  } else {
    nextMap[key] = nextIndices;
  }
  return nextMap;
}

/**
 * Pure immutable reducer clearing progress for a single guide.
 */
export function resetGuideInMap(
  map: GuideProgressMap,
  guideId: string,
): GuideProgressMap {
  const key = guideId.trim();
  if (!key || !(key in map)) {
    return map;
  }
  const nextMap: GuideProgressMap = { ...map };
  delete nextMap[key];
  return nextMap;
}

function subscribeToProgressStore(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (
      event.key === null ||
      event.key === GUIDE_PROGRESS_STORAGE_KEY
    ) {
      callback();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(GUIDE_PROGRESS_EVENT, callback);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(GUIDE_PROGRESS_EVENT, callback);
  };
}

function getClientProgressSnapshot(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage.getItem(GUIDE_PROGRESS_STORAGE_KEY);
  } catch {
    return null;
  }
}

function getServerProgressSnapshot(): string | null {
  return null;
}

function writeProgressMapToStorage(nextMap: GuideProgressMap): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const keys = Object.keys(nextMap);
    if (keys.length === 0) {
      window.localStorage.removeItem(GUIDE_PROGRESS_STORAGE_KEY);
    } else {
      window.localStorage.setItem(
        GUIDE_PROGRESS_STORAGE_KEY,
        JSON.stringify(nextMap),
      );
    }
    window.dispatchEvent(new Event(GUIDE_PROGRESS_EVENT));
  } catch (err) {
    if (typeof console !== "undefined") {
      console.warn("Unable to persist Viking Hub guide progress:", err);
    }
  }
}

function noopSubscribe(): () => void {
  return () => {};
}

/**
 * Hydration-safe shared hook for reading and updating student action guide checklist progress.
 * Uses `useSyncExternalStore` so server render and initial client render match 100%,
 * and updates propagate immediately across `GuidesView`, `RecordPreviewDrawer`, and `OverviewDashboard`.
 */
export function useGuideProgress() {
  const rawSnapshot = useSyncExternalStore(
    subscribeToProgressStore,
    getClientProgressSnapshot,
    getServerProgressSnapshot,
  );

  const isHydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  const progressMap = useMemo(
    () => parseProgressMap(rawSnapshot),
    [rawSnapshot],
  );

  const getCompletedSteps = useCallback(
    (guideId: string, totalSteps: number): number[] => {
      if (!isHydrated) {
        return [];
      }
      return getCompletedFromMap(progressMap, guideId, totalSteps);
    },
    [isHydrated, progressMap],
  );

  const toggleStep = useCallback(
    (guideId: string, stepIndex: number, totalSteps: number): void => {
      const currentRaw = getClientProgressSnapshot();
      const currentMap = parseProgressMap(currentRaw);
      const nextMap = toggleStepInMap(
        currentMap,
        guideId,
        stepIndex,
        totalSteps,
      );
      writeProgressMapToStorage(nextMap);
    },
    [],
  );

  const resetGuide = useCallback((guideId: string): void => {
    const currentRaw = getClientProgressSnapshot();
    const currentMap = parseProgressMap(currentRaw);
    const nextMap = resetGuideInMap(currentMap, guideId);
    writeProgressMapToStorage(nextMap);
  }, []);

  const resetAllGuides = useCallback((): void => {
    writeProgressMapToStorage({});
  }, []);

  return {
    progressMap,
    getCompletedSteps,
    toggleStep,
    resetGuide,
    resetAllGuides,
    isHydrated,
  };
}
