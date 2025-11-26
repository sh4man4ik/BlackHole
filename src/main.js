const PREFIX = 'localStorage';
const KEY_DATA_PREFIX = `${PREFIX}:data:`;
const KEY_ANNOUNCE = `${PREFIX}:announce:`;

let others = new Map();

const id = crypto.randomUUID();
let myCenter = { centerX: 0, centerY: 0 };

let svg = document.getElementById('stage');
let g = document.getElementById('lines');

function computeMyCenterOnScreen() {
	let screenX = window.screenX;
	let screenY = window.screenY;

	let centerX = screenX + window.outerWidth / 2;
	let centerY = screenY + window.outerHeight / 2;

	return { centerX, centerY };
}

function redrawLines() {
	let screenX = 50;
	let screenY = 50;

	others.forEach((other) => {
		let distanceX = other.centerX - myCenter.centerX;
		let distanceY = other.centerY - myCenter.centerY;

		let x2 = screenX + (distanceX / window.innerWidth) * 100;
		let y2 = screenY + (distanceY / window.innerHeight) * 100;

		let line = other.line;

		if (!other.line) {
			line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			line.setAttribute('class', 'line');
			g.appendChild(line);
			other.line = line;
		}

		line.setAttribute('x1', screenX);
		line.setAttribute('y1', screenY);
		line.setAttribute('x2', x2);
		line.setAttribute('y2', y2);
	});
}

function publishSelf() {
	let payload = JSON.stringify({ id, centerX: myCenter.centerX, centerY: myCenter.centerY });
	localStorage.setItem(KEY_DATA_PREFIX + id, payload);
}

function announceSelf() {
	localStorage.setItem(KEY_ANNOUNCE, id);
	publishSelf();
}

function frame() {
	let newCenter = computeMyCenterOnScreen();

	let moved =
		Math.abs(newCenter.centerX - myCenter.centerX) > 0.1 || Math.abs(newCenter.centerY - myCenter.centerY) > 0.1;

	if (moved) {
		myCenter = newCenter;
		publishSelf();
		redrawLines();
	}

	requestAnimationFrame(frame);
}

function updateOthers(fromId, data) {
	if (fromId === id) {
		return;
	}

	let item = others.get(fromId);

	if (!item) {
		item = { centerX: data.centerX, centerY: data.centerY, line: null };
		others.set(fromId, item);
	} else {
		item.centerX = data.centerX;
		item.centerY = data.centerY;
	}
}

function removeOther(otherId) {
	let item = others.get(otherId);

	if (item) {
		if (item.line) {
			item.line.remove();
		}

		others.delete(otherId);
	}
}

function setinitialOthers() {
	for (let i = 0; i < localStorage.length; i++) {
		let key = localStorage.key(i);

		if (key && key.startsWith(KEY_DATA_PREFIX)) {
			let data = JSON.parse(localStorage.getItem(key));

			if (data && data.id !== id) {
				updateOthers(data.id, data);
			}
		}
	}

	redrawLines();
}

window.addEventListener('resize', redrawLines);

window.addEventListener('beforeunload', () => {
	localStorage.removeItem(KEY_DATA_PREFIX + id);
});

window.addEventListener('storage', (event) => {
	let { key, newValue } = event;

	if (!key) {
		return;
	}

	if (key.startsWith(KEY_DATA_PREFIX)) {
		if (!newValue) {
			let otherId = key.slice(KEY_DATA_PREFIX.length);
			removeOther(otherId);
			redrawLines();
			return;
		}

		let data = JSON.parse(newValue);
		updateOthers(data.id, data);
		redrawLines();
	}
});

myCenter = computeMyCenterOnScreen();
setinitialOthers();
announceSelf();
redrawLines();
requestAnimationFrame(frame);
