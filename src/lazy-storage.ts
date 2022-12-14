// Copyright (c) 2018-2022, Brandon Lehmann <brandonlehmann@gmail.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import NodeCache, { Options } from 'node-cache';
import { EventEmitter } from 'events';

export default class LazyStorage extends EventEmitter {
    private readonly _cache: NodeCache;
    private readonly _stdTTL: number;

    constructor (options?: Options) {
        super();

        options ||= {};
        this._stdTTL = options.stdTTL ||= 300;
        options.checkperiod ||= 30;

        this._cache = new NodeCache(options);

        this._cache.on('set', (key, value) =>
            this.emit('set', this.unstringify(key), this.unstringify(value)));
        this._cache.on('expired', (key, value) =>
            this.emit('expired', this.unstringify(key), this.unstringify(value)));
        this._cache.on('del', (key, value) =>
            this.emit('del', this.unstringify(key), this.unstringify(value)));
        this._cache.on('flush', () => this.emit('flush'));
        this._cache.on('flush_stats', () => this.emit('flush_stats'));
        this._cache.on('error', error => this.emit('error', error));
    }

    public on(event: 'set', listener: (key: any, value: any) => void): this;

    public on(event: 'expired', listener: (key: any, value: any) => void): this;

    public on(event: 'del', listener: (key: any, value: any) => void): this;

    public on(event: 'flush', listener: () => void): this;

    public on(event: 'flush_stats', listener: () => void): this;

    public on(event: 'error', listener: (error: Error) => void): this;

    public on (event: any, listener: (...args: any[]) => void): this {
        return super.on(event, listener);
    }

    /**
     * Closes the storage and halts the check interval
     */
    public close (): void {
        return this._cache.close();
    }

    /**
     * Deletes the value(s) with the specified key
     * @param key
     */
    public del<KeyType = any> (key: KeyType): number {
        return this._cache.del(this.stringify(key));
    }

    /**
     * Alias for `del()`
     *
     * @param key
     */
    public remove<KeyType = any> (key: KeyType): number {
        return this.del<KeyType>(key);
    }

    /**
     * Alias for `flushAll()`
     */
    public clear (): void {
        return this.flushAll();
    }

    /**
     * Flushes all records from storage
     */
    public flushAll (): void {
        this._cache.flushAll();
    }

    /**
     * Flushes the storage statistics
     */
    public flushStats (): void {
        return this._cache.flushStats();
    }

    /**
     * Retrieves the value with the given key
     *
     * @param key
     */
    public get<ValueType = any, KeyType = any> (key: KeyType): ValueType | undefined {
        const set_key = this.stringify(key);

        const value = this._cache.get<string>(set_key);

        if (value) {
            return this.unstringify(value);
        }
    }

    /**
     * Retrieves the current ttl of the specified key
     *
     * @param key
     */
    public getTtl<KeyType = any> (key: KeyType): number | undefined {
        return this._cache.getTtl(this.stringify(key));
    }

    /**
     * Checks if the given key exists
     *
     * @param key
     */
    public has<KeyType = any> (key: KeyType): boolean {
        return this._cache.has(this.stringify(key));
    }

    /**
     * Retrieves a list of all keys
     */
    public keys<KeyType = any> (): KeyType[] {
        return this._cache.keys()
            .map(key => this.unstringify(key));
    }

    /**
     * Retrieves a map of all keys and values
     */
    public list<ValueType = any, KeyType = any> (): Map<KeyType, ValueType> {
        const keys = this.keys();

        return this.mget(keys);
    }

    /**
     * Mass deletes values with the specified keys
     *
     * @param keys
     */
    public mdel<KeyType = any> (keys: KeyType[]): number {
        const fetch_keys = keys.map(key => this.stringify(key));

        return this._cache.del(fetch_keys);
    }

    /**
     * Mass retrieves values with the specified keys
     *
     * @param keys
     */
    public mget<ValueType = any, KeyType = any> (
        keys: KeyType[]
    ): Map<KeyType, ValueType> {
        const fetch_keys = keys.map(key => this.stringify(key));

        const data = this._cache.mget(fetch_keys);

        const values = new Map<KeyType, ValueType>();

        for (const key of Object.keys(data)) {
            if (data[key]) {
                values.set(this.unstringify(key), this.unstringify(data[key]));
            }
        }

        return values;
    }

    /**
     * Mass sets values with the specified keys
     *
     * @param keys
     * @param values
     * @param ttl
     */
    public mset<ValueType = any, KeyType = any> (
        keys: KeyType[],
        values: ValueType[],
        ttl = this._stdTTL
    ): boolean {
        if (keys.length !== values.length) {
            throw new Error('Keys and values array lengths must match');
        }

        const set_keys = keys.map(key => this.stringify(key));

        const set_values = values.map(values => this.stringify(values));

        const set: {key: string, val: string, ttl: number}[] = [];

        for (let i = 0; i < set_keys.length; i++) {
            set.push({
                key: set_keys[i],
                val: set_values[i],
                ttl
            });
        }

        return this._cache.mset(set);
    }

    /**
     * Sets the value for the specified key
     *
     * @param key
     * @param value
     * @param ttl
     */
    public set<ValueType = any, KeyType = any> (
        key: KeyType,
        value: ValueType,
        ttl = this._stdTTL
    ): boolean {
        const set_key = this.stringify(key);

        return this._cache.set(set_key, this.stringify(value)) && this._cache.ttl(set_key, ttl);
    }

    /**
     * Returns storage statistics
     */
    public stats (): {
        keys: number;
        hits: number;
        misses: number;
        ksize: number;
        vsize: number;
        } {
        return this._cache.getStats();
    }

    /**
     * Retrieves the value with the specified key and immediately deletes it from storage
     *
     * @param key
     */
    public take<ValueType = any, KeyType = any> (
        key: KeyType
    ): ValueType | undefined {
        const value = this._cache.take<string>(this.stringify(key));

        if (value) {
            return this.unstringify(value);
        }
    }

    /**
     * Updates the ttl for the specified key
     *
     * @param key
     * @param ttl
     */
    public ttl<KeyType = any> (key: KeyType, ttl = this._stdTTL): boolean {
        return this._cache.ttl(this.stringify(key), ttl);
    }

    /**
     * JSON encodes the value
     *
     * @param value
     * @private
     */
    private stringify<InputType = any> (value: InputType): string {
        return JSON.stringify(value);
    }

    /**
     * Parses JSON into a value
     *
     * @param value
     * @private
     */
    private unstringify<ValueType, InputType = any> (value: InputType): ValueType {
        return JSON.parse(value as string);
    }
}

export { LazyStorage };
