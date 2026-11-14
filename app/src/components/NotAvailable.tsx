import { missingReasonText, type MissingReason } from './labelText';

// A missing value is never blank or zero: it is a dash plus the reason.
export function NotAvailable({ reason }: { reason: MissingReason }) {
  return (
    <span className="not-available">
      <span aria-hidden="true">—</span> {missingReasonText(reason)}
    </span>
  );
}
