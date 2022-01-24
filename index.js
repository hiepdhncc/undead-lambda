const {
characterTypePath ,
characterTypesPath ,
characterPath ,
charactersPath ,
userCharacterPath, 
userCharactersPath,
itemTypePath ,
itemTypesPath ,
itemPath ,
itemsPath ,
resourcePath, 
rewardPath ,
rewardsPath ,
rewardResourcePath, 
rewardResourcesPath,
userResourcePath ,
userResourcesPath,
userRewardPath,
userRewardsPath,
} = require('./src/constants/path')


const characterTypeService = require('./src/services/CharacterType');
const characterService = require('./src/services/Character');
const userCharacterService = require('./src/services/UserCharacter');
const itemService = require('./src/services/Item');
const itemTypeService = require('./src/services/ItemType');

exports.handler = async function (event) {
  console.log('Request event: ', event);
  let response;
  const requestBody = JSON.parse(event.body);
  switch (true) {
    // CRUD characterType
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

    // CRUD character 
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

    // CRUD user character 
    case event.httpMethod === 'GET' && event.path === userCharactersPath:
      response = await userCharacterService.getUserCharacters();
      break;
    case event.httpMethod === 'GET' && event.path === userCharacterPath:
      response = await userCharacterService.getUserCharacter(event.queryStringParameters.id);
      break;
    case event.httpMethod === 'POST' && event.path === userCharacterPath:
      response = await userCharacterService.saveUserCharacter(JSON.parse(event.body));
      break;
    case event.httpMethod === 'PATCH' && event.path === userCharacterPath:
      response = await userCharacterService.modifyUserCharacter(requestBody.id, requestBody.updateKey, requestBody.updateValue);
      break;
    case event.httpMethod === 'DELETE' && event.path === userCharacterPath:
      response = await userCharacterService.deleteUserCharacter(JSON.parse(event.body).id);
      break;

    // CRUD item type
    case event.httpMethod === 'GET' && event.path === itemTypesPath:
      response = await itemTypeService.getItemTypes();
      break;
    case event.httpMethod === 'GET' && event.path === itemTypePath:
      response = await itemTypeService.getItemType(event.queryStringParameters.id);
      break;
    case event.httpMethod === 'POST' && event.path === itemTypePath:
      response = await itemTypeService.saveItemType(JSON.parse(event.body));
      break;
    case event.httpMethod === 'PATCH' && event.path === itemTypePath:
      response = await itemTypeService.modifyItemType(requestBody.id, requestBody.updateKey, requestBody.updateValue);
      break;
    case event.httpMethod === 'DELETE' && event.path === itemTypePath:
      response = await itemTypeService.deleteItemType(JSON.parse(event.body).id);
      break;

    // CRUD item
    case event.httpMethod === 'GET' && event.path === itemsPath:
      response = await itemService.getItems();
      break;
    case event.httpMethod === 'GET' && event.path === itemPath:
      response = await itemService.getItem(event.queryStringParameters.id);
      break;
    case event.httpMethod === 'POST' && event.path === itemPath:
      response = await itemService.saveItem(JSON.parse(event.body));
      break;
    case event.httpMethod === 'PATCH' && event.path === itemPath:
      response = await itemService.modifyItem(requestBody.id, requestBody.updateKey, requestBody.updateValue);
      break;
    case event.httpMethod === 'DELETE' && event.path === itemPath:
      response = await itemService.deleteItem(JSON.parse(event.body).id);
      break;

    // CRUD resource

    // CRUD reward

    // CRUD reward-resource

    // CRUD user-resource

    // CRUD user-reward
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