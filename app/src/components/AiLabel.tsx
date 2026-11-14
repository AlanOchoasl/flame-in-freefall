import { aiLabelText } from './labelText';

// Marks text written by AI. Required by app-shell: every AI text shows model and review status.
export function AiLabel({ model, reviewed }: { model: string; reviewed: boolean }) {
  return <span className="label label-ai">{aiLabelText(model, reviewed)}</span>;
}

// Marks text copied from NASA PSI, e.g. the fallback shown when no summary exists.
export function PsiTextLabel() {
  return <span className="label label-psi">NASA PSI text</span>;
}
