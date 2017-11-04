'use strict';
const expect = require('chai').expect;
const mockery = require('mockery');
const sinon = require('sinon');

describe('Transformers Library Tests', () => {


    before(() => {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false,
            useCleanCache: true
        });

    });

    after(() => {
        mockery.disable();
    });

    it('placeholder', done => {
        done();
    });

});
