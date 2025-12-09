class NeuralNetwork {
	layers = [];
	weights = [];
	biases = [];
	neuralLayers = [];
	activationFunction = [];
	decimalPlaces = 5;
	learningRate = 0.1;
	type = "classification";

	layer1filters = [
		[
			[-1, 0, 1],
			[-2, 0, 2],
			[-1, 0, 1]
		],
		[
			[-1, -2, -1],
			[0, 0, 0],
			[1, 2, 1]
		],
		[
			[0, 1, 0],
			[1, -4, 1],
			[0, 1, 0]
		],
		[
			[1, 2, 1],
			[2, 4, 2],
			[1, 2, 1]
		],
		[
			[0, 0, 0],
			[0, 1, 0],
			[0, 0, 0]
		]
	]

	layer2filters = [
		[
			[0, 0, 0],
			[0, 1, 0],
			[0, 0, 0]
		],
		[
			[-1, -2, -1],
			[0, 0, 0],
			[1, 2, 1]
		]
	]

	constructor(options) {
		let inputs = options.inputs;
		let layers = options.layers;
		let outputs = options.outputs;

		if (!Array.isArray(layers)) console.warn("The 'layers' value of options must be an array of positive integers greater than 0 that represent the number of neurons in each hidden layer");

		if (typeof outputs != 'number') console.warn("The 'outputs' value of options must be a positive integer greater than 0");

		this.type = options.type || this.type;

		if (this.type == "imageClassification") {
			if (!Array.isArray(inputs)) console.warn("Inputs must be in the format '[image width, image height]' when using 'imageClassification'");
			inputs = (inputs[0] / 4) * (inputs[1] / 4) * this.layer1filters.length * this.layer2filters.length;
		}
		else {
			if (typeof inputs != 'number') console.warn("The 'inputs' value of options must be a positive integer greater than 0");
		}

		this.learningRate = options.learningRate || 0.2;
		this.neuralLayers = layers;
		this.decimalPlaces = options.decimalPlaces || 5;

		this.layers = new Array(layers.length + 2).fill(0);
		this.biases = new Array(layers.length + 1).fill(0);

		this.layers[0] = new Array(inputs).fill(0);
		for (let i = 0; i < layers.length; i++) {
			this.layers[i + 1] = new Array(layers[i]).fill(0);
		}

		this.layers[this.layers.length - 1] = new Array(outputs).fill(0);
		this.activationFunction = new Array(layers.length + 2).fill(this.sigmoid);

		for (let a = 0; a < options.activation.length; a++) {
			if (options.activation[a].toLowerCase() == "tanh") {
				this.activationFunction[a] = this.tanh;
			}

			if (options.activation[a].toLowerCase() == "relu") {
				this.activationFunction[a] = this.relU;
			}

			if (options.activation[a].toLowerCase() == "leakyrelu") {
				this.activationFunction[a] = this.leakyRelU;
			}

			if (options.activation[a].toLowerCase() == "sin") {
				this.activationFunction[a] = this.sin;
			}
		}

		this.setupWeights();
		this.setupBiases();
	}

	predict(value) {

		let data = {};
		if (this.type == "imageClassification") {
			data.inputs = this.filterImage(value);
		}
		else {
			data.inputs = value;
		}

		let count = Math.min(data.inputs.length, this.layers[0].length);

		for (let i = 0; i < count; i++) {
			this.layers[0][i] = this.round(data.inputs[i]);
		}

		this.calculateOutputs();
		return this.layers[this.layers.length - 1];
	}

	getOutput() {
		return this.layers[this.layers.length - 1];
	}

	setupWeights() {
		// Weight is read where first level is layer, second level is node and third level is previous nodes
		let weights = [];

		// Setup layer weights
		for (let x = 1; x < this.layers.length; x++) {

			let weightsToAdd = [];
			for (let y = 0; y < this.layers[x].length; y++) {

				let nodeWeightData = [];
				for (let i = 0; i < this.layers[x - 1].length; i++) {
					nodeWeightData.push(this.round((Math.random() * 2) - 1));
				}

				weightsToAdd.push(nodeWeightData);
			}

			weights.push(weightsToAdd);
		}

		this.weights = weights;
	}

	setupBiases() {

		this.biases = [];
		for (let x = 1; x < this.layers.length; x++) {

			let biasData = [];
			for (let y = 0; y < this.layers[x].length; y++) {
				biasData.push(this.round((Math.random() * 2) - 1));
			}

			this.biases.push(biasData)
		}
	}

	calculateOutputs() {

		for (let x = 1; x < this.layers.length; x++) {
			for (let y = 0; y < this.layers[x].length; y++) {

				let data = this.layers[x - 1];

				this.layers[x][y] = 0;
				for (let i = 0; i < data.length; i++) {
					this.layers[x][y] += this.round(data[i] * this.weights[x - 1][y][i]);
				}

				// Activation function
				this.layers[x][y] = this.round(this.activationFunction[x - 1](this.layers[x][y] + this.biases[x - 1][y], false));
			}
		}
	}

	// Convolutional layers
	pixelIndex(x, y, width) {
		return x + (y * width);
	}

	convolutionLayer(img, filter, width, height) {

		let convImg = [];
		for (let x = 0; x < width; x++) {
			for (let y = 0; y < height; y++) {

				let sumAlpha = 0;
				for (let i = -1; i <= 1; i++) {
					for (let j = -1; j <= 1; j++) {
						let factor = filter[i + 1][j + 1];
						sumAlpha += (img[this.pixelIndex(x + i, y + j, width)] || img[this.pixelIndex(x, y, width)]) * factor;
					}
				}

				//convImg[pixelIndex(x, y)] = (sumAlpha * 0.5) + 0.5;
				convImg[this.pixelIndex(x, y, width)] = this.leakyRelU(sumAlpha);
			}
		}

		return convImg;
	}

	maxPool(img, stride, width, height) {

		let pooledImage = [];
		for (let y = 0; y < height; y += stride) {
			for (let x = 0; x < width; x += stride) {

				let brightAlpha = -Infinity;
				for (let i = 0; i < stride; i++) {
					for (let j = 0; j < stride; j++) {
						brightAlpha = Math.max(brightAlpha, img[this.pixelIndex(x + i, y + j, width)]);
					}
				}

				pooledImage.push(brightAlpha);
			}
		}

		return pooledImage;
	}

	filterImage(imageData) {
		let data = imageData;

		let width = data.width;
		let height = data.height;
		let img = data.image;

		let startImg = [];

		for (let x = 0; x < img.length; x += 4) {
			let grayscale = (img[x] + img[x + 1] + img[x + 2]) / (255 * 4);
			startImg.push(grayscale);
		}

		// Apply convolutional layers with different filters and then max pool output
		let filteredImages = [];
		let stride = 2;

		for (let i = 0; i < this.layer1filters.length; i++) {
			let convImg = this.convolutionLayer(startImg, this.layer1filters[i], width, height);
			let pooledImg = this.maxPool(convImg, stride, width, height);

			filteredImages.push(pooledImg);
		}

		width *= 0.5;
		height *= 0.5;

		// Apply convolutional layers with different filters and then max pool output again
		let secondFilteredImages = [];
		stride = 2;

		for (let i = 0; i < filteredImages.length; i++) {

			// Apply a convolution with a different filter on the same image
			let currentImg = filteredImages[i];

			for (let x = 0; x < this.layer2filters.length; x++) {
				let convImg = this.convolutionLayer(currentImg, this.layer2filters[x], width, height);
				let pooledImg = this.maxPool(convImg, stride, width, height);
				secondFilteredImages.push(pooledImg);
			}
		}

		let flattenedImage = [];
		for (let i = 0; i < secondFilteredImages.length; i++) {
			for (let x = 0; x < secondFilteredImages[i].length; x++) {
				flattenedImage.push(secondFilteredImages[i][x]);
			}
		}

		width *= 0.5;
		height *= 0.5;

		return flattenedImage;
	}

	// Activation function setup

	setActivationFunction(types) {
		if (this.type == "imageClassification") {
			console.warn("When using 'imageClassification' mode I reccomend using the 'sigmoid' activation function as currently it yields the best results");
			return;
		}

		for (let i = 0; i < Math.min(types.length, this.activationFunction.length); i++) {
			this.activationFunction[i] = types[i];
		}
	}

	// Activation functions

	// ReLU
	relU(num, isDerivative) {
		if (!isDerivative) {
			return Math.max(0, num);
		}
		else {
			if (num > 0) return 1;
			return 0;
		}
	}

	// Leaky ReLU
	leakyRelU(num, isDerivative) {
		if (!isDerivative) {
			return Math.max(0.1 * num, num);
		}
		else {	
			if (num > 0) return 1;
			return 0.1;	
		}
		
	}

	// Sigmoid
	sigmoid(num, isDerivative) {
		if (!isDerivative) {
			return 1 / (1 + Math.exp(-num));
		}
		else {
			return (1 / (1 + Math.exp(-num))) * (1 - (1 / (1 + Math.exp(-num))));
		}
	}

	// Hyperbolic tangent
	tanh(num, isDerivative) {
		if (!isDerivative) {
			return Math.tanh(num);
		}
		else {
			return (1 - (Math.tanh(num) ^ 2));
		}
	}

	// Sin
	sin(num, isDerivative) {
		if (!isDerivative) {
			return Math.sin(num);
		}
		else {
			return Math.cos(num);
		}
	}

	calculateDerivative(num) {
		// Use the chain rule to calculate the derivative of a graph
		let deriv = 1;

		for (let x = 0; x < this.activationFunction.length; x++) {

			let outputNum = num;
			for (let y = this.activationFunction.length - 1; y > x; y--) {
				let isDerivative = y == (x + 1);
				outputNum = this.activationFunction[y](outputNum, isDerivative);
			}

			deriv *= outputNum;
		}

		return deriv;
	}

	// Calculate derivative

	// Round number to a specified amount of decimal places
	round(num) {
		let multi = 10 ^ this.decimalPlaces;
		return Math.round(num * multi) / multi;
	}

	merge(mergeNeuron) {
		// Average together the weights of this neural network and another
		for (let x = 0; x < Math.min(mergeNeuron.weights.length, this.weights.length); x++) {
			for (let y = 0; y < Math.min(mergeNeuron.weights[x].length, this.weights[x].length); y++) {
				for (let i = 0; i < Math.min(mergeNeuron.weights[x][y].length, this.weights[x][y].length); i++) {
					// Merge weights
					let opts = [this.weights[x][y][i], mergeNeuron.weights[x][y][i]];
					this.weights[x][y][i] = (opts[0] + opts[1]) / 2;
				}
			}
		}

		for (let x = 0; x < Math.min(mergeNeuron.biases.length, this.biases.length); x++) {
			for (let y = 0; y < Math.min(mergeNeuron.biases[x].length, this.biases[x].length); y++) {
				let opts = [this.biases[x][y], mergeNeuron.biases[x][y]]
				this.biases[x][y] = (opts[0] + opts[1]) / 2;
			}
		}

	}

	mutate(mutationChance, mutationIntensity) {
		// Randomly change the weights in the neural network
		for (let x = 0; x < this.weights.length; x++) {
			for (let y = 0; y < this.weights[x].length; y++) {
				for (let i = 0; i < this.weights[x][y].length; i++) {
					if (Math.random() * 100 < mutationChance) {
						// Mutate weight
						this.weights[x][y][i] += (Math.random() * mutationIntensity * 2) - mutationIntensity;
					}
				}
			}
		}
	}

	copy(mergeNeuron) {
		// Replicate the inputted neuron ( mergeNeuron )
		for (let x = 0; x < Math.min(mergeNeuron.weights.length, this.weights.length); x++) {
			for (let y = 0; y < Math.min(mergeNeuron.weights[x].length, this.weights[x].length); y++) {
				for (let i = 0; i < Math.min(mergeNeuron.weights[x][y].length, this.weights[x][y].length); i++) {
					// Replace weights
					this.weights[x][y][i] = mergeNeuron.weights[x][y][i];
				}
			}
		}

		for (let x = 0; x < Math.min(mergeNeuron.biases.length, this.biases.length); x++) {
			for (let y = 0; y < Math.min(mergeNeuron.biases[x].length, this.biases[x].length); y++) {
				this.biases[x][y] = mergeNeuron.biases[x][y];
			}
		}
	}

	train(networkInputs, expectedOutputs) {
		// Setup output errors
		let currentOutputs = this.predict(networkInputs);
		if (currentOutputs.length != expectedOutputs.length) console.warn("The target outputs must be the dame length as the networks outputs (" + currentOutputs.length + ")");
		
		// Calculate the intial output errors ( TARGET - OUTPUT )
		let error = [];
		for (let i = 0; i < Math.min(currentOutputs.length, expectedOutputs.length); i++) {
			error.push(expectedOutputs[i] - currentOutputs[i]);
		}

		for (let x = (this.layers.length - 1); x > 0; x--) {

			let nextNodeErrors = [];
			for (let y = 0; y < this.layers[x].length; y++) {

				/*let summedWeights = 0;

				for (let i = 0; i < this.layers[x - 1].length; i++) {

					// Sum up the weights for each neuron
					summedWeights += this.weights[x - 1][y][i];

				}*/

				// Calculate error of the node

				let nodeError = 0;
				if (x + 1 < this.layers.length) {

					// Sum all previous errors multiplied with the weights
					for (let n = 0; n < this.layers[x + 1].length; n++) {

						let forwardLayerTotalWeight = 0;
						for (let o = 0; o < this.layers[x].length; o++) {
							// Calculate the total weight going out of the neuron
							forwardLayerTotalWeight += this.weights[x][n][o];
						}

						nodeError += error[n] * (this.weights[x][n][y] / forwardLayerTotalWeight);
					}
				}
				else {
					nodeError = error[y];
				}

				// Save layers neuron errors ready to be used for the next layer
				nextNodeErrors[y] = nodeError;

				// Loop over each weight in the layer
				for (let i = 0; i < this.layers[x - 1].length; i++) {
					// Change each weight using gradient descent

					// Calulate gradient
					let gradient = this.calculateDerivative(this.layers[x][y]);

					gradient *= nodeError;
					gradient *= this.learningRate;

					// Change bias by gradient
					if (i == 0) this.biases[x - 1][y] += gradient;

					// Calulate weight delta
					let weightDelta = gradient * this.layers[x - 1][i];

					// Change weight by calculated delta
					this.weights[x - 1][y][i] += weightDelta;

					// Old weight change (Doesn't use gradient descent + might not work)
					//this.weights[x - 1][y][i] += (this.weights[x - 1][y][i] / summedWeights) * nodeError;
				}

			}

			error = nextNodeErrors;
		}

	}

	getDNA() {
		let networkDNA = {};

		networkDNA.weights = this.weights;
		networkDNA.biases = this.biases;

		networkDNA.inputs = this.layers[0].length;
		networkDNA.layers = this.neuralLayers;
		networkDNA.outputs = this.layers[this.layers.length - 1].length;

		networkDNA.decimalPlaces = this.decimalPlaces;
		networkDNA.activationFunction = this.activationFunction;

		return networkDNA;
	}

}

export { NeuralNetwork };