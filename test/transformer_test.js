'use strict';
const expect = require('chai').expect;
const mockery = require('mockery');
const sinon = require('sinon');
const facebookTransformer = require('./../lib/facebook');

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
        facebookTransformer.transformTo(lpCard).then(fbCardNow => {
            expect(fbCardNow).to.deep.equal(fbCard);
            done();
        });
    });

    it('should transform to liveperson from facebook', done => {
        const lpCard = require('./lp-card.json');
        const fbCard = require('./fb-card.json');
        facebookTransformer.transformFrom(fbCard).then(lpCardNow => {
            expect(lpCardNow).to.deep.equal(lpCard);
            done();
    });
    });

});
