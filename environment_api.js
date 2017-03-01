(function(f) {
    if (window.STAppRunner) f();
    else window.addEventListener("load", f);
})(function() {

    if (!self.fetch) {
        var imported = document.createElement('script');
        imported.src = './fetch.js';
        document.head.appendChild(imported);
        console.log('fetch.js polyfill was imported');
    }

    STAppRunner.setEnvironmentAPI({
        /**
         * Passes value to the environment to update external menu.
         *
         * @param dashId
         */
        setDashboard(id) {
            return _setDashboard(id);
        },

        /**
         * Passes new signal values to the environment for writing.
         *
         * @param signals
         */
        setSignals(signalsArray) {
            return _setSignals(signalsArray);
        },

        /**
         * Requests environment to close STAppRunner view.
         */
        closeSTAppRunner() {
            return _closeSTAppRunner();
        },

        /**
         * Callback to pass API.setSystem() result back to environment.
         *
         * @param err
         */
        onSetSystemResult(err) {
            _notifyOnError('onSetSystemResult', err);
        },

        /**
         * Callback to pass API.setApp() result back to environment.
         *
         * @param err
         * @param systemSignals Signals used by the dashboards.
         */
        onSetAppResult(err, systemSignals) {
            _notifyOnError('onSetAppResult', err, systemSignals);
        },

        /**
         * Callback to pass API.setDashboard() result back to environment.
         *
         * @param err
         */
        onSetDashboardResult(err) {
            _notifyOnError('onSetDashboardResult', err);
        },

        /**
         * Callback to pass API.setSignals() result back to environment.
         *
         * @param err
         */
        onSetSignalsResult(err) {
            _notifyOnError('onSetSignalsResult', err);
        }
    });
});

// RunApp's WebServer address
var _baseUrl = new URL('https://sd10.softwerk.se/develop/api/');

function _createRequest(content) {
    var post_header = new Headers();

    var init = {
        method: 'GET',
        headers: post_header,
        mode: 'cors',
        cache: 'default',
    };

    return init;
}

function _setDashboard(id) {
    var dashboardUrl = new URL('setDashboard', _baseUrl);

    // dashboard id payload
    var content = Object({});
    content.dash_id = id;

    // make request
    return fetch(dashboardUrl.href, _createRequest(JSON.stringify(content)))
        .then(function(response) {
            return response.text();
        })
        .catch(function(error) {
            throw new Error(`Could not perform callback: ${error.message}`);
        });
}

function _setSignals(signals) {
    var signalsUrl = new URL('setSignals', _baseUrl);

    // make request
    return fetch(signalsUrl.href, _createRequest(JSON.stringify(signals)))
        .then(function(response) {
            return response.json();
        })
        .catch(function(error) {
            throw new Error(`Could not write signals: ${error.message}`);
        });
}

function _notifyOnError(...args) {
    var source = arguments[0];
    var message = arguments[1];

    var errorURL = new URL(source, _baseUrl);

    var error = Object({});
    if (message === undefined || message === null) {
        error.error = 'success';
    } else {
        error.error = message.message;
    }

    if (arguments.length > 2 && arguments[2] !== undefined) {
        var signalsArray = arguments[2];
        error.signals = signalsArray;
    }

    return fetch(_baseUrl.href, _createRequest(JSON.stringify(error)))
        .then(function(response) {})
        .catch(function(error) {
            throw new Error(`Could not write signals: ${error.message}`);
        });
}

function _closeSTAppRunner(){
    var closeSTAppRunnerUrl = new URL('closeSTAppRunner', _baseUrl);

    return fetch(closeSTAppRunnerUrl.href, _createRequest(''))
        .then(function(response) {
            return response.text();
        })
        .catch(function(error) {
            throw new Error(`Could not close STAppRunner: ${error.message}`);
        });
}
