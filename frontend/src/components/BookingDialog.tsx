"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { bookUnit, fetchInventory, resetBookingStatus } from "@/store/slices/inventorySlice";
import { useMirrorAction } from "./SocketProvider";

export default function BookingDialog() {
  const dispatch = useAppDispatch();
  const dialog = useAppSelector((s) => s.session.bookingDialog);
  const bookingStatus = useAppSelector((s) => s.inventory.bookingStatus);
  const bookingError = useAppSelector((s) => s.inventory.bookingError);
  const mirror = useMirrorAction();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Reset the local form + submission status whenever a different
  // dialog opens (or it closes), so stale errors don't leak into the
  // next booking attempt.
  useEffect(() => {
    setCustomerName("");
    setPhone("");
    setFormError(null);
    dispatch(resetBookingStatus());
  }, [dialog?.unitId, dispatch]);

  if (!dialog) return null;

  function closeDialog() {
    mirror({ bookingDialog: null });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!customerName.trim()) {
      setFormError("Customer name is required.");
      return;
    }
    if (!/^[0-9+\-\s]{7,15}$/.test(phone.trim())) {
      setFormError("Enter a valid phone number.");
      return;
    }

    const result = await dispatch(
      bookUnit({ unitId: dialog!.unitId, customerName: customerName.trim(), phone: phone.trim() })
    );

    if (bookUnit.fulfilled.match(result)) {
      // Closing is mirrored so every device's dialog dismisses
      // together; the inventory board updates via the
      // "inventory:updated" socket event, independent of this.
      mirror({ bookingDialog: null, selectedUnit: null });
    } else {
      // Most likely someone else booked this unit a moment ago (the
      // exact race the assignment describes). Resync from the server
      // so this device's board reflects reality instead of showing
      // the unit as still available.
      dispatch(fetchInventory());
    }
  }

  const submitting = bookingStatus === "submitting";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={closeDialog}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-lg border border-kiosk-border bg-kiosk-panel p-5"
      >
        <h2 className="mb-1 text-base font-semibold text-kiosk-text">
          Book {dialog.tower} · {dialog.unitNumber}
        </h2>
        <p className="mb-4 text-xs text-kiosk-subtext">Enter buyer details to confirm this unit.</p>

        <label className="mb-1 block text-xs text-kiosk-subtext">Customer Name</label>
        <input
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          disabled={submitting}
          className="mb-3 w-full rounded-md border border-kiosk-border bg-kiosk-bg px-3 py-2 text-sm text-kiosk-text outline-none focus:border-kiosk-accent disabled:opacity-50"
          placeholder="e.g. Priya Sharma"
        />

        <label className="mb-1 block text-xs text-kiosk-subtext">Phone Number</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={submitting}
          className="mb-3 w-full rounded-md border border-kiosk-border bg-kiosk-bg px-3 py-2 text-sm text-kiosk-text outline-none focus:border-kiosk-accent disabled:opacity-50"
          placeholder="e.g. 98765 43210"
        />

        {(formError || (bookingStatus === "failed" && bookingError)) && (
          <p className="mb-3 text-xs text-kiosk-danger">{formError || bookingError}</p>
        )}

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={closeDialog}
            disabled={submitting}
            className="rounded-md border border-kiosk-border px-3 py-1.5 text-xs text-kiosk-subtext hover:text-kiosk-text disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-kiosk-accent px-4 py-1.5 text-xs font-medium text-kiosk-bg disabled:opacity-50"
          >
            {submitting ? "Booking…" : "Confirm Booking"}
          </button>
        </div>
      </form>
    </div>
  );
}
