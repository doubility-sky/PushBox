cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    // use this for initialization
    onLoad: function () {
        this.node.on('touchstart', function(event) {
            if (this.opacity > 0) {
                event.stopPropagation();
            }
        });
        this.node.on('touchmove', function(event) {
            if (this.opacity > 0) {
                event.stopPropagation();
            }
        });
        this.node.on('touchend', function(event) {
            if (this.opacity > 0) {
                event.stopPropagation();
            }
        });
        this.node.on('touchcancel', function(event) {
            if (this.opacity > 0) {
                event.stopPropagation();
            }
        });
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
