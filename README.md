# ampapi-node

This API allows you to communicate with AMP installations from within Node.js.

Documentation for available API calls can be found by appending /API to the URL of any existing AMP installation.

# Installation

```bash
npm install "@cubecoders/ampapi"
```

# Example

```node
var ampapi = require("@cubecoders/ampapi");

async function start(){
    var API = new ampapi.AMPAPI("http://localhost:8080/");
    try
    {
        //Perform first-stage API initialization.
        var APIInitOK = await API.initAsync();
        if (!APIInitOK) {
            console.log("API Init failed");
            return;
        }

        //The third parameter is either used for 2FA logins, or if no password is specified to use a remembered token from a previous login, or a service login token.
        var loginResult = await API.Core.LoginAsync("admin", "myfancypassword123", "", false);
        if (loginResult.success)
        {
            console.log("Login successful");
            API.sessionId = loginResult.sessionID;
			
            //Perform second-stage API initialization, we only get the full API data once we're logged in.
            APIInitOK = await API.initAsync();
			
            if (!APIInitOK) {
                console.log("API Stage 2 Init failed");
                return;
            }
			
            //API call parameters are simply in the same order as shown in the documentation.
            await API.Core.SendConsoleMessageAsync("say Hello Everyone, this message was sent from the Node API!");
            var currentStatus = await API.Core.GetStatusAsync();
            console.log(`Current CPU usage is: ${currentStatus.CPUUsagePercent}%`);
        }
        else
        {
            console.log("Login failed");
            console.log(loginResult);
        }
    }
    catch (err)
    {
        console.log(err);
    }
}

start();
```
