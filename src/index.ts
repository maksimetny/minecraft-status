import { Observable } from 'rxjs';
import { scan, takeLast, map } from 'rxjs/operators';
import { createConnection } from 'net';
import { encode, encodingLength } from 'varint';

const DEFAULT_PORT = 25565;
const DEFAULT_TIMEOUT = 3600;

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
) {
  return new Observable<Buffer>((sub) => {
    const connection = createConnection(
      {
        host,
        port,
        timeout,
      },
      () => {
        connection
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
          })
          .write(
            Buffer.concat([
              createPacket(
                0,
                Buffer.concat([
                  Buffer.from(encode(-1)), // protocol version
                  Buffer.from(encode(host.length)),
                  Buffer.from(host),
                  Buffer.alloc(2, port),
                  Buffer.from(encode(1)), // next state
                ]),
              ), // handshake
              createPacket(0, Buffer.alloc(0)), // request
            ]),
          );
      },
    );
    return function unsubscribe() {
      connection.destroy();
    }
  })
    .pipe(
      scan((response, data) => Buffer.concat([response, data])),
      takeLast(1),
      map((response) => response.slice(5).toString()),
      map((response) => JSON.parse(response)),
    );
}
