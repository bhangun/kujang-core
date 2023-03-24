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
      const typeItems = el[1].items ? el[1].items.type : ''
      const enumm = el[1].enum
      const isEnum = el[1].enum ? true : false
  
      properties.push({
        name: el[0],
        // dartType: transformType({ type: type, format: format, isEnum: isEnum }),
        type: type,
        typeItems: typeItems,
        enum: enumm ? _.join(enumm, ',') : '',
        format: format,
        isEnum: isEnum,
        example: el[1].example ? el[1].example : '',
        required: req ? req.includes(el[0]) : false
      })
    })
    return properties
  }
  