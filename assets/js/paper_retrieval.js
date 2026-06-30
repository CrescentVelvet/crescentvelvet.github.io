// media_paper 仓库配置（论文笔记数据源）
const MEDIA_PAPER_REPO = 'CrescentVelvet/media_paper';
const MEDIA_PAPER_BRANCH = 'main';
const MEDIA_PAPER_RAW = `https://raw.githubusercontent.com/${MEDIA_PAPER_REPO}/${MEDIA_PAPER_BRANCH}`;
const MEDIA_PAPER_BLOB = `https://cdn.jsdelivr.net/gh/${MEDIA_PAPER_REPO}@${MEDIA_PAPER_BRANCH}`;

let allPapers = []; // 存储所有论文数据
let savedKeywords = []; // 存储用户保存的关键词

// 从本地存储加载保存的关键词
function loadSavedKeywords() {
    const savedKeywordsStr = localStorage.getItem('savedKeywords');
    if (savedKeywordsStr) {
        savedKeywords = JSON.parse(savedKeywordsStr);
        renderSavedKeywords();
    }
}

// 保存关键词到本地存储
function saveKeywords() {
    localStorage.setItem('savedKeywords', JSON.stringify(savedKeywords));
}

// 渲染保存的关键词
function renderSavedKeywords() {
    const savedKeywordsContainer = document.getElementById('savedKeywords');
    savedKeywordsContainer.innerHTML = '';

    savedKeywords.forEach((keyword, index) => {
        const keywordTag = document.createElement('div');
        keywordTag.className = 'keyword-tag';
        keywordTag.innerHTML = `
            <span class="keyword-text">${keyword}</span>
            <span class="remove">&times;</span>
        `;

        // 点击关键词文本搜索该关键词
        keywordTag.querySelector('.keyword-text').addEventListener('click', () => {
            document.getElementById('searchInput').value = keyword;
            filterPapers();
        });

        // 点击删除按钮移除关键词
        keywordTag.querySelector('.remove').addEventListener('click', () => {
            savedKeywords.splice(index, 1);
            saveKeywords();
            renderSavedKeywords();
        });

        savedKeywordsContainer.appendChild(keywordTag);
    });
}

// 添加新关键词
function addKeyword() {
    const keywordInput = document.getElementById('keywordInput');
    const keyword = keywordInput.value.trim();

    if (keyword && !savedKeywords.includes(keyword)) {
        savedKeywords.push(keyword);
        saveKeywords();
        renderSavedKeywords();
        keywordInput.value = '';
    }
}

// 从 media_paper 仓库加载论文笔记索引
function loadPapers() {
    fetch(`${MEDIA_PAPER_RAW}/knowledge-index.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const papers = data.papers || [];
            allPapers = papers.map(p => {
                const year = p.date ? parseInt(p.date.slice(0, 4)) : (p.arxiv ? 2000 + parseInt(p.arxiv.slice(0, 2)) : NaN);
                const title = p.title || '';
                const keywords = p.tags || [];
                return {
                    title,
                    authors: [],
                    year: isNaN(year) ? '' : year,
                    conference: p.category || '',
                    abstract: '',
                    keywords,
                    url: `${MEDIA_PAPER_BLOB}/${p.file}`,
                    title_lower: title.toLowerCase(),
                    authors_lower: '',
                    abstract_lower: '',
                    keywords_lower: keywords.map(k => k.toLowerCase())
                };
            });

            // 默认展示所有论文（年份输入框留空，筛选逻辑使用 0-9999 范围）
            filterPapers();
        })
        .catch(error => {
            console.error('Error loading papers:', error);
            document.getElementById('paperList').innerHTML = '<li class="error-message">加载论文数据失败，请稍后再试。</li>';
        });
}

// 切换摘要展开/收起状态
function toggleAbstract(element) {
    const abstractElement = element.parentElement.querySelector('.paper-abstract');
    if (abstractElement.classList.contains('expanded')) {
        abstractElement.classList.remove('expanded');
        element.textContent = '展开摘要';
    } else {
        abstractElement.classList.add('expanded');
        element.textContent = '收起摘要';
    }
}

function renderPapers(filteredPapers) {
    const paperList = document.getElementById('paperList');
    paperList.innerHTML = '';

    // 更新搜索统计信息
    const searchStats = document.getElementById('searchStats');
    const searchTerm = document.getElementById('searchInput').value.trim();
    if (searchTerm) {
        searchStats.textContent = `搜索"${searchTerm}"：找到 ${filteredPapers.length} 篇论文（共 ${allPapers.length} 篇）`;
    } else {
        searchStats.textContent = `显示 ${filteredPapers.length} / ${allPapers.length} 篇论文`;
    }

    if (filteredPapers.length === 0) {
        paperList.innerHTML = '<li class="no-results">未找到相关论文。请尝试调整筛选条件。</li>';
        return;
    }

    filteredPapers.forEach(paper => {
        const li = document.createElement('li');
        li.className = 'paper-item';

        // 检查是否包含用户保存的关键词，如果包含则高亮显示
        const containsSavedKeyword = savedKeywords.some(keyword =>
            paper.title_lower.includes(keyword.toLowerCase()) ||
            paper.abstract_lower.includes(keyword.toLowerCase()) ||
            paper.keywords_lower.some(k => k.includes(keyword.toLowerCase()))
        );

        if (containsSavedKeyword) {
            li.classList.add('highlight');
        }

        li.innerHTML = `
            <div class="paper-title">
                <a href="${paper.url || '#'}" target="_blank">${paper.title}</a>
            </div>
            <p class="paper-authors">
                 ${paper.conference ? `<span class="paper-conference">${paper.conference}</span>` : ''}
                 ${paper.authors.length > 1 ? paper.authors[0] + ' et al.' : paper.authors.join(', ')}
             </p>
            ${paper.abstract ? `
                <div class="paper-abstract">${paper.abstract}</div>
                <span class="toggle-abstract" onclick="toggleAbstract(this)">展开摘要</span>
            ` : ''}
            ${paper.keywords && paper.keywords.length > 0 ? `
                <div class="paper-keywords">
                    ${Array.isArray(paper.keywords) ?
                        paper.keywords.map(keyword => `<span class="paper-keyword" onclick="addToSavedKeywords('${keyword}')">${keyword}</span>`).join('') :
                        paper.keywords}
                </div>
            ` : ''}
        `;
        paperList.appendChild(li);
    });
}

// 添加关键词到收藏
function addToSavedKeywords(keyword) {
    if (!savedKeywords.includes(keyword)) {
        savedKeywords.push(keyword);
        saveKeywords();
        renderSavedKeywords();

        // 显示添加成功的提示
        const toast = document.createElement('div');
        toast.className = 'keyword-toast';
        toast.textContent = `已添加关键词: ${keyword}`;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, 2000);
    }
}

function filterPapers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const selectedConferences = Array.from(document.querySelectorAll('.conference-filter input:checked'))
        .map(checkbox => checkbox.value);
    const yearFrom = parseInt(document.getElementById('yearFrom').value) || 0;
    const yearTo = parseInt(document.getElementById('yearTo').value) || 9999;
    const basePapers = allPapers;
    const filteredPapers = basePapers.filter(paper => {
        // 搜索匹配（标题、作者、摘要、关键词）
        const matchesSearch = searchTerm === '' ||
            paper.title_lower.includes(searchTerm) ||
            paper.authors_lower.includes(searchTerm) ||
            paper.abstract_lower.includes(searchTerm) ||
            paper.keywords_lower.some(k => k.includes(searchTerm));

        // 会议匹配
        const matchesConference = selectedConferences.length === 0 ||
            selectedConferences.some(conf => paper.conference.includes(conf));

        // 年份匹配
        const year = parseInt(paper.year);
        const matchesYear = isNaN(year) || (year >= yearFrom && year <= yearTo);

        return matchesSearch && matchesConference && matchesYear;
    });

    // 综合排序逻辑：首先将包含保存关键词的论文排在前面，然后按年份降序排序
    filteredPapers.sort((a, b) => {
        const aContainsSavedKeyword = savedKeywords.length > 0 && savedKeywords.some(keyword =>
            a.title_lower.includes(keyword.toLowerCase()) ||
            a.abstract_lower.includes(keyword.toLowerCase()) ||
            a.keywords_lower.some(k => k.includes(keyword.toLowerCase()))
        );

        const bContainsSavedKeyword = savedKeywords.length > 0 && savedKeywords.some(keyword =>
            b.title_lower.includes(keyword.toLowerCase()) ||
            b.abstract_lower.includes(keyword.toLowerCase()) ||
            b.keywords_lower.some(k => k.includes(keyword.toLowerCase()))
        );

        // 如果A包含关键词而B不包含，A排在前面
        if (aContainsSavedKeyword && !bContainsSavedKeyword) return -1;
        // 如果B包含关键词而A不包含，B排在前面
        if (!aContainsSavedKeyword && bContainsSavedKeyword) return 1;

        // 如果两者都包含或都不包含关键词，则按年份降序排序
        const yearA = parseInt(a.year) || 0;
        const yearB = parseInt(b.year) || 0;
        return yearB - yearA;
    });

    renderPapers(filteredPapers);
}

// 监听搜索输入和筛选条件变化
document.getElementById('searchInput').addEventListener('input', filterPapers);
document.querySelectorAll('.conference-filter input').forEach(checkbox => {
    checkbox.addEventListener('change', filterPapers);
});
document.getElementById('yearFrom').addEventListener('input', filterPapers);
document.getElementById('yearTo').addEventListener('input', filterPapers);

// 添加关键词按钮事件
document.getElementById('addKeywordBtn').addEventListener('click', addKeyword);
document.getElementById('keywordInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addKeyword();
    }
});

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    loadSavedKeywords();
    loadPapers();
});

// 全局函数，用于摘要展开/收起和添加关键词
window.toggleAbstract = toggleAbstract;
window.addToSavedKeywords = addToSavedKeywords;

// 动态生成会议筛选复选框
const conferences = [
    { name: 'CV/AI', value: 'CV/AI', checked: true },
    { name: 'VideoGen', value: 'VideoGen', checked: true },
    { name: '3D', value: '3D', checked: true }
];

const conferenceFilterDiv = document.querySelector('.conference-filter');
conferences.forEach(conf => {
    const label = document.createElement('label');
    label.innerHTML = `
        <input type="checkbox" value="${conf.value}" ${conf.checked ? 'checked' : ''}> <span>${conf.name}</span>
    `;
    conferenceFilterDiv.appendChild(label);
});

// 重新绑定事件监听器，因为DOM元素已动态生成
document.querySelectorAll('.conference-filter input').forEach(checkbox => {
    checkbox.addEventListener('change', filterPapers);
});
