import { NeuralNetwork } from "./neuralNetwork.js";

let width = 60;
let height = 60;

let autoShootEnabled = false;

// 10 is the multiple of the length of image layer 1 filters and image layer 2 filters

// type can be either "classification" or "imageClassification"

let presets = {
	inputs: [width, height],
	layers: [800],
	outputs: 2,
	type: "imageClassification",
	learningRate: 0.2,
	decimalPlaces: 5,
	activation: ["sigmoid", "sigmoid"]
}

let net = new NeuralNetwork(presets);

// Listen for when network activation is changed

document.getElementById("activationSelect").addEventListener("change", e => {

	let activation = document.getElementById("activationSelect").value;

	startNetPresets.activation = [activation];

	presets.activation = [activation]

	/*if (activation == "tanh" || activation == "leakyrelu") {
		presets.activation = [activation, "tanh"];
	}

	if (activation == "sin") {
		presets.activation = [activation, activation];
	}*/

	net = new NeuralNetwork(presets);

	updateStartNet();

})

// Load and copy the starting weights and biases of ther network

let startModel = "";

let startNetPresets = {};
let startNet;

fetch("/startNetwork.json")
	.then(res => {
		return res.json();
	}).then(data => {

		startModel = data;

		startNetPresets = {
			inputs: startModel.inputs,
			layers: startModel.layers,
			outputs: startModel.outputs,
			type: "classification",
			learningRate: 0.2,
			decimalPlaces: startModel.decimalPlaces,
			activation: ["sigmoid", "sigmoid"]
		}

		updateStartNet()

	})

function updateStartNet() {

	startNet = new NeuralNetwork(startNetPresets);

	startNet.weights = startModel.weights;
	startNet.biases = startModel.biases;

	net.copy(startNet);

}

/*console.log(net.predict([1]));

for (let i = 0; i < 1; i++) {
	net.train([1], [0, 1]);
}

console.log("Trained");
console.log(net.predict([1]));*/

// Reset network on press

document.getElementById("resetNet").addEventListener("click", e => {

	if (confirm("Would you like to reset the network?")) {

		// Reset network

		net = new NeuralNetwork(presets);

		net.copy(startNet);

		addToConsole("");
		addToConsole("+-+-+-+-+-+-+-+-+-+-+");
		addToConsole("Network Reset");
		addToConsole("+-+-+-+-+-+-+-+-+-+-+");
		addToConsole("");

	}

})

document.getElementById("learningRate").addEventListener("change", e => {

	net.learningRate = Number(document.getElementById("learningRate").value);

})

// Dark and light modes

let viewMode = "dark";

function changeMode(newMode) {
	viewMode = newMode;

	if (viewMode == "light") {

		document.getElementById("toggleMode").innerHTML = '<i data-feather="sun"></i>';

		document.body.style.background = "rgb(240, 240, 240)";

		document.body.style.setProperty("--mainColour", "rgb(255, 255, 255)");
		document.body.style.setProperty("--complimentColour", "rgb(240, 240, 240)");
		document.body.style.setProperty("--fontColour", "rgb(13, 13, 13)");
		document.body.style.setProperty("--buttonColour", "rgba(200, 200, 230, 1.0)");

	}
	else {

		document.getElementById("toggleMode").innerHTML = '<i data-feather="moon"></i>';

		document.body.style.background = "#0B0C23";

		document.body.style.setProperty("--mainColour", "#1D0C3B");
		document.body.style.setProperty("--complimentColour", "#261348");
		document.body.style.setProperty("--fontColour", "rgb(255, 255, 255)");
		document.body.style.setProperty("--buttonColour", "rgba(120, 120, 170, 1.0)");

	}

	feather.replace();
}

changeMode("dark");

document.getElementById("toggleMode").addEventListener("click", e => {

	if (viewMode == "dark") {
		changeMode("light");
	}
	else {
		changeMode("dark");
	}

})

// Access camera

// Can be 'user' or 'environment' to access back or front camera (NEAT!)
let facingMode = "user";

document.getElementById("flipCamera").addEventListener("click", e => {

	if (facingMode == "user") {
		facingMode = "environment";

		document.body.style.setProperty("--mirrorAngle", "0deg");
	}
	else {
		facingMode = "user";

		document.body.style.setProperty("--mirrorAngle", "180deg");
	}

	toggleCamera();

})

let isPaused = false;

document.getElementById("pausePlay").addEventListener("click", e => {

	isPaused = !isPaused;

	if (isPaused) {

		document.getElementById("cameraVideo").pause();
		document.getElementById("pausePlay").innerHTML = '<i data-feather="play"></i>';
	}
	else {

		document.getElementById("cameraVideo").play();
		document.getElementById("pausePlay").innerHTML = '<i data-feather="pause"></i>';
	}

	feather.replace();

})

function toggleCamera() {

	let video = document.getElementById("cameraVideo");

	let videoDisplay = document.getElementById("cameraVideo2");

	video.setAttribute('playsinline', '');
	video.setAttribute('autoplay', '');
	video.setAttribute('muted', '');

	videoDisplay.setAttribute('playsinline', '');
	videoDisplay.setAttribute('autoplay', '');
	videoDisplay.setAttribute('muted', '');

	var constraints = {
		audio: false,
		video: {
			facingMode: facingMode
		}
	};

	/* Stream it to video element */
	navigator.mediaDevices.getUserMedia(constraints).then(function success(stream) {
		video.srcObject = stream;
		videoDisplay.srcObject = stream;
	});

}

function takePicture(cameraID) {
	let capture;
	let dataURL;

	let video = document.getElementById("cameraVideo");

	if (cameraID == 2) {
		video = document.getElementById("cameraVideo2");
	}

	let canvas = document.getElementById("canvas");

	video.pause();

	let ctx = canvas.getContext('2d')

	if (width && height) {
		canvas.width = width;
		canvas.height = height;

		ctx.drawImage(video, 0, 0, width, height);

		capture = ctx.getImageData(0, 0, width, height);

		dataURL = canvas.toDataURL()

	} else {

		ctx.fillStyle = "#AAA";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		capture = ctx.getImageData(0, 0, width, height);

		dataURL = canvas.toDataURL()
	}

	let cap = {
		image: capture.data,
		width: width,
		height: height,
		dataURL: dataURL
	};

	if (!isPaused) video.play();

	if (cameraID == 2) video.play();

	if (!isTraining && cameraID == 2) updateFilterCanvas(net.filterImage(cap), width / 4, height / 4);

	return cap;
}

function updateFilterCanvas(capture, width, height) {

	let canvas = document.getElementById("filterCanvas");
	let ctx = canvas.getContext('2d');

	let pixelSize = Math.floor(14 / (width / 6.5));

	canvas.height = pixelSize * height * 3;

	// Filter image

	let outputImage = capture;

	let offsetX = 2.3 / (pixelSize / 6);
	let offsetY = 0.5 / (pixelSize / 6);

	for (let i = 0; i < 10; i++) {

		for (let x = 0; x < width; x++) {
			for (let y = 0; y < height; y++) {

				let colourPos = x + ((y + (i * height)) * width);

				let alpha = outputImage[colourPos] * 255;

				/*if (presets.activation[0] == "tanh" || presets.activation[0] == "leakyrelu" || presets.activation[0] == "sin") {
					alpha = (outputImage[colourPos] + 1) * 255 * 0.5;
				}*/

				let heightAddition = (i > 2) + (i > 5);

				ctx.fillStyle = "rgb(" + alpha + "," + alpha + "," + alpha + ")";
				ctx.fillRect((x + ((i % 3) * width) + ((i % 3) * offsetX)) * pixelSize, (y + (heightAddition * height) + (heightAddition * offsetY)) * pixelSize, pixelSize, pixelSize);

			}
		}

	}

}

toggleCamera();

let trainingImages = [];

let currentClass = 1;
let classCount = 2;

let imageCounts = [0, 0];
let totalImageCount = 0;

let videoHolderOpen = false;

let progressColours = ["rgb(140, 140, 255)", "rgb(50, 165, 165)", "rgb(100, 215, 100)", "rgb(255, 180, 140)", "rgb(255, 140, 140)", "rgb(255, 140, 255)"]

document.getElementById("addClass").addEventListener("click", e => {

	imageCounts.push(0);

	// Reset the network to have more outputs

	presets.outputs = classCount + 1;

	net = new NeuralNetwork(presets);

	if (startNet != null) net.copy(startNet);

	net.learningRate = Number(document.getElementById("learningRate").value);

	// Update the class editor

	let classHolder = document.getElementById("classHolder");

	let div = document.createElement("div");
	div.classList.add("trainingClass");

	let classInput = document.createElement("input");
	classInput.type = "text";
	classInput.id = "type" + (classCount + 1);
	classInput.value = "Class " + (classCount + 1);

	div.appendChild(classInput);

	let underline = document.createElement("div");

	div.appendChild(underline);

	let head2 = document.createElement("h2");
	head2.id = "imageCount" + (classCount + 1);
	head2.innerText = "0 images";

	div.appendChild(head2);

	let inlineDiv = document.createElement("div");
	inlineDiv.classList.add("inlineShadow");

	let openCamBut = document.createElement("button");
	openCamBut.id = "openCamera" + (classCount + 1);
	openCamBut.innerHTML = '<i data-feather="plus-square"></i>';
	openCamBut.classID = (classCount + 1);

	openCamBut.addEventListener("click", e => {

		toggleVideoMenu(e, Number(e.target.classID));

	})

	inlineDiv.appendChild(openCamBut);

	let customLabel = document.createElement("label");
	customLabel.innerHTML = '<i data-feather="file-plus"></i>'

	let uploadFolder = document.createElement("input");
	uploadFolder.id = "uploadFolder" + (classCount + 1);
	uploadFolder.type = "file";
	uploadFolder.webkitdirectory = "true"
	uploadFolder.directory = "true"
	uploadFolder.multiple = "true"
	uploadFolder.accept = "image/*"
	uploadFolder.classID = (classCount + 1);

	uploadFolder.addEventListener("change", e => {

		const selectedFolder = e.target.files;

		processFolder(selectedFolder, e.target.classID)

	})

	customLabel.appendChild(uploadFolder)
	inlineDiv.appendChild(customLabel);

	div.appendChild(inlineDiv)

	let imageDisplayDiv = document.createElement("div");
	imageDisplayDiv.id = "imageDisplay" + (classCount + 1);
	imageDisplayDiv.classList.add("inlineShadow");

	div.appendChild(imageDisplayDiv)

	classHolder.appendChild(div);

	// Update guess display

	let guessHolder = document.getElementById("resultHolder");

	div = document.createElement("div");
	div.classList.add("percentageHolder");

	let pGuess = document.createElement("p");
	pGuess.id = "guess" + (classCount + 1);
	pGuess.innerText = "N/A";

	div.appendChild(pGuess);

	let progressBar = document.createElement("progress");
	progressBar.id = "guess" + (classCount + 1) + "Progress";
	progressBar.value = 0;
	progressBar.max = 100;

	div.appendChild(progressBar);

	guessHolder.appendChild(div);

	pGuess.style.color = progressColours[classCount % progressColours.length];

	progressBar.style.setProperty("--progressColour", progressColours[classCount % progressColours.length]);

	document.getElementById("videoOptions").scrollBy({
		top: 500,
		behavior: 'smooth'
	});

	feather.replace();

	classCount += 1;

})

document.getElementById("openCamera1").addEventListener("click", e => {

	toggleVideoMenu(e, 1)

})

document.getElementById("openCamera2").addEventListener("click", e => {

	toggleVideoMenu(e, 2)

})

function toggleVideoMenu(e, classID) {

	if (currentClass == classID && videoHolderOpen) {

		videoHolderOpen = false;

		toggleAutoShoot(false);

		document.getElementById("videoHolder").style.transform = "scaleY(0)";
		document.getElementById("videoHolder").style["-webkit-transform"] = "scaleY(0)";
		document.getElementById("videoHolder").style["-moz-transform"] = "scaleY(0)";

		document.getElementById("videoHolder").style.pointerEvents = "none";

		e.target.style.background = "rgb(150, 150, 240)";
		e.target.innerHTML = '<i data-feather="plus-square"></i>';

	}
	else {

		currentClass = classID;
		videoHolderOpen = true;

		toggleAutoShoot(false);

		document.getElementById("videoHolder").style.top = ((Math.round(e.pageX / 10) * 10) - 150) + "px";

		document.getElementById("videoHolder").style.transform = "scaleY(1)";
		document.getElementById("videoHolder").style["-webkit-transform"] = "scaleY(1)";
		document.getElementById("videoHolder").style["-moz-transform"] = "scaleY(1)";

		document.getElementById("videoHolder").style.pointerEvents = "all";


		for (let i = 1; i < classCount + 1; i++) {
			document.getElementById("openCamera" + i).style.background = "rgb(150, 150, 240)";
			document.getElementById("openCamera" + i).innerHTML = '<i data-feather="plus-square"></i>';

		}

		e.target.style.background = "rgb(240, 150, 150)";
		e.target.innerHTML = '<i data-feather="x-square"></i>';

	}

	feather.replace();

}

document.getElementById("uploadFolder1").addEventListener("change", e => {

	const selectedFolder = e.target.files;

	processFolder(selectedFolder, 1)

})

document.getElementById("uploadFolder2").addEventListener("change", e => {

	const selectedFolder = e.target.files;

	processFolder(selectedFolder, 2)

})

let loadedImages = [];

function createImageFromUpload(image) {
	let capture;
	let dataURL;

	let canvas = document.getElementById("canvas");

	let ctx = canvas.getContext('2d')

	if (width && height) {
		canvas.width = width;
		canvas.height = height;

		ctx.drawImage(image, 0, 0, width, height);

		capture = ctx.getImageData(0, 0, width, height);

		dataURL = canvas.toDataURL()

	} else {

		ctx.fillStyle = "#AAA";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		capture = ctx.getImageData(0, 0, width, height);

		dataURL = canvas.toDataURL()
	}

	let cap = {
		image: capture.data,
		width: width,
		height: height,
		dataURL: dataURL
	};

	return cap;
}

function processFolder(folder, classID) {

	for (let i = 0; i < folder.length; i++) {

		let imgURL = URL.createObjectURL(folder[i]);

		loadedImages[i] = {};

		loadedImages[i].id = classID;
		loadedImages[i].image = new Image;

		loadedImages[i].image.onload = function() {

			let cap = createImageFromUpload(loadedImages[i].image);

			cap.id = classID - 1;

			imageCounts[classID - 1] += 1;
			totalImageCount += 1;

			document.getElementById("imagesUsed").innerText = trainingIndex + " / " + totalImageCount;

			document.getElementById("imageCount" + classID).innerText = imageCounts[classID - 1] + " images";

			trainingImages.push(cap);

			// Add image to display

			let displayImg = new Image();
			displayImg.src = imgURL;

			displayImg.onload = function() {
				URL.revokeObjectURL(this.src)
			}

			document.getElementById("imageDisplay" + classID).appendChild(displayImg);

		}

		loadedImages[i].image.src = imgURL;

		//URL.revokeObjectURL(imgURL)

	}

}

function autoScrollImageDisplay(t) {

	for (let i = 1; i <= classCount; i++) {

		let div = document.getElementById("imageDisplay" + i)

		document.getElementById("imageDisplay" + i).scrollTo((t / 40) % div.scrollWidth, 0)

	}

}

document.getElementById("captureButton").addEventListener("click", e => {

	takeAndProcessImage();

})

function takeAndProcessImage() {

	let cap = takePicture();

	cap.id = currentClass - 1;

	imageCounts[currentClass - 1] += 1;
	totalImageCount += 1;

	document.getElementById("imagesUsed").innerText = trainingIndex + " / " + totalImageCount;

	document.getElementById("imageCount" + currentClass).innerText = imageCounts[currentClass - 1] + " images";

	trainingImages.push(cap);

	//let imgURL = URL.createObjectURL(cap.dataURL);

	let displayImg = new Image();
	//displayImg.src = imgURL;
	displayImg.src = cap.dataURL

	displayImg.onload = function() {
		//URL.revokeObjectURL(this.src)
	}

	document.getElementById("imageDisplay" + currentClass).appendChild(displayImg);

}

document.getElementById("trainButton").addEventListener("click", e => {

	for (let i = 1; i <= classCount; i++) {

		if (imageCounts[i - 1] <= 0) {

			let className = document.getElementById("type" + i).value;

			addWarningText("Unable To Train", "The '" + className + "' class must have at least 1 image to train the network properly!");

			return;

		}

	}

	document.getElementById("trainButton").innerText = "Training";
	document.getElementById("trainButton").style.background = "rgba(240, 150, 150, 1.0)";
	document.getElementById("trainButton").style.pointerEvents = "none";

	addToConsole("")
	addToConsole("-----------")
	addToConsole("")
	addToConsole("Training...")

	trainNetwork();

})

let trainingIndex = 0;
let isTraining = false;

let successfulAttempts = 0;
let totalAttempts = 0;

function trainNetwork() {

	successfulAttempts = 0;
	totalAttempts = 0;

	trainingImages = shuffleArray(trainingImages);

	trainingIndex = 0;
	isTraining = true;

	addWarningText("Please Don't Switch Tabs!", "All training is done client side so by switching tabs training is forced to be paused. You can instead open a new window if you wish to continue browsing")

}

function checkToTrain() {

	if (isTraining) {

		for (let i = trainingIndex; i < trainingImages.length; i++) {

			if (i - trainingIndex >= 1) {
				// Break from loop and save data for next frame
				trainingIndex = i;
				document.getElementById("trainingProgress").value = (trainingIndex / trainingImages.length) * 100;

				document.getElementById("imagesUsed").innerText = trainingIndex + " / " + totalImageCount;

				// Show training image on canvas

				let img = trainingImages[i];
				updateFilterCanvas(net.filterImage(img), width / 4, height / 4);

				return;
			}

			let inputImageData = trainingImages[i];

			if (presets.activation[0] == "tanh" || presets.activation[0] == "leakyrelu" || presets.activation[0] == "sin") {

				// Normalise input data between -1 and 1

				for (let p = 0; p < inputImageData.image.length; p++) {
					inputImageData.image[p] = (inputImageData.image[p] * 2) - 255;
				}

			}

			let guess = net.predict(inputImageData);

			let targetResult = new Array(classCount).fill(0);

			/*if (presets.activation[0] == "tanh" || presets.activation[0] == "leakyrelu" || presets.activation[0] == "sin") {
				targetResult = new Array(classCount).fill(-1);
			}*/

			targetResult[trainingImages[i].id] = 1;

			let largestGuess = 0;
			let largestGuessID = 0;

			for (let a = 0; a < classCount; a++) {
				if (largestGuess < guess[a]) {
					largestGuess = guess[a];
					largestGuessID = a;
				}
			}

			if (largestGuessID == trainingImages[i].id) {
				successfulAttempts++;
			}

			net.train(inputImageData, targetResult);

			totalAttempts++;

		}

		isTraining = false;

		document.getElementById("imagesUsed").innerText = trainingIndex + " / " + totalImageCount;

		document.getElementById("trainingProgress").value = 0;

		let accuracy = (successfulAttempts / totalAttempts) * 100;

		addToConsole("Finished with an accuracy of " + accuracy + "%");

		document.getElementById("trainButton").innerText = "Train";
		document.getElementById("trainButton").style.background = "rgba(150, 240, 150, 1.0)";
		document.getElementById("trainButton").style.pointerEvents = "all";

	}

}

function shuffleArray(inputArray) {

	let unshuffledArray = inputArray;

	let randomRepeatTimes = unshuffledArray.length * 2;

	for (let i = 0; i < randomRepeatTimes; i++) {

		// Swap 2 random items in the array

		let item1Pos = Math.round(Math.random() * (unshuffledArray.length - 1));
		let item2Pos = Math.round(Math.random() * (unshuffledArray.length - 1));

		let item1 = unshuffledArray[item1Pos];
		let item2 = unshuffledArray[item2Pos];

		unshuffledArray[item1Pos] = item2;
		unshuffledArray[item2Pos] = item1;

	}

	return unshuffledArray;
}


function addToConsole(text) {

	let childText = document.createElement("p");
	childText.innerText = text;
	document.getElementById("consoleText").appendChild(childText);

	document.getElementById("consoleText").scrollBy({
		top: 600,
		behavior: 'smooth'
	});

}


// Save and load functions

document.getElementById("save").addEventListener("click", e => {

	let neuronDNA = net.getDNA();

	neuronDNA.class = [document.getElementById("type1").value, document.getElementById("type2").value];

	neuronDNA.name = prompt("Save Name:");

	neuronDNA = JSON.stringify(neuronDNA);

	copyToClipboard(neuronDNA);

	alert("Copied to clipboard");

});

function copyToClipboard(str) {

	if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
		return navigator.clipboard.writeText(str);
	}

	return Promise.reject('The Clipboard API is not available.');
}

document.getElementById("load").addEventListener("click", e => {

	navigator.clipboard.readText()
		.then(text => {

			loadNetwork(JSON.parse(text));

		})
		.catch(err => {

			alert('Failed to read clipboard contents: ' + err);

		});

});

function loadNetwork(loadedNetwork) {

	presets = {
		inputs: loadedNetwork.inputs,
		layers: loadedNetwork.layers,
		outputs: loadedNetwork.outputs,
		type: "classification",
		learningRate: 0.2,
		decimalPlaces: loadedNetwork.decimalPlaces,
		activation: loadedNetwork.activation
	}

	net = new NeuralNetwork(presets);

	net.weights = loadedNetwork.weights;
	net.biases = loadedNetwork.biases;

	document.getElementById("type1").value = loadedNetwork.class[0];
	document.getElementById("type2").value = loadedNetwork.class[1];

}


document.getElementById("autoShoot").addEventListener("click", e => {

	toggleAutoShoot(!autoShootEnabled);

})

function toggleAutoShoot(isEnabled) {
	autoShootEnabled = isEnabled;

	if (autoShootEnabled) {
		document.getElementById("autoShoot").style.background = "rgba(240, 150, 150, 1.0)";
		document.getElementById("autoShoot").innerText = "Recording";
	}
	else {
		document.getElementById("autoShoot").style.background = "rgba(150, 150, 240, 1.0)";
		document.getElementById("autoShoot").innerText = "Record";

	}
}

function autoShoot() {

	if (autoShootEnabled) {
		// Take picture every frame

		takeAndProcessImage();
	}

}

const connectorCan = document.getElementById("connector");
let connectorCTX = connectorCan.getContext("2d");

function drawConnectors() {

	connectorCan.width = document.body.scrollWidth;
	connectorCan.height = document.body.scrollHeight;

	connectorCTX.clearRect(0, 0, connectorCan.width, connectorCan.height);

	connectorCTX.strokeStyle = "rgb(120, 120, 235)";
	connectorCTX.lineWidth = 3;

	let trainBounding = document.getElementById("canvasHolder").getBoundingClientRect();

	let trainX = trainBounding.left - 10;
	let trainY = trainBounding.top + (trainBounding.height / 2);

	trainX += window.scrollX;
	trainY += window.scrollY;

	connectorCTX.beginPath();
	connectorCTX.arc(trainX, trainY, 20, 0, 2 * Math.PI);
	connectorCTX.stroke();

	for (let i = 0; i < classCount; i++) {

		let classBounding = document.getElementById("imageCount" + (i + 1)).parentElement.getBoundingClientRect();

		let classX = classBounding.left + classBounding.width;
		let classY = classBounding.top + (classBounding.height / 2);

		classX += window.scrollX;
		classY += window.scrollY;

		connectorCTX.beginPath();
		connectorCTX.moveTo(classX + 5, classY);
		connectorCTX.lineTo(trainX - 10, trainY);
		connectorCTX.stroke();

		connectorCTX.beginPath();
		connectorCTX.arc(classX, classY, 10, 0, 2 * Math.PI);
		connectorCTX.stroke();

	}

	connectorCTX.beginPath();
	connectorCTX.arc(trainX + trainBounding.width + 20, trainY, 20, 0, 2 * Math.PI);
	connectorCTX.stroke();

	let consoleBounding = document.getElementById("console").getBoundingClientRect();

	let consoleX = consoleBounding.left;
	let consoleY = consoleBounding.top + (consoleBounding.height / 2);

	consoleX += window.scrollX;
	consoleY += window.scrollY;

	connectorCTX.beginPath();
	connectorCTX.arc(consoleX, consoleY, 20, 0, 2 * Math.PI);
	connectorCTX.stroke();

	connectorCTX.beginPath();
	connectorCTX.moveTo(consoleX - 10, consoleY);
	connectorCTX.lineTo(trainX + trainBounding.width + 30, trainY);
	connectorCTX.stroke();

}


// Warning functions

function resetWarning() {
	document.getElementById("warning").style.opacity = 0;
	document.getElementById("warning").style["pointer-events"] = "none";

	document.getElementById("warning").style.transform = "translate(-50%, -100px)";
	document.getElementById("warning").style["-webkit-transform"] = "translate(-50%, -100px)";
	document.getElementById("warning").style["-moz-transform"] = "translate(-50%, -100px)";
}

function addWarningText(title, text) {

	document.getElementById("warningTitle").innerText = title;
	document.getElementById("warningText").innerText = text;


	document.getElementById("warning").style.transform = "translate(-50%, 0px)";
	document.getElementById("warning").style["-webkit-transform"] = "translate(-50%, 0px)";
	document.getElementById("warning").style["-moz-transform"] = "translate(-50%, 0px)";

	document.getElementById("warning").style.opacity = 1;
	document.getElementById("warning").style["pointer-events"] = "all";

}

document.getElementById("warningClose").addEventListener("click", e => {

	resetWarning();

})

resetWarning();

addWarningText("Welcome To [Insert name here]!", "Simply rename or add new classes, add some training images with the plus button and hit train to play around with your new neural network!")


function takeGuess() {

	let capturedImage = takePicture(2);

	let inputImageData = capturedImage;

	if (presets.activation[0] == "tanh" || presets.activation[0] == "leakyrelu" || presets.activation[0] == "sin") {
		// Normalise input data between -1 and 1
		for (let p = 0; p < inputImageData.image.length; p++) {
			inputImageData.image[p] = (inputImageData.image[p] * 2) - 1;
		}
	}

	let guess = net.predict(inputImageData);

	/*if (presets.activation[0] == "tanh" || presets.activation[0] == "leakyrelu" || presets.activation[0] == "sin") {

		for (let g = 0; g < guess.length; g++) {

			guess[g] = Math.min(1, Math.max(guess[g], -1));

			guess[g] = (guess[g] + 1) * 0.5;

		}

	}*/

	let totalOutputs = 0;

	for (let g = 0; g < classCount; g++) {

		document.getElementById("guess" + (g + 1)).innerText = document.getElementById("type" + (g + 1)).value;

		totalOutputs += guess[g];

	}

	totalOutputs = Math.max(totalOutputs, 1);

	for (let g = 0; g < classCount; g++) {

		document.getElementById("guess" + (g + 1) + "Progress").value = (guess[g] / totalOutputs) * 100;

	}

}

function tick(t) {

	takeGuess();

	autoShoot();

	checkToTrain();

	drawConnectors();

	autoScrollImageDisplay(t)

	requestAnimationFrame(tick);
}

tick();