export const shortAddress = (addr: string): string =>
  addr.length > 10 && addr.startsWith("0x")
    ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
    : addr;

export const shortenChatContent = (addr: string): string =>
  addr.length > 40 ? `${addr.substring(0, 40)}...` : addr;
