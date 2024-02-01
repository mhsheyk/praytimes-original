
// Pray Times!
// By: Hamid Zarrabi-Zadeh
// http://PrayTimes.org


//------------------------- Time Table ----------------------------

// update daily table
function updateDailyTable() {
	if (locationNotSet())
        return;
	var times = storage.get('times');
	var next = getNextTime();
	var displayTimes = storage.get('display.times');
	var dayOffset = Math.floor(next.index / NumTimes);
	var date = Date.now() + (dayOffset - 1) * OneDay;

	// build time table
	var format = (storage.get('display.format') == '24-hours') ? '24h' : '12h';
	var table = $('<table>', {id: 'daytable'})
		.append($('<tr>').append($('<th>', {colspan: '2'}).text(formatDate(date))));
	for (var i in times) {
		var time = getTime(i);
		if (displayTimes[time.label] && dayOffset == Math.floor(i / NumTimes)) {
			table.append($('<tr>', {class: (time.label == next.label) ? 'next-time' : ''})
				.append($('<td>', {class: 'cell time-label'}).text(time.name))
				.append($('<td>', {class: 'cell time'}).text(formatTime(times[i], format))));
		}
	}

	// build time left message
	var minsLeft = next.minsLeft;
	var timeName = labelName(next.label);
	var timeStr = getTimeLeftString(minsLeft).replace('&', 'and');
	var message = `Time to ${timeName}:`;
	if (minsLeft <= 0) {
		message = '';
		timeStr = `Now: ${timeName}`;
	}

	// update popup
	$('#timetable').empty().append(table);
	$('#address').text(shortAddress(storage.get('location').address));
	$('#message').text(message);
	$('#time-left').text(timeStr);
}


//------------------------- Init ----------------------------

$(document).ready(function() {
    updateDailyTable();

	$('#settings').click(function() {
		chrome.runtime.openOptionsPage();
	});
});
