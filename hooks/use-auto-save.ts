'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface AutoSaveOptions {
  delay?: number;
  enabled?: boolean;
  onSave: (data: any) => Promise<void> | void;
  onError?: (error: Error) => void;
  saveOnUnmount?: boolean;
  ignoreFields?: string[];
}

export interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  saveCount: number;
}

export function useAutoSave<T extends Record<string, any>>(
  data: T,
  options: AutoSaveOptions
) {
  const {
    delay = 2000,
    enabled = true,
    onSave,
    onError,
    saveOnUnmount = true,
    ignoreFields = []
  } = options;

  const [saveState, setSaveState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    saveCount: 0,
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedDataRef = useRef<T>(data);
  const hasInitialized = useRef(false);

  // Check if data has changed
  const hasDataChanged = useCallback((current: T, previous: T): boolean => {
    return Object.keys(current).some(key => {
      if (ignoreFields.includes(key)) return false;
      return current[key] !== previous[key];
    });
  }, [ignoreFields]);

  // Perform the save operation
  const performSave = useCallback(async (dataToSave: T) => {
    if (!enabled) return;

    setSaveState(prev => ({ ...prev, isSaving: true }));

    try {
      await onSave(dataToSave);

      setSaveState(prev => ({
        ...prev,
        isSaving: false,
        lastSaved: new Date(),
        hasUnsavedChanges: false,
        saveCount: prev.saveCount + 1,
      }));

      lastSavedDataRef.current = { ...dataToSave };
    } catch (error) {
      setSaveState(prev => ({ ...prev, isSaving: false }));

      if (onError) {
        onError(error instanceof Error ? error : new Error('Save failed'));
      }
    }
  }, [enabled, onSave, onError]);

  // Manual save function
  const save = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }

    await performSave(data);
  }, [data, performSave]);

  // Schedule an auto-save
  const scheduleAutoSave = useCallback(() => {
    if (!enabled) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      performSave(data);
    }, delay);
  }, [enabled, delay, data, performSave]);

  // Effect to handle data changes
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      lastSavedDataRef.current = { ...data };
      return;
    }

    const hasChanged = hasDataChanged(data, lastSavedDataRef.current);

    setSaveState(prev => ({
      ...prev,
      hasUnsavedChanges: hasChanged,
    }));

    if (hasChanged && enabled) {
      scheduleAutoSave();
    }
  }, [data, enabled, hasDataChanged, scheduleAutoSave]);

  // Save on unmount if there are unsaved changes
  useEffect(() => {
    return () => {
      if (saveOnUnmount && saveState.hasUnsavedChanges && enabled) {
        // Use synchronous save for unmount
        onSave(data);
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [saveOnUnmount, saveState.hasUnsavedChanges, enabled, data, onSave]);

  // Cleanup timeout on disabled
  useEffect(() => {
    if (!enabled && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, [enabled]);

  return {
    ...saveState,
    save,
    cancel: () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
    },
  };
}