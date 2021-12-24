import { PingStrategy } from './ping-strategy';
import { IRawPingResponse } from './ping-response';

export class LegacyPingStrategy extends PingStrategy {
  createHandshakePacket(): Buffer {
    return Buffer.from([0xFE, 0x01, 0xFA]);
  }

  parse(response: Buffer): IRawPingResponse {
    const payload = response.slice(4).toString('utf16le');

    if (/^§1/.test(payload)) {
      const [protocol, versionId, motd, online, max] = payload.split('\0').slice(1);

      return {
        version: {
          name: versionId,
          protocol: parseInt(protocol, 10),
        },
        players: {
          max: parseInt(max, 10),
          online: parseInt(online, 10),
        },
        description: motd,
      };
    }

    const [motd, online, max] = payload.split('§');

    return {
      description: motd,
      players: {
        max: parseInt(max, 10),
        online: parseInt(online, 10),
      },
    };
  }
}
