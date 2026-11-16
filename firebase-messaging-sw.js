/* Firebase Cloud Messaging service worker — site ke ROOT me rakhna (index.html ke saath) */
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyD_owCUWXbbpPSuFfgssuqVJsfr6l7Ds_w",
  authDomain: "smart-store-72f69.firebaseapp.com",
  databaseURL: "https://smart-store-72f69-default-rtdb.firebaseio.com",
  projectId: "smart-store-72f69",
  storageBucket: "smart-store-72f69.firebasestorage.app",
  messagingSenderId: "781725187123",
  appId: "1:781725187123:web:6a09febd0177210df17746"
});

var messaging = firebase.messaging();

// Console se "notification" payload bheja ho to FCM khud dikha deta hai.
// Sirf "data" payload ho tabhi yahan manually dikhate hain (duplicate se bachne ke liye).
messaging.onBackgroundMessage(function(payload){
  if (payload.notification) return;
  var d = payload.data || {};
  self.registration.showNotification(d.title || 'PremiumCourses', {
    body: d.body || '',
    icon: d.icon || 'https://iili.io/Cgpi26J.webp',
    data: { link: d.link || '/' }
  });
});

self.addEventListener('notificationclick', function(event){
  event.notification.close();
  var d = event.notification.data || {};
  var fcm = d.FCM_MSG && d.FCM_MSG.notification && d.FCM_MSG.notification.click_action;
  var link = d.link || fcm || (d.FCM_MSG && d.FCM_MSG.data && d.FCM_MSG.data.link) || '/';
