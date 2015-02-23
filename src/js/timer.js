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
		$entry.data('tock-timer-running', true)
			.data('tock-timer-start', Math.ceil(Date.now() / 1000));
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