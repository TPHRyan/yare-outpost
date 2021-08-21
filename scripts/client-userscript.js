// ==UserScript==
// @name         Test Outpost
// @namespace    http://paroz.io/
// @version      0.1
// @description  test extension for outpost for yare.io
// @author       TPHRyan
// @match        https://yare.io/*
// @grant        none
// ==/UserScript==

(function () {
	"use strict";

	const webSocket = new WebSocket("ws://localhost:8083");
	webSocket.addEventListener("message", function (event) {
		console.log("Message from server: ", event.data);
	});
})();
