# @cfn/graph

This returns a list of all the Resources in a CloudFormation template, sorted based on their dependency graph.

Each entry in the list contains the `resource` itself, as well as any `references` (to Resources or Parameters)

## Example

```js
const graph = require('@cfn/graph')

const template = {
    Parameters: {
        SomeParam: {
            Type: 'String',
            Default: 'something'
        }
    },
    Resources: {
        Foo: {
            Type: 'AWS::Some::Thing',
            Properties: {
                SomeProperty: {
                    Ref: 'SomeParam'
                }
            }
        },
        Bar: {
            Type: 'AWS::Some::OtherThing',
            Properties: {
                Foo: {
                    Ref: 'Foo'
                }
            }
        },
    }
}

const list = graph({ template })
```

In this case, `list` would be:

```json
[
  {
    "logicalId": "Bar",
    "resource": {
      "Type": "AWS::Some::OtherThing",
      "Properties": {
        "Foo": {
          "Ref": "Foo"
        }
      }
    },
    "references": [
      "Foo"
    ]
  },
  {
    "logicalId": "Foo",
    "resource": {
      "Type": "AWS::Some::Thing",
      "Properties": {
        "SomeProperty": {
          "Ref": "SomeParam"
        }
      }
    },
    "references": [
      "SomeParam"
    ]
  }
]
```
