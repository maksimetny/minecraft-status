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

export interface IPingResponse {
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

abstract class PingStrategy {
  abstract createHandshakePacket(): Buffer;
  abstract parse(response: Buffer): IPingResponse;
}

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

  parse(response: Buffer): IPingResponse {
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

export class PingContext {
  private _strategy?: PingStrategy;

  constructor(
    private _timeout: number = DEFAULT_TIMEOUT,
  ) { }

  ping(
    host: string,
    port: number = DEFAULT_PORT,
  ) {
    if (!this._strategy) this._strategy = new CurrentPingStrategy(host, port);
    return new Observable<Buffer>((subscriber) => {
      const connection = connect({
        host,
        port,
        timeout: this._timeout,
      })
        .once('connect', () => {
          const handshakePacket = this._strategy!.createHandshakePacket();
          connection.write(handshakePacket);
        })
        .once('timeout', () => {
          connection.destroy();
          subscriber.error(new Error('Socket timeout'));
        })
        .once('close', () => {
          if (connection.bytesRead) return subscriber.complete();
          subscriber.error(new Error('Socket has not received data'));
        })
        .once('error', (err) => subscriber.error(err))
        .on('data', (data) => {
          subscriber.next(data);
          connection.end();
        });

      return () => connection.destroy();
    })
      .pipe(
        scan((response, chunk) => Buffer.concat([response, chunk])),
        takeLast(1),
        map((response) => this._strategy!.parse(response)),
      );
  }

  setStrategy(strategy: PingStrategy): this {
    this._strategy = strategy;
    return this;
  }

  setTimeout(timeout: number): this {
    this._timeout = timeout;
    return this;
  }
}
