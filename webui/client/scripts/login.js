import { universal } from "../../shared/universal.js";

await universal.init("Main:Login");

universal.send(universal.events.login.login_data, universal._information.tempLoginID);