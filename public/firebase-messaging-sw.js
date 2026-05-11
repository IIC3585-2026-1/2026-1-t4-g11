importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyBMavfylJn_RlHxBs1WOfhWa7MYypg4OTc",
  authDomain: "carbon-d1f5e.firebaseapp.com",
  projectId: "carbon-d1f5e",
  storageBucket: "carbon-d1f5e.firebasestorage.app",
  messagingSenderId: "241152337603",
  appId: "1:241152337603:web:44bdb58ea8d165f8962476",
});
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Mensaje recibido en background:", payload);

  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/carbon.svg",
  });
});
