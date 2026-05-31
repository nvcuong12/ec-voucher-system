import { useEffect, useState } from "react";
import { getPartnerBranchesRequest, scanVoucherRequest } from "../services/partner.service";
import "./PartnerVoucherScan.css";

const PartnerVoucherScan = () => {
  const [branches, setBranches] = useState([]);
  const [code, setCode] = useState("");
  const [branchId, setBranchId] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const issuedStatusLabel = (status) => {
    const map = {
      UNUSED: "Chưa dùng",
      USED: "Đã dùng",
      EXPIRED: "Hết hạn",
      CANCELLED: "Đã hủy",
    };
    return map[status] || status;
  };

  useEffect(() => {
    getPartnerBranchesRequest()
      .then((data) => setBranches(data))
      .catch(() => setBranches([]));
  }, []);

  const handleScan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await scanVoucherRequest({ code, branch_id: branchId || null });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Không thể xác thực voucher");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container partner-scan-page">
      <h1>Xác thực voucher</h1>
      <form className="card scan-card" onSubmit={handleScan}>
        <div className="form-group">
          <label>Mã voucher</label>
          <input className="input" value={code} onChange={(e) => setCode(e.target.value)} />
        </div>
        <div className="form-group scan-field">
          <label>Chi nhánh</label>
          <select className="input" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
            <option value="">-- Chọn chi nhánh --</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary scan-submit" disabled={loading}>
          {loading ? "Đang kiểm tra..." : "Xác thực"}
        </button>
      </form>

      {error && <p className="text-danger scan-error">{error}</p>}

      {result && (
        <div className="card scan-result">
          <h3>Voucher hợp lệ</h3>
          <p className="text-muted">Mã: {result.issued.code}</p>
          <p className="text-muted">Trạng thái: {issuedStatusLabel(result.issued.status)}</p>
          <p className="text-muted">Tên voucher: {result.voucher.name}</p>
        </div>
      )}
    </div>
  );
};

export default PartnerVoucherScan;
