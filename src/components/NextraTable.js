import React, { useMemo, useState, useEffect } from "react";
import { ArrowUpDown, ArrowUpAZ, ArrowDownAZ, ListRestart } from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  createColumnHelper,
} from "@tanstack/react-table";
import { rankItem } from "@tanstack/match-sorter-utils";

// Define a custom fuzzy filter function that will apply ranking info to rows (using match-sorter utils)
const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

const keysToRemove = ["name", "url", "upload_date", "creator"];

//todo add other hierarchy to db because this is lame
const keyLookup = {
  meta: ["name", "url", "upload_date", "creator"],
  mechanics: [
    "generic",
    "combo",
    "dispenser",
    "hole",
    "jump",
    "layer",
    "mechanical",
    "no_path",
    "secret",
    "trap",
  ],
  cause: ["on_play_setup", "trigger", "on_destroy", "ongoing"],
  action: ["alters_tiles", "alters_balls", "alters_hands", "alters_turns"],
  special: ["forbidden", "novelty", "premium", "is_unique", "virtual"],
  components: ["board", "accessory"],
};

// const keyLookup = {
//   generic: "mechanics",
//   combo: "mechanics",
//   dispenser: "mechanics",
//   hole: "mechanics",
//   jump: "mechanics",
//   layer: "mechanics",
//   mechanical: "mechanics",
//   no_path: "mechanics",
//   secret: "mechanics",
//   trap: "mechanics",
//   on_play_setup: "cause",
//   trigger: "cause",
//   on_destroy: "cause",
//   ongoing: "cause",
//   alters_tiles: "action",
//   alters_balls: "action",
//   alters_hands: "action",
//   alters_turns: "action",
//   forbidden: "special",
//   novelty: "special",
//   premium: "special",
//   is_unique: "special",
//   virtual: "special",
//   board: "components",
//   accessory: "components"
// }

export default function NextraTable({ data }) {
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Column-specific toggle filters for filtering rows with cell value `1`
  const [columnToggles, setColumnToggles] = useState(
    data[0]
      ? Object.keys(data[0])
          .filter((key) => !keysToRemove.includes(key))
          .reduce((acc, key) => ({ ...acc, [key]: false }), {})
      : {}
  );

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns = useMemo(() => {
    if (data.length === 0) return [];

    const columnHelper = createColumnHelper();
    const preparedData = Object.keys(keyLookup).map((h) => {
      return columnHelper.group({
        id: h,
        header: h.charAt(0).toUpperCase() + h.slice(1).replace(/_/g, " "),
        columns: Object.keys(data[0])
          .filter((k) => keyLookup[h].includes(k))
          .map((key) => ({
            id: key,
            accessorKey: key,
            width: "auto",
            groupId: keyLookup[key],
            header: ({ column }) => {
              const display =
                key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "); //todo lookup map for improved text
              return (
                <div style={{ minWidth: "180px" }}>
                  <button
                    className={"_flex _flex-row _items-center "}
                    // className={"_flex _flex-row _items-center _ml-auto _rounded-lg nextra-focus _flex _rounded _px-2 _py-1.5 _text-sm _transition-colors [word-break:break-word] _cursor-pointer contrast-more:_border _text-gray-500 hover:_bg-gray-100 hover:_text-gray-900 dark:_text-neutral-400 dark:hover:_bg-primary-100/5 dark:hover:_text-gray-50 contrast-more:_text-gray-900 contrast-more:dark:_text-gray-50 contrast-more:_border-transparent contrast-more:hover:_border-gray-900 contrast-more:dark:hover:_border-gray-50"}
                    onClick={() =>
                      column.toggleSorting(column.getIsSorted() === "asc")
                    }
                  >
                    {display}{" "}
                    {column.getIsSorted() ? (
                      (column.getIsSorted() === "asc" && (
                        <ArrowUpAZ className="_ml-2 _h-4 _w-4" />
                      )) ||
                      (column.getIsSorted() === "desc" && (
                        <ArrowDownAZ className="_ml-2 _h-4 _w-4" />
                      ))
                    ) : (
                      <ArrowUpDown className="_ml-2 _h-4 _w-4" />
                    )}
                  </button>
                </div>
              );
            },
            cell: (c) =>
              keysToRemove.includes(key) ? (
                <div style={{ minWidth: "180px" }}> {c.getValue()}</div>
              ) : (
                <div style={{ minWidth: "180px" }}>
                  {c.getValue() === 1 ? "✓" : ""}
                </div>
              ),
            enableSorting: true,
            // enableMultiSort: true, // not working yet
          })),
      });
    });

    return preparedData;
  }, [data]);

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter, //define as a filter function that can be used in column definitions
    },
    state: {
      columnFilters,
      globalFilter,
      pagination,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "fuzzy", //apply fuzzy filter to the global filter
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(), //client side filtering
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
  });

  const clearFilters = () => {
    setGlobalFilter("");
    setColumnFilters([]);
    setColumnToggles(
      Object.keys(columnToggles).reduce(
        (acc, key) => ({ ...acc, [key]: false }),
        {}
      )
    );
    table.resetSorting();
  };

  const handleToggleChange = (columnId) => {
    setColumnToggles((prevToggles) => ({
      ...prevToggles,
      [columnId]: !prevToggles[columnId],
    }));
  };

  const filteredRows = table.getRowModel().rows.filter((row) =>
    row.getVisibleCells().every((cell) => {
      const columnId = cell.column.id;
      return !columnToggles[columnId] || cell.getValue() === 1;
    })
  );

  return (
    <div className="_w-full">
      <div className="_flex _items-center _py-4">
        <DebouncedInput
          value={globalFilter ?? ""}
          onChange={(value) => setGlobalFilter(String(value))}
          className="_rounded-lg _px-3 _py-2 _transition-colors _w-full md:_w-64 _text-base _leading-tight md:_text-sm _bg-black/[.05] dark:_bg-gray-50/10 placeholder:_text-gray-500 dark:placeholder:_text-gray-400 contrast-more:_border contrast-more:_border-current [&::-webkit-search-cancel-button]:_appearance-none _max-w-sm"
          placeholder="Fuzzy search all columns..."
        ></DebouncedInput>
        <button
          className="_ml-auto _rounded-lg nextra-focus _flex _items-center _rounded _px-2 _py-1.5 _text-sm _transition-colors [word-break:break-word] _cursor-pointer contrast-more:_border _text-gray-500 hover:_bg-gray-100 hover:_text-gray-900 dark:_text-neutral-400 dark:hover:_bg-primary-100/5 dark:hover:_text-gray-50 contrast-more:_text-gray-900 contrast-more:dark:_text-gray-50 contrast-more:_border-transparent contrast-more:hover:_border-gray-900 contrast-more:dark:hover:_border-gray-50"
          onClick={clearFilters}
        >
          Reset Filters & Sorts <ListRestart className="_ml-2 _h-4 _w-4" />
        </button>
      </div>
      {data.length === 0 ? (
        <div className="_text-center _py-4 _text-gray-500">No data found.</div>
      ) : (
        <>
          <table
            className={
              "_not-prose _block _overflow-x-auto nextra-scrollbar [&:not(:first-child)]:_mt-2 _p-0"
            }
          >
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  className={
                    "_m-0 _border-t _border-gray-300 _p-0 dark:_border-gray-600"
                  }
                  key={headerGroup.id}
                >
                  {headerGroup.headers.map((header) => {
                    return (
                      <th
                        key={header.id}
                        colSpan={header.colSpan}
                        className={
                          "_m-0 _border _border-gray-300 _px-4 _py-2 _font-semibold dark:_border-gray-600 _min-w-200"
                        }
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={
                              "_flex _flex-col _justify-items-start _items-start"
                            }
                          >
                            <div
                              {...{
                                className: header.column.getCanSort()
                                  ? "cursor-pointer select-none"
                                  : "",
                                onClick:
                                  header.column.getToggleSortingHandler(),
                              }}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </div>
                            {keysToRemove.includes(header.column.id) &&
                            header.column.getCanFilter() ? (
                              <Filter column={header.column} />
                            ) : null}
                            {!keysToRemove.includes(header.column.id) &&
                              header.column.parent != null && (
                                <div className="_py-2 ">
                                  <label>
                                    <input
                                      type="checkbox"
                                      checked={columnToggles[header.column.id]}
                                      onChange={() =>
                                        handleToggleChange(header.column.id)
                                      }
                                      className="_py-2 _mt-2"
                                    />{" "}
                                    Show checked only
                                  </label>
                                </div>
                              )}
                          </div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={table.getAllFlatColumns().length}
                    className={
                      "_m-0 _border _border-gray-300 _px-4 _py-2 dark:_border-gray-600"
                    }
                  >
                    No data found.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr
                    className={
                      "_m-0 _border-t _border-gray-300 _p-0 dark:_border-gray-600 even:_bg-gray-100 even:dark:_bg-gray-600/20"
                    }
                    key={row.id}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        className={
                          "_m-0 _border _border-gray-300 _px-4 _py-2 dark:_border-gray-600"
                        }
                        key={cell.id}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="flex items-center gap-2">
            <button
              className="border rounded p-1"
              onClick={() => table.firstPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {"<<"}
            </button>
            <button
              className="border rounded p-1"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {"<"}
            </button>
            <button
              className="border rounded p-1"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {">"}
            </button>
            <button
              className="border rounded p-1"
              onClick={() => table.lastPage()}
              disabled={!table.getCanNextPage()}
            >
              {">>"}
            </button>
            <span className="flex items-center gap-1">
              <div>Page</div>
              <strong>
                {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount().toLocaleString()}
              </strong>
            </span>
            <span className="flex items-center gap-1">
              | Go to page:
              <input
                type="number"
                min="1"
                max={table.getPageCount()}
                defaultValue={table.getState().pagination.pageIndex + 1}
                onChange={(e) => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0;
                  table.setPageIndex(page);
                }}
                className="border p-1 rounded w-16"
              />
            </span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
          </div>
          <div>
            Showing {table.getRowModel().rows.length.toLocaleString()} of{" "}
            {table.getRowCount().toLocaleString()} Rows
          </div>
        </>
      )}
    </div>
  );
}

function Filter({ column }) {
  const columnFilterValue = column.getFilterValue();

  return (
    <DebouncedInput
      type="text"
      value={columnFilterValue ?? ""}
      onChange={(value) => column.setFilterValue(value)}
      placeholder={`Search column...`}
      // className="_mt-2 _rounded-lg _px-3 _py-2 _transition-colors _w-full md:_w-64 _text-base _leading-tight md:_text-sm _bg-black/[.05] dark:_bg-gray-50/10 placeholder:_text-gray-500 dark:placeholder:_text-gray-400 contrast-more:_border contrast-more:_border-current [&::-webkit-search-cancel-button]:_appearance-none _max-w-sm"
      className="_mt-2 _rounded-lg _px-3 _py-2 _transition-colors _w-full _text-base _leading-tight md:_text-sm _bg-black/[.05] dark:_bg-gray-50/10 placeholder:_text-gray-500 dark:placeholder:_text-gray-400 contrast-more:_border contrast-more:_border-current [&::-webkit-search-cancel-button]:_appearance-none"
      // className="_w-36 _border _shadow _rounded"
    />
  );
}

// A typical debounced input react component
function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
