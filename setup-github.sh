#!/bin/bash
# Formula Nebula - GitHub Setup Script

echo "================================================"
echo "Formula Nebula GitHub Setup"
echo "================================================"
echo ""

# 获取用户邮箱
echo "请输入你的GitHub邮箱地址：wwz666wwz666@163.com"
read -r EMAIL

if [ -z "$EMAIL" ]; then
    echo "错误：邮箱不能为空"
    exit 1
fi

# 1. 生成SSH密钥
echo ""
echo "步骤 1/4: 生成SSH密钥..."
ssh-keygen -t ed25519 -C "$EMAIL" -f ~/.ssh/id_ed25519 -N ""

if [ $? -eq 0 ]; then
    echo "✅ SSH密钥生成成功"
else
    echo "❌ SSH密钥生成失败"
    exit 1
fi

# 2. 启动ssh-agent并添加密钥
echo ""
echo "步骤 2/4: 添加SSH密钥到ssh-agent..."
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# 3. 显示公钥
echo ""
echo "步骤 3/4: 你的SSH公钥（请复制下面的内容）："
echo "================================================"
cat ~/.ssh/id_ed25519.pub
echo "================================================"
echo ""
echo "⚠️  请执行以下操作："
echo "1. 复制上面的SSH公钥（从 ssh-ed25519 开始到结尾）"
echo "2. 访问 https://github.com/settings/ssh/new"
echo "3. Title: Formula Nebula (或任意名称)"
echo "4. Key: 粘贴刚才复制的公钥"
echo "5. 点击 'Add SSH key'"
echo ""
read -p "完成后按回车继续..."

# 4. 测试SSH连接
echo ""
echo "步骤 4/4: 测试GitHub SSH连接..."
ssh -T git@github.com 2>&1 | grep "successfully authenticated"

if [ $? -eq 0 ]; then
    echo "✅ SSH连接成功！"
else
    echo "⚠️  首次连接需要确认fingerprint"
    echo "请输入 'yes' 接受GitHub的fingerprint"
fi

# 5. 添加远程仓库
echo ""
echo "================================================"
echo "下一步：连接本地仓库到GitHub"
echo "================================================"
echo ""
echo "请先在GitHub上创建仓库："
echo "1. 访问 https://github.com/new"
echo "2. Repository name: Formula-Nebula"
echo "3. 选择 Public"
echo "4. 不要勾选任何初始化选项"
echo "5. 点击 Create repository"
echo ""
read -p "创建完成后按回车继续..."

# 6. 配置git remote
cd "D:\xiangmu\Formula Nebula" || exit

echo ""
echo "添加远程仓库..."
git remote add origin git@github.com:wenze-wu-math/Formula-Nebula.git

echo "设置主分支为main..."
git branch -M main

echo "推送到GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "================================================"
    echo "✅ 成功！Formula Nebula已连接到GitHub"
    echo "================================================"
    echo ""
    echo "仓库地址: https://github.com/wenze-wu-math/Formula-Nebula"
    echo ""
    echo "后续推送只需运行: git push"
else
    echo ""
    echo "❌ 推送失败，请检查："
    echo "1. GitHub仓库是否已创建"
    echo "2. SSH密钥是否已添加到GitHub"
    echo "3. 仓库名称是否正确"
fi
