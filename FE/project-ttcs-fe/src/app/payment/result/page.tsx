import Link from "next/link";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

type SearchParams = Record<string, string | string[] | undefined>;

function readParam(params: SearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function getPaymentResult(params: SearchParams) {
  const status = readParam(params, "status");
  const resultCode = readParam(params, "resultCode");
  const returnCode = readParam(params, "return_code");

  if (status === "SUCCESS" || status === "00" || resultCode === "0" || returnCode === "1") {
    return {
      icon: CheckCircle2,
      title: "Thanh toán thành công",
      message: "Cảm ơn bạn. Đơn hàng đã được ghi nhận và sẽ được xử lý sớm.",
      tone: "text-green-600 bg-green-50 border-green-100",
    };
  }

  if (status === "CANCELLED" || status || resultCode || returnCode) {
    return {
      icon: XCircle,
      title: "Thanh toán chưa thành công",
      message: "Giao dịch bị hủy hoặc chưa hoàn tất. Bạn có thể kiểm tra lại đơn hàng.",
      tone: "text-red-600 bg-red-50 border-red-100",
    };
  }

  return {
    icon: Clock,
    title: "Đang chờ xác nhận",
    message: "Cổng thanh toán đã chuyển bạn về hệ thống. Trạng thái đơn sẽ được cập nhật sau.",
    tone: "text-blue-600 bg-blue-50 border-blue-100",
  };
}

export default async function PaymentResultPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) || {};
  const result = getPaymentResult(params);
  const orderId = readParam(params, "orderId");
  const orderHref = orderId ? `/user/orders/${orderId}` : "/user/orders";
  const Icon = result.icon;

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-16">
      <section className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm">
        <div
          className={`w-20 h-20 mx-auto rounded-full border flex items-center justify-center mb-6 ${result.tone}`}
        >
          <Icon className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
          {result.title}
        </h1>
        <p className="text-slate-500 mt-3 leading-relaxed">{result.message}</p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
          <Link
            href={orderHref}
            className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-black hover:bg-slate-900 transition"
          >
            Xem đơn hàng
          </Link>
          <Link
            href="/"
            className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-900 font-black hover:bg-slate-50 transition"
          >
            Về trang chủ
          </Link>
        </div>
      </section>
    </main>
  );
}
