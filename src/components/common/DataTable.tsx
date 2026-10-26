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
      // fallback: search across all string/number fields
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
      else {
        setSortKey(null);
        setSortOrder('asc');
      }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  // Selection
  const handleSelectAll = () => {
    if (selectedIds.size === paginatedData.length) {
      setSelectedIds(new Set());
      onSelectedRowsChange?.([]);
    } else {
      const newSet = new Set<string>();
      paginatedData.forEach((row, i) => newSet.add(row.id || String(i)));
      setSelectedIds(newSet);
      onSelectedRowsChange?.(paginatedData);
    }
  };

  const handleSelectRow = (e: React.MouseEvent, row: T, id: string) => {
    e.stopPropagation();
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);

    const selectedList = data.filter((r, i) => newSet.has(r.id || String(i)));
    onSelectedRowsChange?.(selectedList);
  };

  // CSV Export
  const exportToCsv = () => {
    if (!data.length) return;
    const exportColumns = columns.filter(c => c.key !== 'actions');
    const headers = exportColumns.map(c => `"${c.header.replace(/"/g, '""')}"`).join(',');
    
    const rows = sortedData.map(row => {
      return exportColumns
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
    <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Controls Bar */}
      <div className="p-4 border-b border-[#E2E8F0] bg-white flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            />
          </div>
          {filterComponent}
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          {actions}
          <button
            onClick={exportToCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#172033] bg-white border border-[#E2E8F0] rounded-lg hover:bg-slate-50 transition shadow-xs"
            title="Export filtered records to CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-[#E2E8F0] text-[#64748B] font-semibold uppercase tracking-wider text-[11px]">
              {selectable && (
                <th className="py-3 px-3 w-10 text-center">
                  <button
                    onClick={handleSelectAll}
                    className="text-[#64748B] hover:text-[#172033] transition"
                  >
                    {selectedIds.size > 0 && selectedIds.size === paginatedData.length ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
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
                  className={`py-3 px-4 select-none ${
                    col.sortable ? 'cursor-pointer hover:bg-slate-100/70 transition' : ''
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
                      <span className="text-[#94A3B8]">
                        {sortKey === col.key ? (
                          sortOrder === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
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
          <tbody className="divide-y divide-[#E2E8F0] text-[#172033]">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-12 text-center text-[#64748B]"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Filter className="w-6 h-6 text-slate-300" />
                    <p className="text-sm font-medium">No matching records found</p>
                    <p className="text-xs text-[#94A3B8]">
                      Try adjusting search terms or clearing active filters
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
                      onRowClick ? 'cursor-pointer hover:bg-blue-50/40' : 'hover:bg-slate-50/60'
                    } ${isSelected ? 'bg-blue-50/70' : ''}`}
                  >
                    {selectable && (
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={e => handleSelectRow(e, row, rowId)}
                          className="text-[#64748B] hover:text-[#172033]"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
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
      <div className="p-3 border-t border-[#E2E8F0] bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
        <div className="flex items-center gap-3">
          <span>
            Showing <strong className="font-semibold text-[#172033]">{sortedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> to{' '}
            <strong className="font-semibold text-[#172033]">
              {Math.min(currentPage * pageSize, sortedData.length)}
            </strong>{' '}
            of <strong className="font-semibold text-[#172033]">{sortedData.length}</strong> entries
          </span>
          {selectedIds.size > 0 && (
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[11px] font-medium">
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
              className="py-1 px-2 border border-[#E2E8F0] rounded bg-white text-xs text-[#172033] focus:outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-[#E2E8F0] rounded hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition bg-white"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-[#E2E8F0] rounded hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition bg-white"
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
