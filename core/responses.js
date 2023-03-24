/* eslint-disable no-undef */
/**
 * Copyright 2023 Bhangun Hartani
 * This file is part of the Kujang Generator
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

    if (list)
        Object.entries(list.responses).forEach(r => {

        let headersType = []
        const responseCode = r[0]
        const content = r[1].content ? _getResponseContentType(r[1].content, props) : []


        if (r[1].headers){
          Object.entries(r[1].headers).forEach(c => {
            headersType.push(c[0])
          })
        }

       
        responses.push({
            /// responses.<responseCode>
            code: responseCode,

            /// responses.<responseCode>.description
            description: r[1].description ? r[1].description : '',

            /// responses.<responseCode>.content
            content: content,

            /// responses.<responseCode>.content
            //required: required,

            headers: headersType
        })
        })

    // console.log(responses)
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

        if(c[1].schema !=null){
          const _ref = c[1].schema.$ref
          let _comp = ''
          if(_ref)
            _comp = _ref.split(RegExp(`^#/components/schemas/`))[1]

          /// responses.<responseCode>.content.schema.xml.name
          type = c[1].schema.xml ? c[1].schema.xml.name : _comp

          /// responses.<responseCode>.content.schema.required
          req = c[1].schema.required

          /// responses.<responseCode>.content.schema.properties
          _props = c[1].schema.properties

          /// responses.<responseCode>.content.schema.items
          _items.type = c[1].schema.items ? c[1].schema.items.type : ''

          _items.properties = c[1].schema.items ? prop.getProperties(c[1].schema.items.properties, []) : []
        }
    })

    props.push(_items.properties)

    return {
        contenType: contenType,
        component: _.capitalize(type),
        required: req,
        properties: prop.getProperties(_props, []),
        responseObject: _items
    }
}



function getResponseType(responses, properties) {

  //console.log(responses)


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

/**
 * findEqualObject from array
 * @param {array} objects 
 * @param {object} properties 
 * @returns object which equals with properties instead []
 */
function findEqualObject(objects, properties) {
  let index = 0
  const obj =  _.filter(objects, (a,i) => {
    index = i
    return _.isEqual(a, properties)
  })

  return {name: 'Object'+index, object: obj, index: index}
}
