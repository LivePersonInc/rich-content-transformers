const cardConverter = require('./card');
const listConverter = require('./list');
const CONST = require('./../Const');

function transformFrom(json) {
    if (json.type === CONST.FACEBOOK.TEMPLATE) {
        if (json.payload && json.payload.template_type === CONST.FACEBOOK.GENERIC &&
            json.payload.elements && json.payload.elements.length === 1) { //We only support a single card
            return cardConverter.convertFromFBCard(json.payload.elements[0]);
        } else if (json.payload && json.payload.template_type === CONST.FACEBOOK.LIST) {
            return listConverter.convertFromFBList(json.payload);
        } else {
            throw new Error('unknown template type');
        }
    } else {
        throw new Error('unknown attachment type');
    }
}

function transformTo(lpSC) {
    if (lpSC[CONST.LIVEPERSON.TYPE_KEY] === CONST.LIVEPERSON.CARD && lpSC.type === CONST.LIVEPERSON.VERTICAL) {
        return cardConverter.convertToFBGenericTemplate(lpSC.elements);
    } else if (lpSC[CONST.LIVEPERSON.TYPE_KEY] === CONST.LIVEPERSON.LIST && lpSC.type === CONST.LIVEPERSON.VERTICAL) {
        return listConverter.convertToFBListTemplate(lpSC.elements);
    } else {
        throw new Error(`unknown ${CONST.LIVEPERSON.TYPE_KEY}`);
    }

}

module.exports = {
    transformTo,
    transformFrom,
};
