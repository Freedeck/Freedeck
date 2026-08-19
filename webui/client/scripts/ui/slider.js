/**
 * Create a "slider" Tile.
 * @param {Tile} data Freedeck Button Config
 * @param {DisplayedTile} keyObject Key Object
 * @param {RawTile} raw Raw Interaction Config
 */
export default function (data, keyObject, raw) {
	const sliderContainer = document.createElement("div");
	sliderContainer.classList.add("slider-container");
	sliderContainer.dataset.value = data.data.value;
	keyObject.appendChild(sliderContainer);

	const sliderTitle = document.createElement("div");
	sliderTitle.classList.add("slider-title");
	sliderTitle.innerText = Object.keys(raw)[0];
	sliderContainer.appendChild(sliderTitle);

	const sliderThumb = document.createElement("div");
	sliderThumb.classList.add("slider-thumb");
	sliderThumb.classList.add("context-aware");
	sliderContainer.appendChild(sliderThumb);

	const sliderPercentage = document.createElement("div");
	sliderPercentage.classList.add("slider-percentage");
	sliderPercentage.innerText = `${data.data.value}${data.data.format ? data.data.format : "%"}`;
	sliderContainer.appendChild(sliderPercentage);

	sliderThumb.oncontextmenu = (e) => {
		sliderThumb.parentElement.parentElement.oncontextmenu(e);
	};

	const index = data.position;
	const row = Math.floor((index - 1) / 5);
	const col = (index - 1) % 5;
	const top = `${row * 33}%`;
	const left = `${col * 20}%`;

	sliderContainer.style.top = top;
	sliderContainer.style.left = left;

	let isDragging = false;

	const updateSlider = (event) => {
		const rect = sliderContainer.getBoundingClientRect();
		let calculatedValue;

		if (data.data.direction === "vertical") {
			let newTop = event.clientY - rect.top;
			if (newTop < 0) newTop = 0;
			if (newTop > rect.height) newTop = rect.height;

			calculatedValue =
				((rect.height - newTop) / rect.height) *
					(data.data.max - data.data.min) +
				data.data.min;
		} else {
			let newLeft = event.clientX - rect.left;
			if (newLeft < 0) newLeft = 0;
			if (newLeft > rect.width) newLeft = rect.width;

			calculatedValue =
				(newLeft / rect.width) * (data.data.max - data.data.min) +
				data.data.min;
		}

		let finalValue = Math.min(
			Math.max(calculatedValue, data.data.min),
			data.data.max,
		);
		sliderContainer.dataset.value = finalValue;
		data.data.value = finalValue;

		renderVisuals(finalValue, data, sliderContainer, sliderPercentage);

		universal.send(universal.events.keypress, {
			isSlider: true,
			sliderValue: data.data.value,
			event: event,
			btn: data,
		});
	};

	function renderVisuals(val, data, container, percentageEl) {
		const percentage =
			((val - data.data.min) / (data.data.max - data.data.min)) * 100;

		container.style.background =
			data.data.direction === "vertical"
				? `linear-gradient(to top, var(--slider-background) ${percentage}%, var(--slider-foreground) ${percentage}%)`
				: `linear-gradient(to right, var(--slider-background) ${percentage}%, var(--slider-foreground) ${percentage}%)`;

		const rounded = Number.parseFloat(val).toFixed(1);
		percentageEl.innerText = `${rounded}${data.data.format ? data.data.format : "%"}`;
	}

	renderVisuals(data.data.value, data, sliderContainer, sliderPercentage);

	const i = setInterval(() => {
		if (!document.body.contains(sliderContainer)) {
			clearInterval(i);
			return;
		}
		if (isDragging) return;

		const currentAttrValue =
			Number.parseFloat(sliderContainer.dataset.value) || 0;

		if (currentAttrValue !== data.data.value) {
			data.data.value = currentAttrValue;
			renderVisuals(currentAttrValue, data, sliderContainer, sliderPercentage);
		}
	}, 250);

	if (data.data.enabled !== "false") {
		const touchDownEvent = (e) => {
			sliderContainer.dataset.dragging = true;
			isDragging = true;
		};
		const touchUpEvent = (e) => {
			sliderContainer.dataset.dragging = false;
			isDragging = false;
		};

		sliderThumb.addEventListener("mousedown", touchDownEvent);
		sliderThumb.addEventListener("touchstart", touchDownEvent);
		sliderThumb.addEventListener("mouseup", touchUpEvent);
		sliderThumb.addEventListener("touchend", touchUpEvent);

		document.addEventListener("mousemove", (event) => {
			if (isDragging) updateSlider(event);
		});

		document.addEventListener("touchmove", (event) => {
			if (isDragging) updateSlider(event.touches[0]);
		});
	}
}
