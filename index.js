const {
  createCharacterType,
  findAllCharacterType,
  findCharacterType,
  deleteCharacterType,
  modifyCharacterType,
} = require('./src/constants/action');

const characterTypeService = require('./src/services/CharacterType');
const characterService = require('./src/services/Character');
const userCharacterService = require('./src/services/UserCharacter');
const itemService = require('./src/services/Item');
const itemTypeService = require('./src/services/ItemType');

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
      response = await characterTypeService.getCharacterType(body.data.id)
      break;
    case findAllCharacterType:
      response = await characterTypeService.getCharacterTypes();
      break;
    case deleteCharacterType:
      response = await characterTypeService.deleteCharacterType(body.data.id);
      break;
    case modifyCharacterType:
      response = await characterTypeService.modifyCharacterType(
        body.data.id,
        body.data.updateKey,
        body.data.updateValue
      );
      break;
  }
  return response;
};
