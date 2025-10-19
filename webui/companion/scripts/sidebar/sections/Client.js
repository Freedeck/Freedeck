import { SidebarSection, SidebarSelect } from "../SidebarSection";

const style = new SidebarSection("Client", "Client");

document.querySelector(".sidebar").appendChild(style.build());
