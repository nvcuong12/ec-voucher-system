import { useEffect, useState } from "react";
import { getPartnerReportsRequest } from "../services/partner.service";
import "./PartnerReports.css";

const formatMoney = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number(value || 0)
  );

const PartnerReports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    getPartnerReportsRequest()
      .then((data) => {
        if (mounted) setReport(data);
      })
      .catch((err) => {
        if (mounted) {
          setError(err.response?.data?.error?.message || "Không tải được báo cáo");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const summary = report?.summary;
  const enrichedRows = (report?.vouchers ?? []).map((row) => {
    const issued = Number(row.issued_count || 0);
    const used = Number(row.used_count || 0);
    const usageRate = issued ? Math.round((used / issued) * 100) : 0;
    return { ...row, usageRate };
  });

  if (loading) return <div className="container partner-reports">Đang tải...</div>;

  return (
    <div className="container partner-reports">
      <header className="partner-reports-header">
        <h1>Báo cáo đối tác</h1>
        <p>Tổng quan doanh thu, số lượng phát hành và hiệu suất voucher.</p>
      </header>

      {error && <p className="text-danger">{error}</p>}

      {summary && (
        <section className="partner-reports-summary">
          <div className="card report-card">
            <h3>Doanh thu</h3>
            <p className="text-muted">{formatMoney(summary.revenue)}</p>
          </div>
          <div className="card report-card">
            <h3>Đã bán</h3>
            <p className="text-muted">{summary.sold_count} voucher</p>
          </div>
          <div className="card report-card">
            <h3>Đã sử dụng</h3>
            <p className="text-muted">{summary.used_count} voucher</p>
          </div>
          <div className="card report-card">
            <h3>Hết hạn</h3>
            <p className="text-muted">{summary.expired_count} voucher</p>
          </div>
        </section>
      )}

      <section className="card report-table-card">
        <h2>Hiệu quả theo voucher</h2>
        {enrichedRows.length === 0 ? (
          <p className="text-muted">Chưa có dữ liệu để hiển thị.</p>
        ) : (
          <div className="report-table">
            <div className="report-row report-header">
              <span>Voucher</span>
              <span>Doanh thu</span>
              <span>Đã bán</span>
              <span>Phát hành</span>
              <span>Đã dùng</span>
              <span>Hết hạn</span>
              <span>Tỷ lệ dùng</span>
            </div>
            {enrichedRows.map((row) => (
              <div key={row.id} className="report-row">
                <span>{row.name}</span>
                <span>{formatMoney(row.revenue)}</span>
                <span>{row.sold_count}</span>
                <span>{row.issued_count}</span>
                <span>{row.used_count}</span>
                <span>{row.expired_count}</span>
                <span>{row.usageRate}%</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default PartnerReports;
