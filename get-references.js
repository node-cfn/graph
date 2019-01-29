'use strict';

module.exports = function getReferences(obj) {
  const references = [];

  const todo = [obj];

  const handle = item => {
    const ref = item.Ref;
    const getAtt = item['Fn::GetAtt'];
    const sub = item['Fn::Sub'];
    const join = item['Fn::Join'];

    if (ref) {
      references.push(ref);
    } else if (sub) {
      if (typeof sub === 'string') {
        const matched = sub.match(/\${.+?}/g)
        
        if (matched) {
          matched.forEach(match => {
            const name = match.slice(2, match.length - 1);

            if (name.indexOf('AWS::') === -1) {
              references.push(name);
            }
          });
        }
      } else {
        throw new Error(`Unknown Fn::Sub type ${typeof sub}`);
      }
    } else if (getAtt) {
      if (Array.isArray(getAtt)) {
        references.push(getAtt[0]);
      } else if (typeof getAtt === 'string') {
        const split = getAtt.split('.');
        references.push(split[0]);
      } else {
        throw new Error(`Fn::GetAtt should be an Array or String but is ${typeof getAtt}`);
      }
    } else if (join) {
      if (Array.isArray(join) && join.length === 2 && Array.isArray(join[1])) {
        todo.push(...join[1]);
      } else {
        throw new Error('Invalid Fn::Join syntax');
      }
    } else {
      todo.push(...Object.values(item));
    }
  }

  while (todo.length > 0) {
    const item = todo.pop(); 

    if (typeof item === 'object') {
      handle(item);
    }
  }

  return references;
};