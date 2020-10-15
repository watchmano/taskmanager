const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
const bcrypt = require('bcryptjs')
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')
const router = new express.Router()

router.get('/temp', async (req, res) => {
    res.render('avatar')
})

router.get('/users', async (req, res) => {
    res.render('signup')
})

router.post('/users', async (req, res) => {
    
    const user = new User(req.body)
    
    try {
        const token = await user.generateAuthToken()
        await user.save()
        
        const options = {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
            httpOnly: true
        }
        

        //sendWelcomeEmail(user.email, user.name)
        
        res.status(201).cookie('token', token, options).render('result', {user})
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/users/login', async (req, res) => {
    res.render('login')
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        if (!user) {
            throw new Error()
        }
        const token = await user.generateAuthToken()
        const options = {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
            httpOnly: true
        }
        
        res.status(200).cookie('token', token, options).render('result', {user})
    } catch (e) {
        res.status(400).send('error: something is wrong. check your email or password.')
    }
})

router.get('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.cookies.token
        })
        await req.user.save()
        res.cookie('token', 'none', {
            expires: new Date(Date.now() + 5 * 1000),
            httpOnly: true
        })
        res.status(200).render('login')
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req, res) => {
    const user = req.user
    if (user.avatar) {
        user.imageString = user.avatar.toString('base64')
    }
    res.render('userResults', {user})
 })

router.get('/users/me/update/:select', auth, async (req, res) => {
    const user = req.user
    if(req.params.select === 'others') { res.render('signup', {user}) }
    else if (req.params.select === 'password'){ res.render('password')}
})

router.post('/users/me/update', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!'})
    }

    const { password } = req.body
    try {
        let user = req.user
        user = await User.findByIdAndUpdate(user._id, req.body, {
            new: true,
            runValidators: true
        })
        if (user.avatar) {user.imageString = user.avatar.toString('base64')}
        res.render('userResults', {user})
    } catch (e) {
        res.send(e)
    }
})
/*
router.post('/users/me/update', auth, async (req, res) => {
    const user = req.user
    res.render('signup', {user})
})*/

router.post('/users/me/update/password', auth, async (req, res) => {
    
    let user = req.user
    const { password, newpassword } = req.body
    try{
        if(!await user.matchPassword(password)) {
            throw 'please, enter correct password'
        }
        user.password = newpassword
        user = await user.save()
        res.render('userResults', {user})
    } catch (e) {
        res.send(e)
    }
})

router.get('/users/me/delete', auth, async (req, res) => {
    try {
        await req.user.remove()
        //sendCancelationEmail(req.user.email, req.user.name)
        res.render('login')

    } catch (e) {
        res.status(500).send()
    }
})

const upload = multer({
    limits: {
        fileSize: 10000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an Image file'))
        }
        cb(undefined, true)
    }
})

router.get('/users/me/avatar', auth, async(req, res) => {
    res.render('avatar')
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    
    const user = req.user
    user.avatar = buffer
    await user.save()
    user.imageString = user.avatar.toString('base64')
    res.render('userResults', {user})
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.get('/users/me/avatar/delete', auth, async (req, res) => {
    const user = req.user
    user.avatar = undefined
    await user.save()

    res.render('userResults', {user})
})

module.exports = router