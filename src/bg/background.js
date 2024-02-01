
// Pray Times!
// By: Hamid Zarrabi-Zadeh
// http://PrayTimes.org


//-------------------------- Init ----------------------------

function init() {
    storage.initSync(function() {
        install();
        launch();
    });
}

// install addon
function install() {
    if (isLatestVersion())
        return;
    initOptions();
    upgrade();
    if (locationNotSet())
        initLocation();
    log('Addon installed');
}

// launch addon
function launch() {
    addListeners();
    run();
    checkBadge();
    log('Addon launched');
}

// main function
function run() {
    // set one minute intervals
    setTimeout(run, OneMinute - (Date.now() % OneMinute));
    refresh();
}

//-------------------------- Main ----------------------------

init();
