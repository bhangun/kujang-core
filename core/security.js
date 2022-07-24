const _ = require('lodash');
const _utils = require('./utils');

module.exports = {
    getSecurity
};


/**
 * Get security information
 * @param {*} api 
 */
function getSecurity(api) {
    const schema = []
    if (api) Object.entries(api).forEach(sch => {
      let scopes = []
      let url = ''
      let typeName = ''
      let position = ''
  
      if (sch[1].flows) {
        scopes = getScopes(sch[1].flows.implicit.scopes)
        url = sch[1].flows.implicit.authorizationUrl
      }
  
      if (sch[1].name)
        typeName = sch[1].name
  
      if (sch[1].in)
        position = sch[1].in
  
      schema.push({
        name: sch[0],
        type: sch[1].type,
        typeName: typeName,
        url: url,
        in: position,
        scopes: scopes
      })
    })
    return schema
}
  


  