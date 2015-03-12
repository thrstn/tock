// Create objects
tock = window.tock || {};
tock.export = {};

tock.export.toCSV = function () {
	var data = tock.storage.getItem('layout').entries,
		csv = '';

	//loop is to extract each row
	for (var i = 0; i < data.length; i++) {
		var row = "",
			elapsed = data[i].elapsed,
			task = data[i].task,
			log = data[i].log;

		row += '"' + tock.ui.formatTimeJira(elapsed) + '",';
		row += '"' + tock.ui.formatTimeDP(elapsed) + '",';
		row += '"' + task + '",';
		row += '"' + log + '",';

		row.slice(0, row.length - 1);

		//add a line break after each row
		csv += row + '\r\n';
	}

	if (csv === '') {
		alert("Invalid data");
		console.log(csv);
		return;
	}

	//Generate a file name
	var fileName = "export";

	//Initialize file format you want csv or xls
	var uri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);

	// Now the little tricky part.
	// you can use either>> window.open(uri);
	// but this will not work in some browsers
	// or you will not get the correct file extension

	//this trick will generate a temp <a /> tag
	var link = document.createElement("a");
	link.href = uri;

	//set the visibility hidden so it will not effect on your web-layout
	link.style = "visibility:hidden";
	link.download = fileName + ".csv";

	//this part will append the anchor tag and remove it after automatic click
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
};