var ImageLoader = (function(window, document, undefined) {

    function ImageLoader() {
        this._allImages = document.getElementsByTagName('IMG');
        this._images = [];
        this._coords = [];

        this.init();
    }

    var $ = ImageLoader.global = {};

    $.instance = false;
    $.slice = Array.prototype.slice;
    $.win = {
        width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
        height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
    }

    ImageLoader.prototype = {
        init: function() {
            if ($.instance) return;

            this._defineImages();
            this._wrapImages();
            this._addWindowScrollListener();
        },

        _addWindowScrollListener: function() {
            var _ = this;
            var images = this._images;
            var coords = this._coords;

            window.onscroll = function(e) {
                if (!coords.length) return;

                var winTop = getWindowScroll().top;

                for (var i = 0; i < coords.length; i++) {
                    if (coords[i].top < winTop + $.win.height || coords[i].bottom < winTop) {
                        if (!_._images[i].dataset.realsrc) continue;
                        _._show(_._images[i]);
                    }
                }
            }
        },

        _show: function(image) {
            var wrapper = image.llWrapper;
            var wrapperParent = wrapper.parentNode;

            wrapperParent.insertBefore(image, wrapper);
            wrapperParent.removeChild(wrapper);

            image.setAttribute('src', image.dataset.realsrc);
            delete image.dataset.realsrc;
            image.style.display = '';
        },

        _wrapImages: function() {
            var _ = this;
            var image = $.slice.call(arguments, 0)[0];

            if (image) {
                wrap(image);
            } else {
                this._images.forEach(function(image, i){
                    wrap(image);
                });
            }

            function wrap(image) {
                var wrapper = document.createElement('DIV');
                var coords;

                wrapper.style.width = image.width + 'px';
                wrapper.style.height = image.height + 'px';
                wrapper.style.backgroundColor = '#fff';
                wrapper.classList = 'lazyload-holder';

                image.parentNode.insertBefore(wrapper, image);

                wrapper.appendChild(image);

                coords = getCoords(wrapper);
                _._coords.push(coords);

                image.style.height = 'auto';
                image.style.display = 'none';
                image.llWrapper = wrapper;
                image.llWrapper.prototype = wrapper.__proto__;
            }
        },

        _defineImages: function() {
            for (var i = 0; i < this._allImages.length; i++) {
                var currImg = this._allImages[i];

                if ((currImg.dataset.realsrc) !== undefined) {
                    $.instance = true;
                    this._images.push(currImg);
                }
            }
        }
    }

    return ImageLoader;
}(window, document, undefined));



/**
 * Helpers.
 * ========================= *
 */
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

setTimeout(function(){
    var lazyLoader = new ImageLoader();
}, 1800);
// if (MainScriptExec) {
//     var lazyLoader = new ImageLoader();
// }
// $(document).ready(function() {
//     var lazyLoader = new ImageLoader(document);
// });
// function initLazyLoader() {
//     var lazyLoader = new ImageLoader(document);
// }
// document.addEventListener("DOMContentLoaded", initLazyLoader);
