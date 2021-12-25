
# minecraft-status

[![npm](https://shields.io/npm/v/node-minecraft-status)](https://www.npmjs.com/package/node-minecraft-status)
[![license](https://shields.io/npm/l/node-minecraft-status)](LICENSE)

A observable-based Minecraft server status for Node.js

## Installing :package:

`npm i node-minecraft-status`

## Usage :rocket:

### Sample

```typescript
import { PingContext } from 'node-minecraft-status';

const client = new PingContext();

client.ping('hypixel.net')
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

### Ping Client

| Method        | Description                                                                             |
|---------------|-----------------------------------------------------------------------------------------|
| `ping`        | Get server information via ping protocol.                                               |
| `setStrategy` | Set the way to create the handshake package and parse the server response.              |
| `setTimeout`  | Set socket timeout.                                                                     |

#### ping

| Parameter | Type     | Description                                                        | Required |
|-----------|----------|--------------------------------------------------------------------|----------|
| `address` | String   | The server hostname or server hostname with port (`[host]:[port]`) | Yes      |
| `port`    | Number   | The server port. (defaults: `25565`)                               |          |

#### setStrategy

| Parameter  | Type   | Description               | Required |
|------------|--------|---------------------------|----------|
| `strategy` | Object | The instance of strategy. | Yes      |

#### setTimeout

| Parameter  | Type     | Description         | Required |
|------------|----------|---------------------|----------|
| `timeout`  | Number   | The socket timeout. | Yes      |

### Ping Response

```typescript
{
  host: string,         // resolved hostname
  port: number,         // resolved port
  ip?: string,          // when received domain name
  version?: {
    name: string,
    protocol: string,
  },                    // only 1.6+
  players: {
    max: number,
    online: number,
    sample?: {
      id: string,
      name: string,
    },                  // only 1.6+
  },
  description: string,  // string if < 1.6, if 1.6 < an object like chat (see: https://wiki.vg/Chat)
  favicon?: string,     // only 1.6+
}
```

## TODO :memo:

- [x] ping
- [x] support legacy versions (< 1.6)
- [x] resolving srv records
- [ ] server latency
- [ ] formatting response
- [ ] query

## License :page_with_curl:

The MIT License. See [LICENSE](LICENSE) file.
