import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// legacy modal component kept for compatibility; if ever opened it will
// immediately redirect to the unified business card editor page.  The old
// payment/login options have been removed since the service is now free.
const BusinessCardModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      navigate("/services/business-card-editor?tab=models");
      onClose();
    }
  }, [open, navigate, onClose]);

  return null;
};

export default BusinessCardModal;
