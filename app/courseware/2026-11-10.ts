import type { AuthoredDay } from './types';

export const day71: AuthoredDay = {
  "reviewedAt": "2026-11-07",
  "revision": "逐课编写 1.0",
  "deliverable": "动作合同、单位转换与逐关节裁剪夹具、RAW/接口2×2实验。35+40+25=100分钟。",
  "question": {
    "title": "仿真目标0.1可直接送到SO-101吗？请用当前0.2rad与20ms解释三种动作含义。",
    "summary": "连接当天机制与可审计实验。",
    "keywords": [
      "absolute target",
      "delta position",
      "velocity integration",
      "sent measured"
    ],
    "reference": "不能仅凭数值传递。0.1若为绝对位置则目标0.1rad，若为增量则0.3rad，若为rad/s速度则积分目标0.202rad。还需核对训练反归一化、电机单位、夹爪范围、关节顺序、坐标与控制模式。日志分别保存requested、sent和measured；模拟分数或发送返回值不能证明真实到达。"
  },
  "lessons": {
    "foundation": {
      "title": "位置、速度与末端控制：先定义动作的物理含义",
      "minutes": 35,
      "prerequisites": "会读关节状态、时间间隔和矩阵乘法；完成11月9日评测协议。",
      "connection": "今天把仿真分数落实到执行接口，明天检查这些命令何时生效。",
      "intro": "相同的六个浮点数可以表示角度、角速度或末端位移，含义来自控制合同。",
      "outcomes": [
        "区分目标位置与速度积分",
        "解释雅可比映射和奇异性",
        "为 SO-101 记录单位与参考坐标"
      ],
      "sections": [
        {
          "heading": "01 一个数值并不是一种动作",
          "body": "设单关节当前位置为0.2 rad，策略输出0.1。若字段表示绝对目标，下一目标为0.1 rad，方向向负；若表示增量，目标为0.3 rad，方向向正。若表示0.1 rad/s速度，在20 ms内的运动学积分仅增加0.002 rad。三种解释连方向和尺度都可能不同，模型权重并不自动携带这些信息。\n\n动作合同至少列出关节顺序、绝对或相对、单位、参考坐标、采样周期、夹爪定义和归一化统计版本。训练使用校准范围的百分比而部署按弧度解释时，数值有限且shape正确仍会失效；应通过离线标量夹具逐项验算，再讨论模型精度。",
          "sourceIds": [
            "so"
          ]
        },
        {
          "heading": "02 速度命令要通过时间变成位置",
          "body": "在理想速度跟踪、区间内恒定速度的教学假设下，目标位置等于当前值加速度乘时间。这里速度指角速度，不是线加速度；弧度与秒相乘后得到弧度。对0.5 rad/s、0.02 s算出0.01 rad；若误用毫秒数字20会得到10 rad，整整放大一千倍。\n\n位置反馈可以先把位置误差乘正增益变成速度，再交给下层速度环；这要求实际底层支持该接口。SOFollower设置position模式，因此本课转换器只生成位置目标，不能把教程中的理想速度输入直接写到Goal_Position。离散P控制还受采样、饱和、延迟影响，不承诺任意增益稳定。",
          "sourceIds": [
            "mr",
            "so"
          ],
          "formulas": [
            {
              "latex": "q^*_{k+1}=q_k+\\dot q_k\\Delta t",
              "explanation": "q为rad位置，点q为rad/s角速度，Δt为秒；假设区间恒速且下层理想跟踪，此式是教学积分而非真实动力学预测。"
            }
          ]
        },
        {
          "heading": "03 末端位移必须经过运动学",
          "body": "关节速度经雅可比映射成末端twist；平移速度和角速度必须声明排列和坐标系。一个关节伸长的几何杠杆越大，相同角速度对应的末端线速度越大，所以把末端毫米增量逐元素拷到关节角数组没有物理意义。真实六维姿态还需要旋转群上的误差定义。\n\n用一维局部模型J=0.1 m/rad、末端速度0.01 m/s，反解得关节速度0.1 rad/s。若J接近零，无阻尼反解会爆大；实际应限制工作区、使用阻尼最小二乘并检查残差。本课只演示标量映射，不实现完整SO-101逆运动学、关节耦合、碰撞或动力学。",
          "sourceIds": [
            "mr"
          ],
          "formulas": [
            {
              "latex": "v=J(q)\\dot q,\\quad \\dot q_\\lambda={Jv\\over J^2+\\lambda^2}",
              "explanation": "标量教学模型中J单位m/rad，v为m/s，λ与J同单位；λ增大会减小速度并增加末端跟踪误差，多维时需先处理平移旋转尺度。"
            }
          ]
        },
        {
          "heading": "04 世界模型与控制接口的接缝",
          "body": "StanfordVL的BEHAVIOR任务定义与控制器规定模拟环境的成功和动作接口；World Labs的Atlas空间上下文和R2S2R世界构建解决另一层问题。空间模型输出的三维目标还需坐标标定、运动学和执行合同，不能因为场景逼真便跳过这些转换。\n\nMeta/FAIR动作条件预测中的动作分布来自其训练机器人与数据；改成本体或单位会改变预测条件。AMI的当前研究方向可以启发合同设计，但并非公开的SO-101驱动。RAW经验可用于标定目标位置的不确定度，再看误差传到关节后是否仍可控，而非把更清晰图像直接等同更准执行。",
          "sourceIds": [
            "atlas",
            "r2s",
            "jepa",
            "ami",
            "behavior"
          ]
        },
        {
          "heading": "05 原论文把动作索引绑定到控制时间",
          "body": "RTC论文第2节把一个chunk写成控制时间上的动作序列，预测长度H与实际执行长度s不同。把相同数组改按另一频率播放，会改变其物理时间跨度；这说明动作语义除了位置或速度，还包括采样周期和索引起点。\n\n例如十个目标按20ms播放覆盖约200ms的命令节拍，按40ms播放则是约400ms；这不是把时间轴画长那么简单，接触与纠错机会也改变。本课只检查合同，不实现论文的异步生成，完整策略迁移仍需固定动作周期再验证。",
          "sourceIds": [
            "rtc"
          ]
        }
      ],
      "points": [
        "区分目标位置与速度积分",
        "解释雅可比映射和奇异性",
        "为 SO-101 记录单位与参考坐标"
      ],
      "codeTitle": "位置、速度与末端控制：先定义动作的物理含义 · 纯内存教学夹具",
      "code": "import math\n\ndef velocity_target(q, dq, dt):\n    if not all(math.isfinite(x) for x in (q,dq,dt)) or not 0 < dt <= .1:\n        raise ValueError(\"invalid radians/seconds contract\")\n    return q+dq*dt\nassert abs(velocity_target(.2,.5,.02)-.21)<1e-12\nassert abs(velocity_target(.2,.1,.02)-.202)<1e-12\nfor dt in (0,20,float('nan')):\n    try:\n        velocity_target(.2,.5,dt)\n        raise AssertionError(\"bad time accepted\")\n    except ValueError: pass\nJ,v,lam=.1,.01,.02\nassert abs(J*v/(J*J+lam*lam)-.09615384615384615)<1e-12\n",
      "codeNotes": [
        "velocity_target仅积分单关节恒定角速度，返回数不连接设备；时间上限是教学合同。",
        "正测试计算0.21 rad；负测试拒绝零、毫秒误传与NaN，最后检查阻尼反解的偏差。"
      ],
      "exercise": {
        "prompt": "0.2 rad处输出0.1，分别解释为绝对位置、增量和角速度，计算20ms后的目标。",
        "steps": [
          "写清三种单位。",
          "解释为何shape检查无法发现错误。"
        ],
        "solution": "分别为0.1、0.3、0.202 rad。数值数组长度可以完全相同，差别在合同；应保存语义元数据并对解归一化和时间转换作独立检查。"
      },
      "quiz": {
        "question": "为什么末端1cm位移不能直接作为某关节0.01的目标？",
        "hint": "检查单位和局部几何映射。",
        "keywords": [
          "joint target",
          "twist frame",
          "jacobian",
          "unit contract"
        ],
        "reference": "末端米与关节弧度属于不同空间，需标定坐标和运动学映射；雅可比还依赖姿态，奇异位置需阻尼、残差和关节约束。直接复制数值会忽略杠杆、旋转与本体限制。"
      },
      "sources": [
        {
          "id": "mr",
          "label": "Modern Robotics 官方课程 11.3",
          "url": "https://modernrobotics.northwestern.edu/nu-gm-book-resource/11-3-motion-control-with-velocity-inputs-part-1-of-3/",
          "reading": "2026-11-07 实读 Transcript：速度输入、位置误差反馈、增益和饱和假设；仅运动学教学，不代表舵机动力学。"
        },
        {
          "id": "so",
          "label": "LeRobot SOFollower 固定源码",
          "url": "https://github.com/huggingface/lerobot/blob/d490e472a5d1a207cfe0255caaaf74b6d66e4656/src/lerobot/robots/so_follower/so_follower.py",
          "reading": "实读 __init__、configure、get_observation、send_action：关节单位、夹爪范围、position 模式、顺序读取、可选裁剪与返回已发送目标；没有执行驱动。"
        },
        {
          "id": "utils",
          "label": "LeRobot 相对目标限制",
          "url": "https://github.com/huggingface/lerobot/blob/d490e472a5d1a207cfe0255caaaf74b6d66e4656/src/lerobot/robots/utils.py",
          "reading": "实读 ensure_safe_goal_position：以 present 为中心逐关节夹紧，检查字典键；不是完整碰撞检测或速度限制。"
        },
        {
          "id": "ros",
          "label": "ROS message_filters ApproximateTime",
          "url": "https://github.com/ros2/message_filters/blob/rolling/include/message_filters/sync_policies/approximate_time.hpp",
          "reading": "2026-11-07 实读构造、checkInterMessageBound、process：候选区间、pivot、队列和 age_penalty；rolling 可变，未取得固定 SHA，教学不实现完整同步器。"
        },
        {
          "id": "atlas",
          "label": "World Labs Atlas",
          "url": "https://www.worldlabs.ai/blog/atlas",
          "reading": "核对2026-09-01发布与多模态共享空间上下文；不把空间输出当 SO-101 动作接口。"
        },
        {
          "id": "r2s",
          "label": "World Labs R2S2R",
          "url": "https://www.worldlabs.ai/blog/real-to-sim-to-real",
          "reading": "核对2026-07-28发布、世界构建及机器人策略训练/评测；与 StanfordVL 环境归属分开。"
        },
        {
          "id": "jepa",
          "label": "Meta/FAIR V-JEPA",
          "url": "https://ai.meta.com/research/vjepa/",
          "reading": "实读表征、物理理解与动作条件规划的区分；历史谱系不自动归 AMI。"
        },
        {
          "id": "ami",
          "label": "AMI Labs 组织方向",
          "url": "https://amilabs.xyz/",
          "reading": "实读表征空间预测、动作条件世界模型与安全方向；没有据此声称发布新模型。"
        },
        {
          "id": "behavior",
          "label": "StanfordVL BEHAVIOR Updates",
          "url": "https://behavior.stanford.edu/challenge/updates.html",
          "reading": "核对更新、评测与版本边界；本课的桌面控制合同不是该挑战成绩。"
        },
        {
          "id": "rtc",
          "label": "RTC original paper v2",
          "url": "https://arxiv.org/html/2506.07339v2",
          "reading": "2026-11-07 实读第2、3.1—3.3节：控制步、推理延迟、已承诺前缀与软mask；v2为2025-12-05，非今日新发布。"
        }
      ]
    },
    "code": {
      "title": "精读 SOFollower.send_action：转换、裁剪和发送目标",
      "minutes": 40,
      "prerequisites": "完成位置/速度合同，理解Python字典与逐关节运算。",
      "connection": "将动作目标变成可审计数据，次日把读取与发送串成时间线。",
      "intro": "阅读真实驱动而只执行内存夹具，可以看清安全裁剪改变了什么。",
      "outcomes": [
        "定位归一化与驱动入口",
        "区分requested、sent与measured",
        "测试逐关节限幅及非法输入"
      ],
      "sections": [
        {
          "heading": "01 从构造器追踪单位",
          "body": "固定LeRobot提交的SOFollower构造器按use_degrees为身体关节选择DEGREES或RANGE_M100_100，夹爪单独采用RANGE_0_100；action_features来自带.pos后缀的电机字段。由此可见“全是float”不能证明所有维度同单位，夹爪尤其不能照搬肩关节缩放。\n\nconfigure把各电机设为position并配置PID参数，send_action提取.pos键、移除后缀，得到电机目标字典。阅读时把策略反归一化与电机总线校准视为两层：前者还原训练特征，后者转换设备表示。这里不导入驱动、不校准、不写串口，只记录源码路径和合同。",
          "sourceIds": [
            "so"
          ]
        },
        {
          "heading": "02 限制相对当前值的距离",
          "body": "max_relative_target存在时，send_action额外读取Present_Position，再调用ensure_safe_goal_position。辅助函数对每关节计算goal-present，将差夹在正负cap之间，再加回present；cap字典必须与目标字典同键。因此目标100、当前10、cap5返回15，而不是把绝对目标夹成5。\n\n这一步限制的是本次目标与读取位置的差，并不测量实际关节速度，也未给出全局碰撞保证。若每次相对上次命令裁剪，舵机因堵转仍在10而命令已到40，基准就错误了。教学实现额外拒绝NaN、负cap与不完整字段；这些是教学审计增强，不声称上游已做同样检查。",
          "sourceIds": [
            "utils",
            "so"
          ]
        },
        {
          "heading": "03 返回值是发送目标而非到达事实",
          "body": "驱动调用sync_write写Goal_Position后返回goal_pos，这让日志能保留裁剪后的目标。但总线写入成功不代表关节到达，更不代表物体被抓住。应分开记录requested、sent和后续measured，并给每项时间戳；实际执行事实需通过反馈和任务状态判断。\n\n内存示例将肩关节请求40、当前10、cap5裁到15，夹爪请求90、当前80、cap3裁到83。两个维度的cap来自各自单位，不能拿一个弧度阈值统一套用。正测试检查返回字典且输入不被改写，负测试检查缺键、非法数值；没有模拟电机延迟或接触。",
          "sourceIds": [
            "so",
            "utils"
          ]
        },
        {
          "heading": "04 按转换链构造失败证据",
          "body": "若一条轨迹长期有requested与sent差异，训练动作支持和部署护栏可能不一致；这时只看policy loss无法定位问题。先离线统计哪些关节被夹紧、发生在哪些阶段，再核对反归一化、动作顺序和观测时刻，不应直接放宽阈值去追成功率。\n\nBEHAVIOR模拟控制器、World Labs生成世界和Meta动作预测都需要同样明确动作边界，但其实现不能互相替代。对SO-101作品，把合同、输入夹具和裁剪日志放到复现材料就能证明接口理解；AMI方向只作后续研究问题。下一日再检查额外读取Present_Position给尾部延迟带来的代价。",
          "sourceIds": [
            "behavior",
            "r2s",
            "jepa",
            "ami"
          ]
        }
      ],
      "points": [
        "定位归一化与驱动入口",
        "区分requested、sent与measured",
        "测试逐关节限幅及非法输入"
      ],
      "codeTitle": "精读 SOFollower.send_action：转换、裁剪和发送目标 · 纯内存教学夹具",
      "code": "import math\n\ndef audited_clip(goal, measured, caps):\n    if not goal or set(goal)!=set(measured) or set(goal)!=set(caps):\n        raise ValueError(\"joint keys differ\")\n    out={}\n    for k,g in goal.items():\n        q,c=measured[k],caps[k]\n        if not all(math.isfinite(x) for x in (g,q,c)) or c<0:\n            raise ValueError(\"invalid value/cap\")\n        out[k]=q+max(-c,min(c,g-q))\n    return out\ng={'shoulder':40.,'gripper':90.}; q={'shoulder':10.,'gripper':80.}\nc={'shoulder':5.,'gripper':3.}\nassert audited_clip(g,q,c)=={'shoulder':15.,'gripper':83.}\nassert g['shoulder']==40\nfor bad in ({'shoulder':-1.,'gripper':3.},{'shoulder':float('nan'),'gripper':3.},{}):\n    try:\n        audited_clip(g,q,bad)\n        raise AssertionError(\"bad caps accepted\")\n    except ValueError: pass\n",
      "codeNotes": [
        "audited_clip对应相对距离公式，明确按measured而非上一条命令为中心。",
        "输入有限值检查和非负cap检查是教学增强；返回sent目标，不模拟到达，也不写任何设备。"
      ],
      "exercise": {
        "prompt": "当前关节10、上次命令40、这次请求50、cap5，正确目标是多少？",
        "steps": [
          "分别按测量与命令为中心计算。",
          "说明堵转时两者的风险。"
        ],
        "solution": "测量中心返回15，命令中心会返回45。后者忽略实际仍停在10的事实；sent日志只能证明请求，需反馈measured确认到达，并记录反馈年龄。"
      },
      "quiz": {
        "question": "为什么send_action返回15不能记为关节已经到15？",
        "hint": "定位sync_write后返回的数据来源。",
        "keywords": [
          "requested action",
          "sent target",
          "measured state",
          "position mode"
        ],
        "reference": "返回值来自裁剪后的目标字典，没有在写入后等待并验证到达。它表示发送目标；真实状态需后续Present_Position读回并核对时间、误差和稳定保持，抓取成功还需独立任务证据。"
      },
      "sources": [
        {
          "id": "mr",
          "label": "Modern Robotics 官方课程 11.3",
          "url": "https://modernrobotics.northwestern.edu/nu-gm-book-resource/11-3-motion-control-with-velocity-inputs-part-1-of-3/",
          "reading": "2026-11-07 实读 Transcript：速度输入、位置误差反馈、增益和饱和假设；仅运动学教学，不代表舵机动力学。"
        },
        {
          "id": "so",
          "label": "LeRobot SOFollower 固定源码",
          "url": "https://github.com/huggingface/lerobot/blob/d490e472a5d1a207cfe0255caaaf74b6d66e4656/src/lerobot/robots/so_follower/so_follower.py",
          "reading": "实读 __init__、configure、get_observation、send_action：关节单位、夹爪范围、position 模式、顺序读取、可选裁剪与返回已发送目标；没有执行驱动。"
        },
        {
          "id": "utils",
          "label": "LeRobot 相对目标限制",
          "url": "https://github.com/huggingface/lerobot/blob/d490e472a5d1a207cfe0255caaaf74b6d66e4656/src/lerobot/robots/utils.py",
          "reading": "实读 ensure_safe_goal_position：以 present 为中心逐关节夹紧，检查字典键；不是完整碰撞检测或速度限制。"
        },
        {
          "id": "ros",
          "label": "ROS message_filters ApproximateTime",
          "url": "https://github.com/ros2/message_filters/blob/rolling/include/message_filters/sync_policies/approximate_time.hpp",
          "reading": "2026-11-07 实读构造、checkInterMessageBound、process：候选区间、pivot、队列和 age_penalty；rolling 可变，未取得固定 SHA，教学不实现完整同步器。"
        },
        {
          "id": "atlas",
          "label": "World Labs Atlas",
          "url": "https://www.worldlabs.ai/blog/atlas",
          "reading": "核对2026-09-01发布与多模态共享空间上下文；不把空间输出当 SO-101 动作接口。"
        },
        {
          "id": "r2s",
          "label": "World Labs R2S2R",
          "url": "https://www.worldlabs.ai/blog/real-to-sim-to-real",
          "reading": "核对2026-07-28发布、世界构建及机器人策略训练/评测；与 StanfordVL 环境归属分开。"
        },
        {
          "id": "jepa",
          "label": "Meta/FAIR V-JEPA",
          "url": "https://ai.meta.com/research/vjepa/",
          "reading": "实读表征、物理理解与动作条件规划的区分；历史谱系不自动归 AMI。"
        },
        {
          "id": "ami",
          "label": "AMI Labs 组织方向",
          "url": "https://amilabs.xyz/",
          "reading": "实读表征空间预测、动作条件世界模型与安全方向；没有据此声称发布新模型。"
        },
        {
          "id": "behavior",
          "label": "StanfordVL BEHAVIOR Updates",
          "url": "https://behavior.stanford.edu/challenge/updates.html",
          "reading": "核对更新、评测与版本边界；本课的桌面控制合同不是该挑战成绩。"
        },
        {
          "id": "rtc",
          "label": "RTC original paper v2",
          "url": "https://arxiv.org/html/2506.07339v2",
          "reading": "2026-11-07 实读第2、3.1—3.3节：控制步、推理延迟、已承诺前缀与软mask；v2为2025-12-05，非今日新发布。"
        },
        {
          "id": "clipnew",
          "label": "任务空间裁剪按动作分量解析 · 延伸阅读",
          "url": "https://github.com/isaac-sim/IsaacLab/commit/0a02a298dc759a8f771f2f8ec109ad10b4db0aa5",
          "reading": "实读task_space_actions.py/config diff：关节名不能作为pose分量索引；四元数逐分量clip拒绝。新功能只作延伸，不更换本日SOFollower固定版本。"
        }
      ]
    },
    "insight": {
      "title": "控制语义决定迁移边界：先做接口对照再比较策略",
      "minutes": 25,
      "prerequisites": "能区分目标、速度与末端twist，读懂相对目标裁剪。",
      "connection": "为11月11日时延预算和11月12日平滑限幅提供几何依据。",
      "intro": "模型动作、世界模型条件和设备命令之间需要一份可以逐项复算的合同。",
      "outcomes": [
        "比较关节与末端动作的代价",
        "量化标定误差到执行的传播",
        "设计RAW与控制器解耦的验证"
      ],
      "sections": [
        {
          "heading": "01 关节动作便宜但绑定本体",
          "body": "直接预测关节目标不需要每步求逆运动学，较适合已有SO-101演示和小模型；代价是关节顺序、机械结构、标定范围改变会破坏接口。换一个夹爪并不只是模型多一维，其开合范围、接触和成功定义也要同步修改。\n\n末端动作更接近“杯子向右一厘米”的任务描述，但依赖外参、机器人几何、逆解、不可达检测和碰撞处理。同一末端目标可能有多个关节解，若训练和部署选不同分支，动作会不连续。个人项目宜先冻结一种动作接口，通过日志证明闭环，再比较另一接口的收益。",
          "sourceIds": [
            "so",
            "mr"
          ]
        },
        {
          "heading": "02 传感器优势须经过几何误差预算",
          "body": "用户的RAW经验能改善暗场目标定位，但控制最终接收的是关节或末端目标。设平面测量误差2mm、外参偏差3mm，若取最坏同向上界则总偏差5mm；若独立零均值才可以平方和开根得到约3.61mm。两种假设对应不同结论，不能择小数报告。\n\n对于局部J=0.1m/rad，5mm目标误差对应0.05rad关节误差；接近奇异位形时放大更严重。因此图像SNR提升不会自动抵消外参偏差。应冻结控制器和标定，先测RGB/RAW定位误差，再在相同曝光条件和动作预算下比较任务成功，这才把感知经验转成可验证收益。",
          "sourceIds": [
            "mr"
          ],
          "formulas": [
            {
              "latex": "|\\delta q|\\approx {|\\delta x|\\over |J|},\\quad |\\delta x|\\leq e_{\\rm vision}+e_{\\rm calibration}",
              "explanation": "一维非奇异局部线性模型；δx单位m、J单位m/rad，得到δq为rad；误差上界不要求独立，平方和合成则需额外统计假设。"
            }
          ]
        },
        {
          "heading": "03 双路线的动作条件不可混配",
          "body": "World Labs Atlas强调共享空间上下文，R2S2R可用于世界构建与策略评测；空间资产导出并不直接提供SO-101控制合同。StanfordVL BEHAVIOR则规定自身任务与模拟控制接口，模拟器中可用的绝对状态不能偷偷变成现实policy输入。把三维世界做得更逼真和把动作执行对是两个要单独验证的层次。\n\nMeta/FAIR的V-JEPA动作条件规划学习特定动作后果，接口变化后必须重新检查动作归一化和预测范围；历史结果不能证明AMI已发布同类机器人模型。AMI当前方向为表征预测与安全规划，可用来提出研究假设：同一合同下latent预测是否改善候选动作排序，而不能替代真实反馈。",
          "sourceIds": [
            "atlas",
            "r2s",
            "behavior",
            "jepa",
            "ami"
          ]
        },
        {
          "heading": "04 在有限预算下做两因素对照",
          "body": "设计传感器RGB/RAW与接口关节/末端的2×2实验，保持相同任务实例、训练数据量和控制周期，分别报告定位、逆解失败、裁剪率和任务成功。若只有RAW+末端获益，要分析是否存在交互效应，而不能把全部增益归给RAW或更大的policy。\n\n租用4090可承担固定编码器小规模训练，Mac用于离线回放；本自动化不运行真实设备。先用合成坐标与纯内存测试排查单位，再由学习者在另行安全流程中采集闭环证据。若逆解失败率上升，应保留失败分母；一次成功视频不支持跨控制接口泛化结论。",
          "sourceIds": [
            "so",
            "r2s"
          ]
        }
      ],
      "points": [
        "比较关节与末端动作的代价",
        "量化标定误差到执行的传播",
        "设计RAW与控制器解耦的验证"
      ],
      "codeTitle": "控制语义决定迁移边界：先做接口对照再比较策略 · 纯内存教学夹具",
      "code": "from math import sqrt\nvision,calibration,J=.002,.003,.1\nbound=vision+calibration\nassert abs(bound/J-.05)<1e-12\nassert sqrt(vision**2+calibration**2)<bound\n\ndef delta_joint(error,jac):\n    if abs(jac)<.01: raise ValueError(\"near singular teaching region\")\n    return error/jac\nassert abs(delta_joint(.005,.1)-.05)<1e-12\ntry:\n    delta_joint(.005,0)\n    raise AssertionError(\"singularity accepted\")\nexcept ValueError: pass\n",
      "codeNotes": [
        "最坏上界和独立误差标准差分开计算；不是实测传感器性能。",
        "delta_joint仅用于一维局部误差敏感性，.01门槛为教学假设，不是设备安全参数。"
      ],
      "exercise": {
        "prompt": "RAW误差从2mm降为1mm、外参仍3mm，最坏总误差减少多少？",
        "steps": [
          "计算前后上界。",
          "判断是否足以证明抓取成功提升。"
        ],
        "solution": "上界从5mm降到4mm，相对降低20%；尚不能证明成功率提升，因为接触、延迟、逆解和目标容差仍会影响闭环。需固定这些因素做配对任务验证。"
      },
      "quiz": {
        "question": "为什么比较RAW关节策略与RGB末端策略不能直接证明RAW更好？",
        "hint": "找出同时变化的因素。",
        "keywords": [
          "factorial design",
          "calibration error",
          "inverse kinematics",
          "action semantics"
        ],
        "reference": "传感器与动作接口同时改变，差异可能来自逆解、标定或控制语义；应使用2×2同预算设计并固定任务与数据，分项记录定位、逆解失败、裁剪和任务成功，才能分析主效应与交互。"
      },
      "sources": [
        {
          "id": "mr",
          "label": "Modern Robotics 官方课程 11.3",
          "url": "https://modernrobotics.northwestern.edu/nu-gm-book-resource/11-3-motion-control-with-velocity-inputs-part-1-of-3/",
          "reading": "2026-11-07 实读 Transcript：速度输入、位置误差反馈、增益和饱和假设；仅运动学教学，不代表舵机动力学。"
        },
        {
          "id": "so",
          "label": "LeRobot SOFollower 固定源码",
          "url": "https://github.com/huggingface/lerobot/blob/d490e472a5d1a207cfe0255caaaf74b6d66e4656/src/lerobot/robots/so_follower/so_follower.py",
          "reading": "实读 __init__、configure、get_observation、send_action：关节单位、夹爪范围、position 模式、顺序读取、可选裁剪与返回已发送目标；没有执行驱动。"
        },
        {
          "id": "utils",
          "label": "LeRobot 相对目标限制",
          "url": "https://github.com/huggingface/lerobot/blob/d490e472a5d1a207cfe0255caaaf74b6d66e4656/src/lerobot/robots/utils.py",
          "reading": "实读 ensure_safe_goal_position：以 present 为中心逐关节夹紧，检查字典键；不是完整碰撞检测或速度限制。"
        },
        {
          "id": "ros",
          "label": "ROS message_filters ApproximateTime",
          "url": "https://github.com/ros2/message_filters/blob/rolling/include/message_filters/sync_policies/approximate_time.hpp",
          "reading": "2026-11-07 实读构造、checkInterMessageBound、process：候选区间、pivot、队列和 age_penalty；rolling 可变，未取得固定 SHA，教学不实现完整同步器。"
        },
        {
          "id": "atlas",
          "label": "World Labs Atlas",
          "url": "https://www.worldlabs.ai/blog/atlas",
          "reading": "核对2026-09-01发布与多模态共享空间上下文；不把空间输出当 SO-101 动作接口。"
        },
        {
          "id": "r2s",
          "label": "World Labs R2S2R",
          "url": "https://www.worldlabs.ai/blog/real-to-sim-to-real",
          "reading": "核对2026-07-28发布、世界构建及机器人策略训练/评测；与 StanfordVL 环境归属分开。"
        },
        {
          "id": "jepa",
          "label": "Meta/FAIR V-JEPA",
          "url": "https://ai.meta.com/research/vjepa/",
          "reading": "实读表征、物理理解与动作条件规划的区分；历史谱系不自动归 AMI。"
        },
        {
          "id": "ami",
          "label": "AMI Labs 组织方向",
          "url": "https://amilabs.xyz/",
          "reading": "实读表征空间预测、动作条件世界模型与安全方向；没有据此声称发布新模型。"
        },
        {
          "id": "behavior",
          "label": "StanfordVL BEHAVIOR Updates",
          "url": "https://behavior.stanford.edu/challenge/updates.html",
          "reading": "核对更新、评测与版本边界；本课的桌面控制合同不是该挑战成绩。"
        },
        {
          "id": "rtc",
          "label": "RTC original paper v2",
          "url": "https://arxiv.org/html/2506.07339v2",
          "reading": "2026-11-07 实读第2、3.1—3.3节：控制步、推理延迟、已承诺前缀与软mask；v2为2025-12-05，非今日新发布。"
        }
      ]
    }
  }
};
