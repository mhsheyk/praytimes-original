
// Pray Times!
// By: Hamid Zarrabi-Zadeh
// http://PrayTimes.org


//------------------------- Location ----------------------------

// update location list
function updateLocationsList() {
    var locations = storage.get('locations');
    var location = storage.get('location');
    var list = $('<div>');
    for (var i in locations) {
        var address = locations[i].address;
        list.append($('<div>', {class: 'radio-option'})
            .append($('<input>', {type: 'radio', name: 'location', value: address, id: 'll-' + i}))
            .append($('<label>', {for: 'll-' + i}).text(address)
                .append($('<a>', {class: 'delete-item', title: 'Remove Location'}).text('X'))
            )
        );
    }
    $("#locations-list").empty().append(list);
    var address = location ? location.address : 'none';
    $('input[name=location][value="' + address + '"]').prop("checked", true);

    $('#locations-list input').on('change', function() {
        var address = $('input[name=location]:checked', '#locations-list').val();
        setCurrentLocation(address);
        showSavedAlert();
        flashSavedAlert();
        refresh();
    });

    $('a.delete-item').click(function() {
        var itemNum = $('a.delete-item').index(this);
        removeLocationItem(itemNum);
        updateLocationsList();
    });
}

// show found locations
function showFoundLocations(data) {
    if (data.Response.View.length == 0) {
        locationFailed();
        return;
    }
    $('#location-loading').hide();
    var results = data.Response.View[0].Result;

    if (results.length == 1) {
        addLocationItem(data, 0);
        updateLocationsList();
        hideFindBar();
        return;
    }

    var list = $('<ul>');
    for (var i in results)
        list.append($('<li>').text('- ')
            .append($('<a>', {href: '#', title: 'Add to list'})
                .text(results[i].Location.Address.Label)
            )
        );
    $("#found-locations").empty().append(list);
    $('#found-locations').slideDown();

    $('#found-locations a').click(function() {
        var itemNum = $('#found-locations a').index(this);
        addLocationItem(data, itemNum);
        updateLocationsList();
        hideFindBar();
    });
}

function startLocating() {
    $('#location-loading').show();
}

function locationFailed(err) {
    $('#location-loading').hide();
    alert('Error finding location!');
};

function hideFindBar() {
    $('#add-location-div').hide();
    $('#found-locations').hide();
    $('#add-location').show();
    $('#location-field').val('');
};


//------------------------- Sound ----------------------------

// get audio file
function getAudioFile(audioUrl) {
    $('#audio-loading').show();
    fetchFile(audioUrl, function() {
        playAudio();
        $('#audio-loading').hide();
    },
    function() {
        alert('Connection error.');
        $('#audio-loading').hide();
    });
}

// handle select audio event
function handleAudioSelect(select) {
    var url = $(select).val();
    log(url);
    stopAudio();
    if (url == 'custom') {
        $('#select-audio').show();
        var audioFile = storage.get('customAudioFile');
        storage.set({audioFile: audioFile});
        playAudio();
    }
    else {
        $('#select-audio').hide();
        if (url[0] != '/')
            url = 'http://praytimes.org/audio/adhan/' + url;
        getAudioFile(url);
    }
}

// init sound items
function initSoundItems() {

    $('#play').click(playAudio);
    $('#stop').click(stopAudio);
    $('#select-audio').toggle(storage.get('sound.audio') == 'custom');
    togglePlayButton(true);

    // audio change
    $('div#sound select').first().on('change', function() {
        handleAudioSelect(this)
    });

    // volume change
    $('div#sound select').last().on('change', function() {
        bg.audio.volume = $(this).val() / 100;
    });

    // local audio select
    $('#select-audio').click( function() {
        $('#local-audio-file').click();
    });
    $('#local-audio-file').on('change', function(e) {
        var target = e.currentTarget;
        var file = target.files[0];

        if (target.files && file) {
            readFile(file, function(audioFile) {
                storage.set({customAudioFile: audioFile});
                playAudio();
            });
        }
    });
}


//------------------------- Calculation ----------------------------

// init calculation items
function initCalculations() {
    var methods = prayTimes.getDefaults();
    setMethodItems(storage.get('calculation.method'));
    $($('#calculation select')[0]).on('change', function() {
        setMethodItems($(this).val());
    });
}

// set method items
function setMethodItems(method) {
    activateMethodItems(method == 'Custom');
    var params = (method == 'Custom') ? getCustomParams() : prayTimes.getDefaults()[method].params;
    var inputs = $('#calculation div.suboptions:first input');
    $(inputs[0]).val(prayTimes.value(params.fajr));
    $(inputs[2]).val(prayTimes.value(params.maghrib));
    $(inputs[5]).val(prayTimes.value(params.isha));
    selectRadio([inputs[1]], 1 * prayTimes.isMin(params.fajr));
    selectRadio([inputs[3], inputs[4]], 1 * prayTimes.isMin(params.maghrib));
    selectRadio([inputs[6], inputs[7]], 1 * prayTimes.isMin(params.isha));
    $('#calculation div.suboptions:first select').val(params.midnight);
}

// activate or deactivate items
function activateMethodItems(active = true) {
    var dis = active ? false : 'disabled';
    $('#calculation div.suboptions:first').find('input, select, label').attr({disabled: dis})
}

// select given radio item
function selectRadio(radios, num) {
    for (var i in radios)
        $(radios[i]).removeAttr('checked');
    $(radios[num]).attr({checked: 'checked'});
}


//------------------------- Init Tabs ----------------------------

var $saveContainer = document.querySelector('.save-container');
var showSavedAlert = flashClass($saveContainer, 'show', 2000);
var flashSavedAlert = flashClass($saveContainer, 'flash', 150);


// init DOM items in the options page
function initPageItems() {
    $(document).ready(function() {
        $('#add-location').click(function() {
            $(this).hide();
            $('#add-location-div').show();
            $('#location-field').focus();
        });

        $('#cancel-find').click(function() {
            hideFindBar();
        });

        $('#find-current-location').click(function() {
            startLocating();
            getCurrentPosition();
        });

        $('#contact').click(function() {
            window.location.href='http://praytimes.org/contact';
        });

        $('#find-location').click(function() {
            var address = $('#location-field').val();
            if (address != '') {
                startLocating();
                getAddressPosition(address, showFoundLocations, locationFailed);
            }
        });

        $('#location-field').keypress(function(e) {
            if (e.which == 13) { //Enter key pressed
                $('#find-location').click();
            }
        });

        var timezone = localTimezone();
        var timezoneStr = 'UTC';
        for (var i in timezoneList)
            if (timezoneList[i].value == timezone)
                timezoneStr = timezoneList[i].desc;
        $('#timezone').text(timezoneStr);

        $('#version').text(chrome.runtime.getManifest().version);
    });

}


//------------------------- Main ----------------------------

$(document).ready(function() {
    updateLocationsList();
    initPageItems();
    initCalculations();
    initSoundItems();
});
