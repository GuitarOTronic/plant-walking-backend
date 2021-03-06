const db = require('../db/connection.js')


class userProfilesModel {

  static getOneUserProfile(id){
    // console.log('user', id);
    return db('user_profiles')
    .where({id})
  }

  static createUserProfile(body){
    // console.log('Model body',body);
    return db('user_profiles')
    .insert(body)
    .returning('*')
  }

  static updateUserProfile(id, body) {
    console.log('Model user profile update')
    console.log(body)
    return db('user_profiles')
      .where({ user_id: id })
      .update(body)
      .returning('*')
  }

}

module.exports = userProfilesModel
