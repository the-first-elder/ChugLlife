import { useContext } from "react";
import { ClientContext } from "../contexts/ClientContext";
import { Client as XmtpClient } from "@xmtp/browser-sdk";

export function useClient(): XmtpClient | null {
  return useContext(ClientContext).client;
}

export function useClientStatus() {
  return useContext(ClientContext);
}
