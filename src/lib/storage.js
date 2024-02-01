
// Pray Times!
// By: Hamid Zarrabi-Zadeh
// http://PrayTimes.org


/*
    USAGE:
    - storage.set({key: value})
    - storage.get(key, [defaultValue])
    - storage.get({key: defaultValue}, [callback])
    - storage.get(keys_array, [callback])
*/


//------------------------- Options  ----------------------------

var syncWithChromeStorage = true;
var chromeStorageType = 'local';  // local or sync


//------------------------- Storage Engine  ----------------------------

storage = {

    listener: null,

    // get a data object from storage
    get: function(object, callback) {
        if (typeof object === 'string') {
            var value = localStorage[object];
            return value ? JSON.parse(value) : callback;
        }

        var res = {};
        for (var key in object) {
            var defaultValue = object[key];
            if (object instanceof Array) {
                key = object[key];
                defaultValue = undefined;
            }
            var value = localStorage[key];
            res[key] = value ? JSON.parse(value) : object[key];
        }
        if (typeof callback === 'function')
            callback(res);
        return res;
    },

    // set a data object in storage
    set: function(object, opt) {
        for (var key in object)
            localStorage[key] = JSON.stringify(object[key]);
        if (syncWithChromeStorage && opt != 'local' && opt != 'nosync')
            chrome.storage[chromeStorageType].set(object);
        var bgStorage = chrome.extension.getBackgroundPage().storage;
        if (bgStorage.listener && opt != 'local' && opt != 'nosync')
            bgStorage.listener(object);
    },

    // add a listener to the storage
    addListener: function(listener) {
        chrome.extension.getBackgroundPage().storage.listener = listener;
    },

    // initialize and sync storage
    initSync: function(callback) {
        if (syncWithChromeStorage) {
            chrome.storage[chromeStorageType].get(null, function(object) {
                storage.set(object, 'nosync')
                if (typeof callback === 'function')
                    callback();
            });

            // add listener
            chrome.storage.onChanged.addListener(function(changes, namespace) {
                var relatedChanges = {};
                for (key in changes) {
                    if (namespace == chromeStorageType) {
                        relatedChanges[key] = changes[key].newValue;
                    }
                }
                storage.set(relatedChanges, 'nosync');
            });
        }
        else if (typeof callback === 'function') {
            callback();
        }
    }
};
