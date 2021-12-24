
# minecraft-status

[![npm](https://shields.io/npm/v/node-minecraft-status)](https://www.npmjs.com/package/node-minecraft-status)
[![license](https://shields.io/npm/l/node-minecraft-status)](LICENSE)

A observable-based Minecraft server status for Node.js

## Installing :package:

`npm i node-minecraft-status`

## Usage :rocket:

Basic example:

```typescript
import { PingContext } from 'node-minecraft-status';

const client = new PingContext();
client.ping('play.hypixel.net').subscribe((response) => console.log(response));
```

With support legacy protocol:

```typescript
import { PingContext } from 'node-minecraft-status';

const client = new PingContext();

client.ping('hypixel.net')
  .subscribe({
    next(response) {
      // {
      //   host            // resolved hostname
      //   port            // resolved port
      //   version: {
      //     name
      //     protocol
      //   }               // only 1.6+
      //   players: {
      //     max
      //     online
      //     sample        // only 1.6+
      //   }
      //   description
      //   favicon         // only 1.6+
      //   ip              // when received domain name
      // }
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

## TODO :memo:

- [x] ping
- [ ] server latency
- [x] support legacy versions (< 1.6)
- [ ] formatting response
- [x] resolving srv records
- [ ] query

## License :page_with_curl:

The MIT License. See [LICENSE](LICENSE) file.
