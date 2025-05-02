import assert from 'node:assert';
import test from 'node:test';
import { SlidingWindowTransport } from '../dist/sliding-window.js';

test('SlidingWindowTransport delivers out-of-order packets and reconstructs original payload', () => {
  const sender = new SlidingWindowTransport();
  const receiver = new SlidingWindowTransport();

  const p0 = sender.createPacket(0, 2, Buffer.from('chunk_zero_'));
  const p1 = sender.createPacket(1, 2, Buffer.from('chunk_one'));

  // Deliver out of order
  receiver.receivePacket(p1);
  receiver.receivePacket(p0);

  assert.strictEqual(receiver.isComplete(2), true);
  const out = receiver.reassemble(2);
  assert.strictEqual(out.toString(), 'chunk_zero_chunk_one');
});
