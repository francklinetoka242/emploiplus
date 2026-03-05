import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Legacy component - immediately forwards users to the new editor page when
// opened.  Payment/login logic removed since the tool is fully free.
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
