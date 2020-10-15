const fs = require('fs')
const request = require('postman-request')

const forecast  = (a, b, callback) => {
    const url = "http://api.weatherstack.com/current?access_key=" + process.env.WEATHERSTACK_API_KEY + "&units=s&query=" + a + "," + b + "&units=m"
    
    
    

    //key 값 이름 바꾸지 말자. url 외의 다른 이름 넣어주면 작동 안됨.
    request({url, json: true}, (error, {body}) => {
        
        if(error){
            callback("Unable to connect to weather service", undefined)
            
        } else if(body.error){
            callback("Unable to find location", undefined)
        } else{
            const data2 = {
                description: body.current.weather_descriptions[0],
                temperature: body.current.temperature,
                feelslike: body.current.feelslike
            }
            callback(undefined, data2)
        }
    })
}

module.exports = forecast