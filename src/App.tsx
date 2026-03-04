import { useCallback, useState } from 'react';
import { useAppState } from './hooks/useAppState.ts';
import { Dropzone } from './components/upload/Dropzone.tsx';
import { FilePicker } from './components/upload/FilePicker.tsx';
import { DataTable } from './components/table/DataTable.tsx';
import { Pagination } from './components/table/Pagination.tsx';
import { ColumnPicker } from './components/ui/ColumnPicker.tsx';
import { DetailModal } from './components/ui/DetailModal.tsx';
import { Modal } from './components/ui/Modal.tsx';
import { Toast } from './components/ui/Toast.tsx';
import { Button } from './components/ui/Button.tsx';
import { FiltersPanel } from './components/filters/FiltersPanel.tsx';
import { StatsCards } from './components/stats/StatsCards.tsx';
import { StatsPanels } from './components/stats/StatsPanels.tsx';
import { DownloadIcon } from './components/ui/Icons.tsx';
import { ConfigSelector } from './components/config/ConfigSelector.tsx';
import { ConfigManagementPanel } from './components/config/ConfigManagementPanel.tsx';
import { AutoDetectionIndicator } from './components/config/AutoDetectionIndicator.tsx';
import { exportDataRowsToCSVFile } from './lib/data/export.ts';
import { buildFilterPayloadFromStatClick } from './lib/data/stats-filter-mapping.ts';
import type { DataRow } from './types/core.types.ts';
import type { StatsPanelConfig } from './types/config.types.ts';

const ACCEPTED_DATA_FILE_TYPES = ['.csv', '.xlsx', '.xls'];

function App(): React.JSX.Element {
  const {
    parsedData, availableSheetNames, selectedSheetName, inferredSchema,
    appliedConfig, visibleColumns, selectedRowIndex, sortState,
    filteredData, sortedData, paginatedData, toasts, filterState,
    activeFiltersCount, pagination,
    savedConfigs, selectedConfigName, autoDetectedConfig, isAutoDetectionEnabled,
    handleDataFileUpload, handleConfigImport, handleSheetSelection,
    toggleColumnVisibility, selectRow, navigateRow, handleSortChange,
    updateFilter, resetFilters, removeToast, addToast,
    handleConfigSelection, handleDeleteConfig, handleRenameConfig,
    setIsAutoDetectionEnabled,
  } = useAppState();

  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
  const [showConfigNamePrompt, setShowConfigNamePrompt] = useState(false);
  const [pendingConfigFile, setPendingConfigFile] = useState<File | null>(null);
  const [configNameInput, setConfigNameInput] = useState('');

  const handleRowClick = useCallback((_row: DataRow, index: number): void => {
    selectRow(index);
  }, [selectRow]);

  const handleExportCSV = useCallback((): void => {
    exportDataRowsToCSVFile(
      filteredData,
      'export.csv',
      visibleColumns,
      appliedConfig?.columns?.labels,
    );
    addToast('success', 'Export CSV téléchargé');
  }, [filteredData, visibleColumns, appliedConfig, addToast]);

  const handleStatValueClick = useCallback((
    panelType: StatsPanelConfig['type'],
    columnName: string,
    clickedValue: string,
  ): void => {
    const payload = buildFilterPayloadFromStatClick(
      { panelType, columnName, clickedValue },
      filterState,
    );
    updateFilter(payload);
  }, [filterState, updateFilter]);

  const handleStatsCardClick = useCallback((column: string, value: string): void => {
    const payload = buildFilterPayloadFromStatClick(
      { panelType: 'countByColumn', columnName: column, clickedValue: value },
      filterState,
    );
    updateFilter(payload);
  }, [filterState, updateFilter]);

  const handleConfigImportWithPrompt = useCallback((file: File): void => {
    setPendingConfigFile(file);
    setConfigNameInput('');
    setShowConfigNamePrompt(true);
  }, []);

  const handleConfigNameSubmit = useCallback((): void => {
    if (pendingConfigFile && configNameInput.trim()) {
      handleConfigImport(pendingConfigFile, configNameInput.trim());
      setShowConfigNamePrompt(false);
      setPendingConfigFile(null);
      setConfigNameInput('');
    }
  }, [pendingConfigFile, configNameInput, handleConfigImport]);

  const isDataLoaded = parsedData.length > 0;
  const appTitle = appliedConfig?.app?.title ?? 'CSV/Excel Viewer';
  const appSubtitle = appliedConfig?.app?.subtitle;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toasts container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>

      {!isDataLoaded ? (
        /* Écran 1 — Upload */
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-lg space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800">{appTitle}</h1>
              {appSubtitle && <p className="text-gray-500 mt-1">{appSubtitle}</p>}
            </div>

            <Dropzone
              onFileSelected={handleDataFileUpload}
              acceptedFileTypes={ACCEPTED_DATA_FILE_TYPES}
              label="Glissez-déposez un fichier CSV ou Excel"
            />

            <div className="flex items-center justify-center">
              <ConfigSelector
                configs={savedConfigs}
                selectedConfigName={selectedConfigName}
                onSelect={handleConfigSelection}
                onOpenManagement={() => setIsConfigPanelOpen(true)}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Écran 2 — Viewer */
        <div className="max-w-screen-2xl mx-auto px-4 py-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">{appTitle}</h1>
              {appSubtitle && <p className="text-sm text-gray-500">{appSubtitle}</p>}
            </div>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Réinitialiser les filtres ({activeFiltersCount})
                </Button>
              )}
              <ConfigSelector
                configs={savedConfigs}
                selectedConfigName={selectedConfigName}
                onSelect={handleConfigSelection}
                onOpenManagement={() => setIsConfigPanelOpen(true)}
              />
              {autoDetectedConfig && (
                <AutoDetectionIndicator
                  matchResult={autoDetectedConfig}
                  isEnabled={isAutoDetectionEnabled}
                  onToggle={setIsAutoDetectionEnabled}
                />
              )}
              <FilePicker
                onFileSelected={handleDataFileUpload}
                acceptedFileTypes={ACCEPTED_DATA_FILE_TYPES}
                label="Nouveau fichier"
                buttonVariant="outline"
              />
            </div>
          </div>

          {/* Sheet selector si XLSX multi-feuilles */}
          {availableSheetNames.length > 1 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Feuille :</span>
              {availableSheetNames.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleSheetSelection(name)}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    selectedSheetName === name
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          {/* Stats Cards */}
          {appliedConfig?.stats?.cards && (
            <StatsCards
              cards={appliedConfig.stats.cards}
              rows={filteredData}
              filterState={filterState}
              onCardClick={handleStatsCardClick}
            />
          )}

          {/* Stats Panels */}
          {appliedConfig?.stats?.panels && (
            <StatsPanels
              panels={appliedConfig.stats.panels}
              allRows={parsedData}
              filteredRows={filteredData}
              filterState={filterState}
              onStatValueClick={handleStatValueClick}
            />
          )}

          {/* Filters Panel */}
          {appliedConfig && (
            <FiltersPanel
              schema={inferredSchema}
              config={appliedConfig}
              filterState={filterState}
              onUpdateFilter={updateFilter}
              onResetFilters={resetFilters}
              activeFiltersCount={activeFiltersCount}
              data={parsedData}
            />
          )}

          {/* Barre d'actions */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {filteredData.length} résultat{filteredData.length !== 1 ? 's' : ''}
              {activeFiltersCount > 0 && ` (${parsedData.length} total)`}
            </span>
            <div className="flex items-center gap-2">
              <ColumnPicker
                allColumns={inferredSchema.map((s) => s.columnName)}
                visibleColumns={visibleColumns}
                columnLabels={appliedConfig?.columns?.labels}
                onToggleColumn={toggleColumnVisibility}
              />
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <DownloadIcon size={16} />
                Exporter
              </Button>
            </div>
          </div>

          {/* Data Table */}
          <DataTable
            data={paginatedData}
            visibleColumns={visibleColumns}
            columnLabels={appliedConfig?.columns?.labels}
            schema={inferredSchema}
            config={appliedConfig ?? {}}
            sortState={sortState}
            onSortChange={handleSortChange}
            onRowClick={handleRowClick}
          />

          {/* Pagination */}
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            rowsPerPage={pagination.rowsPerPage}
            totalRows={sortedData.length}
            onGoToPage={pagination.goToPage}
            onSetRowsPerPage={pagination.setRowsPerPage}
            isFirstPage={pagination.isFirstPage}
            isLastPage={pagination.isLastPage}
          />


          {/* Detail Modal */}
          <DetailModal
            isOpen={selectedRowIndex !== null}
            row={selectedRowIndex !== null ? sortedData[selectedRowIndex] ?? null : null}
            rowIndex={selectedRowIndex ?? 0}
            totalRows={sortedData.length}
            schema={inferredSchema}
            config={appliedConfig ?? {}}
            onClose={() => selectRow(null)}
            onNavigate={navigateRow}
          />
        </div>
      )}

      {/* Config Management Panel */}
      <ConfigManagementPanel
        isOpen={isConfigPanelOpen}
        onClose={() => setIsConfigPanelOpen(false)}
        configs={savedConfigs}
        selectedConfigName={selectedConfigName}
        onImport={handleConfigImportWithPrompt}
        onDelete={handleDeleteConfig}
        onRename={handleRenameConfig}
        onSelect={handleConfigSelection}
      />

      {/* Config Name Prompt */}
      {showConfigNamePrompt && pendingConfigFile && (
        <Modal
          isOpen={true}
          onClose={() => {
            setShowConfigNamePrompt(false);
            setPendingConfigFile(null);
            setConfigNameInput('');
          }}
          title="Nom de la configuration"
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="config-name-input"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Entrez un nom pour cette configuration
              </label>
              <input
                id="config-name-input"
                type="text"
                value={configNameInput}
                onChange={(e) => setConfigNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && configNameInput.trim()) {
                    handleConfigNameSubmit();
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Configuration Adhérents 2025"
                autoFocus
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowConfigNamePrompt(false);
                  setPendingConfigFile(null);
                  setConfigNameInput('');
                }}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleConfigNameSubmit}
                disabled={!configNameInput.trim()}
              >
                Importer
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default App;
