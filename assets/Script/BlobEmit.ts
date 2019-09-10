// Author 大掌教
// Q群 704391772
// 更多源码在微信公众号 darkpalm

import Blob from "./Blob";
const {ccclass, property} = cc._decorator;

@ccclass
export default class BlobEmit extends cc.Component {

    @property(cc.Node)
    blob: cc.Node = null;

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchBegan, this);
    }

    onTouchBegan(event:cc.Event.EventTouch) {
        var touchLoc = event.touch.getLocation();

        var node = cc.instantiate(this.blob);
        var blob = node.getComponent(Blob);
        blob.init();
        blob.emitTo(touchLoc);

        node.active = true;
        node.parent = cc.director.getScene();
    }

}
