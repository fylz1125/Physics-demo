# Physics Demo

使用 **TS** 实现的物理游戏demo，参考官方示例代码，增加了代码注释和文档说明。

本文档记录了物理引擎使用过程中的一些技术要点，**API** 用法，原理说明等。

## 物理系统管理器
物理系统默认是关闭的，要使用物理系统，需要手动开启。

一个比较好的方式是，在引擎初始化完毕之后即可开启物理系统，并设置调试信息。

```ts
cc.game.on(cc.game.EVENT_ENGINE_INITED, () => {

    // 开启物理系统
    let physicsManager = cc.director.getPhysicsManager();
    physicsManager.enabled = true;
    
    // 设置调试信息
    physicsManager.debugDrawFlags = 
        // 0;
        // 绘制包围盒
        cc.PhysicsManager.DrawBits.e_aabbBit |
        // 绘制关节链接信息
        cc.PhysicsManager.DrawBits.e_jointBit |
        // 绘制形状
        cc.PhysicsManager.DrawBits.e_shapeBit
        ;
});
```

## 单位转换
由于box2d引擎的计量单位是 **米-千克-秒**，而游戏中的计量单位是像素，所以开发过程中需要做单位转换。

另一方面，box2d本身在仿真过程中，对 **0.1m~10m** 范围内的物理过程有专门优化。为了更好的表现，定义了一个转换比率 **cc.PhysicsManager.PTM_RATIO** ，默认为32。可以简单理解为游戏中 **32像素** 就是 box2d 中的 **1m**，依此比率创建的物理世界有更好的仿真表现。

## 设置重力
大部分物理游戏都有重力特性，现实中的重力加速度是 **9.8m/秒^2** 。

Creator中的重力加速度取 **10m/秒^2**，按照上面的转换规则，即 **-320像素/秒^2** 。

重力加速度是一个二维向量**cc.Vec2**，如果要修改为其他值，可以这样设置：

```js
cc.director.getPhysicsManager().gravity = cc.v2(0, -640);
```

## 刚体类型
什么是刚体就不解释了。

box2d引擎定义了三种刚体：**Static**， **Dynamic**， **Kinematic**。在Cocos Creator中增加了一个 **Animated** 类型。

- **Static :** `cc.RigidBodyType.Static`</br>
    静态刚体，零质量，不受重力和速度影响，不能运动，但可以直接设置位置来移动，可参与碰撞，通常设置为地面，围墙等障碍物。

- **Dynamic :** `cc.RigidBodyType.Dynamic`</br>
    动态刚体，有质量，可受力，可设置速度，可参与碰撞，可以运动。

- **Kinematic :**`cc.RigidBodyType.Kinematic`</br>
    运动学刚体，零质量，不受力，但可设置速度来进行位移，可参与碰撞。

- **Animated :**`cc.RigidBodyType.Animated`</br>
    动画刚体，从 **Kinematic**类型衍生，主要用于刚体与动画编辑结合使用。





