
Unsorted (and incomplete) notes about how this works.



## Analytics Override for Testing

During testing or development, you may wish to prevent analytics events from being logged to the server. To accomplish this, you can append the -x flag to either the versionId parameter in the URL or the passcode entered on the password screen. For example, accessing the site with ?v=123-x or entering 1234-x as the passcode will disable analytics logging for that specific session. This override ensures that test visits and interactions do not clutter the analytics logs, allowing for cleaner data collection during verification processes.