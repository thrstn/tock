// Create objects
tock = window.tock || {};
tock.ui = {};

// UI
tock.ui.init = function() {
	tock.ui.bind();
	tock.ui.renderLayout();
};

tock.ui.bind = function() {
	$('body')
		.on('click', '.btn-start-timer', function(e) {
			// Start the timer for selected entry
			e.preventDefault();
			tock.timer.start(this);
		})
		.on('click', '.btn-stop-timer', function(e) {
			// Stop the timer for selected entry
			e.preventDefault();
			tock.timer.stop(this);
		})
		.on('click', '.btn-reset-timer', function(e) {
			// Stop the timer for selected entry
			e.preventDefault();
			tock.timer.reset(this);
		})
		.on('click', '.btn-add-entry', function(e) {
			// Add a new entry to the layout
			e.preventDefault();
			tock.ui.createEntry();
			tock.ui.saveLayout();
		})
		.on('click', '.btn-del-entry', function(e) {
			// Remove selected entry from the layout
			e.preventDefault();
			tock.ui.deleteEntry(this);
			tock.ui.saveLayout();
		})
		.on('focus', 'input[type=text]', function() {
			// Expand the input when focused
			$(this).addClass('focused');
		})
		.on('blur', 'input[type=text]', function() {
			// Shrink the input when blurred
			$(this).removeClass('focused');
			tock.ui.saveLayout();
		})
		.on('keyup', 'input[type=text]', function(e) {
			// Trigger the blur event on input when enter or escape key is pressed
			if (e.which == 13 || e.which == 27) {
				$(this).trigger('blur');
			}
		})
		.on('click', '.btn-export', function(e) {
			// Reset the layout to default
			e.preventDefault();
			tock.export.toCSV();
		})
		.on('click', '.btn-reset-layout', function(e) {
			// Reset the layout to default
			e.preventDefault();
			tock.ui.resetLayout();
		})
		.on('click', '.btn-reset-timers', function(e) {
			// Reset the timers to zero but keep the layout
			e.preventDefault();
			tock.ui.resetTimers();
		})
	;
};

tock.ui.renderLayout = function() {
	var layout = tock.storage.getItem('layout');

	$(layout.entries).each(function(k, v) {
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

tock.ui.saveLayout = function() {
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

tock.ui.resetLayout = function() {
	tock.storage.initDefaultLayout();
	tock.ui.refresh();
};

tock.ui.resetTimers = function() {
	$('.btn-reset-timer').each(function() {
		tock.timer.reset(this);
	});
};

// Render the timer in current state
tock.ui.updateElapsed = function() {
	$('.entry').each(function() {
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
		else {
			$entry.find('.elapsed .jira').html('');
			$entry.find('.elapsed .dp').html('');
		}
	});
};

tock.ui.formatTimeJira = function(elapsed) {
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

tock.ui.formatTimeDP = function(elapsed) {
	if (elapsed) {
		return (elapsed / (60 * 60)).toFixed(2);
	}

	return '0.0';
};

// Change the state of the timer button
tock.ui.timerButtonSwap = function(button) {
	var $button = $(button),
		$entry = $button.parents('.entry');

	if ($entry.data('tock-timer-running')) {
		if ($button.hasClass('btn-start-timer')) {
			$button.removeClass('btn-start-timer btn-success btn-warning')
				.addClass('btn-stop-timer btn-danger')
				.attr('title', 'Pause this timer')
				.html('<span class="fa-stack"><i class="fa fa-cog fa-spin fa-stack-2x"></i><i class="fa fa-pause fa-stack-1x"></i></span>');
		}
		else {
			$button.removeClass('btn-stop-timer btn-danger')
				.addClass('btn-start-timer btn-success')
				.attr('title', 'Start this timer')
				.html('<span class="fa-stack"><i class="fa fa-cog fa-stack-2x"></i><i class="fa fa-play fa-stack-1x"></i></span>');
		}
	}
	else if ($entry.data('tock-timer-elapsed')) {
		$button.removeClass('btn-stop-timer btn-danger')
			.addClass('btn-start-timer btn-warning')
			.attr('title', 'Start this timer')
			.html('<span class="fa-stack"><i class="fa fa-cog fa-stack-2x"></i><i class="fa fa-play fa-stack-1x"></i></span>');
	}
	else {
		$button.removeClass('btn-stop-timer btn-danger')
			.addClass('btn-start-timer btn-success')
			.attr('title', 'Start this timer')
			.html('<span class="fa-stack"><i class="fa fa-cog fa-stack-2x"></i><i class="fa fa-play fa-stack-1x"></i></span>');
	}
};


tock.ui.cloneTemplate = function() {
	return tock.ui.getTemplateEntry()
		.clone()
		.removeClass('template hidden')
		.addClass('entry');
};

tock.ui.createEntry = function() {
	tock.ui.addEntry(tock.ui.cloneTemplate());
};

tock.ui.addEntry = function(entry) {
	$('.controls', 'main')
		.before(entry);
};

tock.ui.deleteEntry = function(element) {
	var $entry = $(element)
		.parents('.entry');
	$entry.remove();
};

tock.ui.getTemplateEntry = function() {
	return $('.template');
};

tock.ui.refresh = function() {
	window.location = '';
};
