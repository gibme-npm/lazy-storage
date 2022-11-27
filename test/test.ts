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

import assert from 'assert';
import { describe, it } from 'mocha';
import LazyStorage from '../src/lazy-storage';

describe('Lazy Storage Tests', () => {
    const storage = new LazyStorage();

    before(() => {
        storage.clear();
    });

    const test = <Key = any, Value = any>(key: Key, value: Value) => {
        after(() => {
            storage.clear();
        });

        it('Set', () => {
            storage.set(key, value);

            assert(storage.has(key));
        });

        it('Has', () => {
            assert(storage.has(key));
        });

        it('Get', () => {
            const data = storage.get(key);

            assert.deepEqual(data, value);
        });

        it('Keys', () => {
            const keys = [key];

            const _keys = storage.keys<Key>();

            assert.deepEqual(keys, _keys);
        });

        it('List', () => {
            const records = new Map<Key, Value>();
            records.set(key, value);

            const _records = storage.list<Value, Key>();

            assert.deepEqual(records, _records);
        });

        it('Remove', () => {
            storage.remove('test');

            assert(!storage.has('test'));
        });

        it('Clear', () => {
            storage.clear();

            assert(!storage.has(key));
        });

        it('MSet', () => {
            storage.mset<Value, Key>([key], [value]);

            assert(storage.has(key));
        });

        it('MDel', () => {
            storage.mdel<Key>([key]);

            assert(!storage.has(key));
        });

        it('Take', () => {
            storage.set(key, value);

            const _value = storage.take<Value>(key);

            assert.deepEqual(value, _value);
            assert(!storage.has(key));
        });
    };

    describe('Simple Keys', () => {
        const key = 'test_key';

        describe('Simple Values', () => {
            test(key, true);
        });

        describe('Complex Values', () => {
            test(key, { value: true, value1: 9, value3: 9.4, value4: 'test' });
        });
    });

    describe('Complex Keys', () => {
        const key = { key: 'test' };

        describe('Simple Values', () => {
            test(key, true);
        });

        describe('Complex Values', () => {
            test(key, { value: true, value1: 9, value3: 9.4, value4: 'test' });
        });
    });
});
