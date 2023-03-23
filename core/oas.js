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

const GenBase = require('./index');

module.exports = class extends GenBase {

    constructor(args, opts) {
        super(args, opts);
       
        this.props = opts.props
        this.props.module = opts.props.module
        this.obj = opts.obj
    }

    prompting() {
        const appsName = this.getDefaultAppName(); 
        const prompts = [
            {
                type: 'input',
                name: 'appsName',
                message: `What would your client application name?`,
                validate: input => (/^[^\s][A-z0-9-_]*$/.test(input) ? true : 'Please avoid space or non standard flutter apps name!'),
                default: appsName,
                store: true
            },
            {
                type: 'input',
                name: 'path_api',
                message: `URL/Path to your OAS? ${this.chalkYellowBright('(json/yaml/yml)')}`,
                validate: input => (/^((https?|chrome|file):\/\/[^\s$.?#].[^\s]*)|([A-z0-9-_+/:]+.(json|yaml|yml))$/.test(input) ? true : 'Something wrong with your URL or Path, please change!'),
                store: true
            },
        ];

        const done = this.async();
        this.prompt(prompts).then((props) => {
            this.transformApi(props.appsName, props.path_api, (api, origin)=>{

                this.obj.props = api

                this.obj.props.api_source = props.path_api

                /// since: --module <custom_module>
                this.obj.props.module = this.props.module

                this.obj.writeKujangJson(props.appsName, api)

               // if (this.props.isOriginWrite) 
                    this.obj.writeOriginJson(props.appsName, origin)
                //console.log(origin)

                if(this.props.module){
                    const _path = checkPath(this.props.module)
                    
                    this.composeWith(require.resolve(_path + this.props.module), this.obj.props);
                }
                done();
            })
        });
    }
}

function checkPath(path){
  if (/^(..\/)[^\s]*$/.test(path)) return '../'
  else if (/^(..\\)[^\s]*$/.test(path)) return '..\\'
  else return ''
}