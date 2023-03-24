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
      let typeName = sch[1].name ? sch[1].name : ''
      let position = sch[1].in ? sch[1].in : ''
      let protocol = sch[1].type? sch[1].type : ''
      let bearerFormat = sch[1].bearerFormat ? sch[1].bearerFormat : ''
      let type = sch[1].scheme ? sch[1].scheme : ''  

      if (sch[1].flows) {
        scopes = getScopes(sch[1].flows.implicit.scopes)
        url = sch[1].flows.implicit.authorizationUrl
      }
  
      schema.push({
        name: sch[0],
        protocol: protocol,
        typeName: typeName,
        type: type,
        position : position,
        bearerFormat : bearerFormat,
        url: url,
        in: position,
        scopes: scopes
      })
    })

    return schema
}
  


  