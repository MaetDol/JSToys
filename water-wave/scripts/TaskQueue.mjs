class Task {
	constructor({ job, args, delay }) {
		this.props = { job, args, delay };
	}

	do() {
		const { job, args } = this.props;
		job.apply(null, args);
	}

	get delay() {
		return this.props.delay;
	}
	set delay(d) {
		this.props.delay = d;
	}
}

class TaskQueue {
	constructor() {
		this.queue = [];
		this.paused = false;
		this.running = false;

		document.addEventListener('visibilitychange', () => {
			if (!document.hidden && this.running) this.consume();
			else if (this.running) this.pause();
		});
	}

	add(task) {
		this.queue.push(task);
	}

	consume() {
		this.running = true;
		this.stop = false;

		this.loop();
	}

	loop() {
		const task = this.queue.shift();
		this.last = {
			task,
			start: new Date(),
			id: setTimeout(() => {
				task.do();
				if (!this.queue.length) {
					this.running = false;
					return;
				}
				this.loop();
			}, task.delay),
		};
	}

	pause() {
		if (!this.running) return;

		this.paused = true;
		const { task, start, id } = this.last;
		task.delay -= new Date() - start;
		this.queue.unshift(task);

		this.last = {};
		clearTimeout(id);
	}

	flush() {
		if (this.running) this.pause();

		this.running = false;
		this.paused = false;
		this.last = {};
		this.queue = [];
	}
}

export default TaskQueue;
export { Task };
