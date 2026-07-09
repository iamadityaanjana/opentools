import { motion } from 'framer-motion';
import {
  Warning,
  CheckCircle,
  XCircle,
  Clock,
  type Icon,
} from '@phosphor-icons/react';
import { AsciiSpinner } from './Thinking';

export type JobStatus = 'pending' | 'working' | 'success' | 'failed' | 'unsupported';

const META: Record<JobStatus, { label: string; className: string; icon: Icon | null }> = {
  pending: { label: 'Pending', className: 'badge--pending', icon: Warning },
  working: { label: 'In progress', className: 'badge--progress', icon: null },
  success: { label: 'Success', className: 'badge--success', icon: CheckCircle },
  failed: { label: 'Failed', className: 'badge--failed', icon: XCircle },
  unsupported: { label: 'Unsupported', className: 'badge--expired', icon: Clock },
};

export function StatusBadge({ status }: { status: JobStatus }) {
  const m = META[status];
  const Ico = m.icon;
  return (
    <motion.span
      className={`badge ${m.className}`}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {status === 'working' ? <AsciiSpinner /> : Ico && <Ico size={15} weight="fill" />}
      {m.label}
    </motion.span>
  );
}
