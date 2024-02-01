
// Pray Times!
// By: Hamid Zarrabi-Zadeh
// http://PrayTimes.org


//------------------------- Init ----------------------------

chromeOptions.opts.autoSave = true;
chromeOptions.opts.saveDefaults = false;
chromeOptions.opts.about = true;


//------------------------- Tab Data ----------------------------

var timezoneList = [
    {desc: 'UTC -12:00', value: -12},
    {desc: 'UTC -11:00', value: -11},
    {desc: 'UTC -10:00', value: -10},
    {desc: 'UTC -09:30', value: -9.5},
    {desc: 'UTC -09:00', value: -9},
    {desc: 'UTC -08:00', value: -8},
    {desc: 'UTC -07:00', value: -7},
    {desc: 'UTC -06:00', value: -6},
    {desc: 'UTC -05:00', value: -5},
    {desc: 'UTC -04:00', value: -4},
    {desc: 'UTC -03:30', value: -3.5},
    {desc: 'UTC -03:00', value: -3},
    {desc: 'UTC -02:00', value: -2},
    {desc: 'UTC -01:00', value: -1},
    {desc: 'UTC +00:00', value: 0},
    {desc: 'UTC +01:00', value: 1},
    {desc: 'UTC +02:00', value: 2},
    {desc: 'UTC +03:00', value: 3},
    {desc: 'UTC +03:30', value: 3.5},
    {desc: 'UTC +04:00', value: 4},
    {desc: 'UTC +04:30', value: 4.5},
    {desc: 'UTC +05:00', value: 5},
    {desc: 'UTC +05:30', value: 5.5},
    {desc: 'UTC +05:45', value: 5.75},
    {desc: 'UTC +06:00', value: 6},
    {desc: 'UTC +06:30', value: 6.5},
    {desc: 'UTC +07:00', value: 7},
    {desc: 'UTC +08:00', value: 8},
    {desc: 'UTC +08:30', value: 8.5},
    {desc: 'UTC +08:45', value: 8.75},
    {desc: 'UTC +09:00', value: 9},
    {desc: 'UTC +09:30', value: 9.5},
    {desc: 'UTC +10:00', value: 10},
    {desc: 'UTC +10:30', value: 10.5},
    {desc: 'UTC +11:00', value: 11},
    {desc: 'UTC +12:00', value: 12},
    {desc: 'UTC +12:45', value: 12.75},
    {desc: 'UTC +13:00', value: 13},
    {desc: 'UTC +14:00', value: 14},
];

var methodList = [
    {value: 'MWL', desc: 'Muslim World League'},
    {value: 'ISNA', desc: 'Islamic Society of North America (ISNA)'},
    {value: 'Egypt', desc: 'Egyptian General Authority of Survey'},
    {value: 'Makkah', desc: 'Umm Al-Qura University, Makkah'},
    {value: 'Karachi', desc: 'University of Islamic Sciences, Karachi'},
    {value: 'Tehran', desc: 'Institute of Geophysics, University of Tehran'},
    {value: 'Jafari', desc: 'Shia Ithna-Ashari, Leva Institute, Qum'},
    {value: 'Custom', desc: 'Custom'},
];

var timeList = [
    { name: 'fajr', desc: 'Fajr' },
    { name: 'sunrise', desc: 'Sunrise' },
    { name: 'dhuhr', desc: 'Dhuhr' },
    { name: 'asr', desc: 'Asr' },
    { name: 'sunset', desc: 'Sunset' },
    { name: 'maghrib', desc: 'Maghrib' },
    { name: 'isha', desc: 'Isha' },
    { name: 'midnight', desc: 'Midnight' },
];

var audioList = [
    { value: 'custom', desc: 'Custom Sound' },
    { value: '/audio/adhan.mp3', desc: 'Default (Allahu Akbar)' },
    { value: 'Sunni/Abdul-Basit.mp3', desc: 'Abdul-Basit' },
    { value: 'Sunni/Abdul-Ghaffar.mp3', desc: 'Abdul-Ghaffar' },
    { value: 'Sunni/Abdul-Hakam.mp3', desc: 'Abdul-Hakam' },
    { value: 'Sunni/Adhan Alaqsa.mp3', desc: 'Adhan Alaqsa' },
    { value: 'Sunni/Adhan Egypt.mp3', desc: 'Adhan Egypt' },
    { value: 'Sunni/Adhan Halab.mp3', desc: 'Adhan Halab' },
    { value: 'Sunni/Adhan Madina.mp3', desc: 'Adhan Madina' },
    { value: 'Sunni/Adhan Makkah.mp3', desc: 'Adhan Makkah' },
    { value: 'Shia/Aghati.mp3', desc: 'Aghati (Shia)' },
    { value: 'Sunni/Al-Hossaini.mp3', desc: 'Al-Hossaini' },
    { value: 'Sunni/Bakir Bash.mp3', desc: 'Bakir Bash' },
    { value: 'Shia/Ghelvash.mp3', desc: 'Ghelvash (Shia)' },
    { value: 'Sunni/Hafez.mp3', desc: 'Hafez' },
    { value: 'Sunni/Hafiz Murad.mp3', desc: 'Hafiz Murad' },
    { value: 'Shia/Kazem-Zadeh.mp3', desc: 'Kazem-Zadeh (Shia)' },
    { value: 'Sunni/Menshavi.mp3', desc: 'Menshavi' },
    { value: 'Shia/Moazzen-Zadeh Ardabili.mp3', desc: 'Moazzen-Zadeh Ardabili (Shia)' },
    { value: 'Shia/Mohammad-Zadeh.mp3', desc: 'Mohammad-Zadeh (Shia)' },
    { value: 'Sunni/Naghshbandi.mp3', desc: 'Naghshbandi' },
    { value: 'Shia/Rezaeian.mp3', desc: 'Rezaeian (Shia)' },
    { value: 'Shia/Rowhani-Nejad.mp3', desc: 'Rowhani-Nejad (Shia)' },
    { value: 'Sunni/Saber.mp3', desc: 'Saber' },
    { value: 'Shia/Salimi.mp3', desc: 'Salimi (Shia)' },
    { value: 'Shia/Sharif.mp3', desc: 'Sharif (Shia)' },
    { value: 'Sunni/Sharif Doman.mp3', desc: 'Sharif Doman' },
    { value: 'Shia/Sobhdel.mp3', desc: 'Sobhdel (Shia)' },
    { value: 'Shia/Tasvieh-Chi.mp3', desc: 'Tasvieh-Chi (Shia)' },
    { value: 'Shia/Tookhi.mp3', desc: 'Tookhi (Shia)' },
    { value: 'Sunni/Yusuf Islam.mp3', desc: 'Yusuf Islam' },
];

var locationsHTML = `
    <div class="suboption multiline">
        <div class="field-container">
            <div id="locations-list" class="radio-options">
            </div>
        </div>
    </div>
    <div id="add-location-box">
        <button id="add-location">Add Location</button>
        <div id="add-location-div" style="display: none;">
            <input type="text" id="location-field" style="width:220px">
            <button id="find-location">Add</button>
            <button id="cancel-find">Cancel</button>
            <!--button id="find-current-location">Auto Locate</button-->
            <img src="/img/loading.gif" id="location-loading"/>
        </div>
        <div id="found-locations" style="display: none;"></div>
    </div>
`;


//------------------------- Add Tabs ----------------------------

chromeOptions.addTab('General', [
    { type: 'h3', desc: 'Location' },
    { type: 'html', html: locationsHTML},

    { type: 'h3', desc: 'Time Zone' },
    { type: 'html', html: `<p class="comment">
            System default is <span id='timezone'>..</span></p>`},
    { name: 'timezoneManual', desc: 'Set time zone manually', options: [
        { type: 'row', options: [
            { name: 'timezone', disc: 'Time Zone', type: 'select', options: timezoneList },
            { name: 'daylight', desc: 'Add daylight saving' }
        ] },
    ] },
]);


chromeOptions.addTab('Display', [
    { type: 'h3', desc: 'Show Times' },
    { name: 'times', type: 'object', options: timeList },

    { type: 'h3', desc: 'Time Format' },
    { name: 'format', type: 'radio', options: ['12-hours', '24-hours']},
]);


chromeOptions.addTab('Calculation', [
    { type: 'h3', desc: 'Calculation Method' },
    { type: 'row', options: [
        { type: 'html', html: '<span class="label" style="margin-left:26px">Method:</span>' },
        { name: 'method', type: 'select', options: methodList },
    ] },
    { name: 'params', type: 'object', layout: 'row', options: [
        { type: 'row', options: [
            { type: 'html', html: '<span class="label">Fajr:</span>' },
            { type: 'text', name: 'fajr' },
            { name: 'fajrUnit', type: 'radio', options: ['degrees'] },
        ] },
        { type: 'row', options: [
            { type: 'html', html: '<span class="label">Maghrib:</span>' },
            { type: 'text', name: 'maghrib' },
            { name: 'maghribUnit', type: 'radio', options: [
                'degrees', { value: 'minutes', desc: 'minutes after Sunset' }
            ] },
        ] },
        { type: 'row', options: [
            { type: 'html', html: '<span class="label">Isha:</span>' },
            { type: 'text', name: 'isha' },
            { name: 'ishaUnit', type: 'radio', options: [
                'degrees', { value: 'minutes', desc: 'minutes after Maghrib' }
            ] },
        ] },
        { type: 'row', options: [
            { type: 'html', html: '<span class="label">Midnight:</span>' },
            { name: 'midnight', type: 'select', options: ['Standard', 'Jafari'] },
        ] },
    ] },

    { type: 'h3', desc: 'Other Settings' },
    { name: 'settings', type: 'object', layout: 'row', options: [
        { type: 'row', options: [
            { type: 'html', html: '<span class="label">Dhuhr:</span>' },
            { type: 'text', name: 'dhuhr' },
            { type: 'html', html: 'minutes after mid-day' },
        ] },
        { type: 'row', options: [
            { type: 'html', html: '<span class="label">Asr:</span>' },
            { name: 'asr', type: 'select', options: ['Standard', 'Hanafi'] },
        ] },
        { type: 'row', options: [
            { type: 'html', html: '<span class="label">Adjustment:</span>' },
            { name: 'highLats', type: 'select', options: [
                { value: 'NightMiddle', desc: 'Middle of Night' },
                { value: 'OneSeventh', desc: 'One-Seventh of Night' },
                { value: 'AngleBased', desc: 'Angle-Based'}, 'None'
            ] },
            { type: 'html', html: '(for locations with <a href="http://praytimes.org/calculation#Higher_Latitudes">higher latitudes</a>)' },
        ] },
    ] },

]);

chromeOptions.addTab('Alerts', [
    { type: 'h3', desc: 'Notifications' },
    { type: 'html', html: '<div style="margin-top: -.5em;"></div>' },
    { type: 'row', options: [
        { name: 'prenotif.show', desc: 'Display a notification' },
        { name: 'prenotif.timer', type: 'select', options: [
            {desc: '5 minutes', value: 5},
            {desc: '10 minutes', value: 10},
            {desc: '15 minutes', value: 15},
            {desc: '20 minutes', value: 20},
            {desc: '25 minutes', value: 25},
            {desc: '30 minutes', value: 30},
        ] },
        { type: 'html', html: 'before each prayer time' },
    ] },
    { type: 'html', html: '<div style="margin-top: -.5em;"></div>' },
    { name: 'notification', desc: 'Display a notification at prayer times', options: [
        { type: 'row', options: [
            { type: 'html', html: 'Notification text:', },
            { type: 'text', name: 'text'},
        ] },
    ] },

    { type: 'h3', desc: 'Countdown' },
    { type: 'html', html: '<div style="margin-top: -.5em;"></div>' },
    { type: 'row', options: [
        { name: 'countdown.show', desc: 'Show countdown' },
        { name: 'countdown.timer', disc: 'Alert time:', type: 'select', options: [
            {desc: '5 minutes', value: 5},
            {desc: '10 minutes', value: 10},
            {desc: '15 minutes', value: 15},
            {desc: '30 minutes', value: 30},
            {desc: '60 minutes', value: 60},
            {desc: 'Always', value: 1000},
        ] },
        { type: 'html', html: 'before each prayer time' },
    ] },
]);

chromeOptions.addTab('Sound', [
    { type: 'h3', desc: 'Adhan' },
    { name: 'adhan', desc: 'Play adhan at prayer times'},
    { type: 'row', options: [
        { name: 'audio', type: 'select', options: audioList },
        { type: 'html', html: '<button id="select-audio">Choose File</button>' },
        { type: 'html', html: '<img src="/img/loading.gif" id="audio-loading" />' },
    ] },
    { type: 'row', options: [
        { type: 'html', html: `
            <button id="play">▶ Play</button>
            <button id="stop">Stop</button>
            &nbsp; Volume:`,
        },
        { name: 'volume', type: 'select', options: [
            10, 20, 30, 40, 50, 60, 70, 80, 90, 100
        ] },
    ]},

]);
