import { _decorator, Component, Node, input, Input, Vec3, Animation } from 'cc';
import type { EventMouse } from 'cc';
const { ccclass, property, } = _decorator;

export const BLOCK_SIZE = 40;

@ccclass('PlayerController')
export class PlayerController extends Component {
    private _startJump: boolean = false; // 开始跳跃
    private _jumpStep: number = 0; // 跳跃步数
    private _curJumpTime: number = 0; // 当前跳跃时间
    private _jumpTime: number = 0.1; // 跳跃时间
    private _curJumpSpeed: number = 0; // 移动熟读
    private _curPos: Vec3 = new Vec3(); // 当前位置
    private _deltaPos: Vec3 = new Vec3(0, 0, 0); // 位移
    private _targetPos: Vec3 = new Vec3(); // 目标位置
    private _curMoveIndex: number = 0;

    @property(Animation)
    BodyAnim: Animation = null;

    start() {
        // input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    }

    reset() {
        this._curMoveIndex = 0;
    }

    setInputActive(active: boolean) {
        if (active) {
            input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        } else {
            input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        }
    }

    // 监听鼠标事件
    onMouseUp(event: EventMouse) {
        // 鼠标左键
        if (event.getButton() === 0) {
            this.jumpByStep(1);
        } else if (event.getButton() === 2) { // 鼠标右键
            this.jumpByStep(2);
        }
    }

    // 通过步数跳跃
    jumpByStep(step: number) {
        if(this._startJump) {
            return;
        }
        this._startJump = true; // 将事件标记为正在跳跃
        this._jumpStep = step; // 保存本次跳跃的次数
        this._curJumpTime = 0; // 重置开始跳跃的事件

        const clipName = step === 1 ? 'oneStep' : 'twoStep';
        const state = this.BodyAnim.getState(clipName);
        this._jumpTime = state.duration;

        this._curJumpSpeed = this._jumpStep * BLOCK_SIZE / this._jumpTime; // 根据事件计算当前的速度
        this.node.getPosition(this._curPos); // 获取当前角色的位置，这里出现一个新属性node
        Vec3.add(this._targetPos, this._curPos, new Vec3(this._jumpStep * BLOCK_SIZE, 0, 0)); // 计算出目标位置
        if (this.BodyAnim) {
            if(step === 1) {
                this.BodyAnim.play('oneStep');
            } else if (step === 2) {
                this.BodyAnim.play('twoStep');
            }
        }

        this._curMoveIndex += step;
    }

    // 更新位置,deltaTime为跳跃的时间
    update(deltaTime: number) {
        if(this._startJump) {
            this._curJumpTime += deltaTime; // 累计跳跃的时间
            if (this._curJumpTime > this._jumpTime) { // 当前跳跃是否结束
                this.node.setPosition(this._targetPos);
                this._startJump = false;
                this.onOnceJumpEnd();
            } else {
                this.node.getPosition(this._curPos);
                this._deltaPos.x = this._curJumpSpeed * deltaTime;
                Vec3.add(this._curPos, this._curPos, this._deltaPos);
                this.node.setPosition(this._curPos);
            }
        }
    }

    // 跳转结束
    onOnceJumpEnd() {
        this.node.emit('JumpEnd', this._curMoveIndex);
    }
}


