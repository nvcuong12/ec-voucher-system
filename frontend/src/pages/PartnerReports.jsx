import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  RiMoneyDollarCircleLine,
  RiTicket2Line,
  RiCheckDoubleLine,
  RiTimeLine,
  RiBarChartBoxLine,
  RiLineChartLine,
  RiSearchLine,
  RiArrowUpLine,
  RiArrowDownLine
} from "react-icons/ri";
import usePartnerStatus from "../hooks/usePartnerStatus";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "revenue", direction: "desc" });
  const { isRestricted, partnerStatus, statusLoading } = usePartnerStatus();

  useEffect(() => {
    if (statusLoading) return undefined;
    if (isRestricted) {
      setLoading(false);
      setReport(null);
      return undefined;
    }

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
  }, [isRestricted, statusLoading]);

  const summary = report?.summary;
  const enrichedRows = (report?.vouchers ?? []).map((row) => {
    const issued = Number(row.issued_count || 0);
    const used = Number(row.used_count || 0);
    const usageRate = issued ? Math.round((used / issued) * 100) : 0;
    return { ...row, usageRate, revenue: Number(row.revenue || 0) };
  });

  let filteredRows = enrichedRows.filter(row => 
    row.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (sortConfig.key) {
    filteredRows.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  const handleSort = (key) => {
    let direction = "desc";
    if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  if (loading || statusLoading) {
    return (
      <div className="container partner-page">
        <div style={{ textAlign: "center", padding: "4rem 0" }}>
          <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3, margin: "0 auto 1rem" }} />
          <p className="text-muted">Đang phân tích báo cáo...</p>
        </div>
      </div>
    );
  }

  if (isRestricted) {
    const reason = partnerStatus === "PENDING"
      ? "Tài khoản đối tác của bạn đang chờ duyệt."
      : partnerStatus === "REJECTED"
      ? "Hồ sơ đối tác của bạn đã bị từ chối."
      : "Tài khoản đối tác của bạn đang bị tạm khóa.";

    return (
      <div className="container partner-reports">
        <div className="partner-report-restricted">
          <h2>Chưa thể xem báo cáo</h2>
          <p>{reason}</p>
          <Link to="/partner" className="btn btn-outline">
            Về trang đối tác
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container partner-reports">
      <header className="partner-page-header">
        <div className="partner-page-hero">
          <h1><RiLineChartLine style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Báo cáo đối tác</h1>
          <p className="text-muted" style={{ margin: 0 }}>Theo dõi tổng quan doanh thu, số lượng phát hành và hiệu suất voucher của bạn.</p>
        </div>
      </header>

      {error && <div className="partner-error-box">{error}</div>}

      {summary && (
        <div className="grid-4 partner-stats" style={{ marginBottom: "2rem" }}>
          <div className="partner-stat-card">
            <div className="partner-stat-icon" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10b981" }}>
              <RiMoneyDollarCircleLine />
            </div>
            <div className="partner-stat-info">
              <h3>Tổng Doanh Thu</h3>
              <div className="partner-stat-number" style={{ fontSize: "1.3rem" }}>{formatMoney(summary.revenue)}</div>
              <div className="partner-stat-sub">VND</div>
            </div>
          </div>
          
          <div className="partner-stat-card">
            <div className="partner-stat-icon" style={{ background: "rgba(14, 165, 233, 0.12)", color: "#0ea5e9" }}>
              <RiTicket2Line />
            </div>
            <div className="partner-stat-info">
              <h3>Đã Bán</h3>
              <div className="partner-stat-number">{summary.sold_count}</div>
              <div className="partner-stat-sub">Voucher</div>
            </div>
          </div>

          <div className="partner-stat-card">
            <div className="partner-stat-icon" style={{ background: "rgba(139, 92, 246, 0.12)", color: "#8b5cf6" }}>
              <RiCheckDoubleLine />
            </div>
            <div className="partner-stat-info">
              <h3>Đã Sử Dụng</h3>
              <div className="partner-stat-number">{summary.used_count}</div>
              <div className="partner-stat-sub">Voucher</div>
            </div>
          </div>

          <div className="partner-stat-card">
            <div className="partner-stat-icon" style={{ background: "rgba(244, 63, 94, 0.12)", color: "#f43f5e" }}>
              <RiTimeLine />
            </div>
            <div className="partner-stat-info">
              <h3>Hết Hạn</h3>
              <div className="partner-stat-number">{summary.expired_count}</div>
              <div className="partner-stat-sub">Voucher (chưa dùng)</div>
            </div>
          </div>
        </div>
      )}

      <section className="partner-section-card partner-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ margin: 0 }}><RiBarChartBoxLine /> Hiệu quả theo từng Voucher</h2>
          <div className="search-bar" style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
            <RiSearchLine style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              className="input" 
              placeholder="Tìm kiếm voucher..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '35px', width: '100%', margin: 0 }}
            />
          </div>
        </div>

        {enrichedRows.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 0" }}>
            <RiBarChartBoxLine style={{ fontSize: "4rem", color: "var(--color-border)", marginBottom: "1rem" }} />
            <p className="text-muted">Chưa có dữ liệu giao dịch nào để hiển thị.</p>
          </div>
        ) : filteredRows.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 0" }}>
            <p className="text-muted">Không tìm thấy voucher nào phù hợp.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th style={{ cursor: "pointer", userSelect: "none" }} onClick={() => handleSort("name")}>
                    Tên Voucher {sortConfig.key === "name" && (sortConfig.direction === "asc" ? <RiArrowUpLine style={{verticalAlign: 'middle'}}/> : <RiArrowDownLine style={{verticalAlign: 'middle'}}/>)}
                  </th>
                  <th className="text-right" style={{ cursor: "pointer", userSelect: "none" }} onClick={() => handleSort("revenue")}>
                    Doanh thu {sortConfig.key === "revenue" && (sortConfig.direction === "asc" ? <RiArrowUpLine style={{verticalAlign: 'middle'}}/> : <RiArrowDownLine style={{verticalAlign: 'middle'}}/>)}
                  </th>
                  <th className="text-center" style={{ cursor: "pointer", userSelect: "none" }} onClick={() => handleSort("sold_count")}>
                    Đã bán {sortConfig.key === "sold_count" && (sortConfig.direction === "asc" ? <RiArrowUpLine style={{verticalAlign: 'middle'}}/> : <RiArrowDownLine style={{verticalAlign: 'middle'}}/>)}
                  </th>
                  <th className="text-center" style={{ cursor: "pointer", userSelect: "none" }} onClick={() => handleSort("issued_count")}>
                    Phát hành {sortConfig.key === "issued_count" && (sortConfig.direction === "asc" ? <RiArrowUpLine style={{verticalAlign: 'middle'}}/> : <RiArrowDownLine style={{verticalAlign: 'middle'}}/>)}
                  </th>
                  <th className="text-center" style={{ cursor: "pointer", userSelect: "none" }} onClick={() => handleSort("used_count")}>
                    Đã dùng {sortConfig.key === "used_count" && (sortConfig.direction === "asc" ? <RiArrowUpLine style={{verticalAlign: 'middle'}}/> : <RiArrowDownLine style={{verticalAlign: 'middle'}}/>)}
                  </th>
                  <th className="text-center" style={{ cursor: "pointer", userSelect: "none" }} onClick={() => handleSort("expired_count")}>
                    Hết hạn {sortConfig.key === "expired_count" && (sortConfig.direction === "asc" ? <RiArrowUpLine style={{verticalAlign: 'middle'}}/> : <RiArrowDownLine style={{verticalAlign: 'middle'}}/>)}
                  </th>
                  <th className="text-center" style={{ cursor: "pointer", userSelect: "none" }} onClick={() => handleSort("usageRate")}>
                    Tỷ lệ dùng {sortConfig.key === "usageRate" && (sortConfig.direction === "asc" ? <RiArrowUpLine style={{verticalAlign: 'middle'}}/> : <RiArrowDownLine style={{verticalAlign: 'middle'}}/>)}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => {
                  let rateColor = "var(--color-text-muted)";
                  if (row.usageRate >= 70) rateColor = "#10b981"; // green
                  else if (row.usageRate >= 30) rateColor = "#f59e0b"; // orange
                  else if (row.usageRate > 0) rateColor = "#ef4444"; // red

                  return (
                    <tr key={row.id}>
                      <td style={{ fontWeight: "600", color: "var(--color-text)", maxWidth: "250px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={row.name}>
                        {row.name}
                      </td>
                      <td className="text-right" style={{ color: "#10b981", fontWeight: "600" }}>{formatMoney(row.revenue)}</td>
                      <td className="text-center">{row.sold_count}</td>
                      <td className="text-center">{row.issued_count}</td>
                      <td className="text-center">{row.used_count}</td>
                      <td className="text-center">{row.expired_count}</td>
                      <td className="text-center">
                        <span style={{ 
                          display: "inline-block",
                          padding: "0.2rem 0.6rem", 
                          borderRadius: "99px", 
                          background: `${rateColor}20`, 
                          color: rateColor,
                          fontWeight: "bold",
                          fontSize: "0.85rem",
                          minWidth: "60px"
                        }}>
                          {row.usageRate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default PartnerReports;
