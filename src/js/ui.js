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
			if(e.which == 13) {
				$(this).trigger('blur');
			}
		})
		.on('click', '.btn-reset-layout', function (e) {
			// Reset the layout to default
			e.preventDefault();
			tock.ui.resetLayout();
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
		}

		if (v.running) {
			$entry.data('tock-timer-running', v.running);
		}

		tock.ui.addEntry($entry);
	});

};

tock.ui.saveLayout = function () {
	var layout = {
		"entries": []
	};

	$('.entry').each(function() {
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

// Render the timer in current state
tock.ui.updateElapsed = function () {
	$('.entry').each(function() {
		var $entry = $(this);
		if ($entry.data('tock-timer-running') === true) {
			var start = $entry.data('tock-timer-start') / 1000,
				elapsed = Date.now() / 1000,
				diff = Math.ceil(elapsed - start),
				h = Math.floor(diff / (60 * 60)),
				m = Math.floor(diff % (60 * 60) / 60),
				html = '';

			$entry.data('tock-timer-elapsed', diff);

			if (h > 0) {
				html = h + 'H ';
			}

			html = html + m + 'm';
			$entry.find('.elapsed').html(html);
		}
	});
};

// Change the state of the timer button
tock.ui.timerButtonSwap = function (button) {
	var $button = $(button);

	if ($button.hasClass('btn-start-timer')) {
		$button.removeClass('btn-start-timer btn-success')
			.addClass('btn-stop-timer btn-danger')
			.html('STOP');
	}
	else {
		$button.removeClass('btn-stop-timer btn-danger')
			.addClass('btn-start-timer btn-success')
			.html('START');
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