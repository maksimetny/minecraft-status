import { encode, encodingLength } from 'varint';

import { DEFAULT_PROTOCOL } from './constants';
import { PingStrategy } from './ping-strategy';
import { IRawPingResponse } from './ping-response';

export class CurrentPingStrategy extends PingStrategy {
  constructor(
    private _host: string,
    private _port: number,
    private _protocol: number = DEFAULT_PROTOCOL,
  ) {
    super();
  }

  createHandshakePacket(): Buffer {
    const encodedPort = Buffer.alloc(2);
    encodedPort.writeUInt16BE(this._port);

    const payload = Buffer.concat([
      Buffer.from(encode(this._protocol)),
      Buffer.from(encode(this._host.length)),
      Buffer.from(this._host),
      encodedPort,
      Buffer.from(encode(1)), // next state
    ]);
    const handshake = this.createPacket(0, payload);
    const request = this.createPacket(0, Buffer.alloc(0));

    return Buffer.concat([handshake, request]);
  }

  parse(response: Buffer): IRawPingResponse {
    const payload = response.slice(encodingLength(response.length) * 2 + 1);

    return JSON.parse(payload.toString());
  }

  createPacket(packetId: number, payload: Buffer): Buffer {
    return Buffer.concat([
      Buffer.from(encode(encodingLength(packetId) + payload.length)),
      Buffer.from(encode(packetId)),
      payload,
    ]);
  }
}
