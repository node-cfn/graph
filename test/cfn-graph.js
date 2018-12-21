'use strict';

const test = require('ava');

const graph = require('../cfn-graph');

test('includes resources with no references', t => {
    const template = {
        Resources: {
            First: {
                Type: 'Foo'
            },
            Second: {
                Type: 'Bar'
            }
        }
    };

    const list = graph({ template });

    t.is(Array.isArray(list), true);
    t.is(list.length, 2);
});

test('includes resources in the order they depend on each other', t => {
    const template = {
        Resources: {
            First: {
                Type: 'Foo'
            },
            Second: {
                Type: 'Bar',
                Properties: {
                    Foo: {
                        Ref: 'First'
                    }
                }
            },
            Third: {
                Type: 'Baz',
                Properties: {
                },
                DependsOn: 'Second'
            }
        }
    };

    const list = graph({ template });

    t.is(Array.isArray(list), true);
    t.is(list.length, 3);
    t.deepEqual(list.map(ref => ref.logicalId), ['Third', 'Second', 'First']);
});

test('ignores template with no resources', t => {
    const template = {};

    const list = graph({ template });

    t.is(Array.isArray(list), true);
    t.is(list.length, 0);
});
