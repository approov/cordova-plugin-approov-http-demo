> **IMPORTANT** This repository relates to Approov 1 which is **deprecated**. For up to date information about using Approov with Cordova please refer to [Approov Quickstart: Cordova](https://github.com/approov/quickstart-cordova-advancedhttp#approov-quickstart-cordova).

Cordova Approov HTTP Demo
=========================

Demo Cordova app to demonstrate how to use the Cordova Approov HTTP plugin to add Approov Mobile API Protection to requests made through Cordova Advanced HTTP. The aim of this demo is to introduce you to the client-side components of Approov and show you how to integrate them into a simple Cordova app.

CriticalBlue's Approov protects mobile APIs by enabling dynamic software attestation for mobile apps. It allows your apps to uniquely authenticate themselves as the genuine, untampered software you originally published. Upon successfully passing the integrity check the app is granted a short lifetime token which can then be presented to your API with each request. This allows your server side implementation to differentiate between requests from known apps, which will contain a valid token, and requests from other sources, which will not.  
More detailed information about Approov and how it works is available at the [Approov web-site](https://www.approov.io).

Cordova Advanced HTTP, a popular plugin for communicating with HTTP servers, is available at Github ([https://github.com/silkimen/cordova-plugin-advanced-http](https://github.com/silkimen/cordova-plugin-advanced-http)) or NPM ([https://www.npmjs.com/package/cordova-plugin-advanced-http](https://www.npmjs.com/package/cordova-plugin-advanced-http)).


Prerequisites
-------------

* **App Build Environment**  
To build the demo app you will need Cordova version 8.0.0 and, depending on your target device, you will either need Cordova Android 7.0.0 or Cordova iOS 4.5.4 or newer. For Android you will need Android Studio 3 installed as well as the Android SDK. Approov supports Android 4.2 and above. For iOS you will need Xcode 9. Approov is compatible with all iOS 8.0 and above devices. There is currently no support for tvOS, watchOS, and OSX/macOS.

* **Cordova Approov HTTP**  
  The Cordova Approov HTTP plugin is available at GitHub ([https://github.com/approov/cordova-plugin-advanced-http-demo](https://github.com/approov/cordova-plugin-advanced-http-demo)) contains an instance of the Approov SDK and is ready to be used with the demo app.  

* **Registration tools for Approov Demo**  
  Please request a download of the (non-Cordova) Approov Demo from the [Approov Demo Download Page](https://www.approov.io/demo-reg.html). The registration tools can be found inside the downloaded Approov Demo zip archive in the `registration-tools` folder.   

* **Cordova Advanced HTTP** with CriticalBlue modifications, available at GitHub ([https://github.com/approov/cordova-plugin-advanced-http](https://github.com/approov/cordova-plugin-advanced-http)).  
  The CriticalBlue modifications are hooks that allow custom, user-defined interceptor functions to be called before requests are sent. This enables special handling and last-minute modification of requests. The modifications are not Approov specific and do not change Cordova Advanced HTTP's behaviour if the hooks are not used.


Testing the Shapes server
-------------

The Shapes demo server is really simple, you can access it at https://demo-server.approovr.io/.
It has 2 endpoints:

* A Hello endpoint (https://demo-server.approovr.io/hello) that returns a string
* A Shapes endpoint (https://demo-server.approovr.io/shapes) that returns a random shape

The Hello endpoint has no security (except https) so you should be able to access it using your software of choice. For the purposes of our examples we will just use curl.

        $ curl -D- https://demo-server.approovr.io/hello
        HTTP/1.0 200 OK
        Content-Type: text/html; charset=utf-8
        Content-Length: 12
        Server: Werkzeug/0.11.15 Python/3.4.3
        Date: Tue, 31 Jan 2017 23:38:52 GMT

        Hello World!

The Shape endpoint is set up to expect an Approov token. If you try to access it using curl without the correct header, or with a header that contains an invalid token, you will get a 400 response.

        $ curl -D- https://demo-server.approovr.io/shapes
        HTTP/1.0 400 BAD REQUEST
        Content-Type: text/html
        Content-Length: 192
        Server: Werkzeug/0.11.15 Python/3.4.3
        Date: Tue, 31 Jan 2017 23:43:40 GMT

        <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2 Final//EN">
        <title>400 Bad Request</title>
        <h1>Bad Request</h1>
        <p>The browser (or proxy) sent a request that this server could not understand.</p>

Now we have checked that the server is up and running and our Shape endpoint is protected, we can use a valid client app to access it properly. But first we have to build it.


Building the Demo App
---------------------

1. Add Cordova Advanced HTTP (cordova-plugin-advanced-http) to the Demo app

    Example:

            cordova plugin add local/path/to/cordova-plugin-advanced-http

    Ensure cordova-plugin-advanced-http with CriticalBlue modifications is picked up by Cordova, *not* the original cordova-plugin-advanced-http.

2. Add cordova-plugin-approov-http to your Cordova app

    Example:

            cordova plugin add local/path/to/cordova-plugin-approov-http

3. Add the Cordova platform and build. Depending on your target platform use

    * Android:

              cordova platform add android
              cordova build android

    * iOS:

              cordova platform add ios
              cordova build ios

        The iOS build will fail because of a code signing error. To fix this:

        1. Open the project (`platforms/ios/Demo.xcworkspace`) in XCode
        2. In Xcode, configure code signing for the Demo target to work with your iOS developer account so the app can be run on your device (e.g: select the project root (Demo) in the 'Project Navigator'. Then, in the 'General' tab, section 'Signing', tick 'Automatically manage signing' and select your 'Team'). You can then build the app on your device from within Xcode.

4. You can now run the app, but it will not authenticate until you have registered it with the Approov Cloud Service (more about this below).

    * Android - to run on a device or an emulator:

              cordova run android
              cordova emulate android

        or install using ADB and then run directly from the device

              adb install -r path/to/cordova-plugin-approov-http-demo/platforms/android/app/build/outputs/apk/debug/app-debug.apk

        **Note:** An app run on a rooted device will not attest.

    * iOS - run the app on your device from within Xcode

        **Note:** Be sure to uncheck the debug option if you launch the app from XCode. The app will always fail attestation if there is an attached debugger whether the app is registered with the Approov service or not. Similarly, an app that is run on a jailbroken device will not attest.

        **Note:** The iOS demo app will not work correctly in the simulator due to native
environment restrictions. Although the demo app will run in the simulator, it will
consistently fail to authenticate with the Approov Cloud Service and you will not be
able to authenticate with the remote Shapes Server.

        To register an iOS app with the Approov Service, you must export the app as an IPA file, and then run the Approov registration tool, which we will get to in a minute.

        In Xcode, choose 'Archive' from the 'Product' menu.
The 'Archives Organizer' window will then be displayed, and you can select the archive
and use the 'Export...' button to code sign and export the app as an IPA package.
In the export wizard, choose 'Save for Development Deployment',
click 'Next', choose your Development Team for provisioning,
click 'Next' again to export one app for all compatible devices,
click 'Next' again in the summary page,
then finally export the IPA to a location of your choice.

        Once you have a signed IPA you can install and run it on the device.
Either use the iTunes app, Apple Configurator 2 app or the cfgutil command-line tool
to install the IPA.


Testing it Doesn't Work
-----------------------

To begin with your app should run, but if you try and retrieve a shape it will fail. This is because simply adding our SDK to the app is not enough. Our servers need to verify the authenticity of it and to do that they need to have stored
an app signature.


Registering an App
-----------------------

For our servers to know about your App, you have to tell us about it. We use a simple registration program to do this. All you have to do is point our executable at your App package (APK or IPA depending on your platform) and we will do the rest. The app signature will be added to the list of recognized signatures in our attestation servers.

**Note:** For those behind a firewall, our registration application communicates on port 8087.
If you get an error while submitting data saying you can't establish a connection, this
could be the problem.

It is good practice to register the App whenever it is modified and the process is simple. In the `registration-tools` folder that you obtained when downloading prerequisites, find the executable for your OS. You will need to provide it with some information to allow it to register your app. The most important pieces are the App itself and the registration token, which you received with your demo download link in the email we sent you. The token authorizes you to upload the new App signature. You need to place it in a file (`registration_access.tok`) and feed that to the registration program.

Android on Linux example:

        path/to/registration -a path/to/cordova-plugin-approov-http-demo/platforms/android/app/build/outputs/apk/debug/app-debug.apk -t <registration_access.tok from email>

iOS on OSX example:

        path/to/registration -a MyApplication.ipa -t <registration_access.tok from email>

Note: Because this is a test server, we will regularly clear out any registrations. In a production system you are able to see exactly what Apps had been registered in our admin portal and have complete control over what App registrations are valid for your system.


Test It Now Works
-----------------------

After a short propagation delay (about 30s) your app will be recognized as valid and given a token that will let it access the demo server. To make sure the SDK is not caching an invalid token, you might have to restart the app.


Next Steps
-----------------------

If you like, you can now modify the client to explore how to use the SDK. Remember to register your app again whenever you make a change.

**Note:** Attaching a debugger or using a rooted device will be detected by the SDK and you will not get a valid token.

To take this further and integrate one of your existing apps into the flow, why not progress through the full [Approov documentation][1]. You can make all the changes required to your client side code without requiring your own Approov sign-up because the app never knows whether a token is valid or not anyway.

You can also use the [server-side integration documentation][2] to guide you through the server-side changes required to receive and validate tokens. We do not publish the secret for the demo, but once you are set up and receiving tokens from the app, why not [sign-up to a full Approov account][3] and take advantage of the 1 month free trial to finish off the verification flow.

If you have any questions or problems then just get in touch via [Zendesk][4].

[1]: https://approov.io/docs/
[2]: https://approov.io/docs/serversideintegration.html
[3]: https://www.approov.io/index.html#pricing
[4]: https://approov.zendesk.com

