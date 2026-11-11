import {
    Markup
} from "telegraf";

const botMenu = Markup.keyboard([
    ["Bugungi buyurtmalar", "Hisobotlar"],
]).resize();

export {
    botMenu
};