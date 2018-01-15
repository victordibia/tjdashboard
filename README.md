# tjdashboard  
> process representation for TJBot

This app displays a dashboard to visualize processes that occur on tjbot as you interact with it. In addition, it also provides UI/buttons that can be used to control the bot e.g. control the LED color, make your bot look around and describe what it sees, wave its arm etc.

<img src="/public/img/screen.jpg" width="100%">


## How It Works
- Starts up a webserver (express) and serves up an interface which can be assessed via a browser on the pi localhost, port 8068. http:pi.ip.address:8068.
- TJBot events are streamed to the interface which displays them. Examples of events include hearing a new message, receiving a response from a call to the conversation service etc.
- Note. This recipe utilizes the [TJBot library](https://github.com/ibmtjbot/tjbotlib) to encapsulate simple functions for the bot.


## Hardware
Follow the full set of instructions on [instructables](http://www.instructables.com/id/Build-a-Waving-Robot-Using-Watson-Services/) to prepare your TJBot ready to run the code.

Note: You must have a servo motor connected to your Pi.  

- [Raspberry Pi 3](https://www.amazon.com/dp/B01C6Q2GSY/ref=wl_it_dp_o_pC_nS_ttl?_encoding=UTF8&colid=1BLM6IHU3K1MA&coliid=I1WPZOVL411972)
- [USB microphone](https://www.amazon.com/dp/B005BRET3G/ref=wl_it_dp_o_pC_nS_ttl?_encoding=UTF8&colid=1BLM6IHU3K1MA&coliid=I1C98I7HIFPNJE)
- [Speaker with 3.5mm audio jack](https://www.amazon.com/gp/product/B014SOKX1E/ref=oh_aui_detailpage_o00_s00?ie=UTF8&psc=1)
- [TJ Bot](http://ibm.biz/mytjbot) - You can 3D print or laser cut the robot
- [Servo Motor] (https://www.amazon.com/gp/product/B00JJZXRR0/ref=oh_aui_detailpage_o03_s00?ie=UTF8&psc=1) -  TowerPro SG90 9G micro small servo motor
- [Neopixel RGB LED](https://www.adafruit.com/products/1734) - Optional led.

## Wiring Your Servo Motor

Your servo motor has three wires -  Power, Ground and Data in. In this recipe I use the Tower Pro servo motor and the wires are as follows - Red (Power), Brown (Ground), Yellow (Data in). For this recipe, a software PWM library is used to control the servo motor, and I wire my setup as follows.

- Red (+5v, Pin 2)
- Brown (Ground, Pin 14)
- Yellow (Data in, Pin 26, GPIO7 )

Note: In the code, you can always change the pins used.

<img src="/public/img/tjwave_bb.jpg" width="100%">



## Build
Get the sample code (download or clone) and go to the application folder.

    git clone https://github.com/victordibia/tjdashboard
    cd tjdashboard

Update your Raspberry Pi. Please see the guide [here to setup network and also update your nodejs] (http://www.instructables.com/id/Make-Your-Robot-Respond-to-Emotions-Using-Watson/step2/Set-up-your-Pi/) installation
    sudo apt-get update
    sudo apt-get upgrade
    curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
    sudo apt-get install -y nodejs

Note : Raspberry pi comes with a really old version of nodejs and npm (0.10), hence the need to upgrade it to the latest version.

Install ALSA tools (required for recording audio on Raspberry Pi). (Some of the sample code integrate voice commands)

    sudo apt-get install alsa-base alsa-utils
    sudo apt-get install libasound2-dev


## Setup Watson conversation
The app uses Watson conversation to understand intent behind text.

  - You will need to set up your watson conversation flow and set up a workspace. More on that [here](http://www.instructables.com/id/Build-a-Talking-Robot-With-Watson-and-Raspberry-Pi/#step6) .
  - You import sample conversation flow in the folder (workspace.json) to get you started. This creates intents for actions like "hello" , "see" , "wave" , "introduce", "weather" etc
  - Finally, this sample uses both audio and LED. These two hardware devices [are known to conflict](https://github.com/jgarff/rpi_ws281x#limitations) - a workaround is to disable onboard audio and use USB audio on your Pi.


## Install Dependencies

    npm install

if you run into errors installing dependencies, try

    sudo rm -rf node_modules
    sudo npm install --unsafe-perm

Set the audio output to your audio jack. For more audio channels, check the [config guide. ](https://www.raspberrypi.org/documentation/configuration/audio-config.md)

    amixer cset numid=3 1    
    // This sets the audio output to option 1 which is your Pi's Audio Jack. Option 0 = Auto, Option 2 = HDMI. An alternative is to type sudo raspi-config and change the audio to 3.5mm audio jack.

Create config.js

    # On your local machine rename the config.default.js file to config.js.
    cp config.default.js config.js

    Open config.js using your favorite text editor # (e.g // nano) and update it with your Bluemix credentials for the Watson services you use.
    nano config.js

Note: do not add your credentials to the config.default.js file.

Note: Please also edit the config.js to add details on your weather location (e.g. country, city and state). This location is used to respond to the question `what is the weather`.

## Test Your Servo

Before running the main code (voice + wave + dance etc), you may test your LED setup and your Servo motor to make sure the connections are correct and the library is properly installed. When you run the test module, it should turn your LED to different colors and wave your robot arm at intervals.


    sudo node wavetest.js


If the LED does not light up, you can try moving the power from 3.3 to 5 volts.  If neither the 3.3v or 5v pins work, you will need a 1N4001 diode. The diode is inserted between the power pin of the LED (the shorter of the two middle pins) and the 5v pin on the Raspberry Pi.


If your robot arm does not respond, kindly confirm you have connected it correctly. See the [PIN diagram here](https://github.com/nebrius/raspi-io/wiki/Pin-Information) for more information on raspberry pi PINS.



## Running

Start the application. (Note: you need sudo access)

    sudo node dashboard.js     

Then you should be able to speak to the microphone.
Sample utterances are

    hi there?   What is your name ? [intent: do]
    can you raise your arm ? can you wave your arm [intent: wave]
    can you introduce yourself ? what can you do for me [intent: introduce]  
    can you play some music and dance ?   What is your name ? [intent: dance]
    what do you see ? [intent: see]
    what is the weather ? will it rain today? should take an umbrella for the rain? [intent: weather]
    Can you hear me ?

You can add more utterances by creating additional intents on your watson conversation dialog.

For the dance command, your robot processes wav files in the sounds folder. Please ensure you have a .wav file there and set that as your sound file.

## Reference

If you are using or working with tjbot or this dashboard app, please feel free to cite our paper

> Victor C. Dibia, Maryam Ashoori, Aaron Cox, and Justin D. Weisz. 2017. TJBot: An Open Source DIY Cardboard Robot for Programming Cognitive Systems. In Proceedings of the 2017 CHI Conference Extended Abstracts on Human Factors in Computing Systems (CHI EA '17). ACM, New York, NY, USA, 381-384. DOI: https://doi.org/10.1145/3027063.3052965
