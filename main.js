const Discord = require("discord.js");
const intents = new Discord.Intents(32767);

const client = new Discord.Client({ intents });

require("dotenv").config();

const token = process.env.TOKEN;

console.log(token);

client.on("ready", () => {
  console.log("client ready!");
});

client.login(token);
