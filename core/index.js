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

var Generator = require('yeoman-generator');
const path = require('path');
const _ = require('lodash');
const ejs = require('ejs');
const chalk = require('chalk');
const utils = require('./utils');

module.exports = class extends Generator {

  constructor(args, opts, features) {
    // Calling the super constructor is important so our generator is correctly set up
    super(args, opts, features);

    this.option("plugins", { type: String, required: false });
    this.option("print_origin", { type: Boolean, required: false });

    // expose lodash to templates
    this._ = _;
   
  }

/*   usage() {
    return super.usage().replace('yo kujang:', 'kujang ');
  } */

  initializing(obj, props, packagejs) {

    const version = chalk.yellow(`${packagejs.version}`)

    this.log(`${chalk.bold.yellowBright('            ▄     ')}`);
    this.log(`${chalk.bold.yellowBright('          ▄▄██')}`);
    this.log(`${chalk.bold.yellowBright('       ▄▄░░████')}`);
    this.log(`${chalk.bold.yellowBright('     ▄░░  ░████')}`);
    this.log(`${chalk.bold.yellowBright('    ░░  ░█████  ')}${chalk.bold.cyan('__              __')}`);
    this.log(`${chalk.bold.yellowBright('   ░  ░░█████  ')}${chalk.bold.cyan('|  | ____ ___   |__|____    ____    ____ ')}`);
    this.log(`${chalk.bold.yellowBright('  ░░░░░████    ')}${chalk.bold.cyan('|  |/ /  |   \\  |  \\__  \\  /    \\  / ___\\')}`);
    this.log(`${chalk.bold.yellowBright('  ░░░███       ')}${chalk.bold.cyan('|    <|  |   /  |  |/ __ \\|   |  \\/ /_/  >')}`);
    this.log(`${chalk.bold.yellowBright('   ░░░██       ')}${chalk.bold.cyan('|__|__ \\____/\\__|  (____  /___|  /\\___  /     ')}`);
    this.log(`${chalk.bold.yellowBright('    ░░░██     ▄      ')}${chalk.bold.cyan('\\/    \\______|    \\/     \\//_____/')}`);
    this.log(`${chalk.bold.yellowBright('     ░░░░██████ ')}`);
    this.log(`${chalk.bold.yellowBright('      ░░░░░░██ ')}`);
    this.log(`${chalk.bold.redBright('        ░░██  ')}`);
    this.log(`${chalk.bold.redBright('        ░░██')}   Salam to the ${chalk.bold.yellow('Kujang')} generator! ${version}`);
    this.log(`${chalk.bold.redBright('        ░░███')}`);
    this.log(`${chalk.bold.red('         ▀▀▀▀')}`);

    this.promptOas(obj, props)
  }

  promptOas(obj, props) {
    props.plugins = this.options.plugins
    props.isPrintOrigin = this.options.print_origin
    this.composeWith(require.resolve('./oas'), {obj:obj, props:props});
  }

  /**
 * @returns default app name
 */
  getDefaultAppName() {
    return /^[a-zA-Z0-9-_]+$/.test(path.basename(process.cwd())) ? path.basename(process.cwd()) : 'kujang';
  }

  /**
 * Apply output customizer.
 *
 * @param {string} outputPath - Path to customize.
 */
  applyOutputPathCustomizer(outputPath) {
    let outputPathCustomizer = this.options.outputPathCustomizer;
    if (!outputPathCustomizer && this.configOptions) {
      outputPathCustomizer = this.configOptions.outputPathCustomizer;
    }
    if (!outputPathCustomizer) {
      return outputPath;
    }
    outputPath = outputPath ? normalize(outputPath) : outputPath;
    if (Array.isArray(outputPathCustomizer)) {
      outputPathCustomizer.forEach(customizer => {
        outputPath = customizer.call(this, outputPath);
      });
      return outputPath;
    }
    return outputPathCustomizer.call(this, outputPath);
  }

  /**
   * Fetch files from the kujang-core instance installed
   * @param {...string} subpath : the path to fetch from
   */
  fetchFrom(...subpath) {
    return path.join(__dirname, ...subpath);
  }

  /**
   * Utility function to copy and process templates.
   *
   * @param {string} source - source
   * @param {string} destination - destination
   * @param {*} generator - reference to the generator
   * @param {*} options - options object
   * @param {*} context - context
   */
  template(source, destination, generator, context, options = {}) {
    const _this = generator || this;
    const _context = context || _this;
    const customDestination = _this.destinationPath(destination);
    if (!customDestination) {
      this.debug(`File ${destination} ignored`);
      return Promise.resolved();
    }
    return this.renderContent(source, _this, _context, options).then(res => {
      _this.fs.write(customDestination, res);
      return customDestination;
    });
  }


  /**
* Override yeoman generator's destinationPath to apply custom output dir.
*/
  destinationPath(...paths) {
    paths = path.join(...paths);
    paths = this.applyOutputPathCustomizer(paths);
    return paths ? super.destinationPath(paths) : paths;
  }


  /**
   * Render content
   *
   * @param {string} source source
   * @param {object} generator reference to the generator
   * @param {any} context context
   * @param {object} options options
   * @param {function} [cb] callback function
   * @return {Promise<String>} Promise rendered content
   */
  renderContent(source, generator, context, options, cb) {
    options = {
      root: options.root || generator.templatePath(),
      context: generator,
      ...options,
    };

    if (context.entityClass) {
      const basename = path.basename(source);
      if (context.configOptions && context.configOptions.sharedEntities) {
        Object.values(context.configOptions.sharedEntities).forEach(entity => {
          entity.resetFakerSeed(`${context.entityClass}-${basename}`);
        });
      } else if (context.resetFakerSeed) {
        context.resetFakerSeed(basename);
      }
    }
    const promise = ejs.renderFile(generator.templatePath(source), context, options);
    if (cb) {
      return promise
        .then(res => cb(res))
        .catch(err => {
          generator.warning(`Copying template ${source} failed. [${err}]`);
          throw err;
        });
    }
    return promise;
  }


  /**
   * Rewrite file with passed arguments
   * @param {object} args argument object (containing path, file, haystack, etc properties)
   * @param {object} generator reference to the generator
   */
  rewriteFile(args, generator) {
    let fullPath;
    if (args.path) {
      fullPath = path.join(args.path, args.file);
    }
    fullPath = generator.destinationPath(args.file);

    args.haystack = generator.fs.read(fullPath);
    const body = rewrite(args);
    generator.fs.write(fullPath, body);
    return args.haystack !== body;
  }


  /**
   * Utility function to copy files.
   *
   * @param {string} source - Original file.
   * @param {string} destination - The resulting file.
   */
  copy(source, destination) {
    const customDestination = this.destinationPath(destination);
    if (!customDestination) {
      this.debug(`File ${destination} ignored`);
      return;
    }
    this.fs.copy(this.templatePath(source), customDestination);
  }

  /**
   * 
   * @param {*} path 
   * @param {*} contents 
   */
  writeKujangJson(_path, contents) {
    this.fs.writeJSON(_path + '/.kujang.json', contents)
  }

  /**
  * 
  * @param {*} path 
  * @param {*} contents 
  */
  writeOriginJson(_path, contents) {
    this.fs.writeJSON(_path + '/.origin.json', contents)
  }

  /**
   * Transform API
   * @param {*} obj 
   * @param {*} appsName 
   * @param {*} path_api 
   * @param {*} isOriginWrite 
   * @param {*} callback 
   */
  transformApi(appsName, path_api, callback) {
    utils.transformApi(appsName, path_api, (api, origin) => {
      callback(api, origin)
    })
  }

  /**
   * Print a debug message.
   *
   * @param {string} msg - message to print
   * @param {string[]} args - arguments to print
   */
  debug(msg, ...args) {
    const formattedMsg = `${chalk.yellow.bold('DEBUG!')} ${msg}`;
    if ((this.configOptions && this.configOptions.isDebugEnabled) || (this.options && this.options.debug)) {
      this.log(formattedMsg);
      args.forEach(arg => this.log(arg));
    }
    if (this._debug && this._debug.enabled) {
      this._debug(formattedMsg);
      args.forEach(arg => this._debug(arg));
    }
  }

  /**
   * Check if Git is installed
   */
  checkGit() {
    if (this.skipChecks || this.skipClient) return;
    this.gitInstalled = this.isGitInstalled();
  }

  chalkYellowBright(text) {
    return chalk.bold.yellowBright(text)
  }

  chalkYellow(text) {
    return chalk.bold.yellow(text)
  }

  chalkYellow(text) {
    return chalk.bold.yellowBright(text)
  }

  chalkBlueBright(text) {
    return chalk.bold.blueBright(text)
  }

  chalkYellow(text) {
    return chalk.bold.yellowBright(text)
  }

  chalkRedBright(text) {
    return chalk.bold.redBright(text)
  }

  /**
   * transformType
   * @param {*} type 
   * @param {*} isEnum 
   * @returns 
   */
  transformType(type, isEnum) {
    return utils.transformType(type, isEnum)
  }

  /**
   * propsForService
   * @param {*} paths 
   * @returns 
   */
  propsForService(paths) {
    return utils.propsForServices(paths)
  }

  otherEntity(paths) {
    return utils.otherEntity(paths)
  }
}