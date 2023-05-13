const fs = require('fs');

const { LegacyConvert } = require('frozor-commands');
const Component = require('frozor-slack-message-components');
const hat = require('hat');

const MineplexAPI = require('../../lib/api/MineplexAPI');
const MojangAPI = require('../../lib/api/MojangAPI');

const authentication = require('../../lib/accounts/authentication');
const findAccount = require('../../lib/accounts/find');
const SpoobErrors = require('../../lib/error/SpoobErrors');
const config = require('../../config/index');

const db = require('../../lib/database/mongo/');
const Schemas = require('../../lib/database/mongo/schemas');

const randIds = require('../../lib/util/id');

const oldAccounts = require('../../migration/accounts.json');

const MineplexSocket = require('../../lib/api/MineplexSocket');
const InappropriateNames = require('../../lib/services/inappropriate-names');

const mojang = require('mojang');

/* Spoobux and items stuff */
const ItemUtil = require('../../lib/items/ItemUtil');
const ItemType = require('../../lib/items/enum/ItemType');
const ItemRarity = require('../../lib/items/enum/ItemRarity');
const ItemSource = require('../../lib/items/enum/ItemSource');
const ItemTransactions = require('../../lib/items/transactions');
const Crates = require('../../lib/items/Crates');

const RankCache = require('../../lib/storage/RankCache');

const SamczsunAPI = require('../../lib/api/SamczsunAPI');
const {
	punishments: {
		Punishment,
		InappropriateNamePunishment,
		Category,
		CategoryToReadable,
		ValidSeverities
	}
} = SamczsunAPI;
const PunishmentEndpoint = SamczsunAPI.endpoint;

String.prototype.toSlackId = function () {
	return this.substring(2, this.length - 1);
};

String.prototype.toSlackMention = function () {
	return `<@${this}>`;
};

String.prototype.toNumber = function () {
	return parseInt(this.replace(',', '').trim());
};

String.prototype.isValidMinecraftName = function () {
	return /^($|[A-Z0-9_]{1,16})$/i.test(this);
};

function getAttachmentForLoot(account, lootItem) {
	const attachment = new Component.Attachment();
	attachment.setColor(lootItem.rarity.color)
		.setTitle(`${lootItem.rarity.name} ${lootItem.name}`);

	let text = '';

	if (lootItem.extra) {
		text += `\n${lootItem.extra}`;
	}

	if (lootItem.type == ItemType.SPOOBUX) {
		text += `\n\n(You now have ${account.spoobux} Spoobux)`;
	} else {
		text += `\n\n(You now have ${ItemUtil.getAccountItemAmount(account, lootItem.id)})`;
	}

	attachment.setText(text);

	attachment.setFallback(attachment.getTitle());

	return attachment;
}

const commands = {
	commands: {
		args: {
			min: 0,
			max: 100000
		},
		process: (slackBot, commandMessage, extra) => {
			slackBot.chat(commandMessage.user.id, `*GWEN Commands:*${getCommandsListString()}`);
		}
	},
	help: {
		type: 'alias',
		alias: 'commands'
	},
	exit: {
		type: 'hidden',
		args: {
			min: 0,
			max: 0
		},
		process: (slackBot, commandMessage, extra) => {
			commandMessage.reply('Restarting, be back in a jiffy!', () => {
				extra.minecraftBotUS.end();
				extra.minecraftBotEU.end();
				process.exit();
			});
		}
	},
	punish: {
		name: 'punish',
		description: 'PUNISHES A PLAYER.',
		type: 'hidden',
		auth: ['Artix', 'Spoobncoobr'],
		args: {
			min: 4,
			max: 100
		},
		usage: '',
		process: (slackBot, commandMessage, extra) => {
			const target = commandMessage.args[0];
			let category = commandMessage.args[1];
			let severity = commandMessage.args[2];
			const reason = commandMessage.args.slice(3).join(' ');

			if (isNaN(severity)) {
				return commandMessage.reply('That severity doesn\'t seem right.');
			}

			if (typeof severity == 'string') {
				severity = parseInt(severity);
			}

			if (Math.floor(severity) != severity) {
				return commandMessage.reply('Severity must be an integer.');
			}

			if (!Category.hasOwnProperty(category)) {
				return commandMessage.reply(`Invalid punishment category! Valid categories; ${Object.keys(Category).join(', ')}`);
			}

			category = Category[category];

			log.debug(`Punishment type: ${category}`);

			PunishmentEndpoint.getPunishmentDuration(target, category, severity).then(duration => {
				const punishment = new Punishment({ target, category, severity, reason, duration });

				punishment.punish().then(() => {
					commandMessage.reply(`Successfully punished user *${target}* for *${reason}*`);
				}).catch(err => {
					commandMessage.reply(`Could not punish user *${target}*: ${err}`);
				});

			}).catch(e => {
				log.error(e);
				commandMessage.reply(`Couldn't get punishment duration for *${target}*\nError: ${e}`);
			});
		}
	},
	removeactivepunishments: {
		auth: ['Artix'],
		args: {
			min: 2,
			max: 500
		},
		process: (slackBot, commandMessage) => {
			const player = commandMessage.args[0];
			const reason = commandMessage.args.slice(1).join(' ');

			let successes = 0;
			let failures = 0;

			function couldNotGet(e) {
				commandMessage.reply(`Unable to get history for *${commandMessage.args[0]}*: ${e}`);
			}

			function couldNotRemove() {
				failures++;
			}

			function couldRemove() {
				successes++;
			}

			function done() {
				commandMessage.reply(`Removed \`${successes}\` active punishments from *${player}*${(failures > 0) ? `, but could not remove \`${failures}\`` : '.'}`);
			}

			PunishmentEndpoint.getPunishments(commandMessage.args[0]).then(punishments => {
				const toRemove = punishments.filter(p => p.active);

				if (toRemove.length == 0) {
					commandMessage.reply(`There were no punishments to remove on *${player}*`);
					return;
				}

				function next(punishment = toRemove.shift()) {
					punishment.remove(reason).then(() => {
						couldRemove();
						if (toRemove.length > 0) {
							next();
						} else {
							done();
						}
					}).catch(couldNotRemove);
				}

				next();
			}).catch(couldNotGet);
		}
	},
	punishtimes: {
		requiredRank: 'trainee',
		args: {
			min: 1,
			max: 1
		},
		process: (slackBot, commandMessage) => {
			const player = commandMessage.args[0];

			if (!player.isValidMinecraftName()) {
				return commandMessage.reply('That doesn\'t seem to be a valid Minecraft name. Try again?');
			}

			PunishmentEndpoint.getPunishments(player)
				.then(punishments => {

					const pastOffenses = Punishment.getPastOffenses(punishments);

					function getDuration(category, severity) {
						return Punishment.getDuration(category, severity, pastOffenses);
					}

					let message = `Punishment times for *${player}*`;

					for (const category of Object.keys(pastOffenses)) {
						message += `\n\n*${CategoryToReadable.get(category)}*`;

						const sevs = ValidSeverities.get(category);

						for (const sev of sevs) {
							let duration = getDuration(category, sev);
							if (duration == -1) {
								duration = 'Permanent';
							} else {
								duration = duration.hoursToSeconds().toHumanReadable(1);
							}

							message += `\n    *Severity ${sev}*: \`${duration}\``;
						}
					}

					commandMessage.reply(message);

				}).catch(e => {
				commandMessage.reply(`Unable to get Punish Times for *${player}*: ${e}`);
			});
		}
	},
	/*punishplayers:{
		name: "punish",
		description: "PUNISHES PLAYERS.",
		type: "hidden",
		auth:["Artix", "Spoobncoobr"],
		args: {
			min: 4,
			max: 200
		},
		usage: "",
		process: (slackBot, commandMessage, extra)=>{
			let targets   = commandMessage.args[0].split(',');
			let category  = commandMessage.args[1];
			let severity  = commandMessage.args[2];
			let reason    = commandMessage.args.slice(3).join(' ');

			if(!Category.hasOwnProperty(category)){
				return commandMessage.reply(`Invalid punishment category! Valid categories; ${Object.keys(Category).join(', ')}`);
			}

			let punishment = new Punishment({ target: 'hi mom!', category, severity, reason });

			const originalLength = targets.length;
			let originalMessage = `Punishing *${originalLength}* players...`;

			slackBot.reply(commandMessage, originalMessage, (response)=> {
				let lastPunish = Date.now();
				let etaTimes = [];
				function getETA() {
					let avgEta = etaTimes.reduce((a,b) => a+b) / etaTimes.length;
					return parseFloat((((avgEta + 1000) * targets.length)/1000).toFixed(1));
				}

				function punishNext(){
					let username = targets.shift();

					punishment.target.name = username;

					punishment.punish()
						.then(()=>{
							let now = Date.now();
							etaTimes.push(now - lastPunish);
							lastPunish = now;

							updateETA();

							if(targets.length > 0){
								setTimeout(()=>{
									punishNext();
								}, 1000);
							}
							else{
								commandMessage.reply(`Successfully punished all users.`);
							}
						})
						.catch((err)=>{
							commandMessage.reply(`Could not punish user *${username}*: ${err}`);
						});
				}

				function updateETA() {
					slackBot.api.methods.chat.update({
						ts: response.ts,
						channel: response.channel,
						text: originalMessage + `\n*Punished:* ${originalLength - targets.length}/${originalLength}\n*ETA:* ${getETA().toHumanReadable(2)}`
					});
				}

				punishNext();
			});
		}
	},*/
	iname: {
		auth: ['Artix', 'DeanTM', 'Toki', '_H2O', 'Wanderer_', 'Diar', 'mepman9', 'FireStar891', 'zdemon98'],
		args: {
			min: 1,
			max: 999
		},
		process: (slackBot, commandMessage, extra) => {
			async function go() {
				const names = commandMessage.args;

				for (const name of names) {
					if (!name.isValidMinecraftName()) {
						commandMessage.reply(`Invalid name entered (*${name}*)! Names must only contain \`A-z\`, \`0-9\` and \`_\``);
						continue;
					}

					try {
						const punishments = await PunishmentEndpoint.getPunishments(name);

						let canPunish = true;
						for (const punishment of punishments) {
							if (!punishment.active) {
								continue;
							}
							if (punishment.reason.toLowerCase().includes('inappropriate name')) {
								commandMessage.reply(`*${name}* has already been punished for *Inappropriate Name*.`);
								canPunish = false;
								break;
							}
						}

						if (canPunish) {
							try {
								await new InappropriateNamePunishment(name).punish();
								commandMessage.reply(`Punished *${name}* for *Inappropriate Name*.`);
							} catch (e) {
								commandMessage.reply(`Unable to punish *${name}* for *Inappropriate Name*: ${e}`);
							}
						}
					} catch (e) {
						if (e.toString().includes('does not exist')) {
							commandMessage.reply(`It appears that *${name}* does not exist. Try again?`);
						} else {
							commandMessage.reply(`Could not get punishments for *${name}*. Please try again later.`);
						}
					}
				}
			}

			go().catch(e => {
				log.error(e);
				commandMessage.reply('Something went wrong.');
			});
		}
	},
	getmention: {
		args: {
			min: 1,
			max: 1
		},
		process: (slackBot, commandMessage, extra) => {
			commandMessage.reply(`The user you are seeking is <@${commandMessage.args[0]}>`);
		}
	},
	reloadmc: {
		auth: ['Artix', 'samczsun'],
		args: {
			min: 0,
			max: 0
		},
		process: (slackBot, commandMessage, extra) => {
			function restart() {
				MineplexSocket.connection.close();
				process.exit();
			}

			commandMessage.reply('Restarting, be back in a jiffy!').then(restart).catch(restart);
		}
	},
	auth: {
		auth: false,
		args: {
			min: 0,
			max: 300
		},
		process: (slackBot, commandMessage, extra) => {
			const id = commandMessage.user.id;

			function findExistingAccount(slack) {
				return new Promise((resolve, reject) => {
					db.Account.findOne({ slack }, (err, account) => {
						if (err) {
							reject('An unexpected error occurred.');
							return;
						}

						if (!account) {
							resolve(false);
							return;
						}

						resolve(account);
					});
				});
			}

			function findExistingToken(slack) {
				return new Promise((resolve, reject) => {
					db.AuthToken.findOne({ account: slack }, (err, account) => {
						if (err) {
							reject('An unexpected error occurred.');
							return;
						}

						if (!account) {
							resolve(false);
							return;
						}

						resolve(account);
					});
				});
			}

			function fail(e) {
				slackBot.chat(commandMessage.user.id, `Sorry, could not begin auth. ${e}`);
			}

			findExistingAccount(id).then(existingAccount => {
				if (existingAccount && existingAccount.slack.includes(id)) {
					fail('You are already authenticated with this slack!');
					return;
				}

				findExistingToken(id).then(existingToken => {
					if (existingToken) {
						fail(`You already have a pending auth token! Visit https://frozor.io/spoob/account/link?token=${existingToken.token} to link!`);
						return;
					}

					const authToken = new db.AuthToken({
						type: 'spoob',
						account: id,
						token: hat(32)
					});

					authToken.save(err => {
						if (err) {
							fail('An unexpected error occurred while attempting to save your auth token.');
							return;
						}

						slackBot.chat(commandMessage.user.id, `Successfully begun authentication! Please visit https://frozor.io/spoob/account/link?token=${authToken.token} to complete account creation.`);
					});
				}).catch(fail);
			}).catch(fail);
		}
	},
	spoobux: {
		args: {
			min: 0,
			max: 1
		},
		process: (slackBot, commandMessage, extra) => {
			function sendSpoobuxMessage(account) {
				commandMessage.reply(`The user *${account.username}* has \`${account.spoobux}\` Spoobux in their account.`);
			}

			if (commandMessage.args.length == 0) {
				//Use their own account
				const lookup = commandMessage.user.id;
				findAccount.fromSlack(lookup).then(sendSpoobuxMessage).catch(err => {
					switch (err) {
						case SpoobErrors.ACCOUNT_LOOKUP_ERROR:
							commandMessage.reply('An unknown error occurred while looking your account.');
							break;
						case SpoobErrors.ACCOUNT_NOT_FOUND:
							commandMessage.reply('You don\'t seem to have an account.');
							break;
						default:
							commandMessage.reply('An unknown error occurred while finding your account.  ¯\\_(ツ)_/¯');
							break;
					}
				});
			} else {
				//Use someone else's account
				let lookup = commandMessage.args[0];
				if (lookup.isSlackUser()) {
					lookup = lookup.toSlackId();
					findAccount.fromSlack(lookup).then(sendSpoobuxMessage).catch(err => {
						switch (err) {
							case SpoobErrors.ACCOUNT_LOOKUP_ERROR:
								commandMessage.reply('An unknown error occurred while looking up that person\'s account.');
								break;
							case SpoobErrors.ACCOUNT_NOT_FOUND:
								commandMessage.reply('That user doesn\'t seem to have an account.');
								break;
							default:
								commandMessage.reply('An unknown error occurred while finding that person\'s account.  ¯\\_(ツ)_/¯');
								break;
						}
					});
				} else {
					//It's minecraft?
					if (!lookup.isValidMinecraftName()) return commandMessage.reply('That doesn\'t seem to be a valid Minecraft name, try again?');

					findAccount.fromName(lookup, (success, result) => {
						if (!success) {
							switch (result) {
								case SpoobErrors.ACCOUNT_LOOKUP_ERROR:
									commandMessage.reply('An unknown error occurred while looking up that person\'s account.');
									break;
								case SpoobErrors.ACCOUNT_NOT_FOUND:
									commandMessage.reply('That user doesn\'t seem to have an account associated with that name.');
									break;
								default:
									commandMessage.reply('An unknown error occurred while finding that person\'s account.  ¯\\_(ツ)_/¯');
									break;
							}
						} else sendSpoobuxMessage(result);
					}, false);
				}
			}
		}
	},
	inventory: {
		args: {
			min: 0,
			max: 1
		},
		process: (slackBot, commandMessage, extra) => {
			function sendInventoryMessage(account) {
				const inventoryIds = Object.keys(account.inventory);

				if (inventoryIds.length == 0) return slackBot.chat(commandMessage.user.id, `The user *${account.username}* has no items in their inventory :(`);

				let messageToSend = `*Inventory For ${account.username}*`;

				for (const id of inventoryIds) {
					const amount = account.inventory[id].amount;
					const item = ItemUtil.getItem(id);
					if (amount == 0) continue;
					if (item.source != ItemSource.CRATE) {
						if (item.description) {
							messageToSend += `\n\`${amount}\` x *${item.name}* (ID #\`${id}\`) - _${item.description}_`;
						} else {
							messageToSend += `\n\`${amount}\` x *${item.name}* (ID #\`${id}\`)`;
						}
					} else {
						if (item.extra) {
							messageToSend += `\n\`${amount}\` x *${item.rarity.name} ${item.name}* (ID #\`${id}\`) - _${item.extra}_`;
						} else {
							messageToSend += `\n\`${amount}\` x *${item.rarity.name} ${item.name}* (ID #\`${id}\`)`;
						}
					}
					if (item.type == ItemType.CARD && item.image) {
						messageToSend += ` - ${item.image}`;
					}
				}

				slackBot.chat(commandMessage.user.id, messageToSend);
			}

			if (commandMessage.args.length == 0) {
				//Use their own account
				const lookup = commandMessage.user.id;
				findAccount.fromSlack(lookup).then(sendInventoryMessage).catch(result => {
					switch (result) {
						case SpoobErrors.ACCOUNT_LOOKUP_ERROR:
							commandMessage.reply('An unknown error occurred while looking your account.');
							break;
						case SpoobErrors.ACCOUNT_NOT_FOUND:
							commandMessage.reply('You don\'t seem to have an account.');
							break;
						default:
							commandMessage.reply('An unknown error occurred while finding your account.  ¯\\_(ツ)_/¯');
							break;
					}
				});
			} else {
				//Use someone else's account
				let lookup = commandMessage.args[0];
				if (lookup.isSlackUser()) {
					lookup = lookup.toSlackId();
					findAccount.fromSlack(lookup).then(sendInventoryMessage).catch(result => {
						switch (result) {
							case SpoobErrors.ACCOUNT_LOOKUP_ERROR:
								commandMessage.reply('An unknown error occurred while looking up that person\'s account.');
								break;
							case SpoobErrors.ACCOUNT_NOT_FOUND:
								commandMessage.reply('That user doesn\'t seem to have an account.');
								break;
							default:
								commandMessage.reply('An unknown error occurred while finding that person\'s account.  ¯\\_(ツ)_/¯');
								break;
						}
					});
				} else {
					//It's minecraft?
					if (!lookup.isValidMinecraftName()) return commandMessage.reply('That doesn\'t seem to be a valid Minecraft name, try again?');

					findAccount.fromName(lookup, (success, result) => {
						if (!success) {
							switch (result) {
								case SpoobErrors.ACCOUNT_LOOKUP_ERROR:
									commandMessage.reply('An unknown error occurred while looking up that person\'s account.');
									break;
								case SpoobErrors.ACCOUNT_NOT_FOUND:
									commandMessage.reply('That user doesn\'t seem to have an account associated with that name.');
									break;
								default:
									commandMessage.reply('An unknown error occurred while finding that person\'s account.  ¯\\_(ツ)_/¯');
									break;
							}
						} else sendInventoryMessage(result);
					}, false);
				}
			}
		}
	},
	claimbonus: {
		auth: true,
		args: {
			min: 0,
			max: 0
		},
		process: (slackBot, commandMessage, extra) => {
			const reward = config.spoobux.daily_bonus.reward;
			const hours_between = config.spoobux.daily_bonus.hours_between;

			const account = extra.account;
			const lastDiff = ((Date.now() - account.lastbonus) / 1000) / 60 / 60;

			//Make sure they can claim it (time since last)
			if (lastDiff < hours_between) {
				//Tell them how long until they can claim it
				let timeUntilNext = (hours_between - lastDiff).toFixed(1);
				if (timeUntilNext < 0.1) timeUntilNext = 0.1;
				return commandMessage.reply(`You can't claim your daily reward yet! Try again in *${timeUntilNext}* hours.`);
			}

			account.spoobux += reward;
			account.lastbonus = Date.now();
			account.save(err => {
				if (err) return commandMessage.reply('Unable to save your account. Please try again later.');
				commandMessage.reply(`You have received a daily reward of *${reward} Spoobux*, come back in ${hours_between} hours for more! You now have \`${account.spoobux}\` spoobux.`);
			});
		}
	},
	resetbonus: {
		auth: ['Artix'],
		args: {
			min: 1,
			max: 1
		},
		process: (slackBot, commandMessage, extra) => {
			const user = commandMessage.args[0];

			if (!user.isSlackUser()) return commandMessage.reply('That doesn\'t look like a slack user to me. Try again?');

			findAccount.fromSlack(user.toSlackId()).then(result => {
				result.lastbonus = 0;
				result.save(err => {
					if (err) return commandMessage.reply('Unable to save account. Please try again later.');
					commandMessage.reply(`Daily bonus for *${result.username}* has been reset!`);
				});
			}).catch(() => {
				commandMessage.reply('Unable to retrieve account from the database.');
			});
		}
	},
	adminpay: {
		auth: ['Artix'],
		args: {
			min: 2,
			max: 2
		},
		process: (slackBot, commandMessage, extra) => {
			const user = commandMessage.args[0];
			let amount = commandMessage.args[1];

			if (!user.isSlackUser()) return commandMessage.reply('That doesn\'t look like a slack user to me. Try again?');

			if (isNaN(amount)) return commandMessage.reply('That doesn\'t look like a number to me. Try again?');
			amount = Math.floor(parseInt(amount));

			findAccount.fromSlack(user.toSlackId()).then(recipient => {
				ItemTransactions.addSpoobux(recipient, amount, true, (err, account) => {
					if (err) return commandMessage.reply('Unable to save the recipient\'s account. Please try again later.');

					commandMessage.reply(`You have transferred \`${amount}\` *Spoobux* to ${user} (They now have \`${account.spoobux}\` Spoobux.)`);
				});
			}).catch(e => {
				commandMessage.reply('I couldn\'t find that person. Do they have an authenticated account?');
			});
		}
	},
	pay: {
		auth: true,
		args: {
			min: 2,
			max: 2
		},
		process: (slackBot, commandMessage, extra) => {
			const user = commandMessage.args[0];
			let amount = commandMessage.args[1];

			if (!user.isSlackUser()) return commandMessage.reply('That doesn\'t look like a slack user to me. Try again?');
			if (user.toSlackId() === commandMessage.user.id) return commandMessage.reply('You can\'t send Spoobux to yourself, silly!');

			if (amount.toLowerCase() === 'all') amount = extra.account.spoobux;
			if (isNaN(amount)) return commandMessage.reply('That doesn\'t look like a number to me. Try again?');
			amount = Math.floor(parseInt(amount));

			if (amount < 1) return commandMessage.reply('You can\'t send that amount of Spoobux!');
			if (amount > extra.account.spoobux) return commandMessage.reply('You don\'t have enough Spoobux!');

			findAccount.fromSlack(user.toSlackId()).then(recipient => {
				ItemTransactions.addSpoobux(extra.account, -amount, true, err => {
					if (err) return commandMessage.reply('Unable to save your account. Please try again later.');

					ItemTransactions.addSpoobux(recipient, amount, true, err => {
						if (err) return commandMessage.reply('Unable to save the recipient\'s account. Please try again later.');

						commandMessage.reply(`You have sent \`${amount}\` *Spoobux* to ${user} (You now have \`${extra.account.spoobux}\` Spoobux.)`);
					});
				});
			}).catch(() => {
				commandMessage.reply('I couldn\'t find that person. Do they have an authenticated account?');
			});
		}
	},
	senditem: {
		auth: true,
		args: {
			min: 2,
			max: 3
		},
		process: (slackBot, commandMessage, extra) => {
			const user = commandMessage.args[0];
			const itemId = commandMessage.args[1];
			let amount = 1;

			if (!user.isSlackUser()) return commandMessage.reply('That doesn\'t look like a slack user to me. Try again?');
			if (user.toSlackId() == commandMessage.user.id) return commandMessage.reply('You can\'t send items to yourself, silly!');

			if (!ItemUtil.itemExists(itemId)) return commandMessage.reply('That item doesn\'t exist!');
			const item = ItemUtil.getItem(itemId);

			if (commandMessage.args.length == 3) {
				amount = commandMessage.args[2];
				if (amount.toLowerCase() == 'all') amount = ItemUtil.getAccountItemAmount(extra.account, itemId);
				if (isNaN(amount)) return commandMessage.reply('That doesn\'t look like a number to me. Try again?');
				amount = Math.floor(parseInt(amount));
			}

			if (amount < 1) return commandMessage.reply(`You can't send that amount of ${item.name}!`);
			if (amount > ItemUtil.getAccountItemAmount(extra.account, itemId)) return commandMessage.reply(`You don't have enough *${item.name}* (You need \`${amount - ItemUtil.getAccountItemAmount(extra.account, itemId)}\`)!`);

			findAccount.fromSlack(user.toSlackId()).then(recipient => {
				ItemTransactions.giveItem(extra.account, itemId, amount * -1, true, err => {
					if (err) return commandMessage.reply('Unable to save your account. Please try again later.');

					ItemTransactions.giveItem(recipient, itemId, amount, true, err => {
						if (err) return commandMessage.reply('Unable to save the recipient\'s account. Please try again later.');

						commandMessage.reply(`You have sent \`${amount}\` *${item.name}* to ${user} (You now have \`${ItemUtil.getAccountItemAmount(extra.account, itemId)}\` remaining.)`);
					});
				});
			}).catch(e => {
				commandMessage.reply('I couldn\'t find that person. Do they have an authenticated account?');
			});
		}
	},
	giveitem: {
		auth: true,
		args: {
			min: 2,
			max: 3
		},
		process: (slackBot, commandMessage, extra) => {
			const user = commandMessage.args[0];
			const itemId = commandMessage.args[1];
			let amount = 1;

			if (!user.isSlackUser()) return commandMessage.reply('That doesn\'t look like a slack user to me. Try again?');

			if (!ItemUtil.itemExists(itemId)) return commandMessage.reply('That item doesn\'t exist!');
			const item = ItemUtil.getItem(itemId);

			if (commandMessage.args.length == 3) {
				amount = commandMessage.args[2];
				if (isNaN(amount)) return commandMessage.reply('That doesn\'t look like a number to me. Try again?');
				amount = Math.floor(parseInt(amount));
			}

			findAccount.fromSlack(user.toSlackId()).then(recipient => {
				ItemTransactions.giveItem(recipient, itemId, amount, true, (err, acc) => {
					if (err) return commandMessage.reply('Unable to save the recipient\'s account. Please try again later.');

					commandMessage.reply(`You have given \`${amount}\` *${item.name}* to ${user} (They now have \`${ItemUtil.getAccountItemAmount(acc, itemId)}\`.)`);
				});
			}).catch(() => {
				commandMessage.reply('I couldn\'t find that person. Do they have an authenticated account?');
			});
		}
	},
	purchase: {
		auth: true,
		args: {
			min: 1,
			max: 2
		},
		process: (slackBot, commandMessage, extra) => {
			const itemId = commandMessage.args[0];
			//Defaults to 1, will be changed below if there are 2+ args
			let amount = 1;

			if (commandMessage.args.length == 2) {
				if (isNaN(commandMessage.args[1])) return commandMessage.reply('That doesn\'t look like a number to me. Try again?');
				amount = Math.floor(parseInt(commandMessage.args[1]));
				if (amount < 1) return commandMessage.reply('You can\'t purchase that amount!');
			}

			const item = ItemUtil.getItem(itemId);

			if (!item) return commandMessage.reply('That item doesn\'t seem to exist!');

			if (!ItemUtil.isPurchasable(itemId)) return commandMessage.reply('You can\'t purchase that item!');

			if (item.hasOwnProperty('restricted')) {
				const restriction = item.restricted;
				if (restriction.indexOf(extra.account.username) < 0) {
					return commandMessage.reply('You can\'t purchase this item!');
				}
			}

			const price = item.price * amount;

			if (extra.account.spoobux < price) return commandMessage.reply(`You don't have enough Spoobux! That costs \`${price}\`, and you have \`${extra.account.spoobux}\` (You need \`${price - extra.account.spoobux}\` more).`);

			ItemTransactions.Purchase(extra.account, itemId, amount, err => {
				if (err) return commandMessage.reply('Something went wrong, and your item could not be purchased. Try again later?');

				commandMessage.reply(`You have purchased \`${amount}\` *${item.name}*. You now have \`${ItemUtil.getAccountItemAmount(extra.account, itemId)}\`, and \`${extra.account.spoobux}\` Spoobux remaining.`);
			});
		}
	},
	open: {
		auth: true,
		args: {
			min: 0,
			max: 1
		},
		process: (slackBot, commandMessage, extra) => {
			//Defaults to 3 (Spoobox), will be changed below if there are 1+ args
			//Also searches for any crates the user has to change it.
			let itemId = 3;

			if (commandMessage.args.length >= 1) {
				if (isNaN(commandMessage.args[0])) return commandMessage.reply('That doesn\'t look like a number to me. Try again?');
				itemId = parseInt(commandMessage.args[0]);
				if (!ItemUtil.itemExists(itemId)) return commandMessage.reply('That item does not exist!');
				if (!ItemUtil.isOpenable(itemId)) return commandMessage.reply('You can\'t open that item!');
			} else {
				for (const invId of Object.keys(Object.filter(extra.account.inventory, val => val.type == ItemType.CRATE))) {
					if (ItemUtil.getAccountItemAmount(extra.account, invId) > 0) {
						//If no inventory item is selected, iterate through their inventory to find a crate they have.
						itemId = invId;
						break;
					}
				}
			}

			if (ItemUtil.getAccountItemAmount(extra.account, itemId) < 1) return commandMessage.reply('You don\'t have any of those!');

			ItemTransactions.giveItem(extra.account, itemId, -1, false);

			const item = ItemUtil.getItem(itemId);

			if (!Crates.hasOwnProperty(item.class)) {
				return commandMessage.reply('You can\'t open that item right now, because it hasn\'t been set up properly.');
			}

			const crate = new Crates[item.class]();

			crate.open(extra.account, (err, loot) => {
				if (err) return commandMessage.reply(`Something went wrong when opening your crate, sorry! Error: ${err}`);

				//Create attachments
				const attachments = [];
				for (const lootItem of loot) {
					attachments.push(getAttachmentForLoot(extra.account, lootItem));
				}

				//Send with the attachments
				slackBot.replyWithAttachments(commandMessage, `You open your *${item.name}* to find...`, attachments);
			});
		}
	},
	tradeup: {
		auth: true,
		args: {
			min: 1,
			max: 1
		},
		process: (slackBot, commandMessage, extra) => {
			const itemId = commandMessage.args[0];

			if (!ItemUtil.itemExists(itemId)) return commandMessage.reply('That item doesn\'t exist!');
			if (ItemUtil.getItem(itemId).source != ItemSource.CRATE) return commandMessage.reply('You can\'t trade up that item!');
			if (ItemUtil.getItem(itemId).rarity.equals(ItemRarity.MYTHICAL)) return commandMessage.reply('You can\'t trade up an item in that rarity!');
			if (ItemUtil.getAccountItemAmount(extra.account, itemId) < 10) return commandMessage.reply('You don\'t have enough to trade up!');

			ItemTransactions.tradeUp(extra.account, itemId, (err, newItem) => {
				if (err) return commandMessage.reply(`Unable to complete the tradeup: ${err}`);

				slackBot.sendWithAttachments(commandMessage, `You sacrifice 10 *${ItemUtil.getItem(itemId).name}* to find...`, [getAttachmentForLoot(extra.account, newItem)]);
			});
		}
	},
	topbux: {
		args: {
			min: 0,
			max: 0
		},
		process: (slackBot, commandMessage, extra) => {
			const topAmount = 15;
			db.Account.aggregate([
				//Query only people w/ preference to be on
				{ $match: { show_on_leaderboard: true } },

				//Sort
				{ $sort: { spoobux: -1 } },

				//Take top
				{ $limit: 15 }
			], (err, result) => {
				if (err) return commandMessage.reply('There was an error while querying the database. Please try again later.');

				let message = `*Top ${topAmount} Spoobux Holders*:`;
				let place = 0;
				result.forEach(account => {
					place++;
					message += `\n${place}: *${account.username}* - \`${account.spoobux}\` Spoobux`;
				});
				slackBot.reply(commandMessage, message);
			});
		}
	},
	deleteaccount: {
		auth: ['Artix'],
		args: {
			min: 1,
			max: 1
		},
		process: (slackBot, commandMessage, extra) => {
			function deleteAccount(account) {
				account.remove(err => {
					if (err) return commandMessage.reply('There was an error while deleting the account.');
					commandMessage.reply(`Successfully deleted account for *${account.username}*.`);
				});
			}

			let lookup = commandMessage.args[0];
			if (lookup.isSlackUser()) {
				lookup = lookup.toSlackId();
				findAccount.fromSlack(lookup).then(deleteAccount).catch(err => {
					switch (err) {
						case SpoobErrors.ACCOUNT_LOOKUP_ERROR:
							commandMessage.reply('An unknown error occurred while looking up that person\'s account.');
							break;
						case SpoobErrors.ACCOUNT_NOT_FOUND:
							commandMessage.reply('That user doesn\'t seem to have an account.');
							break;
						default:
							commandMessage.reply('An unknown error occurred while finding that person\'s account.  ¯\\_(ツ)_/¯');
							break;
					}
				});
			} else {
				//It's minecraft?
				if (!lookup.isValidMinecraftName()) return commandMessage.reply('That doesn\'t seem to be a valid Minecraft name, try again?');

				findAccount.fromName(lookup, (success, result) => {
					if (!success) {
						switch (result) {
							case SpoobErrors.ACCOUNT_LOOKUP_ERROR:
								commandMessage.reply('An unknown error occurred while looking up that person\'s account.');
								break;
							case SpoobErrors.ACCOUNT_NOT_FOUND:
								commandMessage.reply('That user doesn\'t seem to have an account associated with that name.');
								break;
							default:
								commandMessage.reply('An unknown error occurred while finding that person\'s account.  ¯\\_(ツ)_/¯');
								break;
						}
					} else deleteAccount(result);
				}, false);
			}
		}
	},
	migrate: {
		auth: true,
		args: {
			min: 0,
			max: 2
		},
		process: (slackBot, commandMessage, extra) => {
			if (extra.account.username === 'Artix' && commandMessage.args.length === 2) {
				const sendTo = commandMessage.args[0];
				const getFrom = commandMessage.args[1];

				if (!sendTo.isSlackUser()) {
					return commandMessage.reply('That doesn\'t look like a slack user to me. Try again?');
				}

				findAccount.fromSlack(sendTo.toSlackId()).then(res => {
					migrate(res, getFrom);
				}).catch(() => {
					commandMessage.reply('Couldn\'t retrieve the account from the database.');
				});

			} else {
				migrate(extra.account);
			}

			function migrate(account, original_name) {
				const lookup = original_name || account.username;
				const oldAccount = oldAccounts[lookup];

				//If oldAccount is undefined, there is not an account presumably
				if (!oldAccount) return commandMessage.reply(`There is no account associated with the username *${lookup}* in the old system.`);

				//Add their old stuff
				if (isNaN(oldAccount.spoobux)) return commandMessage.reply('There\'s something wrong with the way that account was stored.');
				ItemTransactions.addSpoobux(account, oldAccount.spoobux);

				let inventory = oldAccount.inventory;
				if (!inventory) inventory = {};
				for (const itemId of Object.keys(inventory)) {
					const itemAmount = ItemUtil.getAccountItemAmount(oldAccount, itemId);

					if (itemAmount <= 0) continue;

					ItemTransactions.giveItem(account, itemId, itemAmount);
				}

				ItemTransactions.saveAccount(account, (err, account) => {
					if (err) return commandMessage.reply('I wasn\'t able to save your account. Please try again later.');

					delete oldAccounts[lookup];
					const filePath = `${extra.dirname}/migration/accounts.json`;
					fs.writeFile(filePath, JSON.stringify(oldAccounts, null, '\t'), err => {
						if (err) return commandMessage.reply('Your account was saved, but something went wrong.');

						commandMessage.reply(`Your account has been restored. You have received \`${oldAccount.spoobux}\` Spoobux (You now have \`${account.spoobux}\`), and \`${Object.keys(inventory).length}\` items were transferred.`);
					});
				});
			}
		}
	},
	namechange: {
		auth: true,
		args: {
			min: 0,
			max: 0
		},
		process: (slackBot, commandMessage, extra) => {
			function notEligible(reason) {
				commandMessage.reply(`You are not eligible for an automatic name transfer.${(reason) ? ` ${reason}` : ''}`);
			}

			MojangAPI.getNameHistory(extra.account.uuid, (success, history) => {
				if (!success) return commandMessage.reply('Unable to get name history for your stored UUID.');

				if (history.length == 1) return notEligible('You have never changed your name.');

				const currentName = history[history.length - 1].name;
				if (!currentName || currentName == extra.account.username) return notEligible('Your name is already up-to-date.');

				function transferName() {
					extra.account.username = currentName;
					extra.account.namelower = currentName.toLowerCase();

					extra.account.save(err => {
						if (err) return commandMessage.reply('Unable to save your account. Please try again later.');
						commandMessage.reply(`Your account has automatically been transferred to the username *${currentName}*.`);
					});
				}

				db.Account.findOne({
					username: currentName
				}, (err, account) => {
					if (err) return commandMessage.reply('There was an error when searching for accounts under your new name.');
					if (account) {
						if (account.slack) return notEligible('There is already account registered under your new name.');

						account.remove(err => {
							if (err) return commandMessage.reply('Unable to delete the un-authenticated account currently using your new name.');
							transferName();
						});
					} else {
						transferName();
					}
				});
			});
		}
	},
	toggleleaderboard: {
		auth: true,
		args: {
			min: 0,
			max: 0
		},
		process: (slackBot, commandMessage, extra) => {
			extra.account.show_on_leaderboard = !extra.account.show_on_leaderboard;
			extra.account.save(err => {
				if (err) return commandMessage.reply('Unable to save your account. Please try again later.');

				const shownString = (extra.account.show_on_leaderboard) ? 'You will now be shown on the leaderboard.' : 'You will no longer be shown on the leaderboard.';

				commandMessage.reply(`Your preference has been saved. *${shownString}*`);
			});
		}
	},
	modsonly: {
		requiredRank: 'mod',
		args: {
			min: 0,
			max: 0
		},
		process: (slackBot, commandMessage, extra) => {
			commandMessage.reply('#ModsRuleTraineesDrool');
		}
	},
	srmodsonly: {
		requiredRank: 'srmod',
		args: {
			min: 0,
			max: 0
		},
		process: (slackBot, commandMessage, extra) => {
			commandMessage.reply('#SrModsRuleQABestTeam');
		}
	},
	leadersonly: {
		requiredRank: 'leader',
		args: {
			min: 0,
			max: 0
		},
		process: (slackBot, commandMessage, extra) => {
			commandMessage.reply('Whats a leader?');
		}
	},
	copyme: {
		auth: ['Artix'],
		args: {
			min: 1,
			max: 1
		},
		process: (slackBot, commandMessage, extra) => {
			const newSlack = commandMessage.args[0];

			if (!/U[A-z0-9]{8}/.test(newSlack)) return commandMessage.reply('That doesn\'t seem to be a slack user ID. Try again?');

			db.Account.findOne({ slack: newSlack }, (err, res) => {
				if (err) return commandMessage.reply('There was an error looking up your account.');
				if (res) return commandMessage.reply('There is already an account with that slack.');

				const newAccount = new db.Account();
				for (const Property of Object.keys(Schemas.Account)) {
					newAccount[Property] = extra.account[Property];
				}

				newAccount.slack = newSlack;

				newAccount.save(err => {
					if (err) return commandMessage.reply('There was an error when saving the duplicated account.');

					commandMessage.reply(`Your account has successfully been duplicated to the slack ID *${newSlack}*`);
				});
			});
		}
	},
	myid: {
		args: {
			min: 0,
			max: 0
		},
		process: (slackBot, commandMessage, extra) => {
			commandMessage.reply(`Your ID is ${commandMessage.user.id}`);
		}
	},
	artixonly: {
		auth: ['Artix'],
		args: {
			min: 0,
			max: 0
		},
		process: (slackBot, commandMessage, extra) => {
			commandMessage.reply(':penguin:');
		}
	},
	getaccount: {
		auth: ['Artix'],
		args: {
			min: 1,
			max: 1
		},
		process: (slackBot, commandMessage, extra) => {
			const name = commandMessage.args[0];

			db.Account.findOne({ namelower: name }, (err, res) => {
				if (err) return commandMessage.reply(`Err: ${err}`);

				if (!res) return commandMessage.reply('no results');

				commandMessage.reply(JSON.stringify(res));
			});
		}
	},
	forcechangeid: {
		auth: ['Artix'],
		args: {
			min: 2,
			max: 2
		},
		process: (slackBot, commandMessage, extra) => {
			const oldSlack = commandMessage.args[0];
			const newSlack = commandMessage.args[1];

			db.Account.findOne({ slack: oldSlack }, (err, account) => {
				if (err) return commandMessage.reply(`Error: ${err}`);

				if (!account) return commandMessage.reply('No results');

				account.slack = newSlack;
				account.save(err => {
					if (err) return commandMessage.reply('Unable to save account.');

					commandMessage.reply('Saved account.');
				});
			});
		}
	},
	reportname: {
		args: {
			min: 1,
			max: 1
		},
		auth: true,
		process: (slackBot, commandMessage, extra) => {
			if (!commandMessage.args[0].isValidMinecraftName()) return commandMessage.reply('That doesn\'t seem to be a Minecraft name to me. Try again?');

			InappropriateNames.sendMessage(commandMessage.args[0], `(Reported by *${extra.account.username}*)`)
				.then(() => {
					commandMessage.reply('Successfully reported name to RC.');
				}).catch(e => {
				if ((e.message || e || '').includes('already been')) {
					commandMessage.reply('That name has already been reported, but thanks anyways!');
					return;
				}

				commandMessage.reply('Unable to report name to RC, please try again later.');
			});
		}
	},
	pcount: {
		type: 'hidden',
		args: {
			min: 1,
			max: 1
		},
		process: (slackBot, commandMessage, extra) => {
			if (extra.restricted !== false) return;

			commandMessage.reply('The data represented by this command is no longer being updated. Keep that in mind.\n_Looking for punishment count..._');

			db.PunishAdmin.findOne({
				name: commandMessage.args[0]
			}, (err, result) => {
				if (err) return commandMessage.reply('There was an error while looking up that Punishment Admin.');
				if (!result) return commandMessage.reply('There don\'t seem to be any logs for that Punishment Admin. Do they exist?');

				const slackMessage = `Punishment Stats for Admin *${result.name}*\n*Punishments:* ${result.punishments}\n*Removals:* ${result.removals}`;
				commandMessage.reply(slackMessage);
			});
		}
	},
	subscribed: {
		auth: ['Artix'],
		args: {
			min: 0,
			max: 1
		},
		process: (slackBot, commandMessage, extra) => {
			// If there's a certain channel the user is querying
			if (commandMessage.args.length == 1) {
				const slackMessage = `I am *${(MineplexSocket.subscribedChannels.indexOf(commandMessage.args[0]) > -1) ? 'currently' : 'not'}* subscribed to the channel *${commandMessage.args[0]}*`;
				commandMessage.reply(slackMessage);
			} else {
				//They want to see a list of subscribed channels
				const slackMessage = `I am currently subscribed to \`${MineplexSocket.subscribedChannels.length}\` channel(s)${(MineplexSocket.subscribedChannels.length > 0) ? `:\n*${MineplexSocket.subscribedChannels.join('*, *')}*` : '.'}`;
				commandMessage.reply(slackMessage);
			}
		}

	},
	subscribe: {
		auth: ['Artix'],
		args: {
			min: 1,
			max: 1
		},
		process: (slackBot, commandMessage) => {
			const channel = commandMessage.args[0];

			MineplexSocket.subscribe(channel);

			commandMessage.reply(`Sent a request to subscribe to *${channel}*!`);
		}
	},
	vl: {
		name: 'vl',
		description: 'Gets VL and times violated of a certain player for a certain type.',
		type: 'hidden',
		args: {
			min: 1,
			max: 1
		},
		usage: '',
		process: (slackBot, commandMessage, extra) => {
			if (extra.restricted !== false) return commandMessage.reply('You can\'t use that command in this org.');

			commandMessage.reply('This command is deprecated, but I will search anyways.');

			const lookup = commandMessage.args[0].replace('\n', '');

			db.Hacker.findOne({ username: lookup }, (err, result) => {
				if (err) {
					log.error(`Error retrieving violation count for ${lookup}: ${err}`);
					return commandMessage.reply('Unable to retrieve information from the database. Please try again later.');
				}

				if (!result) return commandMessage.reply(`The user *${lookup}* was not found in the database.`);

				let messageToSend = `:crossed_swords: *GWEN* :crossed_swords:\n${commandMessage.user.mention} Violation stats for the user \`${lookup}\`:`;

				for (const stat of Object.keys(db.schemas.Hacker.stats)) {
					messageToSend += `\n*${stat}*: \`${result.stats[stat].max}\` max violations, \`${result.stats[stat].total}\` total alerts.`;
				}

				slackBot.chat(commandMessage.channel, messageToSend);
			});
		}
	},
	givechests: {
		disabled: true,
		auth: ['Artix'],
		args: {
			min: 0,
			max: 0
		},
		process: (slackBot, commandMessage, extra) => {
			const staffList = require('../../config/staff');

			function getGiveItemCommand(player, amount, item) {
				return `/giveitem ${player} ${amount} ${item}`;
			}

			function getMythicalsCommand(player) {
				return getGiveItemCommand(player, 3, 'Mythical Chest');
			}

			function getIlluminatedCommand(player) {
				return getGiveItemCommand(player, 1, 'Illuminated Chest');
			}

			function queueCommands(player) {
				extra.minecraftBotUS.queueMessage(getMythicalsCommand(player));
				extra.minecraftBotUS.queueMessage(getIlluminatedCommand(player));
			}

			for (const staff of staffList) {
				queueCommands(staff);
			}

			commandMessage.reply('Commands have been queued.');
		}
	},
	echo: {
		auth: ['Artix'],
		args: {
			min: 0,
			max: 3000
		},
		process: (slackBot, commandMessage) => {
			slackBot.chat(commandMessage.channel, commandMessage.args.join(' '));
		}
	},
	shop: {
		args: {
			min: 0,
			max: 0
		},
		process: (slackBot, commandMessage, extra) => {
			let message = '*Spoobux Supply Co.*\nAvailable Items:';

			const items = Object.filter(Object.assign({}, ItemUtil.getItems()), item => {
				return item.source == ItemSource.SHOP;
			});

			for (const itemId of Object.keys(items)) {
				const item = items[itemId];

				if (item.hasOwnProperty('restricted')) continue;

				message += `\n*${item.name}* \`#${itemId}\``;

				if (item.hasOwnProperty('description')) {
					message += ` - _${item.description}_`;
				}

				message += ` - \`${item.price}\` Spoobux`;
			}

			message += `\n-----\nPurchase an item with \`@${slackBot.self.name} purchase <id> [amount (defaults to 1)]\``;

			slackBot.reply(commandMessage, message);
		}
	}
};

function getVisibleCommandsList() {
	const list = [];
	for (const commandName of Object.keys(commands)) {
		const command = commands[commandName];
		if (command.type == 'hidden' || command.alias) continue;
		if (command.hasOwnProperty('auth') && typeof command.auth == 'object') continue;
		list.push({
			name: commandName,
			auth: command.auth,
			requiredRank: command.requiredRank
		});
	}
	return list;
}

function getCommandsListString() {
	const list = getVisibleCommandsList();
	let listStr = '';
	for (const command of list) {
		listStr += `\n\`${command.name}\``;
		if (command.auth != undefined) {
			if (command.auth == true) {
				listStr += ' (Requires Auth)';
			} else {
				listStr += ' (Requires No Auth)';
			}
		}
		if (command.requiredRank) {
			listStr += ` [*${MineplexAPI.ranks.getConverted(command.requiredRank)}+*]`;
		}
	}
	return listStr;
}

module.exports = LegacyConvert(commands);