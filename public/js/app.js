console.log('Client side javascript file is loaded')



const weatherForm = document.querySelector('#weather-form')
const search = document.querySelector('#weather-search')
const messageOne = document.querySelector('#message-1')
const messageTwo = document.querySelector('#message-2')

weatherForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const location = search.value
    messageOne.textContent = 'Loading...'
    messageOne.style.visibility = 'visible'
    
    fetch('/weather?address='+ location).then((response) => {
        response.json().then((weatherData) => {
            if(weatherData.error) {
                messageOne.textContent = weatherData.error
            } else{
                
                const {location = weatherData.location, description, temperature, feelslike} = weatherData.data
                messageOne.textContent = "location: " + location
                messageTwo.textContent = "Now the weather is \"" + description + "\", and the temperature is " + temperature + "°C. To me, it actually feels like " + feelslike + "°C !!"
                messageTwo.style.visibility = "visible"
                
            }
        })
    })
})