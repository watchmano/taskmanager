const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'please, enter your name'],
            trim: true
        },
        email: {
            type: String,
            unique: true,
            required: [true, 'please, enter your email'],
            trim: true,
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error('Email is invalid')
                }
            }
        },
        age: {
            type: Number,
            default: 0,
            validate(value) {
                if (value < 0) {
                    throw new Error('Age must be a positive number')
                }
            }
        },
        password: {
            type: String,
            required: [true, 'please, enter your password'],
            trim: true,
            validate(value) {
                if (value.length < 6) {
                    throw new Error('length less than 6')
                }
                if (value.includes('password')) {
                    throw new Error('password shouldnt be included')
                }
            }
        },
        tokens: [{
            token: {
                type: String,
                required: true
            }
        }],
        avatar: {
            type: Buffer
        }
    }, {
        timestamps: true
    })

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

/*
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}
*/

userSchema.methods.generateAuthToken = async function () {
    const user = this
    
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })
    await user.save()
    
    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    
    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error('Unable to login')
    }
    return user
}


userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        console.log('pw modified')
        const salt = await bcrypt.genSalt(8)
        this.password = await bcrypt.hash(this.password, salt)    
    }
    next()
})

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.pre('remove', async function (next) {
    const counts = await this.model('Task').countDocuments({ owner: this._id })
    console.log(counts)
    if (counts != 0) {
        await this.model('Task').findOneAndDelete({ owner: this._id })
    }
    next()
})

const User = mongoose.model('User', userSchema)
module.exports = User