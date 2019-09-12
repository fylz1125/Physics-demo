// Author 大掌教
// Q群 704391772
// 更多源码在微信公众号 darkpalm

cc.game.on(cc.game.EVENT_ENGINE_INITED, () => {
    cc.macro.ENABLE_WEBGL_ANTIALIAS = true;
    let physicsManager = cc.director.getPhysicsManager();
    physicsManager.enabled = true;

    physicsManager.debugDrawFlags = //0;
        // @ts-ignore
        // cc.PhysicsManager.DrawBits.e_aabbBit |
        // @ts-ignore
        cc.PhysicsManager.DrawBits.e_jointBit |
        // @ts-ignore
        cc.PhysicsManager.DrawBits.e_shapeBit
        ;
});