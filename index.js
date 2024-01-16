class Timer {
	constructor(min, sec, cb, ended, interval) {
		this.min = Number(min) || 0;
		this.sec = Number(sec) || 0;
		this.initMin = this.min;
		this.initSec = this.sec;
		this.interval = Number(interval) || 15;
		this.timer = null;
		this.cb = cb;
		this.ended = ended;
	}

	get running() {
		return this.timer == null;
	}

	setMin(val) {
		this.min = Number(val) || 0;
		if (this.cb) {
			this.cb(this.min, this.sec);
		}
	}

	setSec(val) {
		this.sec = Number(val) || 0;
		if (this.cb) {
			this.cb(this.min, this.sec);
		}
	}

	start() {
		this.initMin = this.min;
		this.initSec = this.sec;

		const self = this;
		this.timer = setInterval(function() {
			if (self.min == 0 && self.sec == 0 ) {
				return self.stop();
			}

			if (self.sec == 0) {
				self.setSec(59);
				self.setMin(self.min - 1);
			} else {
				self.setSec(self.sec - 1);
			}
		}, 1000);
	}

	stop() {
		if (this.timer != null) {
			clearInterval(this.timer);
		}

		this.timer = null
		this.setMin(this.initMin);
		this.setSec(this.initSec);
		if (this.ended) {
			this.ended();
		}
	}

	increment() {
		if (this.timer != null) {
			return;
		}

		if (this.sec + this.interval >= 60) {
			this.setSec(this.sec + this.interval - 60);
			this.setMin(Number(this.min) + 1);
		} else {
			this.setSec(Number(this.sec) + this.interval);
		}
	}

	decrement() {
		if (this.timer != null) {
			return;
		}

		if (this.min <= 0 && this.sec - this.interval <= 0) {
			this.setMin(0);
			this.setSec(0);
			return;
		}

		if (this.sec - this.interval <= 0) {
			this.setSec(this.sec - this.interval + 60);
			this.setMin(Number(this.min) - 1);
		} else {
			this.setSec(Number(this.sec) - this.interval);
		}

		if (this.minVal <= 0) {
			this.minVal = 0
		}
	}
}

(function() {
	try {
		const timer = JSON.parse(localStorage.getItem('timer') || '{}');

		const [wkMin, wkSec] = timer.work.split(':');
		const [rtMin, rtSec] = timer.rest.split(':');

		document.getElementById('work-minute').setAttribute('data-time', format(Number(wkMin)));
		document.getElementById('work-second').setAttribute('data-time', format(Number(wkSec)));
		document.getElementById('rest-minute').setAttribute('data-time', format(Number(rtMin)));
		document.getElementById('rest-second').setAttribute('data-time', format(Number(rtSec)));
	} catch { }

	console.log("loaded");

	let running = false;
	let working = true;
	let rounds = 0;

	const start = document.getElementById('start');
	const cancel = document.getElementById('cancel');

	const workMin = document.getElementById('work-minute');
	const workSec = document.getElementById('work-second');
	const workInc = document.getElementById('work-inc');
	const workDec = document.getElementById('work-dec');
	let work = createWork();

	const restMin = document.getElementById('rest-minute');
	const restSec = document.getElementById('rest-second');
	const restInc = document.getElementById('rest-inc');
	const restDec = document.getElementById('rest-dec');
	let rest = createRest();

	function createWork() {
		return new Timer(
			workMin.getAttribute('data-time'),
			workSec.getAttribute('data-time'),
			updateWork,
			ended,
		);
	}

	function createRest() {
		return new Timer(
			restMin.getAttribute('data-time'),
			restSec.getAttribute('data-time'),
			updateRest,
			ended,
		);
	}


	start.addEventListener('click', function() {
		start.disabled = true;
		cancel.disabled = false;

		work = createWork();
		rest = createRest();

		rounds = 1;
		document.getElementById('rounds').setAttribute('data-rounds', rounds);
		running = true;

		localStorage.setItem('timer', JSON.stringify({
			work: `${workMin.getAttribute('data-time')}:${workSec.getAttribute('data-time')}`,
			rest: `${restMin.getAttribute('data-time')}:${restSec.getAttribute('data-time')}`,
		}));

		work.start();
	});

	cancel.addEventListener('click', function() {
		start.disabled = false;
		cancel.disabled = true;

		working = true;
		running = false;

		work.stop();
		rest.stop();
	});

	workInc.addEventListener('click', function() {
		work.increment();
	});

	workDec.addEventListener('click', function() {
		work.decrement();
	});

	restInc.addEventListener('click', function() {
		rest.increment();
	});

	restDec.addEventListener('click', function() {
		rest.decrement();
	});

	function updateWork(min, sec) {
		workMin.setAttribute('data-time', format(min));
		workSec.setAttribute('data-time', format(sec));
	}

	function updateRest(min, sec) {
		restMin.setAttribute('data-time', format(min));
		restSec.setAttribute('data-time', format(sec));
	}

	function ended() {
		if (!running) {
			return;
		}

		if (working) {
			rest.start();
		} else {
			work.start();
			rounds += 1;
			document.getElementById('rounds').setAttribute('data-rounds', rounds);
		}

		working = !working;
	}

	function format(num) {
		return '00'.slice(num.toString().length) + num;
	}
})()
