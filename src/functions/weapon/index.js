const {
  deleteUserWeapon,
  modifyUsereapon,
  createUserWeapon,
  createUserSkin,
  modifyUserSkin,
  deleteUserSkin,
  claimSkin,
} = require('./action.constant');

const userWeaponService = require('./user-waepon.service');
const userSkinService = require('./user-skin.service');

exports.handler = async (event, context, callback) => {
  const body = JSON.parse(event.Records[0].body);
  console.log('LOADING FUNCTION');
  console.log('RECEIVED EVENT:', JSON.stringify(event, null, 2));
  let response = {
    statusCode: '500',
    message: 'something wrong!',
  };

  switch (body.action) {
    case createUserSkin:
      response = await userSkinService.saveUserSkin(body.data);
      break;
    case deleteUserSkin:
      response = await userSkinService.deleteUserSkin(body.data.id);
      break;
    case modifyUserSkin:
      response = await userSkinService.modifyUserSkin(
        body.data.id,
        body.data.updateKey,
        body.data.updateValue
      );
      break;

    case createUserWeapon:
      response = await userWeaponService.saveUserWeapon(body.data);
      break;
    case deleteUserWeapon:
      response = await userWeaponService.deleteUserWeapon(body.data.id);
      break;
    case modifyUsereapon:
      response = await userWeaponService.modifyUserWeapon(
        body.data.id,
        body.data.updateKey,
        body.data.updateValue
      );
      break;
      
    case claimSkin:
      response = await userSkinService.claimSkin(body.data.userId, body.data.skinId);
      break;
  }
  return response;
};
