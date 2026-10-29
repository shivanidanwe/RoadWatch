import React, { useState, useMemo, ReactNode } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Filter,
  Search,
  CheckSquare,
  Square
} from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchKey?: keyof T | ((row: T) => string);
  searchPlaceholder?: string;
  filterComponent?: ReactNode;
  onRowClick?: (row: T) => void;
  exportFileName?: string;
  selectable?: boolean;
  onSelectedRowsChange?: (selectedRows: T[]) => void;
  actions?: ReactNode;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'Search records...',
  filterComponent,
  onRowClick,
  exportFileName = 'roadwatch-export',
  selectable = false,
  onSelectedRowsChange,
  actions,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter by search
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();

    return data.filter(row => {
      if (typeof searchKey === 'function') {
        return searchKey(row).toLowerCase().includes(term);
      }
      if (searchKey && row[searchKey]) {
        return String(row[searchKey]).toLowerCase().includes(term);
      }
      return Object.values(row).some(
        val => val !== null && val !== undefined && String(val).toLowerCase().includes(term)
      );
    });
  }, [data, searchTerm, searchKey]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortOrder === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filteredData, sortKey, sortOrder]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else setSortKey(null);
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === paginatedData.length) {
      setSelectedIds(new Set());
      onSelectedRowsChange?.([]);
    } else {
      const newSelected = new Set(paginatedData.map((row, idx) => row.id || String(idx)));
      setSelectedIds(newSelected);
      onSelectedRowsChange?.(paginatedData);
    }
  };

  const handleSelectRow = (e: React.MouseEvent, row: T, rowId: string) => {
    e.stopPropagation();
    const newSelected = new Set(selectedIds);
    if (newSelected.has(rowId)) {
      newSelected.delete(rowId);
    } else {
      newSelected.add(rowId);
    }
    setSelectedIds(newSelected);

    if (onSelectedRowsChange) {
      const selected = data.filter((r, idx) => newSelected.has(r.id || String(idx)));
      onSelectedRowsChange(selected);
    }
  };

  const exportToCsv = () => {
    if (filteredData.length === 0) return;
    const headers = columns.map(c => `"${c.header}"`).join(',');
    const rows = filteredData.map(row => {
      return columns
        .map(c => {
          const val = row[c.key];
          if (val === null || val === undefined) return '""';
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${exportFileName}-${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#211735] border border-[#3B2D53] rounded-xl shadow-xs overflow-hidden flex flex-col min-w-0 w-full">
      {/* Controls Bar */}
      <div className="p-3.5 sm:p-4 border-b border-[#3B2D53] bg-[#140E22] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 text-[#B9AECF]/60 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#211735] text-[#F5F3FF] placeholder-[#B9AECF]/50 border border-[#3B2D53] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/30 focus:border-[#A78BFA] transition"
            />
          </div>
          {filterComponent}
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          {actions}
          <button
            onClick={exportToCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#F5F3FF] bg-[#2B2042] border border-[#3B2D53] rounded-lg hover:bg-[#3B2D53] transition shadow-xs"
            title="Export to CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table with proper overflow wrapper */}
      <div className="overflow-x-auto min-h-[220px] w-full">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#140E22] border-b border-[#3B2D53] text-[#A78BFA] font-bold uppercase tracking-wider text-[11px]">
              {selectable && (
                <th className="py-3 px-3 w-10 text-center">
                  <button
                    onClick={handleSelectAll}
                    className="text-[#B9AECF] hover:text-[#F5F3FF] transition"
                  >
                    {selectedIds.size > 0 && selectedIds.size === paginatedData.length ? (
                      <CheckSquare className="w-4 h-4 text-[#A78BFA]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
              )}
              {columns.map(col => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`py-3 px-4 select-none whitespace-nowrap ${
                    col.sortable ? 'cursor-pointer hover:bg-[#2B2042]/50 transition' : ''
                  } ${
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                  }`}
                >
                  <div className="inline-flex items-center gap-1">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-[#B9AECF]/60">
                        {sortKey === col.key ? (
                          sortOrder === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-[#A78BFA]" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-[#A78BFA]" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-60" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3B2D53]/50 text-[#F5F3FF]">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-12 text-center text-[#B9AECF]"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Filter className="w-6 h-6 text-[#A78BFA]/60" />
                    <p className="text-sm font-semibold text-[#F5F3FF]">No matching records found</p>
                    <p className="text-xs text-[#B9AECF]">
                      Try adjusting your search terms or filters
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => {
                const rowId = row.id || String(index);
                const isSelected = selectedIds.has(rowId);

                return (
                  <tr
                    key={rowId}
                    onClick={() => onRowClick?.(row)}
                    className={`transition-colors ${
                      onRowClick ? 'cursor-pointer hover:bg-[#2B2042]/50' : 'hover:bg-[#2B2042]/30'
                    } ${isSelected ? 'bg-[#8B5CF6]/20' : ''}`}
                  >
                    {selectable && (
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={e => handleSelectRow(e, row, rowId)}
                          className="text-[#B9AECF] hover:text-[#F5F3FF]"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#A78BFA]" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    )}
                    {columns.map(col => (
                      <td
                        key={col.key}
                        className={`py-3 px-4 ${
                          col.align === 'right'
                            ? 'text-right'
                            : col.align === 'center'
                            ? 'text-center'
                            : 'text-left'
                        }`}
                      >
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-[#3B2D53] bg-[#140E22] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#B9AECF]">
        <div className="flex items-center gap-3">
          <span>
            Showing <strong className="font-semibold text-[#F5F3FF]">{sortedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> to{' '}
            <strong className="font-semibold text-[#F5F3FF]">
              {Math.min(currentPage * pageSize, sortedData.length)}
            </strong>{' '}
            of <strong className="font-semibold text-[#F5F3FF]">{sortedData.length}</strong> entries
          </span>
          {selectedIds.size > 0 && (
            <span className="px-2 py-0.5 rounded bg-[#8B5CF6]/20 text-[#C4B5FD] text-[11px] font-semibold border border-[#8B5CF6]/30">
              {selectedIds.size} selected
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px]">Rows per page:</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="py-1 px-2 border border-[#3B2D53] rounded bg-[#211735] text-xs text-[#F5F3FF] focus:outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-[#3B2D53] rounded hover:bg-[#2B2042] disabled:opacity-30 disabled:cursor-not-allowed transition bg-[#211735] text-[#F5F3FF]"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-[#F5F3FF]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-[#3B2D53] rounded hover:bg-[#2B2042] disabled:opacity-30 disabled:cursor-not-allowed transition bg-[#211735] text-[#F5F3FF]"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
