var Pane = require('MapPaneEnum');

cc.Class({
    extends: cc.Component,

    properties: {
        row: {
            default: 6,
            range: [1, 6],
        },
        column: {
            default: 10,
            range: [1, 10],
        },
        
        playerPosition: {
            default: null,
            type: cc.Vec2,
        },
        wallsPosition: {
            default: [],
            type: cc.Vec2,
        },
        boxesPosition: {
            default: [],
            type: cc.Vec2,
        },
        targetsPosition: {
            default: [],
            type: cc.Vec2,
        },
        
        floorSprite: {
            default: null,
            type: cc.Prefab,
        },
        wallSprite: {
            default: null,
            type: cc.Prefab,
        },
        boxSprite: {
            default: null,
            type: cc.Prefab,
        },
        targetSprite: {
            default: null,
            type: cc.Prefab,
        },
        victoryPanel: {
            default: null,
            type: cc.Prefab,
        },
        
        playerLeft: {
            default: null,
            type: cc.SpriteFrame,
        },
        playerUp: {
            default: null,
            type: cc.SpriteFrame,
        },
        playerRight: {
            default: null,
            type: cc.SpriteFrame,
        },
        playerDown: {
            default: null,
            type: cc.SpriteFrame,
        },
        
        // private
        map: {
            default: null,
            visible: false,
        },
        player: {
            default: null,
            type: cc.Node,
            visible: false,
        },
        pane: {
            default: null,
            type: cc.Size,
            visible: false,
        },
        moving: {
            default: false,
            visible: false,
        },
        targetNumber: {
            default: 0,
            visible: false,
        },
        victoryPanelObject: {
            default: null,
            type: cc.Node,
            visible: false,
        },
    },
    
    // use this for initialization
    onLoad: function () {
        this.victoryPanelObject = this.node;
        var victory = cc.find('Canvas/VictoryPanel');
        if (victory) {
            victory.removeFromParent(true);
            victory.destroy();
            victory = null;
        }
        
        this.targetNumber = 0;
        this.map = [];
        this.player = new cc.Node();
        this.pane = new cc.Size(96, 96);
        
        this.row = Math.floor(this.row);
        this.column = Math.floor(this.column);
        this.node.setContentSize(this.column * this.pane.width, 
            this.row * this.pane.height);
        
        this.playerPosition.x = Math.floor(this.playerPosition.x);
        this.playerPosition.y = Math.floor(this.playerPosition.y);
        
        // init map
        for (var i = 0; i < this.column; ++i) {
            this.map[i] = [];
            for (var j = 0; j < this.row; ++j) {
                this.map[i][j] = cc.p(Pane.Floor, -1);
            }
        }
        
        this.init([this.playerPosition], Pane.Player);
        this.init(this.wallsPosition, Pane.Wall);
        this.init(this.boxesPosition, Pane.Box);
        this.init(this.targetsPosition, Pane.Target, true);
        
        // add sprite
        this.map.forEach(function(rows, i) {
            rows.forEach(function(element, j) {
                var currentPosition = this.getPostion(i, j);
                
                var node;
                if (element.x === Pane.Floor) {
                    node = cc.instantiate(this.floorSprite);
                } else if (element.x === Pane.Target) {
                    node = cc.instantiate(this.targetSprite);
                }
                if (node) {
                    node.parent = this.node;
                    node.position = currentPosition;
                }
            }.bind(this));
        }.bind(this));
        
        this.map.forEach(function(rows, i) {
            rows.forEach(function(element, j) {
                var currentPosition = this.getPostion(i, j);
                
                var node;
                if (element.y === Pane.Player) {
                    var playerSprite = this.player.addComponent(cc.Sprite);
                    playerSprite.spriteFrame = this.playerRight;
                    node = this.player;
                } else if (element.y === Pane.Wall) {
                    node = cc.instantiate(this.wallSprite);
                } else if (element.y === Pane.Box) {
                    node = cc.instantiate(this.boxSprite);
                }
                
                if (node) {
                    node.parent = this.node;
                    node.position = currentPosition;
                    node.tag = this.composeTag(cc.p(i, j));
                    console.log(node.tag);
                }
            }.bind(this));
        }.bind(this));
    },

    // called every frame
    update: function (dt) {

    },
    
    restart: function() {
        var result = cc.director.loadScene('helloworld');
    },
    
    init: function(arr, code, isGround) {
        var i = 0;
        for (var index in arr) {
            var x = Math.floor(arr[index].x);
            var y = Math.floor(arr[index].y);
            if (x < 0 || x >= this.column || y < 0 || y >= this.row) {
                delete arr[index];
                continue;
            }
            
            if (isGround) {
                this.map[x][y] = cc.p(code, -1);
            } else {
                this.map[x][y].y = code;
            }
            
            if (code == Pane.Target) {
                ++this.targetNumber;
            }
        }
    },
    
    getPostion: function(column, row) {
        if (row === undefined) {
            row = column.y;
            column = column.x;
        }
        var nodeTopLeft = cc.p(-this.node.width / 2, this.node.height / 2);
        return cc.p(nodeTopLeft.x + this.pane.width * (column + 0.5), 
                    nodeTopLeft.y - this.pane.height * (row + 0.5));
    },
    
    composeTag: function(position) {
        var i = position.x;
        var j = position.y;
        return i * this.column + j;
    },
    
    onUp: function() {
        this.checkMove(this.playerLeft, cc.Vec2.UP.mulSelf(-1));
    },
    
    onDown: function() {
        this.checkMove(this.playerRight, cc.Vec2.UP);
    },
    
    onLeft: function() {
        this.checkMove(this.playerLeft, cc.Vec2.RIGHT.mulSelf(-1));
    },
    
    onRight: function() {
        this.checkMove(this.playerRight, cc.Vec2.RIGHT);
    },
    
    checkMove: function(frame, step) {
        if (this.moving) {
            return;
        }
        this.player.getComponent(cc.Sprite).spriteFrame = frame;
        
        var nextPos = this.playerPosition.add(step);
        this.onMove(nextPos, nextPos.add(step));
        if (this.onMove(this.playerPosition, nextPos)) {
            this.moving = true;
            this.playerPosition = nextPos;
        }
    },
    
    onMove: function(srcPos, dstPos) {
        if (!this.containPane(srcPos) || !this.containPane(dstPos)) {
            return false;
        }
        
        var srcElement = this.map[srcPos.x][srcPos.y];
        var dstElement = this.map[dstPos.x][dstPos.y];
        if (srcElement.y !== Pane.Player && srcElement.y !== Pane.Box) {
            return false;
        }
        
        if (dstElement.y !== Pane.Invalid) {
            return false;
        }
        
        console.log(srcPos + ' ' + dstPos);
        var srcTag = this.composeTag(srcPos);
        var node = this.node.getChildByTag(srcTag);
        if (!node) {
            return false;
        }
        var action = cc.sequence(cc.moveTo(0.5, this.getPostion(dstPos)),
            cc.callFunc(function () {
                this.moving = false;
            }.bind(this)));
            
        node.tag = this.composeTag(dstPos);
        if (srcElement.x === Pane.Target && srcElement.y === Pane.Box) {
            ++this.targetNumber;
        }
        dstElement.y = srcElement.y;
        srcElement.y = Pane.Invalid;
        if (dstElement.x === Pane.Target && dstElement.y === Pane.Box) {
            --this.targetNumber;
            if (this.targetNumber === 0) {
                var victory = cc.instantiate(this.victoryPanel);
                victory.parent = cc.director.getScene();
                victory.opacity = 0;
                action = cc.sequence(action, 
                    cc.callFunc(function () {
                        victory.getComponent(cc.Animation).play('fadeIn');
                    }.bind(this)));
            }
        }
        
        node.runAction(action);
        return true;
    },
    
    containPane: function(pane) {
        return (pane.x >= 0 && pane.x < this.column &&
                pane.y >= 0 && pane.y < this.row);
    },
});
