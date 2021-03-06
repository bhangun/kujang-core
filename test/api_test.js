
const GenBase = require('../core');
const utils = require('../core/utils');
const _ = require('lodash');
const fs = require('fs')


const API2 = 'https://petstore.swagger.io/v2/swagger.json'
const API3 = 'https://petstore3.swagger.io/api/v3/openapi.json'
const API4 = 'test/pet-oas3.yaml'
const API5 = '../api_sample/api02.yaml'

const API01J = '../api_sample/api/api01.json'
const API01Y = '../api_sample/api/api01.yaml'
const API01R = '../api_sample/api/api01_result.json'

const API02J = '../api_sample/api/api02.json'
const API02R = '../api_sample/api/api02_result.json'
const API02Y = '../api_sample/api/api02.yaml'

const tes = class extends GenBase {

    constructor(args, opts) {
        super(args, opts);
        this.appsName = 'testing'
        this.props = opts
    }
}


function writingEntity2() {
    utils.transformApi(this.appsName, API5, (api) => {
        this.props = api
        // console.log(this.props.entities[6].entityClass)
        console.log(JSON.stringify(this.props))
        console.log(this.props.paths[0].methods)
        for (const i in this.props.paths) {
            for (const m in this.props.paths[i].methods) {
                const path = this.props.paths[i].path;
                const requestType = this.props.paths[i].methods[m].requestBodyType;
                /* const requestClass = capitalize(requestType);
                const requestBodyClass = capitalize(requestType); 
                const responseClass = (this.props.paths[i].methods[m].responseType)?capitalize(this.props.paths[i].methods[m].responseType):capitalize(this.props.paths[i].methods[m].tags[0]); 
                const methodName = this.props.paths[i].methods[m].operationId;
                const isInput = requestType?true:false;
                const methodPath = validatePath(this.props.paths[i].methods[m].method);
                const desc = this.props.paths[i].methods[m].description; 
                const summary = this.props.paths[i].methods[m].summary;
                const param =  putParam(this.props.paths[i].methods[m]);
                const parameters = param.param;
                const query = param.query; */

                let payload = '';
                let payloadStatement = '';
                /* if(methodPath == 'post' || methodPath == 'update'){
                  payload = ', '+param.payload;
                  payloadStatement = param.payloadStatement;
                } */

                console.log(path)
                console.log(requestType)
            }
        }

    })
}

function writingJson() {

    utils.transformApi(this.appsName, props.path_api, (api, origin) => {

        // this.writeKujangJson(this.appsName,api)
        // this.writeOriginJson(this.appsName,origin)
    })

    utils.transformApi(this.appsName, API5, (api) => {
        this.props = api

    })
}

function cobaArray() {
    const aa = [
        { nama: 'a', usia: 9 },
        { nama: [{ a: 'a' }], usia: 8 },
        { nama: [{ a: 'a' }], usia: 8 },
        { nama: 'a', usia: 8, bbb: 'as' }
    ]
    const bb = [{ nama: 'a', usia: 8 }, { nama: 'a', usia: 8 }, { nama: 'a', usia: 8 }, { nama: 'a', usia: 8, bbb: 'as' }]

    //console.log(aa.equal(bb))
    aa.reduce((prev, curr) => {
        //if(prev === curr) return curr
        //console.log(prev)
        console.log(curr['nama'])
        //console.log(prev === curr)
    })

}

const coba = [
    {
      name: 'title',
      type: 'string',
      enum: '',
      format: '',
      isEnum: false,
      example: '',
      required: false
    },
    {
      name: 'category',
      type: 'string',
      enum: '',
      format: '',
      isEnum: false,
      example: '',
      required: false
    },
    {
      name: 'price',
      type: 'string',
      enum: '',
      format: '',
      isEnum: false,
      example: '',
      required: false
    },
    {
      name: '_id',
      type: 'string',
      enum: '',
      format: '',
      isEnum: false,
      example: '',
      required: false
    }
  ]


function testArray(_path) {

    utils.transformApi('myname', _path, (api) => {
        this.props = api

        // utils.writingJson(api)
        //const com = _.compact(api.paths)
        //console.log(com)
        const arr = api
        const arr2 = utils.uniqProperties(api.properties)
       /*  const arr3 = _.filter(api.properties, (p)=>{
             return _.map( arr2, p)   
        }) */

        //const arr4 = _.filter(arr,(a)=>{console.log(a.length)})

        


       /*  const arr5 = _.filter(arr2,(a)=>{
            console.log(a.length)
            return a.length <6})
*/

        const arr6 = _.filter(arr2,(a,i)=>{
            //console.log(coba)
            console.log(i)
                return _.isEqual(a, coba)
            }) 



                console.log(arr6)
       // const aa = utils.uniqProperties(api.properties)
        //console.log(aa)
        //console.log(utils.findEqualObject(api.properties, coba))
        //console.log(arr2.length)

       /*  fs.writeFile('props.json', JSON.stringify(arr2), (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
        }) */
        //console.log(api.properties)

       /*  fs.writeFile('origin.json', JSON.stringify(api), (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
        }) */

    })
}




testArray(API02Y)
//cobaArray()
//writingEntity()
//writingEntity2()
