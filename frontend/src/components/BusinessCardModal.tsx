import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Legacy stub: redirect user to the editor page when opened
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
