import { useEffect, useState } from "react";
import { getPartnerDashboardRequest } from "../services/partner.service";

/**
 * Hook lấy trạng thái partner của user hiện tại.
 * Trả về:
 *   - partnerStatus: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED" | null
 *   - isApproved: boolean — true khi status === "APPROVED"
 *   - isRestricted: boolean — true khi PENDING, REJECTED hoặc SUSPENDED (cần chặn tương tác)
 *   - canAppeal: boolean — true khi SUSPENDED
 *   - statusLoading: boolean
 */
const usePartnerStatus = () => {
  const [partnerStatus, setPartnerStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getPartnerDashboardRequest()
      .then((dash) => {
        if (mounted) setPartnerStatus(dash?.partner?.status ?? null);
      })
      .catch(() => {
        if (mounted) setPartnerStatus(null);
      })
      .finally(() => {
        if (mounted) setStatusLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const isApproved = partnerStatus === "APPROVED";
  const isRestricted = ["PENDING", "REJECTED", "SUSPENDED"].includes(partnerStatus);
  const canAppeal = partnerStatus === "SUSPENDED";

  return { partnerStatus, isApproved, isRestricted, canAppeal, statusLoading };
};

export default usePartnerStatus;
