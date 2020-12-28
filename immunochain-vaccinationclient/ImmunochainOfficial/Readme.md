 ImmunochainOfficial
 Immunochain is a promising technology innovation adhering to the need of the healthcare sector in advancing with vaccine trials under the Universal Immunisation Program (UIP).  Using the traceability application, real-time data of the vaccine administrations can be received by the healthcare officials which can be visualized using different reports, charts or comparisons. The blockchain-anchored solution assists the drug administrators to add vaccines, manage stocks, administrate vaccine and get real-time reports. The app aims to improve quality and enhance patient safety via capturing and recording sensitive information on the blockchain. Currently, the app runs only on android device and not on ios.

## Prerequisites
1. Install Nodejs 12.10.0 (https://nodejs.org/download/release/v12.10.0/)
2. Set up the React Native development environment. (https://reactnative.dev/docs/environment-setup)
3. Required a physical android device with android 8 or later. Make sure that the Developer Option is enabled in the device. (Reference: https://developer.android.com/studio/debug/dev-options)
4. (Optional) an EPSON LW-1000p printer for printing QR code.

## Initial Setup
1. After cloning the project from git, open terminal in ImmunochainOfficial folder.
2. Install the dependencies required for the project.
    ```bash
    npm install
    ```

## Run Project
1. (Optional) Connect the EPSON LW-1000p printer and android device on same wifi network.
2. Open terminal in ImmunochainOfficial folder.
3. Make sure that the android device is connected to the computer. You can check if the devices is connected by using bellow command.
    ```bash
    adb devices
    ```
4. Run the project using below command
    ```bash
    npx react-native run-android
    ```
## Troubleshooting
There are some possibilities for having some errors while building the project. Some of the common issues and solutions are provided below.

### Android SDK missing
If you find an error that specifies android SDK missing, then make sure you have installed the android sdk in your computer. If already exist, then create a file `local.properties` inside `/android/` folder and specify the sdk path as follows.
```code
sdk.dir = your/sdk/path/here
```

### Android Build Error
In some cases the might be an error while building the project. If so, run `gradlew clean` inside `android` folder