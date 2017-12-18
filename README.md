# SHOT BY SHOT

# Dependencies

#### You'll need the following things to work on this project:

1. NPM via [node](http://nodejs.org/)

2. [Gulp](http://gulpjs.com/)

    ```sh
    $ npm install -g gulp
    ```

3. [Bower](http://bower.io/)

    ```sh
    $ npm install -g bower
    ```

4. [Sass](http://sass-lang.com/install)

# Installation

#### Clone this repo and then run the following commands from the top level directory:

1. Install node dependencies:

    ```sh
    $ npm install
    ```

2. Install frontend dependencies:

    ```sh
    $ bower install
    ```

3. Begin webserver with livereload using Gulp:

    ```sh
    $ gulp serve
    ```

4. Get to work!

5. ...oh, and if you want to compile and see a more production-ized version:

    ```sh
    $ gulp serve:dist
    ```

6. ...and if you want a bit of API caching and don't want to deal with livereload:

    ```sh
    $ gulp serve:4Real
    ```

7. ...ok, seriously last thing, but if you want all you get with 4Real but with the production-ized version:

    ```sh
    $ gulp serve:4RealDist
    ```

# Installation Mode

If you navigate to the app with the `?installation` query param, it operates in "installation mode".
This means that the video will auto-play after 30 seconds, then auto-scroll to the bottom, and automatically move to the next shot after another 30 seconds.

# But, wait, how did we get here? Where did all these files come from?

### Here's how this app was scaffolded:

1. Installed node and npm.
2. Installed yeoman: ```npm install -g yo```
3. Installed gulp: ```npm install -g gulp```
4. Installed gulp-based angular yeoman generator: ```npm install -g generator-gulp-angular```
5. Ran ```yo angular```.
