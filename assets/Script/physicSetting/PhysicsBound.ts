// Author 大掌教
// Q群 704391772
// 更多源码在微信公众号 darkpalm

const {ccclass, property} = cc._decorator;

@ccclass
export default class PhysicsBound extends cc.Component {

    @property
    mouseJoint = true;


    onLoad() {
        let width = this.node.width;
        let height = this.node.height;

        let node = new cc.Node();
        let body = node.addComponent(cc.RigidBody);
        body.type = cc.RigidBodyType.Static;

        if (this.mouseJoint) {
            // add mouse joint
            let joint = node.addComponent(cc.MouseJoint);
            joint.mouseRegion = this.node;    
        }

        this.addBound(node, 0, height / 2, width, 10);
        this.addBound(node, 0, -height / 2, width, 10);
        this.addBound(node, -width / 2, 0, 10, height);
        this.addBound(node, width / 2, 0, 10, height);
        node.parent = this.node;


    }

    addBound(node: cc.Node, x: number, y: number, width: number, height: number) {
        let collider = node.addComponent(cc.PhysicsBoxCollider);
        collider.offset.x = x;
        collider.offset.y = y;
        collider.size.width = width;
        collider.size.height = height;
    }

}
