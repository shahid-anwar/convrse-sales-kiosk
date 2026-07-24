"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import { getSocket } from "@/lib/socket";
import { useAppDispatch } from "@/store/hooks";
import {
  sessionStateReceived,
  connectionChanged,
} from "@/store/slices/sessionSlice";
import { unitUpdated } from "@/store/slices/inventorySlice";
import { signalReceived } from "@/store/slices/interestSlice";
import type { Socket } from "socket.io-client";
import type { SessionState } from "@/types";

const SocketContext = createContext<Socket | null>(null);

export function useSocket() {
  const socket = useContext(SocketContext);
  if (!socket) throw new Error("useSocket must be used within SocketProvider");
  return socket;
}

// Emits a partial session-state patch to the server, which merges it
// and re-broadcasts to every connected device (this device included).
// This is the single mechanism behind ALL cross-device mirroring:
// active tab, image preview, video playback, tower/unit selection,
// and the booking dialog all flow through here.

export function useMirrorAction() {
  const socket = useSocket();
  return (patch: Partial<SessionState>) => {
    socket.emit("session:update", patch);
  };
}

export default function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const socket = useMemo(() => getSocket(), []);

  useEffect(() => {
    function onConnect() {
      dispatch(connectionChanged(true));
    }
    function onDisconnect() {
      dispatch(connectionChanged(false));
    }
    function onSessionState(state: SessionState) {
      dispatch(sessionStateReceived(state));
    }
    function onInventoryUpdated(unit: any) {
      dispatch(unitUpdated(unit));
    }
    function onInterestSignal(signal: any) {
      dispatch(signalReceived(signal));
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("session:state", onSessionState);
    socket.on("inventory:updated", onInventoryUpdated);
    socket.on("interest:signal", onInterestSignal);

    if (socket.connected) onConnect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("session:state", onSessionState);
      socket.off("inventory:updated", onInventoryUpdated);
      socket.off("interest:signal", onInterestSignal);
    };
  }, [socket, dispatch]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
