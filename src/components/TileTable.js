"use client";

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

// todo: heavily clean up this component

// define a custom fuzzy filter function that will apply ranking info to rows (using match-sorter utils)
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
        <Link
            href={url}
            className={"underline"}
            target="_blank"
            rel="noreferrer"
        >
            {lastSegment}
        </Link>
    );
};

const modelNameUrlRender = (name, url) => {
    return (
        <Link
            href={url}
            className={"underline"}
            target="_blank"
            rel="noreferrer"
        >
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
    const [columnGroups, setColumnGroups] = useState(
        getGroupHeadersForToggles()
    );

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
        if (!data || (data && data.length === 0)) return [];

        const columnHelper = createColumnHelper();
        const preparedData = Object.keys(keyLookup).map((h) => {
            return columnHelper.group({
                id: h,
                header:
                    h.charAt(0).toUpperCase() + h.slice(1).replace(/_/g, " "),
                columns: Object.keys(data[0])
                    .filter((k) => keyLookup[h].includes(k))
                    .map((key) => ({
                        id: key,
                        accessorKey: key,
                        width: 300, // tried setting a min size here, but this does nothing?
                        groupId: keyLookup[key],
                        sortingFn:
                            key === "upload_date" ? "datetime" : "alphanumeric",
                        header: ({ column }) => {
                            const display = headerRender(key);
                            const size = keysToRemove.includes(key) ? 140 : 80;
                            return (
                                <div style={{ minWidth: `${size}px` }}>
                                    <button
                                        className={
                                            "flex flex-row items-center "
                                        }
                                        // className={"flex flex-row items-center ml-auto rounded-lg nextra-focus flex rounded px-2 py-1.5 text-sm transition-colors [word-break:break-word] cursor-pointer contrast-more:border text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-neutral-400 dark:hover:bg-primary-100/5 dark:hover:text-gray-50 contrast-more:text-gray-900 contrast-more:dark:text-gray-50 contrast-more:border-transparent contrast-more:hover:border-gray-900 contrast-more:dark:hover:border-gray-50"}
                                        onClick={() =>
                                            column.toggleSorting(
                                                column.getIsSorted() === "asc"
                                            )
                                        }
                                    >
                                        {display}{" "}
                                        {column.getIsSorted() ? (
                                            key === "upload_date" ? (
                                                (column.getIsSorted() ===
                                                    "asc" && (
                                                    <CalendarArrowUp className="ml-2 h-4 w-4" />
                                                )) ||
                                                (column.getIsSorted() ===
                                                    "desc" && (
                                                    <CalendarArrowDown className="ml-2 h-4 w-4" />
                                                ))
                                            ) : (
                                                (column.getIsSorted() ===
                                                    "asc" && (
                                                    <ArrowUpAZ className="ml-2 h-4 w-4" />
                                                )) ||
                                                (column.getIsSorted() ===
                                                    "desc" && (
                                                    <ArrowDownAZ className="ml-2 h-4 w-4" />
                                                ))
                                            )
                                        ) : (
                                            <ArrowUpDown className="ml-2 h-4 w-4" />
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
                                        {modelNameUrlRender(
                                            c.getValue(),
                                            rowData.url
                                        )}
                                    </div>
                                );
                                min;
                            } else if (key === "creator") {
                                return (
                                    <div style={{ minWidth: "140px" }}>
                                        {decodeAndRenderCreatorURL(
                                            c.getValue()
                                        )}
                                    </div>
                                );
                            } else if (keysToRemove.includes(key)) {
                                return (
                                    <div style={{ minWidth: "140px" }}>
                                        {" "}
                                        {c.getValue()}
                                    </div>
                                );
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
        const newColumnGroups = {
            ...columnGroups,
            [group]: !columnGroups[group],
        };
        setColumnGroups(newColumnGroups);

        const cols = table
            .getAllLeafColumns()
            .filter((c) => c.parent.id === group);

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
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
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
        <div className="w-full">
            <div className="flex items-center py-4">
                {/* global search */}
                {/* todo: min width on this thing */}
                <DebouncedInput
                    value={globalFilter ?? ""}
                    onChange={(value) => setGlobalFilter(String(value))}
                    className="rounded-lg px-3 py-2 transition-colors w-full md:w-64 text-base leading-tight md:text-sm bg-black/[.05] dark:bg-gray-50/10 placeholder:text-gray-500 dark:placeholder:text-gray-400 contrast-more:border contrast-more:border-current [&::-webkit-search-cancel-button]:appearance-none max-w-sm"
                    placeholder="Fuzzy search all columns..."
                />
                {/* <TogglePanel table={table} /> */}
                {/* the component i want to start here */}
                <div className="ml-auto mr-auto">
                    <div
                        ref={dropdownRef}
                        className="mb-4 flex items-center justify-between"
                    >
                        <div
                            className={
                                "rounded-lg nextra-focus flex items-center rounded px-2 py-1.5 text-sm transition-colors [word-break:break-word] text-gray-500 dark:text-neutral-400 contrast-more:text-gray-900 contrast-more:dark:text-gray-50 contrast-more:border-transparent"
                            }
                        >
                            Toggle:
                        </div>
                        <div className="flex gap-2">
                            {Object.keys(columnGroups).map((group) => (
                                <button
                                    key={group}
                                    title={`Toggle ${
                                        group.charAt(0).toUpperCase() +
                                        group.slice(1)
                                    } columns`}
                                    onClick={() => toggleColumnGroup(group)}
                                    className={`rounded-lg nextra-focus flex items-center rounded px-2 py-1.5 text-sm transition-colors [word-break:break-word] cursor-pointer contrast-more:border text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-neutral-400 dark:hover:bg-primary-100/5 dark:hover:text-gray-50 contrast-more:text-gray-900 contrast-more:dark:text-gray-50 contrast-more:border-transparent contrast-more:hover:border-gray-900 contrast-more:dark:hover:border-gray-50
                  ${
                      (columnGroups[group] ?? false) === true
                          ? "bg-black/[.05] dark:bg-primary-100/10"
                          : ""
                  }`}
                                >
                                    {group.charAt(0).toUpperCase() +
                                        group.slice(1)}
                                </button>
                            ))}
                            <div>
                                <button
                                    id="column-dropdown"
                                    title="Toggle individual columns"
                                    onClick={(e) =>
                                        setDropdownOpen((prev) => !prev)
                                    }
                                    // className="px-3 py-1 border rounded"
                                    className="rounded-lg nextra-focus bg-gray-800 flex items-center rounded px-2 py-1.5 text-sm transition-colors [word-break:break-word] cursor-pointer contrast-more:border text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-neutral-400 dark:hover:bg-primary-100/5 dark:hover:text-gray-50 contrast-more:text-gray-900 contrast-more:dark:text-gray-50 contrast-more:border-transparent contrast-more:hover:border-gray-900 contrast-more:dark:hover:border-gray-50"
                                >
                                    Columns{" "}
                                    <ArrowRight className="h-3.5 *:origin-center *:transition-transform *:rotate-90" />
                                </button>
                                {dropdownOpen && (
                                    <div className="nextra-focus absolute right-0 mt-2 w-48 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-neutral-900">
                                        {table
                                            .getAllLeafColumns()
                                            .map((column) => (
                                                <label
                                                    key={column.id}
                                                    className="flex bg-gray-800 items-center px-4 py-2 dark:bg-primary-100 dark:hover:bg-primary-100/5 dark:hover:text-gray-50 "
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={column.getIsVisible()}
                                                        className={
                                                            "dark:bg-primary-100 dark:hover:bg-primary-100/5 text-gray-500 dark:text-neutral-400"
                                                        }
                                                        onChange={(e) =>
                                                            column.toggleVisibility(
                                                                e.target.checked
                                                            )
                                                        }
                                                    />
                                                    <span className="ml-2">
                                                        {headerRender(
                                                            column.id
                                                        )}
                                                    </span>
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
                    className="ml-auto rounded-lg nextra-focus flex items-center rounded px-2 py-1.5 text-sm transition-colors [word-break:break-word] cursor-pointer contrast-more:border text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-neutral-400 dark:hover:bg-primary-100/5 dark:hover:text-gray-50 contrast-more:text-gray-900 contrast-more:dark:text-gray-50 contrast-more:border-transparent contrast-more:hover:border-gray-900 contrast-more:dark:hover:border-gray-50"
                    onClick={clearFilters}
                >
                    Reset <ListRestart className="ml-2 h-4 w-4" />
                </button>
            </div>
            {data.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                    No data found.
                </div>
            ) : (
                <div
                    className={
                        "not-prose block max-w-full overflow-x-scroll overflow-y-hidden nextra-scrollbar[&:not(:first-child)]:mt-2 p-0"
                        // "overflow-auto max-h-[400px] not-prose block max-w-full  nextra-scrollbar[&:not(:first-child)]:mt-2 p-0"
                    }
                >
                    <table
                        className={"w-full table-auto"}
                        // className={"not-prose block nextra-scrollbar [&:not(:first-child)]:mt-2 p-0"}
                        // className={"not-prose block overflow-x-auto nextra-scrollbar [&:not(:first-child)]:mt-2 p-0"}
                        // className={"not-prose block max-w-full overflow-x-scroll overflow-y-hidden nextra-scrollbar [&:not(:first-child)]:mt-2 p-0"}
                        // className={"not-prose block max-w-full overflow-x-scroll overflow-y-hidden [&:not(:first-child)]:mt-2 p-0"}
                    >
                        <thead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr
                                    className={
                                        "m-0 border-t border-gray-300 p-0 dark:border-gray-600"
                                    }
                                    key={headerGroup.id}
                                >
                                    {headerGroup.headers.map((header) => {
                                        const size = keysToRemove.includes(
                                            headerGroup.id
                                        )
                                            ? 140
                                            : 80;
                                        return (
                                            <th
                                                key={header.id}
                                                colSpan={header.colSpan}
                                                style={{
                                                    minWidth: `${size}px`,
                                                }}
                                                className={
                                                    "m-0 border border-gray-300 px-4 py-2 font-semibold dark:border-gray-600 min-w-200"
                                                }
                                            >
                                                {header.isPlaceholder ? null : (
                                                    <div
                                                        style={{
                                                            minWidth: `${size}px`,
                                                        }}
                                                        className={
                                                            "flex flex-col justify-items-start items-start"
                                                        }
                                                    >
                                                        <div
                                                            {...{
                                                                className:
                                                                    header.column.getCanSort()
                                                                        ? "cursor-pointer select-none"
                                                                        : "",
                                                                onClick:
                                                                    header.column.getToggleSortingHandler(),
                                                            }}
                                                        >
                                                            {flexRender(
                                                                header.column
                                                                    .columnDef
                                                                    .header,
                                                                header.getContext()
                                                            )}
                                                        </div>
                                                        {keysToRemove.includes(
                                                            header.column.id
                                                        ) &&
                                                        header.column.getCanFilter() ? (
                                                            <Filter
                                                                column={
                                                                    header.column
                                                                }
                                                            />
                                                        ) : null}
                                                        {!keysToRemove.includes(
                                                            header.column.id
                                                        ) &&
                                                            header.column
                                                                .parent !=
                                                                null && (
                                                                <div className="py-2 ">
                                                                    <label>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={
                                                                                columnToggles[
                                                                                    header
                                                                                        .column
                                                                                        .id
                                                                                ]
                                                                            }
                                                                            onChange={() =>
                                                                                handleToggleChange(
                                                                                    header
                                                                                        .column
                                                                                        .id
                                                                                )
                                                                            }
                                                                            className="py-2 mt-2"
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
                                        colSpan={
                                            table.getAllFlatColumns().length
                                        }
                                        className={
                                            "m-0 border border-gray-300 px-4 py-2 dark:border-gray-600"
                                        }
                                    >
                                        No data found.
                                    </td>
                                </tr>
                            ) : (
                                filteredRows.map((row) => (
                                    <tr
                                        className={
                                            "m-0 border-t border-gray-300 p-0 dark:border-gray-600 even:bg-gray-100 even:dark:bg-gray-600/20"
                                        }
                                        key={row.id}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td
                                                className={
                                                    "m-0 border border-gray-300 px-4 py-2 dark:border-gray-600"
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
                                defaultValue={
                                    table.getState().pagination.pageIndex + 1
                                }
                                onChange={(e) => {
                                    const page = e.target.value
                                        ? Number(e.target.value) - 1
                                        : 0;
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
                        Showing{" "}
                        {table.getRowModel().rows.length.toLocaleString()} of{" "}
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
//     <div className="flex">
//       <button
//         onClick={toggleVisibility}
//         className="ml-auto rounded-lg nextra-focus flex items-center rounded px-2 py-1.5 text-sm transition-colors [word-break:break-word] cursor-pointer contrast-more:border text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-neutral-400 dark:hover:bg-primary-100/5 dark:hover:text-gray-50 contrast-more:text-gray-900 contrast-more:dark:text-gray-50 contrast-more:border-transparent contrast-more:hover:border-gray-900 contrast-more:dark:hover:border-gray-50"
//       >
//         Toggle Property Columns
//       </button>
//       <button
//         onClick={() => {
//           toggleSingleColumnVis("uploaddate");
//           toggleSingleColumnVis("creator");
//         }}
//         className="ml-auto rounded-lg nextra-focus flex items-center rounded px-2 py-1.5 text-sm transition-colors [word-break:break-word] cursor-pointer contrast-more:border text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-neutral-400 dark:hover:bg-primary-100/5 dark:hover:text-gray-50 contrast-more:text-gray-900 contrast-more:dark:text-gray-50 contrast-more:border-transparent contrast-more:hover:border-gray-900 contrast-more:dark:hover:border-gray-50"
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
            // className="mt-2 rounded-lg px-3 py-2 transition-colors w-full md:w-64 text-base leading-tight md:text-sm bg-black/[.05] dark:bg-gray-50/10 placeholder:text-gray-500 dark:placeholder:text-gray-400 contrast-more:border contrast-more:border-current [&::-webkit-search-cancel-button]:appearance-none max-w-sm"
            className="mt-2 rounded-lg px-3 py-2 transition-colors w-full text-base leading-tight md:text-sm bg-black/[.05] dark:bg-gray-50/10 placeholder:text-gray-500 dark:placeholder:text-gray-400 contrast-more:border contrast-more:border-current [&::-webkit-search-cancel-button]:appearance-none"
            // className="w-36 border shadow rounded"
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
