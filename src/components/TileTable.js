import React, { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  ArrowUpAZ,
  ArrowDownAZ,
  ListRestart,
  CalendarArrowDown,
  CalendarArrowUp,
  ArrowRight,
} from "lucide-react";
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

//todo at least rename, but ideally just use key lookup below
const keysToRemove = [
  "name",
  // "url",
  "upload_date",
  "creator",
];
//todo add other hierarchy to db because this is lame
const keyLookup = {
  meta: [
    "name",
    // "url",
    "upload_date",
    "creator",
  ],
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

const decodeAndRenderCreatorURL = (url) => {
  const decodedUrl = decodeURIComponent(url);
  const lastSegment = decodedUrl.substring(decodedUrl.lastIndexOf("/") + 1);
  return (
    <Link href={url} className={"_underline"} target="_blank" rel="noreferrer">
      {lastSegment}
    </Link>
  );
};

const modelNameUrlRender = (name, url) => {
  return (
    <Link href={url} className={"_underline"} target="_blank" rel="noreferrer">
      {name}
    </Link>
  );
};

const headerRender = (key) => {
  switch (key) {
    case "on_play_setup":
      return "On Play/Setup"; // adding the slash rather than a space to match
    case "url":
      return "URL";
    case "alters_tiles":
    case "alters_balls":
    case "alters_hands":
    case "alters_turns":
      return (
        key
          .slice(0, -1)
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ") + "(s)"
      );
    case "is_unique":
      return "Unique"; // had to rename due to unique being reserved keyword
    default:
      return key
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
  }
};

const getGroupHeadersForToggles = () => {
  const groupHeaders = Object.keys(keyLookup).reduce((acc, key) => {
    acc[key] = true;
    return acc;
  }, {});
  return groupHeaders;
};

export default function TileTable({ data }) {
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnGroups, setColumnGroups] = useState(getGroupHeadersForToggles());

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
    pageSize: 50, // dropdown can let user change this value
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
            width: 300, // tried setting a min size here, but this does nothing?
            groupId: keyLookup[key],
            sortingFn: key === "upload_date" ? "datetime" : "alphanumeric",
            header: ({ column }) => {
              const display = headerRender(key);
              const size = keysToRemove.includes(key) ? 140 : 80;
              return (
                <div style={{ minWidth: `${size}px` }}>
                  <button
                    className={"_flex _flex-row _items-center "}
                    // className={"_flex _flex-row _items-center _ml-auto _rounded-lg nextra-focus _flex _rounded _px-2 _py-1.5 _text-sm _transition-colors [word-break:break-word] _cursor-pointer contrast-more:_border _text-gray-500 hover:_bg-gray-100 hover:_text-gray-900 dark:_text-neutral-400 dark:hover:_bg-primary-100/5 dark:hover:_text-gray-50 contrast-more:_text-gray-900 contrast-more:dark:_text-gray-50 contrast-more:_border-transparent contrast-more:hover:_border-gray-900 contrast-more:dark:hover:_border-gray-50"}
                    onClick={() =>
                      column.toggleSorting(column.getIsSorted() === "asc")
                    }
                  >
                    {display}{" "}
                    {column.getIsSorted() ? (
                      key === "upload_date" ? (
                        (column.getIsSorted() === "asc" && (
                          <CalendarArrowUp className="_ml-2 _h-4 _w-4" />
                        )) ||
                        (column.getIsSorted() === "desc" && (
                          <CalendarArrowDown className="_ml-2 _h-4 _w-4" />
                        ))
                      ) : (
                        (column.getIsSorted() === "asc" && (
                          <ArrowUpAZ className="_ml-2 _h-4 _w-4" />
                        )) ||
                        (column.getIsSorted() === "desc" && (
                          <ArrowDownAZ className="_ml-2 _h-4 _w-4" />
                        ))
                      )
                    ) : (
                      <ArrowUpDown className="_ml-2 _h-4 _w-4" />
                    )}
                  </button>
                </div>
              );
            },
            cell: (c) => {
              const rowData = c.row.original; // Access the full row data
              if (key === "name") {
                return (
                  <div style={{ minWidth: "160px" }}>
                    {modelNameUrlRender(c.getValue(), rowData.url)}
                  </div>
                );
                min;
              } else if (key === "creator") {
                return (
                  <div style={{ minWidth: "140px" }}>
                    {decodeAndRenderCreatorURL(c.getValue())}
                  </div>
                );
              } else if (keysToRemove.includes(key)) {
                return <div style={{ minWidth: "140px" }}> {c.getValue()}</div>;
              } else {
                return (
                  <div
                    style={{
                      width: "80px",
                      textAlign: "center",
                      margin: "auto",
                    }}
                  >
                    {c.getValue() === 1 ? "✓" : ""}
                  </div>
                );
              }
            },
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
      columnVisibility,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "fuzzy", //apply fuzzy filter to the global filter
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(), //client side filtering
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
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
    setColumnVisibility({});
    setColumnGroups(getGroupHeadersForToggles());

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

  const toggleColumnGroup = (group) => {
    const newColumnGroups = { ...columnGroups, [group]: !columnGroups[group] };
    setColumnGroups(newColumnGroups);

    const cols = table.getAllLeafColumns().filter((c) => c.parent.id === group);

    const newColumnVisibility = { ...columnVisibility };
    cols.forEach((column) => {
      if (column.id !== "name") {
        // never hide name column
        newColumnVisibility[column.id] = newColumnGroups[group];
      }
    });

    setColumnVisibility(newColumnVisibility);
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null); // Create a ref for the dropdown content

  useEffect(() => {
    const handleOutsideClick = (event) => {
      // Check if click is outside the dropdownRef content
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false); // Close dropdown if click is outside
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [dropdownOpen]);

  return (
    <div className="_w-full">
      <div className="_flex _items-center _py-4">
        {/* global search */}
        {/* todo: min width on this thing */}
        <DebouncedInput
          value={globalFilter ?? ""}
          onChange={(value) => setGlobalFilter(String(value))}
          className="_rounded-lg _px-3 _py-2 _transition-colors _w-full md:_w-64 _text-base _leading-tight md:_text-sm _bg-black/[.05] dark:_bg-gray-50/10 placeholder:_text-gray-500 dark:placeholder:_text-gray-400 contrast-more:_border contrast-more:_border-current [&::-webkit-search-cancel-button]:_appearance-none _max-w-sm"
          placeholder="Fuzzy search all columns..."
        />
        {/* <TogglePanel table={table} /> */}
        {/* the component i want to start here */}
        <div className="_ml-auto _mr-auto">
          <div
            ref={dropdownRef}
            className="_mb-4 _flex _items-center _justify-between"
          >
            <div
              className={
                "_rounded-lg nextra-focus _flex _items-center _rounded _px-2 _py-1.5 _text-sm _transition-colors [word-break:break-word] _text-gray-500 dark:_text-neutral-400 contrast-more:_text-gray-900 contrast-more:dark:_text-gray-50 contrast-more:_border-transparent"
              }
            >
              Toggle:
            </div>
            <div className="_flex _gap-2">
              {Object.keys(columnGroups).map((group) => (
                <button
                  key={group}
                  title={`Toggle ${
                    group.charAt(0).toUpperCase() + group.slice(1)
                  } columns`}
                  onClick={() => toggleColumnGroup(group)}
                  className={`_rounded-lg nextra-focus _flex _items-center _rounded _px-2 _py-1.5 _text-sm _transition-colors [word-break:break-word] _cursor-pointer contrast-more:_border _text-gray-500 hover:_bg-gray-100 hover:_text-gray-900 dark:_text-neutral-400 dark:hover:_bg-primary-100/5 dark:hover:_text-gray-50 contrast-more:_text-gray-900 contrast-more:dark:_text-gray-50 contrast-more:_border-transparent contrast-more:hover:_border-gray-900 contrast-more:dark:hover:_border-gray-50
                  ${
                    (columnGroups[group] ?? false) === true
                      ? "_bg-black/[.05] dark:_bg-primary-100/10"
                      : ""
                  }`}
                >
                  {group.charAt(0).toUpperCase() + group.slice(1)}
                </button>
              ))}
              <div>
                <button
                  id="column-dropdown"
                  title="Toggle individual columns"
                  onClick={(e) => setDropdownOpen((prev) => !prev)}
                  // className="_px-3 _py-1 _border _rounded"
                  className="_rounded-lg nextra-focus _bg-gray-800 _flex _items-center _rounded _px-2 _py-1.5 _text-sm _transition-colors [word-break:break-word] _cursor-pointer contrast-more:_border _text-gray-500 hover:_bg-gray-100 hover:_text-gray-900 dark:_text-neutral-400 dark:hover:_bg-primary-100/5 dark:hover:_text-gray-50 contrast-more:_text-gray-900 contrast-more:dark:_text-gray-50 contrast-more:_border-transparent contrast-more:hover:_border-gray-900 contrast-more:dark:hover:_border-gray-50"
                >
                  Columns{" "}
                  <ArrowRight className="_h-3.5 *:_origin-center *:_transition-transform *:_rotate-90" />
                </button>
                {dropdownOpen && (
                  <div className="nextra-focus _absolute _right-0 _mt-2 _w-48 _border _border-gray-300 dark:_border-gray-600 _rounded _bg-white dark:_bg-neutral-900">
                    {table.getAllLeafColumns().map((column) => (
                      <label
                        key={column.id}
                        className="_flex _bg-gray-800 _items-center _px-4 _py-2 dark:_bg-primary-100 dark:hover:_bg-primary-100/5 dark:hover:_text-gray-50 "
                      >
                        <input
                          type="checkbox"
                          checked={column.getIsVisible()}
                          className={
                            "dark:_bg-primary-100 dark:hover:_bg-primary-100/5 _text-gray-500 dark:_text-neutral-400"
                          }
                          onChange={(e) =>
                            column.toggleVisibility(e.target.checked)
                          }
                        />
                        <span className="_ml-2">{headerRender(column.id)}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* the component i want to end here */}
        <button
          className="_ml-auto _rounded-lg nextra-focus _flex _items-center _rounded _px-2 _py-1.5 _text-sm _transition-colors [word-break:break-word] _cursor-pointer contrast-more:_border _text-gray-500 hover:_bg-gray-100 hover:_text-gray-900 dark:_text-neutral-400 dark:hover:_bg-primary-100/5 dark:hover:_text-gray-50 contrast-more:_text-gray-900 contrast-more:dark:_text-gray-50 contrast-more:_border-transparent contrast-more:hover:_border-gray-900 contrast-more:dark:hover:_border-gray-50"
          onClick={clearFilters}
        >
          Reset <ListRestart className="_ml-2 _h-4 _w-4" />
        </button>
      </div>
      {data.length === 0 ? (
        <div className="_text-center _py-4 _text-gray-500">No data found.</div>
      ) : (
        <div
          className={
            "_not-prose _block _max-w-full _overflow-x-scroll _overflow-y-hidden nextra-scrollbar[&:not(:first-child)]:_mt-2 _p-0"
            // "_overflow-auto _max-h-[400px] _not-prose _block _max-w-full  nextra-scrollbar[&:not(:first-child)]:_mt-2 _p-0"
          }
        >
          <table
            className={"_w-full _table-auto"}
            // className={"_not-prose _block nextra-scrollbar [&:not(:first-child)]:_mt-2 _p-0"}
            // className={"_not-prose _block _overflow-x-auto nextra-scrollbar [&:not(:first-child)]:_mt-2 _p-0"}
            // className={"_not-prose _block _max-w-full _overflow-x-scroll _overflow-y-hidden nextra-scrollbar [&:not(:first-child)]:_mt-2 _p-0"}
            // className={"_not-prose _block _max-w-full _overflow-x-scroll _overflow-y-hidden [&:not(:first-child)]:_mt-2 _p-0"}
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
                    const size = keysToRemove.includes(headerGroup.id)
                      ? 140
                      : 80;
                    return (
                      <th
                        key={header.id}
                        colSpan={header.colSpan}
                        style={{ minWidth: `${size}px` }}
                        className={
                          "_m-0 _border _border-gray-300 _px-4 _py-2 _font-semibold dark:_border-gray-600 _min-w-200"
                        }
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            style={{ minWidth: `${size}px` }}
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
                                    Checked
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
              {[10, 20, 50, 100].map((pageSize) => (
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
        </div>
      )}
    </div>
  );
}

// function TogglePanel({ table }) {
//   const [visibleChecks, setVisibleChecks] = useState(true);
//   const [visMap, setVisMap] = useState({});

//   const toggleVisibility = () => {
//     const cols = table.getAllFlatColumns();
//     cols.forEach((col) => {
//       if (col.depth !== 0 && !keysToRemove.includes(col.id)) {
//         col.toggleVisibility(!visibleChecks);
//       }
//     });

//     setVisibleChecks(!visibleChecks);
//   };

//   // const toggleSingleColumnVis = (id) => {
//   //   const col = table.getColumn(id);
//   //   const state = visMap[id] ?? true; // if not in map, assume visible - if we ever default hide, need to set defaults here I think

//   //   console.log(state);
//   //   col.toggleVisibility(!state);
//   //   setVisMap((prev) => ({
//   //     ...prev,
//   //     [id]: !state,
//   //   }));
//   // };

//   return (
//     <div className="_flex">
//       <button
//         onClick={toggleVisibility}
//         className="_ml-auto _rounded-lg nextra-focus _flex _items-center _rounded _px-2 _py-1.5 _text-sm _transition-colors [word-break:break-word] _cursor-pointer contrast-more:_border _text-gray-500 hover:_bg-gray-100 hover:_text-gray-900 dark:_text-neutral-400 dark:hover:_bg-primary-100/5 dark:hover:_text-gray-50 contrast-more:_text-gray-900 contrast-more:dark:_text-gray-50 contrast-more:_border-transparent contrast-more:hover:_border-gray-900 contrast-more:dark:hover:_border-gray-50"
//       >
//         Toggle Property Columns
//       </button>
//       <button
//         onClick={() => {
//           toggleSingleColumnVis("upload_date");
//           toggleSingleColumnVis("creator");
//         }}
//         className="_ml-auto _rounded-lg nextra-focus _flex _items-center _rounded _px-2 _py-1.5 _text-sm _transition-colors [word-break:break-word] _cursor-pointer contrast-more:_border _text-gray-500 hover:_bg-gray-100 hover:_text-gray-900 dark:_text-neutral-400 dark:hover:_bg-primary-100/5 dark:hover:_text-gray-50 contrast-more:_text-gray-900 contrast-more:dark:_text-gray-50 contrast-more:_border-transparent contrast-more:hover:_border-gray-900 contrast-more:dark:hover:_border-gray-50"
//       >
//         Toggle Upload Information
//       </button>
//     </div>
//   );
// }

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
