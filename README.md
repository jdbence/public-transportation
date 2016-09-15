# public-transportation

An application that allows users to select a departure and arrival train station, and see a list of trains, times, and durations. A default train schedule will be provided that should be used when the application is offline. If a network connection exists, the application will query an endpoint that provides information about all arrival and departure times.

[example]: https://jdbence.github.io/public-transportation/dist/
[get-zip]: https://github.com/jdbence/public-transportation/archive/master.zip
[get-tgz]: https://github.com/jdbence/public-transportation/archive/master.tar.gz
[clone-http]: https://github.com/jdbence/public-transportation.git
[clone-svn]: https://github.com/jdbence/public-transportation
[clone-ghwin]: github-windows://openRepo/https://github.com/jdbence/public-transportation
[clone-ghmac]: github-mac://openRepo/https://github.com/jdbence/public-transportation
[gulp]: http://gulpjs.com
[bower]: http://bower.io
[browsersync]: https://www.browsersync.io
[polymer]: https://www.polymer-project.org/1.0

[Live Example][example]

## Includes

[Gulp][gulp], [Bower][bower], [Browsersync][browsersync], [Polymer][polymer]

## Installation

* Clone git repository via [https][clone-http] or with the Github [Windows][clone-ghwin] or [Mac][clone-ghmac] clients.
* Download as [zip][get-zip] or [tar.gz][get-tgz]
* Checkout with [svn][clone-svn]

### Dependencies

```node
//  Install local dependencies
npm install && bower install
```

### Gulp Tasks

```node
// Start live editing
gulp live
// Build dist version
gulp build
// Build github dist version (live preview)
gulp build:github
// Empties dist folder
gulp clean
```

## Simple Server

```node
//  Install globals
npm install http-server -g
//  Start server
http-server -p 8080
```

## License

Project is released under the [MIT License](http://opensource.org/licenses/MIT).