"use client";

import { Toaster } from "sonner";

export function CartDetailToaster() {
  return (
    <Toaster
      id="product-detail"
      position="top-right"
      offset={{ top: 110, right: 16 }}
    />
  );
}
