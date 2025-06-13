window.onerror = (message, source, lineno, colno, error) => {
  let modal = document.createElement("dialog");
  if(!document.querySelector("#error-dialog")) {
    modal.id = "error-dialog";
    modal.classList.add("modal");
    const content = document.createElement("div");
    content.innerHTML = `
    <h1>Freedeck</h1>
    <p>
      Freedeck has encountered an unrecoverable error. Please reload the app to continue.
      If that doesn't work, you may need to close and reopen the app.
    </p>
    <small>Handler: common/error.js</small>
    <details open style='max-width: 90vw;'>
      <summary>Error Details</summary>
      <small>
        ${message} in ${source} at line ${lineno}:${colno}
      </small>
    </details>
    <br>
    <div class='flex-wrap-r'>
    <a style='display:block;width:100%;font-size:1.5em;text-align:center;' href='javascript:window.location.reload();'>Reload</a>
    </div>
    `

    modal.appendChild(content);
    document.body.appendChild(modal);
    modal.showModal();
  } else modal = document.querySelector("#error-dialog");

  console.log(message, source, lineno, colno, error);
};