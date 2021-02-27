const express = require('express') 
const cors = require('cors') 
const bodyParser = require('body-parser')
const webpush = require('web-push') //requiring the web-push module

const app = express() 
app.use(cors()) 
app.use(bodyParser.json()) 
const port = 4000 
app.get('/', (req, res) => res.send('Hello World!')) 

/*
Saving subscription on the backend: 
Let’s create our save-subscription endpoint on the express server.
 All we need to do is retrieve the subscription from frontend and stored it
  somewhere safely in the backend. 
  We will need this subscription later to send push messages to the user’s browser.
*/
const dummyDb = { subscription: null } //dummy in memory store
const saveToDatabase = async subscription => {
  // Since this is a demo app, I am going to save this in a dummy in memory store. Do not do this in your apps.
  // Here you should be writing your db logic to save it.
  dummyDb.subscription = subscription
}

// The new /save-subscription endpoint
app.post('/save-subscription', async (req, res) => {
    const subscription = req.body
    await saveToDatabase(subscription) //Method to save the subscription to Database
    res.json({ message: 'success' })
  })

// push message to frontend
const vapidKeys = {
    publicKey:
      'your-public-key',
    privateKey: 'your-private-key'
  }

  //setting our previously generated VAPID keys
  webpush.setVapidDetails(
    'mailto:your@email.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  )

  //function to send the notification to the subscribed device
const sendNotification = (subscription, dataToSend='') => {
    webpush.sendNotification(subscription, dataToSend)
  }

  //route to test send notification
app.get('/send-notification', (req, res) => {
    const subscription = dummyDb.subscription //get subscription from your databse here.
    const message = 'Hello World'
    sendNotification(subscription, message)
    res.json({ message: 'message sent' })
  })

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
