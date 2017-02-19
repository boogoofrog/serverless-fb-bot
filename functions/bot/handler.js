'use strict';

const request = require('request');

function display(object) {
  return JSON.stringify(object, null, 2)
}

function generateMessage(text) {
  return '我在講話你是不會看我是不是'
}

module.exports.handler = function(event, context) {

  console.log('Event: ', display(event));
  console.log('Context: ', display(context));
  
  const operation = event.operation;
  const secret = event.secret;

  function sendText(sender, message) {
      request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: secret },
        method: 'POST',
        json: {
          recipient: { id: sender },
          message: { text: message }
        }
      }, (error, response, body) => {
          context.succeed(response);
          if (error) {
            context.fail('Error sending message: ', error);
          } else if (response.body.error) {
            context.fail('Error lol: ', response.body.error); 
          }
      })
    }

  switch (operation) {
    
  	case 'verify': 	
      const verifyToken = event['verify_token']
  		if (secret === verifyToken) {
  			context.succeed(parseInt(event['challenge']));  			
  		} else {
  			context.fail(new Error('Unmatch lol'));
  		}
  		break
    case 'reply':
      const messagingEvents = event.body.entry[0].messaging;
      messagingEvents.forEach((messagingEvent) => {
        const sender = messagingEvent.sender.id;
        if (messagingEvent.message && messagingEvent.message.text) {
          const text = messagingEvent.message.text;
          const data = generateMessage(text);
          sendText(sender, data);
        }
      })
      break     
  	default:
  		context.fail(new Error('Sup! boy' + operation));
  }
}
