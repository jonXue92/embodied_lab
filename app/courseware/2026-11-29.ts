import type { AuthoredDay } from './types';

export const day90: AuthoredDay = {
  "reviewedAt": "2026-11-24",
  "revision": "逐课编写 1.0",
  "deliverable": "双池复用手算、UTD交错夹具、RAW固定场景评测方案；35+40+25=100分钟。",
  "question": {
    "title": "双池10000/100、U20时，25.6次复用与.82总体成功分别为何不能证明可上线？",
    "summary": "串起训练分布、真实经验、更新布局与分层评价。",
    "keywords": [
      "复用",
      "交错",
      "固定权重",
      "闭环",
      "版本"
    ],
    "reference": "B256、半半、U20得到每条在线期望25.6次抽取，离线.256次；这是重复优化而非25.6条独立证据。交错使每个UTD块半半，作者critic更新20次、actor一次。固定反光.2/常规.8时两模型可同为.82却存在分层退化；还需版本一致的奖励、终止与模拟器，以及独立闭环成功、延迟、恢复、接管证据。"
  },
  "lessons": {
    "foundation": {
      "title": "离线转在线：双池分布、UTD与初期崩塌",
      "minutes": 35,
      "prerequisites": "已学11月28日IQL、SAC的TD目标，能读[B,A]与均匀采样期望。",
      "connection": "承接固定日志价值学习；今日增加经验来源与在线预算，衔接11月30日公平评测。",
      "intro": "从固定日志走向可交互采集，先算清一条经验被重复使用多少次。",
      "outcomes": [
        "双池",
        "更新次数"
      ],
      "sections": [
        {
          "heading": "在线改变的是证据来源，不只是继续梯度下降",
          "body": "11月28日IQL把训练限制在固定日志的动作价值上；今天允许收集新transition，因此策略会把系统带到原日志未覆盖的状态。只加载昨天的checkpoint再接着优化，不能解决奖励尺度、终止语义和新状态覆盖不一致。先冻结离线评测快照，再单独追踪在线经验来源，才能判断下降发生在策略、critic还是数据接口。\n\nRLPD是在线RL使用已有数据的参照方案，作者默认无需离线预训练；它不是把IQL三损失原封不动切换到SAC的配方。若个人项目确实要继承IQL演员，critic目标、熵项、优化器状态和奖励变换都须明确重新校准，不能声称作者已经验证这种跨算法迁移。",
          "sourceIds": [
            "paper",
            "src"
          ]
        },
        {
          "heading": "双池混合改变每条经验的训练权重",
          "body": "定义ρ为离线抽样比例，两个池内部均匀、有放回抽样。对单样本损失求期望，按全概率展开就是ρ乘离线期望加1−ρ乘在线期望；它不是部署状态分布，也不是两池样本总数自然决定的比例。合池均匀抽样则会按池大小加权，巨大旧日志会淹没少量新失败。\n\n原创算例：离线10000条、在线100条，半批各取128条时，一条在线样本被取到的期望次数为1.28，一条离线样本为.0128，比例100倍。新样本因此更快影响critic，也更容易被重复拟合。混合比例是优化设计，不可把重采样后的成功比例直接当线上成功率。",
          "sourceIds": [
            "paper"
          ],
          "formulas": [
            {
              "latex": "L(\\theta)=\\rho\\,\\mathbb E_{D_{\\rm off}}[\\ell_\\theta]+(1-\\rho)\\,\\mathbb E_{D_{\\rm on}}[\\ell_\\theta]",
              "explanation": "ρ是无单位离线比例；损失单位取决于ℓ，平方TD误差以奖励平方计。假设池内均匀抽样，ρ不由样本数自动决定。"
            }
          ]
        },
        {
          "heading": "UTD增加计算利用，也放大早期重复",
          "body": "设每次环境交互得到一个transition，critic更新U次，每次小批B。在线池有N条时，每条在线经验一次交互中被抽取的期望次数为UB(1−ρ)/N。取U=20、B=256、ρ=.5、N=100，结果25.6；这不是获得了25.6条新事实，而是重复利用同一条事实。\n\nRLPD把LayerNorm与随机Q集成用于抑制外推和过拟合；这些手段不会保证碰撞概率或真机安全。今日教学先固定低UTD检查源比例和TD误差，再在相同交互预算比较计算投入。每秒更新多不等于每秒控制快，训练可以异步，但参数版本和观测时间必须可追踪。",
          "sourceIds": [
            "paper",
            "learner"
          ]
        },
        {
          "heading": "先验不兼容时，混合也会污染目标",
          "body": "一份旧日志若把超时都当真终止，新日志却允许bootstrap，两个池对同一状态会给相反监督。持续任务的时间截断仍可用最终有效观测估值，真终止才切断后续；若定义本来就是有限时域任务，则剩余时间应进状态，不能机械把所有timeout设为可继续。\n\n上线初期下降要分别检查离线与在线TD误差、动作尺度、奖励版本及按场景成功，先排除接口变化再解释为探索成本。今天完成混合期望与更新次数手算，11月30日将统一数据覆盖、交互次数和评测预算，避免以更多真机尝试换来的收益冒充算法优势。",
          "sourceIds": [
            "src",
            "course"
          ]
        }
      ],
      "points": [
        "双池",
        "更新次数",
        "重复利用",
        "分布变化"
      ],
      "codeTitle": "mixture_reuse.py",
      "code": "import math\n\ndef reuse(n_off,n_on,b,u,rho):\n    if min(n_off,n_on,b,u)<=0 or not 0<=rho<=1:\n        raise ValueError('invalid count or mixture')\n    return u*b*rho/n_off,u*b*(1-rho)/n_on\nold,new=reuse(10000,100,256,20,.5)\nassert math.isclose(old,.256) and math.isclose(new,25.6)\nassert math.isclose(new/old,100)\nassert math.isclose(10000/(10000+100),100/101)\nfor args in [(0,100,256,20,.5),(1,1,1,1,1.1)]:\n    try: reuse(*args)\n    except ValueError: pass\n    else: raise AssertionError('bad mixture accepted')\nprint('per-transition reuse .256 vs 25.6; pooled old fraction=100/101')\n",
      "codeNotes": [
        "计算每条经验期望使用次数；只验证均匀双池模型，无训练。",
        "负例拒绝空池与非法比例，合池自然权重另算。"
      ],
      "exercise": {
        "prompt": "把在线池扩到1000条，保持B256/U20/半半，计算单条复用及其局限。",
        "steps": [
          "先保留源标签与单位，用手算建立预期。",
          "运行夹具并注入失败输入，解释改变的假设。"
        ],
        "solution": "在线每条2.56次，离线.256次，比例10；独立环境事实仍只新增一条，减少复用不自动消除分布偏移。"
      },
      "quiz": {
        "question": "为什么半半replay让一条在线经验受到100倍关注，UTD=20又增加了什么？",
        "hint": "从池大小、张量布局或固定场景权重开始推导。",
        "reference": "池大小10000与100时单位抽样概率比100；B256、U20、半半时每条在线经验期望被抽25.6次。UTD增加critic优化而非环境事实，不保证actor同频更新；须查源比例、过拟合、奖励和终止一致性。",
        "keywords": [
          "双池",
          "更新次数",
          "重复利用",
          "分布变化"
        ]
      },
      "sources": [
        {
          "id": "paper",
          "label": "RLPD作者论文v3",
          "url": "https://arxiv.org/html/2302.02948v3",
          "reading": "2023-03-09 v3；2026-11-24实读§3、4.1–4.4，区分在线使用既有数据与离线预训练。"
        },
        {
          "id": "src",
          "label": "RLPD作者训练入口",
          "url": "https://github.com/ikostrikov/rlpd/blob/main/train_finetuning.py",
          "reading": "2026-11-24实读main：combine、main的mask/双池采样；移动分支，非固定提交复现。"
        },
        {
          "id": "learner",
          "label": "RLPD作者SACLearner",
          "url": "https://github.com/ikostrikov/rlpd/blob/main/rlpd/agents/sac/sac_learner.py",
          "reading": "update分块、update_critic目标、update_actor均值、温度更新；不是完整PyTorch复现。"
        },
        {
          "id": "course",
          "label": "Spinning Up SAC公开课程",
          "url": "https://spinningup.openai.com/en/latest/algorithms/sac.html",
          "reading": "实读API参数start_steps/update_after、batch shape与目标网络说明；随机预热只适于受控环境。"
        }
      ]
    },
    "code": {
      "title": "精读RLPD：交错采样与critic更新的轴",
      "minutes": 40,
      "prerequisites": "已学11月28日IQL、SAC的TD目标，能读[B,A]与均匀采样期望。",
      "connection": "承接固定日志价值学习；今日增加经验来源与在线预算，衔接11月30日公平评测。",
      "intro": "沿作者真实训练入口定位数据布局，写一个可审计的合成采样夹具。",
      "outcomes": [
        "交错布局",
        "样本轴"
      ],
      "sections": [
        {
          "heading": "真实入口：插入transition后才构造双池大批",
          "body": "作者train_finetuning.py的main先env.step，计算mask，再把observations/actions/rewards/masks/dones/next_observations写入在线ReplayBuffer。start_training之前用随机动作收集；这是仿真研究脚本事实，不能照搬为SO-101随机动作启动。本课夹具只操作合成张量，没有环境或硬件入口。\n\n训练时先从两池各采batch_size×utd_ratio对应份额，再交给combine。观测可为嵌套字典，样本轴永远在第0维；动作[B,A]、奖励和mask[B]。若奖励意外成[B,1]，和[B]下一价值广播会生成[B,B]，每条transition的后果就与其他样本混合。",
          "sourceIds": [
            "src",
            "course"
          ]
        },
        {
          "heading": "交错布局为何关系每个UTD小批的来源",
          "body": "combine递归处理字典，把一池放偶数行、另一池放奇数行。SACLearner.update按连续区间切出U份，逐份更新critic，最后只用最后一份更新一次actor和temperature。因此U=20不是actor和critic都更新20次；读日志必须区分优化器更新计数。\n\n作者combine交错赋值隐含两池长度与奇偶槽位匹配，默认半半且偶数小批满足。虽然参数允许ρ在0到1之间，任意比例不保证此实现可用。原创例子明确只支持半半，拒绝奇数B和空在线池；若把两个池直接前后拼接，总量半半也可能让前几个critic小批全是离线数据。",
          "sourceIds": [
            "src",
            "learner"
          ]
        },
        {
          "heading": "从target到梯度：本课只复现采样契约",
          "body": "SACLearner.update_critic对下一状态采动作，从target ensemble子集中取最小Q；按配置决定是否减熵项，随后拟合日志动作的平方误差并更新target。update_actor对当前critic集成取均值。不能把target的min和actor的mean混为同一个轴归约，也不能把IQL的expectile放进这个SAC目标。\n\n下面代码是原创PyTorch采样布局夹具，省略网络、SAC损失、图像增强、优化器与异步执行。分别构造离线零标签和在线一标签，reshape到[U,B]后检查每块来源。第二部分检查时间截断保留bootstrap和真终止清零；这只验证数据语义，不是训练成功或上游基准复现。",
          "sourceIds": [
            "learner",
            "src"
          ]
        },
        {
          "heading": "正例、负例与定位顺序",
          "body": "逐段读代码：先检查U与B合法，再检查两个池至少有一行，用独立生成器有放回采索引，stack的第二轴用于交错，flatten只压合来源轴与样本轴。U=3、B=4应得到12行，每个小批恰有2条在线数据；固定种子重复调用应逐元素一致。\n\n负例依次注入空池、奇数小批、零UTD，并构造前后拼接的错误布局：它虽有6条在线总数，第一块却为0条。目标例r=.2、γ=.9、nextV=2时，截断目标2.0，真终止.2。调试先查来源标签与形状，再查mask，最后才查学习率，避免用优化参数掩盖数据错配。",
          "sourceIds": [
            "src",
            "learner"
          ]
        }
      ],
      "points": [
        "交错布局",
        "样本轴",
        "critic",
        "终止语义"
      ],
      "codeTitle": "interleave_replay.py",
      "code": "import torch\n\ndef half_mix(off,on,b,u,seed=7):\n    if b<=0 or b%2 or u<=0 or len(off)==0 or len(on)==0:\n        raise ValueError('need nonempty pools, even batch and positive UTD')\n    if off.shape[1:]!=on.shape[1:]: raise ValueError('feature shape mismatch')\n    g=torch.Generator().manual_seed(seed)\n    n=b*u//2\n    a=off[torch.randint(len(off),(n,),generator=g)]\n    c=on[torch.randint(len(on),(n,),generator=g)]\n    return torch.stack((a,c),dim=1).flatten(0,1)\noff=torch.zeros(5); on=torch.ones(2)\nx=half_mix(off,on,4,3)\nassert x.shape==(12,) and torch.equal(x,half_mix(off,on,4,3))\nassert torch.equal(x.reshape(3,4).sum(1),torch.tensor([2.,2.,2.]))\nwrong=torch.cat((torch.zeros(6),torch.ones(6))).reshape(3,4)\nassert wrong.sum()==6 and wrong[0].sum()==0\nr=torch.tensor([.2,.2]); terminated=torch.tensor([False,True])\ny=r+.9*(~terminated).float()*torch.tensor([2.,2.])\nassert torch.allclose(y,torch.tensor([2.,.2]))\nfor a,c,b,u in [(off,on,3,1),(off,on,4,0),(off,on[:0],4,1)]:\n    try: half_mix(a,c,b,u)\n    except ValueError: pass\n    else: raise AssertionError('invalid sampling contract accepted')\nprint('interleaved UTD source ratios and terminal bootstrap passed')\n",
      "codeNotes": [
        "第一段交错布局，第二段按[U,B]查各块，再核终止目标。",
        "合成PyTorch夹具，省略完整SAC/JAX训练；负例覆盖空池、奇数B与零UTD。"
      ],
      "exercise": {
        "prompt": "将交错改为cat，输出每个UTD块的在线条数，并解释终止目标。",
        "steps": [
          "先保留源标签与单位，用手算建立预期。",
          "运行夹具并注入失败输入，解释改变的假设。"
        ],
        "solution": "cat后在线数0/2/4；交错应2/2/2。真终止.2，时间截断在持续任务假设下2.0；不能用reset后新场景做next_obs。"
      },
      "quiz": {
        "question": "作者combine为何不能直接宣称支持任意offline_ratio？每个UTD块与actor频率如何核查？",
        "hint": "从池大小、张量布局或固定场景权重开始推导。",
        "reference": "偶奇槽位赋值隐含两池长度匹配，默认半半可满足，任意比例会赋值不兼容。每块连续切片应分别核来源，critic更新U次但actor和温度在末块仅更新一次；真终止mask0、持续任务时间截断用有效最终观测bootstrap。",
        "keywords": [
          "交错布局",
          "样本轴",
          "critic",
          "终止语义"
        ]
      },
      "sources": [
        {
          "id": "paper",
          "label": "RLPD作者论文v3",
          "url": "https://arxiv.org/html/2302.02948v3",
          "reading": "2023-03-09 v3；2026-11-24实读§3、4.1–4.4，区分在线使用既有数据与离线预训练。"
        },
        {
          "id": "src",
          "label": "RLPD作者训练入口",
          "url": "https://github.com/ikostrikov/rlpd/blob/main/train_finetuning.py",
          "reading": "2026-11-24实读main：combine、main的mask/双池采样；移动分支，非固定提交复现。"
        },
        {
          "id": "learner",
          "label": "RLPD作者SACLearner",
          "url": "https://github.com/ikostrikov/rlpd/blob/main/rlpd/agents/sac/sac_learner.py",
          "reading": "update分块、update_critic目标、update_actor均值、温度更新；不是完整PyTorch复现。"
        },
        {
          "id": "course",
          "label": "Spinning Up SAC公开课程",
          "url": "https://spinningup.openai.com/en/latest/algorithms/sac.html",
          "reading": "实读API参数start_steps/update_after、batch shape与目标网络说明；随机预热只适于受控环境。"
        }
      ]
    },
    "insight": {
      "title": "小步上线：RAW分层、经验来源与版本回退",
      "minutes": 25,
      "prerequisites": "已学11月28日IQL、SAC的TD目标，能读[B,A]与均匀采样期望。",
      "connection": "承接固定日志价值学习；今日增加经验来源与在线预算，衔接11月30日公平评测。",
      "intro": "把感知表示、仿真来源与学习预算放进同一可反驳实验方案。",
      "outcomes": [
        "分层成功",
        "固定权重"
      ],
      "sections": [
        {
          "heading": "把小步上线定义为可审计的经验增量",
          "body": "先以离线模型快照建立固定场景回放，再在交互仿真中分批收集新经验、冻结评测并观察最差场景。小步指受限交互预算和可回退参数版本，而不是把学习率缩小就称安全。动作必须经过明确控制器，记录proposed与executed，急停或接管后的transition需标注执行事实。\n\n对于个人Mac和租用单卡，先冻结视觉encoder比较低UTD与较高UTD的训练耗时、Q尺度及分层成功。高UTD节省物理采集却增加计算和旧数据过拟合，降低离线比例让恢复失败更快进入学习却可能忘记原成功技能。今天仅给方案与合成计数，没有租卡吞吐或真机改进实测。",
          "sourceIds": [
            "paper",
            "course"
          ]
        },
        {
          "heading": "固定评价分布才能解释RAW带来的变化",
          "body": "RAW实验应固定任务、轨迹切分、动作、奖励与两池比例，仅换感知表示。把常规和高反光场景分层，评测权重预先固定，例如反光占20%、常规占80%，各层成功率分别.5和.9，总体为.82。训练中重采样反光失败可以有用，评测时却不能把它的权重偷偷改成50%。\n\n另一模型各层.7和.85，固定权重总体.82；两者平均相同但恢复能力与常规技能退化不同。你的传感器优势应体现为减少状态别名、提高反光层恢复，并报告代价。只改善重采样训练损失，或只挑最有利光照，均不足以支持RAW闭环价值。",
          "sourceIds": [
            "paper"
          ],
          "formulas": [
            {
              "latex": "S_{\\rm eval}=\\sum_{k=1}^K p_k s_k,\\qquad \\sum_k p_k=1",
              "explanation": "p是预先固定的场景比例，s是该场景独立试验成功率，二者无单位；这里是教学假设，不是实验测得。与训练replay比例分开。"
            }
          ]
        },
        {
          "heading": "双团队路线分别提供环境和未来预测",
          "body": "StanfordVL的BEHAVIOR/OmniGibson用任务谓词、对象状态和控制器形成可交互评测，适合检验恢复与任务完成。World Labs R2S2R从真实任务构建可控仿真变化，作用是扩展环境经验；仿真来源要单独标记，不可把生成世界当真实在线数据。两者的组织和评测主张须分别引用。\n\nMeta/FAIR的V-JEPA 2-AC用视觉表征与动作条件预测后果，以目标图代价选择动作；它不是replay混合器也不是SAC的Q。AMI Labs当前公开的是表征预测、规划和可靠性方向，不能据此宣布已有在线RL成绩。可验证问题是冻结这些表示后，曝光扰动下Q排序与恢复是否稳定，仍需独立闭环对照。",
          "sourceIds": [
            "behavior",
            "world",
            "meta",
            "ami"
          ]
        },
        {
          "heading": "Agent提出采集计划，执行层回传真实后果",
          "body": "若高层Agent将失败分为抓空、滑落和视觉误判，它可建议下一轮仿真任务并调用VLA技能；控制器执行动作后，实际观测、执行动作、延迟和接管标记回流状态记忆。世界模型预测应另存，不能把预测成功写成真实奖励，否则混合池会污染为自我确认的虚构经验。\n\n今日StanfordVL后端升级与旋转误差修复提醒我们：模拟器版本、观测渲染和成功判据变化时，旧池与新池可能不可直接合并，先做同场景回归并留版本字段。上线验收同时看成功、P95等待、恢复与接管；这种机制关联用于11月29日延伸，单次更新无需改动既定课程主题。",
          "sourceIds": [
            "behavior",
            "src",
            "migration"
          ]
        }
      ],
      "points": [
        "分层成功",
        "固定权重",
        "执行事实",
        "参数版本"
      ],
      "codeTitle": "fixed_strata.py",
      "code": "import math\n\ndef evaluate(weights,rates):\n    if len(weights)!=len(rates) or not weights: raise ValueError('shape')\n    if not all(math.isfinite(x) and 0<=x<=1 for x in weights+rates):\n        raise ValueError('finite probabilities required')\n    if not math.isclose(sum(weights),1.): raise ValueError('weights sum')\n    return sum(p*s for p,s in zip(weights,rates))\na=evaluate([.2,.8],[.5,.9]); b=evaluate([.2,.8],[.7,.85])\nassert math.isclose(a,.82) and math.isclose(b,.82)\nassert not math.isclose(evaluate([.5,.5],[.5,.9]),a)\nfor p,s in [([.2,.7],[.5,.9]),([1.],[float('nan')])]:\n    try: evaluate(p,s)\n    except ValueError: pass\n    else: raise AssertionError('invalid report accepted')\nprint('fixed-stratum success .82; changing replay weights changes the question')\n",
      "codeNotes": [
        "固定评测权重后比较两个分层成功率，所有数字均为教学假设。",
        "负例拒绝不归一权重与NaN；不运行真实或仿真设备。"
      ],
      "exercise": {
        "prompt": "把反光评价权重改成.5，计算两模型总体并解释能否与原.82比较。",
        "steps": [
          "先保留源标签与单位，用手算建立预期。",
          "运行夹具并注入失败输入，解释改变的假设。"
        ],
        "solution": "模型A为.7、B为.775；这是另一个评测分布，不能当同协议提升。应同时保留.2/.8结果、分层和独立试验数。"
      },
      "quiz": {
        "question": "两个模型固定评价均为.82，为何仍要报告分层结果和replay来源？",
        "hint": "从池大小、张量布局或固定场景权重开始推导。",
        "reference": "反光/常规分别.5/.9与.7/.85在.2/.8固定权重下同为.82，但恢复收益伴常规退化。训练采样分布不当评测权重，仿真/真机与预测后果要分开；Agent调用技能后须由控制器执行、真实观测闭环回流并记录延迟与接管。",
        "keywords": [
          "分层成功",
          "固定权重",
          "执行事实",
          "参数版本"
        ]
      },
      "sources": [
        {
          "id": "paper",
          "label": "RLPD作者论文v3",
          "url": "https://arxiv.org/html/2302.02948v3",
          "reading": "2023-03-09 v3；2026-11-24实读§3、4.1–4.4，区分在线使用既有数据与离线预训练。"
        },
        {
          "id": "src",
          "label": "RLPD作者训练入口",
          "url": "https://github.com/ikostrikov/rlpd/blob/main/train_finetuning.py",
          "reading": "2026-11-24实读main：combine、main的mask/双池采样；移动分支，非固定提交复现。"
        },
        {
          "id": "learner",
          "label": "RLPD作者SACLearner",
          "url": "https://github.com/ikostrikov/rlpd/blob/main/rlpd/agents/sac/sac_learner.py",
          "reading": "update分块、update_critic目标、update_actor均值、温度更新；不是完整PyTorch复现。"
        },
        {
          "id": "course",
          "label": "Spinning Up SAC公开课程",
          "url": "https://spinningup.openai.com/en/latest/algorithms/sac.html",
          "reading": "实读API参数start_steps/update_after、batch shape与目标网络说明；随机预热只适于受控环境。"
        },
        {
          "id": "behavior",
          "label": "StanfordVL BEHAVIOR更新",
          "url": "https://behavior.stanford.edu/challenge/updates.html",
          "reading": "任务与评测入口；2026-11-24读Newton RGB提交30880c2、环境迁移152dc803、姿态差cc20c420；未执行上游仿真。"
        },
        {
          "id": "world",
          "label": "World Labs R2S2R",
          "url": "https://worldlabs.ai/blog/real-to-sim-to-real",
          "reading": "原始2026-07-28；重建真实任务、外观/物理/相机等变体，与StanfordVL分属。"
        },
        {
          "id": "meta",
          "label": "Meta V-JEPA 2",
          "url": "https://ai.meta.com/research/vjepa/",
          "reading": "Planning for robotic control：DROID动作条件与目标图规划，不是replay算法。"
        },
        {
          "id": "ami",
          "label": "AMI Labs当前方向",
          "url": "https://amilabs.xyz/",
          "reading": "表征空间预测、动作条件规划与安全；无新日期模型或在线RL成绩。"
        },
        {
          "id": "migration",
          "label": "StanfordVL Newton渲染固定提交",
          "url": "https://github.com/StanfordVL/BEHAVIOR-1K/commit/30880c2c6b6160aee5bc43478f6fd00652749251",
          "reading": "2026-11-24实读NewtonViewerRenderBackend：只支持RGB，相机姿态与FOV共享viewer；配合152dc803环境迁移与cc20c420姿态差补丁，不宣称本轮实跑。"
        }
      ]
    }
  }
};
