import configEnv from "./envConfig.js";
import { Client, Events, GatewayIntentBits, GuildChannel } from "discord.js";
import axios from "axios";

configEnv();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, () => {
  console.log("Bot is up!");
});

let options = {
  method: "POST",
  url: "https://openai80.p.rapidapi.com/chat/completions",
  headers: {
    "content-type": "application/json",
    "X-RapidAPI-Key": "1622177290mshd1a3aea86078fefp18acb1jsnc6caa08d41fa",
    "X-RapidAPI-Host": "openai80.p.rapidapi.com",
    "Accept-Encoding": "gzip", // Kept getting an Axios decompression error with the err code "ERR_CL_SPACE", but this was the fix
  },
  data: {
    model: "gpt-3.5-turbo",
    max_tokens: 3,
    messages: [
      {
        role: "system",
        content:
          "You are a discord moderator who's task is to say: AYO! if the sentence following the | is considered inappropriate or weird. If not, just say cool and nothing else.",
      },

      {
        role: "user",
        content: "| ",
      },
    ],
  },
};

client.login(process.env.TOKEN);
// response.data.choices[0].message.content

axios.defaults.maxContentLength = 100000000; // Set a larger value according to your needs

client.on(Events.MessageCreate, async (msg) => {
  console.log("Message received!");
  options.data.messages[1].content = `| ${msg.content}`;
  console.log(options.data.messages[1].content);
  console.log("Message configured");
  try {
    console.log("Requesting data..");
    const response = await axios.request(options);
    console.log("Data received");
    console.log(response.data.choices[0].message.content);
    if (response.data.choices[0].message.content == "AYO!")
      client.channels
        .fetch(msg.channelId)
        .then((channel) => channel.send("AYO!"));
  } catch (error) {
    console.error(error);
  }
});
