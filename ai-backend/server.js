const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ⚠️ 换成你在魔搭社区复制的 ms- 开头的令牌
const API_KEY = 'ms-你的令牌填在这里'; 
const API_URL = 'https://api-inference.modelscope.cn/v1/chat/completions'; 
const MODEL_NAME = 'Qwen/Qwen2.5-7B-Instruct'; 

app.post('/api/game', async (req, res) => {
    const { message, history } = req.body;
    
    try {
        const systemPrompt = `你是一个2D虚拟房间里的NPC。用户是上帝视角。
请根据用户的输入、环境变化和你的当前状态，返回你的反应。
你必须且只能返回一个合法的JSON对象，不要包含任何其他文字或Markdown符号。
JSON格式如下：
{
  "dialogue": "你想说的话",
  "action": "walking / idle / sleeping / eating / playing",
  "x": 目标位置X轴 (0到100的整数),
  "y": 目标位置Y轴 (0到100的整数),
  "mood": "happy / sad / angry / neutral",
  "hunger": 当前饥饿度(0到100的整数),
  "energy": 当前精力值(0到100的整数)
}
规则：
1. 如果饥饿度低于30，action最好是eating，坐标去(80, 80)。
2. 如果精力值低于30，action最好是sleeping，坐标去(20, 20)。
3. 绝对不允许重复上一句话。
`;

        let messagesPayload = [{ role: "system", content: systemPrompt }];
        if (history && Array.isArray(history)) {
            messagesPayload = messagesPayload.concat(history);
        }
        messagesPayload.push({ role: "user", content: message });

        const response = await axios.post(API_URL, {
            model: MODEL_NAME,
            messages: messagesPayload,
            temperature: 0.8
        }, {
            headers: {
                'Authorization': `Bearer ${ms-43d9c64a-2531-4ed0-b2c6-c83eb6f5c56f}`,
                'Content-Type': 'application/json'
            }
        });

        let reply = response.data.choices[0].message.content;
        
        // 核心：强行从云端模型的回复中提取 JSON
        const jsonMatch = reply.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("模型没有返回合法的JSON格式");
        }
        
        const jsonStr = jsonMatch[0];
        console.log("[AI原话]", jsonStr);
        res.json(JSON.parse(jsonStr));
        
    } catch (error) {
        console.error("报错:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: '游戏引擎报错' });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log('中转站已启动');
});