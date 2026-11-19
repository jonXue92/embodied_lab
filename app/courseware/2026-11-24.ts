import type { AuthoredDay } from './types';

export const day85: AuthoredDay = {
  "reviewedAt": "2026-11-19",
  "revision": "逐课编写 1.0",
  "deliverable": "Offline RL固定证据契约、PyTorch replay加载夹具与四格覆盖审计。35+40+25=100分钟。",
  "question": {
    "title": "固定回放中只有左动作奖励1，训练器预测右动作Q=20；评测新失败被补回数据后仍称纯Offline RL。怎样纠正实验结论？",
    "summary": "连接不可识别性、固定数据加载和交互预算。",
    "keywords": [
      "支持集",
      "不可识别",
      "新增交互",
      "版本",
      "终止",
      "评测隔离"
    ],
    "reference": "右动作没有记录后果，Q=20只是外推，无法由数据识别其真实回报；构造右奖励2和负10的两个世界即可证明。将评测失败加入训练意味着新增交互，应改报offline-to-online或迭代数据实验并登记预算和新版本。保留原始冻结集与独立测试，核对terminated和truncated、动作单位与奖励版本；先运行加载负例和覆盖表，再讨论保守价值方法，不能用训练残差小证明右动作安全。"
  },
  "lessons": {
    "foundation": {
      "title": "Offline RL：固定日志能识别什么",
      "minutes": 35,
      "prerequisites": "先学11月22日SAC与23日实验诊断，能手算单步自举目标。",
      "connection": "今天冻结证据；明天拆开动作支持集与Q高估。",
      "intro": "用两个日志相同但最优动作相反的世界解释离线学习的识别边界。",
      "outcomes": [
        "区分off-policy与offline",
        "手算终止与续值并写实验数据契约"
      ],
      "sections": [
        {
          "heading": "固定的是交互证据，而非优化步数",
          "body": "昨天用分层统计解释曲线，今天把训练允许看到的证据冻结。Offline RL先获得一份历史转移集合，此后更新参数时不能向环境申请新的训练转移。行为策略是产生这份数据的机制，可能混合人类示教、旧策略与人工接管；学习策略是本轮要优化的对象。二者名字相同或都使用SAC，并不会让数据分布自动一致。\n\nOff-policy描述更新可以使用不同策略产生的经验，并不承诺停止采集。在线SAC往往一边更新一边补充replay；纯离线版本失去了补样纠错的渠道。今天的独立产出是数据使用契约：固定文件摘要、动作和奖励版本、训练回合清单，以及允许评测而不允许反馈到训练的数据流。不能仅凭训练代码没有env.step就断言整个实验离线。",
          "sourceIds": [
            "review",
            "train"
          ]
        },
        {
          "heading": "从目标期望到日志经验平均",
          "body": "期望回报按学习策略在环境里访问的轨迹定义，日志平均却按历史采集分布计算。写出两个分布能立即看到缺口：固定日志中没有夹爪撞到盒边的恢复动作，优化器做再多轮也不能凭空得到其真实后果。收益估计必须依赖已有覆盖和结构假设，不能把在数据动作上拟合准确推广到任意动作。\n\n考虑只有一步的教学任务：同一状态记录动作左的奖励1，从未记录动作右。环境甲中右奖励2，环境乙中右奖励负10，两份日志完全相同。任何只看日志的算法都会得到同样输入，却不可能在两种环境中同时确定右优于左。这不是某种网络不够深，而是证据无法区分两个世界；明天将把它发展成分布外Q高估。",
          "sourceIds": [
            "review"
          ],
          "formulas": [
            {
              "latex": "J(\\pi)=\\mathbb E_{\\tau\\sim p_\\pi}\\!\\left[\\sum_{t=0}^{H-1}\\gamma^t r_t\\right],\\qquad \\widehat L_D(Q)=\\frac1N\\sum_{i=1}^N(Q(s_i,a_i)-y_i)^2",
              "explanation": "H是决策拍数，γ无量纲，r为每拍奖励，J和Q沿用奖励单位；N条历史转移只约束已记录状态动作上的残差，不直接识别策略分布下J。"
            }
          ]
        },
        {
          "heading": "BC和离线价值学习使用不同监督",
          "body": "BC拟合日志中的动作，不需要奖励来定义回归标签。离线价值学习还用奖励、后继观测与终止语义，尝试区分同一任务里更有用的行动。它有机会重组已有片段，却不能保证超越行为策略，更不能把不同相机、不同物体和不同动力学的片段当成同一可拼接状态。\n\n数值上，奖励1、折扣0.9、后继值4，非终止目标为4.6，真实终止目标为1。时间上限截断若仍有可信后继观测，可以保留续值；如果只是文件被切断且没有后继，必须拒绝或按明确协议处理，不能伪造成任务终止。基础代码只算这两个目标，故意将终止位写成2会失败；它没有实现CQL或IQL训练。",
          "sourceIds": [
            "dataset",
            "review"
          ]
        },
        {
          "heading": "训练冻结与评测隔离是两件事",
          "body": "固定数据仍可在独立仿真评测策略，但必须把rollout与训练集隔离。若每轮看评测失败再加入其转移，实验已变为迭代采集；若不加转移却反复根据同一测试集挑配置，测试信息仍会泄漏到模型选择。预先区分训练、验证和最终测试，并按完整episode或场景划分，避免相邻帧跨集合。\n\nGrana提供相关选读：用多视角历史和语言描述预测子任务进度，在已录轨迹上评分，再形成学习监督。奖励标签更新不等于新增真实接触经验；还要冻结评分器版本及可见未来范围。今天只要求理解这条边界，奖励分类器留到12月3日展开。核心35分钟内完成反例和数据契约，不要求下载模型或长篇通读论文。",
          "sourceIds": [
            "grana",
            "train"
          ]
        }
      ],
      "points": [
        "重复更新不会补充交互事实。",
        "小训练残差只约束日志动作。"
      ],
      "codeTitle": "offline_identification.py",
      "code": "import math\n\ndef target(reward, terminated, next_value, gamma=.9):\n    if type(terminated) is not bool or not 0 <= gamma < 1:\n        raise ValueError('invalid termination or discount')\n    if not all(math.isfinite(v) for v in (reward,next_value)):\n        raise ValueError('nonfinite target input')\n    return reward + gamma * (not terminated) * next_value\nassert math.isclose(target(1,False,4),4.6)\nassert target(1,True,4)==1\nlogs=[('s','left',1)]\nworlds=[{'left':1,'right':2},{'left':1,'right':-10}]\nassert [w['left'] for w in worlds]==[1,1]\nassert [max(w,key=w.get) for w in worlds]==['right','left']\ntry: target(1,2,4)\nexcept ValueError: pass\nelse: raise AssertionError('invalid terminal flag accepted')\nprint('same logged evidence, opposite optimal actions; targets 4.6 and 1')",
      "codeNotes": [
        "一步任务刻意消除动力学复杂度，用不可区分世界展示证据限制。",
        "target只演示普通续值，未包含SAC熵项或IQL优化器。"
      ],
      "exercise": {
        "prompt": "若奖励2、γ=.95、后继值10，终止与截断目标各是多少？",
        "steps": [
          "写明可信后继观测假设。",
          "解释为何文件缺帧不能直接套截断。"
        ],
        "solution": "真实终止为2；时间截断且后继可信时为2+.95×10=11.5。缺帧使next observation不可用，应拒绝或按预登记缺失协议处理，不能捏造续值。"
      },
      "quiz": {
        "question": "给在线SAC缓存只读一天，就能证明整次实验是纯离线吗？",
        "hint": "检查其他日期与评测数据如何使用。",
        "keywords": [
          "交互预算",
          "固定数据",
          "评测",
          "off-policy"
        ],
        "reference": "不能。必须核对整个训练和模型选择周期的数据流。off-policy不限制新采集；若其他阶段持续追加或利用测试失败补样，需记录在线交互预算与新数据版本，不能只按某一天缓存只读来命名。"
      },
      "sources": [
        {
          "id": "review",
          "label": "Levine等 · Offline RL Tutorial v3",
          "url": "https://arxiv.org/html/2005.01643v3",
          "reading": "§2.2–2.4固定数据设定；§4.2自举引入的分布偏移；§5模型误差。"
        },
        {
          "id": "dataset",
          "label": "IQL作者源码 · dataset_utils.py",
          "url": "https://github.com/ikostrikov/implicit_q_learning/blob/master/dataset_utils.py",
          "reading": "2026-11-19读取master：Dataset.sample、D4RLDataset.__init__；比较masks与dones_float。main会变，本课未声称锁定该仓提交。"
        },
        {
          "id": "train",
          "label": "IQL作者源码 · train_offline.py",
          "url": "https://github.com/ikostrikov/implicit_q_learning/blob/master/train_offline.py",
          "reading": "2026-11-19读make_env_and_dataset、normalize和main；sample→agent.update，evaluate支路不把新经验加入数据。"
        },
        {
          "id": "grana",
          "label": "NVIDIA/UT Austin/UW · Grana v1",
          "url": "https://arxiv.org/html/2611.24926v1",
          "reading": "§3.1–3.4与附录C：语言条件进度、离线轨迹评分、奖励转换；选读，不增加核心预算。"
        }
      ]
    },
    "code": {
      "title": "加载固定 replay：身份、边界与复制语义",
      "minutes": 40,
      "prerequisites": "会读B×S张量、JSON与布尔终止位，完成前课4.6和1算例。",
      "connection": "复用昨日日志身份；为明日支持集分析提供可信转移。",
      "intro": "沿IQL作者数据调用链，原创实现无外部文件和设备依赖的固定回放加载。",
      "outcomes": [
        "定位sample与两种结束标志",
        "实跑成对采样、复制隔离和四个拒绝用例"
      ],
      "sections": [
        {
          "heading": "沿作者实现找到冻结边界",
          "body": "从IQL作者train_offline.py的main读起，make_env_and_dataset加载D4RL数据；循环每次dataset.sample后交给agent.update，评测走另一条支路。环境对象存在不意味着训练必然在线：关键是新转移有没有写回训练集合。normalize会修改奖励尺度，因此应在预处理完成后锁定训练版本，而非对原始下载包记一个摘要就结束。\n\n进入dataset_utils.py，Batch包含observations、actions、rewards、masks和next_observations。sample对所有字段使用同一组随机索引，保持转移配对；它默认有放回抽样，一个batch可能重复同一行。动作是B×A，状态是B×S，奖励与mask在该实现中为B；换到B×1实现必须显式改轴，否则广播能生成B×B误差却不一定立即报错。",
          "sourceIds": [
            "train",
            "dataset"
          ]
        },
        {
          "heading": "轨迹分段位不等于自举终止位",
          "body": "作者D4RLDataset用terminal或观测连续性不匹配产生dones_float，最后一行也标轨迹结束；masks则取一减terminals。前者服务于切轨迹，后者控制续值。这一差别避免把所有文件边界都当作任务吸收态。连续性检测还是一种旧数据接口的启发式，不应替代我们日志里明确的episode与step身份。\n\n原创加载器用内存JSON模拟已读取文件，不导入上游训练器，也不下载D4RL。它要求episode按块连续、step从零递增，每块最后一拍有terminated或truncated，非末拍next_state与下一state精确配对。教学状态仅两维、动作一维；真实浮点观测应使用传感器时间和帧身份验证，不能对大图像照搬精确列表比较。",
          "sourceIds": [
            "dataset"
          ]
        },
        {
          "heading": "复制存储，统一索引，并锁定数据摘要",
          "body": "加载时先把JSON解析为新对象，验证完再构造PyTorch张量。调用者拿到的batch采用索引后的副本，修改batch不会回写原集合；snapshot返回克隆，验证代码借此核对采样前后源数据不变。摘要针对示例字节，真实manifest还要包含预处理器、奖励标注和切分；只改空格也会改变本例摘要，这是字节身份而非语义相等判断。\n\n独立torch.Generator固定抽样随机性，不修改全局种子。每次采样同一个idx应用到每列，随后把奖励和mask显式扩展成B×1，防止自举时隐式广播。采样函数不提供append接口，表示本课实验约束；这并不是安全隔离沙箱，Python调用者仍有能力访问对象内部，实际工程需要版本仓与只读数据权限配合。",
          "sourceIds": [
            "dataset",
            "train"
          ]
        },
        {
          "heading": "让错误在训练之前可见",
          "body": "代码先接受两个独立回合，分别覆盖真实终止和时间截断，然后检查mask为0和1，抽样形状为8×2及8×1。相同种子的两个生成器产生相同batch；训练批被原地清零后，snapshot仍与原始数据一致。这些检查把可重复抽样与固定证据区分开：同一数据可以每次抽不同batch，依然属于离线学习。\n\n负例注入跨帧错误、NaN动作、提前结束和不完整末拍，都必须在构建张量前报错。若上游向量环境复用内存，terminal observation可能被reset覆盖，即使shape正确也会污染续值；本次LeRobot固定提交提供了对应修复选读。该夹具只证明加载与边界检查，不证明IQL收敛；练习再核对clip_to_eps如何影响动作版本。",
          "sourceIds": [
            "dataset",
            "train",
            "terminalfix"
          ]
        }
      ],
      "points": [
        "所有字段共用同一索引。",
        "轨迹末尾和吸收态分开。"
      ],
      "codeTitle": "frozen_replay_fixture.py",
      "code": "import json, hashlib, copy, math\nimport torch\n\nclass FrozenReplay:\n    def __init__(self, text):\n        rows=json.loads(text)\n        if not rows: raise ValueError('empty replay')\n        seen=set(); previous=None\n        for r in rows:\n            if set(r)!={'ep','step','s','a','r','ns','terminated','truncated'}:\n                raise ValueError('schema mismatch')\n            if not isinstance(r['ep'],str) or type(r['step']) is not int:\n                raise ValueError('identity type')\n            if len(r['s'])!=2 or len(r['ns'])!=2 or len(r['a'])!=1:\n                raise ValueError('shape mismatch')\n            nums=r['s']+r['a']+[r['r']]+r['ns']\n            if any(type(v) not in (int,float) or not math.isfinite(v) for v in nums):\n                raise ValueError('nonfinite data')\n            if any(type(r[k]) is not bool for k in ('terminated','truncated')):\n                raise ValueError('flag type')\n            if r['terminated'] and r['truncated']: raise ValueError('ambiguous ending')\n            if previous is None or r['ep']!=previous['ep']:\n                if previous and not (previous['terminated'] or previous['truncated']):\n                    raise ValueError('unfinished episode')\n                if r['ep'] in seen or r['step']!=0: raise ValueError('episode identity')\n                seen.add(r['ep'])\n            elif (previous['terminated'] or previous['truncated'] or\n                  r['step']!=previous['step']+1 or previous['ns']!=r['s']):\n                raise ValueError('transition continuity')\n            previous=r\n        if not (previous['terminated'] or previous['truncated']):\n            raise ValueError('incomplete final transition')\n        self.sha=hashlib.sha256(text.encode()).hexdigest()\n        self._data={k:torch.tensor([r[k] for r in rows],dtype=torch.float32)\n                    for k in ('s','a','r','ns')}\n        self._data['mask']=torch.tensor([not r['terminated'] for r in rows],dtype=torch.float32)\n    def snapshot(self): return {k:v.clone() for k,v in self._data.items()}\n    def sample(self,n,g):\n        if type(n) is not int or n<=0: raise ValueError('batch size')\n        idx=torch.randint(len(self._data['s']),(n,),generator=g)\n        return {k:(v[idx].clone().reshape(n,1) if k in ('r','mask') else v[idx].clone())\n                for k,v in self._data.items()}\nrows=[dict(ep='a',step=0,s=[0,0],a=[.1],r=0,ns=[1,0],terminated=False,truncated=False),\n      dict(ep='a',step=1,s=[1,0],a=[.2],r=1,ns=[2,0],terminated=True,truncated=False),\n      dict(ep='b',step=0,s=[5,0],a=[.3],r=0,ns=[6,0],terminated=False,truncated=True)]\nreplay=FrozenReplay(json.dumps(rows)); before=replay.snapshot()\nassert before['mask'].tolist()==[1,0,1]\nb1=replay.sample(8,torch.Generator().manual_seed(9))\nb2=replay.sample(8,torch.Generator().manual_seed(9))\nassert b1['s'].shape==(8,2) and b1['r'].shape==(8,1)\nassert all(torch.equal(b1[k],b2[k]) for k in b1)\nb1['s'].zero_()\nassert all(torch.equal(v,replay.snapshot()[k]) for k,v in before.items())\nfor kind in ('continuity','nan','early_end','missing_end'):\n    bad=copy.deepcopy(rows)\n    if kind=='continuity': bad[1]['s']=[99,0]\n    elif kind=='nan': bad[0]['a']=[float('nan')]\n    elif kind=='early_end': bad[0]['terminated']=True\n    else: bad[-1]['truncated']=False\n    try: FrozenReplay(json.dumps(bad))\n    except ValueError: pass\n    else: raise AssertionError(kind+' accepted')\nprint('frozen replay: masks, paired batch, seed, copy isolation and four rejection tests passed')",
      "codeNotes": [
        "第一段先审计每行及episode连续性，拒绝NaN与不完整回合。",
        "第二段构造新张量并显式扩展标量轴；最后验证batch不会改写源数据。",
        "简化为二维状态与一维动作，未实现图像解码、真实磁盘读取、IQL或数据权限控制。"
      ],
      "exercise": {
        "prompt": "作者将动作clip到1减eps，我们的加载器没有clip，如何做公平对照？",
        "steps": [
          "标出预处理发生在哪个版本。",
          "解释为什么不能在评测端才悄悄改动作范围。"
        ],
        "solution": "必须在训练manifest记录动作单位、范围、eps及变换顺序，对全部候选使用相同预处理，并保存原始动作供审计。若只在一种模型评测时clip，控制行为和数据支持都变化，无法只归因算法。"
      },
      "quiz": {
        "question": "为什么dones_float=1时masks仍可为1？",
        "hint": "分段和续值分别服务什么？",
        "keywords": [
          "轨迹边界",
          "terminated",
          "truncated",
          "后继观测"
        ],
        "reference": "dones_float可表示时间截断或轨迹分段，masks只控制任务真正终止后的续值。若边界是时间上限且有可信next observation，mask可保留1；若是吸收态terminal则为0。文件丢失后继时不能只凭分段位保留续值。"
      },
      "sources": [
        {
          "id": "dataset",
          "label": "IQL作者源码 · dataset_utils.py",
          "url": "https://github.com/ikostrikov/implicit_q_learning/blob/master/dataset_utils.py",
          "reading": "2026-11-19读取master：Dataset.sample、D4RLDataset.__init__；比较masks与dones_float。main会变，本课未声称锁定该仓提交。"
        },
        {
          "id": "train",
          "label": "IQL作者源码 · train_offline.py",
          "url": "https://github.com/ikostrikov/implicit_q_learning/blob/master/train_offline.py",
          "reading": "2026-11-19读make_env_and_dataset、normalize和main；sample→agent.update，evaluate支路不把新经验加入数据。"
        },
        {
          "id": "terminalfix",
          "label": "LeRobot · terminal observation复制修复",
          "url": "https://github.com/huggingface/lerobot/commit/169694686e3b3593f350c7b7498967d0b590d64c",
          "reading": "LocalVectorEnv.step：仅本地native向量路径结束行复制；PR5404的复用buffer负例，作者CPU 20项测试。"
        }
      ]
    },
    "insight": {
      "title": "先冻结证据，再选择补样与价值路线",
      "minutes": 25,
      "prerequisites": "能运行固定回放，并区分真实转移、奖励标签与模型想象。",
      "connection": "明天可视化动作支持集；11月29日再讨论offline-to-online。",
      "intro": "把个人RAW优势和SO-101预算转成可审计的离线实验选择。",
      "outcomes": [
        "比较BC和价值学习的成本",
        "按条件动作网格列出恢复证据缺口"
      ],
      "sections": [
        {
          "heading": "为什么当前项目先离线验证",
          "body": "不能在线试错是本日主题中的工程约束，不是宣称所有机器人都永远不能探索。对个人SO-101项目，重复接触可能损伤夹爪或物体，稀疏奖励还会诱使无效长时间探索。先固定已有合成或公开日志，排查奖励、终止和动作轴，收益是把数据问题与控制风险分开；代价是不能靠追加交互直接补齐未知区域。\n\n路线A先做BC，训练简单且只需动作标签，适合验证相机与执行动作接口；路线B再在完全相同数据上加入价值学习，可能利用失败片段的回报差异，但增加了奖励审核与外推误差。比较时保留同样观测、动作频率、训练预算与测试初态。若B失败，先看目标与覆盖，不以更大骨干或更多优化轮次代替证据诊断。",
          "sourceIds": [
            "review",
            "train"
          ]
        },
        {
          "heading": "RAW优势要在支持集里提出问题",
          "body": "假设日志有明亮和背光两类状态，每类只录平移与张开两种动作。按四个预设单元计数，若背光张开缺失，覆盖代理为3/4。这只是有限审计网格，不是真实连续状态空间的覆盖率；增加十万明亮平移帧仍不会补上那个空单元，也不能证明插值足够安全。\n\n发挥RAW经验的对比应先固定轨迹身份和执行动作，再分别提供RAW处理输入与RGB输入，检查背光表示是否改善，而不是把更多背光示教混给一种模态。收益是隔离表示贡献，代价是双管线同步、标定和存储。若RAW减少饱和却仍没有失败后的张开记录，视觉改善无法消除动作证据缺口，需在后续授权采集中补回恢复片段。",
          "sourceIds": [
            "review"
          ],
          "formulas": [
            {
              "latex": "C_{\\mathcal G}(D)=\\frac{1}{|\\mathcal G|}\\sum_{g\\in\\mathcal G}\\mathbf 1[n_g>0]",
              "explanation": "G是人为事前规定的离散条件×动作网格，n_g为其中历史样本数，C无单位；四格有三格非空时为0.75。它不估计连续空间密度，也不是安全保证。"
            }
          ]
        },
        {
          "heading": "双团队帮助决定应冻结什么",
          "body": "StanfordVL的BEHAVIOR/OmniGibson提供任务和交互环境，日志应绑定任务实例、目标谓词及物理后端。11月19日BEHAVIOR核心Newton后端新提交提示同一个任务名不保证同一动力学；本日只将其作为manifest检查项，不修改已完成课程。World Labs的Marble/Atlas空间生成与R2S2R变体可用于构造新场景，但在这些场景重新step得到训练转移，已扩大原有固定数据实验。\n\nMeta/FAIR历史V-JEPA 2-AC以动作条件预测未来表征，学习出来的想象轨迹应标为模型生成，不能冒充新真实经验。AMI Labs当前的表征空间预测和安全规划方向提供研究问题，未核实新的可部署模型时不写效果。四个组织边界独立记录：输入、预测对象、候选动作和执行器各自有版本，SO-101闭环成功依然由执行后重新观测判定。",
          "sourceIds": [
            "behavior",
            "world",
            "jepa",
            "ami",
            "newton"
          ]
        },
        {
          "heading": "奖励重标注与Agent调用的边界",
          "body": "新读Grana表明可把语言条件进度变成离线学习信号，然而历史窗口可能包含未来帧，离线评分器不能直接宣称满足实时因果控制。教学建议为每条重标奖励保留旧奖励、评分器、prompt、可见时间范围与人工复核样本。若更换奖励模型，固定数据字节不变也应建立新的训练派生版本。\n\n若未来Agent调用VLA，Agent记录任务分解与技能参数，VLA输出动作段，低层控制器实际执行，再把图像与关节状态送回任务验证。离线日志可以训练或审计其中某环，却不自动验证在线恢复时延、人工接管和限位行为。本课25分钟交一份四格覆盖表及补样建议，明天用支持集图解释Q为何会相信没见过的动作；不启动机器人，也不把离线分数当成发布许可。",
          "sourceIds": [
            "grana",
            "jepa"
          ]
        }
      ],
      "points": [
        "网格占用不是真实连续覆盖率。",
        "奖励重标与追加交互分别登记。"
      ],
      "codeTitle": "coverage_grid.py",
      "code": "from collections import Counter\n\ngrid={(c,a) for c in ('bright','backlit') for a in ('move','open')}\ndef audit(rows):\n    counts=Counter(rows)\n    if set(counts)-grid: raise ValueError('unknown condition/action')\n    missing=grid-set(counts)\n    return (len(grid)-len(missing))/len(grid),missing\nrows=[('bright','move')]*100+[('bright','open')]*10+[('backlit','move')]*5\ncoverage,missing=audit(rows)\nassert coverage==.75 and missing=={('backlit','open')}\nassert audit(rows+[('bright','move')]*10000)[0]==.75\nassert audit(rows+[('backlit','open')])[0]==1\ntry: audit(rows+[('unregistered','move')])\nexcept ValueError: pass\nelse: raise AssertionError('unknown bin accepted')\nprint('grid proxy .75; more common frames do not fill missing recovery action')",
      "codeNotes": [
        "计数仅针对预先定义的四格，不能代表连续动作空间。",
        "重复常见帧保持缺口；补一个缺失格只是修复该代理指标，不保证控制安全。"
      ],
      "exercise": {
        "prompt": "若新增10000条明亮平移而缺口仍是背光张开，应如何分配下一批采集？",
        "steps": [
          "复算四格占用。",
          "列出安全可审核的恢复数据需求。"
        ],
        "solution": "四格仍只有三格非空，即.75。建议下一次人工授权采集优先覆盖背光下失败后的张开恢复，并保留动作执行、介入和终止身份；先验证日志与任务安全条件，不能靠大量重复易例或自动探索填满数字。"
      },
      "quiz": {
        "question": "在Atlas生成的新场景里采集训练轨迹，还能与原固定集实验合并报同一预算吗？",
        "hint": "新图像与新step分别是什么证据。",
        "keywords": [
          "仿真交互",
          "数据版本",
          "固定集合",
          "预算"
        ],
        "reference": "不能直接合并为相同固定预算。World Labs生成场景是新的环境来源，在里面step产生新训练转移就增加交互和覆盖，应另立数据版本与预算；原固定集结果仍需独立保留，并与Stanford任务评测及真实SO-101执行证据分开报告。"
      },
      "sources": [
        {
          "id": "review",
          "label": "Levine等 · Offline RL Tutorial v3",
          "url": "https://arxiv.org/html/2005.01643v3",
          "reading": "§2.2–2.4固定数据设定；§4.2自举引入的分布偏移；§5模型误差。"
        },
        {
          "id": "train",
          "label": "IQL作者源码 · train_offline.py",
          "url": "https://github.com/ikostrikov/implicit_q_learning/blob/master/train_offline.py",
          "reading": "2026-11-19读make_env_and_dataset、normalize和main；sample→agent.update，evaluate支路不把新经验加入数据。"
        },
        {
          "id": "grana",
          "label": "NVIDIA/UT Austin/UW · Grana v1",
          "url": "https://arxiv.org/html/2611.24926v1",
          "reading": "§3.1–3.4与附录C：语言条件进度、离线轨迹评分、奖励转换；选读，不增加核心预算。"
        },
        {
          "id": "behavior",
          "label": "StanfordVL · BEHAVIOR评测",
          "url": "https://behavior.stanford.edu/challenge/evaluation.html",
          "reading": "Metrics and Results：目标谓词、部分完成和独立成功口径。"
        },
        {
          "id": "world",
          "label": "World Labs · R2S2R",
          "url": "https://worldlabs.ai/blog/real-to-sim-to-real",
          "reading": "One real task, thousands of variations：仿真产生新交互与固定日志训练的边界。"
        },
        {
          "id": "jepa",
          "label": "Meta/FAIR · V-JEPA 2",
          "url": "https://ai.meta.com/research/vjepa/",
          "reading": "Planning for robotic control：动作条件预测和目标图像规划；历史研究组织归属。"
        },
        {
          "id": "ami",
          "label": "AMI Labs · 当前方向",
          "url": "https://amilabs.xyz/",
          "reading": "表征空间预测和动作条件规划的研究目标，不当作新的已发布控制器。"
        },
        {
          "id": "newton",
          "label": "StanfordVL · 核心Newton后端",
          "url": "https://github.com/StanfordVL/BEHAVIOR-1K/commit/c6aca4609ea4c0bcab7e1a37d4f5a1c97ad2f5f5",
          "reading": "PR2384支持刚体与关节、null渲染，不支持布料液体或Newton渲染；不同后端不能共用未标记评测身份。"
        }
      ]
    }
  }
};
