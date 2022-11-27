# Simple In-Memory KVS Storage System Wrapped around [Node-Cache](https://www.npmjs.com/package/node-cache)

Accepts arbitrary keys and values as it will JSON encode all keys and values before storing and will parse the JSON when retrieving.

## Documentation

[https://gibme-npm.github.io/lazy-storage/](https://gibme-npm.github.io/lazy-storage/)

## Sample Code

```typescript
import LazyStorage from '@gibme/lazy-storage';

const storage = new LazyStorage();

{
    storage.set({ some: 'key' }, { some: 'value' });

    const data = storage.get({ some: 'key' });

    if (data) {
        console.log(data);
        
        storage.del({ some: 'key' });
    }
}
```
