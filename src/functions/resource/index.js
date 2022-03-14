const {
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
  claimResource,
} = require('./action.constant');

const userResourceService = require('./user-resource.service');
const userRewardService = require('./user-reward.service');

console.log('Loading function');

exports.handler = async (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const body = JSON.parse(event.Records[0].body);
  let response = {
    statusCode: '500',
    message: 'something wrong!',
  };
  switch (body.action) {
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
    case claimResource:
      response = await userResourceService.claimResource(
        body.data.userId,
        body.data.resourceId,
        body.data.amount
      );
      break;
  }
  return response;
};
