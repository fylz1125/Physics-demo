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
        // cc.PhysicsManager.DrawBits.e_aabbBit |
        cc.PhysicsManager.DrawBits.e_jointBit |
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



