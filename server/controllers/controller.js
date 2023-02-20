import pool from '../connection/connection.js'

import Model from '../../model/model.js'
const model = new Model()

const ajax = async function(req, res){

    if(req.body.part === 'createRobot'){
        const id = await model.createRobot(pool, req.body.obj)
        res.status(200).json(id)
    }

    if(req.body.part === 'getRobots'){
        const arr = await model.getRobots(pool)
        res.status(200).json(arr)
    }

    if(req.body.part === 'deleteRobot'){
        const r = await model.deleteRobot(pool, req.body.orderId)
        res.status(200).json(r)
    }

}

export default ajax

