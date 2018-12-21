'use strict';

const test = require('ava');

const getReferences = require('../get-references');

test('finds nothing safely', t => {
    const refs = getReferences({});

    t.is(refs.length, 0);
});

test('Ref', t => {
    const refs = getReferences({
        Properties: {
            SomeProp: {
                Ref: 'Foo'
            },
            SomeOtherProp: {
                Ref: 'Bar'
            },
            SomeNestedProp: {
                SomeNestedValue: {
                    Ref: 'Baz'
                }
            }
        }
    });

    t.deepEqual(refs, ['Baz', 'Bar', 'Foo' ]);
});

test('Sub', t => {
    const refs = getReferences({
        Properties: {
            SomeProp: {
                'Fn::Sub': 'some-thing-${Foo}'
            },
            SomeOtherProp: {
                'Fn::Sub': 'some-thing-${Bar}-'
            },
            SomeNestedProp: {
                SomeNestedValue: {
                    'Fn::Sub': '${Baz}-'
                }
            },
            Ignored: {
                'Fn::Sub': 'some-thing-${AWS::AccountId}'
            },
            Incomplete: {
                'Fn::Sub': 'some-thing-${SomeOtherResource'
            }
        }
    });

    t.deepEqual(refs, ['Baz', 'Bar', 'Foo' ]);
});

test('GetAtt', t => {
    const refs = getReferences({
        Properties: {
            SomeProp: {
                'Fn::GetAtt': ['Foo', 'Arn']
            },
            SomeOtherProp: {
                'Fn::GetAtt': ['Bar', 'Arn']
            },
            SomeNestedProp: {
                SomeNestedValue: {
                    'Fn::GetAtt': 'Baz.Arn'
                }
            },
        }
    });

    t.deepEqual(refs, ['Baz', 'Bar', 'Foo' ]);
});

test('Join', t => {
    const refs = getReferences({
        Properties: {
            SomeProp: {
                'Fn::Join': ['-', [{ Ref: 'Foo' }]]
            },
        }
    });

    t.deepEqual(refs, ['Foo' ]);
});

test('Throws when Sub is formatted wrong', t => {
    t.throws(() => getReferences({
        Properties: {
            SomeProp: {
                'Fn::Sub': { incorrect: true }
            }
        }
    }));
});

test('Throws when GetAtt is not an Array or String', t => {
    t.throws(() => getReferences({
        Properties: {
            SomeProp: {
                'Fn::GetAtt': { incorrect: true }
            }
        }
    }));
});

test('Throws when Join is formatted wrong', t => {
    t.throws(() => getReferences({
        Properties: {
            SomeProp: {
                'Fn::Join': [{ Ref: 'Foo' }]
            }
        }
    }));

    t.throws(() => getReferences({
        Properties: {
            SomeProp: {
                'Fn::Join': ['test', { Ref: 'Foo' }]
            }
        }
    }));
});