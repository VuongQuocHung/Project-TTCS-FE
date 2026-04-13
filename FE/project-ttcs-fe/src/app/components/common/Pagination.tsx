"use client";

type PaginationProps = {
  page: number; 
  totalPages: number;
  totalElements?: number;
  numberOfElements?: number;
  onPageChange: (nextPage: number) => void;
};

export function Pagination({
  page,
  totalPages,
  totalElements,
  numberOfElements,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i);

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

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`px-3 py-2 border rounded ${
              p === page ? "bg-blue-600 text-white border-blue-600" : "bg-white"
            }`}
          >
            {p + 1}
          </button>
        ))}

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
