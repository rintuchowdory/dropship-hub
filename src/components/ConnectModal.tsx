import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Modal } from "./Modal";
import { CATEGORIES, type Integration } from "../lib/integrations";
import { getConnections, setConnections } from "../lib/store";

export function ConnectModal({
  integration,
  onClose,
}: {
  integration: Integration;
  onClose: () => void;
}) {
  const meta = CATEGORIES[integration.category];
  const [field1, field2] = integration.fields ?? meta.fields;
  const [ph1, ph2] = integration.placeholders ?? [field1, field2];
  const [busy, setBusy] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    // Simulated handshake — in the real product this would call the
    // provider's OAuth/API flow. We simply mark it connected.
    setTimeout(() => {
      const ids = getConnections();
      if (!ids.includes(integration.id)) {
        setConnections([...ids, integration.id]);
      }
      setBusy(false);
      onClose();
    }, 600);
  };

  return (
    <Modal
      title={`Connect ${integration.name}`}
      subtitle={integration.description}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="p-5 pt-4">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs text-muted">{field1}</label>
            <input
              required
              autoFocus
              type="text"
              placeholder={ph1}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm outline-none placeholder:text-muted/60 focus:border-accent/60"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted">{field2}</label>
            <input
              required
              type="password"
              placeholder={ph2}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm outline-none placeholder:text-muted/60 focus:border-accent/60"
            />
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-md border border-accent/20 bg-accent/5 px-3 py-2.5">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <p className="text-xs leading-relaxed text-muted">
            Credentials are stored securely and used only to sync data for
            this integration.
          </p>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full rounded-md bg-accent py-2.5 text-sm font-semibold text-[#052e16] transition-colors hover:bg-accent/90 disabled:opacity-60"
        >
          {busy ? "Connecting…" : `Connect ${integration.name}`}
        </button>
      </form>
    </Modal>
  );
}
