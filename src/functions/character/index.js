const {
  createCharacterType,
  findAllCharacterType,
  findCharacterType,
  deleteCharacterType,
  modifyCharacterType,
  createCharacter,
  modifyCharacter,
  deleteCharacter,
  findAllCharacter,
  findCharacter,
  createUserCharacter,
  findUserCharacter,
  findAllUserCharacter,
  deleteUserCharacter,
  modifyUserCharacter,
} = require('./action.constant');

const characterTypeService = require('./CharacterType.service');
const characterService = require('./Character.service');
const userCharacterService = require('./UserCharacter.service');

console.log('Loading function');

exports.handler = async (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  const body = event.Records[0].body;
  let response = {
    statusCode: '400',
    message: 'something wrong!',
  };
  switch (body.action) {
    case createCharacterType:
      response = await characterTypeService.saveCharacterType(body.data);
      break;
    case findCharacterType:
      response = await characterTypeService.getCharacterType(body.data.id);
      break;
    case findAllCharacterType:
      response = await characterTypeService.getCharacterTypes();
      break;
    case deleteCharacterType:
      response = await characterTypeService.deleteCharacterType(body.data.id);
      break;
    case modifyCharacterType:
      response = await characterTypeService.modifyCharacterType(body.data);
      break;
    case createCharacter:
      response = await characterService.saveCharacter(body.data);
      break;
    case findCharacter:
      response = await characterService.getCharacter(body.data.id);
      break;
    case findAllCharacter:
      response = await characterService.getCharacters();
      break;
    case deleteCharacter:
      response = await characterService.deleteCharacter(body.data.id);
      break;
    case modifyCharacter:
      response = await characterService.modifyCharacter(
        body.data.id,
        body.data.updateKey,
        body.data.updateValue
      );
      break;
    case createUserCharacter:
      response = await userCharacterService.saveUserCharacter(body.data);
      break;
    case findUserCharacter:
      response = await userCharacterService.getUserCharacter(body.data.id);
      break;
    case findAllUserCharacter:
      response = await userCharacterService.getUserCharacters();
      break;
    case deleteUserCharacter:
      response = await userCharacterService.deleteUserCharacter(body.data.id);
      break;
    case modifyUserCharacter:
      response = await userCharacterService.modifyUserCharacter(
        body.data.id,
        body.data.updateKey,
        body.data.updateValue
      );
      break;
  }
  return response;
};
