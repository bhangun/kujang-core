const _ = require('lodash');
const SwaggerParser = require("@apidevtools/swagger-parser");

module.exports = {
  transformApi,
  mappingProps,
  mappingEntities,
  mappingFields,
  getPaths,
  getPathMethod,
  transformType
};

/**
 * Mapping all api element to kujang schema
 * @param {*} api 
 * @param {*} appsName 
 * @returns api element
 */
function mappingProps(api, appsName) {
  return {
    appsName: appsName,
    baseName: appsName,
    packageFolder: appsName,
    info: api.info,
    entities: mappingEntities(appsName, api),
    paths: getPaths(api),
    servers: api.servers,
    securitySchemes: api.components ? getSecurity(api.components.securitySchemes) : {},
    tags: api.tags
  }
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
 * Sanitize / convert type
 * @param {*} field 
 * @param {*} entities 
 * @returns 
 */
function transformType(type, isEnum) {
  let newType = {}
  newType.origin = type.type ? type.type : ''
  newType.example = type.example ? type.example : ''
  newType.description = type.description ? type.description : ''
  newType.type= 'String'
  newType.typeDesc = ''

  switch (type.type) {
    case 'integer':
      if (type.format == 'int64')
        newType.type= 'double'
      else if (type.format == 'int32')
        newType.type= 'int'
      break;
    case 'number':
      if (type.format == 'float')
        newType.type= 'Float'
      else if (type.format == 'double')
        newType.type= 'double'
      break;
    case 'string':
      switch (type.format) {
        case 'byte':
          newType.type= 'ByteData'
          break;
        case 'binary':
          newType.type= 'BinaryCodec'
          break;
        case 'date':
          newType.type= 'DateTime'
          break;
        case 'date-time':
          newType.type= 'DateTime'
          break;
        case 'password':
        default:
          newType.type= 'String'
          break;
      }
      break;
    case (type.type == 'Instant'):
      newType.type= 'int'
      newType.typeDesc = '.toIso8601String()' + 'Z'
      break
    case 'array':
      newType.type= 'List<String>'
      break;
    case 'uuid':
      newType.type= 'String'
      break;
    case 'object':
      newType.type= type.xml ? _.capitalize(type.xml.name) : ''
      break;
  }

  if (isEnum) newType.type= 'String'

  return newType
}



/**
 * Mapping path to be use as services
 * @param {*} api Api root
 */
function getPaths(api) {
  const paths = []
  if (api) Object.entries(api.paths).forEach(path => {
    const param = splitParam(path[0])
    const hasParam = path[0].split('{').length > 1
    paths.push({
      pathOrigin: path[0],
      path: param,
      hasParam: hasParam,
      methods: getPathMethod(path[1])
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
 * @param {*} path  path
 */
function getPathMethod(path) {
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
      requestBody: _getRequestBody(m.requestBody, typeRequest, reqContentType, required, _properties),

      // Response
      responses: getResponses(m)
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
 * @param {*} props 
 * @returns 
 */
function _getRequestBody(requestBody, typeRequest, reqContentType, required, props) {
    return {
      required: required,
      component: _.capitalize(typeRequest),
      description: requestBody?requestBody.description:'',
      contentType: reqContentType,
      properties: _getProperties(props, required)
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
    const format = el[1].format?el[1].format:''
    const type = el[1].type?el[1].type:''
    const enumm = el[1].enum
    const isEnum = el[1].enum?true:false

    properties.push({ 
      name: el[0], 
      dartType: transformType({type: type, format:format, isEnum: isEnum }),
      type: type,
      enum: enumm? _.join(enumm, ',') : '',
      format: format,  
      example: el[1].example? el[1].example:'', 
      required: req?req.includes(el[0]):false })
  })
  return properties
}

/**
 * Mapping responses
 * @param {*} list 
 * @returns 
 */
function getResponses(list) {
  const responses = []
  //let required = []

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
        content: r[1].content?_getResponseContentType(r[1].content):[],

        /// responses.<responseCode>.content
        //required: required,

        headers: headersType
      })
    })
  return responses ;
}

/**
 * Get ResponseContentType
 * @param {*} contentType 
 * @returns 
 */
function _getResponseContentType(contentType){
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
    _items.type = c[1].schema.items?c[1].schema.items.type:''

    _items.properties = c[1].schema.items?_getProperties(c[1].schema.items.properties, []):[]
  })

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
