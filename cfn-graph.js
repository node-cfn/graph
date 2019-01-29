'use strict';

const toposort = require('toposort');

const getReferences = require('./get-references');

module.exports = function graph({ template }) {
    const { Conditions = {}, Resources = {} } = template;

    const conditions = Object.entries(Conditions).reduce((memo, [logicalId, condition]) => {
        memo[logicalId] = getReferences(condition);

        return memo;
    }, {});

    const resources = Object.entries(Resources).reduce((memo, [logicalId, resource]) => {
        const { DependsOn = [], Condition, Properties = {} } = resource;
  
        const references = getReferences(Properties).concat(DependsOn);
        const conditionReferences = conditions[Condition];

        if (conditionReferences) {
            references.push(...conditionReferences);
        }

        memo[logicalId] = { logicalId, resource, references };

        return memo;
    }, {});
    
    const graph = Object.keys(resources).reduce((memo, logicalId) => {
        const { references } = resources[logicalId];

        memo.push([logicalId, 'root']);
        memo.push(...references.map(reference => [logicalId, reference]));
        
        return memo;
    }, []);

    return toposort(graph)
        .reduce((memo, logicalId) => {
            if (logicalId in resources) {
                memo.push(resources[logicalId]);
            }

            return memo;
        }, []);
};