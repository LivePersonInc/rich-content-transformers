function convertFromFBList(list) {
    const lpList = {
        type: 'vertical',
        '@type': 'list',
        elements: []
    };

    lpList.elements = list.elements.map(elementInFacebook => {
        const lpListElement = {
            type: 'horizontal',
            elements: [{
                type: 'vertical',
                elements: [
                    {
                        type: 'text',
                        text: elementInFacebook.title,
                        tooltip: elementInFacebook.title,
                        style: {
                            bold: true,
                            size: 'large'
                        }
                    }
                ]
            }]
        };

        if (elementInFacebook.subtitle) {
            lpListElement.elements[0].elements.push({
                type: 'text',
                text: elementInFacebook.subtitle,
                tooltip: elementInFacebook.subtitle
            });
        }

        if (elementInFacebook.buttons && elementInFacebook.buttons[0]) {
            lpListElement.elements[0].elements.push(convertFromFbButton(elementInFacebook.buttons[0]));
        }

        if (elementInFacebook.image_url) {
            let image = {
                type: 'image',
                url: elementInFacebook.image_url,
                tooltip: elementInFacebook.title,
            };
            if (elementInFacebook.default_action && elementInFacebook.default_action.url) {
                image.click = {
                    actions: [{
                        type: 'link',
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
        type: 'template',
        payload: {
            template_type: 'list',
            elements: []
        }
    };

    fbList.elements = lpList.map(lpListElement => {
        const fbElement = {};
        if (lpListElement.type === 'horizontal') {
            lpListElement.elements.forEach(basicComponent => {
                if (basicComponent.type === 'image') {
                    if (!fbElement.image_url) {
                        fbElement.image_url = basicComponent.url;
                        if (basicComponent.click && basicComponent.click.actions && basicComponent.click.actions[0] && lpListElement.click.actions[0].type === 'link') {
                            fbElement.default_action = {
                                type: 'web_url',
                                url: lpListElement.click.actions[0].uri
                            };
                        }
                    } else {
                        throw new Error('multiple images is not supported');
                    }
                } else if (basicComponent.type === 'vertical') {
                    basicComponent.elements.forEach(internalBasicComponent => {
                        if (internalBasicComponent.type === 'text') {
                            if (!fbElement.title) {
                                fbElement.title = internalBasicComponent.text;
                            } else if (!fbElement.subtitle) {
                                fbElement.subtitle = internalBasicComponent.text;
                            } else {
                                throw new Error('too many text elements');
                            }
                        } else if (internalBasicComponent.type === 'button') {
                            fbElement.buttons = fbElement.buttons || [];
                            if (fbElement.buttons.length >= 1) {
                                throw new Error('too many buttons');
                            }
                            const button = {
                                title: internalBasicComponent.title
                            };

                            internalBasicComponent.click.actions.forEach(action => {
                                if (action.type === 'link') {
                                    button.type = 'web_url';
                                    button.url = action.uri;
                                } else if (action.type === 'navigate') {
                                    button.type = 'postback';
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
        type: 'button',
        tooltip: button.title,
        title: button.title,
        click: {
            actions: []
        }
    };

    if (button.type === 'web_url') {
        lpButton.click.actions.push({
            type: 'link',
            uri: button.url
        });
    }

    if (button.type === 'phone_number') {
        lpButton.click.actions.push({
            type: 'link',
            uri: button.payload
        });
    }

    if (button.type === 'postback') {
        try {
            lpButton.click.actions.push = JSON.parse(button.payload);
        } catch (e) { //TODO: should fail?

        }
    }

    lpButton.click.actions.push({
        type: 'publishText',
        text: button.title
    });

    return lpButton;
}

module.exports = {
    convertToFBListTemplate, convertFromFBList
};
