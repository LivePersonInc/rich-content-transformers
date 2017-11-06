'use strict';

const listPickerConverter = require('./listPicker');
const CONST = require('./../Const');

function transformFrom(json, base64ToImage) {
    if (json.interactiveData && json.interactiveData.data && json.interactiveData.data.listPicker) {
        return listPickerConverter.convertFromABCListPicker(json.interactiveData.data, base64ToImage);
    } else {
        return Promise.reject(new Error('Unknown type'));
    }
}

function transformTo(lpSC, imageToBase64) {
    if (lpSC[CONST.LIVEPERSON.TYPE_KEY] === CONST.LIVEPERSON.LIST_PICKER && lpSC.type === CONST.LIVEPERSON.VERTICAL) {
        return listPickerConverter.convertToABCListPicker(lpSC.elements, imageToBase64);
    } else {
        return Promise.reject(new Error(`Unknown ${CONST.LIVEPERSON.TYPE_KEY}`));
    }

}

module.exports = {
    transformTo,
    transformFrom,
};
