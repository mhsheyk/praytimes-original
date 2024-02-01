// Pray Times!
// By: Hamid Zarrabi-Zadeh
// http://PrayTimes.org


var preferences = {

    'locations': [],


    // ---------- display ----------

    'display.times': {
        fajr: true,
        sunrise: true,
        dhuhr: true,
        asr: true,
        sunset: false,
        maghrib: true,
        isha: true,
        midnight: false
    },

    'display.format': '12-hours',


    // ---------- calculation ----------

    'calculation.method': 'MWL',

    'calculation.params': {
        fajr: 18,
        maghrib: 0,
        isha: 17,
        midnight: 'Standard',
        fajrUnit: 'degrees',
        maghribUnit: 'minutes',
        ishaUnit: 'degrees',
    },

    'calculation.settings': {
        dhuhr: 0,
        asr: 'Standard',
        highLats: 'NightMiddle',
    },


    // ---------- alerts ----------

    'alerts.notification': {
        enabled: true,
        text: 'It is time to pray'
    },

    'alerts.prenotif.show': false,
    'alerts.prenotif.timer': 10,
    'alerts.countdown.show': true,
    'alerts.countdown.timer': 10,


    // ---------- sound ----------

    'sound.adthan': false,
    'sound.audio': '/audio/adhan.mp3',
    'sound.volume': 70,
    'customAudioFile': {}
};
