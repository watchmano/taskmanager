const express = require('express')
const router = new express.Router()
const geocode = require('../utils/geocode.js')
const forecast = require('../utils/forecast.js')

router.get('/weather', (req, res) => {
    if(!req.query.address){
        return res.send({
            error: 'You must provide an address'
        })
    }

    geocode(req.query.address, (error, {latitude, longitude, location} = {}) => {
        if(error){
            return res.send({
                error: error
            })   
        }
        
        
        forecast(latitude, longitude, (error, data) => {
            if(error){
                return res.send({
                    error: error
                })
            }
            res.send({
                latitude: latitude,
                longitude: longitude,
                location: location,
                data: data
            })
          })
    })
})

module.exports = router