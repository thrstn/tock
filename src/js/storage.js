// Create objects
tock = window.tock || {};
tock.storage = {};

// Storage
tock.storage.init = function () {
	if (!tock.storage.getItem('layout')) {
		tock.storage.initDefaultLayout();
	}
};

// Set item value in localStorage
tock.storage.setItem = function (key, value) {
	if (typeof value === 'object') {
		value = JSON.stringify(value);
	}

	return localStorage.setItem(key, value);
};

// Get item value from localStorage
tock.storage.getItem = function (key) {
	var value = localStorage.getItem(key);

	try {
		value = JSON.parse(value);
	} catch (e) {
		// We don't need to do anything. The value is not JSON.
	}

	return value;
};

tock.storage.initDefaultLayout = function () {
	var layout = {
		"entries": [
			{
				"id": tock.generateId(),
				"task": "All day",
				"log": "You start this timer when you start working and leave it running all day.",
				"running": false,
				"elapsed": 0
			},
			{
				"id": tock.generateId(),
				"task": 'Launch',
				"log": "Start when you grab some launch.",
				"running": false,
				"elapsed": 0
			},
			{
				"id": tock.generateId(),
				"task": 'Other',
				"log": "Something else.",
				"running": false,
				"elapsed": 0
			}
		]
	};

	tock.storage.setItem('layout', layout);
};