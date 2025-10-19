const express = require("express");
const router = express.Router();

const fs = require("node:fs");
const path = require("node:path");
const formidable = require("formidable");
const { paths } = require("./static");

router.post("/sound", (request, response) => {
	const form = new formidable.IncomingForm({
		uploadDir: paths.userData_sounds,
	});
	// Parse `req` and upload all associated files
	form.parse(request, (err, fields, files) => {
		if (err) {
			return response.status(400).json({ error: err.message });
		}

		const nfp = files.file[0].filepath;
		const ext = files.file[0].mimetype.split("/")[1];
		const originalName = files.file[0].originalFilename.split(".")[0];

		fs.renameSync(
			nfp,
			path.resolve(`./user-data/sounds/${originalName}.${ext}`),
		);

		response.send({
			oldName: files.file[0].originalFilename,
			newName: `${originalName}.${ext}`,
		});
	});
});

router.post("/icon", (request, response) => {
	const form = new formidable.IncomingForm({
		uploadDir: paths.userData_icons,
	});
	// Parse `req` and upload all associated files
	form.parse(request, (err, fields, files) => {
		if (err) {
			return response.status(400).json({ error: err.message });
		}

		const nfp = files.file[0].filepath;
		const ext = files.file[0].mimetype.split("/")[1];
		const originalName = files.file[0].originalFilename.split(".")[0];

		try {
			fs.renameSync(
				nfp,
				path.resolve(`./user-data/icons/${originalName}.${ext}`),
			);
		} catch (err) {
			console.error("Error while renaming file", err);
		}

		response.send({
			oldName: files.file[0].originalFilename,
			newName: `${originalName}.${ext}`,
		});
	});
});

module.exports = router;
