const Model = require('../models/steps-model.js')
const PlantInstanceModel = require('../models/plant-instance-model.js')
const UserProfilesModel = require('../models/user-profiles-model.js')
const PlantTypesModel = require ('../models/plant-types-model.js')

class StepsController {

  static getAll(req, res, next){
    console.log('in steps Cont');
    Model.getAll().then(response => {
      res.json({response})
    })
  }

  static getAllUserSteps(req, res, next){
    Model.getAllUserSteps(req.params.id).then(response => {
      let steps = response[0].number_of_steps
      res.json({response, steps})
    })
  }

  //sorry this functions hideous
  // static addSteps(req, res, next){
  //   console.log('add steps function')
  //   const body = {user_id: req.body.user_id, number_of_steps: req.body.number_of_steps}
  //   Model.addSteps(body).then(result => {
  //     console.log('added steps to steps model')
  //     const stepsToAdd = result[0].number_of_steps
  //     UserProfilesModel.getOneUserProfile(result[0].user_id).then(user => {
  //       console.log('get one user profiles')
  //       console.log(user)
  //       const plant_instances_id = user[0].plant_instances_id
  //       PlantInstanceModel.getOne(plant_instances_id).then(plant => {
  //         console.log('plant', plant)
  //         const progress = plant[0].progress + stepsToAdd
  //         PlantInstanceModel.addToProgress(stepsToAdd, plant_instances_id).then(([plantInstance]) => {
  //           console.log('plantInstance', plantInstance)
  //           PlantTypesModel.getOnePlantType(plantInstance.plant_types_id).then(plantType => {
  //             console.log('plant type', plantType)
  //             if(progress >= plantType.steps_required){
  //               StepsController.resetProgress(plant_instances_id)
  //               console.log('yay you finished your plant');
  //             }
  //           })
  //           return plantInstance //?
  //           })
  //         })
  //       })
  //     res.status(200).json({body})
  //   })
  // }

  static addSteps(req, res, next) {
    const body = {user_id: req.body.user_id, number_of_steps: req.body.number_of_steps}
    Model.addSteps(body).then(result => {
      next()
    })
    .catch(err => {
      next({
        err,
        message: 'Error in add steps function'
      })
    })
  }

  static checkPlantTypeStepsRequired(req, res, next) {
    PlantTypesModel.getOnePlantType(req.body.plant_type_id).then(plantType => {
      req.body.steps_required = plantType.steps_required
      next()
    })
    .catch(err => {
      next({
        err,
        message: 'Error in check plant type steps required function'
      })
    })
  }

  static getActivePlantType(req, res, next) {
    PlantInstanceModel.getOne(req.body.plant_instance_id).then(([plantInstance]) => {
      req.body.plant_type_id = plantInstance.plant_types_id
      req.body.progress = plantInstance.progress
      next()
    })
    .catch(err => {
      next({
        err,
        messsage: 'Error in get active plant function'
      })
    })
  }

  static updateUserCurrentPlant(req, res, next) {
    PlantInstanceModel.addToProgress(req.body.number_of_steps, req.body.plant_instance_id).then(_ => {
      next()
    })
    .catch(err => {
      next({
        err, 
        message: 'error in update current user plant function'
      })
    })
  }

  static isPlantFinished(req, res, next) {
    const { user_id, plant_instance_id, plant_type_id, number_of_steps, steps_required, progress } = req.body
    if(req.body.steps_required <= req.body.progress) {
      this.resetProgress()
      res.status(200).json({
        user_id, 
        plant_instance_id,
        plant_type_id,
        steps_required,
        progress,
        number_of_steps_added: number_of_steps,
        'finished': true
      })
    } else {
      res.status(200).json({ 
        user_id, 
        plant_instance_id,
        plant_type_id,
        steps_required,
        progress,
        number_of_steps_added: number_of_steps,
        'finished': false
      })
    }
  }

  static getCurrentUserPlant(req, res, next) {
    UserProfilesModel.getOneUserProfile(req.body.user_id).then(([user]) => {
      const plant_instance_id = user.plant_instances_id
      req.body.plant_instance_id = plant_instance_id
      next() // goes to updateCurrentUserPlant
    })
    .catch(err => {
      next({
        err, 
        message: 'Error in get current user plant function'
      })
    })
  }

  static resetProgress(id){
    PlantInstanceModel.resetProgress(id)
  }

  static validate(req, res, next){
    if((req.body.user_id && Number.isInteger(req.body.user_id))
      && (req.body.number_of_steps && Number.isInteger(req.body.number_of_steps))) {
      next()
    }
    else{
      next({error: 'Not valid input'})
    }
  }
}

module.exports = StepsController
