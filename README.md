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

# Image Classifier

Create your own classes and training data to train a neural network to classify inputted images

## Setup

You can simply use the [website that is hosted on github pages](https://gamedev46.github.io/Image_Classifier/) to use the program in your browser without needing to download and run the project on your device. 

Alternatively, you can also download the repository and run it locally for the same results.

## Controls

### Classes

Classes represent a collection of data all following a certain theme, for example a collection of images of people holding their hand up or a collection of images of a specific object.

These classes each represent a choice that the neural network can predict when given an image to process.

#### Adding Data

You have 2 options to add the images to a class, you can either upload a folder containg multiple images for the class or you can create the data live using the camera support.

#### Using The Camera

The camera has 4 buttons for capturing data:

- The first one (camera icon) is used to capture a single image of what is currently being viewed by the camera. 
- The second button (button with the circular arrow icon) is used to switch between the front and back camera, if your devie does not have one of these then the button will do nothing
- The pause button, this will pause / play the capturing of data when record mode is activated
- The "record" button, this is a toggle and while it is active it will capture and save images of the video as you record live helping to get lots of data quickly

#### Add Class

The "Add Class" button will add a new class for the neural network to learn, please be aware that the more classes you add the harder time the network will have at correctly classifying items.

### Training

Now that you have captured your data, you now need to train the network on it. Simply press the "Train" button and wait for the network to be trained on all your captured data. Once this is done you can test it live with your camera and see the results shown by the likelihood bars in the "Prediction" tab.

#### Learning Rate

Learning rate controls the size of the steps taken during gradient descent, for those who are unsure I would reccomend a value of 0.05 to 0.2

#### Network Activation Function

The dropdown determines the network activation functions, this can either help or inhibit your network during the training process and if you are unexperienced I would reccomend leaving this value untouched as the default setting of "sigmoid" yields the best results in most cases
