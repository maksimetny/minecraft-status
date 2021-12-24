import { IRawPingResponse } from './ping-response';

export abstract class PingStrategy {
  abstract createHandshakePacket(): Buffer;
  abstract parse(response: Buffer): IRawPingResponse;
}
