const Discord = require('discord.js');
const filter = require('leo-profanity');
const ms = require('ms')
const fs = require('fs')
const editJsonFile = require('edit-json-file')
const botconfig = require('./botconfig.json')
var Filter = require('bad-words');
const bot = new Discord.Client();
bot.on("ready", async () => {
    console.log("Bella the Cat Launcher is all loaded >:)");
  });
  bot.on("message", async message => {
    if(message.channel.type === "dm") return;
    // Role Variables
    let owner = message.guild.roles.find("name", botconfig.roles.owner)
    let mod = message.guild.roles.find("name", botconfig.roles.mod)
    let muted = message.guild.roles.find("name", botconfig.roles.muted)
    // Channel Variables
    // let welcome = message.guild.channels.find("name", botconfig.channels.welcome)
    // let general = message.guild.channels.find("name", botconfig.channels.general)
    // let askagame = message.guild.channels.find("name", botconfig.channels.askagame)
    // let friendcodes = message.guild.channels.find("name", botconfig.channels.friendcodes)
    // let announcements = message.guild.channels.find("name", botconfig.channels.announcements)
    let mariomaker = message.guild.channels.find("name", botconfig.channels.mariomaker)
    // Information and Control Variables
    let messageArray = message.content.split(" ");
    let cmd = messageArray[0];
    let args = messageArray.slice(1);
    let prefix = botconfig.prefix; 
    let file = JSON.parse(fs.readFileSync(`./queue.json`, "utf8"));
    let queue = editJsonFile("./queue.json", {
        autosave: true
    })
    var filter = new Filter();
    if(filter.isProfane(message.content)){
        message.delete()
    }
    if(message.member.user.username === "Mr. Chipz"){
        message.react("👍")
        message.react("👎")
    }
    // Code Below
    if(cmd === `${prefix}help`){
        message.delete()
        let richEmbed = new Discord.RichEmbed()
        .setTitle("**Help**")
        .setColor("#F8A933")
        if(message.member.roles.has(mod.id) || message.member.roles.has(owner.id)){
            if(message.channel.name !== botconfig.channels.mariomaker) return message.author.send(`Please send this in the #${botconfig.channels.mariomaker}`);
            richEmbed.addField("!smm", "Modifies, gets, and adds to the Super Mario Maker Queue", false)
            richEmbed.addField("!purge", "This deletes a certain amount of messages from the last 14 days. **Please do not use often! This is a __dangerous__ command which can and will delete messages that can't be recovered. Use with descretion**", false)
            richEmbed.addField('!mute', "Restricts the access to chat for a selected user", false)
            richEmbed.addField("!tempmute", "Restricts the access to chat for a selected user for a certain amount of time. **Please** do !help temmute because there is more info on the time a user can be muted for.", false)
            richEmbed.addField('!unmute', "Allows a user that has been previously muted to chat again", false)
        }else{
            richEmbed.addField("!smm submit", "Adds to the Super Mario Maker Queue")
            richEmbed.addField("Thats your only command", "Message NintendoZaedus if you have a suggestion")
        }
        message.channel.send(richEmbed)
        .then(msg => {
            msg.delete(15000)
        })
    }
    if(cmd === `${prefix}smm`){
        let type = args[0];
        let a = args[1];
        if(type === "submit"){
            message.delete()
            if(a && a !== ""){
                if(a.charAt(4) === "-" && a.charAt(9) === "-" && a.charAt(14) === "-"){
                    for(x = 1; x < 10000; x++){
                        if(!file[x]){
                            queue.set(`${x}`, `${a}`)
                            return;
                        }
                    }
                }else{
                    message.author.send("Sorry but you typed in the ID wrong. Make sure you include these '-' to separate it.")
                }
            }else{
                message.author.send("You must put a Super Mario Maker ID after `!smm submit`")
            }
        }
        if(!message.member.roles.has(mod.id) && !message.member.roles.has(owner.id) ){
            message.author.send("You must be at least a mod to do this!")
            message.delete()
            return;
        }
        if(message.channel.name !== botconfig.channels.mariomaker){
            message.delete();
            message.author.send(`Please send this in the #${botconfig.channels.mariomaker}`)
            return;
        }
        if(type === "delete"){
           message.delete()
           let arr = [];
           for(x = 1; x < 10000; x++){
               if(file[x]){
                   arr.push(file[x])
               }else{
                   let arrr = arr.slice(1)
                   fs.writeFileSync(`./queue.json`, '{}', (err) => {
                       if (err) {
                           console.error(err);
                           return;
                       };
                   });
                   queue = editJsonFile("./queue.json", {
                        autosave: true
                   })
                   setTimeout(function(){
                       for(e = 0; e < arrr.length; e++){
                           queue.set(`${e+1}`, `${arrr[e]}`)
                       }
                       
                       return;
                   }, 3000)
                   return;
               }
           }
           
       }
       if(type === "queue"){
           message.delete();
           let send = "The Queue is Clear!";
           let richEmbed = new Discord.RichEmbed()
           .setTitle("Queue")
           .setColor('#F9AA45')
           for(h=1; h < 11; h++){
               if(file[h]){
                   if(h === 1){
                    send = `${h}. ${file[h]}`
                   }else{
                    send = send + `\n${h}. ${file[h]}`
                   }
                   if(h === 10){
                    richEmbed.setDescription(send)
                    message.channel.send(richEmbed)
                    return;
                   }
               }else{
                    richEmbed.setDescription(send)
                    message.channel.send(richEmbed)
                    .then(msg => {
                        msg.delete(15000)
                    })
                    
                    return;
               }
           }
       }
       message.author.send("Please do `!help smm` if you are confused on the command.")
   }
   if(cmd === `${prefix}unmute`){
       if (!message.member.roles.has(mod.id) && !message.member.roles.has(owner.id) ) message.delete();
       let member = message.mentions.members.first();
       if(!member){ 
           message.delete();
           return message.author.send("You have to mention a user")
       }
       if(!muted){ 
           message.delete();
           return message.author.send("No existing role.")
       }
       member.removeRole(muted.id)
       message.author.send("Successfully unmuted " + member.user.username);
       member.send("You were unmuted by " + message.author.username)
       message.delete()
   }
   if(cmd === `${prefix}mute`){
       if (!message.member.roles.has(mod.id) && !message.member.roles.has(owner.id) ) message.delete();
       let member = message.mentions.members.first();
       if(!member){ 
           message.delete();
           return message.author.send("You have to mention a user")
       }
       if(!muted){ 
           message.delete();
           return message.author.send("No existing role.")
       }
       member.addRole(muted.id)
       message.author.send("Successfully muted " + member.user.username);
       member.send("You were muted by " + message.author.username)
       message.delete();
   }
   if(cmd === `${prefix}tempmute`){
       if (!message.member.roles.has(mod.id) && !message.member.roles.has(owner.id) ) message.delete();
       let member = message.mentions.members.first();
       if(!member){ 
           message.delete();
           return message.author.send("You have to mention a user")
       }
       if(!muted){ 
           message.delete();
           return message.author.send("No existing role.")
       }
       let time = args[1];
       if(!time) {
           message.delete();
           return message.author.send("No time specified.")
       }
       member.addRole(muted.id)
       message.author.send("Successfully muted " + member.user.username + ` for ${ms(ms(time), {long: true})}`);
       member.send("You were muted by " + message.author.username + ` for ${ms(ms(time), {long: true})}`);
       message.delete();
       setTimeout(function() {
           member.removeRole(muted.id)
           member.send("The time is up. You can talk now")
       }, ms(time));
   }
   if(cmd === `${prefix}purge`){
       let amount = args[0];
       if (!message.member.roles.has(mod.id) && !message.member.roles.has(owner.id) ){ 
           message.author.send("You must be at least a mod to do this!")
           return message.delete()
       }
       if(amount){
           if(!amount > 1){
               message.author.send("You must delete more than just one message.")
               return message.delete();
           }
       async function purgeNaN(){
           const fetched = await message.channel.fetchMessages({
               limit: amount
           });
           message.channel.bulkDelete(fetched)
               .catch(error => {
                    message.author.send("The messages you selected to delete are more than 14 days old! Please try a smaller amount. If it happens that they are not 14 days old then wait and try again.")
                    console.error(error)
                    message.delete();
               })
       }
       message.delete();
       purgeNaN()
   }else{
       message.author.send("Please Specify an Amount of Messages you want to clear")
       message.delete();
   }
   
   }
 });
 bot.login(bot.env.BOT_TOKEN)
