
# minecraft-status

[![npm](https://shields.io/npm/v/node-minecraft-status)](https://www.npmjs.com/package/node-minecraft-status)
[![license](https://shields.io/npm/l/node-minecraft-status)](LICENSE)

A observable-based Minecraft server status for Node.js

## Installing

`npm i node-minecraft-status`

## Usage

```typescript
import { PingContext } from 'node-minecraft-status';

const client = new PingContext();
client.ping('play.hypixel.net').subscribe((response) => console.log(response));
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
