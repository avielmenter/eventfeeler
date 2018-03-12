function isInputEmpty(fieldName) {
	var field = document.getElementById(fieldName);
	if (!field) return true;
	
	var val = field.value;
	return val == null || val == "";
}

function validateInput() {
	//Both the name and date fields cannot be null!
	if (isInputEmpty("name") && (isInputEmpty("before") || isInputEmpty("after"))) {
		alert("Either both the date fields must be completely filled or the 'Find' field must be filled.")
		return false;
	}

	if(!isInputEmpty("before") || !isInputEmpty("after")){
		if(isInputEmpty("after") || isInputEmpty("before")){
			alert("Both before and after fields must be entered.")
			return false;
		}

		var before = document.getElementById("before").value;
		var after = document.getElementById("after").value;

		var beforeValid = moment(before, 'YYYY-MM-DD',true).isValid();
		var afterValid = moment(after, 'YYYY-MM-DD', true).isValid();
		
		if(!beforeValid || !afterValid){
			alert("Response for date fields are not valid");
			return false;
		}
	}
	
	return true;
}

function search(){
	if (!validateInput()) // checks to make sure at least dates or name is filled
		return;

	var url = "searchresults.html?dummy=1";
	if (!isInputEmpty("name"))
		url += "&name=" + document.getElementById("name").value;
	if (!isInputEmpty("before") && !isInputEmpty("after")) {
		url += "&since=" + document.getElementById("before").value;
		url += "&until=" + document.getElementById("after").value;
	}
	if (!isInputEmpty("category")) {
		url += "&category=" + document.getElementById("category").value;
	}

	location.href = url;
}