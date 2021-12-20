
# minecraft-status

[![npm](https://shields.io/npm/v/node-minecraft-status)](https://www.npmjs.com/package/node-minecraft-status)
[![license](https://shields.io/npm/l/node-minecraft-status)](LICENSE)

A observable-based Minecraft server status for Node.js

## Installing

`npm i node-minecraft-status`

## Usage

Basic example:

```typescript
import { PingContext } from 'node-minecraft-status';

const client = new PingContext();
client.ping('play.hypixel.net').subscribe((response) => console.log(response));
```

With support legacy protocol:

```typescript
const client = new PingContext();
client
  .ping('localhost')
  .pipe(
    retryWhen((errors) => errors.pipe(
      delay(5000),
      tap((err) => {
        console.log(err);
        console.log('retrying with legacy protocol..');
        client.setStrategy(new LegacyPingStrategy());
      }),
    )),
  )
  .subscribe({
    next(response) {
      console.log(response);
    },
    error(err) {
      console.error(err);
    },
    complete() {
      console.log('pong!');
    },
  });
```

## TODO

- [x] ping
- [ ] server latency
- [x] support legacy versions (< 1.6)
- [ ] formatting response
- [ ] resolving srv records
- [ ] query

## License

The MIT License. See [LICENSE](LICENSE) file.
