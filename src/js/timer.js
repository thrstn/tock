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
		var $elapsedInput = $entry.find('.elapsed .jira');

		// We have a value in the timer box. Let's use that for the elapsed time
		if ($elapsedInput.val() !== '') {
			$entry.data('tock-timer-elapsed', tock.ui.formatJiraTime($elapsedInput.val()));
		}

		// Generate start time. Set it to now if we have no elapsed time
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

	$entry.data('tock-timer-running', false)
		.data('tock-timer-elapsed', null)
		.data('tock-timer-start', null);

	// Update ui
	$entry.find('.elapsed .jira').val('');
	$entry.find('.elapsed .dp').html('');

	tock.ui.timerButtonSwap($entry.find('.toggle .btn'));
};

tock.timer.tick = function () {
	tock.ui.updateElapsed();

	// Autosave layout every 5 seconds
	if (Math.ceil(Date.now() / 1000) % 5 === 1) {
		tock.ui.saveLayout();
	}
	tock.timer.timeout = setTimeout(tock.timer.tick, 1000);
};
