
# node-minecraft-status

A observable-based Minecraft server status for Node.js

## Usage

```typescript
import { ping } from 'node-minecraft-status';
ping('play.hypixel.net').subscribe((response) => console.log(response));
```

## TODO

- [x] ping
- [ ] formatting response
- [ ] resolving srv records
- [ ] query

## License

The MIT License. See [LICENSE](LICENSE) file.
