function exportJson() {
	const jsonString = JSON.stringify(jsonData, null, 2);
	const blob = new Blob([jsonString], { type: 'application/json' });
	const link = document.createElement('a');
	link.href = URL.createObjectURL(blob);
	link.download = 'form-data.json';
	link.click();
}

function importJson() {
	const input = document.createElement('input');
	input.type = 'file';
	input.accept = 'application/json';
	input.addEventListener('change', function () {
		const file = input.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = function (e) {
			try {
				const imported = JSON.parse(e.target.result);
				// Optional: validate schema
				if (imported.formSchema && imported.formData) {
					jsonData = imported;
					saveData();
				} else {
					alert('Invalid format: Must contain formSchema and formData.');
				}
			} catch (err) {
				alert('Failed to parse JSON file.');
			}
		};
		reader.readAsText(file);
	});
	input.click();
}

function doAlert(inalert) {
	if (inalert === undefined) {
		alert('yep this is an alert');
	} else if (typeof inalert === 'object') {
		alert(JSON.stringify(inalert));
	} else {
		alert(inalert);
	}
}
