// Author 大掌教
// Q群 704391772
// 更多源码在微信公众号 darkpalm

export const EPSILON = 0.1;

/**
 * 这个阈值控制射线交点距离的取舍
 * 如果在凹多边形中，两个交点如果距离太近，最小不能小于这个阈值，否则会被踢除
 */
export const POINT_SQR_EPSILON = 1.5;

export class Uitls{
    
    /**
    * 判断两个数是否近似相等
    * @param a 
    * @param b 
    * @param epsilon 近似数，小于这个值则认为 a==b
    */
    static equals(a: number, b: number, epsilon?: number): boolean{
       epsilon = epsilon === undefined ? EPSILON : epsilon;
       return Math.abs(a-b) < epsilon;
    }
    
    /**
     * 数组排序的比较逻辑
     * @param a 
     * @param b 
     */
    static compare(a:cc.PhysicsRayCastResult, b:cc.PhysicsRayCastResult) :number{
        if (a.fraction > b.fraction) {
            return 1;
        } else if (a.fraction < b.fraction) {
            return -1;
        }
        return 0;
    }

     /**
     * 判断两个向量是否近似相等
     * @param a 
     * @param b 
     * @param epsilon 
     */
    static equalsVec2(a:cc.Vec2,b:cc.Vec2, epsilon?:number):boolean {
        return this.equals(a.x, b.x, epsilon) && this.equals(a.y, b.y, epsilon);
    }

    /**
     * 判断三个点是否共线
     * @param point 要判断的点
     * @param a 起点
     * @param b 终点
     */
    static pointInLine(point: cc.Vec2, a: cc.Vec2, b: cc.Vec2): boolean{
        // @ts-ignore
        return cc.Intersection.pointLineDistance(point, a, b, true)<1;
    }

    static split(collider:cc.PhysicsPolygonCollider, p1:cc.Vec2, p2:cc.Vec2, splitResults:Array<Array<cc.Vec2>>) {
        let body = collider.body;
        let points = collider.points;

        // The manager.rayCast() method returns points in world coordinates, 
        // so use the body.getLocalPoint() to convert them to local coordinates.
        // 射线检测返回的点是世界坐标系，需要转化为节点本地坐标系
        body.getLocalPoint(p1, p1);
        body.getLocalPoint(p2, p2);


        let newSplitResult1 = [p1, p2];
        let newSplitResult2 = [p2, p1];

        let index1, index2;
        for (let i = 0; i < points.length; i++) {
            let pp1 = points[i];
            let pp2 = i === points.length - 1 ? points[0] : points[i+1];
          
            if (index1 === undefined && this.pointInLine(p1, pp1, pp2)) {
                index1 = i;
            }
            else if (index2 === undefined && this.pointInLine(p2, pp1, pp2)) {
                index2 = i;
            }

            if (index1 !== undefined && index2 !== undefined) {
                break;
            }
        }

        // console.log(index1 + ' : ' + index2);

        if (index1 === undefined || index2 === undefined) {
            debugger
            return;
        }

        let splitResult, indiceIndex1 = index1, indiceIndex2 = index2;
        if (splitResults.length > 0) {
            for (let i = 0; i < splitResults.length; i++) {
                let indices = splitResults[i];
                indiceIndex1 = indices.indexOf(index1);
                indiceIndex2 = indices.indexOf(index2);

                if (indiceIndex1 !== -1 && indiceIndex2 !== -1) {
                    splitResult = splitResults.splice(i, 1)[0];
                    break;
                }
            }
        }

        if (!splitResult) {
            // 存顶点索引
            splitResult = points.map((p, i) => {
                return i;
            });
        }

        for (let i = indiceIndex1 + 1; i !== (indiceIndex2+1); i++) {
            if (i >= splitResult.length) {
                i = 0;
            }

            let p = splitResult[i];
            p = typeof p === 'number' ? points[p] : p;
            
            if (p.sub(p1).magSqr() < POINT_SQR_EPSILON || p.sub(p2).magSqr() < POINT_SQR_EPSILON) {
                continue;
            }

            newSplitResult2.push(splitResult[i]);
        }

        for (let i = indiceIndex2 + 1; i !== indiceIndex1+1; i++) {
            if (i >= splitResult.length) {
                i = 0;
            }

            let p = splitResult[i];
            p = typeof p === 'number' ? points[p] : p;
            
            if (p.sub(p1).magSqr() < POINT_SQR_EPSILON || p.sub(p2).magSqr() < POINT_SQR_EPSILON) {
                continue;
            }

            newSplitResult1.push(splitResult[i]);
        }

        splitResults.push(newSplitResult1);
        splitResults.push(newSplitResult2);
    }
}
