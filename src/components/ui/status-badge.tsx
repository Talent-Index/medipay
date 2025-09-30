import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "pending" | "confirmed" | "failed" | "approved" | "partially_paid";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusStyles = (status: "pending" | "confirmed" | "failed" | "approved" | "partially_paid") => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'confirmed':
        return 'status-confirmed';
      case 'failed':
        return 'status-failed';
      case 'approved':
        return 'status-approved';
      case 'partially_paid':
        return 'status-partially-paid';
      default:
        return 'status-pending';
    }
  };

  const getStatusText = (status: "pending" | "confirmed" | "failed" | "approved" | "partially_paid") => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'failed':
        return 'Failed';
      case 'approved':
        return 'Approved';
      case 'partially_paid':
        return 'Partially Paid';
      default:
        return 'Unknown';
    }
  };

  return (
    <span className={cn("status-badge", getStatusStyles(status), className)}>
      {getStatusText(status)}
    </span>
  );
}
