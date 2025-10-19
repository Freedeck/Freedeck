let metrics;

try {
	metrics = require("./user-data/logs/timecache.json");
} catch (err) {
	console.error(err);
	console.log(
		"Please generate a timecache report by running the server, and typing 'timer' and pressing enter. It will generate a readable report and use this script correctly.",
	);
	process.exit(0);
}

metrics.sort((a, b) => a.time - b.time);
const startTime = metrics[0].time;

function formatDelta(ms) {
	return `${ms}ms`.padStart(6);
}

function extractPairKey(tag) {
	if (!tag.includes("-begin") && !tag.includes("-complete")) return null;
	const [base, name] = tag.split(",");
	const key = `${base.replace(/-begin|-complete/, "")}:${name || ""}`;
	return key;
}

function matchBeginComplete(metrics) {
	const pairs = {};
	const beginMap = {};

	for (const metric of metrics) {
		const key = extractPairKey(metric.tag);
		if (!key) continue;

		if (metric.tag.includes("-begin")) {
			beginMap[key] = metric;
		} else if (metric.tag.includes("-complete")) {
			const begin = beginMap[key];
			if (begin) {
				pairs[key] = {
					name: key,
					start: begin,
					end: metric,
					duration: metric.time - begin.time,
				};
				delete beginMap[key];
			}
		}
	}
	return pairs;
}

const pairs = matchBeginComplete(metrics);

const sortedPairs = Object.values(pairs).sort(
	(a, b) => b.duration - a.duration,
);
console.log("\nFreedeck Timecache loaded!");
console.log("\n=== Begin/Complete Pairs (sorted by duration) ===");
for (const { name, start, end, duration } of sortedPairs) {
	console.log(
		`${name.padEnd(50)} ${duration.toString().padStart(4)}ms  [${start.time} → ${end.time}]`,
	);
}

console.log("\n=== All Events Chronologically ===");
metrics.forEach((m, i) => {
	const delta = i > 0 ? m.time - metrics[i - 1].time : 0;
	const sinceStart = m.time - startTime;
	console.log(
		`${m.tag.padEnd(50)} +${formatDelta(delta)} | total ${sinceStart}ms`,
	);
});

const total = metrics.at(-1).time - startTime;
console.log(`\nTOTAL RUNTIME: ${total}ms`);
