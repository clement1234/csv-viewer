import { useState, useCallback, useMemo, useEffect } from 'react';
import type { DataRow, InferredColumnSchema } from '../types/core.types.ts';
import type { Config } from '../types/config.types.ts';
import type { FilterState, SortState } from '../types/ui.types.ts';
import type { Toast, ToastType } from './useToast.ts';
import type { StoredConfig, ConfigMatchResult } from '../types/storage.types.ts';
import { parseCSVFileToNormalizedRows } from '../lib/parsers/csv-parser.ts';
import { parseXLSXFirstSheetWithAvailableSheets, extractRowsFromSpecificSheet } from '../lib/parsers/xlsx-parser.ts';
import { inferSchemaFromDataRows, selectDefaultVisibleColumns } from '../lib/schema/schema-inference.ts';
import { validateConfigAndReturnResult } from '../lib/schema/config-validator.ts';
import { applyConfigToSchemaAndData } from '../lib/schema/config-applicator.ts';
import { applyAllFiltersToDataRows } from '../lib/data/filters.ts';
import { sortDataRowsByColumn } from '../lib/data/sorting.ts';
import { useFilters } from './useFilters.ts';
import type { FilterUpdatePayload } from './useFilters.ts';
import { usePagination } from './usePagination.ts';
import { useToast } from './useToast.ts';
import type { PaginationState } from '../types/ui.types.ts';
import {
  saveConfig,
  loadConfig,
  loadAllConfigs,
  deleteConfig as deleteConfigFromStorage,
  renameConfig as renameConfigInStorage,
  getSelectedConfigName,
  setSelectedConfig as setSelectedConfigInStorage,
  isFirstUse,
} from '../lib/storage/config-storage.ts';
import { generateSchemaFingerprintFromData, findBestMatchingConfig } from '../lib/storage/config-matcher.ts';

interface UsePaginationReturn {
  currentPage: number;
  rowsPerPage: PaginationState['rowsPerPage'];
  totalPages: number;
  goToPage: (page: number) => void;
  setRowsPerPage: (rowsPerPage: PaginationState['rowsPerPage']) => void;
  nextPage: () => void;
  prevPage: () => void;
  isFirstPage: boolean;
  isLastPage: boolean;
}

interface UseAppStateReturn {
  parsedData: DataRow[];
  availableSheetNames: string[];
  selectedSheetName: string | null;
  inferredSchema: InferredColumnSchema[];
  appliedConfig: Config | null;
  configWarnings: string[];
  visibleColumns: string[];
  selectedRowIndex: number | null;
  sortState: SortState;
  filteredData: DataRow[];
  sortedData: DataRow[];
  paginatedData: DataRow[];
  toasts: Toast[];
  filterState: FilterState;
  activeFiltersCount: number;
  pagination: UsePaginationReturn;
  savedConfigs: StoredConfig[];
  selectedConfigName: string | null;
  autoDetectedConfig: ConfigMatchResult | null;
  isAutoDetectionEnabled: boolean;
  handleDataFileUpload: (file: File) => Promise<void>;
  handleConfigImport: (file: File, configName: string) => Promise<void>;
  handleSheetSelection: (sheetName: string) => Promise<void>;
  toggleColumnVisibility: (columnName: string) => void;
  selectRow: (index: number | null) => void;
  navigateRow: (direction: 'prev' | 'next') => void;
  handleSortChange: (columnName: string) => void;
  updateFilter: (payload: FilterUpdatePayload) => void;
  resetFilters: () => void;
  removeToast: (id: string) => void;
  addToast: (type: ToastType, message: string, duration?: number) => void;
  handleConfigSelection: (configName: string) => void;
  handleDeleteConfig: (configName: string) => void;
  handleRenameConfig: (oldName: string, newName: string) => void;
  setIsAutoDetectionEnabled: (enabled: boolean) => void;
}

function isCSVFile(file: File): boolean {
  return file.name.endsWith('.csv') || file.type === 'text/csv';
}

export function useAppState(): UseAppStateReturn {
  const [parsedData, setParsedData] = useState<DataRow[]>([]);
  const [availableSheetNames, setAvailableSheetNames] = useState<string[]>([]);
  const [selectedSheetName, setSelectedSheetName] = useState<string | null>(null);
  const [inferredSchema, setInferredSchema] = useState<InferredColumnSchema[]>([]);
  const [appliedConfig, setAppliedConfig] = useState<Config | null>(null);
  const [configWarnings, setConfigWarnings] = useState<string[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [sortState, setSortState] = useState<SortState>({ columnName: null, direction: null });
  const [uploadedDataFile, setUploadedDataFile] = useState<File | null>(null);

  // Multi-config state with lazy initialization
  const [savedConfigs, setSavedConfigs] = useState<StoredConfig[]>(() => loadAllConfigs());
  const [selectedConfigName, setSelectedConfigName] = useState<string | null>(() => {
    const selected = getSelectedConfigName();
    return selected;
  });
  const [autoDetectedConfig, setAutoDetectedConfig] = useState<ConfigMatchResult | null>(null);
  const [isAutoDetectionEnabled, setIsAutoDetectionEnabled] = useState(true);

  const { toasts, addToast, removeToast } = useToast();
  const { filterState, updateFilter, resetFilters: resetFiltersInternal, activeFiltersCount } = useFilters();

  // Initialize config from localStorage on mount (only for the config itself, not the list)
  useEffect((): void => {
    const selected = getSelectedConfigName();
    if (selected) {
      const stored = loadConfig(selected);
      if (stored) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Initialization pattern for localStorage sync
        setAppliedConfig(stored.config);
      }
    }
  }, []);

  // First-time user: load default VA-communauté config
  useEffect((): void => {
    if (isFirstUse()) {
      fetch('/config-va-communaute.json')
        .then((response) => response.json())
        .then((vaConfig: unknown) => {
          const validationResult = validateConfigAndReturnResult(vaConfig);

          if (validationResult.isValid && validationResult.config) {
            saveConfig('VA-communauté', validationResult.config);
            setSelectedConfigInStorage('VA-communauté');
            setSelectedConfigName('VA-communauté');
            setAppliedConfig(validationResult.config);
            setSavedConfigs(loadAllConfigs());
          }
        })
        .catch((error) => {
          console.error('Failed to load default config:', error);
        });
    }
  }, []);

  const filteredData = useMemo(
    () => applyAllFiltersToDataRows(parsedData, filterState, inferredSchema),
    [parsedData, filterState, inferredSchema],
  );

  const sortedData = useMemo(
    () => sortDataRowsByColumn(filteredData, sortState, inferredSchema),
    [filteredData, sortState, inferredSchema],
  );

  const { resetToFirstPage, ...pagination } = usePagination(sortedData.length);

  const resetFilters = useCallback((): void => {
    resetFiltersInternal();
    resetToFirstPage();
  }, [resetFiltersInternal, resetToFirstPage]);

  const updateFilterAndResetPage = useCallback((payload: FilterUpdatePayload): void => {
    updateFilter(payload);
    resetToFirstPage();
  }, [updateFilter, resetToFirstPage]);

  const paginatedData = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.rowsPerPage;
    const endIndex = startIndex + pagination.rowsPerPage;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, pagination.currentPage, pagination.rowsPerPage]);

  const initializeFromParsedData = useCallback((data: DataRow[], config: Config | null): void => {
    const schema = inferSchemaFromDataRows(data);
    let finalConfig = config;
    let warnings: string[] = [];

    if (config) {
      const result = applyConfigToSchemaAndData(config, schema, data);
      finalConfig = result.appliedConfig;
      warnings = result.warnings;
      data = result.normalizedData;
    }

    setParsedData(data);
    setInferredSchema(schema);
    setAppliedConfig(finalConfig);
    setConfigWarnings(warnings);

    const defaultVisible = finalConfig?.columns?.defaultVisible
      ?? selectDefaultVisibleColumns(schema);
    setVisibleColumns(defaultVisible);
    setSelectedRowIndex(null);
    setSortState({ columnName: null, direction: null });
    resetFilters();
  }, [resetFilters]);

  const handleDataFileUpload = useCallback(async (file: File): Promise<void> => {
    try {
      setUploadedDataFile(file);
      let data: DataRow[];

      if (isCSVFile(file)) {
        data = await parseCSVFileToNormalizedRows(file);
        setAvailableSheetNames([]);
        setSelectedSheetName(null);
      } else {
        const result = await parseXLSXFirstSheetWithAvailableSheets(file);
        data = result.data;
        setAvailableSheetNames(result.availableSheetNames);
        setSelectedSheetName(result.availableSheetNames[0] ?? null);
      }

      let configToApply = appliedConfig;

      // Auto-detection si activée
      if (isAutoDetectionEnabled && savedConfigs.length > 0) {
        const schema = inferSchemaFromDataRows(data);
        const matchResult = findBestMatchingConfig(schema, savedConfigs, 60);

        if (matchResult && matchResult.config) {
          configToApply = matchResult.config.config;
          setAutoDetectedConfig(matchResult);
          setSelectedConfigName(matchResult.config.name);
          setSelectedConfigInStorage(matchResult.config.name);
          addToast('info', `Config "${matchResult.config.name}" détectée (${matchResult.matchScore}%)`);
        } else {
          setAutoDetectedConfig(null);
        }
      }

      initializeFromParsedData(data, configToApply);
      addToast('success', `${data.length} lignes chargées depuis ${file.name}`);
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Erreur inconnue';
      addToast('error', `Erreur lors du chargement : ${errorMessage}`);
    }
  }, [appliedConfig, isAutoDetectionEnabled, savedConfigs, initializeFromParsedData, addToast]);

  const handleConfigImport = useCallback(async (file: File, configName: string): Promise<void> => {
    try {
      const configText = await file.text();
      const rawConfig: unknown = JSON.parse(configText);
      const validationResult = validateConfigAndReturnResult(rawConfig);

      if (!validationResult.isValid || !validationResult.config) {
        const errorMessages = validationResult.errors?.join(', ') ?? 'Configuration invalide';
        addToast('error', `Config invalide : ${errorMessages}`);
        return;
      }

      // Generate fingerprint if data is loaded
      let fingerprint;
      if (parsedData.length > 0) {
        const schema = inferSchemaFromDataRows(parsedData);
        fingerprint = generateSchemaFingerprintFromData(schema);
      }

      saveConfig(configName, validationResult.config, fingerprint);
      setSavedConfigs(loadAllConfigs());
      setSelectedConfigName(configName);
      setSelectedConfigInStorage(configName);

      if (parsedData.length > 0) {
        initializeFromParsedData(parsedData, validationResult.config);
      } else {
        setAppliedConfig(validationResult.config);
      }

      addToast('success', `Configuration "${configName}" sauvegardée`);
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Erreur inconnue';
      addToast('error', `Erreur de configuration : ${errorMessage}`);
    }
  }, [parsedData, initializeFromParsedData, addToast]);

  const handleSheetSelection = useCallback(async (sheetName: string): Promise<void> => {
    if (!uploadedDataFile) return;
    try {
      const data = await extractRowsFromSpecificSheet(uploadedDataFile, sheetName);
      setSelectedSheetName(sheetName);
      initializeFromParsedData(data, appliedConfig);
      addToast('info', `Feuille "${sheetName}" chargée`);
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Erreur inconnue';
      addToast('error', `Erreur : ${errorMessage}`);
    }
  }, [uploadedDataFile, appliedConfig, initializeFromParsedData, addToast]);

  const toggleColumnVisibility = useCallback((columnName: string): void => {
    setVisibleColumns((previous) => {
      if (previous.includes(columnName)) {
        // Garder au minimum 1 colonne visible
        if (previous.length <= 1) return previous;
        return previous.filter((col) => col !== columnName);
      }
      return [...previous, columnName];
    });
  }, []);

  const selectRow = useCallback((index: number | null): void => {
    setSelectedRowIndex(index);
  }, []);

  const navigateRow = useCallback((direction: 'prev' | 'next'): void => {
    setSelectedRowIndex((current) => {
      if (current === null) return null;
      if (direction === 'prev') return Math.max(0, current - 1);
      return Math.min(sortedData.length - 1, current + 1);
    });
  }, [sortedData.length]);

  const handleSortChange = useCallback((columnName: string): void => {
    setSortState((previous) => {
      if (previous.columnName !== columnName) {
        return { columnName, direction: 'asc' };
      }
      if (previous.direction === 'asc') {
        return { columnName, direction: 'desc' };
      }
      return { columnName: null, direction: null };
    });
  }, []);

  const handleConfigSelection = useCallback((configName: string): void => {
    const stored = loadConfig(configName);
    if (!stored) return;

    setSelectedConfigName(configName);
    setSelectedConfigInStorage(configName);

    if (parsedData.length > 0) {
      initializeFromParsedData(parsedData, stored.config);
    } else {
      setAppliedConfig(stored.config);
    }

    addToast('info', `Configuration "${configName}" sélectionnée`);
  }, [parsedData, initializeFromParsedData, addToast]);

  const handleDeleteConfig = useCallback((configName: string): void => {
    deleteConfigFromStorage(configName);
    setSavedConfigs(loadAllConfigs());

    if (selectedConfigName === configName) {
      setSelectedConfigName(null);
      setAppliedConfig(null);
    }

    addToast('info', `Configuration "${configName}" supprimée`);
  }, [selectedConfigName, addToast]);

  const handleRenameConfig = useCallback((oldName: string, newName: string): void => {
    try {
      renameConfigInStorage(oldName, newName);
      setSavedConfigs(loadAllConfigs());

      if (selectedConfigName === oldName) {
        setSelectedConfigName(newName);
      }

      addToast('success', `Configuration renommée en "${newName}"`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      addToast('error', errorMessage);
    }
  }, [selectedConfigName, addToast]);

  return {
    // État
    parsedData,
    availableSheetNames,
    selectedSheetName,
    inferredSchema,
    appliedConfig,
    configWarnings,
    visibleColumns,
    selectedRowIndex,
    sortState,
    filteredData,
    sortedData,
    paginatedData,
    toasts,
    filterState,
    activeFiltersCount,
    pagination,
    savedConfigs,
    selectedConfigName,
    autoDetectedConfig,
    isAutoDetectionEnabled,
    // Actions
    handleDataFileUpload,
    handleConfigImport,
    handleSheetSelection,
    toggleColumnVisibility,
    selectRow,
    navigateRow,
    handleSortChange,
    updateFilter: updateFilterAndResetPage,
    resetFilters,
    removeToast,
    addToast,
    handleConfigSelection,
    handleDeleteConfig,
    handleRenameConfig,
    setIsAutoDetectionEnabled,
  };
}
