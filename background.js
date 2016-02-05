// Google Cloud Public Server : 146.148.60.119
// Stanford Public Server : cookie.stanford.edu

var proxy_server='146.148.60.119';
var proxy_port=9037;
var proxy_url= 'http://' + proxy_server + ':' + proxy_port;
var frontend_server='146.148.60.119:8000';

// Message for speedtest
var speedtest_message = "AnyLink doesn't work with Ookla's Speedtest " + 
    "(it doesn't use HTTP).\n" +
    "\nUse http://www.bandwidthplace.com instead!"

// Keep a default descriptor, not associated with a profile.
var default_descriptor = generateCookieDescriptor();


var profiles = {};
var active_profile = -1;
var active = false;

// Used for parsing a url.
var parser = document.createElement('a');

/**
 * Gets domain from url.
 */
function getDomainFromUrl(url) {
    parser.href = url;
    return parser.hostname;
}

/**
 * show a notification
 */
function showNotification(message, autoremove) {
    if (autoremove === undefined) {
	autoremove = true;
    }
    chrome.notifications.create('anylink_notification',
				{type: 'basic', title: 'AnyLink',
					message: message,
					iconUrl:'img/icon128.png'},
				function() {});
    if (autoremove == true) {
	chrome.alarms.create('notify',
			     {when: Date.now() + 10000});
	chrome.alarms.onAlarm.addListener(function(alarm) {
		if (alarm.name == 'notify') {
		    chrome.notifications.clear('anylink_notification', function() {});
		}
	    });
    }
}

/**
 * Returns a random alphanumeric string.
 */
function getRandomID() {
    return Math.random().toString(36).slice(2);
}

function generateCookieDescriptor() {
    var chip = Math.floor(Math.random()*(Math.pow(2,32) -1 ));
    var seed = getRandomID();
    var descriptor = new CookieDescriptor(chip, seed);
    return descriptor;
}

function storeProfile(profile, descriptor) {
    var _profile = {id:profile.id, name:profile.name, settings:profile.content, cookie_descriptor:descriptor}
    profiles[_profile.id] = _profile;
}

function activateProfile(id) {
    console.log("setting active profile with id ", id);
    active_profile = id;
    if (active == true) {
	unsetProxy();
	stopCookieAdder();
	stopUrlChecker();
    }
    setProxy();
    startCookieAdder();
    startUrlChecker();
    active = true;
}

/**
 * Translate dictionary to list in order to fit Angularjs ng-repeat.
 */
function getProfiles() {
    var _profiles = [];
    for( id in profiles ) {
	_profiles.push(profiles[id]);
    }
    return _profiles;
}

function deleteProfiles() {
    profiles = {};
}

function stop() {
    active_profile = -1;
    stopCookieAdder();
    stopUrlChecker();
    unsetProxy();
    active = false;    
}

/**
 * Stop adding cookies but keep the proxy enabled
 * to check the baseline performance.
 */
function activateProxyBaseline() {
    if (active == false) {
	active = true;
	startCookieAdder();
	startUrlChecker();
    }
    active_profile = -1;
    setProxy();
}

function addCookie(details) {
    var headers = details.requestHeaders;
    if (active_profile != -1) {
	cookie = profiles[active_profile].cookie_descriptor.generateCookie().toString();
    } else {
	cookie = default_descriptor.generateCookie().toString();
    }
    headers.push({name:'network-cookie', value:cookie});
    return { requestHeaders: headers };
}

function checkUrl(details) {
    showNotification(speedtest_message);
}
    

function startCookieAdder() {
    chrome.webRequest.onBeforeSendHeaders.addListener(addCookie, 
						      {urls:["<all_urls>"]},
						      ['requestHeaders','blocking']);
}

function stopCookieAdder() {
    chrome.webRequest.onBeforeSendHeaders.removeListener(addCookie);
}

function startUrlChecker() {
    chrome.webNavigation.onDOMContentLoaded.addListener(checkUrl, 
							{url: [{hostContains:'speedtest'}]});
}

function stopUrlChecker() {
    chrome.webNavigation.onDOMContentLoaded.removeListener(checkUrl);
}

function setProxy() {
    var config = {
	mode: 'fixed_servers',
	rules: {
	    proxyForHttp: {
		scheme: "http",
		host: proxy_server,
		port: proxy_port
	    },
	}
    };
    chrome.proxy.settings.set({value: config, scope: 'regular'}, function() {});
}

function unsetProxy() {
    var config = {
	mode: 'direct'
    };
    chrome.proxy.settings.set({value: config, scope: 'regular'}, function() {});
}