"use strict";

// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
var functions = require('firebase-functions'); // The Firebase Admin SDK to access Cloud Firestore.


var admin = require('firebase-admin');

admin.initializeApp(); // Take the text parameter passed to this HTTP endpoint and insert it into
// Cloud Firestore under the path /messages/:documentId/original

exports.addMessage = functions.https.onRequest(function _callee(req, res) {
  var original, writeResult;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          // Grab the text parameter.
          original = req.query.text; // Push the new message into Cloud Firestore using the Firebase Admin SDK.

          _context.next = 3;
          return regeneratorRuntime.awrap(admin.firestore().collection('messages').add({
            original: original
          }));

        case 3:
          writeResult = _context.sent;
          // Send back a message that we've succesfully written the message
          res.json({
            result: "Message with ID: ".concat(writeResult.id, " added.")
          });

        case 5:
        case "end":
          return _context.stop();
      }
    }
  });
}); // Listens for new messages added to /messages/:documentId/original and creates an
// uppercase version of the message to /messages/:documentId/uppercase

exports.makeUppercase = functions.firestore.document('/messages/{documentId}').onCreate(function (snap, context) {
  // Grab the current value of what was written to Cloud Firestore.
  var original = snap.data().original; // Access the parameter `{documentId}` with `context.params`

  functions.logger.log('Uppercasing', context.params.documentId, original);
  var uppercase = original.toUpperCase(); // You must return a Promise when performing asynchronous tasks inside a Functions such as
  // writing to Cloud Firestore.
  // Setting an 'uppercase' field in Cloud Firestore document returns a Promise.

  return snap.ref.set({
    uppercase: uppercase
  }, {
    merge: true
  });
});