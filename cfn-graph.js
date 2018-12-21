'use strict';

const toposort = require('toposort');

const getReferences = require('./get-references');

module.exports = function graph({ template }) {
    const { Resources = {} } = template;

    const resources = Object.keys(Resources).reduce((memo, logicalId) => {
        const resource = Resources[logicalId];
        const references = getReferences(resource);

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