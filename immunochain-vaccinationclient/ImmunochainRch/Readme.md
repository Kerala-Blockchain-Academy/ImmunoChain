# ImmunochainRCH
Immunochain aims to provide an immutable identity for the beneficiaries of the Universal Immunisation Program (UIP). It aims to eliminate the potential risks in the whole process and ensure that vaccine records are immutable and permanent. The blockchain-enabled vaccine coverage analysis system ensures inviolable data over the vaccine trails to be carried thus improving the effectiveness and coverage of the immunization process. The application is expertly curated for public users, where the users can see all the details related to vaccines administered to their child. Currently, the app runs only on android device and not on ios.

## Prerequisites
1. Install Nodejs 12.10.0 (https://nodejs.org/download/release/v12.10.0/)
2. Set up the React Native development environment. (https://reactnative.dev/docs/environment-setup)
3. Required a physical android device with android 8 or later. Make sure that the Developer Option is enabled in the device. (Reference: https://developer.android.com/studio/debug/dev-options)

## Initial Setup
1. After cloning the project from git, open terminal in ImmunochainRCH folder.
2. Install the dependencies required for the project.
    ```bash
    npm install
    ```

## Run Project
1. Open terminal in ImmunochainRCH folder.
2. Make sure that the android device is connected to the computer. You can check if the devices is connected by using bellow command.
    ```bash
    adb devices
    ```
3. Run the project using below command
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