import { settingsMenu } from "../settingsMenu";

let holdTime =0;

/**
 * @name actionButtonDown Quick actions handler for the Logo button
 * @param {Event} event The mousedown event.
 */
function actionButtonDown(event) {
  const holdHandler = setInterval(() => {
		holdTime++;

    if(holdTime > 250) {
      clearInterval(holdHandler);
			actionButtonUp(null);
		}
	}, 1);
	event.target.addEventListener('mouseup', (e) => {
		clearInterval(holdHandler);

		if(holdTime > 500) {
			actionButtonUp(e);
		} else {
			settingsMenu();
		}
		
		holdTime = 0;
	})
}

function actionButtonUp(e) {
  console.log("action window")
}

export {actionButtonDown, actionButtonUp}