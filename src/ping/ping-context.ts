import { iif, timer, throwError, of, Observable } from 'rxjs';
import {
  scan,
  take,
  takeLast,
  map,
  switchMap,
  mergeMap,
  defaultIfEmpty,
  retryWhen,
  catchError,
  tap,
} from 'rxjs/operators';
import { connect, isIP } from 'net';

import { resolveSrv, parseAddress } from '../util';

import { DEFAULT_PING_SOCKET_TIMEOUT, DEFAULT_PING_RETRY_TIMEOUT, DEFAULT_PING_PORT } from './constants';
import { PingStrategy } from './ping-strategy';
import { CurrentPingStrategy } from './current-ping-strategy';
import { LegacyPingStrategy } from './legacy-ping-strategy';
import { IPingResponse } from './ping-response';

export class PingContext {
  constructor(
    private _strategy?: PingStrategy,
    private _socketTimeout = DEFAULT_PING_SOCKET_TIMEOUT,
    private _retryTimeout = DEFAULT_PING_RETRY_TIMEOUT,
  ) { }

  ping(address: string): Observable<IPingResponse>;
  ping(host: string, port?: number): Observable<IPingResponse>;
  ping(
    address: string,
    port = DEFAULT_PING_PORT,
  ): Observable<IPingResponse> {
    return of(parseAddress(address, port)).pipe(
      tap((address) => {
        if (!this._strategy) this._strategy = new CurrentPingStrategy(address.host, address.port);
      }),
      mergeMap(({ host, port }) => {
        return iif(
          () => Boolean(isIP(host)),
          this._ping(host, port),
          resolveSrv(host).pipe(
            take(1),
            map((record) => ({ host: record.name, port: record.port })),
            defaultIfEmpty({ host, port }),
            catchError(() => of({ host, port })),
            switchMap((record) => this._ping(record.host, record.port)),
          ),
        );
      }),
    );
  }

  private _ping(host: string, port: number): Observable<IPingResponse> {
    let ip: string;

    return new Observable<Buffer>((subscriber) => {
      let error: Error;

      const connection = connect({
        host,
        port,
        timeout: this._socketTimeout,
      })
        .once('connect', () => {
          const handshakePacket = this._strategy!.createHandshakePacket();
          connection.write(handshakePacket);
        })
        .once('timeout', () => {
          connection.destroy(new Error('Socket timeout'));
        })
        .once('lookup', (err, address) => {
          if (!err) ip = address;
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
        retryWhen((errors) => {
          let retry = false;

          return errors.pipe(
            mergeMap((err) => {
              if (retry) return throwError(() => err);

              retry = true;

              this.setStrategy(
                this._strategy instanceof CurrentPingStrategy ?
                  new LegacyPingStrategy() :
                  new CurrentPingStrategy(host, port),
              );

              return timer(this._retryTimeout);
            }),
          );
        }),
        map((response) => this._strategy!.parse(response)),
        map((response) => {
          const final: IPingResponse = { host, port, ...response };

          if (ip) final.ip = ip;

          return final;
        }),
      );
  }

  setStrategy(strategy: PingStrategy): this {
    this._strategy = strategy;
    return this;
  }

  setTimeout(socketTimeout: number): this {
    this._socketTimeout = socketTimeout;
    return this;
  }
}
