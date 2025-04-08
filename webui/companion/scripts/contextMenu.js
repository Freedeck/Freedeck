import { universal } from "../../shared/universal.js";
import { UI } from "../../client/scripts/ui.js";

window.oncontextmenu = (e) => {
  const ctxMenu = document.querySelector(".contextMenu");
  if (ctxMenu) ctxMenu.remove();
  if (!e.srcElement.classList.contains("button")) return false;
  if (e.srcElement.classList.contains("builtin")) return false;
  if  (!e.srcElement.classList.contains("k")) return false;
  const custMenu = document.createElement("div");
  custMenu.className = "contextMenu";
  custMenu.style.top = `${e.clientY - window.scrollY}px`;
  custMenu.style.left = `${e.clientX - window.scrollX}px`;
  custMenu.style.position = "absolute";
  if (e.srcElement.dataset.name === undefined) e.srcElement.dataset.name = "";

  let title =
    e.srcElement.dataset.name !== "" ? e.srcElement.dataset.name : "nothing!";
  if (e.srcElement.dataset.name === "" && e.srcElement.dataset.interaction)
    title = "a tile with no name!";
  const specialFlag = e.srcElement.classList.contains("unset");

  const custMenuTitle = document.createElement("div");
  custMenuTitle.innerText = `Editing ${title}`;
  custMenuTitle.style.fontWeight = "bold";
  custMenuTitle.style.marginBottom = "5px";
  custMenu.appendChild(custMenuTitle);

  let custMenuItems = [];
  if (title !== "" && !specialFlag) {
    custMenuItems = ["Edit Tile"].concat(custMenuItems);
    custMenuItems.push("Remove Tile");
  } else {
    custMenuItems = ["New Tile", "Copy Tile Here"].concat(custMenuItems);
  }

  custMenuItems = custMenuItems.concat([
    "",
    "New Page",
    `Folder: ${universal.config.profile}`,
  ]);

  for (const item of custMenuItems) {
    const menuItem = document.createElement("div");
    menuItem.innerText = item;
    menuItem.className = "menuItem";
    menuItem.onclick = () => {
      // Handle menu item click
      switch (item) {
        case "New Page":
          UI.Pages[Object.keys(UI.Pages).length] = [];
          universal.page = Object.keys(UI.Pages).length - 1;
          UI.reloadSounds();
          universal.sendEvent("page_change");
          break;
        case "---":
          break;
        case `Folder: ${universal.config.profile}`:
          showPick(
            "Switch to another Folder:",
            Object.keys(universal.config.profiles).map((profile) => {
              return {
                name: profile,
              };
            }),
            ({value}) => {
              universal.page = 0;
              universal.save("page", universal.page);
              universal.send(
                universal.events.companion.set_profile,
                value.name
              );
            }
          );
          break;
        case "Edit Tile":
          // show a modal with the editor
          universal.editTile(e);
          break;
        case "New Tile": {
          const pos =
            Number.parseInt(
              e.srcElement.className.split(" ")[1].split("-")[1]
            ) +
            (universal.page < 0 ? 1 : 0) +
            (universal.page > 0
              ? universal.config.iconCountPerPage * universal.page
              : 0);
          const uuid = `fdc.${Math.random() * 10000000}`;
          UI.reloadProfile();
          const interaction = {
            type: "fd.none",
            pos,
            uuid,
            data: {},
          };
          universal.send(universal.events.companion.new_tile, {
            "New Tile": interaction,
          });
          universal.listenForOnce("page_change", () => {
            universal.editTile({
              srcElement: {
                getAttribute: (attr) => {
                  return JSON.stringify(interaction);
                },
                dataset: {
                  name: "New Tile",
                  interaction: JSON.stringify(interaction),
                },
                className: "button k-0 k",
              }
            });
          });
          break;
        }
        case "Remove Tile":
          UI.reloadProfile();
          if(universal.lclCfg()["app.freedeck.tiles.force_deletion"]) {
            universal.send(universal.events.companion.del_tile, {
              name: e.srcElement.dataset.name,
              item: e.srcElement.getAttribute("data-interaction"),
            });
            return;
          }
          window.showPick(
            `Are you sure you want to remove ${universal.cleanHTML(
              e.srcElement.dataset.name
            )}?`,
            [
              { name: "Yes", value: true },
              { name: "No", value: false },
            ],
            ({value}) => {
              if (value.value !== true) return;
              universal.send(universal.events.companion.del_tile, {
                name: e.srcElement.dataset.name,
                item: e.srcElement.getAttribute("data-interaction"),
              });
            },
            "This cannot be undone!"
          );
          break;
        case "Copy Tile Here":
          showReplaceGUI(e.srcElement);
          break;
        default:
          break;
      }
    };
    custMenu.appendChild(menuItem);
  }
  document.body.appendChild(custMenu);
  return false; // cancel default menu
};

/**
 * @name showReplaceGUI
 * @param {HTMLElement} srcElement The element that you want to copy/replace.
 * @description Show the GUI for replacing a button with another from the universal.app_sounds context.
 */
function showReplaceGUI(srcElement) {
  UI.reloadProfile();
  showPick(
    "Copy from:",
    universal.app_sounds.map((sound) => {
      const k = Object.keys(sound)[0];
      return {
        name: k,
        type: sound[k].type,
      };
    }),
    ({value}) => {
      UI.reloadProfile();
      const valueToo = universal.app_sounds.filter((sound) => {
        const k = Object.keys(sound)[0];
        return k === value.name;
      })[0][value.name];
      const pos =
        Number.parseInt(srcElement.className.split(" ")[1].split("-")[1]) +
        (universal.page < 0 ? 1 : 0) +
        (universal.page > 0
          ? universal.config.iconCountPerPage * universal.page
          : 0);
      // we need to clone value, and change the pos, and uuid, then make a new key.
      universal.send(universal.events.companion.new_tile, {
        [value.name]: {
          type: valueToo.type,
          plugin: valueToo.plugin,
          pos,
          uuid: `fdc.${Math.random() * 10000000}`,
          data: valueToo.data,
        },
      });
      return true;
    }
  );
}
