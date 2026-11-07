import type { AuthoredDay } from './types';

export const day72: AuthoredDay = {
  "reviewedAt": "2026-11-07",
  "revision": "逐课编写 1.0",
  "deliverable": "同钟trace审计器、nearest-rank分位数与失约统计、RAW/模型/队列部署预算表。35+40+25=100分钟。",
  "question": {
    "title": "RAW定位更准但多10ms处理，30Hz输出仍准时，怎样判断是否值得？",
    "summary": "连接当天机制与可审计实验。",
    "keywords": [
      "observation age",
      "tail latency",
      "stale displacement",
      "paired task"
    ],
    "reference": "先核对每条命令的capture-to-send年龄，输出节拍不能证明输入新鲜。0.2m/s目标下额外10ms对应2mm陈旧位移上界；与定位改善、标定和执行误差分开报告，不能混合不同统计量。固定任务与动作合同，比较完整年龄分布、失约/丢弃及分层成功；快慢规划还需有效期限与版本。"
  },
  "lessons": {
    "foundation": {
      "title": "控制频率与端到端延迟：用观测年龄解释长尾",
      "minutes": 35,
      "prerequisites": "掌握11月10日位置/速度语义和秒、毫秒换算。",
      "connection": "今天量化何时生效，明日检查平滑与限幅如何改变纠错能力。",
      "intro": "每秒发出三十条命令不代表每条命令都基于三十毫秒以内的新观测。",
      "outcomes": [
        "区分吞吐、周期与观测年龄",
        "计算串行预算和尾部分位数",
        "从速度推导延迟误差上界"
      ],
      "sections": [
        {
          "heading": "01 周期不是数据新鲜度",
          "body": "控制频率30Hz给出约33.3ms的名义周期；它描述计划多久发一次命令。端到端年龄则从图像曝光所代表的时刻到命令生效计算，即使输出线程维持30Hz，若图像先排队两百毫秒，策略仍在对旧世界作决策。缓存命中、异步队列和重复旧帧都可能掩盖这种差别。\n\n记录capture、read_return、inference_start/end、enqueue、send与可观测的ack时间，再统一到可比较的时钟域。曝光时刻与读取返回不能混用，设备时钟也不能直接减主机单调时钟；若没有可信的生效反馈，诚实标记send_age而非executed_age。本课数值均是教学夹具，不是SO-101实测。",
          "sourceIds": [
            "so",
            "ros"
          ]
        },
        {
          "heading": "02 串行总和与流水线瓶颈",
          "body": "教学串行链路取采集8ms、前处理4ms、推理18ms、发送5ms，总计35ms，已超过30Hz的33.3ms。若流水并行，稳态吞吐可能由最慢的18ms阶段限制，但单样本穿过所有阶段仍需至少35ms；吞吐提升与年龄下降不能互相代替。\n\n真实链路还包括排队、调度、同步等待和设备执行响应。某阶段均值快而偶发很慢，会使后续样本等待，不能简单相加各阶段p99当成整体p99；分位数涉及相关性，需保存同一trace中的总时延直接统计。若预算不满足，应先测排队和瓶颈，再决定减小模型或丢弃旧输入。",
          "sourceIds": [
            "so"
          ],
          "formulas": [
            {
              "latex": "L_i=t^{(i)}_{\\rm send}-t^{(i)}_{\\rm capture}=\\sum_j d_{ij}+w_i,\\quad T={1\\over f}",
              "explanation": "L为同一时钟域中的发送年龄，d为该样本各串行阶段耗时，w为未被阶段覆盖的等待；T为名义周期，f为Hz，二者不必相等。"
            }
          ]
        },
        {
          "heading": "03 长尾用明确分位数定义",
          "body": "对99条20ms和1条200ms样本，平均为21.8ms，但最坏200ms。nearest-rank定义的p99是排序后第99条，即20ms；p100才为200ms。这不是p99算错，而是样本少且稀有事件正好落在余下1%，所以报告分位数还要有样本量、最大值与超时计数。\n\n连续运行的数据可能存在热启动、温升和网络簇状故障，不能把一百帧视作一百次独立安全试验。应按episode和运行条件分层，保留发生超时的原始trace；如果只在成功episode统计延迟，会把最危险的尾部排除。截止时间失约率的分母也必须包含失败记录。",
          "sourceIds": [
            "ros"
          ]
        },
        {
          "heading": "04 速度把旧观测变成位置风险",
          "body": "假设被观测目标速度有已知上界0.2m/s，60ms的观测年龄对应最多12mm未观测位移；这只是恒速度上界模型，机器人自身运动、目标加速度、标定误差还需另加。目标容差5mm时，即使视觉定位误差1mm也无法抵消这项滞后。\n\nWorld Labs空间上下文和StanfordVL仿真状态都可能在不同频率更新，必须明确预测使用哪个时刻的状态。Meta动作条件世界模型可以研究补偿动作后果，但预测误差要进入预算；AMI的可靠性方向并非现成时延保证。RAW较大带宽或长曝光带来的收益，必须与年龄增长一起按同任务比较。",
          "sourceIds": [
            "atlas",
            "behavior",
            "jepa",
            "ami"
          ],
          "formulas": [
            {
              "latex": "e_{\\rm stale}\\le v_{\\max}L,\\quad v_{\\max}=0.2\\ {\\rm m/s},\\ L=0.06\\ {\\rm s}\\Rightarrow e_{\\rm stale}\\le0.012\\ {\\rm m}",
              "explanation": "目标速度有界且时钟可靠时给出位移上界，不包含加速度变化引起的建模不确定性或定位、执行误差，不能当成碰撞安全证明。"
            }
          ]
        }
      ],
      "points": [
        "区分吞吐、周期与观测年龄",
        "计算串行预算和尾部分位数",
        "从速度推导延迟误差上界"
      ],
      "codeTitle": "控制频率与端到端延迟：用观测年龄解释长尾 · 纯内存教学夹具",
      "code": "import math\n\ndef nearest_rank(xs,p):\n    if not xs or not 0<p<=1 or not all(math.isfinite(x) and x>=0 for x in xs):\n        raise ValueError(\"invalid latency sample\")\n    return sorted(xs)[math.ceil(p*len(xs))-1]\nxs=[.020]*99+[.200]\nassert abs(sum(xs)/len(xs)-.0218)<1e-12\nassert nearest_rank(xs,.99)==.020 and nearest_rank(xs,1)==.200\nassert sum(x>1/30 for x in xs)==1\nassert abs(.2*.06-.012)<1e-12\nfor bad in ([],[-1],[float('nan')]):\n    try:\n        nearest_rank(bad,.99)\n        raise AssertionError(\"bad sample accepted\")\n    except ValueError: pass\n",
      "codeNotes": [
        "nearest_rank明确使用ceil(pN)的一基排序索引，和插值分位数不同。",
        "夹具保留一个超期样本；速度乘年龄算出的12mm只是教学上界，不是测量或实际机械臂指令。"
      ],
      "exercise": {
        "prompt": "99条20ms和1条200ms的p99达标，能否说100条都满足33.3ms？",
        "steps": [
          "按nearest-rank求p99和最大值。",
          "给出失约率和报告限制。"
        ],
        "solution": "p99为20ms，最大200ms，失约1/100=1%。p99只覆盖其定义的秩，不能保证全部达标；应附N、最大值、失约次数及运行条件，样本量不足也不能证明长期风险很低。"
      },
      "quiz": {
        "question": "30Hz输出为何仍可能有200ms观测年龄？",
        "hint": "把发送节拍和capture时间分开。",
        "keywords": [
          "control period",
          "capture timestamp",
          "queue wait",
          "deadline miss"
        ],
        "reference": "输出线程可能重复旧观测或消费积压队列，节拍只说明发送频率。需关联每条命令的capture时间与send时间，测排队及各阶段，区分send与实际生效；保持30Hz并不能保证状态新鲜。"
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
      "title": "从顺序读相机到同步队列：实现可复算的时间线审计",
      "minutes": 40,
      "prerequisites": "会读SOFollower.get_observation和基本时间戳，理解分位数。",
      "connection": "把本日延迟定义落实到trace，明天用它评估滤波引入的额外相位滞后。",
      "intro": "上游debug耗时是有用线索，但必须明确它测的是调用耗时还是输入年龄。",
      "outcomes": [
        "定位read_latest与计时边界",
        "区分对齐与新鲜度",
        "拒绝乱序、跨钟和不完整trace"
      ],
      "sections": [
        {
          "heading": "01 原始读取路径的可见边界",
          "body": "SOFollower.get_observation先计时sync_read关节位置，再依次读取相机的read_latest，深度另调用read_latest_depth。每个debug记录使用perf_counter差值乘一千形成毫秒；这能显示调用阻塞多久，但返回字典中这段路径没有统一给每个模态附上曝光时刻。\n\n因此“相机read耗时1ms”并不说明图像只有1ms老，也不说明RGB、depth与关节同时采集。read_latest可从缓存快速返回；若采集线程停了却仍返回旧缓存，函数耗时仍很好看。精读时应继续核对所选相机驱动的时间戳合同，缺失就明确留空，不由主机读取结束时间反推曝光。",
          "sourceIds": [
            "so"
          ]
        },
        {
          "heading": "02 近似同步不等于端到端实时",
          "body": "ROS ApproximateTime源码为每个输入保存队列，process选择候选区间和pivot，超出max_interval_duration时淘汰过早项，并用age_penalty参与候选比较。它解决多流时间戳如何配成组，不替消费者证明这组数据离当前时间足够近。\n\n两帧timestamp分别1.000和1.004s，对齐误差4ms很好；如果当前时间1.500s，它们仍已老约500ms。需要两道独立检查：跨模态skew与最旧观测age。教学只检查已给定timestamp的trace，不复刻pivot搜索、队列恢复或ROS executor，也不能宣称兼容完整同步器。",
          "sourceIds": [
            "ros"
          ]
        },
        {
          "heading": "03 发送路径额外读取与日志命名",
          "body": "send_action在max_relative_target开启时再sync_read当前关节，然后夹紧并sync_write。读取可提升目标相对反馈的合理性，也会增加调用耗时；测试配置若关闭此项，不能用其延迟冒充上线护栏开启后的结果。应记录配置、读取和写入边界，按同一trace比较。\n\n示例用毫秒整数避免浮点阈值歧义，规定capture、read、infer_start、infer_end、send单调排列，并验证clock字段一致。输出age和queue_wait，拒绝缺字段和时间逆序。它额外要求capture时间可信，真实系统若无法取得必须报告无法计算，而非补零。",
          "sourceIds": [
            "so",
            "utils"
          ]
        },
        {
          "heading": "04 正负夹具让时间语义可审计",
          "body": "正例capture=1000、read=1008、start=1012、end=1030、send=1035，年龄35ms，推理前等待4ms；控制截止33ms时失约。负例把end改到start之前或者改clock标识，都应拒绝，不允许一段负耗时抵消其他阶段得到漂亮总数。\n\n若要测真实执行年龄，必须再有独立ack或反馈证据，不能把send字段改名executed。这一规则同样适用于BEHAVIOR模拟step、World Labs场景更新与JEPA预测输入：记录各自时间及动作合同，避免跨系统日志拼接成不存在的闭环。当前只执行内存fixture，不读取生产学习数据或设备。",
          "sourceIds": [
            "behavior",
            "r2s",
            "jepa"
          ]
        }
      ],
      "points": [
        "定位read_latest与计时边界",
        "区分对齐与新鲜度",
        "拒绝乱序、跨钟和不完整trace"
      ],
      "codeTitle": "从顺序读相机到同步队列：实现可复算的时间线审计 · 纯内存教学夹具",
      "code": "def audit_trace(r):\n    names=['capture','read','infer_start','infer_end','send']\n    if r.get('clock')!='host_monotonic_ms' or any(k not in r for k in names):\n        raise ValueError(\"missing timestamp or mixed clock\")\n    ts=[r[k] for k in names]\n    if any(type(t) is not int or t<0 for t in ts) or ts!=sorted(ts):\n        raise ValueError(\"unordered timestamps\")\n    return {'send_age':ts[-1]-ts[0], 'queue_wait':ts[2]-ts[1]}\nr=dict(clock='host_monotonic_ms',capture=1000,read=1008,infer_start=1012,infer_end=1030,send=1035)\nassert audit_trace(r)=={'send_age':35,'queue_wait':4}\nfor bad in (dict(r,infer_end=1009),dict(r,clock='camera_clock'),{k:v for k,v in r.items() if k!='capture'}):\n    try:\n        audit_trace(bad)\n        raise AssertionError(\"invalid trace accepted\")\n    except ValueError: pass\n# Tight skew alone cannot prove freshness.\nassert max(1000,1004)-min(1000,1004)==4\nassert 1500-min(1000,1004)==500\n",
      "codeNotes": [
        "audit_trace计算调用链中的send_age与队列等待，不假装获得设备生效时刻。",
        "三个负例覆盖逆序、跨钟和缺capture；两个模态4ms skew仍可有500ms age。"
      ],
      "exercise": {
        "prompt": "把capture改为read结束时间，35ms年龄会被报告成多少？为什么不诚实？",
        "steps": [
          "按1035减1008计算。",
          "列出被隐去的阶段。"
        ],
        "solution": "会得到27ms，隐去曝光/采集到读取完成的8ms。本例假定capture可信，若现实没有该时间只能报告read-to-send与未知采集年龄，不能冒充完整端到端年龄。"
      },
      "quiz": {
        "question": "ApproximateTime把相机配对到4ms以内，为什么还要检查age？",
        "hint": "考虑两张半秒以前的图像。",
        "keywords": [
          "timestamp skew",
          "oldest age",
          "pivot queue",
          "same clock"
        ],
        "reference": "近似同步约束输入间的时间差，不约束它们距当前决策多久。必须同时检查skew与最旧观测年龄，验证同一时钟域；队列可以给出相互对齐但整体陈旧的一组输入。"
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
          "id": "ticknew",
          "label": "OmniGibson 禁用多tick渲染以避免卡死 · 延伸阅读",
          "url": "https://github.com/StanfordVL/BEHAVIOR-1K/commit/e5aad1d66a497cf17ad3e3bbcf628022a187dc70",
          "reading": "实读kit配置supportMultiTickRate=false及故障说明：新view定时sensor路径导致长停，不能以平均read耗时替代尾部诊断；未实跑RTX。"
        }
      ]
    },
    "insight": {
      "title": "RAW、大模型与动作队列：以长尾预算选择部署路线",
      "minutes": 25,
      "prerequisites": "理解串行总和、流水吞吐、观测年龄与失约率。",
      "connection": "将本日预算传给11月12日rate limit/低通实验，避免只追平滑忽略滞后。",
      "intro": "算力升级、队列策略和传感器选择，都应在同一条年龄与任务证据链上比较。",
      "outcomes": [
        "估算队列积压的增长",
        "比较FIFO与最新样本策略",
        "为双路线规划设置时延证据"
      ],
      "sections": [
        {
          "heading": "01 带宽优势和时间成本同时入账",
          "body": "RAW可保留更多动态范围和低层信息，但分辨率、位深、解码与传输会改变链路成本。教学设RGB输入处理8ms、RAW处理18ms，若其余25ms不变，总年龄从33ms升至43ms；以0.2m/s目标上界计算，单这10ms就增加2mm陈旧误差。数字只是预算假设，必须用真实采集配置验证。\n\n不能因此预先排除RAW，因为暗场定位改善也可能超过2mm；应固定曝光条件、模型预算、控制语义和试验初态，同时报告定位误差与年龄分布。用户的画质经验适合设计这种分解实验：先找饱和/运动模糊造成的误差，再量化每项处理引入多少等待。",
          "sourceIds": [
            "so",
            "mr"
          ],
          "formulas": [
            {
              "latex": "\\Delta e_{\\rm stale}\\leq v_{\\max}\\Delta L=0.2\\times0.010=0.002\\ {\\rm m}",
              "explanation": "ΔL是RAW路线新增年龄秒数，v为目标速度上界；此处只给陈旧误差增量上界，不能直接与不相关的定位均方误差相减来承诺净收益。"
            }
          ]
        },
        {
          "heading": "02 FIFO可以保序也可以不断积压",
          "body": "若输入30Hz而推理20Hz，每秒多十帧待处理。理想确定性连续流且无丢弃时，两秒后约积压二十帧，按消费者50ms每帧计相当于一秒服务工作量；这不是简单由模型单次50ms就能描述的系统。内存队列足够大只会延后暴露故障。\n\n最新样本策略可丢弃旧图减少等待，但会改变训练时的时间间隔、动作chunk起点和多相机配对。FIFO适合需要完整顺序的离线回放，实时决策可能更重视年龄；两者选择应由任务容差与可观测证据决定。丢弃必须记录，不能静默把跳帧后的数据当固定30Hz。",
          "sourceIds": [
            "ros"
          ],
          "formulas": [
            {
              "latex": "B(t)\\approx\\max(0,(f_{\\rm in}-f_{\\rm out})t),\\quad W(t)\\approx {B(t)\\over f_{\\rm out}}",
              "explanation": "B为理想流体近似的积压帧数，W为服务工作量秒数；忽略启动边界和抖动，不是实际某帧等待的精确公式，稳定性需长期输入率不超过可用处理率。"
            }
          ]
        },
        {
          "heading": "03 快慢模型必须共享有期限的状态",
          "body": "World Labs空间资产可作较慢更新的环境上下文，StanfordVL仿真则有明确物理step；不能用场景重建完成时间冒充控制帧时间。空间上下文过期或相机外参变化时，要标记失效并退回可验证的局部观测，而非继续无条件复用世界坐标。\n\nMeta/FAIR动作条件JEPA规划可在较慢频率提出候选，快速执行端仍需知道候选依据的观测、动作版本和有效区间。AMI当前方向提供研究问题但没有本课可直接部署的保证。检查预测代价下降的同时，应报告规划等待和执行时预测年龄，否则更准的长规划也可能错过抓取窗口。",
          "sourceIds": [
            "atlas",
            "behavior",
            "jepa",
            "ami"
          ]
        },
        {
          "heading": "04 用固定预算比较升级是否值得",
          "body": "对Mac推理与云端推理分别测同一trace定义；云GPU模型计算更快可能被网络排队和传输尾部抵消。先在离线日志中比较总年龄、失约、丢弃与动作有效性，再由学习者另行安排受控设备验证，本任务不连接机械臂也不上传客户数据。\n\n建议一张候选表同时列模型、传感器配置、队列策略、p50/p95/p99、最大年龄和任务失败原因。若某候选只降低均值却增加超期，不能直接晋级；若缩小输入改善年龄却损失反光物定位，应按分层任务复核。下一日加平滑器后重新计量，不能沿用未滤波的时间预算。",
          "sourceIds": [
            "r2s",
            "so"
          ]
        },
        {
          "heading": "05 RTC为何冻结已经承诺的前缀",
          "body": "RTC论文第3节在新chunk生成期间继续执行旧chunk，把必将执行的前缀作为强条件，再对较远重叠段施加渐弱约束。其目的在于减少跨chunk模式切换，同时保留更新后续动作的机会；简单平均两条绕障路径并无同样保证。\n\n部署审计应把不可修改前缀长度与延迟估计绑定，不能只把旧队列清空就称为RTC。本课队列模型尚未实现flow guidance、软mask或互斥调度，论文方法属于延伸阅读；是否改善SO-101须另作同任务实测，不能挪用作者机器人结果。",
          "sourceIds": [
            "rtc"
          ]
        }
      ],
      "points": [
        "估算队列积压的增长",
        "比较FIFO与最新样本策略",
        "为双路线规划设置时延证据"
      ],
      "codeTitle": "RAW、大模型与动作队列：以长尾预算选择部署路线 · 纯内存教学夹具",
      "code": "def backlog(fin,fout,seconds):\n    if fin<=0 or fout<=0 or seconds<0:\n        raise ValueError(\"invalid rates\")\n    b=max(0.,(fin-fout)*seconds)\n    return b,b/fout\nassert backlog(30,20,2)==(20,1)\nassert backlog(20,30,2)==(0,0)\nassert abs(.2*(.043-.033)-.002)<1e-12\nfor args in ((30,0,2),(30,20,-1)):\n    try:\n        backlog(*args)\n        raise AssertionError(\"invalid queue accepted\")\n    except ValueError: pass\n",
      "codeNotes": [
        "backlog为流体近似，说明过载增长趋势；没有模拟消息调度和离散启动边界。",
        "正例比较30→20Hz积压与余量，负例拒绝零服务率和负时长；全部数据为教学假设。"
      ],
      "exercise": {
        "prompt": "云端推理从30ms降到10ms，却多了40ms网络等待，总年龄如何变化？",
        "steps": [
          "固定其他阶段后比较增减。",
          "说明均值之外还要记录什么。"
        ],
        "solution": "计算节省20ms而等待增加40ms，总年龄净增加20ms。还需网络尾部、超时、丢弃、同任务失败与数据可用性；GPU计算更快不能单独证明部署更实时。"
      },
      "quiz": {
        "question": "把队列扩大十倍为何不能解决30Hz输入与20Hz推理不匹配？",
        "hint": "思考长期到达与服务之差。",
        "keywords": [
          "arrival rate",
          "service rate",
          "backlog growth",
          "latest sample"
        ],
        "reference": "长期每秒积压十帧，扩容只能容纳更多陈旧输入。应减少输入或提高可用服务率，或按合同丢弃旧样本并记录跳帧；最新策略还须检查模态对齐和动作时间间隔。"
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
