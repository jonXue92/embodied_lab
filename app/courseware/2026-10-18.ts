import type { AuthoredDay } from './types';

const sources = [
  { id: 'pi05Paper48', label: 'Physical Intelligence · π0.5 原论文', url: 'https://arxiv.org/abs/2504.16054', reading: '2026-10-15 实读 `III、`IV-A—D、`V-A—E 与附录评测：两阶段训练、高低层分解、MM/ME/CE/HL/WD/VI 数据、全新住宅评测、环境数量缩放与数据源消融。' },
  { id: 'pi05Blog48', label: 'Physical Intelligence · π0.5 官方项目页', url: 'https://www.pi.website/blog/pi05', reading: '2026-10-15 实读训练与推理、OOD object 消融和失败说明：先生成文本子任务，再以子任务条件生成 50 步连续动作；官方明确模型仍会在高层语义和低层控制两处犯错。' },
  { id: 'openpiPi048', label: 'openpi · models/pi0.py 固定提交', url: 'https://github.com/Physical-Intelligence/openpi/blob/215abfb217dbac7d5f1273282331b9b1866c0479/src/openpi/models/pi0.py', reading: '2026-10-15 实读 embed_prefix、embed_suffix、compute_loss 与 sample_actions：pi05 分支以 adaRMS 时间条件进入 action expert，公开 compute_loss 是连续 flow MSE；没有论文完整高层文本解码与混合数据 recipe。' },
  { id: 'openpiConfig48', label: 'openpi · training/config.py 固定提交', url: 'https://github.com/Physical-Intelligence/openpi/blob/215abfb217dbac7d5f1273282331b9b1866c0479/src/openpi/training/config.py', reading: '2026-10-15 实读 LeRobotLiberoDataConfig.create 与 pi05_libero：prompt_from_task、extra_delta_transform=False、action_horizon=10、discrete_state_input=False、pi05_base 权重和 30k 步配置。' },
  { id: 'openpiPolicy48', label: 'openpi · policies/libero_policy.py 固定提交', url: 'https://github.com/Physical-Intelligence/openpi/blob/215abfb217dbac7d5f1273282331b9b1866c0479/src/openpi/policies/libero_policy.py', reading: '2026-10-15 实读 LiberoInputs/LiberoOutputs：训练与推理共享输入变换，图像 HWC/uint8 转换、缺失右腕图像及 mask、prompt 透传、动作输出裁到前 7 维。' },
  { id: 'openpiReadme48', label: 'openpi · LIBERO README 固定提交', url: 'https://github.com/Physical-Intelligence/openpi/blob/215abfb217dbac7d5f1273282331b9b1866c0479/examples/libero/README.md', reading: '2026-10-15 实读 serve_policy、任务套件选择与公开结果；96.85 是四个 LIBERO 套件平均，不是论文新住宅开放世界结论。' },
  { id: 'behavior48', label: 'StanfordVL · BEHAVIOR Evaluation', url: 'https://behavior.stanford.edu/challenge/evaluation.html', reading: '2026-10-15 复核公开/隐藏实例、BDDL 谓词与部分成功评测；适合构造任务目标和隐藏实例审计，归属 StanfordVL。' },
  { id: 'atlas48', label: 'World Labs · Atlas', url: 'https://www.worldlabs.ai/blog/atlas', reading: '2026-10-15 复核多模态共享空间上下文和可控场景变体；可作为环境压力测试来源，不能当作 π0.5 的训练数据或实证。' },
  { id: 'vjepa48', label: 'Meta/FAIR · V-JEPA 2 官方页', url: 'https://ai.meta.com/research/vjepa/', reading: '2026-10-15 复核视频自监督表征与动作条件规划；属于 Meta/FAIR 历史谱系，预测目标与 π0.5 的层级 VLA 不同。' },
  { id: 'ami48', label: 'AMI Labs · 官方研究方向', url: 'https://amilabs.xyz/', reading: '2026-10-15 复核表征空间预测、动作条件世界模型与可靠性方向；当前愿景不能写成已发布开放世界机器人结果。' },
];

export const day48: AuthoredDay = {
  reviewedAt: '2026-10-15', revision: '逐课编写 1.0',
  deliverable: '一张开放世界泛化坐标表；一个环境/物体组隔离的 manifest 审计器；一份 SO-101 最坏组置信下界晋级表。三课共100分钟，另留20分钟复盘。',
  question: {
    title: '模型在一个没见过的房间完成见过的抓取任务，是否足以宣称“开放世界泛化”？',
    summary: '区分环境、物体、指令、任务组合和本体五条外推轴，并检查训练—测试污染。',
    keywords: ['environment holdout', 'object holdout', 'task composition', 'language following', 'leakage audit', 'worst group'],
    reference: '不足。它只支持“环境轴外推”，而且前提是房间身份、相机轨迹和近重复片段没有泄漏。开放世界主张还应分别报告未见物体、语言改写、任务组合和必要时本体变化，并把高层子任务正确率与低层执行成功率分开。π0.5 的证据来自全新住宅、数据源消融、环境数量缩放、语言跟随和分阶段任务得分的组合；个人项目只能按实际覆盖的轴缩小结论。',
  },
  lessons: {
    foundation: {
      title: 'π0.5 开放世界泛化：先定义“未见”，再解释层级策略', minutes: 35,
      prerequisites: '已完成10-15异构本体与动作统计、10-16任务prompt与数据混合、10-17 Knowledge Insulation；理解条件概率和action chunk。',
      connection: '前一日解决如何减少机器人后训练损伤语义；今天检查语义是否真的迁移到未见环境和物体。10-19将比较大VLA与小VLA的算力、时延和证据成本。',
      intro: '“新房间成功”不是一个自解释标签。必须先写清训练集合与测试集合在哪些轴互斥，再把高层选对子任务和低层把动作做成两种不同失败。',
      outcomes: ['列出环境、物体、语言、任务组合与本体五条外推轴', '推导π0.5高层—低层条件分解并识别误差来源', '用数值例说明单一平均分如何掩盖最坏组失败'],
      sections: [
        { heading: '01 开放世界不是“测试图片不同”，而是外推轴有证据地隔离', body: '把每条episode描述为(env_id, object_family, instruction_family, task_graph, embodiment)。随机按episode切分会把同一房间、同一物体实例甚至相邻视频片段放进训练和测试，得到的只是插值。真正的环境外推要求测试env_id从未参与训练；物体外推还要按语义族或实例谱系隔离；组合外推则要求目标关系或子任务顺序是新的。\n\n论文的主张主要建立在未参与训练的新住宅、OOD指定物体、不同训练环境数量和多源数据消融上。它并没有证明所有可能的新技能、本体或动力学都能零样本解决。课程因此把“开放世界”写成一组带边界的测试，不把一次新背景成功扩大成通用智能。', sourceIds: ['pi05Paper48', 'pi05Blog48'] },
        { heading: '02 同一模型做两次推理，但两层条件不同', body: '令高层任务指令为ℓ、当前多相机与本体观测为o_t、文本子任务为ℓ̂、动作块为a。论文把联合策略分解为先求π(ℓ̂|o_t,ℓ)，再求π(a|o_t,ℓ̂)。高层回答“下一步做什么”，低层回答“怎样以关节动作完成这一步”；两次推理共享模型参数，但低层显式条件是预测出的子任务。\n\n这不是说原始任务ℓ在因果世界中真的与动作无关，而是模型采用的结构化接口。若高层把杯子识别成盘子，低层即使完美执行也会做错目标；若高层正确而抓取失败，则应归因于感知—控制链。调试时必须记录ℓ、ℓ̂、动作、执行结果和阶段得分，不能只保存最终成功位。', formulas: [{ latex: String.raw`\pi_{\theta}(a_{t:t+H},\hat\ell\mid o_t,\ell)=\pi_{\theta}(a_{t:t+H}\mid o_t,\hat\ell)\,\pi_{\theta}(\hat\ell\mid o_t,\ell)`, explanation: 'ℓ是长程任务，ℓ̂是模型生成的下一子任务，o_t是当前观测，a是长度H+1的动作块；分解把高层语义错误和低层执行错误变成可分别测量的接口。' }], sourceIds: ['pi05Paper48', 'pi05Blog48'] },
        { heading: '03 多源数据解决的是不同泛化缺口', body: '论文预训练混合移动操作MM、多环境静态机器人ME、跨本体CE、高层子任务HL和网页多模态WD；后训练聚焦移动操作并加入语言指导VI和连续flow专家。WD主要补物体语义与高层知识，ME扩大场景覆盖，CE迁移基础动作经验，HL/VI把长任务拆成可执行步骤。删除某一源的消融回答“这个数据源对哪类测试有贡献”，不是证明数据越杂越好。\n\n项目页给出的OOD组中，完整模型语言跟随与成功率均为94%，去掉WD后分别降至80%与74%，去掉CE后为67%与49%，去掉ME后为33%与31%。这些是特定实验协议中的百分点，不能直接当作SO-101预期收益；但它示范了正确问题：固定其余条件，只删除一个信息源，再看它影响的是识别、遵循还是执行。', sourceIds: ['pi05Paper48', 'pi05Blog48'] },
        { heading: '04 平均成功率会把“开放世界最弱轴”藏起来', body: '假设测试矩阵包含已见环境/已见物体90%、新环境/已见物体70%、已见环境/新物体65%、新环境/新物体25%，四组等权平均是62.5%。若只报平均，读者可能以为泛化尚可；但真正部署最关心的联合外推只有25%。应同时给每组样本数、成功率、语言跟随率、阶段得分和最坏组。\n\n定义训练环境集合E_tr和测试集合E_te，泄漏率L_env=|E_tr∩E_te|/|E_te|。只要L_env>0，就不能把整套测试称为纯环境holdout；应移除污染组或分开报告。相同审计还要应用于房屋视频指纹、物体实例、prompt模板和任务图，避免“ID不同但内容近重复”的软泄漏。', formulas: [{ latex: String.raw`L_{\mathrm{env}}=\frac{|E_{\mathrm{train}}\cap E_{\mathrm{test}}|}{|E_{\mathrm{test}}|},\qquad S_{\mathrm{worst}}=\min_{g\in\mathcal G}\frac{\sum_{i\in g} y_i}{|g|}`, explanation: 'Lenv量化测试环境身份污染；G是预先定义的环境×物体等测试组，yi是单次是否成功。例中平均62.5%，但Sworst只有25%。' }], sourceIds: ['pi05Paper48'] },
      ],
      points: ['未见必须按轴定义并做身份与近重复审计。', '高层子任务和低层动作要分层记录失败。', '多源消融只能支持协议内的因果比较。'],
      codeTitle: 'generalization_axes.py · 原创外推坐标与泄漏算例',
      code: String.raw`def audit(train, test):
    axes=("env","object","instruction","task","embodiment")
    if not train or not test:
        raise ValueError("empty split")
    overlap={a: sorted({x[a] for x in train}&{x[a] for x in test}) for a in axes}
    return {"overlap":overlap,
            "held_out":[a for a in axes if not overlap[a]]}

train=[{"env":"home_a","object":"cup","instruction":"tidy","task":"pick_place","embodiment":"so101"}]
test=[{"env":"home_b","object":"bowl","instruction":"clear","task":"sort","embodiment":"so101"}]
r=audit(train,test)
assert set(r["held_out"])=={"env","object","instruction","task"}
assert r["overlap"]["embodiment"]==["so101"]
try:
    audit(train,[]); raise AssertionError("empty test accepted")
except ValueError: pass
print("generalization axes and negative control: PASS")`,
      codeNotes: ['字典只演示声明式审计，不替代感知哈希或视频近重复检测。', '正例准确声明四条holdout轴，同时不冒充跨本体泛化。', '负例拒绝空测试集，避免“零样本因此零失败”的伪结论。'],
      exercise: { prompt: '若测试有20个环境，其中2个也出现在训练集；新物体组成功15/40、已见物体组成功36/40，求环境泄漏率与最坏组成功率。', steps: ['用交集环境数除以测试环境总数。', '分别求两组成功率并取最小。'], solution: 'L_env=2/20=10%，因此不能称为纯环境holdout；新物体组37.5%，已见物体组90%，S_worst=37.5%。应先清理污染环境，再重算各组。' },
      quiz: { question: '为什么“测试集任务名没出现过”仍不足以证明任务组合泛化？', hint: '检查任务图、物体、场景和语言模板。', keywords: ['task graph', 'near duplicate', 'environment identity', 'object family', 'compositional split'], reference: '任务名可能只是别名；底层子任务图、物体实例、场景轨迹和prompt模板仍与训练近重复。需要规范化任务图和语义族，按组合单元隔离，并审计视频/状态近重复，才能说明新的是组合而非字符串。' },
      sources: sources.slice(0, 2),
    },
    code: {
      title: '源码边界与manifest：公开Libero路径不等于新住宅recipe', minutes: 40,
      prerequisites: '能读Python数据变换、mask和配置；理解10-15的动作语义与10-16的数据混合身份。',
      connection: '把论文主张映射到公开openpi确实存在的模型/数据入口，再建立个人数据的组隔离清单；路线课会用该清单计算置信下界。',
      intro: '源码精读的重点不是“找到pi05字符串”，而是确认公开代码能支持哪些结论、哪些论文训练细节仍未公开。随后用原创manifest审计器把env/object身份变成可执行门。',
      outcomes: ['定位pi05模型、Libero变换和评测入口', '解释公开96.85与新住宅开放世界证据的差别', '运行组隔离manifest的正负测试'],
      sections: [
        { heading: '01 pi05开关改变动作专家条件方式，不自动带来开放世界数据', body: '固定提交的Pi0构造函数在pi05=True时建立time_mlp_in/out；embed_suffix不再插入单独state_proj token，而把时间嵌入经MLP作为adaRMS条件交给动作专家。embed_prefix仍把各视角图像与tokenized_prompt拼成prefix。compute_loss采样noise和time，构造x_t与u_t，联合前向后对v_t-u_t求MSE。\n\n这些函数解释连续动作训练和采样的张量路径，却没有论文中的MM/ME/CE/HL/WD/VI采样器、文本子任务解码循环或新住宅评测清单。模型配置名不能替代数据 provenance；若只用单一SO-101数据微调，最多声称该checkpoint上的迁移，不能继承论文全部开放世界结论。', sourceIds: ['openpiPi048', 'pi05Paper48'] },
        { heading: '02 LiberoInputs把训练与推理字段压到同一契约', body: 'LiberoInputs.__call__把float CHW图像转换为uint8 HWC，构造base_0_rgb、left_wrist_0_rgb和零填充right_wrist_0_rgb，并为缺失右腕图像设置mask；state、actions和prompt按存在性写入模型输入。LiberoOutputs只返回动作前7维，明确数据动作维与模型padding维的边界。\n\nLeRobotLiberoDataConfig.create先repack observation/image、wrist_image、state、actions和prompt，再挂载相同输入/输出变换。这个一致性对未见环境尤其重要：若测试端图像dtype、视角key或动作裁剪不同，所谓OOD下降可能只是接口漂移。必须在切分前固定schema，在每组统计缺失相机和mask比例。', sourceIds: ['openpiPolicy48', 'openpiConfig48'] },
        { heading: '03 pi05_libero是公开迁移样例，不是论文复现实验', body: '固定配置pi05_libero使用Pi0Config(pi05=True, action_horizon=10, discrete_state_input=False)、prompt_from_task=True、extra_delta_transform=False、pi05_base权重、batch 256和30k步。README给出四个LIBERO套件平均96.85，并提供server/client运行入口。\n\n这个结果验证公开checkpoint可在LIBERO协议微调与评测；它没有使用论文的50步一秒移动操作chunk，也没有公开100多个住宅的训练混合。课程把函数定位当作工程接口证据，把论文当作训练/评测机制证据，绝不把二者拼成“开源代码已复现新住宅94%”。', sourceIds: ['openpiConfig48', 'openpiReadme48', 'pi05Blog48'] },
        { heading: '04 manifest先做硬身份隔离，再检查软近重复', body: '原创实现要求每个episode带episode、env、object_group和split；训练与测试不能共享episode或env。对物体外推协议还要求object_group互斥。故意失败样本复用env，审计器必须抛错；这比训练后发现分数异常高更便宜。\n\n生产版还应加入视频感知哈希、相机标定指纹、轨迹时间邻近和任务图规范化。若同一段长录制被切成多个episode，ID互斥仍可能泄漏；需要在原始采集session层先分组，再向下生成episode。教学代码只验证硬字段，不冒充完整去重系统。' },
      ],
      points: ['pi05开关是模型路径，不是数据泛化证明。', '训练/推理变换漂移会伪装成OOD问题。', '先按采集组切分，再生成episode。'],
      codeTitle: 'split_manifest.py · 原创环境/物体隔离正负测试',
      code: String.raw`def validate(rows, holdout_object=False):
    required={"episode","env","object_group","split"}
    if not rows or any(set(r)!=required for r in rows):
        raise ValueError("manifest schema mismatch")
    train=[r for r in rows if r["split"]=="train"]
    test=[r for r in rows if r["split"]=="test"]
    if len(train)+len(test)!=len(rows) or not train or not test:
        raise ValueError("bad split labels")
    for key in ("episode","env"):
        if {r[key] for r in train}&{r[key] for r in test}:
            raise ValueError(f"{key} leakage")
    if holdout_object and ({r["object_group"] for r in train}&{r["object_group"] for r in test}):
        raise ValueError("object leakage")
    return {"train":len(train),"test":len(test)}

clean=[{"episode":"e1","env":"desk_a","object_group":"cup","split":"train"},
       {"episode":"e2","env":"desk_b","object_group":"bowl","split":"test"}]
assert validate(clean,True)=={"train":1,"test":1}
leaky=[clean[0],{"episode":"e3","env":"desk_a","object_group":"bowl","split":"test"}]
try:
    validate(leaky,True); raise AssertionError("environment leakage accepted")
except ValueError as exc: assert "env leakage" in str(exc)
print("hard-group split and leakage rejection: PASS")`,
      codeNotes: ['精确字段集合避免漏写身份后被默认成不同组。', '正例同时隔离环境与物体；负例复用desk_a并被拒绝。', '真实数据还需session ID和近重复检测，本例仅做硬身份门。'],
      exercise: { prompt: '同一采集session在房间A连续录制100段，再随机取20段测试；即使episode ID互斥，为什么仍泄漏？如何修复？', steps: ['判断共享的上游随机因素。', '决定在哪一级做group split。'], solution: '相邻片段共享房间布局、光照、相机标定、操作者习惯和轨迹上下文，episode ID不同只是文件级互斥。应为原始session或env-session组合分组，先把整个组分到train/test，再切episode，并用时间邻近与感知哈希复核。' },
      quiz: { question: '为什么openpi README中的LIBERO 96.85不能直接支持π0.5论文的新住宅泛化主张？', hint: '比较数据、动作时域和评测协议。', keywords: ['LIBERO protocol', 'fine-tuning', 'new homes', 'data mixture', 'evidence boundary'], reference: '96.85来自公开pi05_libero配置在四个LIBERO套件的微调评测，证明的是该代码路径与协议内性能。论文新住宅结论使用不同的多源预训练/后训练混合、移动操作系统、层级推理和真实住宅评测；两者不能因共享模型名而互相替代。' },
      sources: sources.slice(0, 6),
    },
    insight: {
      title: 'SO-101 泛化证据梯：用最坏组下界决定是否晋级', minutes: 25,
      prerequisites: '已有固定数据schema、环境/物体manifest和基础回放；理解成功率、样本量与置信区间。',
      connection: '把开放世界主张缩成个人算力可证伪的四组实验；下一日将据此比较大VLA与小VLA在显存、时延和闭环证据上的投入产出。',
      intro: '个人项目不需要复制100个住宅，但必须让结论与样本量匹配：先通过离线接口门，再看组隔离回放、仿真压力测试，最后才是经授权的低风险真机。',
      outcomes: ['设计环境×物体四组矩阵', '计算成功率Wilson下界并拒绝小样本虚高', '把双团队资料放进正确的测试角色而非错误归因'],
      sections: [
        { heading: '01 四组矩阵把“新在哪里”变成可见结果', body: '固定任务图和SO-101本体，建立seen-env/seen-object、new-env/seen-object、seen-env/new-object、new-env/new-object四组；每组使用独立采集session、同样次数和终止条件。语言再加同义改写与最小对立，分别记录子任务选择、动作执行、阶段进展、限幅和人工介入。\n\n若预算不足，宁可每次只支持“环境外推”或“物体外推”一条结论，也不要把两组各5次成功写成开放世界。先冻结baseline、checkpoint、prompt集和失败判据，再运行候选；测试过程中新增的恢复数据必须进入下一版本，不能回填当前测试。' },
        { heading: '02 晋级看最坏组置信下界，不看最好一次', body: '对每组成功s次、总试验n次，用Wilson下界抵抗小样本虚高。若某组15/20成功，点估计75%，95%下界约53.1%；它比“最好一次成功”诚实，也提醒20次仍不够精确。预注册门可以要求每个关键组下界超过基线下界，且安全事件为零。\n\nWilson区间仍假设试验近似独立；在同一光照下一口气跑20次会低估不确定性。应跨时间块和物体摆位交错策略版本，保存每次原始结果。若发生硬件故障，应按预注册规则标记取消原因，不能只删除候选失败而保留基线失败。', formulas: [{ latex: String.raw`\operatorname{LCB}_{95}(s,n)=\frac{\hat p+\frac{z^2}{2n}-z\sqrt{\frac{\hat p(1-\hat p)}{n}+\frac{z^2}{4n^2}}}{1+\frac{z^2}{n}},\quad \hat p=\frac{s}{n},\ z=1.96`, explanation: 's是成功次数、n是预注册试验数。s=15,n=20时点估计75%，Wilson 95%下界约53.1%，晋级判断应看到这份不确定性。' }] },
        { heading: '03 双团队主线用于扩展测试面，不替代策略证据', body: 'StanfordVL/BEHAVIOR的BDDL目标、公开/隐藏实例和部分成功适合规范任务图与防止实例过拟合；World Labs Atlas的可控空间与相机/RGB-depth变体可启发生成环境压力测试。前者是任务/评测线，后者是空间生成与仿真线，生成场景上的成功仍需真机外部有效性检查。\n\n二者都没有发布π0.5的同一策略或SO-101迁移结果。课程只借用任务规范和环境变体来扩展测试矩阵，并分别标注来源；若合成组更难或更易，也要单列分布差异，不能把生成规模直接等同于真实环境多样性。', sourceIds: ['behavior48', 'atlas48'] },
        { heading: '04 JEPA谱系回答另一种预测问题，不能混成π0.5证明', body: 'Meta/FAIR V-JEPA 2从视频学习表征并展示动作条件规划，关注在latent空间预测未来与选择动作；AMI Labs当前公开方向强调表征空间预测、动作条件世界模型、可靠性与安全。它们可以为“未见场景下表征是否稳定、预测是否校准”提供对照问题，但不是π0.5层级VLA的同一目标。\n\n个人路线先完成可审计的VLA四组矩阵，再把冻结JEPA特征或简单latent预测器作为额外probe；不要在一次小样本实验里同时更换policy、表征、数据和仿真器。若World Labs生成场景改善仿真成绩，也只能归因于该压力测试覆盖，除非有真实SO-101组验证迁移。', sourceIds: ['vjepa48', 'ami48'] },
      ],
      points: ['结论按holdout轴缩小，不按模型名扩大。', '最坏组Wilson下界约束小样本乐观。', '生成世界与latent预测是测试/对照资源，不是VLA成功替身。'],
      codeTitle: 'worst_group_lcb.py · 原创最坏组Wilson门',
      code: String.raw`from math import sqrt

def wilson_lcb(success,total,z=1.96):
    if not (0 <= success <= total) or total <= 0:
        raise ValueError("invalid binomial count")
    p=success/total
    return (p+z*z/(2*total)-z*sqrt(p*(1-p)/total+z*z/(4*total*total)))/(1+z*z/total)

def gate(groups,threshold=.50):
    if not groups: raise ValueError("no groups")
    lcbs={name:wilson_lcb(*count) for name,count in groups.items()}
    return min(lcbs,key=lcbs.get),min(lcbs.values()),all(v>=threshold for v in lcbs.values())

groups={"seen/seen":(19,20),"new/seen":(17,20),"seen/new":(16,20),"new/new":(15,20)}
worst,lcb,promote=gate(groups)
assert worst=="new/new" and .53 < lcb < .54 and promote
try:
    wilson_lcb(2,1); raise AssertionError("bad count accepted")
except ValueError: pass
print("worst-group confidence gate and negative count: PASS")`,
      codeNotes: ['count元组顺序是(success,total)，所有组使用同一95% z值。', '15/20的最坏组下界约53.1%，刚超过预注册50%门。', '负例拒绝成功数大于试验数；真实报告还要列安全事件和取消原因。'],
      exercise: { prompt: '候选四组点估计均高于70%，但new/new只有8/10成功；为什么仍不应写“稳定80%”？', steps: ['计算或估计8/10的Wilson下界。', '解释样本相关性与最坏组要求。'], solution: '8/10点估计80%，95% Wilson下界仅约49.0%，不支持“稳定80%”。还需跨时间块和摆位增加独立试验，并同时通过其余组、安全和语言门；当前最多报告10次中的观察值。' },
      quiz: { question: '若Atlas生成的100个新房间中策略成功率上升，为什么还不能直接宣称SO-101真机环境泛化提升？', hint: '区分覆盖扩展和外部有效性。', keywords: ['synthetic environment', 'sim2real', 'external validity', 'held-out real world', 'attribution'], reference: '生成房间扩展了仿真压力测试覆盖，但渲染、物理、相机与动作误差可能与真机不同。必须在预留真实环境组复验，并固定policy与评测协议；否则只能说仿真分布上的表现改善，不能推出真机环境泛化。' },
      sources: sources.slice(6),
    },
  },
};
