# Spoob Bot

This is a bot that I wrote from scratch for use by Mineplex staff members. It has some of the following features (non-exhaustive):
- Connects to multiple slack workspaces at once
- Connects to multiple minecraft servers at once
- Implements custom command handlers to tie Minecraft <-> Slack identities
  - Also provides authorization mechanisms to allow privileged actions from Slack, e.g. punishing players
- Provides a significant amount of admin tools:
  - Punishments from slack
  - Tracking rank updates
  - Automatic reversal of punishment removal for network bans and other high-value player bans
  - Centralized tracking for famous players to allow moderation teams to follow them without spamming our Redis with find commands
  - Reporting of excessive /find usage
  - Reporting of /disguise misuse
  - Viewing of GWEN (anticheat) top-hitting players in multiple detection categories via slack
- Performs automated network monitoring to catch network failures significantly earlier, sometimes 30+ minutes before we would otherwise know
- A currency system which provides no actual value but is fun!
  - a pretty-much-rigged slot machine
  - daily credit system
  - credits given for each punishment (apparently, I have no memory of adding this)
  - a randomized crate system like every good game should have

## Installation/Usage

Unfortunately there's a bunch of pieces that won't work since the underlying components (certain Mineplex APIs) no longer exist. 
Slack APIs also are different now - bots generally need to be added as apps, which changes some parts of the flow.

Otherwise, you could run most of this by updating the config files to make servers/ports/usernames/passwords non-empty.