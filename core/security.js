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
  


  