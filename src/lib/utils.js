
// Pray Times!
// By: Hamid Zarrabi-Zadeh
// http://PrayTimes.org


//------------------------- Constants ----------------------------

var Times = [
    'fajr', 'sunrise', 'dhuhr', 'asr',
    'sunset', 'maghrib', 'isha', 'midnight'
];
var Prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
var Abbr = [
    'Fajr', 'Sunr', 'Duhr', 'Asr',
    'Suns', 'Mgrb', 'Isha', 'Midn'
];

var NumTimes = Times.length;
var OneMinute = 60000;
var OneDay = 86400000;

var DisplayPeriod = 2 * OneMinute;
var NotifsGap = 2 * OneMinute;
var BadgeCheckPeriod = 5000;
var DebugMode = true;


//------------------------- Global Objects ----------------------------

var bg = chrome.extension.getBackgroundPage();
var audio = new Audio();

var noop = function() {};
var log = DebugMode ? console.log : noop;
function sleep(ms) {return new Promise(r => setTimeout(r, ms))}


//------------------------- Local Variables ----------------------------

var lastBadgeUpdate = 0;
var audioTimeout = 0;


//------------------------- Date Functions ----------------------------

// get local time zone
function localTimezone() {
    var date = new Date();
	var year = date.getFullYear();
	var t1 = gmtOffset([year, 0, 1]);
	var t2 = gmtOffset([year, 6, 1]);
	return Math.min(t1, t2);
}

// get local daylight saving
function localDST() {
    var date = new Date();
	return 1 * (gmtOffset(date) != localTimezone());
}

// GMT offset for a given date
function gmtOffset(date) {
	if (date.constructor === Date)
		date = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
	var localDate = new Date(date[0], date[1] - 1, date[2], 12, 0, 0, 0);
	var GMTString = localDate.toGMTString();
	var GMTDate = new Date(GMTString.substring(0, GMTString.lastIndexOf(' ') - 1));
	var hoursDiff = (localDate - GMTDate) / (1000 * 60 * 60);
	return hoursDiff;
}

// return timezone
function getTimezone() {
    if (storage.get('general.timezoneManual').enabled)
        return storage.get('general.timezoneManual').timezone;
    return localTimezone();
}

// return daylight saving
function getDST() {
    if (storage.get('general.timezoneManual').enabled)
        return 1 * storage.get('general.timezoneManual').daylight;
    return localDST();
}

// return system timezone difference in minutes
function getTimezoneDiff(timestamp) {
    var timezone = getTimezone() + getDST();
    var date = new Date(timestamp);
    return date.getTimezoneOffset() + timezone * 60;
}


//------------------------- Prayer Times ----------------------------

// adjust prayer times calculation settings
function adjustCalcSettings() {
    var method = storage.get('calculation.method');
    if (method == 'Custom')
        prayTimes.adjust(getCustomParams());
    else
        prayTimes.setMethod(method);
    prayTimes.adjust({
        dhuhr: storage.get('calculation.settings').dhuhr + ' min',
        asr: storage.get('calculation.settings').asr,
        highLats: storage.get('calculation.settings').highLats
    });
}

// get custom method parameters
function getCustomParams() {
    var params = storage.get('calculation.params');
    return {
        fajr: params.fajr,
        maghrib: params.maghrib + (params.maghribUnit == 'degrees' ? '' : ' min'),
        isha: params.isha + (params.ishaUnit == 'degrees' ? '' : ' min'),
        midnight: params.midnight
    }
}

// update prayer times
function updatePrayerTimes() {
    if (locationNotSet())
        return;
    var location = storage.get('location');
    var now = new Date();
    var date = [now.getFullYear(), now.getMonth() + 1, now.getDate() - 1]; // yesterday

    adjustCalcSettings();
    var times = [];
    for (var day = -1 ; day <= 1 ; day++) {
        var timeTable = prayTimes.getTimes(date, [location.lat, location.lng], 0, 0, 'Timestamp');
    	for (var i in Times) {
            var time = timeTable[Times[i]];
    		times.push(getRoundedTime(time));
    	}
        date[2] += 1;
    }
    storage.set({times: times}, 'local');
    // log('Prayer times updated');
}

// update prayer times if needed
function updateTimesIfNeeded() {
    var now = new Date();
    var today = now.getMonth() + '-' + now.getDate();
    if (storage.get('lastUpdate') != today) {
        updatePrayerTimes();
        storage.set({lastUpdate: today}, 'local');
    }
}

// get next prayer time
function getNextTime() {
	var now = Date.now();
    var times = storage.get('times');
    var displayTimes = storage.get('display.times');
	for (var i in times)
		if (now <= times[i] + DisplayPeriod && displayTimes[getTime(i).label])
            break;
    var minsLeft = Math.floor(times[i] / 60000 + 0.5) - Math.floor(now / 60000);
    return {label: getTime(i).label, minsLeft: minsLeft, index: i};
}

// get time label and name
function getTime(indx) {
    var i = indx % NumTimes;
    return {label: Times[i], name: labelName(Times[i])};
}

// return time rounded and timzone offsetted
function getRoundedTime(timestamp) {
    var mins = Math.round(timestamp / OneMinute);
    return (mins + getTimezoneDiff(timestamp)) * OneMinute;
}

// check if time is for prayer
function isPrayerTime(label) {
    return Prayers.indexOf(label) != -1;
}

// get time left as a string
function getTimeLeftString(minsLeft) {
	var mins = minsLeft % 60;
    var hours = Math.floor(minsLeft / 60);
    var minsTag = (mins == 1) ? 'minute' : 'minutes';
	var hoursTag = (hours == 1) ? 'hour' : 'hours';
	var str = '';
	if (hours > 0)
		str = `${hours} ${hoursTag}` + (mins > 0 ? ' and ' : '');
	if (mins > 0)
		str += `${mins} ${minsTag}`;
	return str;
}


//------------------------- Formatting Functions ----------------------------

// format date
function formatDate(date) {
    return (new Date(date)).toDateString();
}

// format Unix timestamp
function formatTime(timestamp, format) {
    var date = new Date(timestamp);
    var suffixes = ['am', 'pm'];
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var suffix = (format == '12h') ? suffixes[hours < 12 ? 0 : 1] : '';
    var hour = (format == '24h') ? twoDigits(hours) : ((hours + 12 - 1) % 12 + 1);
    var minute = twoDigits(minutes) + (suffix ? ' ' + suffix : '')
    return hour + ':' + minute;
}

// add leading zero if needed
function twoDigits(num) {
    var str = '0' + num
    return str.substr(str.length - 2);
}

// convert time label to name
function labelName(label) {
    return capitalize(label);
}

// return abbreviated label name
function labelNameAbbr(label) {
    return Abbr[Times.indexOf(label)];
}

// capitalize the first letter of string
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// shorten address string
function shortAddress(address) {
    var maxLen = 24;
    if (address.length <= maxLen)
        return address;
    var tokens = address.split(', ');
    var locality = tokens[0];
    var full = locality + ((tokens.length > 1) ? (', ' + tokens[tokens.length - 1]) : '');
    return full.length > maxLen ? locality : full;
}


//------------------------- GeoLocation ----------------------------

// get position of an address
function getAddressPosition(address, onSuccess, onFail=noop) {
    address = address.replace(' ', '+');
    var url = 'https://geocoder.api.here.com/6.2/geocode.json' +
            '?app_id=bGqzxuwO3peafwpIFxKN&app_code=0v3nZQepiPnUFv9Jl_uURg' +
            '&searchtext=' + address;

	$.getJSON(url, function(data, textStatus) {
        onSuccess(data);
	})
    .fail(onFail);
}

// get address of a position obtained from the browser
function getPositionAddress(position, onSuccess, onFail=noop) {
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;
    log('Address:', lat, lng);
    var url = 'https://reverse.geocoder.api.here.com/6.2/reversegeocode.json' +
            '?app_id=bGqzxuwO3peafwpIFxKN&app_code=0v3nZQepiPnUFv9Jl_uURg' +
            '&mode=retrieveAreas&prox=' + `${lat},${lng},250`;

	$.getJSON(url, function(data, textStatus) {
        onSuccess(data);
	})
    .fail(onFail);
}

// get current position from browser
function getCurrentPosition(onSuccess, onFail=noop) {
    if (!navigator.geolocation)
		onFail();
    else
        navigator.geolocation.getCurrentPosition(onSuccess, onFail);
}


//------------------------- Location Update ----------------------------

// add a new location item
function addLocationItem(data, itemNum) {
    var result = data.Response.View[0].Result[itemNum];
    item = {
        address: result.Location.Address.Label,
        lat: result.Location.DisplayPosition.Latitude,
        lng: result.Location.DisplayPosition.Longitude
    };
    var locations = storage.get('locations', []);
    locations.push(item);
    storage.set({'locations': locations});
    setCurrentLocation(item.address);
}

// remove specified location item
function removeLocationItem(itemNum) {
    var locations = storage.get('locations');
    var location = storage.get('location');
    var needsRelocate = (locations[itemNum].address == location.address);
    locations.splice(itemNum, 1);
    if (needsRelocate) {
        if (locations.length) {
            var newIndex = Math.min(itemNum, locations.length - 1);
            setCurrentLocation(locations[newIndex].address);
        }
        else {
            storage.set({'location': ''});
        }
    }
    storage.set({'locations': locations});
}


// set location to the given address
function setCurrentLocation(address) {
    var locations = storage.get('locations');
    var item = 0;
    for (var i in locations) {
        if (locations[i].address == address)
            item = i;
    }
    storage.set({'location': locations[item]});
}


//------------------------- Initialize ----------------------------

// save defaults to storage
function initOptions() {
    for (var i in preferences)
        if (storage.get(i) === undefined)
            storage.set({[i]: preferences[i]});

    if (!storage.get('general.timezoneManual'))
        storage.set({'general.timezoneManual': {timezone: localTimezone(), daylight: false}});

    if (!storage.get('audioFile'))
        fetchFile(storage.get('sound.audio'));
}

// update a setting in storage
function updateSetting(setting, updates) {
    var value = storage.get(setting);
    Object.assign(value, updates);
    storage.set({[setting]: value});
}

// initialize location
function initLocation() {
    getCurrentPosition(function(position) {
        getPositionAddress(position, function(data) {
            if (data.Response.View.length == 0)
                return;
            addLocationItem(data, 0);
            initCalcMethod(getCountryCode(data.Response.View[0].Result[0]));
        });
    });
}

// extract country code from map result
function getCountryCode(result) {
    var countryCode = result.Location.Address.Country;
    return countryCodeMap[countryCode];
}

// initialize calculation method for country code
function initCalcMethod(countryCode) {
    if (!countryCode)
        return;
    var method = getDefaultMethod(countryCode);
    storage.set({'calculation.method': method});
    log(`Set default method for ${countryCode} to ${method}`);
}

// get default method
function getDefaultMethod(countryCode) {

    var method = 'MWL';
    for (var i in defaultMethods)
        if (defaultMethods[i].indexOf(countryCode) >= 0)
            method = i;
    return method;
}

// default calculation methods
var defaultMethods = {
    'ISNA': [
        'AI', 'AG', 'AR', 'AW', 'BS', 'BB', 'BZ', 'BM', 'BO', 'BR', 'CA', 'KY', 'CL',
        'CO', 'CR', 'CU', 'DM', 'DO', 'EC', 'SV', 'FK', 'GF', 'GD', 'GP', 'GT', 'GY', 'HT',
        'HN', 'JM', 'MQ', 'MX', 'MS', 'AN', 'NI', 'PA', 'PY', 'PE', 'PR', 'SH', 'PM', 'GS',
        'KN', 'LC', 'VC', 'SR', 'TT', 'TC', 'US', 'UY', 'VE', 'VG', 'VI'
    ],
    'Egypt': [
        'DZ', 'AO', 'BJ', 'BW', 'BF', 'BI', 'CI', 'CM', 'CV', 'CF', 'TD', 'KM', 'CG', 'CD',
        'DJ', 'EG', 'GQ', 'ER', 'ET', 'GA', 'GM', 'GH', 'GN', 'GW', 'KE', 'LS', 'LR', 'LY',
        'MG', 'MW', 'ML', 'MR', 'MU', 'YT', 'MA', 'MZ', 'NA', 'NE', 'NG', 'RE', 'RW', 'ST',
        'SN', 'SC', 'SL', 'SO', 'ZA', 'SD', 'SZ', 'TZ', 'TG', 'TN', 'UG', 'EH', 'ZM', 'ZW'
    ],
    'Makkah': [
        'SA', 'OM', 'KW', 'BH', 'YE', 'AE', 'QA', 'JO', 'PS'
    ],
    'Karachi': [
        'PK', 'ID', 'BD', 'AF'
    ],
    'Tehran': ['IR'],
    'Jafari': ['IQ']
};

// country code mapping
var countryCodeMap = {
    'AFG': 'AF', 'ALA': 'AX', 'ALB': 'AL', 'DZA': 'DZ', 'ASM': 'AS', 'AND': 'AD', 'AGO': 'AO', 'AIA': 'AI', 'ATA': 'AQ', 'ATG': 'AG', 'ARG': 'AR', 'ARM': 'AM', 'ABW': 'AW', 'AUS': 'AU', 'AUT': 'AT', 'AZE': 'AZ', 'BHS': 'BS', 'BHR': 'BH', 'BGD': 'BD', 'BRB': 'BB', 'BLR': 'BY', 'BEL': 'BE', 'BLZ': 'BZ', 'BEN': 'BJ', 'BMU': 'BM', 'BTN': 'BT', 'BOL': 'BO', 'BIH': 'BA', 'BWA': 'BW', 'BVT': 'BV', 'BRA': 'BR', 'VGB': 'VG', 'IOT': 'IO', 'BRN': 'BN', 'BGR': 'BG', 'BFA': 'BF', 'BDI': 'BI', 'KHM': 'KH', 'CMR': 'CM', 'CAN': 'CA', 'CPV': 'CV', 'CYM': 'KY', 'CAF': 'CF', 'TCD': 'TD', 'CHL': 'CL', 'CHN': 'CN', 'HKG': 'HK', 'MAC': 'MO', 'CXR': 'CX', 'CCK': 'CC', 'COL': 'CO', 'COM': 'KM', 'COG': 'CG', 'COD': 'CD', 'COK': 'CK', 'CRI': 'CR', 'CIV': 'CI', 'HRV': 'HR', 'CUB': 'CU', 'CYP': 'CY', 'CZE': 'CZ', 'DNK': 'DK', 'DJI': 'DJ', 'DMA': 'DM', 'DOM': 'DO', 'ECU': 'EC', 'EGY': 'EG', 'SLV': 'SV', 'GNQ': 'GQ', 'ERI': 'ER', 'EST': 'EE', 'ETH': 'ET', 'FLK': 'FK', 'FRO': 'FO', 'FJI': 'FJ', 'FIN': 'FI', 'FRA': 'FR', 'GUF': 'GF', 'PYF': 'PF', 'ATF': 'TF', 'GAB': 'GA', 'GMB': 'GM', 'GEO': 'GE', 'DEU': 'DE', 'GHA': 'GH', 'GIB': 'GI', 'GRC': 'GR', 'GRL': 'GL', 'GRD': 'GD', 'GLP': 'GP', 'GUM': 'GU', 'GTM': 'GT', 'GGY': 'GG', 'GIN': 'GN', 'GNB': 'GW', 'GUY': 'GY', 'HTI': 'HT', 'HMD': 'HM', 'VAT': 'VA', 'HND': 'HN', 'HUN': 'HU', 'ISL': 'IS', 'IND': 'IN', 'IDN': 'ID', 'IRN': 'IR', 'IRQ': 'IQ', 'IRL': 'IE', 'IMN': 'IM', 'ISR': 'IL', 'ITA': 'IT', 'JAM': 'JM', 'JPN': 'JP', 'JEY': 'JE', 'JOR': 'JO', 'KAZ': 'KZ', 'KEN': 'KE', 'KIR': 'KI', 'PRK': 'KP', 'KOR': 'KR', 'KWT': 'KW', 'KGZ': 'KG', 'LAO': 'LA', 'LVA': 'LV', 'LBN': 'LB', 'LSO': 'LS', 'LBR': 'LR', 'LBY': 'LY', 'LIE': 'LI', 'LTU': 'LT', 'LUX': 'LU', 'MKD': 'MK', 'MDG': 'MG', 'MWI': 'MW', 'MYS': 'MY', 'MDV': 'MV', 'MLI': 'ML', 'MLT': 'MT', 'MHL': 'MH', 'MTQ': 'MQ', 'MRT': 'MR', 'MUS': 'MU', 'MYT': 'YT', 'MEX': 'MX', 'FSM': 'FM', 'MDA': 'MD', 'MCO': 'MC', 'MNG': 'MN', 'MNE': 'ME', 'MSR': 'MS', 'MAR': 'MA', 'MOZ': 'MZ', 'MMR': 'MM', 'NAM': 'NA', 'NRU': 'NR', 'NPL': 'NP', 'NLD': 'NL', 'ANT': 'AN', 'NCL': 'NC', 'NZL': 'NZ', 'NIC': 'NI', 'NER': 'NE', 'NGA': 'NG', 'NIU': 'NU', 'NFK': 'NF', 'MNP': 'MP', 'NOR': 'NO', 'OMN': 'OM', 'PAK': 'PK', 'PLW': 'PW', 'PSE': 'PS', 'PAN': 'PA', 'PNG': 'PG', 'PRY': 'PY', 'PER': 'PE', 'PHL': 'PH', 'PCN': 'PN', 'POL': 'PL', 'PRT': 'PT', 'PRI': 'PR', 'QAT': 'QA', 'REU': 'RE', 'ROU': 'RO', 'RUS': 'RU', 'RWA': 'RW', 'BLM': 'BL', 'SHN': 'SH', 'KNA': 'KN', 'LCA': 'LC', 'MAF': 'MF', 'SPM': 'PM', 'VCT': 'VC', 'WSM': 'WS', 'SMR': 'SM', 'STP': 'ST', 'SAU': 'SA', 'SEN': 'SN', 'SRB': 'RS', 'SYC': 'SC', 'SLE': 'SL', 'SGP': 'SG', 'SVK': 'SK', 'SVN': 'SI', 'SLB': 'SB', 'SOM': 'SO', 'ZAF': 'ZA', 'SGS': 'GS', 'SSD': 'SS', 'ESP': 'ES', 'LKA': 'LK', 'SDN': 'SD', 'SUR': 'SR', 'SJM': 'SJ', 'SWZ': 'SZ', 'SWE': 'SE', 'CHE': 'CH', 'SYR': 'SY', 'TWN': 'TW', 'TJK': 'TJ', 'TZA': 'TZ', 'THA': 'TH', 'TLS': 'TL', 'TGO': 'TG', 'TKL': 'TK', 'TON': 'TO', 'TTO': 'TT', 'TUN': 'TN', 'TUR': 'TR', 'TKM': 'TM', 'TCA': 'TC', 'TUV': 'TV', 'UGA': 'UG', 'UKR': 'UA', 'ARE': 'AE', 'GBR': 'GB', 'USA': 'US', 'UMI': 'UM', 'URY': 'UY', 'UZB': 'UZ', 'VUT': 'VU', 'VEN': 'VE', 'VNM': 'VN', 'VIR': 'VI', 'WLF': 'WF', 'ESH': 'EH', 'YEM': 'YE', 'ZMB': 'ZM', 'ZWE': 'ZW'
};


//-------------------------- Upgrade ----------------------------

// check if latest version is installed
function isLatestVersion() {
    return storage.get('installedVersion') == chrome.runtime.getManifest().version;
}

// check if location not set
function locationNotSet() {
    return !storage.get('location');
}

// upgrade addon
function upgrade() {
    var oldVer = storage.get('installedVersion');
    var newVer = chrome.runtime.getManifest().version;

    // upgrade to version 2.1
    if (oldVer < '2.1') {
        updateSetting('calculation.settings', {
            asr: storage.get('calculation.asr'),
            highLats: storage.get('calculation.highLats')
        });
    }

    // upgrade to version 2.2
    if (oldVer < '2.2') {
        copyLocalStorage();
    }

    // update version number
    storage.set({'installedVersion': newVer});
    log('Upgraded to version', newVer);
}

// copy local storage to chrome local
function copyLocalStorage() {
    var a = Object.keys(localStorage);
    for (var i in a) {
        if (a[i] != 'times' && a[i].substring(0, 4) != 'last')
            storage.set({ [a[i]]: storage.get(a[i]) });
    }
}


//------------------------- Update Functions ----------------------------

// refresh counters
function refresh() {
    if (locationNotSet())
        return;
    updateTimesIfNeeded();
    updateBadge();
    updateTooltip();
    updateNotifications();
}

// update icon badge
function updateBadge() {
    if (locationNotSet())
        return;
    var countdown = storage.get('alerts.countdown.show');
    var next = getNextTime();
    var text = '';
    if (countdown) {
        var minsLeft = next.minsLeft;
        if (minsLeft <= storage.get('alerts.countdown.timer')) {
            text = `${minsLeft}`;
            if (minsLeft > 60)
                text = `${Math.floor(minsLeft / 60)}:${twoDigits(minsLeft % 60)}`;
            if (minsLeft >= 600)
                text = `${Math.floor(minsLeft / 60)} h`;
        }
        if (minsLeft <= 0)
            text = labelNameAbbr(next.label);
    }
    lastBadgeUpdate = Date.now();
    var color = (next.minsLeft > 60) ? '#06f' : '#d00';
    chrome.browserAction.setBadgeBackgroundColor({color: color});
    chrome.browserAction.setBadgeText({text: text});
}

// check if badge needs update
function checkBadge() {
    setTimeout(checkBadge, BadgeCheckPeriod);
    if (Date.now() - lastBadgeUpdate < OneMinute)
        return;
    updateBadge();
}

// update toolbar tooltip
function updateTooltip() {
	var next = getNextTime();
    var timeLeft = getTimeLeftString(next.minsLeft);
    var timeName = labelName(next.label);
	var title = (next.minsLeft > 0) ? `${timeName} in ${timeLeft}` : `Now: ${timeName}`;
    chrome.browserAction.setTitle({title: title});
}

// update notifications
function updateNotifications() {
    var notif = storage.get('alerts.notification');
    var next = getNextTime();
    var name = labelName(next.label);
    if (storage.get('sound.adhan') && next.minsLeft == 0) {
        chrome.browserAction.setBadgeText({text: labelNameAbbr(next.label)});
        playAdhan();
    }
    if (notif.enabled) {
        var message = isPrayerTime() ? notif.text : '';
        if (next.minsLeft == 0)
            showNotification(name, message);
    }
    if (storage.get('alerts.prenotif.show')) {
        var timer = storage.get('alerts.prenotif.timer');
        if (next.minsLeft == timer)
            showNotification(name, timer + ' minutes left');
    }
}

// display a notification
function showNotification(title, message) {
    if (Date.now() - storage.get('lastNotifTime') < NotifsGap)
        return;
    chrome.notifications.create(title, {
        type: 'basic',
        iconUrl: '/icons/icon.png',
        // silent: true,
        title: title,
        message: message
    });
    storage.set({'lastNotifTime': Date.now()}, 'local');
    log('Notification for ' + title);
}

// play athan
function playAdhan() {
    if (Date.now() - storage.get('lastAdhanTime') < NotifsGap)
        return;
    playAudio();
    storage.set({'lastAdhanTime': Date.now()}, 'local');
    log('Adhan played');
}

// add listeners
function addListeners() {
    storage.addListener(function(changes) {
        updatePrayerTimes();
        refresh();
    });
    chrome.browserAction.onClicked.addListener(stopAudio);
    chrome.notifications.onClicked.addListener(stopAudio);
}


//------------------------- Audio Functions ----------------------------

// play audio
function playAudio() {
    var audio = storage.get('audioFile');
    if (!audio || !audio.src)
        return;
    bg.audio.src = audio.src;
    bg.audio.volume = storage.get('sound.volume') / 100;
    bg.audio.play();
    togglePlayButton(false);

    chrome.browserAction.setPopup({popup: ''});
    sleep(300)
    .then( function() {
        // log(bg.audio.duration);
        audioTimeout = setTimeout(stopAudio, bg.audio.duration * 1000);
    });
}

// stop audio
function stopAudio() {
    bg.audio.pause();
    clearTimeout(audioTimeout);
    chrome.browserAction.setPopup({popup: '/src/popup/popup.html'})
    togglePlayButton(true);
}

// toggle play buttons
function togglePlayButton(toggle) {
    // $('#stop').prop('disabled', !toggle);
    $('#play').toggle(toggle);
    $('#stop').toggle(!toggle);
}


//------------------------- Read File ----------------------------

// fetch file
function fetchFile(url, onSuccess, onFail=noop) {
    fetch(url)
    .then(function(res) {
        res.blob()
        .then(function(blob) {
            readFile(blob, onSuccess);
        });
    })
    .catch(onFail);
}

// read file
function readFile(blob, callback=noop) {
    var reader = new FileReader();
    reader.onload = function(res) {
        var file = {
            size: blob.size,
            type: blob.type,
            src: res.target.result
        };
        storage.set({audioFile: file});
        callback(file);
    };
    reader.readAsDataURL(blob);
}
