import type { AuthoredDay } from './types';

export const day70: AuthoredDay = {
  "reviewedAt": "2026-11-05",
  "revision": "逐课编写 1.0",
  "deliverable": "公开/隐藏实例 manifest、谓词 Q 与二元成功双指标、保留失败分母的汇总器和同实例 sim-real 配对复核表。每日 35+40+25=100 分钟。",
  "question": {
    "title": "策略 A 的平均 Q 高于 B，为什么仍不能断言 A 在 SO-101 上迁移更成功？",
    "summary": "分清部分完成、完整成功、输入特权和真实配对证据。",
    "keywords": [
      "predicate Q",
      "binary success",
      "hidden instance",
      "paired evaluation",
      "failure denominator"
    ],
    "reference": "Q 是终局目标谓词满足比例，可能奖励大量部分完成而完整任务全失败；它不是 SO-101 真机成功率。应在冻结 checkpoint、动作语义、观测权限和超时下，用相同未见实例各运行预定次数，报告 Q、完整成功、延迟与介入，失败不丢弃；仿真与真机按任务条件配对验证策略排序及失败区域。公开实例用于开发，隐藏实例不得反复调参。"
  },
  "lessons": {
    "foundation": {
      "title": "BEHAVIOR 评测协议：部分完成分、完整成功和隐藏实例",
      "minutes": 35,
      "prerequisites": "理解 BDDL 初始/目标谓词、11 月 8 日来源切分与训练目标，能计算均值和比例。",
      "connection": "混合数据配比只是候选方案，本课定义如何判断其收益；完成仿真单元后将进入位置/速度控制与部署合同。",
      "intro": "评测首先是一份实验协议，其次才是一段计算平均数的脚本。任务定义、允许观测、实例身份、时间预算、失败记账和结果聚合共同决定数字的含义。",
      "outcomes": [
        "推导 Q 与二元成功之间的差别",
        "区分实例内平均与任务宏平均",
        "规定公开开发和隐藏验收边界"
      ],
      "sections": [
        {
          "heading": "01 终局谓词比例不等于完整任务成功",
          "body": "在一个教学搬运任务里，目标可写为杯子在托盘内、抽屉关闭、桌面无水渍等谓词。若四个目标满足三个，部分完成 Q=0.75；完整成功仍为零。真实 BDDL 可包含逻辑结构与多个可选目标满足方案，不能直接把任意自然语言句子拆成同等权重项冒充官方任务计算。\n\n官方页面将终局目标满足比例作为主指标，并在任务间平均。教学中先用固定平坦合取目标建立直觉：谓词数量 m 不为零，终局每项只能是已确定真或假。未知传感器判断必须单列 missing/uncertain，不能悄悄当成功；真实部署还需稳定保持和容差，避免瞬间经过目标姿态便算完成。",
          "sourceIds": [
            "rules"
          ],
          "formulas": [
            {
              "latex": "Q_i=\\frac1{m_i}\\sum_{j=1}^{m_i}\\mathbf 1[g_{ij}(s_T)],\\qquad S_i=\\prod_{j=1}^{m_i}\\mathbf 1[g_{ij}(s_T)]",
              "explanation": "i 是实例，m_i 是本教学平坦合取目标的谓词数，g 是终局真假判定；Q 描述进展，S 只在全部满足时为一，复杂 BDDL 不由该简化公式完整覆盖。"
            }
          ]
        },
        {
          "heading": "02 一个反例解释为什么必须同时报两者",
          "body": "设 A 在两个实例上各完成四项中的三项，Q 为 0.75、0.75，完整成功为 0、0。B 在一例全部完成，另一例完成一项，Q 为 1、0.25，平均 0.625，但完整成功率为 0.5。A 的部分进展更高，B 的任务完成概率更高，两者回答不同问题。\n\n对 SO-101 杯子放置，安全与任务成功还可能分离：杯子到了目标区但撞倒邻物，不能仅凭位置目标给出可部署结论。评测协议应提前写明碰撞、越界、人工接管与超时如何记账；不要看到结果后临时增加或删减谓词。延迟和效率在主任务满足后才有正确解释，快速失败不应赢过稍慢的完成。",
          "sourceIds": [
            "rules",
            "score"
          ]
        },
        {
          "heading": "03 任务宏平均保护长尾任务的权重",
          "body": "假设任务甲有十个实例，平均 Q=0.9；任务乙只有两个实例，平均 Q=0.1。按全部十二个实例微平均得到 0.7667，按两个任务宏平均得到 0.5。若想比较对任务族的均衡能力，宏平均更贴近“每个任务同等重要”；若部署需求有明确频率，可另报加权部署分，但必须写明权重来源。\n\n官方汇总固定每任务实例分母，再按任务平均。缺文件不应导致自动缩小分母，否则把困难失败实例遗漏掉就能提高成绩。课堂验证器选择对缺测直接拒绝出报告；正式评测器若将失败置零，应保留失败原因和完整计数。开发侧与官方计分行为要明确区分，不能把本地更严格的报错称为官方规则。",
          "sourceIds": [
            "score"
          ],
          "formulas": [
            {
              "latex": "\\overline Q=\\frac1K\\sum_{k=1}^K\\frac1{n_k}\\sum_{i=1}^{n_k}Q_{ki}",
              "explanation": "K 是预注册任务数，n_k 是预注册实例数；分母来自协议，不能根据返回了多少成功日志动态决定。"
            }
          ]
        },
        {
          "heading": "04 公开实例用于调试，隐藏实例用于一次冻结验收",
          "body": "BEHAVIOR 页面区分公开与隐藏实例，并禁止从重复 rollout 中按实例挑最好结果。公开排名反馈本身也可能被反复利用，成为隐性训练信号；因此应先在开发集合选择模型，再冻结模型、配置和 seed 计划，最后在未参与选择的条件上运行。\n\n教学 SO-101 项目可以按物体、摆放和采集 session 构造公开开发/私有验收列表，隐藏是实验隔离而非数据保密宣传。一次小样本结果仍存在随机性；可以预先规定多轮完整运行并全部报告，但不能把它混作挑战要求的每实例单 rollout 提交。来自 StanfordVL 的比赛成绩与 World Labs 的迁移主张也必须各自说明任务与协议。",
          "sourceIds": [
            "updates",
            "r2s"
          ]
        }
      ],
      "points": [
        "Q 衡量部分进展，完整成功率衡量整项完成。",
        "聚合分母由预注册协议固定。",
        "隐藏评测前冻结 checkpoint 与配置。"
      ],
      "codeTitle": "predicate_scores.py · Q 与完整成功的反例",
      "code": "def scores(flags):\n    if not flags or any(type(x) is not bool for x in flags):\n        raise ValueError(\"known boolean goals required\")\n    return sum(flags)/len(flags), int(all(flags))\na = [scores([True, True, True, False])]*2\nb = [scores([True]*4), scores([True, False, False, False])]\nmean = lambda rows, j: sum(x[j] for x in rows)/len(rows)\nassert mean(a, 0) == .75 and mean(b, 0) == .625\nassert mean(a, 1) == 0 and mean(b, 1) == .5\nfor bad in ([], [True, None], [1, 0]):\n    try:\n        scores(bad)\n        raise AssertionError(\"uncertain goals accepted\")\n    except ValueError:\n        pass\n",
      "codeNotes": [
        "仅实现平坦合取目标，未实现 BDDL 多目标选项、时序谓词或状态检测。",
        "负例拒绝空列表、未知值和整数伪布尔；防止空合取被 all([]) 误判为成功。"
      ],
      "exercise": {
        "prompt": "任务甲均分 0.9/10 例、乙均分 0.1/2 例，分别计算宏平均和微平均。",
        "steps": [
          "先计算每任务均分。",
          "解释缺失乙任务失败日志时分母为何不能变小。"
        ],
        "solution": "宏平均 (0.9+0.1)/2=0.5；微平均 (9+0.2)/12≈0.7667。两个指标任务权重不同；缺日志应拒绝报告或按事先规定记失败，不得缩小预注册分母并把已观测子集伪装成完整评测。"
      },
      "quiz": {
        "question": "A 平均 Q=0.75 但成功率零，B 平均 Q=0.625 但成功率一半，哪个指标应报告？",
        "hint": "两个结论可以同时成立。",
        "keywords": [
          "partial completion",
          "binary success",
          "goal conjunction",
          "metric definition"
        ],
        "reference": "两项都报告并说明任务需求。A 更稳定完成部分步骤，B 更可能完整完成；不能用 Q 的排序替代完整成功排序。应保留逐实例终局谓词与失败原因，部署还需安全、介入和时间指标。"
      },
      "sources": [
        {
          "id": "rules",
          "label": "StanfordVL BEHAVIOR 2026 Evaluation and Rules",
          "url": "https://behavior.stanford.edu/challenge/evaluation.html",
          "reading": "2026-11-05 实读 Challenge Track、Running Evaluations、Metrics、Evaluation Protocol：公开/隐藏索引、单次 rollout、谓词比例与超时；页面的索引文字与最终实例数应以固定源码和具体比赛版本核对。"
        },
        {
          "id": "score",
          "label": "BEHAVIOR compute_final_q_score 固定提交",
          "url": "https://github.com/StanfordVL/BEHAVIOR-1K/blob/362127ee441b1e6d806351c2dd811e9d09ae363b/OmniGibson/omnigibson/eval/utils/score_utils.py",
          "reading": "实读 compute_final_q_score：构造允许文件名、每实例一个 rollout、固定实例分母、逐任务再宏平均；另报告 Q=1 的任务成功率，不把 Q 与二元成功混同。"
        },
        {
          "id": "evaluator",
          "label": "BEHAVIOR Evaluator 固定提交",
          "url": "https://github.com/StanfordVL/BEHAVIOR-1K/blob/362127ee441b1e6d806351c2dd811e9d09ae363b/OmniGibson/omnigibson/eval/evaluator.py",
          "reading": "实读 resolve_instance_ids、Evaluator.run 内 record_fn、失败处理；公共/隐藏模式分别映射实际 ID，连接/策略/超时失败置零并保留 failure_reason。此 main 固定提交仅供代码精读，正式挑战页仍要求 v3.9.3，不能混版本报成绩。"
        },
        {
          "id": "updates",
          "label": "BEHAVIOR Challenge Updates",
          "url": "https://behavior.stanford.edu/challenge/updates.html",
          "reading": "实读 10/09/2026 no cherry-picking、per-step timeout、重连和单次结果规定；非今日新发布。"
        },
        {
          "id": "r2s",
          "label": "World Labs R2S2R",
          "url": "https://www.worldlabs.ai/blog/real-to-sim-to-real",
          "reading": "核对仿真预测真实策略相对表现与失败区域的主张；用作设计配对复核，不把网页宣称当本地实测。"
        },
        {
          "id": "jepa",
          "label": "Meta/FAIR V-JEPA 2 官方页",
          "url": "https://ai.meta.com/research/vjepa/",
          "reading": "核对视频表征、物理理解和动作条件规划各自评测，不能用 latent loss 替代机器人闭环成功。"
        },
        {
          "id": "ami",
          "label": "AMI Labs 官方组织方向",
          "url": "https://amilabs.xyz/",
          "reading": "当前公开方向为抽象表征预测、动作条件规划与安全；尚无本课评测器实现归属于 AMI。"
        },
        {
          "id": "simToday",
          "label": "LeRobot 当日模拟核心与 RoboLab 集成延伸",
          "url": "https://github.com/huggingface/lerobot/commit/16d50416981dce02d92603b2fb0f532b3a62bc6b",
          "reading": "2026-11-05 原始提交；与 d100b030 合簇，实读 vector_env_fns 和默认禁自动 reset 合同，属选读，不改变本日 BEHAVIOR 主线和正式版本。"
        },
        {
          "id": "bpaper",
          "label": "BEHAVIOR-1K 原论文 v1",
          "url": "https://arxiv.org/html/2403.09227v1",
          "reading": "实读6.1物理抓取消融、6.2真实Tiago/模拟差距与F.5 Q指标；相机动态范围、纹理反射及理想定位假设导致的失败只归论文任务，不外推 SO-101。"
        }
      ]
    },
    "code": {
      "title": "评测源码精读：实例映射、失败置零与固定分母汇总",
      "minutes": 40,
      "prerequisites": "理解本日 Q/成功率定义，能读 Python 字典、集合和异常处理。",
      "connection": "基础课定义协议，本课追踪它如何变成日志与分母；路线课将把仿真汇总连接真实配对复核，而非单凭榜单选模型。",
      "intro": "一个分数能否相信，往往取决于没有成功返回的那些实例怎样处理。沿真实 evaluator 的实例选择、rollout 记账与 score 汇总读下去，可以看到网络失败、超时和丢日志都属于测量系统的一部分。",
      "outcomes": [
        "定位实例索引到实际 ID 的映射",
        "解释 record_fn 的 failure_reason 与 Q=0",
        "编写拒绝缺失和重复实例的离线汇总器"
      ],
      "sections": [
        {
          "heading": "01 固定提交与比赛版本各自记录",
          "body": "本课读 362127ee 固定提交中的 eval/evaluator.py 和 eval/utils/score_utils.py；正式 Challenge 页面仍要求 v3.9.3。因此这里讲当前实现的数据流，不能拿 main 版日志直接冒充规定 tag 的比赛结果。manifest 必须保存 repo SHA、资产版本、配置哈希和 policy checkpoint，升级后应重新验收。\n\nresolve_instance_ids 先检查 mode，再从公共或隐藏列表取相应切片，最后用用户提供的实例索引映射实际实例 ID。索引零只是某 split 的第一项，并不是永恒的世界身份。比较两个实验时应校验 split 与实际 ID，而非只看命令行都写了 instance-indices 0。",
          "sourceIds": [
            "evaluator",
            "rules"
          ]
        },
        {
          "heading": "02 失败必须经过与成功同样完整的记账",
          "body": "Evaluator.run 内 record_fn 保存 task、instance_id、rollout_id、steps、success 等字段，按 connection、timeout 和 policy failure 分类。出现这些失败时 q_score.final 被置零，failure_reason 被保留；这防止策略因网络异常逃避困难样本。已产生的 metric 可保留用于诊断，但提交评分依照明确的失败规则。\n\n课堂汇总器使用更小的内存 schema：task、instance、run、q、failure。q 为正常终局部分分，failure 非空时覆盖为零。它只展示审计机制，不执行 websocket、模拟器或真实机械臂；尤其不能把异常捕获后 continue 掉整行，否则失败分母消失，系统稳定性问题会被“平均成功分”遮住。",
          "sourceIds": [
            "evaluator"
          ]
        },
        {
          "heading": "03 固定分母与重复日志是两道不同门",
          "body": "compute_final_q_score 构造允许的文件名集合，按 task 和 instance_rollout 保存结果，逐任务除以固定 n_instances_per_task，再对任务宏平均。值得注意的是，只读已有 JSON 与固定分母会使缺文件贡献零，但无法告诉你缺文件是实际失败还是归档问题，所以开发报告还应检查完整性。\n\n教学实现要求每个预注册实例恰好一条记录，缺失、额外、重复或非有限 Q 都拒绝出分。这样错误在报告前暴露。若相同实例出现两个不同 run 的候选结果，不能自动取 max；协议若允许完整重复运行，应按 run 分组各自生成完整报告，再整体比较，不能拼接最佳实例。",
          "sourceIds": [
            "score",
            "updates"
          ]
        },
        {
          "heading": "04 形状、时间与权限也属于汇总的前提",
          "body": "真实策略返回 action 向量或 chunk，轴含义要与 robot.action_dim 和控制器单位一致；不同 chunk 长度可能改变重规划频率。官方说明首查询、后续查询、重连和仿真步各自如何计时，因此对比只报模型 forward latency 不够，需要保存端到端 accounted time 与实际执行步数。\n\n观测限制必须在 wrapper 处核对：RGB、depth、本体状态是比赛允许输入，真实 object pose 或 segmentation 等特权状态不能偷偷进入 policy。评分器可以读取终局真值判成功，policy 不可以，这两条数据流要分开审计。教学代码不实现该权限边界，只提供预注册记录的离线完整性检查。",
          "sourceIds": [
            "rules",
            "evaluator"
          ]
        }
      ],
      "points": [
        "固定 split 还需核对实际实例 ID。",
        "失败置零并保留原因，缺测拒绝发布报告。",
        "完整运行之间比较，不拼最佳实例。"
      ],
      "codeTitle": "audited_q_report.py · 预注册离线汇总器",
      "code": "import math\n\ndef report(expected, rows):\n    seen = {}\n    for r in rows:\n        key = (r[\"task\"], r[\"instance\"])\n        if key not in expected or key in seen or r[\"run\"] != 0:\n            raise ValueError(\"unexpected, duplicate or nonregistered run\")\n        q = r[\"q\"]\n        if not math.isfinite(q) or not 0 <= q <= 1:\n            raise ValueError(\"invalid score\")\n        seen[key] = 0.0 if r[\"failure\"] else q\n    if set(seen) != set(expected) or not expected:\n        raise ValueError(\"incomplete evaluation\")\n    tasks = sorted({t for t, _ in expected})\n    per_task = {t: sum(v for (k, _), v in seen.items() if k == t)/\n                   sum(k == t for k, _ in expected) for t in tasks}\n    return sum(per_task.values())/len(tasks)\nexpected = {(\"pick\", 10), (\"pick\", 11), (\"place\", 20)}\nrows = [dict(task=t, instance=i, run=0, q=q, failure=f)\n        for t,i,q,f in [(\"pick\",10,1,None),(\"pick\",11,.8,\"timeout\"),(\"place\",20,.25,None)]]\nassert report(expected, rows) == .375\nfor bad in (rows[:-1], rows+[rows[0]], [dict(r, run=1) for r in rows]):\n    try:\n        report(expected, bad)\n        raise AssertionError(\"invalid manifest accepted\")\n    except ValueError:\n        pass\n",
      "codeNotes": [
        "expected 是本地预注册集合；每个实例一条 run=0 记录，拒绝重复、缺测、越界及无穷分数。",
        "pick 的超时例覆盖为零，因此任务均分 .5；place 为 .25，宏平均 .375。",
        "这是比上游文件读取更严格的教学审计器，未冒充官方提交工具，也未实现模拟器终止逻辑。"
      ],
      "exercise": {
        "prompt": "若遗漏 pick/11 超时日志，按现有日志平均会得到多少，为什么错误？",
        "steps": [
          "计算两个任务基于现有日志的均分。",
          "在代码中删掉该行，确认拒绝出分。"
        ],
        "solution": "pick 会被错误记为 1，place 为 .25，宏平均 .625，高于完整记录的 .375；问题来自丢失失败分母。教学 report 会抛 incomplete evaluation，要求补回显式失败记录后才能报告。"
      },
      "quiz": {
        "question": "为什么 instance index 相同仍不能证明两轮用了相同世界初态？",
        "hint": "索引经过哪张列表映射？",
        "keywords": [
          "split mapping",
          "instance identity",
          "asset version",
          "checkpoint freeze"
        ],
        "reference": "索引只是公共或隐藏实例列表中的位置；列表、资产版本或 reset 配置变化都会改变实际初态。需保存实际 ID、split、源码 SHA、资产与配置哈希及 checkpoint，再确认两个实验使用一致条件。"
      },
      "sources": [
        {
          "id": "rules",
          "label": "StanfordVL BEHAVIOR 2026 Evaluation and Rules",
          "url": "https://behavior.stanford.edu/challenge/evaluation.html",
          "reading": "2026-11-05 实读 Challenge Track、Running Evaluations、Metrics、Evaluation Protocol：公开/隐藏索引、单次 rollout、谓词比例与超时；页面的索引文字与最终实例数应以固定源码和具体比赛版本核对。"
        },
        {
          "id": "score",
          "label": "BEHAVIOR compute_final_q_score 固定提交",
          "url": "https://github.com/StanfordVL/BEHAVIOR-1K/blob/362127ee441b1e6d806351c2dd811e9d09ae363b/OmniGibson/omnigibson/eval/utils/score_utils.py",
          "reading": "实读 compute_final_q_score：构造允许文件名、每实例一个 rollout、固定实例分母、逐任务再宏平均；另报告 Q=1 的任务成功率，不把 Q 与二元成功混同。"
        },
        {
          "id": "evaluator",
          "label": "BEHAVIOR Evaluator 固定提交",
          "url": "https://github.com/StanfordVL/BEHAVIOR-1K/blob/362127ee441b1e6d806351c2dd811e9d09ae363b/OmniGibson/omnigibson/eval/evaluator.py",
          "reading": "实读 resolve_instance_ids、Evaluator.run 内 record_fn、失败处理；公共/隐藏模式分别映射实际 ID，连接/策略/超时失败置零并保留 failure_reason。此 main 固定提交仅供代码精读，正式挑战页仍要求 v3.9.3，不能混版本报成绩。"
        },
        {
          "id": "updates",
          "label": "BEHAVIOR Challenge Updates",
          "url": "https://behavior.stanford.edu/challenge/updates.html",
          "reading": "实读 10/09/2026 no cherry-picking、per-step timeout、重连和单次结果规定；非今日新发布。"
        },
        {
          "id": "r2s",
          "label": "World Labs R2S2R",
          "url": "https://www.worldlabs.ai/blog/real-to-sim-to-real",
          "reading": "核对仿真预测真实策略相对表现与失败区域的主张；用作设计配对复核，不把网页宣称当本地实测。"
        },
        {
          "id": "jepa",
          "label": "Meta/FAIR V-JEPA 2 官方页",
          "url": "https://ai.meta.com/research/vjepa/",
          "reading": "核对视频表征、物理理解和动作条件规划各自评测，不能用 latent loss 替代机器人闭环成功。"
        },
        {
          "id": "ami",
          "label": "AMI Labs 官方组织方向",
          "url": "https://amilabs.xyz/",
          "reading": "当前公开方向为抽象表征预测、动作条件规划与安全；尚无本课评测器实现归属于 AMI。"
        },
        {
          "id": "simToday",
          "label": "LeRobot 当日模拟核心与 RoboLab 集成延伸",
          "url": "https://github.com/huggingface/lerobot/commit/16d50416981dce02d92603b2fb0f532b3a62bc6b",
          "reading": "2026-11-05 原始提交；与 d100b030 合簇，实读 vector_env_fns 和默认禁自动 reset 合同，属选读，不改变本日 BEHAVIOR 主线和正式版本。"
        },
        {
          "id": "bpaper",
          "label": "BEHAVIOR-1K 原论文 v1",
          "url": "https://arxiv.org/html/2403.09227v1",
          "reading": "实读6.1物理抓取消融、6.2真实Tiago/模拟差距与F.5 Q指标；相机动态范围、纹理反射及理想定位假设导致的失败只归论文任务，不外推 SO-101。"
        }
      ]
    },
    "insight": {
      "title": "从仿真榜单到 SO-101：迁移需要配对排序和失败区域证据",
      "minutes": 25,
      "prerequisites": "理解本日宏平均、完整成功、失败记账与 11 月 6 日真实锚点。",
      "connection": "本课收束仿真单元，输出候选策略验证计划；11 月 10 日将把控制器动作语义落实到位置、速度与末端控制。",
      "intro": "仿真成绩解决的是特定模拟协议里的比较。要让它帮助现实决策，还需要证明在仿真中更好的候选，在真实条件下也更好，并且相同弱点能被提前暴露。",
      "outcomes": [
        "计算候选排序的一致性与反例",
        "区分仿真筛选和真实验收成本",
        "给双团队路线选择不同终点证据"
      ],
      "sections": [
        {
          "heading": "01 高相关必须来自多个候选而非一个成功视频",
          "body": "World Labs R2S2R 页提出用模拟预测真实策略相对表现和失败区域。这是可测试主张：对一组冻结候选，用同一组任务条件分别测模拟和真实分数，比较排序。只有一个策略在两个域都成功，无法证明排序预测；只有挑出的成功片段，也无法看到错误的置信程度。\n\n教学例三候选 A/B/C 的仿真分为 .9/.8/.6，真实为 .6/.8/.5。仿真把 A 排在 B 前，真实相反；三对候选中只有 A-C 与 B-C 排序一致，一致率为 2/3。数值很小，不能据此给出统计显著结论，但足以反驳“仿真第一自然是真机第一”的推断。",
          "sourceIds": [
            "r2s"
          ],
          "formulas": [
            {
              "latex": "C=\\frac{\\sum_{i<j}\\mathbf 1[(s_i-s_j)(r_i-r_j)>0]}{\\#\\{(i,j):i<j,\\ (s_i-s_j)(r_i-r_j)\\ne0\\}}",
              "explanation": "s 与 r 分别为同候选的模拟/真实分数；此教学一致率剔除任一域平局，必须同时报告有效对数与平局数，不是正式显著性检验。"
            }
          ]
        },
        {
          "heading": "02 失败区域对齐比平均分更能指导改进",
          "body": "按光照、物体位置、摩擦和拥塞等条件形成网格，标记每个域的失败集合。若模拟只在边缘位置失败、真实只在暗场失败，均分即使接近也说明诊断机制不一致。用户可以利用传感器经验检查真实失败是否来自饱和、时间不同步和深度缺失，而非盲目增加策略参数。\n\n失败集合可用交并比粗略比较，但集合为空时应标记没有可诊断失败，而非自动给出完美匹配；两域试验条件必须对应。真实表面材料无法从 RGB 直接推断时，模拟摩擦扫描只能生成假设，还需安全离线日志或学习者另行开展受控试验。此自动化只写协议、运行内存夹具，不接设备执行。",
          "sourceIds": [
            "r2s",
            "rules"
          ]
        },
        {
          "heading": "03 筛选节省的是真实候选预算，不能免掉验收",
          "body": "若十个候选每个计划二十次真实试验，直接比较需要二百次。先在模拟筛出三个，再做六十次真实试验，名义上节约一百四十次；但前提是筛选召回足够，不会系统性淘汰真实最佳。应留一个模拟低分候选作反证对照，并定期回查筛选偏差。\n\n在 Mac 加租用 4090 的预算下，先用小模型和少量任务做候选级验证更实际；不要为了追排行榜复刻巨大的家庭场景全基准。SO-101 可用桌面任务，但必须说明它不覆盖 BEHAVIOR 的移动、长程多物体和液体交互；迁移结论只针对测试过的任务族和条件，不写成家庭通用智能。",
          "sourceIds": [
            "rules",
            "r2s"
          ]
        },
        {
          "heading": "04 双路线用不同中间证据汇合到同一闭环",
          "body": "StanfordVL 的 BEHAVIOR 用任务谓词和隐藏实例规范“做成什么”；World Labs 的空间生成与 R2S2R 检验“世界能否支持交互与预测迁移”。二者可以共享任务定义，却不能把一个组织的生成质量或产品演示填进另一个组织的评测分母。课后表格应分别列输入、动作接口、预测输出与终点证据。\n\nMeta/FAIR V-JEPA 的视频表征/物理探针和动作条件规划也需分开：预测 embedding 的误差只是中间证据，最终需在同观测、同动作预算下比较闭环。AMI 当前提出表征空间预测与安全规划方向，未给公开实现就只作为研究问题追踪。对 RAW 项目可先测冻结表征在曝光变化下的稳定性，再问它是否改善动作成功，不把特征漂亮当作控制有效。",
          "sourceIds": [
            "jepa",
            "ami",
            "r2s"
          ]
        },
        {
          "heading": "05 原论文的反例：逼真画面仍有感知与执行差距",
          "body": "BEHAVIOR-1K 原论文第 6.2 节在模拟公寓与真实 Tiago 上分解了视觉策略和动作 primitive 的失败来源；相机动态范围、纹理和反射不匹配，以及真实抓取困难，都可能让逼真的重建无法形成可靠迁移。这是论文特定系统的诊断，不是今天 SO-101 的实测结果，也不是 World Labs 的实验。\n\n用户的感知经验可以把这个问题转成清晰的复核计划：固定控制器和对象，按曝光、表面反射与位姿分层检查观测，再把正确感知下仍失败的样本归到执行链。若模拟假设完美定位，真实导航偏差还会传到抓取起点；桌面 SO-101 虽无移动底盘，外参误差也可产生类似的错误传播，应另测而非照搬论文数字。",
          "sourceIds": [
            "bpaper"
          ]
        }
      ],
      "points": [
        "多个冻结候选才能检验排序预测。",
        "按失败条件对齐，防止均值遮蔽域差。",
        "模拟筛选仍需真实复核和反证候选。"
      ],
      "codeTitle": "paired_ranking.py · 排序与失败集合反例",
      "code": "from itertools import combinations\n\ndef concordance(sim, real):\n    if set(sim) != set(real) or len(sim) < 2:\n        raise ValueError(\"paired candidates required\")\n    products = [(sim[a]-sim[b])*(real[a]-real[b])\n                for a,b in combinations(sim, 2)]\n    active = [p for p in products if p != 0]\n    if not active: raise ValueError(\"no comparable pairs\")\n    return sum(p > 0 for p in active)/len(active), len(active)\ns = dict(A=.9, B=.8, C=.6)\nr = dict(A=.6, B=.8, C=.5)\nc,n = concordance(s,r)\nassert abs(c-2/3) < 1e-12 and n == 3\nfs, fr = {\"edge\", \"dark\"}, {\"dark\", \"glare\"}\nassert len(fs & fr)/len(fs | fr) == 1/3\ntry:\n    concordance(s, dict(A=.6, B=.8))\n    raise AssertionError(\"unpaired accepted\")\nexcept ValueError:\n    pass\n",
      "codeNotes": [
        "concordance 是教学候选对一致率，平局剔除且报告有效对数；未实现置信区间与候选依赖处理。",
        "交并比例子显式给定条件集合，不能拿不同网格或缺测样本直接比较。"
      ],
      "exercise": {
        "prompt": "设计 SO-101 三候选、三种曝光条件的 sim-real 复核表，并说明一个反证候选。",
        "steps": [
          "固定候选 checkpoint、初态和任务成功条件。",
          "定义真实失败与模拟失败的对应关系。"
        ],
        "solution": "按候选×曝光×初始位置记录同任务的 Q、完整成功、介入和延迟；模拟低分但真实可能依赖 RAW 高动态优势的候选应保留，防止模拟传感器不足导致错误淘汰。只有在真实复核和失败机制均有证据后才决定是否使用模拟筛选。"
      },
      "quiz": {
        "question": "模拟与真实总体成功率相同，为什么仍可能完全无法预测失败？",
        "hint": "考虑两个不相交的失败条件集合。",
        "keywords": [
          "failure region",
          "paired condition",
          "ranking concordance",
          "sensor domain gap"
        ],
        "reference": "两个域可能失败数量相同但失败位置不同，例如模拟在边缘姿态失败、真实在暗场失败。总体均值一致只反映数量，不说明条件预测正确；需按对应条件比较失败集合和候选排序，并保留逐条件记录。"
      },
      "sources": [
        {
          "id": "rules",
          "label": "StanfordVL BEHAVIOR 2026 Evaluation and Rules",
          "url": "https://behavior.stanford.edu/challenge/evaluation.html",
          "reading": "2026-11-05 实读 Challenge Track、Running Evaluations、Metrics、Evaluation Protocol：公开/隐藏索引、单次 rollout、谓词比例与超时；页面的索引文字与最终实例数应以固定源码和具体比赛版本核对。"
        },
        {
          "id": "score",
          "label": "BEHAVIOR compute_final_q_score 固定提交",
          "url": "https://github.com/StanfordVL/BEHAVIOR-1K/blob/362127ee441b1e6d806351c2dd811e9d09ae363b/OmniGibson/omnigibson/eval/utils/score_utils.py",
          "reading": "实读 compute_final_q_score：构造允许文件名、每实例一个 rollout、固定实例分母、逐任务再宏平均；另报告 Q=1 的任务成功率，不把 Q 与二元成功混同。"
        },
        {
          "id": "evaluator",
          "label": "BEHAVIOR Evaluator 固定提交",
          "url": "https://github.com/StanfordVL/BEHAVIOR-1K/blob/362127ee441b1e6d806351c2dd811e9d09ae363b/OmniGibson/omnigibson/eval/evaluator.py",
          "reading": "实读 resolve_instance_ids、Evaluator.run 内 record_fn、失败处理；公共/隐藏模式分别映射实际 ID，连接/策略/超时失败置零并保留 failure_reason。此 main 固定提交仅供代码精读，正式挑战页仍要求 v3.9.3，不能混版本报成绩。"
        },
        {
          "id": "updates",
          "label": "BEHAVIOR Challenge Updates",
          "url": "https://behavior.stanford.edu/challenge/updates.html",
          "reading": "实读 10/09/2026 no cherry-picking、per-step timeout、重连和单次结果规定；非今日新发布。"
        },
        {
          "id": "r2s",
          "label": "World Labs R2S2R",
          "url": "https://www.worldlabs.ai/blog/real-to-sim-to-real",
          "reading": "核对仿真预测真实策略相对表现与失败区域的主张；用作设计配对复核，不把网页宣称当本地实测。"
        },
        {
          "id": "jepa",
          "label": "Meta/FAIR V-JEPA 2 官方页",
          "url": "https://ai.meta.com/research/vjepa/",
          "reading": "核对视频表征、物理理解和动作条件规划各自评测，不能用 latent loss 替代机器人闭环成功。"
        },
        {
          "id": "ami",
          "label": "AMI Labs 官方组织方向",
          "url": "https://amilabs.xyz/",
          "reading": "当前公开方向为抽象表征预测、动作条件规划与安全；尚无本课评测器实现归属于 AMI。"
        },
        {
          "id": "simToday",
          "label": "LeRobot 当日模拟核心与 RoboLab 集成延伸",
          "url": "https://github.com/huggingface/lerobot/commit/16d50416981dce02d92603b2fb0f532b3a62bc6b",
          "reading": "2026-11-05 原始提交；与 d100b030 合簇，实读 vector_env_fns 和默认禁自动 reset 合同，属选读，不改变本日 BEHAVIOR 主线和正式版本。"
        },
        {
          "id": "bpaper",
          "label": "BEHAVIOR-1K 原论文 v1",
          "url": "https://arxiv.org/html/2403.09227v1",
          "reading": "实读6.1物理抓取消融、6.2真实Tiago/模拟差距与F.5 Q指标；相机动态范围、纹理反射及理想定位假设导致的失败只归论文任务，不外推 SO-101。"
        }
      ]
    }
  }
};
