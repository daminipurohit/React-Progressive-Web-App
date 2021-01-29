const CACHE_NAME = 'react-pwa-cache-verson-1';
const urlsToCache = ['/','/index.html', '/analysis.png', '/envconfig.js', '/manifest.json'];

//install event is used to open cache and cache the files
self.addEventListener('install', event => {
  //on page refreshes let new versions of sw become active
              /*Skip waiting is necessary because we want the service worker
             to be active and controlling the clients now, 
             without waiting for them to be reloaded */
   self.skipWaiting();
    //open cache and add cache resources to it and wait till this is done
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            //cache opened
            return cache.addAll(urlsToCache);
        })
    );
})

// fetch event is used to tell SW what to do with cached files
// check for every call if its from cached list then make new request if failed
// take from cache
function fetchCall(event){
  const {request: {url}} = event;
  if(url.includes('github')){
    //its api call
    return fetch(event.request)
    .then(response => {
      if(response.status === 200){
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, response.clone());
          return response;
        })
      }
      return response;
    })
      .catch(() => {
        throw new Error('Failed to get resource')
      })
  } else {
    return fetch(event.request)
  }
}
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
     return cache.match(event.request).then(response => {
      return response || fetchCall(event);
      })
    }))})

// saveSubscription saves the subscription to the backend
const saveSubscription = async subscription => {
    const SERVER_URL = 'http://localhost:4000/save-subscription'
    try{
        const response = await fetch(SERVER_URL, {
            method: 'post',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscription),
          })
          return response.json()
    } catch(err) {
        throw new Error(err.message)
    }
  }

// urlB64ToUint8Array is a magic function that will encode the base64 public key
// to Array buffer which is needed by the subscription option
const urlB64ToUint8Array = base64String => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

// Activate SW
self.addEventListener('activate', async () => {
    // This will be called only once when the service worker is activated.

    //To listen/subscribe to remote push messages we need the browser web app to register to the push service.
    try {
        const PUBLIC_KEY = 'BFCOe4HsK8uEdJtwfFjJs6Y0CXjwZKplere7WD8_HRVnZfXRN1mppuBz_xLv9b6e3bOUiRtC6GJiMaKM7HBfJZw';
        const applicationServerKey = urlB64ToUint8Array(PUBLIC_KEY)
        const options = {applicationServerKey, userVisibleOnly: true}
        const subscription = await self.registration.pushManager.subscribe(options)
        const response = await saveSubscription(subscription)
      } catch (err) {
        throw new Error(err.message)
      }
  })

  function useFallback(showFallback) {
     //check fallback
     if(showFallback){
       return {status: 500}
     }
     //show offline content for new pages without network
    // return caches.open(CACHE_NAME).then(function (cache) {
    //   return cache.match('/offline.html')
    // });
  }

/*
Next step is to save subscription at the backend and then use the subscription to send push messages to the frontend app via the push service.
 But before that, we will also need to listen to the push event from the backend on our frontend app.
 */
  self.addEventListener('push', function(event) {
    if (event.data) {
      showLocalNotification("hellos", event.data.text(),  self.registration);
    } else {
      //Push event without data
    }
  })

  const showLocalNotification = (title, body, swRegistration) => {
    const options = {
      body
      // here you can add more properties like icon, image, vibrate, etc.
    };
    swRegistration.showNotification(title, options);
  };