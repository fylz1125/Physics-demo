// Author 大掌教
// Q群 704391772
// 更多源码在微信公众号 darkpalm

const {ccclass, property} = cc._decorator;

@ccclass
export default class conveyorBelt extends cc.Component {

    @property
    tangentSpeed = 5;

    onPreSolve(contact: cc.PhysicsContact,
        selfCollider: cc.PhysicsContact,
        otherCollider: cc.PhysicsCollider){
        contact.setTangentSpeed(this.tangentSpeed);
    }

    start () {

    }

}
