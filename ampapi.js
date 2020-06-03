exports.AMPAPI = function (baseUri) {
    const request = require('request');
    var self = this;
	this.baseUri = baseUri;
	this.sessionId = "";
	this.dataSource = "";
	this.API = { Core: { GetAPISpec: [] } };
	this.initAsync = async function (stage2) {
		this.dataSource = 
			(baseUri.endsWith("/") ? 
				baseUri.substring(0, baseUri.lastIndexOf("/")) : 
				baseUri)
			+ "/API";
			
		for (const module of Object.keys(this.API)) {
            var methods = this.API[module];
            this[module] = {};

            for (const method of Object.keys(methods)) {
                this[module][method + "Async"] = function (params) {
                    var args = Array.prototype.slice.call(arguments, 0);
                    return new Promise(function (resolve, reject) {
                        args.push(resolve);
                        args.push(reject);
                        self.APICall(module, method, args);
                    });
                };
            }
        }

        if (stage2) {
            return true;
        }
        else {
            var result = await this.Core.GetAPISpecAsync();
            if (result != null) {
                this.API = result;
                return await this.initAsync(true);
            }
            else {
                return false;
            }
        }
	}
	this.APICall = function(module, methodName, args) {
        var data = {};

        var methodParams = this.API[module][methodName].Parameters;
        var methodParamsLength = methodParams != null ? methodParams.length : 0;

        for (var a = 0; a < methodParamsLength; a++) {
            var argName = methodParams[a].Name;

            var val = args[a];

            data[argName] = val;
        }

        var callback = null;
        var failCallback = null;

        if (args.length == (methodParamsLength + 1)) {
            callback = args[args.length - 1];
        }
        else if (args.length == (methodParamsLength + 2)) {
            callback = args[args.length - 2];
            failCallback = args[args.length - 1];
        }

        var URI = this.dataSource + "/" + module + "/" + methodName;
        data.SESSIONID = this.sessionId;
        request.post({
			headers: {"Accept": "application/vnd.cubecoders-ampapi", "User-Agent": "CCL/AMPAPI-NodeJS"},
			url: URI,
			body: JSON.stringify(data),
		}, function (error, res, body) {
			if (error && failCallback)
			{
				failCallback(error, res);
			}
			else if (!error)
			{
                var result = JSON.parse(body);

                if (result != null && Object.keys(result).length === 1 && result.result != undefined) {
                    callback(result.result);
                }
                else
                {
                    callback(result);
                }
			}
		});
    }
};