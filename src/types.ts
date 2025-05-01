export interface DataPacket {
  seq: number;
  total: number;
  payload: string; // Base64
  checksum: string;
}

export interface AckMessage {
  ackSeq: number;
  received: number[];
}
