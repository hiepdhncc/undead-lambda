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

console.log('Loading function');

exports.handler = async (event, context, callback) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));
    for (const { messageId, body } of event.Records) {
        console.log('SQS message %s: %j', messageId, body);
    }
    const body = JSON.parse(event.Records[0].body);
    let reward;
    if(body.type === 'reward'){
      reward = body.item;
      await characterTypeService.saveCharacterType(reward);
    }

    return 'reward';
};
