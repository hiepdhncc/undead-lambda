const {
  createItemType,
  findItemType,
  findAllItemType,
  deleteItemType,
  modifyItemType,
  findItem,
  modifyItem,
  deleteItem,
  findAllItem,
  createItem,
  createResource,
  findResource,
  findAllResource,
  deleteResource,
  modifyResource,
  createReward,
  findReward,
  findAllReward,
  deleteReward,
  modifyReward,
  createRewardResource,
  findRewardResource,
  findAllRewardResource,
  deleteRewardResource,
  modifyRewardResource,
  createUserResource,
  findUserResource,
  findAllUserResource,
  deleteUserResource,
  modifyUserResource,
  createUserReward,
  findUserReward,
  findAllUserReward,
  deleteUserReward,
  modifyUserReward,
} = require('./action.constant');

const userResourceService = require('./UserResource.service');
const userRewardService = require('./UserReward.service');
const resourceService = require('./Resource.service');
const rewardService = require('./Reward.service');
const rewardResourceService = require('./RewardResource.service');
const itemService = require('./Item.service');
const itemTypeService = require('./ItemType.service');

console.log('Loading function');

exports.handler = async (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const body = event.Records[0].body;
  let response = {
    statusCode: '400',
    message: 'something wrong!',
  };
  switch (body.action) {
    case createItem:
      response = await itemService.saveItem(body.data);
      break;
    case findItem:
      response = await itemService.getItem(body.data.id);
      break;
    case findAllItem:
      response = await itemService.getItems();
      break;
    case deleteItem:
      response = await itemService.deleteItem(body.data.id);
      break;
    case modifyItem:
      response = await itemService.modifyItem(
        body.data.id,
        body.data.updateKey,
        body.data.updateValue
      );
      break;
    case createItemType:
      response = await itemTypeService.saveItemType(body.data);
      break;
    case findItemType:
      response = await itemTypeService.getItemType(body.data.id);
      break;
    case findAllItemType:
      response = await itemTypeService.getItemTypes();
      break;
    case deleteItemType:
      response = await itemTypeService.deleteItemType(body.data.id);
      break;
    case modifyItemType:
      response = await itemTypeService.modifyItemType(
        body.data.id,
        body.data.updateKey,
        body.data.updateValue
      );
      break;
    case createResource:
      response = await resourceService.saveResource(body.data);
      break;
    case findResource:
      response = await resourceService.getResource(body.data.id);
      break;
    case findAllResource:
      response = await resourceService.getResources();
      break;
    case deleteResource:
      response = await resourceService.deleteResource(body.data.id);
      break;
    case modifyResource:
      response = await resourceService.modifyResource(
        body.data.id,
        body.data.updateKey,
        body.data.updateValue
      );
      break;
    case createReward:
      response = await rewardService.saveReward(body.data);
      break;
    case findReward:
      response = await rewardService.getReward(body.data.id);
      break;
    case findAllReward:
      response = await rewardService.getRewards();
      break;
    case deleteReward:
      response = await rewardService.deleteReward(body.data.id);
      break;
    case modifyReward:
      response = await rewardService.modifyReward(
        body.data.id,
        body.data.updateKey,
        body.data.updateValue
      );
      break;
    case createRewardResource:
      response = await rewardResourceService.saveRewardResource(body.data);
      break;
    case findRewardResource:
      response = await rewardResourceService.getRewardResource(body.data.id);
      break;
    case findAllRewardResource:
      response = await rewardResourceService.getRewardResources();
      break;
    case deleteRewardResource:
      response = await rewardResourceService.deleteRewardResource(body.data.id);
      break;
    case modifyRewardResource:
      response = await rewardResourceService.modifyRewardResource(
        body.data.id,
        body.data.updateKey,
        body.data.updateValue
      );
      break;
    case createUserResource:
      response = await userResourceService.saveUserResource(body.data);
      break;
    case findUserResource:
      response = await userResourceService.getUserResource(body.data.id);
      break;
    case findAllUserResource:
      response = await userResourceService.getUserResources();
      break;
    case deleteUserResource:
      response = await userResourceService.deleteUserResource(body.data.id);
      break;
    case modifyUserResource:
      response = await userResourceService.modifyUserResource(
        body.data.id,
        body.data.updateKey,
        body.data.updateValue
      );
      break;
    case createUserReward:
      response = await userRewardService.saveUserReward(body.data);
      break;
    case findUserReward:
      response = await userRewardService.getUserReward(body.data.id);
      break;
    case findAllUserReward:
      response = await userRewardService.getUserRewards();
      break;
    case deleteUserReward:
      response = await userRewardService.deleteUserReward(body.data.id);
      break;
    case modifyUserReward:
      response = await userRewardService.modifyUserReward(
        body.data.id,
        body.data.updateKey,
        body.data.updateValue
      );
      break;
  }
  return response;
};
