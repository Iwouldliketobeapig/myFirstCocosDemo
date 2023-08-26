import { _decorator, CCInteger, Component, instantiate, Label, Node, Prefab, Vec3 } from 'cc';
import { BLOCK_SIZE, PlayerController } from './PlayerController';
const { ccclass, property } = _decorator;

enum BlockType {
    BT_NONE,
    BT_STONE,
}

enum GameState {
    GS_INIT,
    GS_PLAYING,
    GS_END,
}

const ADD_STEP = 50;

@ccclass('GameManager')
export class GameManager extends Component {
    @property({ type: Prefab })
    public boxPrefab: Prefab | null = null;

    @property({ type: CCInteger })
    public roadLength: number = 50;

    @property({ type: Node })
    public startMenu: Node | null = null; // 开始菜单

    // 开始按钮
    @property({ type: Label })
    public playLabel: Label | null = null; // 开始按钮

    @property({ type: PlayerController })
    public playerCtrl: PlayerController | null = null;

    @property({ type: Label })
    public stepsLable: Label | null = null; // 步数

    private _road: BlockType[] = [];

    start() {
        this.setCurState(GameState.GS_INIT);
        this.playerCtrl?.node.on('JumpEnd', this.onPlayerJumpEnd, this);
    }

    onStartButtonClicked() {    
        this.setCurState(GameState.GS_PLAYING);
    }

    setCurState (value: GameState) {
        switch(value) {
            case GameState.GS_INIT:
                this.init();
                break;
            case GameState.GS_PLAYING:
                if (this.startMenu) {
                    this.startMenu.active = false;
                }

                if (this.stepsLable) {
                    this.stepsLable.string = '0'
                }

                setTimeout(() => {
                    if (this.playerCtrl) {
                        this.playerCtrl.setInputActive(true);
                    }
                }, 1)
                break;
            case GameState.GS_END: 
                break;
        }
    }

    init() {
        if (this.startMenu) {
            this.startMenu.active = true;
        }

        this.generateRoad();

        if (this.playerCtrl) {
            this.playerCtrl.setInputActive(false);
            this.playerCtrl.node.setPosition(Vec3.ZERO);
            this.playerCtrl.reset();
        }
    }

    spawnBlockByType(type: BlockType) {
        if (!this.boxPrefab) {
            return null;
        }

        let block: Node | null = null;
        switch(type) {
            case BlockType.BT_STONE:
                block = instantiate(this.boxPrefab); // 创建模块
                break;
        }

        return block;
    }

    generateRoad () {
        this.node.removeAllChildren();

        this._road = [];

        this._road.push(BlockType.BT_STONE);

        for (let i = 1; i < this.roadLength; i++) {
            if (this._road[i - 1] === BlockType.BT_NONE) {
                this._road.push(BlockType.BT_STONE);
            } else {
                this._road.push(Math.floor(Math.random() * 2));
            }
        }

        for (let j = 0; j < this._road.length; j++) {
            let block: Node | null = this.spawnBlockByType(this._road[j]);
            if (block) {
                this.node.addChild(block);
                block.setPosition(j * BLOCK_SIZE, 0, 0);
            }
        }
    }

    onPlayerJumpEnd(moveIndex: number) {
        if (this.stepsLable) {
            this.stepsLable.string = `${moveIndex >= this.roadLength ? this.roadLength : moveIndex}`;
        }
        this.checkResult(moveIndex);
    }

    // 判断是否跳坑或者跳完所有地块
    checkResult(moveIndex: number) {
        if (moveIndex < this.roadLength) {
            // 跳到陷阱里
            if (this._road[moveIndex] === BlockType.BT_NONE) {
                this.setCurState(GameState.GS_INIT);
                this.roadLength = ADD_STEP;
                this.playLabel.string = '重新开始';
            }
        } else {
            this.playLabel.string = '下一关';
            this.roadLength += ADD_STEP;
            this.setCurState(GameState.GS_INIT);
        }
    }
}


