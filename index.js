const {charactersPath, characterPath, characterTypePath, characterTypesPath} = require('./src/constants/path')


const characterTypeService = require('./src/services/CharacterType');
const characterService = require('./src/services/Character');

exports.handler = async function (event) {
  console.log('Request event: ', event);
  let response;
  const requestBody = JSON.parse(event.body);
  switch (true) {
    case event.httpMethod === 'GET' && event.path === characterTypesPath:
      response = await characterTypeService.getCharacterTypes();
      break;
    case event.httpMethod === 'GET' && event.path === characterTypePath:
      response = await characterTypeService.getCharacterType(event.queryStringParameters.id);
      break;
    case event.httpMethod === 'POST' && event.path === characterTypePath:
      response = await characterTypeService.saveCharacterType(JSON.parse(event.body));
      break;
    case event.httpMethod === 'PATCH' && event.path === characterTypePath:
      response = await characterTypeService.modifyCharacterType(requestBody.id, requestBody.updateKey, requestBody.updateValue);
      break;
    case event.httpMethod === 'DELETE' && event.path === characterTypePath:
      response = await characterTypeService.deleteCharacterType(JSON.parse(event.body).id);
      break;


    case event.httpMethod === 'GET' && event.path === charactersPath:
      response = await characterService.getCharacters();
      break;
    case event.httpMethod === 'GET' && event.path === characterPath:
      response = await characterService.getCharacter(event.queryStringParameters.id);
      break;
    case event.httpMethod === 'POST' && event.path === characterPath:
      response = await characterService.saveCharacter(JSON.parse(event.body));
      break;
    case event.httpMethod === 'PATCH' && event.path === characterPath:
      response = await characterService.modifyCharacter(requestBody.id, requestBody.updateKey, requestBody.updateValue);
      break;
    case event.httpMethod === 'DELETE' && event.path === characterPath:
      response = await characterService.deleteCharacter(JSON.parse(event.body).id);
      break;
    default:
      response = buildResponse(404, '404 Not Found!');
      break;
    }

    return response;
};

function buildResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
  };
}