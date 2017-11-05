const CONST = require('./../Const');

function convertFromFBCard(card) {
    const lpCard = {
        type: CONST.LIVEPERSON.VERTICAL,
        [CONST.LIVEPERSON.TYPE_KEY]: CONST.LIVEPERSON.CARD,
        elements: []
    };
    if (card.image_url) {
        let image = {
            type: CONST.LIVEPERSON.IMAGE,
            url: card.image_url,
            tooltip: card.title,
        };
        if (card.default_action && card.default_action.url) {
            image.click = {
                actions: [{
                    type: CONST.LIVEPERSON.IMAGE,
                    uri: card.default_action.url
                }]
            };
        }
        lpCard.elements.push(image);
    }
    lpCard.elements.push({
        type: CONST.LIVEPERSON.TEXT,
        text: card.title,
        tooltip: card.title,
        style: {
            bold: true,
            size: CONST.LIVEPERSON.LARGE
        }
    });
    if (card.subtitle) {
        lpCard.elements.push({
            type: CONST.LIVEPERSON.TEXT,
            text: card.subtitle,
            tooltip: card.subtitle,
        });
    }
    if (card.buttons) {
        const lpButtons = card.buttons.map((button) => {
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
                    lpButton.click.actions.push(JSON.parse(button.payload));
                } catch (e) { //TODO: should fail?

                }
            }

            lpButton.click.actions.push({
                type: CONST.LIVEPERSON.PUBLISH_TEXT,
                text: button.title
            });

            return lpButton;
        });
        lpCard.elements = lpCard.elements.concat(lpButtons);
    }

    return lpCard;
}

function convertToFBGenericTemplate(lpCard) {
    const card = {
        type: CONST.FACEBOOK.TEMPLATE,
        payload: {
            template_type: CONST.FACEBOOK.GENERIC,
            elements: []
        }
    };

    const cardElement = {};

    lpCard.forEach(element => {
        if (element.type === CONST.LIVEPERSON.IMAGE) {
            if (!cardElement.image_url) {
                cardElement.image_url = element.url;
                if (element.click && element.click.actions && element.click.actions[0] && element.click.actions[0].type === CONST.LIVEPERSON.LINK) {
                    cardElement.default_action = {
                        type: CONST.FACEBOOK.WEB_URL,
                        url: element.click.actions[0].uri
                    };
                }
            } else {
                throw new Error('multiple images is not supported');
            }
        } else if (element.type === CONST.LIVEPERSON.TEXT) {
            if (!cardElement.title) {
                cardElement.title = element.text;
            } else if (!cardElement.subtitle) {
                cardElement.subtitle = element.text;
            } else {
                throw new Error('too many text elements');
            }
        } else if (element.type === CONST.LIVEPERSON.BUTTON) {
            cardElement.buttons = cardElement.buttons || [];
            if (cardElement.buttons.length >= 3) {
                throw new Error('too many buttons');
            }
            const button = {
                title: element.title
            };

            element.click.actions.forEach(action => {
                if (action.type === CONST.LIVEPERSON.LINK) {
                    button.type = CONST.FACEBOOK.WEB_URL;
                    button.url = action.uri;
                } else if (action.type === CONST.LIVEPERSON.NAVIGATE) {
                    button.type = CONST.FACEBOOK.POSTBACK;
                    button.payload = JSON.stringify(action);
                }
            });

            cardElement.buttons.push(button);
        }
    });

    card.payload.elements.push(cardElement);
    return card;
}

module.exports = {
    convertToFBGenericTemplate, convertFromFBCard
};
