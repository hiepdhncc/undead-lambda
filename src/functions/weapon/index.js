const {
  deleteUserWeapon,
  modifyUsereapon,
  createUserWeapon,
  createUserSkin,
  modifyUserSkin,
  deleteUserSkin,
  purchaseWeapon,
  upgradeWeapon,
  purchaseSkin,
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

    case purchaseSkin:
      response = await userSkinService.purchaseSkin(body.data.userId, body.data.skinId);
      break;
    case purchaseWeapon:
      response = await userWeaponService.purchaseWeapon(body.data.userId, body.data.weaponId);
      break;
    case upgradeWeapon:
      response = await userWeaponService.upgradeWeapon(body.data.userId, body.data.weaponId);
      break;
  }
  return response;
};
