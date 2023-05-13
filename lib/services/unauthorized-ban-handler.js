const { punishments: { Punishment, Category } }  = require('../api/SamczsunAPI');

function banStaffMember(name) {
    const punishment = new Punishment({
        target: name,
        category: Category.PBAN,
        reason: '[GWEN] Unauthorized Punishment Removal'
    });

    return punishment.punish();
}

function reBanTarget(original){
    const punishment = new Punishment({
        target: original.target.name,
        category: original.category,
        reason: original.reason,
        severity: original.severity,
        duration: Punishment.getRemainingDuration(original),
        preventChecks: true
    });

    return punishment.punish();
}

exports.handle = (slackBot, staffMember, originalPunishment, type) => {
    const baseMessage = `:warning: A(n) *${type || 'Unauthorized Punishment Removal'}* on *${originalPunishment.target.name}* has been ${(type) ? 'removed' : 'made'} by *${staffMember}* :warning:`;

    function send(msg) {
        slackBot.chat('pc-network-security', msg);
    }

    banStaffMember(staffMember).then(() => {
        reBanTarget(originalPunishment).then(() => {
            send(`${baseMessage}\nI was able to ban the staff member and re-ban the target. Please investigate.`);
        }).catch(err => {
            send(`${baseMessage}\nI was able to ban the staff member but could not re-ban the target (and then gave up). Error: \`${err}\``);
        });
    }).catch(err => {
        send(`${baseMessage}\nI was unable to ban the staff member (and then gave up). Error: \`${err}\``);
    });
};