const cardConverter = require('./card');
const listConverter = require('./list');
const CONST = require('./../Const');

function transformFrom(json) {
    try {
        if (json.type === CONST.FACEBOOK.TEMPLATE) {
            if (json.payload && json.payload.template_type === CONST.FACEBOOK.GENERIC &&
                json.payload.elements && json.payload.elements.length === 1) { //We only support a single card
                return Promise.resolve(cardConverter.convertFromFBCard(json.payload.elements[0]));
            } else if (json.payload && json.payload.template_type === CONST.FACEBOOK.LIST) {
                return Promise.resolve(listConverter.convertFromFBList(json.payload));
            } else {
                throw new Error('unknown template type');
            }
        } else {
            throw new Error('unknown attachment type');
        }
    } catch (e) {
        return Promise.reject(e);
    }
}

function transformTo(lpSC) {
    try {
        if (lpSC[CONST.LIVEPERSON.TYPE_KEY] === CONST.LIVEPERSON.CARD && lpSC.type === CONST.LIVEPERSON.VERTICAL) {
            return Promise.resolve(cardConverter.convertToFBGenericTemplate(lpSC.elements));
        } else if (lpSC[CONST.LIVEPERSON.TYPE_KEY] === CONST.LIVEPERSON.LIST && lpSC.type === CONST.LIVEPERSON.VERTICAL) {
            return Promise.resolve(listConverter.convertToFBListTemplate(lpSC.elements));
        } else {
            throw new Error(`unknown ${CONST.LIVEPERSON.TYPE_KEY}`);
        }
    } catch (e) {
        return Promise.reject(e);
    }

}

module.exports = {
    transformTo,
    transformFrom,
};
