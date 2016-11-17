var ImageLoader = (function(window, document, undefined) {

    var $ = ImageLoader.global = {};

    var _slice = Array.prototype.slice;
    var _window = {
        width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
        height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
    };

    $.instance = false;

    $.defaults = {
        preloader: false
    }

    function ImageLoader(options) {
        this._options = extend($.defaults, options);

        this._allImages = document.getElementsByTagName('IMG');
        this._images = [];
        this._coords = [];

        this._listeners = [];

        this.init();
    }

    ImageLoader.prototype = {
        init: function() {
            if ($.instance) return;

            this._defineImages();
            this._hide();
            this._setEventListeners();
            this._setInitEvent();
            this._watch();
        },

        upateCoords: function() {
            var coords = this._coords;

            this._images.forEach(function(image, i){
                coords[i] = getCoords(image.llWrapper);;
            });

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
                    $.instance = true;
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
                var coords;

                wrapper.style.width = image.width + 'px';
                wrapper.style.height = (image.width / image.getAttribute('width')) * image.height + 'px';
                wrapper.style.backgroundColor = '#fff';
                wrapper.classList = 'lazyload-holder';

                image.parentNode.insertBefore(wrapper, image);

                wrapper.appendChild(image);
                if (_._options.preloader) wrapper.insertAdjacentHTML('beforeend', _._options.preloader);

                coords = getCoords(wrapper);
                _._coords.push(coords);

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
            this._addEventListener(window, 'scroll', this._windowOnScroll, true);
            this._addEventListener(window, 'resize', this._windowOnResize, true);
        },

        _removeElentListeners: function() {
            this._removeEventListener(window, 'scroll');
            this._removeEventListener(window, 'resize');
        },

        _addEventListener: function(target, type, listener, setContext = false) {
            if (!this._listeners[target]) this._listeners[target] = [];

            this._listeners[target][type] = setContext ? listener.bind(this) : listener;
            target.addEventListener(type, this._listeners[target][type]);
        },

        _removeEventListener: function(target, type) {
            target.removeEventListener(type, this._listeners[target][type]);
        },

        _windowOnScroll: function() {
            this._watch();
        },

        _watch: function() {
            if (!this._images.length) {
                this._cleanUp();
                return;
            }

            var winTop = getWindowScroll().top,
                winBottom = winTop + _window.height;

            for (var i = 0; i < this._coords.length; i++) {
                if (!this._images[i]) continue;

                if ( (this._coords[i].top < winBottom || this._coords[i].bottom < winTop) && (this._coords[i].bottom > winTop) ) {
                    this._show(this._images[i]);

                    this._images.splice(i, 1);
                    this._coords.splice(i, 1);
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
        }
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

        for ( ; i < length; i++ ) {
            var obj = arguments[i];
            merge(obj);
        }

        return extended;
    }

    function getWindowScroll() {
        var body = document.body;
        var docEl = document.documentElement;

        return {
            top: window.pageYOffset || docEl.scrollTop || body.scrollTop,
            left: window.pageXOffset || docEl.scrollLeft || body.scrollLeft
        }
    }

    function getCoords(elem) {
        var box = elem.getBoundingClientRect();

        var body = document.body;
        var docEl = document.documentElement;

        var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
        var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

        var clientTop = docEl.clientTop || body.clientTop || 0;
        var clientLeft = docEl.clientLeft || body.clientLeft || 0;

        return {
            top: box.top + scrollTop - clientTop,
            left: box.left + scrollLeft - clientLeft,
            bottom: box.top + scrollTop - clientTop + box.height,
            right:  box.left + scrollLeft - scrollLeft + box.width
        };
    }

    return ImageLoader;
}(window, document, undefined));

// __init__
var lazyLoader;
setTimeout(function(){
    lazyLoader = new ImageLoader({
        preloader: '<i class=\"fa fa-circle-o-notch fa-spin fa-3x fa-fw\"></i>'
    });
}, 1600);
