// Author 大掌教
// Q群 704391772
// 更多源码在微信公众号 darkpalm
import * as CalcUtils from './CalcUitls';
const { ccclass, property } = cc._decorator;


@ccclass
export default class CuttingObject extends cc.Component {

    private ctx: cc.Graphics = null;
    private touchStartPoint: cc.Vec2;
    private touchEndPoint: cc.Vec2;
    private touching = false;

    // 正向检测结果
    private r1: Array<cc.PhysicsRayCastResult> = null;
    // 逆向检测结果
    private r2: Array<cc.PhysicsRayCastResult> = null;
    // 检测结果合并
    private results: Array<cc.PhysicsRayCastResult> = null;

    onLoad() {
        let canvas = cc.find('Canvas');
        canvas.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        canvas.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        canvas.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        
        this.ctx = this.getComponent(cc.Graphics);
    }

    onTouchStart(event:cc.Event.EventTouch) {
        this.touching = true;
        this.r1 = this.r2 = this.results = null;
        this.touchStartPoint = this.touchEndPoint = event.touch.getLocation();
    }

    onTouchMove(event: cc.Event.EventTouch) {
        this.touchEndPoint = event.touch.getLocation();
        
    }
    
    onTouchEnd(event: cc.Event.EventTouch) {
        this.touchEndPoint = event.touch.getLocation();
        this.recalcResults();
        this.touching = false;
        
        let endPoint = this.touchEndPoint;
        if ( CalcUtils.Uitls.equals(this.touchStartPoint.sub(endPoint).magSqr(), 0) ) return;
        
        // 切割逻辑
        this.cuttingLogic();
        
    }

    cuttingLogic() {
        // recalculate fraction, make fraction from one direction
        this.r2.forEach(r => {
            r.fraction = 1 - r.fraction;
        });

        let results = this.results;

        let pairs = [];
        // 处理成对的交点
        for (let i = 0; i < results.length; i++) {
            let find = false;
            let result = results[i];

            for (let j = 0; j < pairs.length; j++) {
                let pair = pairs[j];
                // 如果在同一个碰撞体里，则是一对交点
                if (pair[0] && result.collider === pair[0].collider) {
                    find = true;

                    // one collider may contains several fixtures, so raycast may through the inner fixture side
                    // we need remove them from the result
                    // 两个交点距离太小则舍去，如果是个凹多边形，这里会导致bug
                    let r = pair.find((r) => {
                        return r.point.sub(result.point).magSqr() <= CalcUtils.POINT_SQR_EPSILON;
                    });

                    if (r) {
                        console.table(r);
                        pair.splice(pair.indexOf(r), 1);
                    }
                    else { 
                        pair.push(result);
                    }

                    break;
                }
            }

            if (!find) {
                pairs.push([result]);
            }
        }

        for (let i = 0; i < pairs.length; i++) {
            let pair = pairs[i];
            if (pair.length < 2) {
                continue;
            }

            // sort pair with fraction
            // 根据 fraction 排序
            pair = pair.sort(CalcUtils.Uitls.compare);

            let splitResults = [];

            // first calculate all results, not split collider right now
            for (let j = 0; j < (pair.length - 1); j +=2) {
                let r1 = pair[j];
                let r2 = pair[j+1];

                if (r1 && r2) {
                    CalcUtils.Uitls.split(r1.collider, r1.point, r2.point, splitResults);
                }
            }

            if (splitResults.length <= 0) {
                continue;
            }

            let collider = pair[0].collider;

            // 遍历分组，找到顶点数最多的分组
            let maxPointsResult;
            for (let j = 0; j < splitResults.length; j++) {
                let splitResult = splitResults[j];

                // 分组取索引，根据索引取点坐标值
                for (let k = 0; k < splitResult.length; k++) {
                    if (typeof splitResult[k] === 'number') {
                        splitResult[k] = collider.points[splitResult[k]];
                    }
                }

                if (!maxPointsResult || splitResult.length > maxPointsResult.length) {
                    maxPointsResult = splitResult;
                }
            }

            if (maxPointsResult.length < 3) {
                continue;
            }

            // keep max length points to origin collider
            // 保留多顶点的碰撞体为原碰撞体，修改顶点数据
            collider.points = maxPointsResult;
            collider.apply();

            let body = collider.body;

            // 遍历分组，剩下的就是切出来的，创建新的刚体
            for (let j = 0; j < splitResults.length; j++) {
                let splitResult = splitResults[j];

                if (splitResult.length < 3) continue;
                if (splitResult == maxPointsResult) continue;

                // create new body
                let node = new cc.Node();
                node.position = body.getWorldPosition();
                node.rotation = body.getWorldRotation();
                node.parent = cc.director.getScene();
                
                node.addComponent(cc.RigidBody);
                
                let newCollider = node.addComponent(cc.PhysicsPolygonCollider);
                newCollider.points = splitResult;
                newCollider.apply();
            }
            
        }
    }
    
    recalcResults() {
        if (!this.touching) {
            return;
        }
        let startPoint = this.touchStartPoint;
        let endPoint = this.touchEndPoint;

        this.ctx.clear();
        this.ctx.moveTo(startPoint.x, startPoint.y);
        this.ctx.lineTo(endPoint.x, endPoint.y);
        this.ctx.stroke();

        let manager = cc.director.getPhysicsManager();
        // manager.rayCast() method calls this function only when it sees that a given line gets into the body - it doesnt see when the line gets out of it.
        // I must have 2 intersection points with a body so that it can be sliced, thats why I use manager.rayCast() again, but this time from B to A - that way the point, at which BA enters the body is the point at which AB leaves it!
        // 正向测试，获取与碰撞体的射入交点
        let r1 = manager.rayCast(this.touchStartPoint, endPoint, cc.RayCastType.All);
        // 逆向测试，获取与碰撞体的另一个交点，射出点
        let r2 = manager.rayCast(endPoint, this.touchStartPoint, cc.RayCastType.All);

        let results = r1.concat(r2);

        // 在交点处画圆标识
        for (let i = 0; i < results.length; i++) {
            let p = results[i].point;
            this.ctx.circle(p.x, p.y, 5);
        }  
        this.ctx.fill();

        this.r1 = r1;
        this.r2 = r2;
        this.results = results;
    }
    
    update(dt) {
        this.recalcResults();
    }
}
