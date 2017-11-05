const CONST = require('./../Const');

function convertFromFBList(list) {
    const lpList = {
        type: CONST.LIVEPERSON.VERTICAL,
        [CONST.LIVEPERSON.TYPE_KEY]: CONST.LIVEPERSON.LIST,
        elements: []
    };

    lpList.elements = list.elements.map(elementInFacebook => {
        const lpListElement = {
            type: CONST.LIVEPERSON.HORIZONTAL,
            elements: [{
                type: CONST.LIVEPERSON.VERTICAL,
                elements: [
                    {
                        type: CONST.LIVEPERSON.TEXT,
                        text: elementInFacebook.title,
                        tooltip: elementInFacebook.title,
                        style: {
                            bold: true,
                            size: CONST.LIVEPERSON.LARGE
                        }
                    }
                ]
            }]
        };

        if (elementInFacebook.subtitle) {
            lpListElement.elements[0].elements.push({
                type: CONST.LIVEPERSON.TEXT,
                text: elementInFacebook.subtitle,
                tooltip: elementInFacebook.subtitle
            });
        }

        if (elementInFacebook.buttons && elementInFacebook.buttons[0]) {
            lpListElement.elements[0].elements.push(convertFromFbButton(elementInFacebook.buttons[0]));
        }

        if (elementInFacebook.image_url) {
            let image = {
                type: CONST.LIVEPERSON.IMAGE,
                url: elementInFacebook.image_url,
                tooltip: elementInFacebook.title,
            };
            if (elementInFacebook.default_action && elementInFacebook.default_action.url) {
                image.click = {
                    actions: [{
                        type: CONST.LIVEPERSON.LINK,
                        uri: elementInFacebook.default_action.url
                    }]
                };
            }
            lpListElement.elements.push(image);
        }

        return lpListElement;
    });

    return lpList;
}

function convertToFBListTemplate(lpList) {
    const fbList = {
        type: CONST.FACEBOOK.TEMPLATE,
        payload: {
            template_type: CONST.FACEBOOK.LIST,
            elements: []
        }
    };

    fbList.elements = lpList.map(lpListElement => {
        const fbElement = {};
        if (lpListElement.type === CONST.LIVEPERSON.HORIZONTAL) {
            lpListElement.elements.forEach(basicComponent => {
                if (basicComponent.type === CONST.LIVEPERSON.IMAGE) {
                    if (!fbElement.image_url) {
                        fbElement.image_url = basicComponent.url;
                        if (basicComponent.click && basicComponent.click.actions && basicComponent.click.actions[0] && lpListElement.click.actions[0].type === 'link') {
                            fbElement.default_action = {
                                type: CONST.FACEBOOK.WEB_URL,
                                url: lpListElement.click.actions[0].uri
                            };
                        }
                    } else {
                        throw new Error('multiple images is not supported');
                    }
                } else if (basicComponent.type === CONST.LIVEPERSON.VERTICAL) {
                    basicComponent.elements.forEach(internalBasicComponent => {
                        if (internalBasicComponent.type === CONST.LIVEPERSON.TEXT) {
                            if (!fbElement.title) {
                                fbElement.title = internalBasicComponent.text;
                            } else if (!fbElement.subtitle) {
                                fbElement.subtitle = internalBasicComponent.text;
                            } else {
                                throw new Error('too many text elements');
                            }
                        } else if (internalBasicComponent.type === CONST.LIVEPERSON.BUTTON) {
                            fbElement.buttons = fbElement.buttons || [];
                            if (fbElement.buttons.length >= 1) {
                                throw new Error('too many buttons');
                            }
                            const button = {
                                title: internalBasicComponent.title
                            };

                            internalBasicComponent.click.actions.forEach(action => {
                                if (action.type === CONST.LIVEPERSON.LINK) {
                                    button.type = CONST.FACEBOOK.WEB_URL;
                                    button.url = action.uri;
                                } else if (action.type === CONST.LIVEPERSON.NAVIGATE) {
                                    button.type = CONST.FACEBOOK.POSTBACK;
                                    button.payload = JSON.stringify(action);
                                }
                            });

                            fbElement.buttons.push(button);
                        }
                    });
                } else {
                    throw new Error('basic element npt allowed');
                }
            });
        } else {
            //TODO: should throw
        }
        return fbElement;
    });

    return fbList;
}

function convertFromFbButton(button) {
    const lpButton = {
        type: CONST.LIVEPERSON.BUTTON,
        tooltip: button.title,
        title: button.title,
        click: {
            actions: []
        }
    };

    if (button.type === CONST.FACEBOOK.WEB_URL) {
        lpButton.click.actions.push({
            type: CONST.LIVEPERSON.LINK,
            uri: button.url
        });
    }

    if (button.type === CONST.FACEBOOK.PHONE) {
        lpButton.click.actions.push({
            type: CONST.LIVEPERSON.LINK,
            uri: button.payload
        });
    }

    if (button.type === CONST.FACEBOOK.POSTBACK) {
        try {
            lpButton.click.actions.push = JSON.parse(button.payload);
        } catch (e) { //TODO: should fail?

        }
    }

    lpButton.click.actions.push({
        type: CONST.LIVEPERSON.PUBLISH_TEXT,
        text: button.title
    });

    return lpButton;
}

module.exports = {
    convertToFBListTemplate, convertFromFBList
};
