import type { AuthoredDay } from './types';

export const day84: AuthoredDay = {
  "reviewedAt": "2026-11-18",
  "revision": "逐课编写 1.0",
  "deliverable": "RL 三联诊断表：return/success/Q 的口径、无文件依赖的分层 SVG 图及身份拒绝测试、固定训练种子的配对故障定位方案。35+40+25=100 分钟。",
  "question": {
    "title": "两版策略平均回报从 4 升到 7，但明亮场景成功率均为 0.9、背光均为 0.3；背光占比从 75% 变成 25%。该如何诊断并安排下次实验？",
    "summary": "连接评测组成偏移、奖励口径、Q 的含义和单因素复验。",
    "keywords": [
      "0.45",
      "0.75",
      "0.6",
      "配对",
      "奖励",
      "Q"
    ],
    "reference": "旧总体成功率为 .25×.9+.75×.3=.45，新为 .75×.9+.25×.3=.75，增加30个百分点全部可以由组成解释；固定各半权重，两版均 .6。回报4到7还需查奖励定义、wrapper次序和回合长度，不能由成功率直接反推。Q要在同一状态动作探针和固定奖励折扣下对照；SAC软Q不能直接当原始任务回报。下次锁任务、相机、物理后端与checkpoint，分层固定初始状态，配对复验，并独立统计接管、超时和安全事件。"
  },
  "lessons": {
    "foundation": {
      "title": "RL 实验诊断：先给曲线定义分母",
      "minutes": 35,
      "prerequisites": "先完成 11 月 18 日 return/截断、19 日 Q、21 日 PPO 和22日 SAC；能区分采集步、梯度步与物理时间。",
      "connection": "昨天解释更新的目标，今天检查目标怎样变成可信证据；11月24日冻结 replay 后，继续用固定分布识别外推错误。",
      "intro": "在同一夹取任务中拆开训练回报、独立成功与固定探针 Q，构造曲线改善却没有机制改进的反例。",
      "outcomes": [
        "按任务、回合、训练种子定义统计单位",
        "手算组成偏移，并辨别Q误差与奖励缩放"
      ],
      "sections": [
        {
          "heading": "三条曲线各自回答什么",
          "body": "训练 return 是奖励沿实际轨迹的累计，回答优化器正在追逐的数字怎样变化。成功率则由独立的任务完成规则判定：物体必须进入盒内并保持，而非只接近盒口。Q 是对某个状态动作之后收益的预测，随策略和训练而动。将三个量画在同一页，是为了查它们的关系；它们的单位和分母应当各自保留，不能直接叠在同一个纵轴。\n\n本课教学设定中，成功回合奖励10，失败奖励0；加入每步接近奖励后，绕着盒口反复移动也可能赚分。于是回报上涨而成功不动首先提示检查奖励分项与时长。它也可能来自更容易的初态，或者探索噪声减少。上述都是待检验解释，只有固定条件的复验才能把它们分开；不能凭曲线形状认定策略钻漏洞。",
          "sourceIds": [
            "tips",
            "eval"
          ]
        },
        {
          "heading": "把组成偏移写进分母",
          "body": "设明亮与背光分别是两个预先定义的条件，先在各层算成功次数除回合数，再按固定权重合成。使用每版各自的采样比例，相当于同时改变策略和考试题。旧版在明亮占25%、新版占75%，即使两层成功率都保持90%与30%，总体仍会从45%变成75%。这30个百分点没有提供层内策略改善的证据。\n\n固定两层各半后，两版都为60%。这个权重是教学中指定的目标使用分布，应在看结果前登记；如果实际部署背光更常见，就应另报相应权重。某层没有回合时应报告缺项而非填零。每个训练种子先做这样的聚合，再比较种子间变化；几千步来自同一训练运行，不能当成几千次独立训练。",
          "sourceIds": [
            "tips"
          ],
          "formulas": [
            {
              "latex": "\\hat p_k=\\frac{1}{n_k}\\sum_{i=1}^{n_k}y_{ki},\\qquad \\hat p_{\\mathrm{std}}=\\sum_{k=1}^{K}w_k\\hat p_k,\\quad \\sum_k w_k=1",
              "explanation": "y 为回合成功位，n 是对应条件回合数；w 是事先确定的非负使用权重。标准化只消除已知组成差，不解决层内混杂或小样本误差。"
            }
          ]
        },
        {
          "heading": "Q 的绝对值必须放回奖励单位",
          "body": "若无限持续任务每拍奖励恒定为1，折扣0.9，真实环境Q为10；把奖励乘10，Q会变成100，策略可以完全没变。这解释了为何跨奖励版本比较Q均值没有意义。PPO的value依赖训练回报约定；SAC的软Q还含后续动作的熵项，不能拿原始未折扣的评测return直接相减。检查前先登记奖励版本、折扣、动作坐标和温度。\n\n训练批的TD残差小，表示模型贴近当前自举目标，不表示接近真实长期结果。两个头也可能在同一缺数据区域一起高估。诊断时固定一组状态和执行动作，观察两头分布、残差以及被策略新提出的动作；在可控仿真中用重复续跑估计相同策略下的收益。有限续跑有尾项，接管改变了行为策略，都要另做标记。",
          "sourceIds": [
            "sac"
          ],
          "formulas": [
            {
              "latex": "Q_c=\\sum_{t=0}^{\\infty}\\gamma^t c=\\frac{c}{1-\\gamma},\\qquad \\delta=y-Q(s,a)",
              "explanation": "c 是每决策拍奖励，γ小于1，Q_c与奖励同量纲；δ是当前自举目标减估值。恒定奖励反例只用于说明尺度，不含SAC熵奖励。"
            }
          ]
        },
        {
          "heading": "先重现，再定位突变发生在哪层",
          "body": "把异常时刻对齐到环境步、learner更新步、checkpoint、传感器和模拟器版本。若回报在更换曝光配置后突变而梯度统计稳定，先用同一checkpoint回放旧新观测；若只有Q爆炸，检查目标掩码、回放动作轴及归一化。原始信号和派生统计同时保留，滚动平均可能隐藏一次严重碰撞，不能承担安全验收。\n\n今天产出一张假设表：现象、可能原因、最小复验、排除条件各一列。对于RAW/RGB经验，优先区分饱和或运动模糊导致的观测失真与物理摩擦导致的执行失真。Mac上先跑本课数值反例即可；训练实验留给单4090预算，用少量预登记配置多种子复验，比先扫大网络更容易查清原因。",
          "sourceIds": [
            "tips",
            "hdr"
          ]
        }
      ],
      "points": [
        "分层再聚合，缺失层不补造。",
        "Q、奖励与熵必须同口径。",
        "统计突变是线索，固定条件复验才支持归因。"
      ],
      "codeTitle": "composition_shift.py · 固定权重反例",
      "code": "from math import isclose\n\ndef standardized(rates, weights):\n    if set(rates) != set(weights) or any(w < 0 for w in weights.values()):\n        raise ValueError('missing stratum or invalid weight')\n    if not isclose(sum(weights.values()), 1):\n        raise ValueError('weights must sum to one')\n    return sum(rates[k] * weights[k] for k in rates)\nrates = {'bright': .9, 'backlit': .3}\nassert isclose(standardized(rates, {'bright': .25, 'backlit': .75}), .45)\nassert isclose(standardized(rates, {'bright': .75, 'backlit': .25}), .75)\nassert isclose(standardized(rates, {'bright': .5, 'backlit': .5}), .60)\ntry:\n    standardized({'bright': .9}, {'bright': .5, 'backlit': .5})\nexcept ValueError:\n    pass\nelse:\n    raise AssertionError('missing backlit stratum accepted')\nprint('composition shift 30pp, standardized difference 0pp')",
      "codeNotes": [
        "输入是教学中已知层内比率，无训练、置信区间或真实机器人数据。",
        "集合相等检查拒绝缺层，固定权重让组成效应显露；练习再把比率换成成功数/回合数。"
      ],
      "exercise": {
        "prompt": "背光部署权重改为80%，重新计算两版成功率。",
        "steps": [
          "保留两层各自成功率。",
          "解释为什么旧版与新版仍无法分出优劣。"
        ],
        "solution": "两版都是 .2×.9+.8×.3=.42。目标部署分布变难，所以值低于60%；两版层内结果相同，固定相同权重后仍无策略改善证据。"
      },
      "quiz": {
        "question": "奖励整体乘5，Q约乘5而任务成功不动，首先核对哪两项？",
        "hint": "比较对象的单位和考试题是否相同。",
        "keywords": [
          "奖励版本",
          "折扣",
          "成功规则",
          "分布"
        ],
        "reference": "先核对奖励版本和折扣，确认Q在同一续值口径；再核对独立成功规则、初态分布和评测动作模式。Q按奖励尺度改变可以合理，并不单独证明价值高估或策略进步。"
      },
      "sources": [
        {
          "id": "tips",
          "label": "SB3 v2.7.1 · RL Tips",
          "url": "https://stable-baselines3.readthedocs.io/en/v2.7.1/guide/rl_tips.html",
          "reading": "How to evaluate an RL algorithm；核对独立环境、wrappers 和多次训练。"
        },
        {
          "id": "sac",
          "label": "SB3 v2.7.1 · SAC.train",
          "url": "https://stable-baselines3.readthedocs.io/en/v2.7.1/_modules/stable_baselines3/sac/sac.html",
          "reading": "对照昨日已读 target_q_values、critic_loss、actor_loss 与 logger.record，今天关注统计语义。"
        },
        {
          "id": "eval",
          "label": "SB3 v2.7.1 · evaluate_policy",
          "url": "https://stable-baselines3.readthedocs.io/en/v2.7.1/_modules/stable_baselines3/common/evaluation.html",
          "reading": "定位 episode_count_targets、info[episode] 与 return_episode_rewards；注意该函数返回未折扣回报。"
        },
        {
          "id": "hdr",
          "label": "Isaac Lab · HDR 修复 #9027",
          "url": "https://github.com/isaac-sim/IsaacLab/pull/9027",
          "reading": "读 rgb_hdr、skipToneMapping、golden 的共享 min/max；续读 #9068 的隔离限制，非策略收益测试。"
        }
      ]
    },
    "code": {
      "title": "绘制 return、success 和 Q：从记录到分层图",
      "minutes": 40,
      "prerequisites": "会读Python字典、布尔终止位和B×1张量；理解前课固定条件权重。",
      "connection": "沿11月22日SAC的logger向外追到回合边界；11月24日固定数据集会复用本课身份检查。",
      "intro": "阅读SB3的评测与Monitor调用链，用纯内存SVG字符串画三联图，并拒绝奖励版本混入。",
      "outcomes": [
        "定位SB3回合统计与成功字段的边界",
        "运行无网络和磁盘依赖的三联图夹具及负例"
      ],
      "sections": [
        {
          "heading": "从 step 汇总到回合记录",
          "body": "从 Monitor.step 开始看：它把每拍 reward 加入列表，在 terminated 或 truncated 时才汇总，并将额外info字段带入episode记录。成功不是从r大于零推出来的，需要环境在最终info中提供字段，并在info_keywords中明确登记。Monitor位置决定它看见原奖励还是外层重塑后的奖励；应把wrapper次序记入实验身份。\n\n再沿 evaluate_policy 看 model.predict、env.step 和每个环境的计数。向量环境会静态分配目标回合数，避免快结束环境在总样本中占更高比例。开启Monitor时它使用info中的episode统计；未开启时才累加所见奖励。该函数默认汇总未折扣回报，不自动返回完整成功率和Q图，需要调用者明确采集这两个额外量。",
          "sourceIds": [
            "monitor",
            "eval"
          ]
        },
        {
          "heading": "为图上的每个点固定身份",
          "body": "教学记录包含checkpoint、条件、奖励版本、任务return、成功位、干预位和固定探针Q。Q探针必须使用同一状态动作及同一归一化，训练批Q均值随采样分布变动，不适合作为模型变化的独立刻度。实际日志还应保存环境步和更新步，两者不能因为数值相近就共用一个横轴。\n\n下面用早晚两个checkpoint、明亮和背光两层，每层两回合。少量数据仅用于展示算术：晚期平均return增加，success降低，同时Q升高。程序先拒绝奖励版本不一致，再按checkpoint合成；真实任务需用数据manifest核对物理后端、camera与初始状态。这里只检验一个身份字段，不能宣称实现了完整实验追踪系统。",
          "sourceIds": [
            "sac",
            "monitor"
          ]
        },
        {
          "heading": "在字符串中生成可查看的三联图",
          "body": "每条折线拥有独立纵轴范围，因此return、成功率与Q不会因量纲差异挤成一条线。函数将有限数值映射到图像坐标，返回SVG字符串；复制打印结果到本地SVG文件即可查看，本课测试本身不写盘。零跨度用1替代避免除零，额外文字显示实际数值，读者不应按三个斜率的视觉角度比较改进幅度。\n\n聚合对各条件等权，这符合示例的固定目标权重。它还报告接管比率，使成功有可能依赖人类帮助这一事实可见。Q是虚构的标准探针值，未与经验软目标做校准；本课不导入SB3、不启动环境、不拟合critic。上游源码负责提供真实边界，原创代码负责展示审计到绘图这一小段。",
          "sourceIds": [
            "eval",
            "monitor"
          ]
        },
        {
          "heading": "负例应在错误进入图前失败",
          "body": "第一个负例把最后一行奖励版本改成r2，即使所有数字有限，比较也应拒绝。第二个负例注入NaN，避免图像路径默默断线。第三个删除背光记录，使条件集合不全。与检查SVG是否含有标签相比，这三项直接保护统计解释：图画得出来，并不能说明比较成立。\n\n读输出时先复算四行平均和成功数，再检查各条件；多训练种子实验应在每个种子内先聚合，再画种子间分布或区间。自动画图不能发现所有问题，例如success字段自己误判、相机配置未记录。下一课的实验计划要把这些未覆盖因素安排为独立核查，而不是继续把绘图库做复杂。",
          "sourceIds": [
            "tips",
            "seed"
          ]
        }
      ],
      "points": [
        "Monitor记录哪层奖励由wrapper次序决定。",
        "成功字段与Q探针需要显式采集。",
        "先拒绝不可比较记录，再生成图。"
      ],
      "codeTitle": "rl_diagnostic_svg.py · 纯内存三联图",
      "code": "import copy, math\nfrom statistics import mean\n# checkpoint, condition, return, success, intervention, fixed-probe Q\nrows = [\n ('early','bright',6,1,0,3), ('early','bright',4,1,0,3),\n ('early','backlit',2,1,1,3), ('early','backlit',0,0,0,3),\n ('late','bright',8,1,0,9), ('late','bright',6,1,0,9),\n ('late','backlit',5,0,1,9), ('late','backlit',5,0,1,9)]\ndata = [dict(zip(('ckpt','condition','ret','success','takeover','q'), row), reward='r1') for row in rows]\ndef summarize(records):\n    if {r['reward'] for r in records} != {'r1'}:\n        raise ValueError('reward identity mismatch')\n    out = []\n    for ckpt in ('early','late'):\n        groups = [[r for r in records if r['ckpt']==ckpt and r['condition']==c]\n                  for c in ('bright','backlit')]\n        if any(not g for g in groups):\n            raise ValueError('missing condition')\n        for g in groups:\n            for r in g:\n                if not all(math.isfinite(r[k]) for k in ('ret','q')):\n                    raise ValueError('nonfinite signal')\n                if r['success'] not in (0,1) or r['takeover'] not in (0,1):\n                    raise ValueError('not a binary event')\n        out.append([mean(mean(r[k] for r in g) for g in groups)\n                    for k in ('ret','success','q','takeover')])\n    return out\n\ndef svg(values):\n    panels = []\n    for j, label in enumerate(('return','success','Q probe')):\n        v = [row[j] for row in values]\n        lo, hi = min(v), max(v)\n        span = hi-lo or 1\n        pts = ' '.join(f'{30+i*120},{85-60*(x-lo)/span:.2f}' for i,x in enumerate(v))\n        panels.append(f'<g transform=\"translate({j*200},0)\"><text x=\"10\" y=\"15\">{label}: {v}</text><polyline points=\"{pts}\" fill=\"none\" stroke=\"blue\"/></g>')\n    return '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"600\" height=\"110\">'+''.join(panels)+'</svg>'\n\nvalues = summarize(data)\nassert values == [[3,.75,3,.25],[6,.5,9,.5]]\nassert svg(values).count('<polyline') == 3\nbad = copy.deepcopy(data); bad[-1]['reward']='r2'\nnan = copy.deepcopy(data); nan[0]['q']=float('nan')\nmissing = [r for r in data if r['condition']=='bright']\nfor case in (bad,nan,missing):\n    try: summarize(case)\n    except ValueError: pass\n    else: raise AssertionError('invalid comparison accepted')\nprint(svg(values))\nprint('return 3->6, success .75->.5, Q 3->9; rejects verified')",
      "codeNotes": [
        "summarize先检查身份和条件，再等权聚合；测试只存内存中的虚构数据，没有读客户日志。",
        "svg分开缩放三种量，只生成字符串；Q探针上升不能证明Q错误，需同口径续跑校准。"
      ],
      "exercise": {
        "prompt": "删掉接管回合后成功率应当如何报告？",
        "steps": [
          "找出接管位为1的三条记录。",
          "说明直接删除为何改变任务分布和分母。"
        ],
        "solution": "不应仅删除后给出一个漂亮成功率。主报告保留所有预登记回合，另列自主成功和接管成功；删除接管通常优先删困难样本，导致选择偏差。应按条件和版本分别标出分母。"
      },
      "quiz": {
        "question": "evaluate_policy 的mean reward可否直接用作SAC软Q的校准真值？",
        "hint": "比较折扣、熵项和初始状态。",
        "keywords": [
          "未折扣",
          "熵",
          "状态动作",
          "同口径"
        ],
        "reference": "不可直接相减。evaluate_policy汇总回合未折扣奖励，而SAC软Q按状态动作条件化，含折扣与后续熵。需固定探针状态动作、现策略、折扣奖励和熵口径，并处理有限回放的尾项。"
      },
      "sources": [
        {
          "id": "eval",
          "label": "SB3 v2.7.1 · evaluate_policy",
          "url": "https://stable-baselines3.readthedocs.io/en/v2.7.1/_modules/stable_baselines3/common/evaluation.html",
          "reading": "定位 episode_count_targets、info[episode] 与 return_episode_rewards；注意该函数返回未折扣回报。"
        },
        {
          "id": "monitor",
          "label": "SB3 v2.7.1 · Monitor.step",
          "url": "https://stable-baselines3.readthedocs.io/en/v2.7.1/_modules/stable_baselines3/common/monitor.html",
          "reading": "追踪 rewards、terminated or truncated、info_keywords 和 episode[r/l/t]。"
        },
        {
          "id": "tips",
          "label": "SB3 v2.7.1 · RL Tips",
          "url": "https://stable-baselines3.readthedocs.io/en/v2.7.1/guide/rl_tips.html",
          "reading": "How to evaluate an RL algorithm；核对独立环境、wrappers 和多次训练。"
        },
        {
          "id": "sac",
          "label": "SB3 v2.7.1 · SAC.train",
          "url": "https://stable-baselines3.readthedocs.io/en/v2.7.1/_modules/stable_baselines3/sac/sac.html",
          "reading": "对照昨日已读 target_q_values、critic_loss、actor_loss 与 logger.record，今天关注统计语义。"
        },
        {
          "id": "seed",
          "label": "LeRobot · RoboTwin #5355",
          "url": "https://github.com/huggingface/lerobot/pull/5355",
          "reading": "按 episode 播种 100 条候选，检查 reset 耗时与指令分布；main 合并 SHA 0793738cefde81a8354e9730c4dce0d0259280fa，2026-11-18 核验。"
        }
      ]
    },
    "insight": {
      "title": "曲线上升不等于安全：设计能排除原因的复验",
      "minutes": 25,
      "prerequisites": "完成今天组成偏移与日志绘图，能说出两种Q统计的分母。",
      "connection": "结束强化学习基础周，用诊断表进入明天Offline RL的问题设定；后续HIL-SERL会把干预记录接入同一证据链。",
      "intro": "用曝光与接触的两种反例决定先修数据、先修模拟器还是继续训练，并区分两条世界模型路线的证据职责。",
      "outcomes": [
        "设计相同初态的单因素仿真复验",
        "把预测误差、任务成功和安全事件分别纳入预算"
      ],
      "sections": [
        {
          "heading": "先排除观测变化，再评价策略变化",
          "body": "针对背光抓取失败，路线A先冻结checkpoint和动力学，只交换旧新曝光或RAW处理；路线B先保持图像处理一致，只交换checkpoint。前者能发现输入变换导致的分布偏移，后者回答学习本身是否改善控制。收益是归因明确，代价是要保存可回放初态与相机配置；两因素一起换，成功率上升也难以定位机制。\n\nIsaac Lab #9027 的窗口修复针对Gaussian HDR输出，金图比较共享强度上下界。独立归一化可能把整体亮度错误擦掉，与你的RAW经验直接相连。但后续#9068隔离了一项RTX比较，说明新增覆盖不等于所有场景都已验证。课程只把该变化当成观测管线的检查案例，没有把渲染修复称为策略成功提升。",
          "sourceIds": [
            "hdr"
          ]
        },
        {
          "heading": "用配对差值保留困难初态",
          "body": "在每个预登记初态上运行旧新策略，记录自主成功、干预和安全事件。假设20对中，旧失败新成功5对，旧成功新失败2对，其余相同，平均成功差就是15个百分点。它保留了困难初态的对比关系；这只是点估计，不意味着统计显著，更不表示所有背光强度都改善。训练随机性要在多个独立训练种子上再复验。\n\n运行顺序随机交错，可减弱电机升温、光照缓慢变化和操作者熟练带来的影响。仿真中仍需记录physics后端、碰撞体和solver配置，不能假定相同数字种子保证跨后端同一轨迹。对SO-101预算有限时，先在纯仿真做配对故障注入和日志复核，再形成未来人工执行的协议；自动化本轮不连接任何电机。",
          "sourceIds": [
            "tips",
            "world"
          ],
          "formulas": [
            {
              "latex": "\\widehat\\Delta=\\frac{1}{N}\\sum_{i=1}^N(y_i^{\\mathrm{new}}-y_i^{\\mathrm{old}})=\\frac{n_{01}-n_{10}}{N}",
              "explanation": "N是配对初态数，n01表示旧失败新成功，n10表示反向改变。例中(5−2)/20=.15；配对结果相关，不能把两组当独立回合求同一标准误。"
            }
          ]
        },
        {
          "heading": "双团队分别提供什么可检验对象",
          "body": "StanfordVL的BEHAVIOR/OmniGibson强调任务、目标谓词和交互评测，能帮助我们把夹取成功定义成可验证状态。World Labs的Marble/Atlas负责空间生成重建，R2S2R进一步讨论把一项真实任务扩成可控变体。我们的教学借鉴是固定目标规则，再改变外观或物理；不因图像逼真就认定摩擦或接触也真实。\n\nMeta/FAIR历史的V-JEPA 2-AC根据观测、候选动作和目标图像预测未来表征并规划，诊断对象包括预测排序是否与实际执行结果一致。AMI Labs官网描述的是表征预测、动作条件规划与安全方向，本轮没有将其写成已经提供可部署控制器。对RAW项目可冻结两种encoder做目标距离排序探针，但还需独立控制器执行、重新观测与任务成功判定，不能拿latent误差替代闭环。",
          "sourceIds": [
            "behavior",
            "world",
            "jepa",
            "ami"
          ]
        },
        {
          "heading": "Agent诊断要追到实际执行者",
          "body": "如果未来由通用大模型选技能，它输出的应记录为技能名、参数和调用时间；下游VLA产生动作段，控制器经过限幅才真正执行，图像与状态回流给上层确认。故障可能出在分解错误、技能调用超时、策略接触失败或错误的自报成功。记录每层提议与实际结果，才能知道该改prompt、补训练数据还是修时间契约。\n\n学习者本周只需交一页诊断决策：return涨success不动先查奖励与组成；Q突变先查尺度和固定探针；超时增多先看观测年龄与动作队列；安全事件增多就暂停该候选晋级。研究测试仍要报告恢复用时、人工接管次数和硬件条件。这是面向实验的建议，并非本课实现了通用Agent，也不是用模型名称替代实测能力。\n\n当日延伸阅读：首尔大学PAIR以Qwen3-VL-8B-Instruct每5秒仿真时间分派π0.5或GR00T N1.7，并可调用共享设备状态的API；六种配置在120个评测回合均无完整任务成功，且推理时暂停仿真时间。这是规划与执行分拆的反例，不能外推成真机延迟结论。Singh的ANYmal D审计中18个微调模拟器都改善短期预测，但13个产生失败策略；评测仅在自建MuJoCo物理模型，无硬件。两项仅作选读，不增加100分钟核心预算。",
          "sourceIds": [
            "tips",
            "jepa",
            "pair",
            "rwm"
          ]
        }
      ],
      "points": [
        "一次只改变可解释的因素。",
        "配对保留困难案例，另验训练种子差异。",
        "世界预测和Agent自报都需要外部执行结果核查。"
      ],
      "codeTitle": "paired_diagnosis.py · 分开成功与安全事件",
      "code": "from math import isclose\n\ndef paired(old, new, events):\n    if not old or len(old)!=len(new) or len(new)!=len(events):\n        raise ValueError('unpaired records')\n    if any(x not in (0,1) for x in old+new+events):\n        raise ValueError('event must be binary')\n    gain=sum(a==0 and b==1 for a,b in zip(old,new))\n    loss=sum(a==1 and b==0 for a,b in zip(old,new))\n    return (gain-loss)/len(old), sum(events)/len(events)\na=[0]*5+[1]*2+[1]*8+[0]*5\nb=[1]*5+[0]*2+[1]*8+[0]*5\nchange, event_rate=paired(a,b,[1]+[0]*19)\nassert isclose(change,.15) and isclose(event_rate,.05)\n# More successes do not cancel an independently recorded safety event.\nassert event_rate>0\ntry: paired(a,b[:-1],[0]*20)\nexcept ValueError: pass\nelse: raise AssertionError('unpaired rollout accepted')\nprint('success difference +15pp; safety event rate 5%; no automatic promotion')",
      "codeNotes": [
        "仅计算虚构配对事件，没有置信区间、设备动作或晋级授权。",
        "len检查防止把丢失回合错配；安全事件率独立保留，不用成功收益抵消。"
      ],
      "exercise": {
        "prompt": "新版仅修复背光，但明亮略退步，怎样决定是否保留？",
        "steps": [
          "先报告两层配对差和安全事件。",
          "结合事先登记的使用权重与容忍范围判断，而不是事后选权重。"
        ],
        "solution": "保留各层分母和配对结果，按预定部署权重合成；即使总体改善，若明亮退步或安全事件超过预定容忍范围，也应暂缓晋级并定位原因，不能用背光收益掩盖另一条件风险。"
      },
      "quiz": {
        "question": "latent目标距离下降、技能返回done，但物体仍未离台，哪条证据具有最终任务意义？",
        "hint": "区分预测、工具状态和环境目标谓词。",
        "keywords": [
          "外部验证",
          "目标谓词",
          "观测回流",
          "执行动作"
        ],
        "reference": "应看重新观测到的任务目标谓词和实际执行动作。latent距离是模型内部预测，done可能只表示工具调用结束；物体未离台就不能据此判夹取成功。另查观测时间与接管记录，确认验证属于同一回合。"
      },
      "sources": [
        {
          "id": "tips",
          "label": "SB3 v2.7.1 · RL Tips",
          "url": "https://stable-baselines3.readthedocs.io/en/v2.7.1/guide/rl_tips.html",
          "reading": "How to evaluate an RL algorithm；核对独立环境、wrappers 和多次训练。"
        },
        {
          "id": "hdr",
          "label": "Isaac Lab · HDR 修复 #9027",
          "url": "https://github.com/isaac-sim/IsaacLab/pull/9027",
          "reading": "读 rgb_hdr、skipToneMapping、golden 的共享 min/max；续读 #9068 的隔离限制，非策略收益测试。"
        },
        {
          "id": "behavior",
          "label": "StanfordVL · BEHAVIOR Evaluation",
          "url": "https://behavior.stanford.edu/challenge/evaluation.html",
          "reading": "Metrics and Results：区分任务成功和部分目标完成分数；不与训练奖励混用。"
        },
        {
          "id": "world",
          "label": "World Labs · R2S2R",
          "url": "https://www.worldlabs.ai/blog/real-to-sim-to-real",
          "reading": "One real task, thousands of variations：将外观、物理、相机扰动分开控制。"
        },
        {
          "id": "jepa",
          "label": "Meta/FAIR · V-JEPA 2",
          "url": "https://ai.meta.com/research/vjepa/",
          "reading": "Planning for robotic control：目标图像和动作条件预测；不把 latent 距离解释为成功概率。"
        },
        {
          "id": "ami",
          "label": "AMI Labs · 当前研究方向",
          "url": "https://amilabs.xyz/",
          "reading": "读表征空间预测、动作条件规划和安全目标；官网愿景不等于本日发布模型。"
        },
        {
          "id": "pair",
          "label": "首尔大学 · PAIR v1",
          "url": "https://arxiv.org/html/2611.23070v1",
          "reading": "§6.1–6.3：Qwen3-VL-8B分派两种VLA，模型推理暂停仿真时间；120回合完整任务均未成功。"
        },
        {
          "id": "rwm",
          "label": "Singh · ANYmal D learned simulator audit v1",
          "url": "https://arxiv.org/html/2611.23118v1",
          "reading": "§9 与 Limitations：固定物理模型内的策略测试，无硬件；单步预测改善不保证会走。"
        }
      ]
    }
  }
};
