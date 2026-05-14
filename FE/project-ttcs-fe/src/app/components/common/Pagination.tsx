"use client";

import { type FormEvent, useState } from "react";

type PaginationProps = {
  page: number; 
  totalPages: number;
  totalElements?: number;
  numberOfElements?: number;
  onPageChange: (nextPage: number) => void;
};

type PageItem = number | "...";

const getPageItems = (page: number, totalPages: number): PageItem[] => {
  if (totalPages <= 6) {
    return Array.from({ length: totalPages }, (_, index) => index);
  }

  const lastPage = totalPages - 1;

  if (page <= 4 || page === lastPage) {
    return [0, 1, 2, 3, 4, "...", lastPage];
  }

  return [0, 1, 2, 3, 4, "...", page, "...", lastPage];
};

export function Pagination({
  page,
  totalPages,
  totalElements,
  numberOfElements,
  onPageChange,
}: PaginationProps) {
  const [jumpPage, setJumpPage] = useState("");

  if (totalPages <= 1) return null;

  const pageItems = getPageItems(page, totalPages);

  const handleJumpPage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const targetPage = Number(jumpPage);
    if (!Number.isFinite(targetPage)) return;

    const nextPage = Math.min(totalPages, Math.max(1, Math.trunc(targetPage))) - 1;
    onPageChange(nextPage);
    setJumpPage("");
  };

  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Trang {page + 1}/{totalPages}
        {typeof numberOfElements === "number" && typeof totalElements === "number"
          ? ` - Hiển thị ${numberOfElements}/${totalElements}`
          : ""}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          className="px-3 py-2 border rounded disabled:opacity-40"
        >
          Trước
        </button>

        {pageItems.map((item, index) =>
          item === "..." ? (
            <span key={`ellipsis-${index}`} className="min-w-12 px-4 py-2 text-center font-bold text-slate-400">
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={`px-3 py-2 border rounded ${
                item === page ? "bg-blue-600 text-white border-blue-600" : "bg-white"
              }`}
            >
              {item + 1}
            </button>
          )
        )}

        <form onSubmit={handleJumpPage}>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={jumpPage}
            onChange={(event) => setJumpPage(event.target.value)}
            placeholder="Đến"
            aria-label="Nhập số trang muốn đến"
            className="w-18 rounded border px-3 py-2 text-center font-[400] outline-none focus:border-blue-600"
          />
        </form>

        <button
          type="button"
          disabled={page + 1 >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="px-3 py-2 border rounded disabled:opacity-40"
        >
          Sau
        </button>
      </div>
    </div>
  );
}
