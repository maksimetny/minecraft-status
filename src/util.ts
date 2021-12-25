import { Observable } from 'rxjs';
import { resolveSrv as _resolveSrv, SrvRecord } from 'dns';

export function resolveSrv(host: string): Observable<SrvRecord> {
  return new Observable<SrvRecord>((subscriber) => {
    _resolveSrv('_minecraft._tcp.' + host, (err, records) => {
      if (err) return subscriber.error(err);

      records.forEach((record) => subscriber.next(record));

      subscriber.complete();
    });
  });
}

export function parseAddress(
  address: string,
  defaultPort: number,
): { host: string, port: number } {
  const [host, _port = defaultPort.toString()] = address.split(':');
  const port = parseInt(_port, 10);

  return { host, port };
}
