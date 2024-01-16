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

	setInterval(interval) {
		this.interval = interval;
	}

	setInit(min, sec) {
		this.initMin = min;
		this.initSec = sec;
	}

	setMin(val, man) {
		this.min = Number(val) || 0;
		if (this.cb) {
			this.cb(this.min, this.sec, man);
		}
	}

	setSec(val, man) {
		this.sec = Number(val) || 0;
		if (this.cb) {
			this.cb(this.min, this.sec, man);
		}
	}

	start() {
		this.initMin = this.min;
		this.initSec = this.sec;

		const self = this;
		this.timer = setInterval(function() {
			if (self.min == 0 && self.sec == 0) {
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
		console.log(this.interval)
		if (this.timer != null) {
			return;
		}

		if (this.sec + this.interval >= 60) {
			this.setSec(this.sec + this.interval - 60, true);
			this.setMin(Number(this.min) + 1, true);
		} else {
			this.setSec(Number(this.sec) + this.interval, true);
		}
	}

	decrement() {
		console.log(this.interval)
		if (this.timer != null) {
			return;
		}

		if (this.min <= 0 && this.sec - this.interval <= 0) {
			this.setMin(0, true);
			this.setSec(0, true);
			return;
		}

		const diff = this.sec - this.interval;
		if (diff == 0) {
			this.setSec(0, true);
		} else if (diff <= 0) {
			this.setSec(diff + 60, true);
			this.setMin(Number(this.min) - 1, true);
		} else {
			this.setSec(Number(this.sec) - this.interval, true);
		}

		if (this.minVal <= 0) {
			this.minVal = 0
		}
	}
}

(function() {
	try {
		const timerStr = localStorage.getItem('timer');
		if (!timerStr) {
			setLocal([0, 0], [0, 0]);
		}

		const timer = JSON.parse(localStorage.getItem('timer'));
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
	const mute = document.getElementById('mute');
	const autoplay = document.getElementById('autoplay');
	const interval = document.getElementById('interval');
	const notification = document.getElementById('notification');

	const workDiv = document.getElementById('work');
	const workMin = document.getElementById('work-minute');
	const workSec = document.getElementById('work-second');
	const workInc = document.getElementById('work-inc');
	const workDec = document.getElementById('work-dec');
	let work = createWork();

	const restDiv = document.getElementById('rest');
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
			Number(interval.value),
		);
	}

	function createRest() {
		return new Timer(
			restMin.getAttribute('data-time'),
			restSec.getAttribute('data-time'),
			updateRest,
			ended,
			Number(interval.value),
		);
	}

	function setLocal(work, rest) {
		localStorage.setItem('timer', JSON.stringify({
			work: work.join(':'),
			rest: rest.join(':'),
		}));
	}

	start.addEventListener('click', function() {
		start.disabled = true;
		cancel.disabled = false;
		mute.disabled = false;

		work.setInit(workMin.getAttribute('data-time'), workSec.getAttribute('data-time'));
		rest.setInit(restMin.getAttribute('data-time'), restSec.getAttribute('data-time'));

		rounds = 1;
		document.getElementById('rounds').setAttribute('data-rounds', rounds);
		running = true;

		if (working) {
			work.start();
		} else {
			rest.start();
		}
	});

	cancel.addEventListener('click', function() {
		start.disabled = false;
		cancel.disabled = true;
		mute.disabled = true;

		running = false;

		work.stop();
		rest.stop();
		notification.pause();
	});

	mute.addEventListener('click', function() {
		notification.pause();
	});

	interval.addEventListener('change', function(e) {
		work.setInterval(Number(e.target.value));
		rest.setInterval(Number(e.target.value));
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

	function updateWork(min, sec, man) {
		workMin.setAttribute('data-time', format(min));
		workSec.setAttribute('data-time', format(sec));
		if (man) {
			setLocal(
				[min, sec],
				[restMin.getAttribute('data-time'), restSec.getAttribute('data-time')],
			);
		}
	}

	function updateRest(min, sec, man) {
		restMin.setAttribute('data-time', format(min));
		restSec.setAttribute('data-time', format(sec));
		if (man) {
			setLocal(
				[workMin.getAttribute('data-time'), workSec.getAttribute('data-time')],
				[min, sec],
			);
		}
	}

	function ended() {
		notification.play();
		if (autoplay.checked) {
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
		} else {
			notification.loop = true;
			confirm(`${working ? 'Work' : 'Rest'} timer ended.`);
			notification.pause();

			start.disabled = !start.disabled;
			cancel.disabled = !cancel.disabled;
			mute.disabled = !mute.disabled;
		}

		toggleWorking();
	}

	function toggleWorking(val = null) {
		working = val || !working;
		if (working) {
			workDiv.classList.add('active');
			restDiv.classList.remove('active');
		} else {
			workDiv.classList.remove('active');
			restDiv.classList.add('active');
		}
	}

	function format(num) {
		return '00'.slice(num.toString().length) + num;
	}
})()
