import crypto from 'crypto';
import { DataPacket, AckMessage } from './types.js';

export class SlidingWindowTransport {
  private windowSize: number;
  private buffer: Map<number, Buffer> = new Map();
  private receivedSeqs = new Set<number>();

  constructor(windowSize = 8) {
    this.windowSize = windowSize;
  }

  createPacket(seq: number, total: number, data: Buffer): DataPacket {
    const checksum = crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
    return { seq, total, payload: data.toString('base64'), checksum };
  }

  receivePacket(packet: DataPacket): AckMessage | null {
    const data = Buffer.from(packet.payload, 'base64');
    const checksum = crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
    if (checksum !== packet.checksum) return null;

    this.buffer.set(packet.seq, data);
    this.receivedSeqs.add(packet.seq);

    return {
      ackSeq: packet.seq,
      received: Array.from(this.receivedSeqs).sort((a, b) => a - b)
    };
  }

  isComplete(totalExpected: number): boolean {
    return this.receivedSeqs.size === totalExpected;
  }

  reassemble(totalExpected: number): Buffer {
    if (!this.isComplete(totalExpected)) throw new Error('Cannot reassemble incomplete transfer');
    const parts: Buffer[] = [];
    for (let i = 0; i < totalExpected; i++) {
      parts.push(this.buffer.get(i)!);
    }
    return Buffer.concat(parts);
  }
}
