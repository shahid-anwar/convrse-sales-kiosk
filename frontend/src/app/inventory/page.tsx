"use client";

import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchInventory } from "@/store/slices/inventorySlice";
import { useMirrorAction } from "@/components/SocketProvider";
import { LoadingState, ErrorState } from "@/components/Status";
import { useDwellSignal } from "@/lib/useDwellSignal";
import type { Unit } from "@/types";

export default function InventoryPage() {
  const dispatch = useAppDispatch();
  const { towers, status, error } = useAppSelector((s) => s.inventory);
  const selectedTower = useAppSelector((s) => s.session.selectedTower);
  const selectedUnit = useAppSelector((s) => s.session.selectedUnit);
  const mirror = useMirrorAction();

  useEffect(() => {
    if (status === "idle") dispatch(fetchInventory());
  }, [status, dispatch]);

  // Default to the first tower once data arrives, if nothing is
  // selected yet on any device.
  useEffect(() => {
    if (!selectedTower && towers.length > 0) {
      mirror({ selectedTower: towers[0].tower });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [towers, selectedTower]);

  const activeGroup = useMemo(
    () => towers.find((t) => t.tower === selectedTower) || towers[0],
    [towers, selectedTower]
  );

  useDwellSignal(
    selectedUnit
      ? { type: "unit", refId: selectedUnit.unitId, label: `${selectedUnit.tower} ${selectedUnit.unitNumber}` }
      : null
  );

  if (status === "loading" || status === "idle") {
    return <LoadingState label="Loading inventory…" />;
  }
  if (status === "failed") {
    return (
      <ErrorState message={error || "Failed to load inventory"} onRetry={() => dispatch(fetchInventory())} />
    );
  }

  function selectUnit(unit: Unit) {
    if (unit.status !== "available") return;
    mirror({
      selectedUnit: { unitId: unit._id, tower: unit.tower, unitNumber: unit.unitNumber },
      bookingDialog: { unitId: unit._id, tower: unit.tower, unitNumber: unit.unitNumber },
    });
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-kiosk-text">Live Inventory</h1>
        <div className="flex gap-1 rounded-lg bg-kiosk-panel p-1">
          {towers.map((t) => (
            <button
              key={t.tower}
              onClick={() => mirror({ selectedTower: t.tower })}
              className={`rounded-md px-3 py-1 text-xs font-medium ${
                activeGroup?.tower === t.tower
                  ? "bg-kiosk-accent text-kiosk-bg"
                  : "text-kiosk-subtext hover:text-kiosk-text"
              }`}
            >
              {t.tower}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 flex items-center gap-4 text-xs text-kiosk-subtext">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-kiosk-accent" /> Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-kiosk-danger" /> Booked
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {activeGroup?.units.map((unit) => {
          const isBooked = unit.status === "booked";
          const isSelected = selectedUnit?.unitId === unit._id;
          return (
            <button
              key={unit._id}
              onClick={() => selectUnit(unit)}
              disabled={isBooked}
              className={`rounded-lg border p-3 text-left transition-colors ${
                isBooked
                  ? "cursor-not-allowed border-kiosk-danger/40 bg-kiosk-danger/10"
                  : isSelected
                  ? "border-kiosk-accent bg-kiosk-accent/10"
                  : "border-kiosk-border bg-kiosk-panel hover:border-kiosk-accent"
              }`}
            >
              <p className="text-sm font-semibold text-kiosk-text">{unit.unitNumber}</p>
              <p className={`text-xs ${isBooked ? "text-kiosk-danger" : "text-kiosk-accent"}`}>
                {isBooked ? "Booked" : "Available"}
              </p>
              {unit.type && <p className="mt-1 text-[10px] text-kiosk-subtext">{unit.type}</p>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
