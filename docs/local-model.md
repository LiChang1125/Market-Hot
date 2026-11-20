# 本地编辑模型

Market Hot 的腾讯云实例在专用 Docker 网络运行 Qwen2.5-1.5B-Instruct Q4_K_M。采集进程和 API 共用一个推理槽，浏览器通过网站读取已发布的数据。

- 模型文件为 `qwen2.5-1.5b-instruct-q4_k_m.gguf`，SHA-256 为 `6a1a2eb6d15622bf3c96857206351ba97e1af16c30d7a74ee38970e434e9407e`。[Qwen 模型仓库](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF)
- 当前服务器使用 llama.cpp CPU 二进制 b12559。Linux x64 发行压缩包的 SHA-256 为 `d5c626126c938f5581051d736df66c050063bb7dd17e42a20d75cd2fce958472`。[llama.cpp 发行页](https://github.com/ggml-org/llama.cpp/releases/tag/b12559)
- 自托管也可用仓库中的官方镜像 Compose 配置。在私密环境文件中填写模型所在目录 `MODEL_DIR` 和只含一行访问密钥的文件绝对路径 `MODEL_KEY_FILE`，并让容器用户能读取这两个挂载。站点的 `LLM_API_KEY` 填写同一密钥。

```dotenv
LLM_BASE_URL=http://market-hot-model:8080/v1
LLM_MODEL=market-hot-local
LLM_EXTRA_JSON={}
LLM_JSON_MODE=true
LLM_JSON_SCHEMA=true
LLM_SERIAL=true
LLM_VISION=false
MODEL_CALLS_ENABLED=true
ANALYSIS_CONCURRENCY=1
DIGEST_CONCURRENCY=1
LLM_TIMEOUT_MS=600000
```

在项目根目录运行 `docker compose -p market-hot -f docker-compose.yml -f deploy/local-model.compose.yml up -d model api worker web`。模型端口仅在项目网络内可用。编辑记录、请求结果和失败原因保存在站点 PostgreSQL 数据库，可在后台检查。此模型支持文本，首次采集和多篇长稿会排队。
