const dynamo = require('./dynamo.config');
const table = require('./table.constant');
const { v4: uuid } = require('uuid');
const _ = require('lodash');
const client = require('./pg.config');

async function getUserSkin(userSkinId) {
  let body = {
    message: 'No item match!',
  };
  const params = {
    TableName: table.userSkin,
    Key: {
      id: userSkinId,
    },
  };
  return await dynamo
    .get(params)
    .promise()
    .then(
      response => {
        if (_.isEmpty(response)) {
          return buildResponse(404, body);
        }
        body = {
          message: 'SUCCESS',
          item: response,
        };
        return buildResponse(200, body);
      },
      err => {
        body.message = err.message;
        return buildResponse(400, body);
      }
    );
}

async function scanDynamoRecords(scanParams, arrayItem) {
  try {
    const data = await dynamo.scan(scanParams).promise();
    arrayItem = arrayItem.concat(data.Items);
    if (data.LastEvaluateKey) {
      scanParams.ExclusiveStartKey = data.LastEvaluateKey;
      return await scanDynamoRecords(scanParams, arrayItem);
    }
    return arrayItem;
  } catch (err) {
    console.error('Err...: ', err);
  }
}

async function getUserSkins() {
  let body = {
    message: 'SUCCESS',
    userSkins: [],
  };
  const params = {
    TableName: table.userSkin,
  };
  const allUserSkins = await scanDynamoRecords(params, []);
  body.userSkins = allUserSkins;
  return buildResponse(200, body);
}

async function modifyUserSkin(userSkinId, updateKey, updateValue) {
  let body = {
    message: 'FAILED',
  };
  const params = {
    TableName: table.userSkin,
    Key: {
      id: userSkinId,
    },
    UpdateExpression: `set ${updateKey} = :value`,
    ExpressionAttributeValues: {
      ':value': updateValue,
    },
    ReturnValues: 'UPDATED_NEW',
  };
  return await dynamo
    .update(params)
    .promise()
    .then(
      response => {
        if (!response.Attributes) {
          body = {
            message: 'Cannot modify item that does not exist!',
          };
          return buildResponse(404, body);
        }
        body = {
          message: 'SUCCESS!',
          updatedAttributes: response,
        };
        return buildResponse(200, body);
      },
      error => {
        body.message = error.message;
        return buildResponse(400, body);
      }
    );
}

async function deleteUserSkin(userSkinId) {
  let body = {
    message: 'FAILED',
  };
  const params = {
    TableName: table.userSkin,
    Key: {
      id: userSkinId,
    },
    ReturnValues: 'ALL_OLD',
  };
  return await dynamo
    .delete(params)
    .promise()
    .then(
      response => {
        if (!response.Attributes) {
          body = {
            message: 'Cannot delete item that does not exist',
          };
          return buildResponse(404, body);
        }
        body = {
          message: 'SUCCESS',
          item: response,
        };
        return buildResponse(200, body);
      },
      error => {
        body.message = error.message;
        return buildResponse(400, body);
      }
    );
}

async function saveUserSkin(requestBody) {
  let body = {
    message: 'Failed',
  };
  const params = {
    TableName: table.userSkin,
    Item: {
      id: uuid(),
      user_id: requestBody.userId || '',
      skin_id: requestBody.skinId || '',
    },
  };
  return await dynamo
    .put(params)
    .promise()
    .then(
      () => {
        body = {
          message: 'SUCCESS',
          item: params.Item,
        };
        return buildResponse(200, body);
      },
      error => {
        body.message = error.message;
        return buildResponse(400, body);
      }
    );
}

function buildResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
}
async function purchaseSkin(userId, weaponSkinId) {
  try {
    client.connect();
    const user = await client.query('select * from jhi_user where id = $1', [userId]);
    const weaponSkin = await client.query('select * from weapon_skin where id = $1', [
      weaponSkinId,
    ]);
    if(!user || !weaponSkin){
      return;
    } else {
      await client.query('select * from weapon_skin where id = $1', [weaponSkinId]);
      await client.query(`INSERT INTO user_weapon_skin(user_id, weapon_skin_id) VALUES($1,$2)`, [
        userId,
        weaponSkinId
      ]);
    }
  } catch (err) {
    console.log(err);
  }

  // check user exist?

  // const params = {
  //   TableName: table.userSkin,
  //   FilterExpression: 'user_id = :userId and skin_id = :skinId',
  //   ExpressionAttributeValues: {
  //     ':userId': userId,
  //     ':skinId': skinId,
  //   },
  // };
  // const userSkins = await scanDynamoRecords(params, []);
  // if (userSkins && userSkins.length > 0) {
  //   return buildResponse(400, body);
  // }
  // const userSkin = {
  //   userId,
  //   skinId,
  // };
  // await saveUserSkin(userSkin);
  // body.message = 'Success!';
  // return buildResponse(200, body);
}

module.exports = {
  saveUserSkin,
  deleteUserSkin,
  getUserSkins,
  getUserSkin,
  modifyUserSkin,
  purchaseSkin,
};
