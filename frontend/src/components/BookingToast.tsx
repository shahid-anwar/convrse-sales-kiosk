"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearBookingResult } from "@/store/slices/sessionSlice";

// lastBookingResult comes through session:state, so a booking made on
// Device A shows this toast on Device B too - the customer sees the
// same "Booked!" or "Already booked" confirmation as the executive.
export default function BookingToast() {
  const dispatch = useAppDispatch();
  const result = useAppSelector((s) => s.session.lastBookingResult);

  useEffect(() => {
    if (!result) return;
    const t = setTimeout(() => dispatch(clearBookingResult()), 4000);
    return () => clearTimeout(t);
  }, [result, dispatch]);

  if (!result) return null;

  const isSuccess = result.status === "success";

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg border px-4 py-3 text-sm shadow-lg ${
        isSuccess
          ? "border-kiosk-accentDim bg-kiosk-accent/10 text-kiosk-accent"
          : "border-kiosk-danger bg-kiosk-danger/10 text-kiosk-danger"
      }`}
      role="status"
    >
      {result.message}
    </div>
  );
}
