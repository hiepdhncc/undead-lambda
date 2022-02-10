const {
  createWeaponType,
  findWeaponType,
  findAllWeaponType,
  deleteWeaponType,
  modifyWeapon,
  modifyWeaponType,
  createWeapon,
  findWeapon,
  findAllWeapon,
  deleteWeapon,
  createWeaponLevel,
  findWeaponLevel,
  findAllWeaponLevel,
  deleteWeaponLevel,
  modifyWeaponLevel,
} = require('./action.constant');

const weaponTypeService = require('./WaeponType.service');
const weaponService = require('./Weapon.service');
const weaponLevelService = require('./WeaponLevel.service');

console.log('Loading function');

exports.handler = async (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const body = event.Records[0].body;
  let response = {
    statusCode: '400',
    message: 'something wrong!',
  };
  switch (body.action) {
    case createWeaponType:
      response = await weaponTypeService.saveWeaponType(body.data);
      break;
    case findWeaponType:
      response = await weaponTypeService.getWeaponType(body.data.id);
      break;
    case findAllWeaponType:
      response = await weaponTypeService.getWeaponTypes();
      break;
    case deleteWeaponType:
      response = await weaponTypeService.deleteWeaponType(body.data.id);
      break;
    case modifyWeaponType:
      response = await weaponTypeService.modifyWeaponType(
        body.data.id,
        body.data.updateKey,
        body.data.updateValue
      );
      break;
    case createWeapon:
      response = await weaponService.saveWeapon(body.data);
      break;
    case findWeapon:
      response = await weaponService.getWeapon(body.data.id);
      break;
    case findAllWeapon:
      response = await weaponService.getWeapons();
      break;
    case deleteWeapon:
      response = await weaponService.deleteWeapon(body.data.id);
      break;
    case modifyWeapon:
      response = await weaponService.modifyWeapon(
        body.data.id,
        body.data.updateKey,
        body.data.updateValue
      );
      break;
    case createWeaponLevel:
      response = await weaponLevelService.saveWeaponLevel(body.data);
      break;
    case findWeaponLevel:
      response = await weaponLevelService.getWeaponLevel(body.data.id);
      break;
    case findAllWeaponLevel:
      response = await weaponLevelService.getWeaponLevels();
      break;
    case deleteWeaponLevel:
      response = await weaponLevelService.deleteWeaponLevel(body.data.id);
      break;
    case modifyWeaponLevel:
      response = await weaponLevelService.modifyWeaponLevel(
        body.data.id,
        body.data.updateKey,
        body.data.updateValue
      );
      break;
  }
  return response;
};
