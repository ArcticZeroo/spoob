const SamczsunAPI = require('../lib/api/SamczsunAPI');
const MineplexAPI = require('../lib/api/MineplexAPI');

module.exports = {
    disallowed: [
        {
            field: 'name',
            reason: 'Mojang Username',
            matches: ['____fox____', '_tommo_', 'aeplh', 'amir343', 'angryem', 'ashrafi',
                'binni', 'blurpi', 'bopogamel', 'c418', 'carlmanneh', 'carnalizer', 'darngeek', 'dinnerbone', 'eldrone',
                'elevenen', 'engst', 'excitedze', 'frukthamster', 'geuder', 'grumm', 'hampus', 'helloiammarsh', 'hey',
                'hoodad', 'jeb_', 'jonkagstrom', 'kappe', 'klumpig', 'krisjelbring', 'ladyagnes', 'lisa', 'mahuldur',
                'mansolson', 'marc', 'marc_irl', 'masseffect', 'midnightenforcer', 'minecraftchick', 'modhelius',
                'mojangjonas', 'mojangsta', 'mollstam', 'neonmaster', 'notch', 'olle', 'olofcarlson', 'phreakholm',
                'poipoichen', 'pretto', 'profmobius', 'razzleberryfox', 'searge', 'searge_dp', 'shoghicp', 'slicedlime',
                'sockerpappan', 'themogminer', 'vaktis', 'vubui', 'xlson', 'xsson', 'yoloswag4lyfe', 'zeeraw']
        },
        {
            field: 'name',
            reason: 'Illegal Username',
            matches: ['hypixel', 'chiss', 'dctr', 'blondebug', 'dooskee', 'tomcallister', 'jessiemarcia', 'spu_', 'sp614x', 'deadmau5', 'gwen', 'mineplex', 'samczsun', 'sethbling', 'xisuma', 'cubehamster', 'natet_bird', 'qwertyuiopthepie', 'akronman1', 'Drullkus', 'MrMessiah', 'JulianClark', 'dannyBstyle', 'cheapsh0t']
        },
        {
            field: 'uuid',
            reason: 'Illegal UUID',
            matches: [
                '5399b615-3440-4c66-939d-ab1375952ac3', // Drullkus (Prismarine Cape)
                '7f0eda55-7034-4dc8-886d-d94321cdedcf', // MrMessiah (Personal Cape)
                'd90b68bc-8172-4329-a047-f1186dcd4336', // akronman1 (Millionth Customer)
                '144ad5f0-e879-4141-a489-8ed5d496cab9', // JulianClark (Personal Cape)
                '1c063715-395b-4db9-bc2a-d5dfd20366f7', // dannyBstyle (Personal Cape)
                '5797c479-ad5a-43b0-87ca-8852d65ac639'  // cheapsh0t (Personal Cape)
            ]
        }
    ]
};