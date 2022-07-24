const _ = require('lodash');

module.exports = {
    getProperties
};

/**
 * 
 * @param {*} props 
 * @param {*} req 
 * @returns 
 */
 function getProperties(props, req) {
    const properties = []
    if (props) Object.entries(props).forEach(el => {
      const format = el[1].format ? el[1].format : ''
      const type = el[1].type ? el[1].type : ''
      const enumm = el[1].enum
      const isEnum = el[1].enum ? true : false
  
      properties.push({
        name: el[0],
        // dartType: transformType({ type: type, format: format, isEnum: isEnum }),
        type: type,
        enum: enumm ? _.join(enumm, ',') : '',
        format: format,
        isEnum: isEnum,
        example: el[1].example ? el[1].example : '',
        required: req ? req.includes(el[0]) : false
      })
    })
    return properties
  }
  