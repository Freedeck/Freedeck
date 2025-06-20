window.onerror = (message, source, lineno, colno, error) => {
  let modal = document.createElement("dialog");
  if(!document.querySelector("#error-dialog")) {
    modal.id = "error-dialog";
    modal.classList.add("modal");
    const content = document.createElement("div");
    content.innerHTML = `
    <h2>Freedeck</h2>
    <p>
      Freedeck has encountered an error. Please see the details for more information.
    </p>
    <details open style='max-width: 90vw;'>
      <summary>Error Details</summary>
      <small>
        ${message} in ${source} at line ${lineno}:${colno}
      </small>
    </details>
    <br>
    <div class='flex-wrap-r alc'>
    <a style='padding:.5rem;' href='javascript:window.location.reload();'>Reload</a>
    <a style='padding:.5rem;' href='javascript:window.errorRecompile();'>Recompile</a>
    <a style='padding:.5rem;' href='javascript:window.errorIgnore();'>Ignore</a>
    </div>
    `

    modal.appendChild(content);
    document.body.appendChild(modal);
    modal.showModal();
  } else modal = document.querySelector("#error-dialog");

  console.log(message, source, lineno, colno, error);
};

window.errorIgnore = () => {document.querySelector("#error-dialog").remove()}
window.errorRecompile = () => {document.querySelector("#error-dialog").remove();universal.send(universal.events.default.recompile);}