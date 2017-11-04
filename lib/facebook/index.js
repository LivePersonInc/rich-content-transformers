const cardConverter = require('./card');
const listConverter = require('./list');

function transformFrom(json) {
    if (json.type === 'template') {
        if (json.payload && json.payload.template_type === 'generic' &&
            json.payload.elements && json.payload.elements.length === 1) { //We only support a single card
            return cardConverter.convertFromFBCard(json.payload.elements[0]);
        } else if (json.payload && json.payload.template_type === 'list') {
            return listConverter.convertFromFBList(json.payload);
        } else {
            throw new Error('unknown template type');
        }
    } else {
        throw new Error('unknown attachment type');
    }
}

function transformTo(lpSC) {
    if (lpSC['@type'] === 'card' && lpSC.type === 'vertical') {
        return cardConverter.convertToFBGenericTemplate(lpSC.elements);
    } else if (lpSC['@type'] === 'list' && lpSC.type === 'vertical') {
        return listConverter.convertToFBListTemplate(lpSC.elements);
    } else {
        throw new Error('unknown @type');
    }

}

module.exports = {
    transformTo,
    transformFrom,
};
