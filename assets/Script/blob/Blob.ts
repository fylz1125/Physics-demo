import smooth from './smooth';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Blob extends cc.Component {

    @property
    particleNumber = 12;

    @property
    particleRadius = 30;

    @property
    sphereSize = 12;

    private ctx: cc.Graphics = null;
    private spheres = [];

    init() {
        this.ctx = this.getComponent(cc.Graphics);
        this.ctx.lineWidth = 6;
        // 用十六进制创建颜色
        this.ctx.strokeColor = cc.color().fromHEX('#495069');
        this.ctx.fillColor = cc.color().fromHEX('#ffde59');


        let x = this.node.x;
        let y = this.node.y;

        let particleNumber = this.particleNumber;
        let particleRadius = this.particleRadius;
        let sphereSize = this.sphereSize;

        let particleAngle = (2 * Math.PI) / particleNumber;
        // 外圈两个球之间的距离，用来设置距离关节
        let particleDistance = 2 * particleRadius * Math.sin(particleAngle / 2);

        let spheres = [];
        // 中心放一个球形刚体
        spheres.push( this.createSphere(0, 0, sphereSize, this.node) );

        for (let i=0; i<particleNumber; i++) {
            let angle = particleAngle*i;
            let posX = particleRadius * Math.cos(angle);
            let posY = particleRadius * Math.sin(angle);
            let sphere = this.createSphere(posX, posY, sphereSize);
            spheres.push( sphere );
            
            let joint = sphere.node.addComponent(cc.DistanceJoint);
            joint.connectedBody = spheres[0];
            joint.distance = particleRadius;
            joint.dampingRatio = 0.5;
            joint.frequency = 4;

            if (i > 0) {
                joint = sphere.node.addComponent(cc.DistanceJoint);
                joint.connectedBody = spheres[spheres.length - 2];
                joint.distance = particleDistance;
                joint.dampingRatio = 1;
                joint.frequency = 0;
            }

            if (i === particleNumber - 1) {
                joint = spheres[1].node.addComponent(cc.DistanceJoint);
                joint.connectedBody = sphere;
                joint.distance = particleDistance;
                joint.dampingRatio = 1;
                joint.frequency = 0;
            }

            sphere.node.parent = this.node;
        }

        this.spheres = spheres;
        
    }

    private createSphere(x: number, y: number, r: number, node?: cc.Node): cc.RigidBody{
        if (!node) {
            // 刚体必须加在节点上，如果节点为空则创建一个
            node = new cc.Node();
            node.x = x;
            node.y = y;
        }

        // 向节点添加刚体组件类型，返回一个刚体
        let body = node.addComponent(cc.RigidBody);

        // 向节点添加圆形碰撞组件
        let collider = node.addComponent(cc.PhysicsCircleCollider);
        collider.density = 1;
        collider.restitution = 0.4;
        collider.friction = 0.5;
        collider.radius = r;
        

        return body;
        
    }

    emitTo (target:cc.Vec2) {
        let x = target.x;
        let y = target.y;

        let selfX = this.node.x;
        let selfY = this.node.y;

        // 计算节点到触摸点的距离
        let distance = target.sub(this.node.position).mag();
        // 速度向量
        let velocity = cc.v2(x - selfX, y - selfY);
        // 归一化速度向量
        velocity.normalizeSelf();
        // 缩放当前向量
        velocity.mulSelf(distance * 2);
        // 遍历所有刚体，给速度
        this.spheres.forEach(function (sphere) {
            sphere.linearVelocity = velocity;
        });
    }

    update(dt) {
        // 获取图形绘制上下文
        let ctx = this.ctx;

        let points = this.spheres.map(sphere => {
            return this.expandPosition( sphere.node.position );
        });

        // 第一个点是中心点，移除
        points.shift();

        // 生成光滑曲线控制点，用三阶贝塞尔曲线连接点成圆滑曲线
        let result = smooth( points );
        let firstControlPoints = result[0];
        let secondControlPoints = result[1];

        let pos = points[0];

        ctx.clear();
        ctx.moveTo(pos.x, pos.y);

        for (let i = 1, len = points.length; i < len; i++) {
            let firstControlPoint = firstControlPoints[i - 1],
                secondControlPoint = secondControlPoints[i - 1];

            ctx.bezierCurveTo(
                firstControlPoint.x, firstControlPoint.y,
                secondControlPoint.x, secondControlPoint.y,
                points[i].x, points[i].y
            );
        }

        ctx.close();
        ctx.fill();
        ctx.stroke();
    }

    expandPosition (pos:cc.Vec2) {
        return pos.mul(1.3);
    }
}
