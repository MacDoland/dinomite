'use strict';

class EventDispatcher {
	constructor() {
		this._events = [];
	}

	addEvent(eventName) {
		if (typeof (this._events[eventName]) === 'undefined') {
			this._events[eventName] = [];
		}
	}

	clearEvent(eventName) {
		this._events[eventName] = [];
	}

	reset() {
		this._events = [];
	}

	registerHandler(eventName, handler) {
		this.addEvent(eventName);
		this._events[eventName].push(handler);
	}

	deregisterHandler(eventName, handler) {
		if(!Object.keys(this._events).includes(eventName)){
			return;
		}

		let index = this._events[eventName].indexOf(handler);

		if (index !== -1){
			this._events[eventName].splice(index, 1);
		}
	}

	dispatch(eventName, arg) {
		if (typeof (this._events[eventName]) !== "undefined") {

			for (let index = 0; index < this._events[eventName].length; index++) {
				this._events[eventName][index](arg);
			}
		}
	}
}

export default EventDispatcher;

