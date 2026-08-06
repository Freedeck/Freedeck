const { compileWebpack, isCompilerFinished } = require("@src/webpack.js");

const commandPrefix = "FDConsole >>";
const { recordTime, writeFinal } = require("$/timer");

function output(...args) {
	console.log(commandPrefix, ...args);
}

const commands = {
	help: {
		name: "help",
		description: "Help command.",
		usage: "help [command]",
		aliases: ['h','?','/'],
		handler: help,
	},
	"webpack.compile": {
		name: "webpack.compile",
		aliases: ["wc"],
		description: "Tell the Webpack runner to compile the bundles",
		usage: "webpack.compile",
		handler: wbp_c,
	},
	"js.eval": {
		name: "js.eval",
		aliases: ["eval", "ev", "exec"],
		description:
			"Evaluate any JavaScript expression on the server side. REALLY UNSAFE.",
		usage: "js.eval <expression>",
		handler: jseval,
	},
	timer: {
		name: "timer",
		description: "Timer flush",
		usage: "timer",
		handler: () => {
			recordTime("console:timer-exit");
			writeFinal();
			require("@src/../timecache-analytics");
			process.exit(0);
		},
	},
};

function jseval(...args) {
	const expression = args.join(" ");
	try {
		const out = eval(expression);
		console.log(out);
	} catch (err) {
		output("Error while processing expression:", err, expression);
	}
}

class Spinner {
	stateText = "No text specific";
	frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
	currentFrame = 0;
	interval = 80;
	loop;
	periodicRunner;
	constructor(periodic) {
		this.periodicRunner = periodic;
		this.loop = setInterval(() => this.update(), this.interval);
	}

	update() {
		const frame = this.frames[this.currentFrame++ % this.frames.length];
		process.stdout.write(`\b${frame}`);
		this.periodicRunner(this);
	}

	remove() {
		process.stdout.write("\b");
		clearInterval(this.loop);
	}
}

async function wbp_c() {
	compileWebpack();
	const spin = new Spinner(() => {
		if (isCompilerFinished) spin.remove();
	});
}

function help(...args) {
	if (args.length > 0) {
		for (const arg of args) {
			if (Object.keys(commands).includes(arg)) {
				const data = commands[arg];
				output(`${data.name}${data.aliases ? ' ('+data.aliases.join(', ')+')' : ''}: ${data.description}`);
				output(`Usage: ${data.usage}`);
			} else {
				output(`Command ${arg} not found.`);
			}
		}
		return;
	}
	output("Commands:");
	for (const key in commands) {
		const data = commands[key];
		output(`${data.name}${data.aliases ? ' ('+data.aliases.join(', ')+')' : ''}: ${data.description}`);
	}
}

const dataListeners = {};
process.stdin.on("data", (buf) => {
	const data = buf.toString().trim();
	if (Object.keys(dataListeners).includes(data)) {
		dataListeners[data] = true;
	}
	const args = data.split(" ");
	let foundCommand = false;
	for (const commandKey in commands) {
		const command = commands[commandKey];
		if (data.startsWith(commandKey)) {
			const handler = command.handler;
			args.shift();
			handler(...args);
			foundCommand = true;
		} else {
			if (command.aliases?.includes(args[0])) {
				const handler = command.handler;
				args.shift();
				handler(...args);
				foundCommand = true;
			}
		}
	}
	if (!foundCommand)
		output("Command not recognized. Type 'help' for a list of commands.");
});

function wasEntered(g) {
	if (dataListeners[g]) return dataListeners[g];
}

module.exports = {
	dataListeners,
	wasEntered,
	addCommand: (i, d) => {
		commands[i] = d;
	},
};
