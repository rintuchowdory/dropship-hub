import { useState } from "react";
import { Modal } from "./Modal";
import { SUPPLIER_NAMES } from "../lib/integrations";
import { addProduct, newId, type Product } from "../lib/store";

const input =
  "w-full rounded-md border border-border bg-bg px-3 py-2 text-sm outline-none placeholder:text-muted/60 focus:border-accent/60";
const label = "mb-1.5 block text-xs text-muted";

export function ImportProductModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [sku, setSku] = useState("");
  const [supplier, setSupplier] = useState("");
  const [cost, setCost] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product: Product = {
      id: newId(),
      title: title.trim(),
      sku: sku.trim(),
      supplier,
      cost: Number(cost) || 0,
      price: Number(price) || 0,
      stock: Number(stock) || 0,
      created: new Date().toISOString(),
      leadTime: 10,
    };
    addProduct(product);
    onClose();
  };

  return (
    <Modal
      title="Import product"
      subtitle="Add a product sourced from one of your suppliers."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="p-5 pt-4">
        <div className="space-y-4">
          <div>
            <label className={label}>Product title</label>
            <input
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Product title"
              className={input}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>SKU</label>
              <input
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="SKU"
                className={input}
              />
            </div>
            <div>
              <label className={label}>Supplier</label>
              <select
                required
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className={`${input} appearance-none ${supplier ? "" : "text-muted/60"}`}
              >
                <option value="" disabled>
                  Select
                </option>
                {SUPPLIER_NAMES.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={label}>Cost ($)</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
                className={input}
              />
            </div>
            <div>
              <label className={label}>Price ($)</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className={input}
              />
            </div>
            <div>
              <label className={label}>Stock</label>
              <input
                required
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                className={input}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="mt-5 w-full rounded-md bg-accent py-2.5 text-sm font-semibold text-[#052e16] transition-colors hover:bg-accent/90"
        >
          Import product
        </button>
      </form>
    </Modal>
  );
}
