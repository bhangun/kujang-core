/**
 * Copyright 2013-2021 the original author or authors Bhangun Hartani
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
const SwaggerParser = require("@apidevtools/swagger-parser");

module.exports = {
  transformApi,
  mappingProps,
  mappingEntities,
  mappingFields,
  getPaths,
  getPathMethod,
  transformType,
  propsForServices,
  otherEntity,
  uniqProperties,
  findEqualObject
};

/**
 * Mapping all api element to kujang schema
 * @param {*} api 
 * @param {*} appsName 
 * @returns api element
 */
function mappingProps(api, appsName) {
  const _props = []
  const entities = mappingEntities(appsName, api)
  const schema =  {
    appsName: appsName,
    baseName: appsName,
    packageFolder: appsName,
    info: api.info,
    servers: api.servers,
    securitySchemes: api.components ? getSecurity(api.components.securitySchemes) : {},
    tags: api.tags,
    paths: getPaths(api, _props),
  }

  const uniqprop =  uniqProperties(_props)
  schema.entities = entities? entities:[]
  schema.properties = uniqprop? uniqprop :[]

  return schema
}

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

/**
 * Mapping scopes
 * @param {*} input 
 * @returns 
 */
function getScopes(input) {
  const scopes = []
  if (input) Object.entries(input).forEach(s => {
    scopes.push({
      scope: s[0],
      description: s[1]
    })
  })
  return scopes
}

/**
 * Mapping component to be entities and as repositories
 * @param {*} appsName Application name
 * @param {*} api OpenAPi object
 * @returns entites
 */
function mappingEntities(appsName, api) {

  const schema = api.components ? api.components.schemas : {}
  const entities = []

  if (schema) Object.entries(schema).forEach(entity => {
    entities.push({
      appsName: appsName,
      pkType: 'String',
      relationships: [],
      entityName: entity[0],
      entityClass: entity[0],
      entityInstance: _.camelCase(entity[0]),
      entityFolderName: _.camelCase(entity[0]),
      entityFileName: _.camelCase(entity[0]),
      enableTranslation: false,
      fields: mappingFields(entity[1], schema)
    })
  })
  return entities
}

/**
 * Mapping fiels as properties of entity
 * @param {*} obj 
 * @param {*} entities 
 * @returns 
 */
function mappingFields(obj, entities) {
  const fields = []
  if (obj.properties)
    Object.entries(obj.properties).forEach(field => {
      fields.push({
        fieldType: transformType(field[1], field[1].enum),
        fieldName: _.camelCase(field[0]),
        fieldIsEnum: field[1].enum ? true : false,
        fieldValues: _.join(field[1].enum, ','),
        fieldDescription: field[1].description,
        fieldsContainOneToMany: false,
        fieldsContainOwnerManyToMany: false,
        fieldsContainOwnerOneToOne: false,
        fieldsContainNoOwnerOneToOne: false,
        fieldsContainManyToOne: false
      })
    })
  return fields
}

/**
 * Mapping path to be use as services
 * @param {*} api Api root
 */
function getPaths(api, props) {
  const paths = []
  if (api) Object.entries(api.paths).forEach(path => {
    let param = ''
    param = path[0] ? splitParam(path[0]) : ''
    const hasParam = path[0].split('{').length > 1
    paths.push({
      pathOrigin: path[0],
      path: param,
      hasParam: hasParam,
      methods: getPathMethod(path[1], props)
    })
  })
  return paths
}

/**
 * Split Parameter
 * @param {*} path 
 * @returns 
 */
function splitParam(path) {
  return path.replaceAll('{', '${')
}

/**
 * Get Path method
 * @param {*} path path
 */
function getPathMethod(path, props) {
  const methods = []

  if (path) Object.entries(path).forEach(method => {
    const m = method[1];
    const reqContentType = []
    let typeRequest = ''
    let required = []
    let _properties = []

    if (m.requestBody)
      Object.entries(m.requestBody.content).forEach(c => {

        /**  requestBody.content.<contentType> */
        reqContentType.push(c[0])

        /// requestBody.content.schema.xml
        typeRequest = c[1].schema.xml ? c[1].schema.xml.name : ''

        /// requestBody.content.<contentType>.schema.required
        required = c[1].schema.required

        /// requestBody.content.<contentType>.schema.properties
        _properties = c[1].schema.properties ? c[1].schema.properties : []
      })

    methods.push({

      /// paths.<path>.<method>
      method: method[0],

      /// List parameter
      parameters: m.parameters,

      /// paths.<path>.<method>.tags
      tags: m.tags,

      /// paths.<path>.<method>.summary
      summary: m.summary,

      /// paths.<path>.<method>.description
      description: m.description,

      /// paths.<path>.<method>.operationId
      operationId: _.camelCase(m.operationId),

      /// Request Body -> All included
      /// requestBody.content
      requestBody: _getRequestBody(m.requestBody, typeRequest, reqContentType, required, _properties, props),

      // Response
      responses: getResponses(m, props)
    })
  })
  return methods
}


/**
 * Contain all RequestBody element
 * @param {*} requestBody 
 * @param {*} typeRequest 
 * @param {*} reqContentType 
 * @param {*} required 
 * @param {*} properties 
 * @returns 
 */
function _getRequestBody(requestBody, typeRequest, reqContentType, required, properties, props) {
  const getprop = _getProperties(properties, required)

  props.push(getprop)

  return {
    required: required,
    component: _.capitalize(typeRequest),
    description: requestBody ? requestBody.description : '',
    contentType: reqContentType,
    properties: getprop
  }
}

/**
 * 
 * @param {*} props 
 * @param {*} req 
 * @returns 
 */
function _getProperties(props, req) {
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


/**
 * Sanitize / convert type
 * @param {*} field 
 * @param {*} entities 
 * @returns 
 */
function transformType(type, lang) {
  let newType = {}
  newType.origin = type.type ? type.type : ''
  newType.example = type.example ? type.example : ''
  newType.description = type.description ? type.description : ''
  newType.type = 'String'
  newType.typeDesc = ''

  switch (type.type) {
    case 'integer':
      if (type.format == 'int64')
        newType.type = 'double'
      else if (type.format == 'int32')
        newType.type = 'int'
      break;
    case 'number':
      if (type.format == 'float')
        newType.type = 'Float'
      else if (type.format == 'double')
        newType.type = 'double'
      break;
    case 'string':
      switch (type.format) {
        case 'byte':
          newType.type = 'ByteData'
          break;
        case 'binary':
          newType.type = 'BinaryCodec'
          break;
        case 'date':
          newType.type = 'DateTime'
          break;
        case 'date-time':
          newType.type = 'DateTime'
          break;
        case 'password':
        default:
          newType.type = 'String'
          break;
      }
      break;
    case (type.type == 'Instant'):
      newType.type = 'int'
      newType.typeDesc = '.toIso8601String()' + 'Z'
      break
    case 'array':
      newType.type = 'List'
      break;
    case 'uuid':
      newType.type = 'String'
      break;
    case 'object':
      newType.type = type.xml ? _.capitalize(type.xml.name) : ''
      break;
  }

  if (type.isEnum) newType.type = 'String'

  return newType
}

/**
 * Mapping responses
 * @param {*} list 
 * @returns 
 */
function getResponses(list, props) {
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

    /// responses.<responseCode>.content.schema.xml.name
    type = c[1].schema.xml ? c[1].schema.xml.name : ''

    /// responses.<responseCode>.content.schema.required
    req = c[1].schema.required

    /// responses.<responseCode>.content.schema.properties
    _props = c[1].schema.properties

    /// responses.<responseCode>.content.schema.items
    _items.type = c[1].schema.items ? c[1].schema.items.type : ''

    _items.properties = c[1].schema.items ? _getProperties(c[1].schema.items.properties, []) : []
  })

  props.push(_items.properties)

  return {
    contenType: contenType,
    component: _.capitalize(type),
    required: req,
    properties: _getProperties(_props, []),
    items: _items
  }
}

/**
 * 
 * @param {*} appsName 
 * @param {*} path 
 * @param {*} callback 
 */
function transformApi(appsName, path, callback) {

  SwaggerParser.validate(path, (err, api) => {
    if (err) {
      console.error(err);
    }
    else {
      callback(mappingProps(api, appsName), api)
    }
  })
}

function propsForServices(paths) {
  const methods = []
  for (const i in paths) {
    for (const m in paths[i].methods) {

      const methodPath = _transMethod(paths[i].methods[m].method);
      const responseType = _getResponseType(paths[i].methods[m].responses, i)

      // PARAMETER
      const param = putParam(paths[i].methods[m], responseType);
      const parameters = param.param;
      const query = param.query;

      methods.push({
        path: paths[i].path ? paths[i].path : '',
        methodName: paths[i].methods[m].operationId ? paths[i].methods[m].operationId : '',
        methodPath: methodPath.method,
        summary: paths[i].methods[m].summary ? paths[i].methods[m].summary : '',
        desc: paths[i].methods[m].description ? paths[i].methods[m].description : '',
        responseType: responseType,
        parameters: parameters,
        query: query,
        requestPayload: methodPath.payload,
        requestPayloadStatement: methodPath.payloadStatement,
        onlyParam: methodPath.onlyParam
      })
    }
  }
  return methods
}



function _getResponseType(responses, i) {
  let responseType = 'void'
  // RESPONSE
  const _responses = responses;
  const code200 = _responses.find(e => e.code == '200')
  const responseContent = code200 ? code200 : {}

  if (responseContent.content) {
    if (responseContent.content.component)
      responseType = responseContent.content.component
    else if (responseContent.content.items)
      responseType = _.capitalize(responseContent.content.items.type + '' + i)
  } else responseType = 'Object' + i

  return responseType
}

/**
 * 
 * @param {*} input 
 * @param {*} resType 
 * @returns 
 */
function putParam(input, resType) {
  let result = '';
  let param = {}
  let isProp = false
  let onlyParam = ''
  let query = ''
  let payloadStatement = 'const ' + resType.toLowerCase() + ' = ' + resType + '(';

  if (input.parameters)
    param = input.parameters
  else {
    param = input.requestBody.properties;
    isProp = true
  }

  if (param) {

    let req = ''
    let n = param.length
    let comma = ''
    let and = '';
    let q = 0;

    if (param.required)
      req = '@required '

    for (const p in param) {
      result += comma + req + (isProp ? param[p].dartType.type : param[p].schema.type) + '? ' + param[p].name;

      onlyParam += comma + param[p].name + ': ' + param[p].name;

      if (q > 0)
        and = '%26'

      if (param[p].in == 'query') {
        query += and + param[p].name + '=${' + param[p].name + '}'
        q++;
      }
      n--;

      if (n > 0)
        comma = ', '
    }
  }

  // add parameter if there is payload
  if (resType !== 'void') {
    payloadStatement += onlyParam + ');'
  }

  if (query)
    query = '?' + query

  return {
    param: result,
    query: query,
    payload: resType.toLowerCase(),
    payloadStatement: payloadStatement,
    onlyParam: onlyParam
  };
}

/**
 * 
 * @param {*} m 
 * @returns 
 */
function _transMethod(m) {
  let method = m;
  let payload = '';
  let payloadStatement = '';
  let onlyParam = ''

  if (m == 'put')
    method = 'update';
  else if (m == 'get')
    method = 'fetch';


  if (methodPath == 'post' || methodPath == 'update') {
    payload = ', ' + param.payload;
    payloadStatement = param.payloadStatement;
    onlyParam = param.onlyParam
  }

  return {
    method: method,
    payload: payload,
    payloadStatement: payloadStatement,
    onlyParam: onlyParam
  };
}

/**
 * 
 * @param {*} paths 
 * @returns 
 */
function otherEntity(paths) {
  const responseTypes = [];
  for (const i in paths) {
    for (const m in paths[i].methods) {
      let responseType = ''
      // RESPONSE
      const responses = paths[i].methods[m].responses;
      const code200 = responses.find(e => e.code == '200')
      const responseContent = code200 ? code200 : {}

      if (responseContent.content.component)
        responseType = responseContent.content.component
      else if (responseContent.content.items.type)
        responseType = _.capitalize(responseContent.content.items.type + '' + i)
      else responseType = 'Object' + i

      responseTypes.push(
        {
          "appsName": responseType,
          "pkType": "String",
          "relationships": [],
          "entityName": _.capitalize(responseType),
          "entityClass": _.capitalize(responseType),
          "entityInstance": responseType,
          "entityFolderName": responseType,
          "entityFileName": responseType,
          "enableTranslation": false,
          "fields": otherFields(paths[i].methods[m])
        }
      )
    }
  }
  return responseTypes
}

/**
 * 
 * @param {*} input 
 * @returns 
 */
function otherFields(input) {
  let param = {}
  const fields = []
  let isProp = false

  if (input.parameters)
    param = input.parameters
  else {
    param = input.requestBody.properties;
    isProp = true
  }

  for (const p in param) {
    fields.push(
      {
        "fieldType": isProp ? param[p].type : param[p].schema.type, //transformType(isProp ? param[p].type : param[p].schema.type, false),
        "fieldName": param[p].name,
        "fieldIsEnum": false,
        "fieldValues": "",
        "fieldsContainOneToMany": false,
        "fieldsContainOwnerManyToMany": false,
        "fieldsContainOwnerOneToOne": false,
        "fieldsContainNoOwnerOneToOne": false,
        "fieldsContainManyToOne": false
      }
    )
  }

  return fields
}

/**
 * uniqProperties from array
 * @param {*} properties 
 * @returns Unique array object
 */
function uniqProperties(properties) {
  const arr = _.uniqWith(properties, _.isEqual)
  return _.filter(arr, (a) => {
    return a.length > 0
  })
}

/**
 * findEqualObject from array
 * @param {array} objects 
 * @param {object} properties 
 * @returns object which equals with properties instead []
 */
function findEqualObject(objects, properties) {
  return _.filter(objects, (a) => {
    return _.isEqual(a, properties)
  })
}


