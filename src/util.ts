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
