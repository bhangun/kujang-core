const _ = require('lodash');
const prop = require('./properties');

module.exports = {
    responses,
    getResponseType
};


/**
 * Mapping responses
 * @param {*} list 
 * @returns 
 */
function responses(list, props) {
    const responses = []

    if (list && list.responses)
        Object.entries(list.responses).forEach(r => {

        let headersType = []

        if (r[1].headers)
            Object.entries(r[1].headers).forEach(c => {
            headersType.push(c[0])
            })

        responses.push({
            /// responses.<responseCode>
            code: r[0],

            /// responses.<responseCode>.description
            description: r[1].description ? r[1].description : '',

            /// responses.<responseCode>.content
            content: r[1].content ? _getResponseContentType(r[1].content, props) : [],

            /// responses.<responseCode>.content
            //required: required,

            headers: headersType
        })
        })
    return responses;
}


/**
 * Get ResponseContentType
 * @param {*} contentType 
 * @returns 
 */
function _getResponseContentType(contentType, props) {
    let contenType = ''
    let _props = []
    let type = ''
    let req = []
    let _items = {}

    if (contentType) Object.entries(contentType).forEach(c => {

        /// responses.<responseCode>.content.<contenType>
        contenType = c[0]

        const _ref = c[1].schema.$ref
        let _comp = ''
        if(_ref)
        _comp = _ref.split(RegExp(`^#\/components\/schemas\/`))[1]

        /// responses.<responseCode>.content.schema.xml.name
        type = c[1].schema.xml ? c[1].schema.xml.name : _comp

        /// responses.<responseCode>.content.schema.required
        req = c[1].schema.required

        /// responses.<responseCode>.content.schema.properties
        _props = c[1].schema.properties

        /// responses.<responseCode>.content.schema.items
        _items.type = c[1].schema.items ? c[1].schema.items.type : ''

        _items.properties = c[1].schema.items ? prop.getProperties(c[1].schema.items.properties, []) : []


    })

    props.push(_items.properties)

    return {
        contenType: contenType,
        component: _.capitalize(type),
        required: req,
        properties: prop.getProperties(_props, []),
        items: _items
    }
}



function getResponseType(responses, properties) {
    let responseType = 'void'
    // RESPONSE
    const _responses = responses;
    const code200 = _responses.find(e => e.code == '200' ||  e.code == '201')
    const responseContent = code200 ? code200 : {}
  
    if (responseContent.content) {
      if (responseContent.content.component)
        responseType = responseContent.content.component
      else if(responseContent.content.properties)
        responseType = findEqualObject(responseContent.content.properties, properties).name
      else if (responseContent.content.items){
        //responseType = _.capitalize(responseContent.content.items.type + '' + i)
        responseType = findEqualObject(responseContent.content.items.properties, properties).name
      } 
    } else responseType = 'UnknownObject'
  
    return responseType
  }
  