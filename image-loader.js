/**
 * Image Loader - JavaScript Library.
 * @description Script for the gradual loading images.
 * @author Misha Pelykh
 * @version 1.1.0
 */
var ImageLoader = (function(window, document, undefined) {

    var $ = ImageLoader.global = {};

    var _slice = Array.prototype.slice,
        _docEl = document.documentElement,
        _docBody = document.body,
        _window = {
            width: window.innerWidth || _docEl.clientWidth || _docBody.clientWidth,
            height: window.innerHeight || _docEl.clientHeight || _docBody.clientHeight
        };

    $.instance = false;

    $.defaults = {
        watching: {
            scroll: false,
            timeout: {
                step: 200
            },
        },
        deep: 200,
        preloader: false
    }

    function ImageLoader(options) {
        this._options = extend($.defaults, options);

        this._allImages = document.getElementsByTagName('IMG');
        this._images = [];
        // this._coords = [];

        this._listeners = [];
        this._timeout = false;

        this._deep = this._options.deep ? this._options.deep : 0;

        this.init();
    }

    ImageLoader.prototype = {
        init: function() {
            if ($.instance) return;
            
            $.instance = true;

            this._defineImages();
            this._hide();
            this._setEventListeners();
            this._setInitEvent();
            this._watch();
        },

        _setInitEvent: function() {
            var event = new Event('imageloader_init');
            document.dispatchEvent(event);
        },

        _defineImages: function() {
            for (var i = 0; i < this._allImages.length; i++) {
                var currImg = this._allImages[i];

                if ((currImg.dataset.realsrc) !== undefined) {
                    this._images.push(currImg);
                }
            }
        },

        _hide: function() {
            var _ = this;
            var image = _slice.call(arguments, 0)[0];

            if (image) {
                wrap(image);
            } else {
                this._images.forEach(function(image, i) {
                    wrap(image, i);
                });
            }

            function wrap(image) {
                var wrapper = document.createElement('DIV');

                var width = image.width;
                var height = image.getAttribute('height');
                // var coords;

                wrapper.style.width = width + 'px';
                wrapper.style.height = (image.width / image.getAttribute('width')) * height + 'px';
                wrapper.classList = 'lazyload-holder';

                image.parentNode.insertBefore(wrapper, image);

                wrapper.appendChild(image);
                if (_._options.preloader) wrapper.insertAdjacentHTML('beforeend', _._options.preloader);

                // coords = getCoords(wrapper);
                // _._coords.push(coords);

                image.style.height = 'auto';
                image.style.display = 'none';
                image.llWrapper = wrapper;
                image.llWrapper.prototype = wrapper.__proto__;
            }
        },

        _show: function(image) {
            var data = image.dataset.realsrc;

            delete image.dataset.realsrc;

            var wrapper = image.llWrapper;
            var wrapperParent = wrapper.parentNode;

            image.setAttribute('src', data);

            image.onload = function() {
                wrapperParent.insertBefore(image, wrapper);
                wrapperParent.removeChild(wrapper);
                image.style.display = '';
            }
        },

        _setEventListeners: function() {
            var watching = this._options.watching;

            if (typeof watching === 'object') {
                if (typeof watching.timeout === 'object' && watching.timeout.step) {
                    this._timeout = true;
                    this._parseByTimeout(watching.timeout.step);
                }
                if (typeof watching.window === 'object' && watching.window.step) {
                    this._addEventListener(window, 'scroll', this._windowOnScroll, true);
                }
            }

            this._addEventListener(window, 'resize', this._windowOnResize, true);
        },

        _removeElentListeners: function() {
            this._timeout = false;
            this._removeEventListener(window, 'scroll');
            this._removeEventListener(window, 'resize');
        },

        _addEventListener: function(target, type, listener, setContext) {
            if (!this._listeners[target]) this._listeners[target] = [];

            var listTarget = this._listeners[target];

            listTarget[type] = setContext ? listener.bind(this) : listener;
            target.addEventListener(type, listTarget[type]);
        },

        _removeEventListener: function(target, type) {
            var newTarget = this._listeners[target];

            if (newTarget && newTarget[type]) {
                target.removeEventListener(type, this._listeners[target][type]);
            }
        },

        _windowOnScroll: function() {
            this._watch();
        },

        _parseByTimeout: function(step) {
            var _ = this;

            var parse = function() {
                setTimeout(function(){
                    if (!_._timeout) return;
                    _._watch();
                    parse();
                }, step);
            };

            parse();
        },

        _watch: function() {
            if (!this._images.length) {
                this._cleanUp();
                return;
            }

            var _ = this;
            var winTop = getWindowScroll().top - this._deep,
                winBottom = winTop + _window.height + this._deep * 2;

            for (var i = 0; i < this._images.length; i++) {
                if (!this._images[i]) continue;

                var coords = getCoords(this._images[i].llWrapper);

                if ( (coords.top < winBottom || coords.bottom < winTop) && (coords.bottom > winTop) ) {
                    this._show(this._images[i]);
                    this._images.splice(i, 1);
                    // this._coords.splice(i, 1);
                    i--;
                }
            }
        },

        _windowOnResize: function() {
            var docEl = document.documentElement;
            var docBody = document.body;

            _window.width = window.innerWidth || docEl.clientWidth || docBody.clientWidth;
            _window.height = window.innerHeight || docEl.clientHeight || docBody.clientHeight;
        },

        _cleanUp: function() {
            this._removeElentListeners();
        },

        // updateCoords: function() {
        //     var coords = this._coords;

        //     this._images.forEach(function(image, i){
        //         coords[i] = getCoords(image.llWrapper);
        //     });

        //     this._watch();
        // },
    }

    function extend() {
        var extended = {};
        var deep = false;
        var i = 0;
        var length = arguments.length;

        if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
            deep = arguments[0];
            i++;
        }

        var merge = function (obj) {
            for ( var prop in obj ) {
                if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
                    if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
                        extended[prop] = extend( true, extended[prop], obj[prop] );
                    } else {
                        extended[prop] = obj[prop];
                    }
                }
            }
        };

        for (; i < length; i++ ) {
            var obj = arguments[i];
            merge(obj);
        }

        return extended;
    }

    function getWindowScroll() {
        return {
            top: window.pageYOffset || _docEl.scrollTop || _docBody.scrollTop,
            left: window.pageXOffset || _docEl.scrollLeft || _docBody.scrollLeft
        }
    }

    function getCoords(elem) {
        var box = elem.getBoundingClientRect();

        var scrollTop = window.pageYOffset || _docEl.scrollTop || _docBody.scrollTop;
        var scrollLeft = window.pageXOffset || _docEl.scrollLeft || _docBody.scrollLeft;

        var clientTop = _docEl.clientTop || _docBody.clientTop || 0;
        var clientLeft = _docEl.clientLeft || _docBody.clientLeft || 0;

        return {
            top: box.top + scrollTop - clientTop,
            left: box.left + scrollLeft - clientLeft,
            bottom: box.top + scrollTop - clientTop + box.height,
            right:  box.left + scrollLeft - scrollLeft + box.width
        };
    }

    return ImageLoader;
}(window, document, undefined));