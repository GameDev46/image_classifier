<a href="https://github.com/GameDev46" title="Go to profile">
    <img src="https://img.shields.io/static/v1?label=GameDev46&message=|&color=Green&logo=github&style=for-the-badge&labelColor=1f1f22" alt="GameDev46 - Image_Classifier">
    <img src="https://img.shields.io/badge/Version-1.2.8-green?style=for-the-badge&labelColor=1f1f22&color=Green" alt="GameDev46 - Image_Classifier">
</a>


![Static Badge](https://img.shields.io/badge/--1f1f22?style=for-the-badge&logo=HTML5)
![Static Badge](https://img.shields.io/badge/--1f1f22?style=for-the-badge&logo=CSS&logoColor=6060ef)
![Static Badge](https://img.shields.io/badge/--1f1f22?style=for-the-badge&logo=JavaScript)
    
<a href="https://github.com/GameDev46/Image_Classifier/stargazers">
    <img src="https://img.shields.io/github/stars/GameDev46/Image_Classifier?style=for-the-badge&labelColor=1f1f22" alt="stars - Image_Classifier">
</a>
<a href="https://github.com/GameDev46/Image_Classifier/forks">
    <img src="https://img.shields.io/github/forks/GameDev46/Image_Classifier?style=for-the-badge&labelColor=1f1f22" alt="forks - Image_Classifier">
</a>
<a href="https://github.com/GameDev46/Image_Classifier/issues">
    <img src="https://img.shields.io/github/issues/GameDev46/Image_Classifier?style=for-the-badge&labelColor=1f1f22&color=blue"/>
 </a>

<br>

<div align="left">
<a href="https://gamedev46.github.io/Image_Classifier/">
    <img src="https://img.shields.io/badge/View_site-GH_Pages-2ea44f?style=for-the-badge&labelColor=1f1f22" alt="View site - GH Pages">
</a>
</div>

<br>

# image_classfier

Create your own classes and training data to train a neural network to classify inputted images

## Setup

Once you have downloaded the repository you will need to unzip the [starter network folder](/startNetworkFolder.zip) in the main directory and then move the file called startNetwork.JSON out of the unzipped folder and into the main directory so that the program can properly load up the starting weights and biases of the initail untrained network (this improves train time and success for other applications)

Alternatively you can simply use the [website that is hosted on github](https://gamedev46.github.io/Image_Classifier/), however this unfortunately doesn't have a starting model and so will perform qorse than the downloaded version


## Controls

### Classes

Classes represent different images for the network to classify, for example to classify whether a there is a person in the picture or not you would rename class 1 to person and then use the plus button to take pictures where a human is present and then for class 2 you would rename it to no human and then either upload or photograph pictures without people in and then click the train button to start the training of the network. Once trained you can then see the how successful the network was and try it out in realtime with your camera

### Learning Rate

Learning rate controls the size of the steps taken during gradient descent, for those who are unsure I would reccomend a value of 0.05 to 0.2

### Network Activation Function

The dropdown determines the network activation functions, this can either help or inhibit your network during the training process and if you are unexperienced I would reccomend leaving this value untouched as the default setting of "sigmoid" yields the best results in most cases
