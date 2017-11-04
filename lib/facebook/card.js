function convertFromFBCard(card) {
    const lpCard = {
        type: 'vertical',
        '@type': 'card',
        elements: []
    };
    if (card.image_url) {
        let image = {
            type: 'image',
            url: card.image_url,
            tooltip: card.title,
        };
        if (card.default_action && card.default_action.url) {
            image.click = {
                actions: [{
                    type: 'link',
                    uri: card.default_action.url
                }]
            };
        }
        lpCard.elements.push(image);
    }
    lpCard.elements.push({
        type: 'text',
        text: card.title,
        tooltip: card.title,
        style: {
            bold: true,
            size: 'large'
        }
    });
    if (card.subtitle) {
        lpCard.elements.push({
            type: 'text',
            text: card.subtitle,
            tooltip: card.subtitle,
        });
    }
    if (card.buttons) {
        const lpButtons = card.buttons.map((button) => {
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
        });
        lpCard.elements = lpCard.elements.concat(lpButtons);
    }

    return lpCard;
}

function convertToFBGenericTemplate(lpCard) {
    const card = {
        type: 'template',
        payload: {
            template_type: 'generic',
            elements: []
        }
    };

    const cardElement = {};

    lpCard.forEach(element => {
        if (element.type === 'image') {
            if (!cardElement.image_url) {
                cardElement.image_url = element.url;
                if (element.click && element.click.actions && element.click.actions[0] && element.click.actions[0].type === 'link') {
                    cardElement.default_action = {
                        type: 'web_url',
                        url: element.click.actions[0].uri
                    };
                }
            } else {
                throw new Error('multiple images is not supported');
            }
        } else if (element.type === 'text') {
            if (!cardElement.title) {
                cardElement.title = element.text;
            } else if (!cardElement.subtitle) {
                cardElement.subtitle = element.text;
            } else {
                throw new Error('too many text elements');
            }
        } else if (element.type === 'button') {
            cardElement.buttons = cardElement.buttons || [];
            if (cardElement.buttons.length >= 3) {
                throw new Error('too many buttons');
            }
            const button = {
                title: element.title
            };

            element.click.actions.forEach(action => {
                if (action.type === 'link') {
                    button.type = 'web_url';
                    button.url = action.uri;
                } else if (action.type === 'navigate') {
                    button.type = 'postback';
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