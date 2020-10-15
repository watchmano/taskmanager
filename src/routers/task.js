const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()
const session = require('express-session')

router.post('/tasks', auth, async (req, res) => {
    
    const {description, details} = req.body
    
    let task = new Task({
        description,
        details,
        owner: req.user._id
    })
    console.log(task)
    try {
        task = await task.save()
        res.render('taskResults', {task})
    } catch (e) {
        res.status(400).send(e)
    }
    
})

router.get('/tasks/add', auth, (req, res) => {
    res.render('add')}
)

router.get('/tasks/:skip/:completed', auth, async (req, res) => {
    
    const match = {}

    const limit = 4
    const skip = parseInt(req.params.skip)
    const page = Math.floor( skip / limit ) + 1
    
    match.completed = req.params.completed === 'true'
    
    try {
        const counts = await Task
            .countDocuments({ owner: req.user, completed: match.completed })
        
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit,
                skip
            }
        }).execPopulate()

        const tasks = req.user.tasks
        const completed = match.completed
        const pagination = { }
        
        if(page > 1) {
            pagination.prevPage = page - 1
            pagination.prevSkip = (page - 2) * 4
        }

        if((page * limit) < counts) { 
            pagination.nextPage = page + 1
            pagination.nextSkip = page * 4
        }


        const results = { completed, counts, pagination, tasks }
        
        res.render('tasks', {results})
    } catch (e) {
        res.status(500).send()
    }

})

router.post('/tasks/edit', auth, async (req, res) => {
    
    const { completed, description, details, _id, select } = req.body
    
    try {
        let task = await Task.findOne({ _id, owner: req.user})
        if(!task) { return res.status(404).send() }
        
        if ( completed ) {
            task.completed = (completed === 'true') ? false : true
            task = await task.save()
            res.render('taskResults', {task})
        } else if (select === 'contents') {
            res.render('add', {task})
        } else {
            task.description = description
            task.details = details
            task = await task.save()
            res.render('taskResults', {task})
        }
    } catch (e) {
        res.send(e) }
})

router.post('/tasks/delete', auth, async (req, res) => {
    try {
        const { _id } = req.body
        const task = await Task.findOneAndDelete({_id, owner: req.user._id})
        if (!task) {
            res.status(404).send()
        }
        task.deleted = 1
        res.render('taskResults')
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router