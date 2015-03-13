// Create objects
tock = window.tock || {};
tock.export = {};

tock.export.toCSV = function () {
	var data = tock.storage.getItem('layout').entries,
		csv = '';

	//loop is to extract each row
	for (var i = 0; i < data.length; i++) {
		var row = "",
			elapsed = data[i].elapsed,
			task = data[i].task,
			log = data[i].log;

		row += '"' + tock.ui.formatTimeJira(elapsed) + '",';
		row += '"' + tock.ui.formatTimeDP(elapsed) + '",';
		row += '"' + task + '",';
		row += '"' + log + '",';

		row.slice(0, row.length - 1);

		//add a line break after each row
		csv += row + '\r\n';
	}

	if (csv === '') {
		alert("Invalid data");
		console.log(csv);
		return;
	}

	//Generate a file name
	var fileName = "export";

	//Initialize file format you want csv or xls
	var uri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);

	// Now the little tricky part.
	// you can use either>> window.open(uri);
	// but this will not work in some browsers
	// or you will not get the correct file extension

	//this trick will generate a temp <a /> tag
	var link = document.createElement("a");
	link.href = uri;

	//set the visibility hidden so it will not effect on your web-layout
	link.style = "visibility:hidden";
	link.download = fileName + ".csv";

	//this part will append the anchor tag and remove it after automatic click
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
};
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
// Create objects
tock = window.tock || {};
tock.timer = {};

// Timer
tock.timer.init = function () {
	tock.timer.timeout = null;
	tock.timer.tick();
};

tock.timer.start = function (button) {
	var $entry = $(button).parents('.entry');

	if ($entry.data('tock-timer-running') === true) {
		tock.timer.stop(button);
	}
	else {
		$entry.data('tock-timer-running', true);
        if ($entry.data('tock-timer-elapsed')) {
            $entry.data('tock-timer-start', Math.ceil((Date.now() / 1000) - $entry.data('tock-timer-elapsed')));
        }
        else {
            $entry.data('tock-timer-start', Math.ceil(Date.now() / 1000));
        }
		tock.ui.timerButtonSwap(button);
	}
};

tock.timer.stop = function (button) {
	var $entry = $(button).parents('.entry');

	if ($entry.data('tock-timer-running') === true) {
		$entry.data('tock-timer-running', false)
			.data('tock-timer-start', null);
		tock.ui.timerButtonSwap(button);
	}
};

tock.timer.reset = function (button) {
	var $entry = $(button).parents('.entry');

	tock.timer.stop(button);
	$entry.data('tock-timer-elapsed', null);
	$entry.data('tock-timer-start', null);
};

tock.timer.tick = function () {
	tock.ui.updateElapsed();

	// Autosave layout every 5 seconds
	if (Math.ceil(Date.now() / 1000) % 5 === 1) {
		tock.ui.saveLayout();
	}
	tock.timer.timeout = setTimeout(tock.timer.tick, 1000);
};
// Create objects
tock = window.tock || {};

tock.generateId = function () {
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (d + Math.random()*16)%16 | 0;
		d = Math.floor(d/16);
		return (c=='x' ? r : (r&0x3|0x8)).toString(16);
	});
	return uuid;
};


// Init everything
tock.init = function () {
	tock.storage.init();
	tock.ui.init();
	tock.timer.init();
};
// Create objects
tock = window.tock || {};
tock.ui = {};

// UI
tock.ui.init = function () {
	tock.ui.bind();
	tock.ui.renderLayout();
};

tock.ui.bind = function () {
	$('body')
		.on('click', '.btn-start-timer', function (e) {
			// Start the timer for selected entry
			e.preventDefault();
			tock.timer.start(this);
		})
		.on('click', '.btn-stop-timer', function (e) {
			// Stop the timer for selected entry
			e.preventDefault();
			tock.timer.stop(this);
		})
		.on('click', '.btn-reset-timer', function (e) {
			// Stop the timer for selected entry
			e.preventDefault();
			tock.timer.reset(this);
		})
		.on('click', '.btn-add-entry', function (e) {
			// Add a new entry to the layout
			e.preventDefault();
			tock.ui.createEntry();
			tock.ui.saveLayout();
		})
		.on('click', '.btn-del-entry', function (e) {
			// Remove selected entry from the layout
			e.preventDefault();
			tock.ui.deleteEntry(this);
			tock.ui.saveLayout();
		})
		.on('focus', 'input[type=text]', function () {
			// Expand the input when focused
			$(this).addClass('focused');
		})
		.on('blur', 'input[type=text]', function () {
			// Shrink the input when blurred
			$(this).removeClass('focused');
			tock.ui.saveLayout();
		})
		.on('keyup', 'input[type=text]', function (e) {
			// Trigger the blur event on input when enter key is pressed
			if (e.which == 13) {
				$(this).trigger('blur');
			}
		})
		.on('click', '.btn-export', function (e) {
			// Reset the layout to default
			e.preventDefault();
			tock.export.toCSV();
		})
		.on('click', '.btn-reset-layout', function (e) {
			// Reset the layout to default
			e.preventDefault();
			tock.ui.resetLayout();
		})
		.on('click', '.btn-reset-timers', function (e) {
			// Reset the timers to zero but keep the layout
			e.preventDefault();
			tock.ui.resetTimers();
		})
	;
};

tock.ui.renderLayout = function () {
	var layout = tock.storage.getItem('layout');

	$(layout.entries).each(function (k, v) {
		var $entry = tock.ui.cloneTemplate()
			.attr('id', v.id);

		$entry.find('.task input').val(v.task);
		$entry.find('.log input').val(v.log);

		if (v.elapsed) {
			$entry.data('tock-timer-elapsed', parseInt(v.elapsed));
			tock.ui.timerButtonSwap($entry.find('.btn-start-timer'));
		}

		if (v.running) {
			$entry.data('tock-timer-running', v.running);
			tock.ui.timerButtonSwap($entry.find('.btn-start-timer'));
		}

		tock.ui.addEntry($entry);
	});

};

tock.ui.saveLayout = function () {
	var layout = {
		"entries": []
	};

	$('.entry').each(function () {
		var $entry = $(this);
		var e = {
			"id": $entry.attr('id'),
			"task": $entry.find('.task input').val(),
			"log": $entry.find('.log input').val(),
			"running": $entry.data('tock-timer-running'),
			"elapsed": $entry.data('tock-timer-elapsed')
		};

		layout.entries.push(e);
	});

	tock.storage.setItem('layout', layout);
};

tock.ui.resetLayout = function () {
	tock.storage.initDefaultLayout();
	tock.ui.refresh();
};

tock.ui.resetTimers = function () {
	$('.entry').each(function () {
		var $entry = $(this);

		$entry.data('tock-timer-start', false);
		$entry.data('tock-timer-elapsed', 0);
	});

	tock.ui.refresh();
};

// Render the timer in current state
tock.ui.updateElapsed = function () {
	$('.entry').each(function () {
		var $entry = $(this),
			start = $entry.data('tock-timer-start'),
			elapsed = $entry.data('tock-timer-elapsed'),
			diff = elapsed;

		if ($entry.data('tock-timer-running') === true) {
			if (start) { // Button was pushed and timer is ticking
				elapsed = Math.ceil(Date.now() / 1000);
				diff = Math.ceil(elapsed - start);
				$entry.data('tock-timer-elapsed', diff);
			}
			else { // Start time is not available but we have elapsed data
				start = Math.ceil(Date.now() / 1000) - elapsed;
				$entry.data('tock-timer-start', start);
			}
		}

		if (diff > 0) {
			$entry.find('.elapsed .jira').html(tock.ui.formatTimeJira(diff));
			$entry.find('.elapsed .dp').html(tock.ui.formatTimeDP(diff));
		}
	});
};

tock.ui.formatTimeJira = function (elapsed) {
	if (elapsed) {
		var h = Math.floor(elapsed / (60 * 60)),
			m = Math.floor(elapsed % (60 * 60) / 60),
			html = '';

		if (h > 0) {
			html = h + 'H ';
		}

		return html + m + 'm';
	}

	return '0m';
};

tock.ui.formatTimeDP = function (elapsed) {
	if (elapsed) {
		return (elapsed / (60 * 60)).toFixed(2);
	}

	return '0.0';
};

// Change the state of the timer button
tock.ui.timerButtonSwap = function (button) {
	var $button = $(button),
		$entry = $button.parents('.entry');

	if ($entry.data('tock-timer-running')) {
		if ($button.hasClass('btn-start-timer')) {
			$button.removeClass('btn-start-timer btn-success btn-warning')
				.addClass('btn-stop-timer btn-danger')
				.html('<span class="fa-stack"><i class="fa fa-cog fa-spin fa-stack-2x"></i><i class="fa fa-pause fa-stack-1x"></i></span>');
		}
		else {
			$button.removeClass('btn-stop-timer btn-danger')
				.addClass('btn-start-timer btn-success')
				.html('<span class="fa-stack"><i class="fa fa-cog fa-stack-2x"></i><i class="fa fa-play fa-stack-1x"></i></span>');
		}
	}
	else if ($entry.data('tock-timer-elapsed')) {
		$button.removeClass('btn-stop-timer btn-danger')
			.addClass('btn-start-timer btn-warning')
			.html('<span class="fa-stack"><i class="fa fa-cog fa-stack-2x"></i><i class="fa fa-play fa-stack-1x"></i></span>');
	}
};


tock.ui.cloneTemplate = function () {
	return tock.ui.getTemplateEntry()
		.clone()
		.removeClass('template hidden')
		.addClass('entry');
};

tock.ui.createEntry = function () {
	tock.ui.addEntry(tock.ui.cloneTemplate());
};

tock.ui.addEntry = function (entry) {
	$('.controls', 'main')
		.before(entry);
};

tock.ui.deleteEntry = function (element) {
	var $entry = $(element)
		.parents('.entry');
	$entry.remove();
};

tock.ui.getTemplateEntry = function () {
	return $('.template');
};

tock.ui.refresh = function () {
	window.location = '';
};