import { Observable } from 'rxjs';
import { scan, takeLast, map } from 'rxjs/operators';
import { connect } from 'net';
import { encode, encodingLength } from 'varint';

const DEFAULT_PROTOCOL = 757;
const DEFAULT_PORT = 25565;
const DEFAULT_TIMEOUT = 3600;

export enum ChatColor {
  Black = 'black', // 0
  DarkBlue = 'dark_blue', // 1
  DarkGreen = 'dark_green', // 2
  DarkCyan = 'dark_aqua', // 3
  DarkRed = 'dark_red', // 4
  DarkGray = 'dark_gray', // 8
  Purple = 'dark_purple', // 5
  Gold = 'gold', // 6
  Gray = 'gray', // 7
  Blue = 'blue', // 9
  Green = 'green', // a
  Cyan = 'aqua', // b
  Red = 'red', // c
  Pink = 'light_purple', // d
  Yellow = 'yellow', // e
  White = 'white', // f
}

export interface IChat {
  text: string;
  bold?: boolean; // l
  italic?: boolean; // o
  underlined?: boolean; // n
  strikethrough?: boolean; // m
  obfuscated?: boolean; // k
  color?: ChatColor;
  extra?: IChat[];
}

export interface IHandshakeResponse {
  version: {
    name: string;
    protocol: number;
  };
  players: {
    online: number;
    max: number;
    sample?: {
      id: string;
      name: string;
    }[];
  };
  favicon?: string;
  description: string | IChat;
}

function createPacket(packetId: number, payload: Buffer): Buffer {
  return Buffer.concat([
    Buffer.from(encode(encodingLength(packetId) + payload.length)),
    Buffer.from(encode(packetId)),
    payload,
  ]);
}

export function ping(
  host: string,
  port: number = DEFAULT_PORT,
  timeout: number = DEFAULT_TIMEOUT,
  protocol: number = DEFAULT_PROTOCOL,
): Observable<IHandshakeResponse> {
  return new Observable<Buffer>((sub) => {
    const connection = connect({
      host,
      port,
      timeout,
    })
      .once('connect', () => {
        const encodedPort = Buffer.alloc(2);
        encodedPort.writeUInt16BE(port);

        const payload = Buffer.concat([
          Buffer.from(encode(protocol)),
          Buffer.from(encode(host.length)),
          Buffer.from(host),
          encodedPort,
          Buffer.from(encode(1)), // next state
        ]);
        const handshake = createPacket(0, payload);
        const request = createPacket(0, Buffer.alloc(0));

        connection.write(Buffer.concat([handshake, request]));
      })
      .once('timeout', () => {
        connection.destroy();
        sub.error(new Error('Socket timeout'));
      })
      .once('close', () => {
        sub.complete();
      })
      .once('error', (err) => {
        sub.error(err);
      })
      .on('data', (data) => {
        sub.next(data);
        connection.end();
      });

    return function unsubscribe() {
      connection.destroy();
    }
  })
    .pipe(
      scan((response, data) => Buffer.concat([response, data])),
      takeLast(1),
      map((response) => response.slice(encodingLength(response.length) * 2 + 1)),
      map((payload) => {
        return JSON.parse(payload.toString());
      }),
    );
}
