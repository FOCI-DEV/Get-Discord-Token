// ==UserScript==
// @name         Get Discord Token
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Allows you to retrieve your user token for reference.
// @author       F.O.C.I.#0001
// @match        https://discordapp.com/activ*
// @match        https://discordapp.com/channel*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
   'use strict';

   // implement localStorage behavior using cookie
   //---------------------------------------------
   if(!window.localStorage) {
      Object.defineProperty(window, "localStorage", new(function () {
         var aKeys = [],
            oStorage = {};
         Object.defineProperty(oStorage, "getItem", {
            value: function (sKey) {
               return this[sKey] ? this[sKey] : null;
            },
            writable: false,
            configurable: false,
            enumerable: false
         });
         Object.defineProperty(oStorage, "key", {
            value: function (nKeyId) {
               return aKeys[nKeyId];
            },
            writable: false,
            configurable: false,
            enumerable: false
         });
         Object.defineProperty(oStorage, "setItem", {
            value: function (sKey, sValue) {
               if(!sKey) {
                  return;
               }
               document.cookie = escape(sKey) + "=" + escape(sValue) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
            },
            writable: false,
            configurable: false,
            enumerable: false
         });
         Object.defineProperty(oStorage, "length", {
            get: function () {
               return aKeys.length;
            },
            configurable: false,
            enumerable: false
         });
         Object.defineProperty(oStorage, "removeItem", {
            value: function (sKey) {
               if(!sKey) {
                  return;
               }
               document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
            },
            writable: false,
            configurable: false,
            enumerable: false
         });
         Object.defineProperty(oStorage, "clear", {
            value: function () {
               if(!aKeys.length) {
                  return;
               }
               for(var sKey in aKeys) {
                  document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
               }
            },
            writable: false,
            configurable: false,
            enumerable: false
         });
         this.get = function () {
            var iThisIndx;
            for(var sKey in oStorage) {
               iThisIndx = aKeys.indexOf(sKey);
               if(iThisIndx === -1) {
                  oStorage.setItem(sKey, oStorage[sKey]);
               } else {
                  aKeys.splice(iThisIndx, 1);
               }
               delete oStorage[sKey];
            }
            for(aKeys; aKeys.length > 0; aKeys.splice(0, 1)) {
               oStorage.removeItem(aKeys[0]);
            }
            for(var aCouple, iKey, nIdx = 0, aCouples = document.cookie.split(/\s*;\s*/); nIdx < aCouples.length; nIdx++) {
               aCouple = aCouples[nIdx].split(/\s*=\s*/);
               if(aCouple.length > 1) {
                  oStorage[iKey = unescape(aCouple[0])] = unescape(aCouple[1]);
                  aKeys.push(iKey);
               }
            }
            return oStorage;
         };
         this.configurable = false;
         this.enumerable = true;
      })());
   }
   //---------------------------------------------------

   var userToken = localStorage.getItem('token');

   var warn = "Allowing anyone to see your token can result in them gaining access to your account. This can lead to impersonation, server bans, account closure, etc.\n\n\n\n If you do not understand this, press 'Cancel'."

   // show warning, if accepted show token
   document.addEventListener('readystatechange', event => {
      if(event.target.readyState === "interactive") {} else if(event.target.readyState === "complete") {
         setTimeout(function () {
            if(confirm(warn)) {
               prompt("Your token:", userToken)
            }
         }, 3000);
      }
   });

   // prevent pasting token into discord
   document.addEventListener('paste', function (e) {
      if(e.clipboardData.getData('text/plain') == userToken) {
         // clear clipboard
         e.clipboardData.setData('text/plain', 'do not post your token here');
         // prevent the default paste action
         e.preventDefault();
         // prevent pasting token, paste warning instead
         var pasteToken = new ClipboardEvent('paste');
         pasteToken.clipboardData.items.add('do not post your token here', 'text/plain');
         document.dispatchEvent(pasteToken);
         // put token back into clipboard to allow pasting outside discord
         e.clipboardData.setData('text/plain', userToken);
      }
   });
