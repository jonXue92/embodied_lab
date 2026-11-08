import type { AuthoredDay } from './types';

export const day73: AuthoredDay = {
  "reviewedAt": "2026-11-08",
  "revision": "逐课编写 1.0",
  "deliverable": "一阶低通与限速的纯内存实现、阶跃/反向纠错夹具、requested→filtered→sent→measured动作审计表。35+40+25=100分钟。",
  "question": {
    "title": "抖动降低后抓取反而更差，如何分辨滤波滞后、限速和观测陈旧？",
    "summary": "分开验证感知年龄、命令后处理和设备响应。",
    "keywords": [
      "filter lag",
      "rate bound",
      "observation age",
      "sent action"
    ],
    "reference": "先固定原始观测与策略输出，回放同一序列，分开量capture-to-send年龄、requested到filtered的阶跃响应、filtered到sent的限速修正、sent到measured的跟踪差。低通的反向响应可能继续沿旧方向，限速只约束命令变化，二者都不能保证设备实际停止。按同任务容差比较成功、纠错时刻和介入，不以平滑分数单独晋级。"
  },
  "lessons": {
    "foundation": {
      "title": "动作平滑与限幅：从阶跃响应看纠错代价",
      "minutes": 35,
      "prerequisites": "理解11月10日位置/速度单位与11月11日观测年龄，会算递推和等比数列。",
      "connection": "今天研究新观测到来后命令怎样变化，11月13日再用任务状态机管理阶段切换。",
      "intro": "幅值在范围内、每步变化不太大、曲线视觉平滑，是三种不同约束，不能相互推导。",
      "outcomes": [
        "区分幅值限制与命令变化率",
        "推导一阶低通的阶跃和斜坡滞后",
        "解释紧急纠错时平滑的代价"
      ],
      "sections": [
        {
          "heading": "01 一个位置序列的三种合同",
          "body": "设关节目标以弧度表示，允许范围为[-1,1]。序列从-0.9跳到0.9仍满足幅值限制，但20ms内变化1.8rad，命令差分对应90rad/s。幅值限制只是限制位置区间；若策略输出的是速度，相同数值夹紧则限制速度幅值，必须先写清动作的物理量。\n\n限速器约束相邻已发位置目标之差除以实际周期；位置命令的变化率用rad/s。它不保证电机实际速度，因为电机可能滞后、饱和或受接触约束。低通则抑制高频变化，却没有独立的硬速度上界。教学只用单关节标量，不把逐关节限制外推为末端避障或碰撞安全。",
          "sourceIds": [
            "rate",
            "mr"
          ],
          "formulas": [
            {
              "latex": "q_k^s=q_{k-1}^s+\\operatorname{clip}(q_k^r-q_{k-1}^s,-v_{\\max}\\Delta t_k,v_{\\max}\\Delta t_k)",
              "explanation": "q^r为请求位置，q^s为发送位置，单位rad；v_max为命令变化率上限rad/s，Δt为秒。公式约束命令差分，不是实际关节速度证明。"
            }
          ]
        },
        {
          "heading": "02 低通来自连续一阶系统",
          "body": "把请求位置x看作输入，滤波位置y看作状态，取时间常数τ>0。对τ乘y的导数等于x-y使用后向欧拉：在本步末时刻估计导数，整理得到y的新值是旧状态与当前输入的凸组合。α=Δt/(τ+Δt)，周期越短，同一τ下单步更新比例越小。\n\n教学τ=0.08s、Δt=0.02s得到α=0.2。初始y=0而x突然变为1rad，前三步为0.2、0.36、0.488rad；这不是噪声而是真实阶跃时，滤波会延后响应。系数若每步固定而周期抖动，物理时间常数就改变；应记录Δt并按选定离散化重算，不能混用指数精确离散化的参数解释。",
          "sourceIds": [
            "scipy"
          ],
          "formulas": [
            {
              "latex": "\\tau\\dot y=x-y,\\quad y_k=(1-\\alpha_k)y_{k-1}+\\alpha_kx_k,\\quad\\alpha_k={\\Delta t_k\\over\\tau+\\Delta t_k}",
              "explanation": "τ与Δt单位均为秒，α无量纲；该递推是后向欧拉离散化，保持0<α<1，只在当前输入已知且时间戳有效时使用。"
            }
          ]
        },
        {
          "heading": "03 阶跃收敛与反向纠错",
          "body": "固定α且输入恒为A，误差每步乘以1-α，因此从零状态开始第n次更新后y=A[1-(1-α)^n]。α=0.2时达到90%需要n至少为11，因为0.8的10次方约0.107，11次方约0.086。20ms周期下是220ms，不能把一次递推计算很快理解为命令响应很快。\n\n若当前y=0.8rad，新观测要求x=-1rad，下一步仍是0.44rad。向相反方向纠错已开始，发送目标却仍在正侧。平滑越强，保留旧状态越久；接触或障碍变化时这可能延后恢复。不能把滤波器当紧急停止机制，停止与回退应由后续状态机及设备合同另行定义。",
          "sourceIds": [
            "scipy",
            "rtc"
          ],
          "formulas": [
            {
              "latex": "e_n=A-y_n=A(1-\\alpha)^n,\\quad n_{90}=\\left\\lceil {\\ln0.1\\over\\ln(1-\\alpha)}\\right\\rceil",
              "explanation": "n从首次更新计数，假设固定周期、固定α和恒定阶跃；n90为误差不超过初始10%的更新次数，不适用于已经加限速器的非线性串联系统。"
            }
          ]
        },
        {
          "heading": "04 低通和限速串联仍需测实际响应",
          "body": "先低通再限速可兼顾小噪声抑制与命令差分上界，但两者内部状态必须分开记。滤波状态跟随请求递推，限速状态保存最后真正采用的发送目标；如果直接把未发送的滤波输出当上一发送值，下一步可能违反差分限制。初始发送状态不在幅值范围内时也不能靠一次夹紧同时满足所有约束。\n\n对SO-101先离线绘制四条轨迹：请求、滤波、发送和测量。测量用于设备跟踪误差，发送用于命令限速，不能交换。对RAW增强抑制的感知噪声，应先确认抖动来自输入而非模型跨模式切换；后者可能需要RTC式条件生成而非加大τ。所有算例都是教学假设，今天不连接设备。",
          "sourceIds": [
            "so",
            "rtc"
          ]
        }
      ],
      "points": [
        "先确定位置还是速度，再解释限幅。",
        "低通减少高频也延后真实变化。",
        "命令变化率与设备运动速度分别验收。"
      ],
      "codeTitle": "step_response.py · 一阶低通阶跃夹具",
      "code": "import math\ndef lowpass(x,y,dt,tau):\n    if not all(math.isfinite(v) for v in (x,y,dt,tau)) or dt<=0 or tau<=0:\n        raise ValueError(\"finite input and positive seconds required\")\n    alpha=dt/(tau+dt)\n    return y+alpha*(x-y)\ny=0.\nfor n in range(1,12):\n    y=lowpass(1.,y,.02,.08)\n    assert abs(y-(1-.8**n))<1e-12\nassert y>=.9 and 1-.8**10<.9\nassert abs(lowpass(-1,.8,.02,.08)-.44)<1e-12\nfor bad in (0,-.02,float('nan')):\n    try: lowpass(1,0,bad,.08)\n    except ValueError: pass\n    else: raise AssertionError(\"invalid dt accepted\")\n",
      "codeNotes": [
        "函数直接表达后向欧拉递推；先检查有限数和正时间，避免把NaN藏进状态。",
        "循环逐步核对闭式解，再验证反向输入仍为正的反例；不含电机动力学或急停。"
      ],
      "exercise": {
        "prompt": "τ=80ms、周期20ms，100ms后阶跃到达多少？是否满足90%响应？",
        "steps": [
          "把100ms换成5次更新。",
          "计算误差并说明额外约束。"
        ],
        "solution": "y5=1-0.8^5=0.67232rad，只到67.232%，未到90%；11次更新才满足。这里尚未加限速或设备滞后，真实系统响应还需另测。"
      },
      "quiz": {
        "question": "把位置夹在[-1,1]内能否保证相邻目标变化不超过0.02rad？",
        "hint": "在区间两端构造一步跳变。",
        "keywords": [
          "amplitude bound",
          "delta bound",
          "seconds",
          "command rate"
        ],
        "reference": "不能，-1到1仍在幅值范围内却跳变2rad。应另外限制相邻已发送目标之差；若要求1rad/s且周期20ms，则每步最多0.02rad，设备实际运动仍需反馈验证。"
      },
      "sources": [
        {
          "id": "rate",
          "label": "ros-controls RateLimiter 固定源码",
          "url": "https://github.com/ros-controls/control_toolbox/blob/f9d0ac331fe9d286bc0277f16d9c2b1f65f6d4e8/control_toolbox/include/control_toolbox/rate_limiter.hpp",
          "reading": "2026-11-08 实读 set_params、limit、limit_first_derivative、limit_second_derivative；区分变量单位、按上一值符号选择上下界及条件二阶限制；下载main与固定SHA复核。"
        },
        {
          "id": "scipy",
          "label": "SciPy lfilter 官方文档",
          "url": "https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.lfilter.html",
          "reading": "2026-11-08 实读 Notes 差分方程、传递函数及 zi 的初值合同；课堂直接实现一阶递推，不依赖 SciPy、不声称复刻通用滤波器。"
        },
        {
          "id": "so",
          "label": "LeRobot 相对反馈目标夹紧",
          "url": "https://github.com/huggingface/lerobot/blob/d490e472a5d1a207cfe0255caaaf74b6d66e4656/src/lerobot/robots/utils.py",
          "reading": "实读 ensure_safe_goal_position：goal_present_pos、max_relative_target 和两次 min/max；没有dt，不等于以已发命令为中心的限速。"
        },
        {
          "id": "rtc",
          "label": "RTC 原论文 v2",
          "url": "https://arxiv.org/html/2506.07339v2",
          "reading": "实读第2节图2的绕障多模态反例、第3.2节软mask与3.3节承诺前缀；2025-12-05版本，非今日新增。"
        },
        {
          "id": "mr",
          "label": "Modern Robotics 11.3 官方课程",
          "url": "https://modernrobotics.northwestern.edu/nu-gm-book-resource/11-3-motion-control-with-velocity-inputs-part-1-of-3/",
          "reading": "实读 Transcript：直接速度输入是忽略动力学的假设，位置误差反馈不等于真实电机已跟踪。"
        },
        {
          "id": "behavior",
          "label": "StanfordVL BEHAVIOR 官方入口",
          "url": "https://behavior.stanford.edu/challenge/updates.html",
          "reading": "复核任务/仿真/评测归属；本课滤波夹具不代表该挑战成绩。"
        },
        {
          "id": "r2s",
          "label": "World Labs R2S2R",
          "url": "https://www.worldlabs.ai/blog/real-to-sim-to-real",
          "reading": "作为世界构建与迁移评测的延伸阅读；动作后处理是迁移合同的一部分，不把空间生成当作执行安全证明。"
        },
        {
          "id": "jepa",
          "label": "Meta V-JEPA 官方页",
          "url": "https://ai.meta.com/research/vjepa/",
          "reading": "复核视频表征与动作条件规划边界；讨论预测输入应包含实际后处理动作属于本课推论，不声称上游已采用本教学滤波器。"
        },
        {
          "id": "ami",
          "label": "AMI Labs 官方方向",
          "url": "https://amilabs.xyz/",
          "reading": "复核表征空间预测、动作条件规划与安全愿景，不能称其为已发布控制器。"
        }
      ]
    },
    "code": {
      "title": "精读 RateLimiter：把低通状态和发送状态分开",
      "minutes": 40,
      "prerequisites": "理解一阶递推、有限数校验以及标量动作的rad单位。",
      "connection": "把基础公式变成可复算夹具，产出的状态合同将供明日approach/grasp/lift阶段切换使用。",
      "intro": "同名rate limiter可以限制不同物理量，要沿参数、调用顺序和状态来源阅读源码。",
      "outcomes": [
        "定位真实限制函数和单位",
        "实现有界单关节后处理器",
        "验证重置、非法输入与不等周期"
      ],
      "sections": [
        {
          "heading": "01 沿真实源码读，而非凭类名猜安全性",
          "body": "control_toolbox的RateLimiter是通用标量类，limit先调用二阶差分限制，再一阶，最后幅值夹紧；limit_first_derivative用v0的符号选择正向或反向上下界，再把v-v0夹到导数乘dt的区间。这里的v只是变量名，若传入速度，一阶导数是加速度，传入位置则一阶导数是速度。\n\n精读时逐项检查set_params的启用条件、缺省边界和异常。它允许某些NaN参数表示关闭某类限制；本课接口更严格，要求所有数值有限。上游二阶限制还有条件分支，并非任意时刻都施加对称jerk约束；教学不实现非对称加减速、二阶差分和C++返回比例，也不冒充ROS组件。",
          "sourceIds": [
            "rate"
          ]
        },
        {
          "heading": "02 反馈中心和上一发送值不是同一状态",
          "body": "LeRobot的ensure_safe_goal_position输入每关节(goal,present)，把目标相对测得位置的差限制在max_relative_target内。它没有dt，因此是反馈中心的目标距离护栏。即使present连续两次一样，请求不变，也可能反复给同一目标；不能用这个函数名推断目标序列具有某个rad/s上界。\n\n本课发送限速则以last_sent为中心，维护命令变化率。filtered单独保存低通状态，last_sent只有通过所有检查才更新。记录这两个状态和实际测量值才能定位“策略没变、滤波变了”还是“电机没有跟上”；多关节扩展需按名称和单位逐项校验，不允许把夹爪百分比当弧度共享阈值。",
          "sourceIds": [
            "so",
            "rate"
          ]
        },
        {
          "heading": "03 状态提交必须在所有检查通过之后",
          "body": "示例规定有限目标、合法位置范围、正τ和速率，周期还必须处在(0,100ms]。上限是教学故障合同，用于拒绝长停后一次跨大步，不是SO-101安全推荐值。先由新目标计算候选filtered，再限制相对last_sent变化，最后才同时提交两状态；非法输入不得半途污染状态。\n\n幅值夹紧放在请求端，且初始last_sent已验证在合法区间内。低通是区间内凸组合，随后限速沿上一发送值向候选移动，所以在本标量条件下保持范围。这个顺序具有可说明的不变式；若后处理还有反馈中心夹紧或碰撞修正，需记录最终实际采用值并重新验证，不能沿用这一简化证明。",
          "sourceIds": [
            "scipy",
            "rate"
          ]
        },
        {
          "heading": "04 逐段测试把隐藏假设显式化",
          "body": "正例先对1rad阶跃更新20ms，低通给0.2rad，但限速只发送0.02rad；下一步40ms，发送最多再加0.04rad。验证每个实际dt对应的差分界，能捕捉把固定频率硬编码进限速器的问题。重置使用显式初始位置重新构造，不沿用上一episode的滤波状态。\n\n负例拒绝NaN、零周期和过大周期，并断言两个状态都不改变；错误初始位置也拒绝。该实现只模拟命令后处理，不导入驱动、不打开端口、不处理四元数或多线程。安全回退与时钟观测缺失应作为显式事件交给状态机，不能在异常时悄悄返回零位置。",
          "sourceIds": [
            "so",
            "mr"
          ]
        }
      ],
      "points": [
        "读清被限制的物理量。",
        "filtered、last_sent、measured各有语义。",
        "失败输入不提交部分状态。"
      ],
      "codeTitle": "command_filter.py · 原创单关节教学实现",
      "code": "import math\nclass CommandFilter:\n    def __init__(self,q0,tau=.08,rate=1.,lo=-1.,hi=1.):\n        if not all(math.isfinite(v) for v in (q0,tau,rate,lo,hi)) or not lo<=q0<=hi or lo>=hi or tau<=0 or rate<=0:\n            raise ValueError(\"invalid configuration\")\n        self.filtered=self.sent=q0\n        self.tau,self.rate,self.lo,self.hi=tau,rate,lo,hi\n    def step(self,target,dt):\n        if not math.isfinite(target) or not math.isfinite(dt) or not 0<dt<=.1:\n            raise ValueError(\"invalid command or interval\")\n        x=min(self.hi,max(self.lo,target))\n        f=self.filtered+dt/(self.tau+dt)*(x-self.filtered)\n        delta=min(self.rate*dt,max(-self.rate*dt,f-self.sent))\n        s=self.sent+delta\n        self.filtered,self.sent=f,s\n        return f,s\nc=CommandFilter(0.)\nf,s=c.step(1.,.02)\nassert abs(f-.2)<1e-12 and abs(s-.02)<1e-12\nfor target,dt in [(1.,.04),(-1.,.01),(4.,.03)]:\n    old=c.sent\n    f,s=c.step(target,dt)\n    assert -1<=s<=1 and abs(s-old)<=dt+1e-12\nsaved=(c.filtered,c.sent)\nfor target,dt in [(float('nan'),.02),(0.,0.),(0.,.2)]:\n    try: c.step(target,dt)\n    except ValueError: pass\n    else: raise AssertionError(\"bad step accepted\")\n    assert saved==(c.filtered,c.sent)\nassert CommandFilter(.3).sent==.3\ntry: CommandFilter(2.)\nexcept ValueError: pass\nelse: raise AssertionError(\"bad initial state accepted\")\n",
      "codeNotes": [
        "构造器验证状态和范围；step先产生候选，全部有效才一次提交，便于错误后复查。",
        "首个断言区分低通0.2和实际发送0.02；不等周期验证变化率合同，负例验证状态不被污染。"
      ],
      "exercise": {
        "prompt": "若错误地把上一filtered=0.2当作上一发送值，而实际上一发送0.02，下步限速1rad/s、20ms会有什么问题？",
        "steps": [
          "假设候选继续增大，求错误的最小新目标。",
          "和真实发送值作差。"
        ],
        "solution": "错误中心会从0.2附近发到0.22，和实际0.02相差0.20rad，20ms对应10rad/s，超过1rad/s。限速中心必须是上一条实际采用的发送命令，不能用未执行的滤波候选。"
      },
      "quiz": {
        "question": "为什么长停200ms不能直接用rate×200ms允许一次大跳？",
        "hint": "计算允许增量并回想区间上限合同。",
        "keywords": [
          "stale interval",
          "state commit",
          "last sent",
          "fallback event"
        ],
        "reference": "数学限速允许更大增量，但长停可能意味着观测或执行状态过期，不能由该公式证明恢复合理。示例按明确合同拒绝超过100ms的间隔且不改状态，再交状态机处理；阈值只是教学假设，真实设置需验证。"
      },
      "sources": [
        {
          "id": "rate",
          "label": "ros-controls RateLimiter 固定源码",
          "url": "https://github.com/ros-controls/control_toolbox/blob/f9d0ac331fe9d286bc0277f16d9c2b1f65f6d4e8/control_toolbox/include/control_toolbox/rate_limiter.hpp",
          "reading": "2026-11-08 实读 set_params、limit、limit_first_derivative、limit_second_derivative；区分变量单位、按上一值符号选择上下界及条件二阶限制；下载main与固定SHA复核。"
        },
        {
          "id": "scipy",
          "label": "SciPy lfilter 官方文档",
          "url": "https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.lfilter.html",
          "reading": "2026-11-08 实读 Notes 差分方程、传递函数及 zi 的初值合同；课堂直接实现一阶递推，不依赖 SciPy、不声称复刻通用滤波器。"
        },
        {
          "id": "so",
          "label": "LeRobot 相对反馈目标夹紧",
          "url": "https://github.com/huggingface/lerobot/blob/d490e472a5d1a207cfe0255caaaf74b6d66e4656/src/lerobot/robots/utils.py",
          "reading": "实读 ensure_safe_goal_position：goal_present_pos、max_relative_target 和两次 min/max；没有dt，不等于以已发命令为中心的限速。"
        },
        {
          "id": "rtc",
          "label": "RTC 原论文 v2",
          "url": "https://arxiv.org/html/2506.07339v2",
          "reading": "实读第2节图2的绕障多模态反例、第3.2节软mask与3.3节承诺前缀；2025-12-05版本，非今日新增。"
        },
        {
          "id": "mr",
          "label": "Modern Robotics 11.3 官方课程",
          "url": "https://modernrobotics.northwestern.edu/nu-gm-book-resource/11-3-motion-control-with-velocity-inputs-part-1-of-3/",
          "reading": "实读 Transcript：直接速度输入是忽略动力学的假设，位置误差反馈不等于真实电机已跟踪。"
        },
        {
          "id": "behavior",
          "label": "StanfordVL BEHAVIOR 官方入口",
          "url": "https://behavior.stanford.edu/challenge/updates.html",
          "reading": "复核任务/仿真/评测归属；本课滤波夹具不代表该挑战成绩。"
        },
        {
          "id": "r2s",
          "label": "World Labs R2S2R",
          "url": "https://www.worldlabs.ai/blog/real-to-sim-to-real",
          "reading": "作为世界构建与迁移评测的延伸阅读；动作后处理是迁移合同的一部分，不把空间生成当作执行安全证明。"
        },
        {
          "id": "jepa",
          "label": "Meta V-JEPA 官方页",
          "url": "https://ai.meta.com/research/vjepa/",
          "reading": "复核视频表征与动作条件规划边界；讨论预测输入应包含实际后处理动作属于本课推论，不声称上游已采用本教学滤波器。"
        },
        {
          "id": "ami",
          "label": "AMI Labs 官方方向",
          "url": "https://amilabs.xyz/",
          "reading": "复核表征空间预测、动作条件规划与安全愿景，不能称其为已发布控制器。"
        }
      ]
    },
    "insight": {
      "title": "平滑性不能牺牲纠错能力：让动作后处理进入模型证据链",
      "minutes": 25,
      "prerequisites": "能解释220ms阶跃响应、发送限速和输入年龄的区别。",
      "connection": "把后处理状态纳入部署日志，明日比较模型与规则在不同任务阶段的责任。",
      "intro": "更平滑的轨迹只是一个观测结果，必须解释它降低了什么风险，又延后了哪类有效动作。",
      "outcomes": [
        "比较感知去噪与动作去噪",
        "推导斜坡输入的稳态滞后",
        "为双路线世界模型记录有效动作"
      ],
      "sections": [
        {
          "heading": "01 用斜坡误差衡量持续跟踪代价",
          "body": "固定周期下，请求位置每步增加vΔt。令同一时刻请求与输出的差为e，把低通递推代入可得稳态e=(1-α)vΔt/α。后向欧拉的α代入后为vτ；这说明持续运动时滤波形成与速度成正比的位置落后，不能只看静止时曲线干净程度。\n\n教学取v=0.1rad/s、τ=0.08s，稳态落后0.008rad，约0.458度。这是无限斜坡、固定周期、没有幅值饱和或限速的数学模型，不是真机误差。若再串联限速且v超过限速上界，误差会持续增长而非收敛，不能继续套用vτ。",
          "sourceIds": [
            "scipy"
          ],
          "formulas": [
            {
              "latex": "e_k=(1-\\alpha)(e_{k-1}+v\\Delta t),\\quad e_\\infty={1-\\alpha\\over\\alpha}v\\Delta t=v\\tau",
              "explanation": "e为当前请求减当前低通输出，v单位rad/s，τ单位秒；仅对未饱和线性一阶系统和固定速率斜坡成立，不能推到接触或多模式策略。"
            }
          ]
        },
        {
          "heading": "02 优先处理错误来源，再选择平滑位置",
          "body": "RAW可保留高动态细节，但曝光与前处理也可能增加输入年龄。若抖动来自饱和像素导致定位跳变，改观测质量可能同时改善动作与响应；若来自两条合法绕障策略交替，逐点平均可能穿过障碍，RTC论文的反例说明几何平均不保留任务可行性。\n\n具体比较两条路线：输入去噪可能增加算力与观测等待，却保留真实动作变化；动作低通便宜且易实现，却延后所有高频成分，包括有效纠错。先在同一保存轨迹上消融输入处理和τ，再比较同一容差下的修正时间与失败类型。用户的画质背景可用于解释噪声来源，但不能把图像PSNR改进自动当闭环收益。",
          "sourceIds": [
            "rtc",
            "mr"
          ]
        },
        {
          "heading": "03 双团队模型必须知道有效动作是什么",
          "body": "StanfordVL的BEHAVIOR/OmniGibson提供任务与物理交互环境；World Labs的Marble/Atlas/R2S2R侧重空间世界构建与迁移应用。用世界变体训练策略时，执行端若额外低通，实际转移就与原请求动作对应的动力学不同。建议把τ、周期、滤波初始状态及发送动作写入仿真与真实日志，公平比较同一后处理合同。\n\nMeta/FAIR的动作条件V-JEPA及JEPA-WM预测动作后果，若训练输入为请求而真实执行被限速，预测误差可能来自接口而非表征差。教学推论是把有效动作和后处理状态作为可审计条件或固定外部动态；AMI当前表征预测方向不代表已有这种部署实现。空间重建逼真、latent cost下降和SO-101纠错及时分别需要证据。",
          "sourceIds": [
            "behavior",
            "r2s",
            "jepa",
            "ami"
          ]
        },
        {
          "heading": "04 Mac回放先筛选，租卡训练回答机制问题",
          "body": "先用本日内存实现对同一请求轨迹扫τ=0.02、0.08、0.2s，保持幅值、变化率和初态不变，记录噪声幅度、阶跃达到90%的时间与反向符号切换时间。CPU足够做这类实验，无需租4090；数值结果应明确哪些来自解析、哪些来自回放，不能标成真实机械臂性能。\n\n只有确认传感器或模型本身需要改进时，才在固定步数与数据划分下用云卡比较训练方案。评价表同时列完整任务成功、纠错迟滞、限速触发率与观测年龄，不能只以二阶差分更小选优。若场景切换或重新开始episode，明日状态机应明确重置滤波状态的条件；重置本身也可能跳变，必须纳入日志与审查。",
          "sourceIds": [
            "rate",
            "so"
          ]
        }
      ],
      "points": [
        "斜坡落后vτ只适用于线性未饱和条件。",
        "感知去噪与动作低通成本不同。",
        "世界模型的动作条件要对应执行合同。"
      ],
      "codeTitle": "ramp_and_reversal.py · 跟踪与纠错反例",
      "code": "import math\ndt,tau,v=.02,.08,.1\nalpha=dt/(tau+dt)\ny=0.\nfor k in range(1,201):\n    x=k*v*dt\n    y+=alpha*(x-y)\nassert abs((x-y)-v*tau)<1e-10\ndef reversal(tau):\n    a=dt/(tau+dt); y=1.\n    for n in range(1,1000):\n        y+=a*(-1-y)\n        if y<=0: return n\n    raise AssertionError(\"no crossing\")\nassert reversal(.02)==1 and reversal(.08)==4\nassert reversal(.2)>reversal(.08)\n# Each endpoint avoids the disk; their naive midpoint does not.\np=(0.,1.); q=(0.,-1.); radius=.5\nassert math.hypot(*p)>radius and math.hypot(*q)>radius\nm=tuple((a+b)/2 for a,b in zip(p,q))\nassert math.hypot(*m)<radius\n",
      "codeNotes": [
        "前段用200次固定周期更新验证斜坡稳态误差；没有幅值或限速，不能与串联夹具混报。",
        "反向测试量化τ增大导致的符号切换延后；圆盘例子只证明逐点平均不保持避障，不是完整路径规划器。"
      ],
      "exercise": {
        "prompt": "限速0.05rad/s，请求斜坡0.1rad/s，能否预测最终误差仍为0.008rad？",
        "steps": [
          "比较请求增长与允许发送增长。",
          "说明线性稳态推导失效的原因。"
        ],
        "solution": "不能。长时间发送增长至多0.05rad/s，请求每秒增加0.1rad，差至少以约0.05rad/s持续扩大（未触幅值时）。限速使系统非线性且无法跟上斜坡，vτ的线性未饱和稳态不再存在。"
      },
      "quiz": {
        "question": "世界模型预测很准却部署偏差大，为什么先核对请求与发送动作？",
        "hint": "训练动作条件是否真正被执行？",
        "keywords": [
          "effective action",
          "filter state",
          "dynamics mismatch",
          "paired replay"
        ],
        "reference": "训练若用请求动作，部署却经过低通、限速和裁剪，实际状态转移对应不同有效输入。应核对请求/滤波/发送/测量及后处理初态，固定合同回放后再归因表征或预测能力；AMI愿景不能当作已验证补偿器。"
      },
      "sources": [
        {
          "id": "rate",
          "label": "ros-controls RateLimiter 固定源码",
          "url": "https://github.com/ros-controls/control_toolbox/blob/f9d0ac331fe9d286bc0277f16d9c2b1f65f6d4e8/control_toolbox/include/control_toolbox/rate_limiter.hpp",
          "reading": "2026-11-08 实读 set_params、limit、limit_first_derivative、limit_second_derivative；区分变量单位、按上一值符号选择上下界及条件二阶限制；下载main与固定SHA复核。"
        },
        {
          "id": "scipy",
          "label": "SciPy lfilter 官方文档",
          "url": "https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.lfilter.html",
          "reading": "2026-11-08 实读 Notes 差分方程、传递函数及 zi 的初值合同；课堂直接实现一阶递推，不依赖 SciPy、不声称复刻通用滤波器。"
        },
        {
          "id": "so",
          "label": "LeRobot 相对反馈目标夹紧",
          "url": "https://github.com/huggingface/lerobot/blob/d490e472a5d1a207cfe0255caaaf74b6d66e4656/src/lerobot/robots/utils.py",
          "reading": "实读 ensure_safe_goal_position：goal_present_pos、max_relative_target 和两次 min/max；没有dt，不等于以已发命令为中心的限速。"
        },
        {
          "id": "rtc",
          "label": "RTC 原论文 v2",
          "url": "https://arxiv.org/html/2506.07339v2",
          "reading": "实读第2节图2的绕障多模态反例、第3.2节软mask与3.3节承诺前缀；2025-12-05版本，非今日新增。"
        },
        {
          "id": "mr",
          "label": "Modern Robotics 11.3 官方课程",
          "url": "https://modernrobotics.northwestern.edu/nu-gm-book-resource/11-3-motion-control-with-velocity-inputs-part-1-of-3/",
          "reading": "实读 Transcript：直接速度输入是忽略动力学的假设，位置误差反馈不等于真实电机已跟踪。"
        },
        {
          "id": "behavior",
          "label": "StanfordVL BEHAVIOR 官方入口",
          "url": "https://behavior.stanford.edu/challenge/updates.html",
          "reading": "复核任务/仿真/评测归属；本课滤波夹具不代表该挑战成绩。"
        },
        {
          "id": "r2s",
          "label": "World Labs R2S2R",
          "url": "https://www.worldlabs.ai/blog/real-to-sim-to-real",
          "reading": "作为世界构建与迁移评测的延伸阅读；动作后处理是迁移合同的一部分，不把空间生成当作执行安全证明。"
        },
        {
          "id": "jepa",
          "label": "Meta V-JEPA 官方页",
          "url": "https://ai.meta.com/research/vjepa/",
          "reading": "复核视频表征与动作条件规划边界；讨论预测输入应包含实际后处理动作属于本课推论，不声称上游已采用本教学滤波器。"
        },
        {
          "id": "ami",
          "label": "AMI Labs 官方方向",
          "url": "https://amilabs.xyz/",
          "reading": "复核表征空间预测、动作条件规划与安全愿景，不能称其为已发布控制器。"
        }
      ]
    }
  }
};
