import { SidebarSection, SidebarButton } from "../SidebarSection";
import { translationKey } from "../../../../shared/localization";

const style = new SidebarSection(translationKey("sidebars.left.mobd"), "MobileDevice", ["mobd", "rem-mobd"]);

style.children.push(new SidebarButton(translationKey("sidebars.left.mobd.pair"), (e) => {
  universal.connHelpWizard();
}, 'mobd-conn'));


export default function () {
  document.querySelector(".sidebar").appendChild(style.build());
}