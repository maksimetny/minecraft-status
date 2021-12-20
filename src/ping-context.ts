import { Observable } from 'rxjs';
import { scan, takeLast, map } from 'rxjs/operators';
import { connect } from 'net';

import { DEFAULT_TIMEOUT, DEFAULT_PORT } from './constants';
import { PingStrategy } from './ping-strategy';
import { CurrentPingStrategy } from './current-ping-strategy';
import { IPingResponse } from './ping-response';

export class PingContext {
  constructor(
    private _strategy?: PingStrategy,
    private _timeout: number = DEFAULT_TIMEOUT,
  ) { }

  ping(
    host: string,
    port: number = DEFAULT_PORT,
  ): Observable<IPingResponse> {
    if (!this._strategy) this._strategy = new CurrentPingStrategy(host, port);

    return new Observable<Buffer>((subscriber) => {
      let error: Error;

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
          connection.destroy(new Error('Socket timeout'));
        })
        .once('close', (hasError) => {
          if (hasError) return subscriber.error(error);
          if (connection.bytesRead) return subscriber.complete();

          subscriber.error(new Error('Socket has not received data'));
        })
        .once('error', (err) => error = err)
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
