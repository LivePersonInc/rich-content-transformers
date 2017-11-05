'use strict';
const expect = require('chai').expect;
const mockery = require('mockery');
const sinon = require('sinon');
const facebookTransforme = require('./../lib/facebook');

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

    it('should transform to facebook from liveperson', done => {
        const lpCard = require('./lp-card.json');
        const fbCard = require('./fb-card.json');
        const fbCardNow = facebookTransforme.transformTo(lpCard);
        expect(fbCardNow).to.deep.equal(fbCard);
        done();
    });

    it('should transform to liveperson from facebook', done => {
        const lpCard = require('./lp-card.json');
        const fbCard = require('./fb-card.json');
        const lpCardNow = facebookTransforme.transformFrom(fbCard);
        expect(lpCardNow).to.deep.equal(lpCard);
        done();
    });

});
