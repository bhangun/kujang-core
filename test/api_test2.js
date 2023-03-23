const GenBase = require('../core');
const utils = require('../core/utils');
const _ = require('lodash');
const fs = require('fs')

const tes = class extends GenBase {

    constructor(args, opts) {
        super(args, opts);
        this.appsName = 'testing'
        this.props = opts
    }
}

tes