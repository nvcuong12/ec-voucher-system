import { useEffect, useState } from "react";
import { checkVoucherRequest, getPartnerBranchesRequest, scanVoucherRequest } from "../services/partner.service";
import "./PartnerVoucherScan.css";

const PartnerVoucherScan = () => {
  const [branches, setBranches] = useState([]);
  const [code, setCode] = useState("");
  const [branchId, setBranchId] = useState("");
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState("check");
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
      if (mode === "check") {
        const data = await checkVoucherRequest({ code, branch_id: branchId || null });
        setResult(data);
      } else {
        const data = await scanVoucherRequest({ code, branch_id: branchId || null });
        setResult({ ...data, valid: true, reason: null });
      }
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
          <input
            className="input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Nhap ma hoac quet QR mo phong"
          />
        </div>
        <div className="form-group scan-field">
          <label>Chế độ</label>
          <select className="input" value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="check">Kiểm tra</option>
            <option value="redeem">Xác nhận sử dụng</option>
          </select>
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
          {loading ? "Đang xử lý..." : mode === "check" ? "Kiểm tra" : "Xác nhận"}
        </button>
      </form>

      {error && <p className="text-danger scan-error">{error}</p>}

      {result && (
        <div className="card scan-result">
          <h3>{result.valid ? "Voucher hợp lệ" : "Voucher không hợp lệ"}</h3>
          <p className="text-muted">Mã: {result.issued.code}</p>
          <p className="text-muted">Trạng thái: {issuedStatusLabel(result.issued.status)}</p>
          <p className="text-muted">Tên voucher: {result.voucher.name}</p>
          {!result.valid && result.reason && <p className="text-danger">{result.reason}</p>}
        </div>
      )}
    </div>
  );
};

export default PartnerVoucherScan;
