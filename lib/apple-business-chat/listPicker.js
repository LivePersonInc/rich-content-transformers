'use strict';

const CONST = require('./../Const');

function convertFromABCListPicker(listPickerData,base64ToImage) {
    const imagesConversion = listPickerData.images.map((image) => {
        return new Promise((resolve,reject) => {
            base64ToImage(image.data)
                .then(url => resolve([image.identifier,url]))
                .catch(reject);
        });
    });

    return Promise.all(imagesConversion)
        .then(imagesUrls => {
            const images = new Map(imagesUrls);
            const lpListPicker = createLPVerticalElement();
            lpListPicker[CONST.LIVEPERSON.TYPE_KEY] = CONST.LIVEPERSON.LIST_PICKER;
            // TODO: version?

            listPickerData.listPicker.sections.forEach(section => {
                if (section.title) {
                    lpListPicker.elements.push(createLPTextElement({
                        text: section.title,
                        style: {
                            bold: true,
                            size: CONST.LIVEPERSON.LARGE
                        },
                    }));
                }
                section.items.forEach(item => {

                    const lpItem = createLPHorizontalElement();

                    const click = {
                        actions: [{
                            type: CONST.LIVEPERSON.PUBLISH_TEXT,
                            text: item.title || item.subtitle,
                        }]
                    };

                    if (item.imageIdentifier && images[item.imageIdentifier]) {
                        lpItem.elements.push(createLPImageElement({
                            url: images[item.imageIdentifier],
                            tooltip: item.title,
                            click,
                        }));
                    }

                    const lpVertical = createLPVerticalElement();

                    if (item.title) {
                        lpVertical.elements.push(createLPTextElement({
                            text: item.title,
                            style: {
                                bold: true,
                                size: CONST.LIVEPERSON.MEDIUM
                            },
                            click,
                        }));
                    }
                    if (item.subtitle) {
                        lpVertical.elements.push(createLPTextElement({
                            text: item.subtitle,
                            click,
                        }));
                    }

                    lpItem.elements.push(lpVertical);

                    lpListPicker.elements.push(lpItem);
                });
            });

            return lpListPicker;
        });
}

function createLPHorizontalElement(elements = []) {
    return {
        type: CONST.LIVEPERSON.HORIZONTAL,
        elements,
    };
}

function createLPVerticalElement(elements = []) {
    return {
        type: CONST.LIVEPERSON.VERTICAL,
        elements,
    };
}

function createLPTextElement({text = '',style = {}, click = {}, tooltip}) {
    return {
        type: CONST.LIVEPERSON.TEXT,
        text,
        style,
        click,
        tooltip: tooltip || text,
    };
}

function createLPImageElement({url = '',tooltip,click = {}}) {
    return {
        type: CONST.LIVEPERSON.IMAGE,
        url,
        tooltip,
        click,
    };
}

function convertToABCListPicker(lpListPicker,imageToBase64) {
    const imagesUrls = [];
    const abcListPicker = {
        bid: 'boo',
        data: {
            images: [],
            listPicker: {
                multipleSelection: false,
                sections: [],
            }
        }
    };

    let currentSection;
    lpListPicker.forEach(element => {
        if (element.type === CONST.LIVEPERSON.TEXT) {
            if (currentSection) {
                abcListPicker.data.listPicker.sections.push(Object.assign({},currentSection));
            }
            currentSection = {
                order: abcListPicker.data.listPicker.sections.length, // TODO: required?
                title: element[CONST.LIVEPERSON.TEXT],
                items: [],
            };
        } else if (element.type === CONST.LIVEPERSON.HORIZONTAL) {
            const item = {
                order: currentSection.items.length, // TODO: required?
                style: 'default',
            };

            const imageUrl = element.elements[0][CONST.LIVEPERSON.URL];
            if (imageUrl) {
                item.imageIdentifier = imagesUrls.length;
                imagesUrls.push(imageUrl);
            }

            const title = element.elements[1].elements[0][CONST.LIVEPERSON.TEXT];
            if (title) {
                item.title = title;
            }

            const subtitle = element.elements[1].elements[1][CONST.LIVEPERSON.TEXT];
            if (subtitle) {
                item.subtitle = subtitle;
            }

            currentSection.items.push(item);
        } else {
            throw new Error(`Unsupported element ${element.type}`);
        }
    });
    if (currentSection) {
        abcListPicker.data.listPicker.sections.push(Object.assign({},currentSection));
    }

    const imagesConversion = imagesUrls.map(image => {
        return new Promise((resolve,reject) => {
            imageToBase64(image)
                .then(resolve)
                .catch(reject);
        });
    });

    return Promise.all(imagesConversion)
        .then(imagesInBase64 => {
            abcListPicker.data.images = imagesInBase64.map((data,identifier) => ({data,identifier}));
            return abcListPicker;
        });
}

module.exports = {
    convertToABCListPicker,convertFromABCListPicker
};
